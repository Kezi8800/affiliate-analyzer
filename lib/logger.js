// lib/logger.js
// BrandShuo — Structured Request Logger
// Logs API requests with timing, cache status, errors
// In production, pipe to Datadog/CloudWatch/Sentry

const crypto = require("crypto");

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || "info"] || 1;

function generateRequestId() {
  return crypto.randomBytes(6).toString("hex");
}

function formatTimestamp() {
  return new Date().toISOString();
}

function log(level, message, data = {}) {
  if (LOG_LEVELS[level] < LOG_LEVEL) return;

  const entry = {
    timestamp: formatTimestamp(),
    level,
    message,
    ...data
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

// Request logging middleware for API handlers
function withRequestLogging(handler, endpoint = "unknown") {
  return async function (req, res) {
    const requestId = generateRequestId();
    const startTime = Date.now();

    // Attach request ID to request object
    req.requestId = requestId;

    // Log request
    log("info", `→ ${req.method} ${endpoint}`, {
      request_id: requestId,
      method: req.method,
      endpoint,
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      user_agent: (req.headers["user-agent"] || "").slice(0, 100),
      body_size: req.body ? JSON.stringify(req.body).length : 0
    });

    try {
      const result = await handler(req, res);
      const duration = Date.now() - startTime;

      log("debug", `← ${req.method} ${endpoint}`, {
        request_id: requestId,
        status: res.statusCode || 200,
        duration_ms: duration,
        cache: res.getHeader?.("X-Cache") || "N/A"
      });

      return result;
    } catch (err) {
      const duration = Date.now() - startTime;

      log("error", `✗ ${req.method} ${endpoint}`, {
        request_id: requestId,
        error: err.message,
        stack: err.stack?.split("\n").slice(0, 3).join(" | "),
        duration_ms: duration
      });

      throw err;
    }
  };
}

// Simple event logging (non-request)
function logEvent(event, data = {}) {
  log("info", event, data);
}

function logError(source, err, extra = {}) {
  log("error", `Error in ${source}: ${err.message}`, {
    source,
    error: err.message,
    stack: err.stack?.split("\n").slice(0, 5).join(" | "),
    ...extra
  });
}

module.exports = {
  log,
  logEvent,
  logError,
  withRequestLogging,
  generateRequestId,
  LOG_LEVELS
};
