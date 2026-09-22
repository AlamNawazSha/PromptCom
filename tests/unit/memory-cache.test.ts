import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCache } from '@/lib/cache/memory-cache';
import { detectBrandImpersonation, levenshteinDistance } from '@/lib/url/brand-detector';

describe('MemoryCache Subsystem', () => {
  let cache: MemoryCache<string>;

  beforeEach(() => {
    cache = new MemoryCache<string>(3, 1000); // max 3 items, 1s TTL
  });

  it('should store and retrieve values correctly', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
    expect(cache.has('key1')).toBe(true);
  });

  it('should return undefined for missing keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('should evict oldest entry when capacity is exceeded (LRU)', () => {
    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    cache.set('k3', 'v3');
    // Access k1 to make it recently used
    cache.get('k1');
    // Add fourth item - should evict k2 (least recently used)
    cache.set('k4', 'v4');

    expect(cache.get('k1')).toBe('v1');
    expect(cache.get('k2')).toBeUndefined();
    expect(cache.get('k3')).toBe('v3');
    expect(cache.get('k4')).toBe('v4');
  });

  it('should track cache statistics accurately', () => {
    cache.set('a', '1');
    cache.get('a'); // hit
    cache.get('a'); // hit
    cache.get('b'); // miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(67);
  });
});

describe('Optimized Brand Detection & Levenshtein Engine', () => {
  it('should compute exact Levenshtein distances with linear space', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('paypal', 'paypa1')).toBe(1);
    expect(levenshteinDistance('google', 'google')).toBe(0);
    expect(levenshteinDistance('', 'abc')).toBe(3);
  });

  it('should detect typosquatting and cache subsequent evaluations', () => {
    const res1 = detectBrandImpersonation('paypa1.com');
    expect(res1.hasMismatch).toBe(true);
    expect(res1.matchedBrand).toBe('PayPal');

    // Second evaluation should hit memory cache seamlessly
    const res2 = detectBrandImpersonation('paypa1.com');
    expect(res2.hasMismatch).toBe(true);
    expect(res2.matchedBrand).toBe('PayPal');
  });

  it('should recognize authentic domains without false positives', () => {
    const res = detectBrandImpersonation('google.com');
    expect(res.hasMismatch).toBe(false);
    expect(res.matchedBrand).toBeNull();
  });
});
