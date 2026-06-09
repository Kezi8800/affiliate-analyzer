// lib/api-keys.js
// BrandShuo Attribution Checker — API Key Management
// Simple key generation, validation, and rate limiting

const crypto = require("crypto");

// In production, store keys in a database. For now, use env + in-memory store.
const API_KEYS = new Map();

// Load keys from environment variable
// Format: KEY_ID:SECRET:TIER,KEY_ID2:SECRET2:TIER2
// Tiers: free (100/mo), pro (1000/mo), enterprise (10000/mo)
function loadKeysFromEnv() {
  const envKeys = process.env.API_KEYS || "";
  if (!envKeys) return;

  for (const entry of envKeys.split(",")) {
    const [id, secret, tier = "free"] = entry.split(":");
    if (id && secret) {
      API_KEYS.set(id, {
        id,
        secret,
        tier,
        created_at: new Date().toISOString(),
        usage: { count: 0, reset_at: getNextResetDate() }
      });
    }
  }
}

function getNextResetDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function generateKey(tier = "free") {
  const id = `bs_${crypto.randomBytes(8).toString("hex")}`;
  const secret = crypto.randomBytes(24).toString("base64url");
  const key = `bsak_${id}_${secret}`;

  API_KEYS.set(id, {
    id,
    secret,
    tier,
    created_at: new Date().toISOString(),
    usage: { count: 0, reset_at: getNextResetDate() }
  });

  return { id, secret, full_key: key, tier };
}

const TIER_LIMITS = {
  free: 100,
  pro: 1000,
  enterprise: 10000
};

function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    return { valid: false, reason: "Missing API key. Get one at https://brandshuo.com/api" };
  }

  // Format: bsak_ID_SECRET
  const match = apiKey.match(/^bsak_(bs_[a-f0-9]+)_(.+)$/);
  if (!match) {
    // Try direct ID lookup
    const directKey = API_KEYS.get(apiKey);
    if (directKey) {
      return validateUsage(directKey);
    }
    return { valid: false, reason: "Invalid API key format" };
  }

  const [, id, secret] = match;
  const stored = API_KEYS.get(id);

  if (!stored) {
    return { valid: false, reason: "Unknown API key. Register at https://brandshuo.com/api" };
  }

  if (stored.secret !== secret) {
    return { valid: false, reason: "Invalid API key" };
  }

  return validateUsage(stored);
}

function validateUsage(keyData) {
  const now = new Date();
  const resetAt = new Date(keyData.usage.reset_at);

  // Reset monthly counter
  if (now >= resetAt) {
    keyData.usage.count = 0;
    keyData.usage.reset_at = getNextResetDate();
  }

  const limit = TIER_LIMITS[keyData.tier] || TIER_LIMITS.free;

  if (keyData.usage.count >= limit) {
    return {
      valid: false,
      reason: `Monthly limit reached (${limit}/${keyData.tier}). Upgrade at https://brandshuo.com/api`
    };
  }

  return { valid: true, tier: keyData.tier, key_id: keyData.id };
}

function trackUsage(apiKey) {
  const match = apiKey?.match(/^bsak_(bs_[a-f0-9]+)_/);
  if (!match) return;

  const id = match[1];
  const stored = API_KEYS.get(id);
  if (stored) {
    stored.usage.count += 1;
  }
}

function getKeyInfo(apiKey) {
  const match = apiKey?.match(/^bsak_(bs_[a-f0-9]+)_/);
  if (!match) return null;

  const id = match[1];
  const stored = API_KEYS.get(id);
  if (!stored) return null;

  return {
    tier: stored.tier,
    usage_count: stored.usage.count,
    limit: TIER_LIMITS[stored.tier] || TIER_LIMITS.free,
    reset_at: stored.usage.reset_at
  };
}

// API key middleware for Vercel serverless
function withApiKey(handler, required = false) {
  return async function (req, res) {
    const apiKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "") || "";

    const validation = validateApiKey(apiKey);

    if (!validation.valid) {
      if (required) {
        return res.status(401).json({
          ok: false,
          error: true,
          message: validation.reason
        });
      }
      // Not required — proceed without key (track anonymously)
    }

    // Attach validation to request for handler use
    req.apiKey = validation;
    req.apiKeyInfo = getKeyInfo(apiKey);

    const result = await handler(req, res);

    // Track usage if valid key
    if (validation.valid && apiKey) {
      trackUsage(apiKey);
    }

    return result;
  };
}

// Initialize
loadKeysFromEnv();

module.exports = {
  generateKey,
  validateApiKey,
  trackUsage,
  getKeyInfo,
  withApiKey,
  TIER_LIMITS,
  API_KEYS
};
