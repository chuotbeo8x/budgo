/**
 * Simple in-memory rate limiting utility
 * For production, consider using Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  isAllowed(
    identifier: string, 
    limit: number = 100, 
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): boolean {
    const now = Date.now();
    const key = identifier;
    const entry = this.requests.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or new entry
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(
    identifier: string, 
    limit: number = 100
  ): number {
    const entry = this.requests.get(identifier);
    if (!entry) return limit;
    return Math.max(0, limit - entry.count);
  }

  getResetTime(identifier: string): number {
    const entry = this.requests.get(identifier);
    return entry ? entry.resetTime : 0;
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();

// Rate limit middleware for API routes
export function withRateLimit(
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000
) {
  return function rateLimitMiddleware(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    if (!rateLimiter.isAllowed(ip, limit, windowMs)) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimiter.getResetTime(ip) - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimiter.getResetTime(ip) - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    return null; // Allow request to continue
  };
}
