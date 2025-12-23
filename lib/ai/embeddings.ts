/**
 * Vector Embeddings Service
 * 
 * Provides utilities for generating embeddings using OpenAI or Gemini APIs
 * and storing them in Supabase with pgvector for semantic search.
 */

import { AI_CONFIGS } from './config';
import { createAdminSupabase } from '../supabase/server';

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number; // For OpenAI embedding models
}

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  model: string;
}

/**
 * Generate embeddings from text using OpenAI or Gemini
 */
export async function generateEmbedding(
  text: string,
  options?: EmbeddingOptions
): Promise<EmbeddingResult> {
  const config = AI_CONFIGS.embedding;
  const model = options?.model || config.model;

  // Try OpenAI first (preferred for embeddings)
  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey && openAIKey.length > 10) {
    try {
      return await generateOpenAIEmbedding(text, model, options?.dimensions);
    } catch (error) {
      console.error('[Embeddings] OpenAI embedding failed, trying Gemini:', error);
      // Fall through to try Gemini
    }
  }

  // Try Gemini as fallback
  const geminiKey = process.env.GOOGLE_AI_API_KEY;
  if (geminiKey && geminiKey.length > 10) {
    try {
      return await generateGeminiEmbedding(text, model);
    } catch (error) {
      console.error('[Embeddings] Gemini embedding failed:', error);
      throw new Error('Failed to generate embeddings: No API keys available or API error');
    }
  }

  throw new Error('No embedding API keys found. Please set OPENAI_API_KEY or GOOGLE_AI_API_KEY');
}

/**
 * Generate embeddings using OpenAI API
 */
async function generateOpenAIEmbedding(
  text: string,
  model: string,
  dimensions?: number
): Promise<EmbeddingResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found');
  }

  // Normalize text (remove extra whitespace, truncate if too long)
  const normalizedText = text.trim().slice(0, 8000); // OpenAI's limit is 8191 tokens, but we're conservative

  const requestBody: Record<string, unknown> = {
    model,
    input: normalizedText,
  };

  // Add dimensions parameter if specified (for text-embedding-3 models)
  if (dimensions) {
    requestBody.dimensions = dimensions;
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI embedding API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const embedding = data.data[0]?.embedding;

  if (!embedding || !Array.isArray(embedding)) {
    throw new Error('Invalid embedding response from OpenAI');
  }

  return {
    embedding,
    dimensions: embedding.length,
    model: data.model || model,
  };
}

/**
 * Generate embeddings using Google Gemini API
 * Note: Gemini uses a different embedding model (text-embedding-004)
 */
async function generateGeminiEmbedding(
  text: string,
  model: string = 'text-embedding-004'
): Promise<EmbeddingResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not found');
  }

  const normalizedText = text.trim().slice(0, 8000);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: `models/${model}`,
        content: {
          parts: [{ text: normalizedText }],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini embedding API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const embedding = data.embedding?.values;

  if (!embedding || !Array.isArray(embedding)) {
    throw new Error('Invalid embedding response from Gemini');
  }

  return {
    embedding,
    dimensions: embedding.length,
    model,
  };
}

/**
 * Store embedding in database
 */
export async function storeEmbedding(
  contentType: string,
  contentId: string,
  textContent: string,
  embedding: number[],
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string }> {
  const supabase = createAdminSupabase();

  // Supabase accepts vector as an array directly
  // The PostgreSQL vector type will handle the conversion
  const { data, error } = await supabase
    .from('embeddings')
    .upsert(
      {
        content_type: contentType,
        content_id: contentId,
        user_id: userId || null,
        text_content: textContent,
        embedding: embedding, // Pass as array, Supabase handles conversion
        metadata: metadata || {},
      },
      {
        onConflict: 'content_type,content_id',
        ignoreDuplicates: false,
      }
    )
    .select('id')
    .single();

  if (error) {
    console.error('[Store Embedding] Error:', error);
    throw new Error(`Failed to store embedding: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to store embedding: No data returned');
  }

  return { id: data.id };
}

/**
 * Generate and store embedding in one operation
 */
export async function generateAndStoreEmbedding(
  contentType: string,
  contentId: string,
  textContent: string,
  userId?: string,
  metadata?: Record<string, unknown>,
  options?: EmbeddingOptions
): Promise<{ id: string; embedding: EmbeddingResult }> {
  const embeddingResult = await generateEmbedding(textContent, options);
  const stored = await storeEmbedding(
    contentType,
    contentId,
    textContent,
    embeddingResult.embedding,
    userId,
    metadata
  );

  return {
    id: stored.id,
    embedding: embeddingResult,
  };
}

/**
 * Find similar embeddings using vector similarity search
 */
export async function findSimilarEmbeddings(
  queryEmbedding: number[],
  options?: {
    contentType?: string;
    threshold?: number;
    limit?: number;
    userId?: string;
  }
): Promise<Array<{
  id: string;
  contentType: string;
  contentId: string;
  userId: string | null;
  textContent: string;
  similarity: number;
  metadata: Record<string, unknown>;
}>> {
  const supabase = createAdminSupabase();
  const threshold = options?.threshold ?? 0.7;
  const limit = options?.limit ?? 10;

  // Call the RPC function with the embedding array
  // Supabase will handle the vector type conversion
  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: queryEmbedding, // Pass as array
    match_threshold: threshold,
    match_count: limit,
    filter_content_type: options?.contentType || null,
  });

  if (error) {
    console.error('[Find Similar Embeddings] Error:', error);
    throw new Error(`Failed to find similar embeddings: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  // Filter by userId if specified
  let results = data as Array<{
    id: string;
    content_type: string;
    content_id: string;
    user_id: string | null;
    text_content: string;
    similarity: number;
    metadata: Record<string, unknown>;
  }>;

  if (options?.userId) {
    results = results.filter((r) => r.user_id === options.userId);
  }

  return results.map((r) => ({
    id: r.id,
    contentType: r.content_type,
    contentId: r.content_id,
    userId: r.user_id,
    textContent: r.text_content,
    similarity: r.similarity,
    metadata: (r.metadata as Record<string, unknown>) || {},
  }));
}

/**
 * Search for similar content by text query
 * This generates an embedding from the query and searches for similar content
 */
export async function searchSimilarContent(
  queryText: string,
  options?: {
    contentType?: string;
    threshold?: number;
    limit?: number;
    userId?: string;
  }
): Promise<Array<{
  id: string;
  contentType: string;
  contentId: string;
  userId: string | null;
  textContent: string;
  similarity: number;
  metadata: Record<string, unknown>;
}>> {
  const queryEmbedding = await generateEmbedding(queryText);
  return findSimilarEmbeddings(queryEmbedding.embedding, options);
}

/**
 * Delete embedding by content type and content ID
 */
export async function deleteEmbedding(
  contentType: string,
  contentId: string
): Promise<void> {
  const supabase = createAdminSupabase();

  const { error } = await supabase
    .from('embeddings')
    .delete()
    .eq('content_type', contentType)
    .eq('content_id', contentId);

  if (error) {
    console.error('[Delete Embedding] Error:', error);
    throw new Error(`Failed to delete embedding: ${error.message}`);
  }
}

/**
 * Update embedding when content changes
 */
export async function updateEmbedding(
  contentType: string,
  contentId: string,
  newTextContent: string,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string }> {
  // Generate new embedding
  const embeddingResult = await generateEmbedding(newTextContent);

  // Store (will upsert due to unique constraint)
  return storeEmbedding(
    contentType,
    contentId,
    newTextContent,
    embeddingResult.embedding,
    userId,
    metadata
  );
}

