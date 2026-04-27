// lib/detect-publisher.js
// BrandShuo Attribution Checker
// Stable Publisher Adapter v2.5.1

const publisherDB = require("./publisher-database");

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

function detectPublisherUniversal(input = {}) {
  try {
    if (typeof publisherDB.detectPublisherUniversal === "function") {
      return publisherDB.detectPublisherUniversal(input) || fallbackPublisher();
    }

    if (typeof publisherDB.detectPublisherByUrl === "function") {
      return publisherDB.detectPublisherByUrl(input.url || input.inputUrl || "") || fallbackPublisher();
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
    if (typeof publisherDB.detectPublisherByAmazonParams === "function") {
      return publisherDB.detectPublisherByAmazonParams(params) || fallbackPublisher();
    }

    return fallbackPublisher("detectPublisherByAmazonParams export missing.");
  } catch (err) {
    return fallbackPublisher(err.message);
  }
}

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
  if (typeof publisherDB.getPublisherStats === "function") {
    return publisherDB.getPublisherStats();
  }

  return {
    totalRules: 0,
    error: "getPublisherStats export missing."
  };
}

module.exports = {
  detectPublisher,
  safeDetectPublisher,
  detectPublisherByUrl,
  detectPublisherByAmazonParams,
  detectPublisherUniversal,
  getPublisherStats
};
