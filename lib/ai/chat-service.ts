import { AI_CONFIGS, SYSTEM_PROMPTS, matchFAQ } from './config';
import { redis, CACHE_KEYS, CACHE_TTL, hashMessage } from '../redis';

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

  // 2. Check cache
  const cacheKey = CACHE_KEYS.chatResponse(hashMessage(userMessage, context?.eventId));
  
  if (redis) {
    try {
      const cached = await redis.get<string>(cacheKey);
      if (cached) return { message: cached, cached: true };
    } catch (error) {
      console.error('Cache read error:', error);
    }
  }

  // 3. Build system prompt
  const systemPrompt = buildSystemPrompt(context);

  // 4. Call AI provider
  const aiResponse = await callAIProvider(userMessage, history, systemPrompt);

  // 5. Cache response
  if (redis && aiResponse.message) {
    redis.setex(cacheKey, CACHE_TTL.MEDIUM, aiResponse.message).catch(console.error);
  }

  return aiResponse;
}

function buildSystemPrompt(context?: ChatContext): string {
  let prompt = SYSTEM_PROMPTS.eventAssistant;

  if (context?.eventName) {
    prompt += `\n\nCurrent Event Context:
- Event: ${context.eventName}
- Date: ${context.eventDate || 'TBD'}
- Location: ${context.eventLocation || 'TBD'}

When answering questions, prioritize information about this specific event.`;
  }

  return prompt;
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
