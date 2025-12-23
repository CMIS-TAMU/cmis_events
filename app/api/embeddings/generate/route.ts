/**
 * API Route: Generate Embedding
 * POST /api/embeddings/generate
 * 
 * Generates an embedding for the provided text
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/ai/embeddings';
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
    const { text, model, dimensions } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const result = await generateEmbedding(text, { model, dimensions });

    return NextResponse.json({
      embedding: result.embedding,
      dimensions: result.dimensions,
      model: result.model,
    });
  } catch (error) {
    console.error('[API] Generate embedding error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate embedding',
      },
      { status: 500 }
    );
  }
}

