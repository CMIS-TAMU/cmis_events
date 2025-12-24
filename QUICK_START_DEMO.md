# Quick Start: Semantic Search Demo on Localhost

Fast setup guide to get the demo running in 5 minutes.

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key  # OR GOOGLE_AI_API_KEY
```

### 3. Setup Database (Supabase SQL Editor)

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Run the embeddings table migration
-- Copy and paste contents of: database/migrations/002_create_embeddings_table.sql
```

### 4. Install tsx (for indexing script)
```bash
pnpm add -D tsx
```

### 5. Start Dev Server
```bash
pnpm dev
```

### 6. Index Events
```bash
pnpm index-events
```

### 7. Open Demo
Open browser: `http://localhost:3000/demo/semantic-search`

## ✅ Done!

Try searching for:
- "AI workshops"
- "Networking events"
- "Career development"

## 🆘 Quick Troubleshooting

**No results?**
- Run `pnpm index-events` to index your events
- Check browser console for errors

**API errors?**
- Verify API keys in `.env.local`
- Check you have OpenAI/Gemini credits

**Database errors?**
- Verify pgvector extension is enabled
- Check embeddings table exists

For detailed setup, see: `LOCAL_DEMO_SETUP.md`

