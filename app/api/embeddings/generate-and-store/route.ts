/**
 * API Route: Generate and Store Embedding
 * POST /api/embeddings/generate-and-store
 * 
 * Generates an embedding from text and stores it in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAndStoreEmbedding } from '@/lib/ai/embeddings';
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
      metadata,
      model,
      dimensions,
    } = body;

    // Validate required fields
    if (!contentType || !contentId || !textContent) {
      return NextResponse.json(
        { error: 'Missing required fields: contentType, contentId, textContent' },
        { status: 400 }
      );
    }

    const result = await generateAndStoreEmbedding(
      contentType,
      contentId,
      textContent,
      user.id,
      metadata,
      { model, dimensions }
    );

    return NextResponse.json({
      id: result.id,
      dimensions: result.embedding.dimensions,
      model: result.embedding.model,
      success: true,
    });
  } catch (error) {
    console.error('[API] Generate and store embedding error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate and store embedding',
      },
      { status: 500 }
    );
  }
}

