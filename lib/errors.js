// lib/errors.js
// BrandShuo — Structured Error Handling
// Consistent error responses across all API endpoints

const crypto = require("crypto");

const ERROR_CODES = {
  INVALID_URL: { status: 400, code: "INVALID_URL", message: "The provided URL is invalid or malformed" },
  MISSING_URL: { status: 400, code: "MISSING_URL", message: "URL parameter is required" },
  BATCH_TOO_LARGE: { status: 400, code: "BATCH_TOO_LARGE", message: "Batch exceeds maximum URL limit" },
  RATE_LIMITED: { status: 429, code: "RATE_LIMITED", message: "Rate limit exceeded" },
  API_KEY_INVALID: { status: 401, code: "API_KEY_INVALID", message: "Invalid or missing API key" },
  API_KEY_EXPIRED: { status: 401, code: "API_KEY_EXPIRED", message: "API key has expired or reached quota" },
  NOT_FOUND: { status: 404, code: "NOT_FOUND", message: "Resource not found" },
  METHOD_NOT_ALLOWED: { status: 405, code: "METHOD_NOT_ALLOWED", message: "HTTP method not allowed" },
  INTERNAL_ERROR: { status: 500, code: "INTERNAL_ERROR", message: "Internal server error" },
  ANALYSIS_FAILED: { status: 500, code: "ANALYSIS_FAILED", message: "Link analysis failed" }
};

function createError(errorCode, details = {}) {
  const template = ERROR_CODES[errorCode] || ERROR_CODES.INTERNAL_ERROR;
  const requestId = crypto.randomBytes(6).toString("hex");

  return {
    ok: false,
    error: true,
    code: template.code,
    message: details.message || template.message,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    ...details
  };
}

function createSuccess(data = {}) {
  return {
    ok: true,
    error: false,
    timestamp: new Date().toISOString(),
    version: "4.7.0",
    engine: "BrandShuo Attribution Intelligence Engine",
    ...data
  };
}

function sendError(res, errorCode, details = {}) {
  const error = createError(errorCode, details);
  const template = ERROR_CODES[errorCode] || ERROR_CODES.INTERNAL_ERROR;
  return res.status(template.status).json(error);
}

function sendSuccess(res, data = {}) {
  return res.status(200).json(createSuccess(data));
}

module.exports = {
  ERROR_CODES,
  createError,
  createSuccess,
  sendError,
  sendSuccess
};
