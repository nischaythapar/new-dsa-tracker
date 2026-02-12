// lib/explainCache.ts

type CacheEntry = {
  response: string;
  timestamp: number;
};

const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cache = new Map<string, CacheEntry>();

export function getCachedExplain(prompt: string) {
  const entry = cache.get(prompt);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(prompt);
    return null;
  }

  return entry; // ⬅️ return full entry now
}

export function setCachedExplain(prompt: string, response: string) {
  cache.set(prompt, {
    response,
    timestamp: Date.now(),
  });
}
