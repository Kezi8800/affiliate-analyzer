// lib/security.js
// BrandShuo — Security Middleware
// Security headers, input sanitization, CORS configuration

const crypto = require("crypto");

// ===== Security Headers =====
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "off",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// ===== CORS Configuration =====
const ALLOWED_ORIGINS = [
  "https://brandshuo.com",
  "https://www.brandshuo.com",
  "https://tools.brandshuo.com",
  "chrome-extension://*",
  "http://localhost:3000"
];

function getAllowedOrigin(origin) {
  if (!origin) return "*";
  // In development, allow all
  if (process.env.NODE_ENV !== "production") return origin || "*";
  // Check against allowed list
  if (ALLOWED_ORIGINS.some(allowed => {
    if (allowed.includes("*")) {
      const prefix = allowed.replace("*", "");
      return origin.startsWith(prefix);
    }
    return allowed === origin;
  })) {
    return origin;
  }
  return ALLOWED_ORIGINS[0]; // Default
}

// ===== Input Sanitization =====
const MAX_URL_LENGTH = 4096;
const MAX_BATCH_SIZE = 100;
const MAX_BODY_SIZE = 1024 * 100; // 100KB

function sanitizeUrl(input) {
  if (!input || typeof input !== "string") return null;

  let url = input.trim();

  // Block javascript: and data: protocols
  if (/^(javascript|data|vbscript|file):/i.test(url)) {
    return null;
  }

  // Strip null bytes and control characters
  url = url.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

  // Enforce max length
  if (url.length > MAX_URL_LENGTH) return null;

  // Add protocol if missing (only http/https)
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // Validate URL structure
  try {
    const parsed = new URL(url);
    // Only allow http/https
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function sanitizeBody(body) {
  if (!body) return {};

  const json = JSON.stringify(body);
  if (json.length > MAX_BODY_SIZE) {
    throw new Error(`Request body too large. Maximum ${MAX_BODY_SIZE / 1024}KB.`);
  }

  // Recursively sanitize strings
  function sanitize(obj) {
    if (typeof obj === "string") {
      // Strip HTML tags, null bytes
      return obj.replace(/<[^>]*>/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").slice(0, 5000);
    }
    if (Array.isArray(obj)) {
      return obj.slice(0, MAX_BATCH_SIZE).map(sanitize);
    }
    if (obj && typeof obj === "object") {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanKey = key.replace(/[^\w_-]/g, "").slice(0, 64);
        cleaned[cleanKey] = sanitize(value);
      }
      return cleaned;
    }
    return obj;
  }

  return sanitize(body);
}

// ===== Middleware =====
function withSecurity(handler) {
  return async function (req, res) {
    // Set security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // CORS
    const origin = req.headers.origin;
    const allowedOrigin = getAllowedOrigin(origin);
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);

    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key, X-Admin-Key, X-No-Cache");
      res.setHeader("Access-Control-Max-Age", "86400");
      return res.status(204).end();
    }

    // Sanitize body for POST requests
    if (req.method === "POST" && req.body) {
      try {
        req.body = sanitizeBody(req.body);
      } catch (err) {
        return res.status(400).json({
          ok: false, error: true,
          code: "BODY_TOO_LARGE",
          message: err.message
        });
      }
    }

    // Sanitize URL in body
    if (req.body?.url) {
      const sanitized = sanitizeUrl(req.body.url);
      if (!sanitized) {
        return res.status(400).json({
          ok: false, error: true,
          code: "INVALID_URL",
          message: "The provided URL is invalid or contains unsafe protocols"
        });
      }
      req.body.url = sanitized;
    }

    // Sanitize URLs array in batch
    if (req.body?.urls && Array.isArray(req.body.urls)) {
      req.body.urls = req.body.urls
        .map(u => sanitizeUrl(u))
        .filter(Boolean)
        .slice(0, MAX_BATCH_SIZE);
    }

    // Generate request ID
    const requestId = crypto.randomBytes(4).toString("hex");
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    try {
      return await handler(req, res);
    } catch (err) {
      return res.status(500).json({
        ok: false, error: true,
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        request_id: requestId
      });
    }
  };
}

// ===== Rate Limiter Hardening =====
function validateApiKey(apiKey) {
  if (!apiKey) return null;
  // Basic format validation
  if (!/^bsak_bs_[a-f0-9]+_[a-zA-Z0-9_-]+$/.test(apiKey)) {
    return null;
  }
  return apiKey;
}

module.exports = {
  SECURITY_HEADERS,
  ALLOWED_ORIGINS,
  getAllowedOrigin,
  sanitizeUrl,
  sanitizeBody,
  withSecurity,
  validateApiKey,
  MAX_URL_LENGTH,
  MAX_BATCH_SIZE,
  MAX_BODY_SIZE
};
