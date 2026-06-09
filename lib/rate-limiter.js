// lib/rate-limiter.js
// BrandShuo — Tiered Rate Limiter
// In-memory sliding window rate limiter per API key or IP
// Ready for Redis migration (swap store implementation)

const TIER_LIMITS = {
  free: { rpm: 10, rph: 100, rpm_burst: 20 },
  pro: { rpm: 30, rph: 1000, rpm_burst: 50 },
  enterprise: { rpm: 100, rph: 10000, rpm_burst: 200 },
  internal: { rpm: 500, rph: 50000, rpm_burst: 1000 }
};

class RateLimiter {
  constructor() {
    this.store = new Map(); // key → [{timestamp}]
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  cleanup() {
    const now = Date.now();
    const oneHour = 3600000;
    for (const [key, entries] of this.store) {
      const filtered = entries.filter(e => now - e.timestamp < oneHour);
      if (filtered.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, filtered);
      }
    }
  }

  /**
   * Check if a request should be allowed
   * @param {string} key — API key ID or IP address
   * @param {string} tier — free | pro | enterprise | internal
   * @returns {{ allowed: boolean, retryAfter?: number, limit?: number, remaining?: number }}
   */
  check(key, tier = "free") {
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
    const now = Date.now();
    const oneMinute = 60000;
    const oneHour = 3600000;

    let entries = this.store.get(key) || [];

    // Sliding window: count requests in last minute and last hour
    const minuteAgo = now - oneMinute;
    const hourAgo = now - oneHour;

    const minuteCount = entries.filter(e => e.timestamp > minuteAgo).length;
    const hourCount = entries.filter(e => e.timestamp > hourAgo).length;

    // Check burst limit (per-minute)
    if (minuteCount >= limits.rpm_burst) {
      const oldest = entries.find(e => e.timestamp > minuteAgo);
      const retryAfter = oldest ? Math.ceil((oldest.timestamp + oneMinute - now) / 1000) : 60;
      return {
        allowed: false,
        retryAfter,
        limit: limits.rpm_burst,
        remaining: 0,
        reason: `Burst limit: ${limits.rpm_burst} req/min`
      };
    }

    // Check sustained rate (per-minute)
    if (minuteCount >= limits.rpm) {
      const retryAfter = Math.ceil((entries[0]?.timestamp + oneMinute - now) / 1000) || 6;
      return {
        allowed: false,
        retryAfter,
        limit: limits.rpm,
        remaining: 0,
        reason: `Rate limit: ${limits.rpm} req/min`
      };
    }

    // Check hourly quota
    if (hourCount >= limits.rph) {
      const retryAfter = Math.ceil((entries[0]?.timestamp + oneHour - now) / 1000) || 360;
      return {
        allowed: false,
        retryAfter,
        limit: limits.rph,
        remaining: 0,
        reason: `Hourly quota: ${limits.rph} req/hour`
      };
    }

    // Allow and record
    entries.push({ timestamp: now });
    if (entries.length > 1000) {
      entries = entries.slice(-500); // prevent memory leaks
    }
    this.store.set(key, entries);

    return {
      allowed: true,
      limit: limits.rpm,
      remaining: limits.rpm - minuteCount - 1
    };
  }

  getStats(key) {
    const entries = this.store.get(key) || [];
    const now = Date.now();
    const minuteCount = entries.filter(e => now - e.timestamp < 60000).length;
    const hourCount = entries.filter(e => now - e.timestamp < 3600000).length;
    return { minute: minuteCount, hour: hourCount, total: entries.length };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton
const limiter = new RateLimiter();

// Middleware for Vercel serverless
function withRateLimit(handler, opts = {}) {
  return async function (req, res) {
    const apiKey = req.headers["x-api-key"] || "";
    const keyId = apiKey.match(/^bsak_(bs_[a-f0-9]+)_/)?.[1] || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "anonymous";
    const tier = req.apiKey?.tier || (apiKey ? "free" : "internal");

    const check = limiter.check(`rl:${keyId}`, tier);

    if (!check.allowed) {
      res.setHeader("Retry-After", check.retryAfter);
      res.setHeader("X-RateLimit-Limit", check.limit);
      res.setHeader("X-RateLimit-Remaining", check.remaining);
      return res.status(429).json({
        ok: false,
        error: true,
        message: check.reason || "Rate limit exceeded",
        retry_after: check.retryAfter,
        tier,
        docs: "https://brandshuo.com/api"
      });
    }

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", check.limit);
    res.setHeader("X-RateLimit-Remaining", check.remaining);

    return handler(req, res);
  };
}

module.exports = { RateLimiter, limiter, withRateLimit, TIER_LIMITS };
