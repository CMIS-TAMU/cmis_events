import { Redis } from '@upstash/redis';

// Initialize Redis client (works even if env vars are not set - returns null)
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.warn('Redis initialization failed:', error);
}

export { redis };

// Cache helper functions
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

/**
 * Get cached data or fetch fresh data
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  if (!redis) {
    return fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    redis.setex(key, ttl, JSON.stringify(data)).catch(console.error);
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    return fetcher();
  }
}

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  chatResponse: (hash: string) => `chat:response:${hash}`,
  chatHistory: (userId: string) => `chat:history:${userId}`,
  eventDetails: (eventId: string) => `event:${eventId}`,
  eventsList: () => `events:list`,
  faq: () => `faq:all`,
  faqAnswer: (questionHash: string) => `faq:answer:${questionHash}`,
} as const;

/**
 * Generate a hash for caching chat responses
 */
export function hashMessage(message: string, context?: string): string {
  const str = `${message.toLowerCase().trim()}:${context || ''}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}
