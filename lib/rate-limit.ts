import { redis } from './redis';

interface RateLimitConfig {
  limit: number;
  window: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  limit: number;
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export const RATE_LIMITS = {
  chat: { limit: 20, window: 60 },
  api: { limit: 100, window: 60 },
  auth: { limit: 5, window: 60 },
  upload: { limit: 10, window: 3600 },
} as const;

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.api
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);

  if (redis) {
    try {
      return await rateLimitWithRedis(key, config, now);
    } catch (error) {
      console.error('Rate limit Redis error:', error);
    }
  }

  return rateLimitWithMemory(key, config, now);
}

async function rateLimitWithRedis(
  key: string,
  config: RateLimitConfig,
  now: number
): Promise<RateLimitResult> {
  const windowKey = `${key}:${Math.floor(now / config.window)}`;
  const count = await redis!.incr(windowKey);
  
  if (count === 1) {
    await redis!.expire(windowKey, config.window);
  }

  const resetIn = config.window - (now % config.window);
  const remaining = Math.max(0, config.limit - count);
  const allowed = count <= config.limit;

  return { allowed, remaining, resetIn, limit: config.limit };
}

function rateLimitWithMemory(
  key: string,
  config: RateLimitConfig,
  now: number
): RateLimitResult {
  const windowStart = Math.floor(now / config.window) * config.window;
  const windowEnd = windowStart + config.window;

  let entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: windowEnd };
  }

  entry.count++;
  memoryStore.set(key, entry);

  if (memoryStore.size > 10000) {
    const keysToDelete: string[] = [];
    memoryStore.forEach((value, mapKey) => {
      if (value.resetAt <= now) keysToDelete.push(mapKey);
    });
    keysToDelete.forEach((k) => memoryStore.delete(k));
  }

  const resetIn = entry.resetAt - now;
  const remaining = Math.max(0, config.limit - entry.count);
  const allowed = entry.count <= config.limit;

  return { allowed, remaining, resetIn, limit: config.limit };
}

export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return `ip:${forwardedFor.split(',')[0].trim()}`;

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return `ip:${realIp}`;

  return 'ip:unknown';
}

export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetIn.toString());
  return headers;
}
