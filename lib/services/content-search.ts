/**
 * Content Search Service
 * 
 * Provides utilities for semantic search across various content types
 * (events, missions, general content)
 */

import {
  generateAndStoreEmbedding,
  searchSimilarContent,
  updateEmbedding,
  deleteEmbedding,
} from '@/lib/ai/embeddings';

/**
 * Index an event for semantic search
 */
export async function indexEvent(
  eventId: string,
  title: string,
  description: string,
  metadata?: {
    startsAt?: string;
    location?: string;
    type?: string;
    capacity?: number;
  }
): Promise<{ id: string }> {
  // Combine title and description for better search results
  const textContent = `${title}\n\n${description || ''}`.trim();

  return generateAndStoreEmbedding(
    'event',
    eventId,
    textContent,
    undefined,
    {
      title,
      startsAt: metadata?.startsAt,
      location: metadata?.location,
      type: metadata?.type,
      capacity: metadata?.capacity,
      indexedAt: new Date().toISOString(),
    }
  );
}

/**
 * Update event embedding when event is updated
 */
export async function updateEventIndex(
  eventId: string,
  title: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string }> {
  const textContent = `${title}\n\n${description || ''}`.trim();
  return updateEmbedding('event', eventId, textContent, undefined, metadata);
}

/**
 * Delete event embedding when event is deleted
 */
export async function deleteEventIndex(eventId: string): Promise<void> {
  return deleteEmbedding('event', eventId);
}

/**
 * Search for events using semantic search
 */
export async function searchEvents(
  query: string,
  options?: {
    threshold?: number;
    limit?: number;
    type?: string;
  }
): Promise<
  Array<{
    eventId: string;
    similarity: number;
    textContent: string;
    metadata: Record<string, unknown>;
  }>
> {
  const results = await searchSimilarContent(query, {
    contentType: 'event',
    threshold: options?.threshold ?? 0.6,
    limit: options?.limit ?? 10,
  });

  // Filter by type if specified
  let filtered = results;
  if (options?.type) {
    filtered = filtered.filter(
      (result) =>
        (result.metadata.type as string)?.toLowerCase() ===
        options.type!.toLowerCase()
    );
  }

  return filtered.map((result) => ({
    eventId: result.contentId,
    similarity: result.similarity,
    textContent: result.textContent,
    metadata: result.metadata,
  }));
}

/**
 * Index a mission for semantic search
 */
export async function indexMission(
  missionId: string,
  title: string,
  description: string,
  metadata?: {
    difficulty?: string;
    category?: string;
    maxPoints?: number;
  }
): Promise<{ id: string }> {
  const textContent = `${title}\n\n${description || ''}`.trim();

  return generateAndStoreEmbedding(
    'mission',
    missionId,
    textContent,
    undefined,
    {
      title,
      difficulty: metadata?.difficulty,
      category: metadata?.category,
      maxPoints: metadata?.maxPoints,
      indexedAt: new Date().toISOString(),
    }
  );
}

/**
 * Update mission embedding when mission is updated
 */
export async function updateMissionIndex(
  missionId: string,
  title: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string }> {
  const textContent = `${title}\n\n${description || ''}`.trim();
  return updateEmbedding('mission', missionId, textContent, undefined, metadata);
}

/**
 * Delete mission embedding when mission is deleted
 */
export async function deleteMissionIndex(missionId: string): Promise<void> {
  return deleteEmbedding('mission', missionId);
}

/**
 * Search for missions using semantic search
 */
export async function searchMissions(
  query: string,
  options?: {
    threshold?: number;
    limit?: number;
    difficulty?: string;
  }
): Promise<
  Array<{
    missionId: string;
    similarity: number;
    textContent: string;
    metadata: Record<string, unknown>;
  }>
> {
  const results = await searchSimilarContent(query, {
    contentType: 'mission',
    threshold: options?.threshold ?? 0.6,
    limit: options?.limit ?? 10,
  });

  // Filter by difficulty if specified
  let filtered = results;
  if (options?.difficulty) {
    filtered = filtered.filter(
      (result) =>
        (result.metadata.difficulty as string)?.toLowerCase() ===
        options.difficulty!.toLowerCase()
    );
  }

  return filtered.map((result) => ({
    missionId: result.contentId,
    similarity: result.similarity,
    textContent: result.textContent,
    metadata: result.metadata,
  }));
}

