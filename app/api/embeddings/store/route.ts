/**
 * API Route: Store Embedding
 * POST /api/embeddings/store
 * 
 * Stores an embedding in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { storeEmbedding } from '@/lib/ai/embeddings';
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
      contentType,
      contentId,
      textContent,
      embedding,
      metadata,
    } = body;

    // Validate required fields
    if (!contentType || !contentId || !textContent || !embedding) {
      return NextResponse.json(
        { error: 'Missing required fields: contentType, contentId, textContent, embedding' },
        { status: 400 }
      );
    }

    if (!Array.isArray(embedding)) {
      return NextResponse.json(
        { error: 'Embedding must be an array of numbers' },
        { status: 400 }
      );
    }

    const result = await storeEmbedding(
      contentType,
      contentId,
      textContent,
      embedding,
      user.id,
      metadata
    );

    return NextResponse.json({
      id: result.id,
      success: true,
    });
  } catch (error) {
    console.error('[API] Store embedding error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to store embedding',
      },
      { status: 500 }
    );
  }
}

