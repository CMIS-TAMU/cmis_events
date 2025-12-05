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

export interface Mission {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  category?: string;
  max_points: number;
  status: string;
  published_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName?: string;
  totalPoints: number;
  averageScore: number;
  missionsCompleted: number;
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

  // 2. Check if this is a CMIS-related question and look up relevant data
  // Note: We check for CMIS questions to provide relevant data when asked,
  // but we don't restrict the chatbot to only answer CMIS questions
  const isEventQuestion = isEventRelatedQuestion(userMessage);
  const isMissionQuestion = isMissionRelatedQuestion(userMessage);
  const isLeaderboardQuestion = isLeaderboardRelatedQuestion(userMessage);
  
  let eventsData: Event[] = [];
  let missionsData: Mission[] = [];
  let leaderboardData: LeaderboardEntry[] = [];
  
  if (isEventQuestion) {
    try {
      eventsData = await lookupEvents(userMessage, context?.userRole);
      console.log(`[Chat Service] Found ${eventsData.length} events for query`);
    } catch (error) {
      console.error('[Chat Service] Error looking up events:', error);
      eventsData = [];
    }
  }
  
  if (isMissionQuestion) {
    try {
      missionsData = await lookupMissions(userMessage, context?.userRole);
      console.log(`[Chat Service] Found ${missionsData.length} missions for query`);
    } catch (error) {
      console.error('[Chat Service] Error looking up missions:', error);
      missionsData = [];
    }
  }
  
  if (isLeaderboardQuestion) {
    try {
      leaderboardData = await lookupLeaderboard(userMessage, context?.userId);
      console.log(`[Chat Service] Found ${leaderboardData.length} leaderboard entries for query`);
    } catch (error) {
      console.error('[Chat Service] Error looking up leaderboard:', error);
      leaderboardData = [];
    }
  }

  // 3. Check cache (but skip if we have fresh data)
  const cacheKey = CACHE_KEYS.chatResponse(hashMessage(userMessage, context?.eventId));
  
  if (redis && eventsData.length === 0 && missionsData.length === 0 && leaderboardData.length === 0) {
    try {
      const cached = await redis.get<string>(cacheKey);
      if (cached) return { message: cached, cached: true };
    } catch (error) {
      console.error('Cache read error:', error);
    }
  }

  // 4. Build system prompt with CMIS data
  let systemPrompt: string;
  try {
    systemPrompt = buildSystemPrompt(context, eventsData, missionsData, leaderboardData);
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

  // 6. Cache response (only if no dynamic data was used, as it changes frequently)
  if (redis && aiResponse.message && eventsData.length === 0 && missionsData.length === 0 && leaderboardData.length === 0) {
    redis.setex(cacheKey, CACHE_TTL.MEDIUM, aiResponse.message).catch(console.error);
  }

  return aiResponse;
}

function buildSystemPrompt(context?: ChatContext, events?: Event[], missions?: Mission[], leaderboard?: LeaderboardEntry[]): string {
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
    prompt += `\n\nUPCOMING CMIS EVENTS DATA (use this information ONLY when users ask about events):
${formatEventsForPrompt(events)}

IMPORTANT INSTRUCTIONS FOR EVENT QUESTIONS:
- Always use the event data above to answer questions about events
- If the user asks about a specific event type (e.g., "coffee chat", "workshop", "info session"), filter the events by matching keywords in the title or description
- Format your response with:
  * Event name
  * Date (format: Day, Month Day, Year, e.g., "Tuesday, October 8, 2024")
  * Start and end time (format: "3:00 PM - 4:00 PM")
  * Location (extract from description if available, or mention "Check event details")
  * Registration link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/{event_id}#register (replace {event_id} with the actual event ID)
- If there are multiple matching events, show the next one first, then list others briefly
- If no events match, clearly say so and suggest checking the full calendar
- Never tell users to check the calendar when you have the required information from the events data above`;
  }

  // Add missions data if available
  if (missions && missions.length > 0) {
    prompt += `\n\nCMIS TECHNICAL MISSIONS DATA (use this information when users ask about missions):
${formatMissionsForPrompt(missions)}

IMPORTANT INSTRUCTIONS FOR MISSION QUESTIONS:
- Technical Missions are coding challenges created by sponsors
- Students can browse missions, submit solutions, and earn points
- Missions have difficulty levels: beginner, intermediate, advanced, expert
- Points are awarded based on score, difficulty, and completion time
- Use the missions data above to answer questions about available missions
- Registration link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/missions/{mission_id} (replace {mission_id} with the actual mission ID)
- To register for a mission, students go to the mission detail page and click "Start Mission"`;
  }

  // Add leaderboard data if available
  if (leaderboard && leaderboard.length > 0) {
    prompt += `\n\nCMIS LEADERBOARD DATA (use this information when users ask about leaderboard):
${formatLeaderboardForPrompt(leaderboard)}

IMPORTANT INSTRUCTIONS FOR LEADERBOARD QUESTIONS:
- The leaderboard ranks students by total points earned from completing technical missions
- Rankings are based on: total points (primary), average score (tiebreaker), missions completed (tiebreaker)
- Use the leaderboard data above to answer questions about top performers
- Leaderboard page: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/leaderboard
- If asked "who is on top" or "top of leaderboard", provide the #1 ranked student from the data above`;
  }

  prompt += `\n\nREMEMBER: If the user asks about something unrelated to CMIS features (homework, general knowledge, etc.), answer their question directly without redirecting to CMIS topics.`;

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

function isMissionRelatedQuestion(message: string): boolean {
  const lower = message.toLowerCase();
  const missionKeywords = [
    'mission', 'missions', 'technical mission', 'challenge', 'challenges',
    'coding challenge', 'submit mission', 'mission submission', 'start mission',
    'register for mission', 'how to register for mission', 'mission registration'
  ];
  
  return missionKeywords.some(keyword => lower.includes(keyword));
}

function isLeaderboardRelatedQuestion(message: string): boolean {
  const lower = message.toLowerCase();
  const leaderboardKeywords = [
    'leaderboard', 'top', 'ranking', 'rankings', 'who is on top',
    'top of leaderboard', 'best performer', 'highest score', 'most points',
    'top student', 'top students', 'leaderboard position', 'my rank'
  ];
  
  return leaderboardKeywords.some(keyword => lower.includes(keyword));
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

async function lookupMissions(userMessage: string, userRole?: string): Promise<Mission[]> {
  try {
    let supabase;
    try {
      supabase = createAdminSupabase();
    } catch (supabaseError) {
      console.error('[lookupMissions] Failed to create Supabase client:', supabaseError);
      return [];
    }
    
    if (!supabase) {
      console.error('[lookupMissions] Supabase client is null');
      return [];
    }
    
    // Get active/published missions
    let query = supabase
      .from('missions')
      .select('id, title, description, difficulty, category, max_points, status, published_at')
      .eq('status', 'active')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(20); // Get up to 20 active missions
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[lookupMissions] Supabase query error:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('[lookupMissions] No active missions found');
      return [];
    }
    
    // Filter by difficulty or category if mentioned
    const lowerMessage = userMessage.toLowerCase();
    let filteredMissions = data as Mission[];
    
    if (lowerMessage.includes('beginner')) {
      filteredMissions = filteredMissions.filter(m => m.difficulty === 'beginner');
    } else if (lowerMessage.includes('intermediate')) {
      filteredMissions = filteredMissions.filter(m => m.difficulty === 'intermediate');
    } else if (lowerMessage.includes('advanced')) {
      filteredMissions = filteredMissions.filter(m => m.difficulty === 'advanced');
    } else if (lowerMessage.includes('expert')) {
      filteredMissions = filteredMissions.filter(m => m.difficulty === 'expert');
    }
    
    console.log(`[lookupMissions] Returning ${filteredMissions.length} filtered missions`);
    return filteredMissions;
  } catch (error) {
    console.error('[lookupMissions] Unexpected error:', error);
    return [];
  }
}

async function lookupLeaderboard(userMessage: string, userId?: string): Promise<LeaderboardEntry[]> {
  try {
    let supabase;
    try {
      supabase = createAdminSupabase();
    } catch (supabaseError) {
      console.error('[lookupLeaderboard] Failed to create Supabase client:', supabaseError);
      return [];
    }
    
    if (!supabase) {
      console.error('[lookupLeaderboard] Supabase client is null');
      return [];
    }
    
    // Get top leaderboard entries
    const limit = 10; // Top 10 by default
    const { data, error } = await supabase
      .from('student_points')
      .select('user_id, total_points, average_score, missions_completed, users:user_id(full_name, email)')
      .order('total_points', { ascending: false })
      .order('average_score', { ascending: false })
      .order('missions_completed', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[lookupLeaderboard] Supabase query error:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('[lookupLeaderboard] No leaderboard data found');
      return [];
    }
    
    // Format leaderboard entries
    const leaderboard: LeaderboardEntry[] = data.map((entry, index) => {
      const user = entry.users as any;
      return {
        rank: index + 1,
        userId: entry.user_id,
        userName: user?.full_name || user?.email || 'Anonymous',
        totalPoints: entry.total_points || 0,
        averageScore: entry.average_score || 0,
        missionsCompleted: entry.missions_completed || 0,
      };
    });
    
    console.log(`[lookupLeaderboard] Returning ${leaderboard.length} leaderboard entries`);
    return leaderboard;
  } catch (error) {
    console.error('[lookupLeaderboard] Unexpected error:', error);
    return [];
  }
}

function formatMissionsForPrompt(missions: Mission[]): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return missions.map((mission, index) => {
    const publishedDate = mission.published_at 
      ? new Date(mission.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Recently';
    
    return `Mission ${index + 1}:
- ID: ${mission.id}
- Title: ${mission.title}
- Difficulty: ${mission.difficulty}
- Category: ${mission.category || 'General'}
- Points: ${mission.max_points} points
- Published: ${publishedDate}
- Description: ${mission.description || 'No description'}
- Mission Link: ${appUrl}/missions/${mission.id}`;
  }).join('\n\n');
}

function formatLeaderboardForPrompt(leaderboard: LeaderboardEntry[]): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return leaderboard.map((entry) => {
    return `Rank #${entry.rank}:
- Name: ${entry.userName}
- Total Points: ${entry.totalPoints}
- Average Score: ${entry.averageScore.toFixed(1)}%
- Missions Completed: ${entry.missionsCompleted}`;
  }).join('\n\n') + `\n\nFull Leaderboard: ${appUrl}/leaderboard`;
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
    message: `Thanks for your message! I'm your AI assistant. I can help you with:

• CMIS events and schedules
• Registration process
• Event locations
• Resume uploads
• General CMIS questions
• Academic questions
• General knowledge questions
• And much more!

How can I assist you today?`,
    cached: false,
  };
}
