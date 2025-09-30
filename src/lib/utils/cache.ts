/**
 * Simple in-memory cache utility
 * For production, consider using Redis or similar
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 1000; // Maximum number of items

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // Default 5 minutes
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache keys
export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  USERS: (ids: string[]) => `users:${ids.sort().join(',')}`,
  GROUP: (id: string) => `group:${id}`,
  TRIP: (id: string) => `trip:${id}`,
  EXPENSES: (tripId: string) => `expenses:${tripId}`,
  ADVANCES: (tripId: string) => `advances:${tripId}`,
  SETTLEMENT: (tripId: string) => `settlement:${tripId}`,
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  USER: 10 * 60 * 1000, // 10 minutes
  USERS: 5 * 60 * 1000, // 5 minutes
  GROUP: 15 * 60 * 1000, // 15 minutes
  TRIP: 10 * 60 * 1000, // 10 minutes
  EXPENSES: 2 * 60 * 1000, // 2 minutes
  ADVANCES: 2 * 60 * 1000, // 2 minutes
  SETTLEMENT: 1 * 60 * 1000, // 1 minute
} as const;

// Cleanup expired items every 5 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}
