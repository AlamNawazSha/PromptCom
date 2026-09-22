/**
 * High-Performance In-Memory LRU & TTL Cache
 * Provides sub-millisecond caching for DNS lookups, RDAP results, brand checks, and scan payloads.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxItems: number;
  private defaultTtlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(maxItems = 1000, defaultTtlMs = 1000 * 60 * 30) {
    this.maxItems = maxItems;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Retrieves an item from the cache if not expired
   */
  public get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value;
  }

  /**
   * Sets an item in the cache with optional custom TTL
   */
  public set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxItems) {
      // Evict oldest entry (first item in iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Checks whether a non-expired key exists in cache
   */
  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Deletes a key from cache
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clears all entries from cache
   */
  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Returns cache metrics (size, hits, misses, hitRate)
   */
  public getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? Math.round((this.hits / total) * 100) : 0;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }
}

// Global shared cache instances
export const dnsCache = new MemoryCache<string[]>(500, 1000 * 60 * 15); // 15 mins TTL
export const rdapCache = new MemoryCache<unknown>(500, 1000 * 60 * 60 * 6); // 6 hours TTL
export const scanResultCache = new MemoryCache<unknown>(300, 1000 * 60 * 10); // 10 mins TTL
export const brandCheckCache = new MemoryCache<unknown>(1000, 1000 * 60 * 60 * 24); // 24 hours TTL
