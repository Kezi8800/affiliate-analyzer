// 安全加载（防止 require 崩）
let detectPublisherFromGenericSignals = null;
let detectAmazonPublisherFromUrl = null;

try {
  ({ detectPublisherFromGenericSignals } = require("./detect-publisher"));
} catch (e) {
  console.log("detect-publisher load failed:", e.message);
}

try {
  ({ detectAmazonPublisherFromUrl } = require("./amazon-publisher-rules"));
} catch (e) {
  console.log("amazon rules load failed:", e.message);
}

function analyzeLink(url) {
  try {
    // 基础校验
    if (!url || typeof url !== "string") {
      return {
        version: "v3-safe",
        error: true,
        message: "Invalid URL"
      };
    }

    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      return {
        version: "v3-safe",
        error: true,
        message: "Invalid URL format"
      };
    }

    const params = Object.fromEntries(urlObj.searchParams.entries());

    // 默认结果
    let network = "Unknown";
    let publisher_intelligence = {
      publisher: "Unknown",
      type: "Unknown"
    };

    // 🟡 Generic Publisher（安全执行）
    try {
      if (detectPublisherFromGenericSignals) {
        const result = detectPublisherFromGenericSignals(params, urlObj.hostname);
        if (result) {
          publisher_intelligence = result;
        }
      }
    } catch (e) {
      console.log("generic detect error:", e.message);
    }

    // 🟡 Amazon（安全执行）
    try {
      if (detectAmazonPublisherFromUrl) {
        const amazonResult = detectAmazonPublisherFromUrl(url);
        if (amazonResult) {
          network = "Amazon";
          publisher_intelligence = amazonResult;
        }
      }
    } catch (e) {
      console.log("amazon detect error:", e.message);
    }

    return {
      version: "v3-safe",
      analyzed_url: urlObj.toString(),
      hostname: urlObj.hostname,
      network,
      publisher_intelligence
    };

  } catch (err) {
    // 🔴 永远不让函数 crash
    return {
      version: "v3-safe",
      error: true,
      message: err.message
    };
  }
}

module.exports = { analyzeLink };
