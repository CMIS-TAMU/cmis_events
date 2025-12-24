/**
 * API Route: Public Search (Demo Version)
 * POST /api/embeddings/search-public
 * 
 * Public version of semantic search for demo purposes
 * WARNING: This endpoint does not require authentication
 * Use with caution - rate limiting recommended for production
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  searchSimilarContent,
  findSimilarEmbeddings,
} from '@/lib/ai/embeddings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query, // Text query
      embedding, // Pre-computed embedding vector
      contentType,
      threshold,
      limit,
    } = body;

    // Must provide either query text or embedding vector
    if (!query && !embedding) {
      return NextResponse.json(
        { error: 'Either query (text) or embedding (vector) is required' },
        { status: 400 }
      );
    }

    let results;

    if (query) {
      // Text-based search
      results = await searchSimilarContent(query, {
        contentType,
        threshold: threshold ?? 0.5, // Lower default threshold for demo
        limit: limit ?? 10,
        userId: undefined, // Public search - no user filter
      });
    } else {
      // Vector-based search
      if (!Array.isArray(embedding)) {
        return NextResponse.json(
          { error: 'Embedding must be an array of numbers' },
          { status: 400 }
        );
      }

      results = await findSimilarEmbeddings(embedding, {
        contentType,
        threshold: threshold ?? 0.5,
        limit: limit ?? 10,
        userId: undefined,
      });
    }

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('[API] Public search embeddings error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to search embeddings',
      },
      { status: 500 }
    );
  }
}

