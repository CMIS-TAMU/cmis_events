# Running Semantic Search Demo on Localhost

Step-by-step guide to run the semantic search demo locally.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- PostgreSQL database with pgvector extension (via Supabase)
- OpenAI API key OR Google Gemini API key

## Step 1: Install Dependencies

```bash
# Navigate to project directory
cd /path/to/CMIS-Cursor

# Install dependencies
pnpm install
```

## Step 2: Environment Variables

Create or update `.env.local` file with required variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI API Keys (at least one required)
OPENAI_API_KEY=your_openai_api_key
# OR
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Optional: Sentry (for error tracking)
SENTRY_AUTH_TOKEN=your_sentry_token  # Optional
```

**Get your keys:**
- Supabase: Dashboard → Settings → API
- OpenAI: https://platform.openai.com/api-keys
- Google AI: https://makersuite.google.com/app/apikey

## Step 3: Database Setup

### 3.1 Enable pgvector Extension

Run this in your Supabase SQL Editor:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 3.2 Create Embeddings Table

Run the migration script:

```sql
-- File: database/migrations/002_create_embeddings_table.sql
-- Run this in Supabase SQL Editor
```

Or run it directly:

```bash
# If you have psql installed and configured
psql -h your-db-host -U postgres -d postgres -f database/migrations/002_create_embeddings_table.sql
```

## Step 4: Start Development Server

```bash
# Start Next.js development server
pnpm dev
```

The server will start at: `http://localhost:3000`

## Step 5: Index Events (IMPORTANT!)

Before the demo will show results, you need to index existing events with embeddings.

### Option A: Using Admin Dashboard (Recommended)

1. Go to `http://localhost:3000/login`
2. Log in as admin
3. Go to Admin → Events
4. Create or edit an event
5. Events are automatically indexed when created/updated

### Option B: Using API Endpoint

Create a script to index all events:

```bash
# Create a file: scripts/index-events.ts
```

Or use the API directly:

```bash
# First, get an event ID from your database
# Then index it:
curl -X POST http://localhost:3000/api/embeddings/generate-and-store \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "contentType": "event",
    "contentId": "your-event-id-here",
    "textContent": "Event Title\n\nEvent Description"
  }'
```

### Option C: Using a Script (Easiest)

Create `scripts/index-all-events.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { indexEvent } from '../lib/services/content-search';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function indexAllEvents() {
  console.log('Fetching events...');
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*');

  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  console.log(`Found ${events.length} events to index`);

  for (const event of events) {
    try {
      await indexEvent(
        event.id,
        event.title,
        event.description || '',
        {
          startsAt: event.starts_at,
          location: event.location,
          type: event.type,
          capacity: event.capacity,
        }
      );
      console.log(`✅ Indexed: ${event.title}`);
    } catch (error) {
      console.error(`❌ Failed to index ${event.title}:`, error);
    }
  }

  console.log('✅ Done indexing all events!');
}

indexAllEvents();
```

Run it:

```bash
# Option 1: Using npm script (recommended, if tsx is installed)
pnpm index-events

# Option 2: Using npx tsx directly
npx tsx scripts/index-all-events.ts

# Option 3: Using node with tsx (if installed globally)
tsx scripts/index-all-events.ts
```

**First time?** Install tsx:
```bash
pnpm add -D tsx
```

**Note:** You may need to install `tsx`:
```bash
pnpm add -D tsx
```

Or use the npm script (if tsx is installed):
```bash
pnpm index-events
```

## Step 6: Access the Demo

1. Open your browser
2. Navigate to: `http://localhost:3000/demo/semantic-search`
3. You should see the demo page!

## Step 7: Test the Demo

### Try these example queries:

1. **"AI and machine learning workshops"**
   - Should find events related to AI, ML, data science

2. **"Networking events for students"**
   - Should find networking, social, meetup events

3. **"Technical career development"**
   - Should find career-related, professional development events

4. **"Professional skills training"**
   - Should find workshops, training, skill-building events

### Compare Semantic vs Keyword Search:

1. Enter a query in "Semantic Search" tab
2. Note the results and similarity scores
3. Switch to "Keyword Search" tab
4. Enter the same query
5. Compare the results - semantic search finds related concepts!

## Troubleshooting

### Issue: "No results found"

**Solution:**
- Check if events are indexed: Run the indexing script
- Check API keys: Verify `OPENAI_API_KEY` or `GOOGLE_AI_API_KEY` is set
- Check browser console for errors
- Lower the threshold: Try changing threshold to 0.3 in the search

### Issue: "Unauthorized" error

**Solution:**
- Make sure you're logged in (if using authenticated endpoint)
- The demo should use the public endpoint (`/api/embeddings/search-public`)
- Check if the public endpoint exists in `app/api/embeddings/search-public/route.ts`

### Issue: "Failed to generate embeddings"

**Solution:**
- Verify API keys are correct
- Check API key has sufficient credits/quota
- Try the other API provider (OpenAI vs Gemini)
- Check network connectivity

### Issue: Database errors

**Solution:**
- Verify pgvector extension is enabled
- Check embeddings table exists
- Verify Supabase connection string is correct
- Check database migrations ran successfully

### Issue: Port already in use

**Solution:**
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or use a different port:
pnpm dev -- -p 3001
```

### Issue: Build errors

**Solution:**
```bash
# Clean install
rm -rf node_modules .next
pnpm install
pnpm dev
```

## Quick Verification Checklist

- [ ] Dependencies installed (`pnpm install`)
- [ ] Environment variables set (`.env.local`)
- [ ] Database connection works
- [ ] pgvector extension enabled
- [ ] Embeddings table created
- [ ] Development server running (`pnpm dev`)
- [ ] At least one event indexed
- [ ] Can access `/demo/semantic-search`
- [ ] Search returns results

## Next Steps

Once the demo is working:

1. **Index more events** for better demo results
2. **Customize example queries** for your specific events
3. **Test with different queries** to show semantic understanding
4. **Show to stakeholders** using the demo guide

## Useful Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run production build locally
pnpm start

# Check TypeScript errors
pnpm tsc --noEmit

# Lint code
pnpm lint

# Format code
pnpm format  # if configured
```

## Additional Resources

- **Demo Guide:** `SEMANTIC_SEARCH_DEMO_GUIDE.md`
- **Technical Docs:** `VECTOR_EMBEDDINGS_GUIDE.md`
- **API Reference:** Check `lib/ai/embeddings.ts`

## Getting Help

If you encounter issues:

1. Check browser console for errors
2. Check terminal/server logs
3. Verify all prerequisites are met
4. Review the troubleshooting section above
5. Check that database migrations are applied

