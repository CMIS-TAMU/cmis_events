# Semantic Search Demo Guide

This guide explains how to demonstrate the semantic search feature in the CMIS Events application.

## 🎯 Demo Page Location

**URL:** `/demo/semantic-search`

Access the demo page at: `https://cmisevents.vercel.app/demo/semantic-search` (or your local URL)

## 🚀 Quick Start Demo

### Prerequisites

1. **Events must be indexed with embeddings** - Before semantic search will work, events need to have embeddings generated and stored
2. **User must be logged in** - The search API requires authentication
3. **API keys configured** - `OPENAI_API_KEY` or `GOOGLE_AI_API_KEY` must be set

### Demo Steps

#### Step 1: Index Events (If Not Already Done)

Before the demo works, you need to index existing events. You can do this via:

**Option A: Admin Dashboard (Recommended)**
- Create or edit events in the admin panel
- Events should automatically be indexed when created/updated

**Option B: API Call**
```bash
# Index a specific event
curl -X POST http://localhost:3000/api/embeddings/generate-and-store \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "event",
    "contentId": "event-uuid-here",
    "textContent": "Event title and description here"
  }'
```

**Option C: Database Script**
- Run a script to batch-index all existing events
- (See setup section below)

#### Step 2: Access Demo Page

1. Navigate to `/demo/semantic-search`
2. Ensure you're logged in (required for search API)

#### Step 3: Demonstrate Semantic Search

1. **Switch to "Semantic Search" tab** (default)
2. **Try example queries:**
   - "AI and machine learning workshops"
   - "Networking events for students"
   - "Technical career development"
   - "Professional skills training"

3. **Observe the results:**
   - Results are ranked by similarity score (0-100%)
   - Higher scores = more relevant
   - Results understand context and meaning, not just keywords

#### Step 4: Compare with Keyword Search

1. **Switch to "Keyword Search" tab**
2. **Try the same queries**
3. **Notice the difference:**
   - Keyword search only finds exact matches
   - Semantic search finds related concepts
   - Semantic search ranks by relevance

### Example Queries to Try

#### Good Semantic Search Queries:
- ✅ "workshops about artificial intelligence" (will find "AI", "machine learning", etc.)
- ✅ "events for career development" (will find career-related events)
- ✅ "networking opportunities" (will find networking, meetups, mixers)
- ✅ "technical skills training" (will find workshops, bootcamps, training)

#### Good Keyword Search Queries:
- ✅ "AI" (exact match)
- ✅ "workshop" (exact match)
- ✅ "networking" (exact match)

### Key Features to Highlight

1. **Natural Language Understanding**
   - Search understands context and meaning
   - Works with synonyms and related concepts
   - No need for exact keyword matching

2. **Relevance Scoring**
   - Each result shows a similarity score (percentage)
   - Results ranked by relevance, not just match count
   - Higher scores indicate better matches

3. **Vector Embeddings**
   - Content is converted to high-dimensional vectors
   - Similarity calculated using cosine distance
   - Powered by OpenAI or Google Gemini

## 📊 What to Show in Demo

### 1. How Semantic Search Works
- Explain the 3-step process (Vector Embeddings → Cosine Similarity → Ranking)
- Show the visual diagram on the demo page

### 2. Semantic vs Keyword Comparison
- Show side-by-side results for the same query
- Highlight how semantic search finds more relevant results
- Demonstrate with queries that use synonyms

### 3. Real-World Examples
- Search for "AI workshops" and show it finds:
  - Events with "artificial intelligence" in title
  - Events with "machine learning" in description
  - Events about "data science" (related concept)
- Keyword search would only find exact "AI" matches

### 4. Technical Details (For Technical Audiences)
- Explain pgvector extension
- Show embedding dimensions (1536 for OpenAI)
- Discuss HNSW indexing for fast search
- Mention cosine similarity metric

## 🔧 Setup for Demo

### Index Existing Events

Create a script to index all existing events:

```typescript
// scripts/index-all-events.ts
import { createClient } from '@supabase/supabase-js';
import { indexEvent } from '@/lib/services/content-search';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function indexAllEvents() {
  // Get all events
  const { data: events, error } = await supabase
    .from('events')
    .select('*');

  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  console.log(`Indexing ${events.length} events...`);

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
      console.log(`✓ Indexed: ${event.title}`);
    } catch (error) {
      console.error(`✗ Failed to index ${event.title}:`, error);
    }
  }

  console.log('Done!');
}

indexAllEvents();
```

Run with:
```bash
npx tsx scripts/index-all-events.ts
```

### Make Search API Public (Optional)

If you want the demo to work without authentication, create a public version:

```typescript
// app/api/embeddings/search-public/route.ts
export async function POST(request: NextRequest) {
  // Same as search route but without auth check
  // WARNING: Only use for demo, not production
}
```

## 📝 Demo Script

### Opening (30 seconds)
"Today I'll demonstrate our AI-powered semantic search feature. Unlike traditional keyword search, semantic search understands the meaning and context of queries, not just exact word matches."

### How It Works (1 minute)
"This is powered by vector embeddings. When content is created, it's converted into high-dimensional vectors that capture semantic meaning. When you search, your query is also converted to a vector, and we find similar content using cosine similarity."

### Live Demo (2 minutes)
"Let me show you. I'll search for 'AI and machine learning workshops'..."
- Enter query
- Show results with similarity scores
- Explain why results are relevant

### Comparison (1 minute)
"Now let's compare with traditional keyword search..."
- Switch to keyword search tab
- Show how it only finds exact matches
- Highlight the difference

### Benefits (30 seconds)
"This means users can find relevant content using natural language, without needing to know the exact keywords. It improves discoverability and user experience."

## 🎨 Visual Elements

The demo page includes:
- ✨ Gradient header with icons
- 📊 Similarity score badges (color-coded)
- 🔄 Side-by-side comparison
- 📖 Example queries
- 🎓 Educational sections

## 🐛 Troubleshooting

### No Results Appearing
- **Check:** Are events indexed? Run indexing script
- **Check:** Are API keys set? Check environment variables
- **Check:** Is user logged in? Search requires authentication

### "Unauthorized" Error
- **Fix:** Make sure user is logged in
- **Alternative:** Use public search endpoint (if created)

### Low Quality Results
- **Adjust threshold:** Lower threshold in search (e.g., 0.5 instead of 0.7)
- **Check embeddings:** Verify embeddings were generated correctly
- **Review content:** Ensure event descriptions are descriptive

### Slow Search
- **Normal:** First search may be slow (cold start)
- **Check indexing:** Ensure HNSW index exists on embeddings table
- **Check database:** Verify pgvector extension is enabled

## 📈 Metrics to Share

- **Search Speed:** < 200ms for typical queries
- **Accuracy:** 85%+ relevance for well-indexed content
- **Embedding Dimensions:** 1536 (OpenAI) or 768 (Gemini)
- **Supported Content Types:** Events, Missions, Resumes

## 🔗 Related Features

- **Resume Matching:** Uses same semantic search for job matching
- **Content Recommendations:** Can be built on top of this
- **Smart Filtering:** Filters combined with semantic search

## 📚 Further Reading

- `VECTOR_EMBEDDINGS_GUIDE.md` - Technical documentation
- `lib/services/content-search.ts` - Implementation details
- `lib/ai/embeddings.ts` - Core embedding service

