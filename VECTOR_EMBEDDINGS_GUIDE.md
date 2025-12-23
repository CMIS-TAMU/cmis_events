# Vector Embeddings Integration Guide

This guide explains how to use the vector embeddings system in the CMIS Event Management System.

## Overview

Vector embeddings enable semantic search across your content, allowing users to find information based on meaning rather than exact keyword matches. This is useful for:

- **Resume Matching**: Match resumes to job descriptions based on skills and experience
- **Event Search**: Find events using natural language queries
- **Mission Search**: Discover relevant technical missions based on descriptions
- **Content Discovery**: Semantic search across any content type

## Architecture

The system uses:
- **OpenAI Embeddings API** (or Gemini as fallback) to generate vector embeddings
- **Supabase pgvector extension** for storing and querying vectors
- **HNSW indexing** for fast approximate nearest neighbor search

## Setup

### 1. Enable pgvector Extension

Run the migration in your Supabase SQL Editor:

```sql
-- Run database/migrations/001_enable_pgvector.sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Create Embeddings Table

Run the embeddings table migration:

```sql
-- Run database/migrations/002_create_embeddings_table.sql
-- This creates the embeddings table and match_embeddings function
```

### 3. Environment Variables

Ensure you have API keys set:

```env
OPENAI_API_KEY=your_openai_api_key
# OR
GOOGLE_AI_API_KEY=your_gemini_api_key
```

## Usage Examples

### Basic Embedding Generation

```typescript
import { generateEmbedding } from '@/lib/ai/embeddings';

// Generate an embedding from text
const result = await generateEmbedding(
  "Looking for a software engineer with React and TypeScript experience"
);

console.log(result.embedding); // Array of 1536 numbers
console.log(result.dimensions); // 1536
console.log(result.model); // "text-embedding-3-small"
```

### Store an Embedding

```typescript
import { generateAndStoreEmbedding } from '@/lib/ai/embeddings';

// Generate and store in one operation
const result = await generateAndStoreEmbedding(
  'resume',           // content type
  resumeId,           // content ID
  resumeText,         // text content
  userId,             // user ID (optional)
  {                   // metadata (optional)
    fileName: 'resume.pdf',
    skills: ['React', 'TypeScript']
  }
);
```

### Semantic Search

```typescript
import { searchSimilarContent } from '@/lib/ai/embeddings';

// Search for similar content using natural language
const results = await searchSimilarContent(
  "I'm looking for Python developers",
  {
    contentType: 'resume',
    threshold: 0.7,  // Minimum similarity (0-1)
    limit: 10
  }
);

results.forEach(result => {
  console.log(`Similarity: ${result.similarity}`);
  console.log(`Content: ${result.textContent}`);
});
```

## Resume Matching

The system includes a specialized service for matching resumes to job descriptions:

```typescript
import {
  indexResume,
  matchResumesToJob,
  extractResumeText
} from '@/lib/services/resume-matching';
import fs from 'fs';

// 1. Extract text from PDF resume
const pdfBuffer = fs.readFileSync('resume.pdf');
const resumeText = await extractResumeText(pdfBuffer);

// 2. Index the resume
await indexResume(resumeId, resumeText, userId, {
  fileName: 'resume.pdf',
  skills: ['React', 'TypeScript', 'Node.js'],
  major: 'Computer Science',
  gpa: 3.8
});

// 3. Match resumes to a job description
const matches = await matchResumesToJob(
  "We're hiring a full-stack developer with React and TypeScript experience...",
  {
    threshold: 0.7,
    limit: 10,
    skills: ['React', 'TypeScript'],  // Optional filters
    minGPA: 3.5
  }
);

matches.forEach(match => {
  console.log(`Resume ${match.resumeId}: ${(match.similarity * 100).toFixed(1)}% match`);
});
```

## Event and Mission Search

Index events and missions for semantic search:

```typescript
import {
  indexEvent,
  searchEvents,
  indexMission,
  searchMissions
} from '@/lib/services/content-search';

// Index an event
await indexEvent(
  eventId,
  "Python Workshop",
  "Learn Python fundamentals and best practices...",
  {
    startsAt: '2024-10-15T10:00:00Z',
    location: 'Wehner 301',
    type: 'workshop'
  }
);

// Search for events
const events = await searchEvents(
  "I want to learn about Python programming",
  {
    threshold: 0.6,
    type: 'workshop'
  }
);
```

## API Routes

### Generate Embedding

```bash
POST /api/embeddings/generate
Content-Type: application/json

{
  "text": "Your text here",
  "model": "text-embedding-3-small",  // Optional
  "dimensions": 1536                   // Optional
}
```

### Store Embedding

```bash
POST /api/embeddings/store
Content-Type: application/json

{
  "contentType": "resume",
  "contentId": "uuid",
  "textContent": "Resume text...",
  "embedding": [0.123, 0.456, ...],
  "metadata": { "fileName": "resume.pdf" }
}
```

### Generate and Store

```bash
POST /api/embeddings/generate-and-store
Content-Type: application/json

{
  "contentType": "resume",
  "contentId": "uuid",
  "textContent": "Resume text...",
  "metadata": { "fileName": "resume.pdf" }
}
```

### Search

```bash
POST /api/embeddings/search
Content-Type: application/json

{
  "query": "Python developer",
  "contentType": "resume",  // Optional
  "threshold": 0.7,         // Optional
  "limit": 10               // Optional
}
```

## Best Practices

### 1. Content Type Naming

Use consistent, lowercase names for content types:
- `resume`
- `event`
- `mission`
- `job_description`

### 2. Text Preprocessing

Before generating embeddings:
- Remove excessive whitespace
- Truncate very long text (keep under 8000 characters)
- Remove special characters if needed

### 3. Similarity Thresholds

- **0.8-1.0**: Very similar (almost identical)
- **0.6-0.8**: Similar (relevant matches)
- **0.4-0.6**: Somewhat similar (may need filtering)
- **< 0.4**: Not similar

### 4. Batch Operations

For indexing many items, consider:
- Processing in batches of 10-20
- Adding rate limiting
- Using background jobs for large operations

### 5. Updating Embeddings

When content changes, update the embedding:

```typescript
import { updateEmbedding } from '@/lib/ai/embeddings';

await updateEmbedding(
  'event',
  eventId,
  newEventDescription,
  userId,
  { updatedAt: new Date().toISOString() }
);
```

### 6. Cleanup

Delete embeddings when content is removed:

```typescript
import { deleteEmbedding } from '@/lib/ai/embeddings';

await deleteEmbedding('resume', resumeId);
```

## Integration Examples

### Resume Upload Handler

```typescript
// app/api/resumes/upload/route.ts
import { indexResume, extractResumeText } from '@/lib/services/resume-matching';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const resumeText = await extractResumeText(buffer);
  
  // Upload file to Supabase Storage first...
  
  // Then index it
  await indexResume(resumeId, resumeText, userId, {
    fileName: file.name
  });
  
  return Response.json({ success: true });
}
```

### Event Indexing on Create/Update

```typescript
// In your event creation/update handler
import { indexEvent, updateEventIndex } from '@/lib/services/content-search';

// When creating/updating an event
if (isNewEvent) {
  await indexEvent(eventId, title, description, {
    startsAt: starts_at,
    location,
    type: event_type
  });
} else {
  await updateEventIndex(eventId, title, description, {
    updatedAt: new Date().toISOString()
  });
}
```

### Job Matching Interface

```typescript
// app/sponsor/job-matching/page.tsx
'use client';

import { useState } from 'react';

export default function JobMatchingPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const response = await fetch('/api/embeddings/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: jobDescription,
        contentType: 'resume',
        threshold: 0.7,
        limit: 10
      })
    });
    
    const data = await response.json();
    setMatches(data.results);
    setLoading(false);
  };

  return (
    <div>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Enter job description..."
      />
      <button onClick={handleSearch} disabled={loading}>
        Find Matching Resumes
      </button>
      
      {matches.map((match, i) => (
        <div key={i}>
          <p>Match: {(match.similarity * 100).toFixed(1)}%</p>
          <p>{match.textContent.substring(0, 200)}...</p>
        </div>
      ))}
    </div>
  );
}
```

## Performance Considerations

1. **Indexing**: Use background jobs for bulk indexing
2. **Caching**: Cache frequent queries in Redis
3. **Pagination**: Limit results and implement pagination
4. **Rate Limiting**: Protect API endpoints from abuse
5. **Monitoring**: Track embedding generation costs

## Troubleshooting

### "Extension vector does not exist"
- Run the pgvector extension migration
- Check Supabase project settings

### "Failed to generate embedding"
- Verify API keys are set correctly
- Check API quota/limits
- Ensure text is not empty

### "Low similarity scores"
- Try lowering the threshold
- Ensure content is relevant
- Check if text preprocessing is needed

### "Slow queries"
- Verify HNSW index is created
- Consider reducing limit
- Check database performance

## Cost Estimation

OpenAI Embedding API costs (as of 2024):
- **text-embedding-3-small**: $0.02 per 1M tokens
- Average resume: ~1000 tokens = $0.00002
- 1000 resumes: ~$0.02

Plan accordingly based on your indexing and search volume.

## Next Steps

1. Run the database migrations
2. Test with sample data
3. Integrate into your resume upload flow
4. Add event indexing to event creation/update
5. Build UI for semantic search features

For questions or issues, check the codebase or contact the development team.

