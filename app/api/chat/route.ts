import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, type ChatMessage, type ChatContext } from '@/lib/ai/chat-service';
import { checkRateLimit, getClientIdentifier, createRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
import { ESCALATION_KEYWORDS } from '@/lib/types/chat';
import { createServerClient } from '@supabase/ssr';

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

    // Get user context if authenticated
    let userRole: string | undefined;
    let userId: string | undefined;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll().map(cookie => ({
                name: cookie.name,
                value: cookie.value,
              }));
            },
            setAll() {
              // Can't set cookies in API route handler
            },
          },
        });
        
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          userId = authUser.id;
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', authUser.id)
            .single();
          userRole = profile?.role || 'user';
        }
      }
    } catch (error) {
      // If we can't get user context, continue without it
      console.error('Error getting user context:', error);
    }

    // Merge user context with provided context
    const enhancedContext: ChatContext = {
      ...context,
      userId,
      userRole,
    };

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

    let response;
    try {
      response = await generateChatResponse(message, history, enhancedContext);
    } catch (error) {
      console.error('[Chat API] Error in generateChatResponse:', error);
      // Return a helpful error message instead of failing completely
      return NextResponse.json(
        { 
          message: "I'm having trouble processing your request right now. Please try again in a moment, or check the events page directly.",
          cached: false,
          sessionId 
        },
        { 
          status: 200, // Return 200 so the frontend doesn't treat it as an error
          headers: createRateLimitHeaders(rateLimit) 
        }
      );
    }

    return NextResponse.json(
      { message: response.message, cached: response.cached, tokensUsed: response.tokensUsed, sessionId },
      { headers: createRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error('[Chat API] Unexpected error:', error);
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Chat API] Error details:', errorDetails);
    
    // Always return a valid JSON response, even on errors
    return NextResponse.json(
      { 
        message: "I'm sorry, I encountered an unexpected error. Please try again or contact cmis@tamu.edu for assistance.",
        cached: false,
        error: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 200 } // Return 200 so frontend can display the message
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
