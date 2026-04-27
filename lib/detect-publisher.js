// lib/detect-publisher.js
// BrandShuo Attribution Checker
// Stable Publisher Adapter v2.6 FIX

const publisherDB = require("./publisher-database");

/* =========================
   基础工具函数（给 analyze.js 用）
========================= */

function cleanHostname(hostname = "") {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function getQueryParams(urlObj) {
  if (!urlObj || !urlObj.searchParams) return {};
  const params = {};
  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

function getParam(params, key) {
  if (!params) return null;
  return params[key] || null;
}

function detectAffiliateNetwork(params = {}, hostname = "") {
  const host = cleanHostname(hostname);

  if (params.irclickid || params.irgwc) return "Impact";
  if (params.cjevent) return "CJ Affiliate";
  if (params.awc) return "Awin";
  if (params.clickref) return "Partnerize";
  if (params.ranMID) return "Rakuten";
  if (params.gclid || params.gbraid || params.wbraid) return "Google Ads";
  if (params.fbclid) return "Meta Ads";
  if (params.ttclid) return "TikTok Ads";
  if (params.msclkid) return "Microsoft Ads";

  if (host.includes("amazon")) return "Amazon";
  if (host.includes("walmart")) return "Walmart";

  return "Unknown";
}

/* =========================
   Publisher fallback 结构
========================= */

function fallbackPublisher(errorMessage = "") {
  return {
    matched: false,
    matchType: "none",
    publisher: "Unknown Publisher",
    group: "Unknown / Needs Verification",
    groupKey: "unknown_group",
    category: "unknown",
    trafficType: "Unknown",
    intent: "Unknown",
    role: "Unknown",
    quality: 40,
    confidence: "low",
    score: 0,
    reasons: [],
    notes: errorMessage || "No publisher detected."
  };
}

/* =========================
   主识别逻辑（你原有逻辑）
========================= */

function detectPublisherUniversal(input = {}) {
  try {
    if (publisherDB && typeof publisherDB.detectPublisherUniversal === "function") {
      return publisherDB.detectPublisherUniversal(input) || fallbackPublisher();
    }

    if (publisherDB && typeof publisherDB.detectPublisherByUrl === "function") {
      return publisherDB.detectPublisherByUrl(input.url || "") || fallbackPublisher();
    }

    return fallbackPublisher("publisher-database export missing.");
  } catch (err) {
    return fallbackPublisher(err.message);
  }
}

function detectPublisherByUrl(url) {
  return detectPublisherUniversal({ url });
}

function detectPublisherByAmazonParams(params = {}) {
  try {
    if (publisherDB && typeof publisherDB.detectPublisherByAmazonParams === "function") {
      return publisherDB.detectPublisherByAmazonParams(params) || fallbackPublisher();
    }

    return fallbackPublisher("detectPublisherByAmazonParams export missing.");
  } catch (err) {
    return fallbackPublisher(err.message);
  }
}

/* =========================
   🔥 核心：给 analyze.js 用的适配器
========================= */

function buildPublisherIntelligence(urlObj, options = {}) {
  try {
    const url = urlObj?.href || "";

    const result = detectPublisherUniversal({
      url,
      ...options
    });

    return {
      publisher: result.publisher || "Unknown",
      type: result.category || "Unknown",
      subtype: result.intent || "Unknown",
      media_group: result.group || "Unknown",
      matched_by: result.matchType || "Unknown",
      evidence: result.reasons || []
    };
  } catch (e) {
    return {
      publisher: "Unknown",
      type: "Unknown",
      subtype: "Unknown",
      media_group: "Unknown",
      matched_by: "error",
      evidence: e.message
    };
  }
}

/* =========================
   对外接口
========================= */

function detectPublisher(input) {
  if (typeof input === "string") {
    return detectPublisherByUrl(input);
  }
  return detectPublisherUniversal(input || {});
}

function safeDetectPublisher(input = {}) {
  return detectPublisher(input);
}

function getPublisherStats() {
  if (publisherDB && typeof publisherDB.getPublisherStats === "function") {
    return publisherDB.getPublisherStats();
  }

  return {
    totalRules: 0,
    error: "getPublisherStats export missing."
  };
}

/* =========================
   🚀 最终导出（关键）
========================= */

module.exports = {
  // 新 analyze.js 依赖
  buildPublisherIntelligence,
  cleanHostname,
  getQueryParams,
  getParam,
  detectAffiliateNetwork,

  // 兼容旧系统
  detectPublisher,
  safeDetectPublisher,
  detectPublisherByUrl,
  detectPublisherByAmazonParams,
  detectPublisherUniversal,
  getPublisherStats
};
