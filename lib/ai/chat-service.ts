import { AI_CONFIGS, SYSTEM_PROMPTS, matchFAQ } from './config';
import { redis, CACHE_KEYS, CACHE_TTL, hashMessage } from '../redis';
import { createAdminSupabase } from '../supabase/server';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatContext {
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  userId?: string;
  userRole?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  capacity?: number;
  image_url?: string;
}

export interface ChatResponse {
  message: string;
  cached: boolean;
  tokensUsed?: number;
}

export async function generateChatResponse(
  userMessage: string,
  history: ChatMessage[] = [],
  context?: ChatContext
): Promise<ChatResponse> {
  // 1. Check FAQ first
  const faqResponse = matchFAQ(userMessage);
  if (faqResponse) {
    return { message: faqResponse, cached: true };
  }

  // 2. Check if this is an event-related question and look up events
  const isEventQuestion = isEventRelatedQuestion(userMessage);
  let eventsData: Event[] = [];
  
  if (isEventQuestion) {
    try {
      eventsData = await lookupEvents(userMessage, context?.userRole);
      console.log(`[Chat Service] Found ${eventsData.length} events for query`);
    } catch (error) {
      console.error('[Chat Service] Error looking up events:', error);
      // Continue without events data - don't fail the entire request
      eventsData = [];
    }
  }

  // 3. Check cache (but skip if we have fresh event data)
  const cacheKey = CACHE_KEYS.chatResponse(hashMessage(userMessage, context?.eventId));
  
  if (redis && eventsData.length === 0) {
    try {
      const cached = await redis.get<string>(cacheKey);
      if (cached) return { message: cached, cached: true };
    } catch (error) {
      console.error('Cache read error:', error);
    }
  }

  // 4. Build system prompt with event data
  let systemPrompt: string;
  try {
    systemPrompt = buildSystemPrompt(context, eventsData);
  } catch (error) {
    console.error('[Chat Service] Error building system prompt:', error);
    // Fallback to basic prompt
    systemPrompt = SYSTEM_PROMPTS.eventAssistant;
  }

  // 5. Call AI provider
  let aiResponse: ChatResponse;
  try {
    aiResponse = await callAIProvider(userMessage, history, systemPrompt);
  } catch (error) {
    console.error('[Chat Service] Error calling AI provider:', error);
    // Return a helpful fallback response
    if (eventsData.length > 0) {
      // If we have events but AI failed, format them manually
      const event = eventsData[0];
      const startDate = new Date(event.starts_at);
      const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      
      aiResponse = {
        message: `Yes, there are upcoming events!\n\n### Next Event\n**${event.title}**\n📅 ${dateStr}\n⏰ ${timeStr}\n\n[View all events](${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events)`,
        cached: false,
      };
    } else {
      aiResponse = {
        message: "I'm having trouble connecting to the AI service right now. Please check the events page or contact cmis@tamu.edu for assistance.",
        cached: false,
      };
    }
  }

  // 6. Cache response (only if no event data was used, as events change frequently)
  if (redis && aiResponse.message && eventsData.length === 0) {
    redis.setex(cacheKey, CACHE_TTL.MEDIUM, aiResponse.message).catch(console.error);
  }

  return aiResponse;
}

function buildSystemPrompt(context?: ChatContext, events?: Event[]): string {
  let prompt = SYSTEM_PROMPTS.eventAssistant;

  if (context?.eventName) {
    prompt += `\n\nCurrent Event Context:
- Event: ${context.eventName}
- Date: ${context.eventDate || 'TBD'}
- Location: ${context.eventLocation || 'TBD'}

When answering questions, prioritize information about this specific event.`;
  }

  // Add event data if available
  if (events && events.length > 0) {
    prompt += `\n\nUPCOMING EVENTS DATA (use this information to answer questions):
${formatEventsForPrompt(events)}

IMPORTANT INSTRUCTIONS:
- Always use the event data above to answer questions about events
- If the user asks about a specific event type (e.g., "coffee chat", "workshop", "info session"), filter the events by matching keywords in the title or description
- Format your response with:
  * Event name
  * Date (format: Day, Month Day, Year, e.g., "Tuesday, October 8, 2024")
  * Start and end time (format: "3:00 PM - 4:00 PM")
  * Location (extract from description if available, or mention "Check event details")
  * Registration link: https://cmis.tamu.edu/events/{event_id}#register (replace {event_id} with the actual event ID)
- If there are multiple matching events, show the next one first, then list others briefly
- If no events match, clearly say so and suggest checking the full calendar
- Never tell users to check the calendar when you have the required information from the events data above`;
  }

  return prompt;
}

function formatEventsForPrompt(events: Event[]): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return events.map((event, index) => {
    const startDate = new Date(event.starts_at);
    const endDate = event.ends_at ? new Date(event.ends_at) : null;
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endTime = endDate ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;
    
    // Try to extract location from description (look for common patterns)
    let location = 'Check event details';
    if (event.description) {
      // Look for location patterns: "Location:", "Venue:", "Where:", "at [location]", "in [location]"
      const locationPatterns = [
        /(?:location|venue|where)\s*:?\s*([^.\n]+)/i,
        /(?:at|in)\s+([A-Z][^.\n]+?)(?:\s|$|,|\.)/i,
        /Wehner\s+\d+/i,
        /MSC|Memorial Student Center/i,
      ];
      
      for (const pattern of locationPatterns) {
        const match = event.description.match(pattern);
        if (match) {
          location = match[1]?.trim() || match[0].trim();
          if (location.length > 50) {
            // If too long, try to extract just the relevant part
            location = location.split(/[.,;]/)[0].trim();
          }
          break;
        }
      }
      
      // Fallback: check for common building names
      if (location === 'Check event details') {
        if (event.description.match(/Wehner/i)) {
          const wehnerMatch = event.description.match(/Wehner\s+\d+/i);
          location = wehnerMatch ? wehnerMatch[0] : 'Wehner Building';
        } else if (event.description.match(/MSC|Memorial Student Center/i)) {
          location = 'Memorial Student Center';
        }
      }
    }
    
    return `Event ${index + 1}:
- ID: ${event.id}
- Title: ${event.title}
- Date: ${dateStr}
- Time: ${startTime}${endTime ? ` - ${endTime}` : ''}
- Location: ${location}
- Description: ${event.description || 'No description'}
- Registration Link: [Register here](${appUrl}/events/${event.id}#register)`;
  }).join('\n\n');
}

function isEventRelatedQuestion(message: string): boolean {
  const lower = message.toLowerCase();
  const eventKeywords = [
    'event', 'events', 'upcoming', 'next event', 'when is', 'coffee chat', 'workshop',
    'info session', 'information session', 'networking', 'attend', 'happening',
    'schedule', 'calendar', 'register', 'registration'
  ];
  
  return eventKeywords.some(keyword => lower.includes(keyword));
}

async function lookupEvents(userMessage: string, userRole?: string): Promise<Event[]> {
  try {
    let supabase;
    try {
      supabase = createAdminSupabase();
    } catch (supabaseError) {
      console.error('[lookupEvents] Failed to create Supabase client:', supabaseError);
      return [];
    }
    
    if (!supabase) {
      console.error('[lookupEvents] Supabase client is null');
      return [];
    }
    
    const now = new Date().toISOString();
    
    // Build query for upcoming events
    let query = supabase
      .from('events')
      .select('id, title, description, starts_at, ends_at, capacity, image_url')
      .gt('starts_at', now)
      .order('starts_at', { ascending: true })
      .limit(50); // Get up to 50 upcoming events
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[lookupEvents] Supabase query error:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('[lookupEvents] No upcoming events found');
      return [];
    }
    
    // Filter by event type if mentioned in the message
    const lowerMessage = userMessage.toLowerCase();
    let filteredEvents = data as Event[];
    
    // Check for event type keywords
    if (lowerMessage.includes('coffee chat') || lowerMessage.includes('coffee')) {
      filteredEvents = filteredEvents.filter(e => 
        e.title?.toLowerCase().includes('coffee') || 
        e.description?.toLowerCase().includes('coffee')
      );
    } else if (lowerMessage.includes('workshop')) {
      filteredEvents = filteredEvents.filter(e => 
        e.title?.toLowerCase().includes('workshop') || 
        e.description?.toLowerCase().includes('workshop')
      );
    } else if (lowerMessage.includes('info session') || lowerMessage.includes('information session')) {
      filteredEvents = filteredEvents.filter(e => 
        e.title?.toLowerCase().includes('info') || 
        e.description?.toLowerCase().includes('info session')
      );
    }
    
    // Note: Role-based filtering would require additional event metadata or a separate table
    // For now, we return all events that match the type filter (or all if no type specified)
    
    console.log(`[lookupEvents] Returning ${filteredEvents.length} filtered events`);
    return filteredEvents;
  } catch (error) {
    console.error('[lookupEvents] Unexpected error:', error);
    // Return empty array instead of throwing - this allows the chat to continue
    return [];
  }
}

async function callAIProvider(
  userMessage: string,
  history: ChatMessage[],
  systemPrompt: string
): Promise<ChatResponse> {
  const config = AI_CONFIGS.chat;

  const openAIKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GOOGLE_AI_API_KEY;
  
  const hasOpenAI = !!openAIKey && openAIKey.length > 10;
  const hasGemini = !!geminiKey && geminiKey.length > 10;
  const preferredProvider = process.env.AI_PROVIDER || 'openai';

  console.log('[Chat Service] AI Provider Check:', {
    hasOpenAI,
    hasGemini,
    preferredProvider,
  });

  if (!hasOpenAI && !hasGemini) {
    console.log('[Chat Service] No API keys found, using demo mode');
    return generateDemoResponse(userMessage);
  }

  const providers = preferredProvider === 'gemini' 
    ? [{ name: 'gemini', available: hasGemini, call: () => callGemini(userMessage, history, systemPrompt, config) },
       { name: 'openai', available: hasOpenAI, call: () => callOpenAI(userMessage, history, systemPrompt, config) }]
    : [{ name: 'openai', available: hasOpenAI, call: () => callOpenAI(userMessage, history, systemPrompt, config) },
       { name: 'gemini', available: hasGemini, call: () => callGemini(userMessage, history, systemPrompt, config) }];

  for (const provider of providers) {
    if (!provider.available) continue;

    try {
      console.log(`[Chat Service] Calling ${provider.name} API...`);
      const response = await provider.call();
      console.log(`[Chat Service] ${provider.name} response received`);
      return response;
    } catch (error) {
      console.error(`[Chat Service] ${provider.name} API error:`, error);
    }
  }

  return {
    message: "I'm having trouble connecting right now. Please try again in a moment, or contact cmis@tamu.edu for immediate assistance.",
    cached: false,
  };
}

async function callOpenAI(
  userMessage: string,
  history: ChatMessage[],
  systemPrompt: string,
  config: typeof AI_CONFIGS.chat
): Promise<ChatResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10),
        { role: 'user', content: userMessage },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return {
    message: data.choices[0]?.message?.content || 'I could not generate a response.',
    cached: false,
    tokensUsed: data.usage?.total_tokens,
  };
}

async function callGemini(
  userMessage: string,
  history: ChatMessage[],
  systemPrompt: string,
  config: typeof AI_CONFIGS.chat
): Promise<ChatResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
  
  const contents = [
    ...history.slice(-10).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
    },
  };

  if (apiVersion === 'v1beta') {
    requestBody.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  return {
    message: text || 'I could not generate a response.',
    cached: false,
  };
}

function generateDemoResponse(userMessage: string): ChatResponse {
  const lower = userMessage.toLowerCase();

  if (lower.includes('event') || lower.includes('upcoming')) {
    return {
      message: `Here are some ways I can help with events:

📅 **Upcoming Events** - Check our Events page for the latest schedule
✅ **Registration** - Click "Register" on any event to sign up
📍 **Locations** - Most events are at Wehner Building or MSC

What specific event information do you need?`,
      cached: false,
    };
  }

  return {
    message: `Thanks for your message! I'm the CMIS Event Assistant. I can help you with:

• Upcoming events and schedules
• Registration process
• Event locations
• Resume uploads
• General CMIS questions

How can I assist you today?`,
    cached: false,
  };
}
