/**
 * API Route: Search Similar Content
 * POST /api/embeddings/search
 * 
 * Searches for similar content using text query or embedding vector
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  searchSimilarContent,
  findSimilarEmbeddings,
} from '@/lib/ai/embeddings';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      query, // Text query
      embedding, // Pre-computed embedding vector
      contentType,
      threshold,
      limit,
      userId, // Optional: filter by user
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
        threshold: threshold ?? 0.7,
        limit: limit ?? 10,
        userId,
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
        threshold: threshold ?? 0.7,
        limit: limit ?? 10,
        userId,
      });
    }

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('[API] Search embeddings error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to search embeddings',
      },
      { status: 500 }
    );
  }
}

