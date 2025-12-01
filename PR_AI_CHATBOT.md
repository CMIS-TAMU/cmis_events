# Pull Request: AI-Powered Chatbot for CMIS Events

## 🎯 Summary

This PR adds an AI-powered chatbot to the CMIS Event Management System. The chatbot helps users with event information, registration assistance, and general CMIS queries.

## 🔗 Related Issues

- Implements: DEVELOPMENT_ROADMAP.md (Phase 3 - AI Features, Lines 446-467)

## ✨ Features Added

### Backend Integration
- [x] OpenAI GPT-3.5/GPT-4 API integration
- [x] Google Gemini API integration (fallback)
- [x] Chat API endpoint (`/api/chat`)
- [x] Context building with event data
- [x] Response caching with Redis (Upstash)
- [x] Rate limiting (20 requests/minute)
- [x] Automatic provider fallback

### Frontend Component
- [x] Chat widget component (floating bubble)
- [x] Message history with timestamps
- [x] Typing indicator animation
- [x] Auto-scroll to latest messages
- [x] Mobile-optimized responsive design
- [x] Keyboard support (Enter to send)

### Chat Features
- [x] Event-specific context support
- [x] FAQ handling with cached responses
- [x] Human escalation detection
- [x] Chat history persistence (localStorage)
- [x] Quick suggestion buttons

## 📁 Files Changed

### New Files (17)
```
app/api/chat/route.ts           # Chat API endpoint
components/chat/
├── chat-input.tsx              # Message input component
├── chat-message.tsx            # Single message display
├── chat-messages.tsx           # Message list with scroll
├── chat-provider.tsx           # Main provider wrapper
├── chat-widget.tsx             # Floating chat widget
├── index.ts                    # Component exports
└── typing-indicator.tsx        # Typing animation
lib/ai/
├── chat-service.ts             # AI provider integration
├── config.ts                   # AI config & FAQs
└── index.ts                    # Module exports
lib/hooks/use-chat.ts           # React hook for chat
lib/rate-limit.ts               # Rate limiting logic
lib/redis.ts                    # Redis client setup
lib/stores/chat-store.ts        # Zustand state store
lib/types/chat.ts               # TypeScript definitions
```

### Modified Files (1)
```
app/layout.tsx                  # Added ChatProvider
```

## 🔧 Environment Variables Required

Add these to your `.env.local`:

```env
# AI Provider (at least one required)
OPENAI_API_KEY=sk-your-openai-key
# OR
GOOGLE_AI_API_KEY=your-gemini-key

# Optional: Preferred provider
AI_PROVIDER=openai              # or 'gemini'

# Optional: Redis caching (recommended)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

## 🧪 Testing Instructions

1. **Pull the branch:**
   ```bash
   git fetch origin
   git checkout feature/ai-chatbot
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables** (see above)

4. **Start the dev server:**
   ```bash
   pnpm dev
   ```

5. **Test the chatbot:**
   - Open http://localhost:3000
   - Click the green chat bubble (bottom-right)
   - Try these prompts:
     - "How do I register for an event?"
     - "Where are events held?"
     - "I want to speak to a human"
     - "What is CMIS?"

## 📸 Screenshots

### Chat Widget (Closed)
- Green floating bubble in bottom-right corner
- Pulse animation to attract attention

### Chat Widget (Open)
- Clean, modern UI with gradient header
- Message bubbles with timestamps
- Typing indicator when AI is responding
- Quick suggestion buttons for new users

## ✅ Checklist

- [x] Code follows project style guidelines
- [x] TypeScript types are properly defined
- [x] No linter errors or warnings
- [x] Mobile responsive design
- [x] Accessibility (aria labels, keyboard support)
- [x] Error handling for API failures
- [x] Rate limiting implemented
- [x] Works without Redis (fallback to memory)
- [x] Works without AI keys (demo mode)

## 🚀 Deployment Notes

1. **Vercel Environment Variables:**
   - Add `OPENAI_API_KEY` or `GOOGLE_AI_API_KEY`
   - Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (optional)

2. **Cost Considerations:**
   - OpenAI: ~$0.002/1K tokens (GPT-3.5)
   - Gemini: Free tier available (60 req/min)
   - Upstash Redis: Free tier (10K commands/day)

## 👥 Reviewers

- @Developer1 (UI/UX review)
- @ProjectLead (Feature approval)

---

**Branch:** `feature/ai-chatbot`  
**Base:** `main`  
**Author:** Developer 2 (AI Features)

