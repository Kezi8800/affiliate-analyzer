// api/v1/analyze.js — Versioned API endpoint
// Redirects to main analyze with v1 guaranteed response format

const handler = require("../../api/analyze");

// v1 wrapper — ensures stable response format
module.exports = async function v1Handler(req, res) {
  // Intercept and normalize to v1 format
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    // Ensure v1 fields exist even if main handler changes
    const v1Data = {
      ok: data.ok ?? true,
      error: data.error ?? false,
      version: "v1",
      engine: "BrandShuo Attribution Intelligence Engine",

      // Core fields (guaranteed)
      url: data.analyzed_url || data.input || "",
      platform: data.platform || "--",
      network: data.network || "--",
      publisher: data.publisher_label || data.publisher || data.publisher_name || "--",
      publisher_id: data.publisher_id || null,
      quality_score: data.quality_score || data.traffic_quality || 0,
      risk: data.incrementality_risk || data.risk || "--",
      confidence: data.confidence || "--",

      // Full data (pass-through for advanced users)
      ...data,
    };
    return originalJson(v1Data);
  };
  return handler(req, res);
};
