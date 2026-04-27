// lib/detect-publisher.js
// BrandShuo Attribution Checker
// Publisher Detection Adapter v2.5 FIX

const {
  detectPublisherByUrl,
  detectPublisherByAmazonParams,
  detectPublisherUniversal,
  getPublisherStats
} = require("./publisher-database");

function safeDetectPublisher(input = {}) {
  try {
    const url = input.url || input.inputUrl || "";
    const params = input.params || {};

    const result = detectPublisherUniversal({
      url,
      inputUrl: url,
      params
    });

    return result || {
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
      notes: "No publisher detected."
    };
  } catch (error) {
    return {
      matched: false,
      matchType: "error",
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
      error: true,
      message: error.message || "Publisher detection failed."
    };
  }
}

function detectPublisher(urlOrInput) {
  if (typeof urlOrInput === "string") {
    return safeDetectPublisher({ url: urlOrInput });
  }

  return safeDetectPublisher(urlOrInput || {});
}

module.exports = {
  detectPublisher,
  safeDetectPublisher,

  // 保留兼容导出，避免 analyze.js 老代码继续报错
  detectPublisherByUrl,
  detectPublisherByAmazonParams,
  detectPublisherUniversal,
  getPublisherStats
};
