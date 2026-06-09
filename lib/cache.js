// lib/cache.js
// BrandShuo — Response Cache Layer
// In-memory LRU cache with TTL. Ready for Redis migration (swap store).
// Caches analysis results keyed by normalized URL to speed up repeated lookups.

const crypto = require("crypto");

class Cache {
  constructor(options = {}) {
    this.store = new Map();
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 300000; // 5 min
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;

    // Periodic cleanup every 2 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 120000);
  }

  normalizeKey(key) {
    if (!key) return "";
    // Remove protocol, www, trailing slashes, sort query params for consistent keys
    try {
      const u = new URL(key);
      const params = [...u.searchParams.entries()].sort().map(([k, v]) => `${k}=${v}`).join("&");
      return `${u.hostname}${u.pathname}${params ? "?" + params : ""}`.toLowerCase();
    } catch {
      return String(key).toLowerCase().trim();
    }
  }

  hash(key) {
    return crypto.createHash("md5").update(key).digest("hex").slice(0, 16);
  }

  get(key) {
    const normalized = this.normalizeKey(key);
    const hashed = this.hash(normalized);
    const entry = this.store.get(hashed);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(hashed);
      this.misses++;
      return null;
    }

    this.hits++;
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  set(key, value, ttl) {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxSize) {
      this.evictOne();
    }

    const normalized = this.normalizeKey(key);
    const hashed = this.hash(normalized);
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    this.store.set(hashed, {
      value,
      expiresAt,
      created: Date.now(),
      lastAccessed: Date.now()
    });
  }

  evictOne() {
    // LRU: evict least recently accessed
    let oldest = null;
    let oldestKey = null;

    for (const [key, entry] of this.store) {
      if (!oldest || entry.lastAccessed < oldest.lastAccessed) {
        oldest = entry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      this.evictions++;
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  stats() {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: this.hits + this.misses > 0
        ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1) + "%"
        : "0%",
      defaultTTL: this.defaultTTL
    };
  }

  clear() {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Singleton
const analysisCache = new Cache({ maxSize: 2000, defaultTTL: 300000 }); // 5 min TTL

// Cache middleware for API handlers
function withCache(handler, options = {}) {
  const ttl = options.ttl || 300000;
  const cacheKey = options.cacheKey || ((req) => {
    return (req.body?.url || req.body?.urls?.join(",") || req.query?.url || req.url || "");
  });

  return async function (req, res) {
    // Only cache GET and POST with stable payloads
    if (req.method !== "GET" && req.method !== "POST") {
      return handler(req, res);
    }

    const key = cacheKey(req);
    if (!key) return handler(req, res);

    // Skip cache if requested
    if (req.headers["x-no-cache"] || req.headers["cache-control"] === "no-cache") {
      const result = await handler(req, res);
      return result;
    }

    const cached = analysisCache.get(key);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("X-Cache-TTL", Math.ceil((cached._cachedAt + ttl - Date.now()) / 1000));
      return res.status(200).json(cached);
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      if (data && data.ok !== false) {
        const toCache = { ...data, _cachedAt: Date.now(), _cacheTTL: ttl };
        analysisCache.set(key, toCache, ttl);
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(data);
    };

    return handler(req, res);
  };
}

module.exports = { Cache, analysisCache, withCache };
