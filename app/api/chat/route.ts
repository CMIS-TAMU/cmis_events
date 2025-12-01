import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, type ChatMessage, type ChatContext } from '@/lib/ai/chat-service';
import { checkRateLimit, getClientIdentifier, createRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
import { ESCALATION_KEYWORDS } from '@/lib/types/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  context?: ChatContext;
  sessionId?: string;
}

function shouldEscalate(message: string): { shouldEscalate: boolean; reason?: string } {
  const lowerMessage = message.toLowerCase();
  
  for (const keyword of ESCALATION_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      return { shouldEscalate: true, reason: `User requested: "${keyword}"` };
    }
  }
  
  return { shouldEscalate: false };
}

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(`chat:${clientId}`, RATE_LIMITS.chat);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before sending more messages.', retryAfter: rateLimit.resetIn },
        { status: 429, headers: createRateLimitHeaders(rateLimit) }
      );
    }

    const body: ChatRequestBody = await request.json();
    const { message, history = [], context, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message too long. Maximum 1000 characters.' }, { status: 400 });
    }

    // Check for escalation
    const escalation = shouldEscalate(message);
    
    if (escalation.shouldEscalate) {
      const escalationResponse = `I understand you'd like to speak with someone from our team. Here's how to reach us:

📧 **Email:** cmis@tamu.edu
📞 **Phone:** (979) 845-1616
🏢 **Office:** Wehner 301 (Mon-Fri 8am-5pm)

A support team member will get back to you as soon as possible. In the meantime, is there anything else I can help you with?`;

      return NextResponse.json(
        { message: escalationResponse, cached: false, escalated: true, sessionId },
        { headers: createRateLimitHeaders(rateLimit) }
      );
    }

    const response = await generateChatResponse(message, history, context);

    return NextResponse.json(
      { message: response.message, cached: response.cached, tokensUsed: response.tokensUsed, sessionId },
      { headers: createRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred processing your request.', message: "I'm sorry, I encountered an error. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGemini = !!process.env.GOOGLE_AI_API_KEY;
  const hasRedis = !!process.env.UPSTASH_REDIS_REST_URL;
  
  return NextResponse.json({ 
    status: 'ok',
    service: 'chat',
    aiProvider: hasOpenAI ? 'openai' : hasGemini ? 'gemini' : 'demo',
    features: { openai: hasOpenAI, gemini: hasGemini, caching: hasRedis, escalation: true },
    timestamp: new Date().toISOString(),
  });
}
