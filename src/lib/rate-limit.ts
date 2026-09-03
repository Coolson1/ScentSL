/**
 * src/lib/rate-limit.ts
 * High-performance, memory-efficient sliding-window rate limiter for Next.js API routes.
 * Prevents endpoint abuse, credential stuffing, and request flooding under high concurrency.
 */

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const tracker = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 60 seconds to prevent memory leaks under high traffic
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of tracker.entries()) {
      if (now > record.resetTime) {
        tracker.delete(key);
      }
    }
  }, 60_000);
}

export type RateLimitConfig = {
  intervalMs?: number; // Time window in milliseconds (default: 60,000ms = 1 min)
  limit?: number;      // Maximum requests allowed in the window (default: 60)
};

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const intervalMs = config.intervalMs ?? 60_000;
  const limit = config.limit ?? 60;

  const now = Date.now();
  const record = tracker.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + intervalMs,
    };
    tracker.set(identifier, newRecord);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil(newRecord.resetTime / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: Math.ceil(record.resetTime / 1000),
  };
}
