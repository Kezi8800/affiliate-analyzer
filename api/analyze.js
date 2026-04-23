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

    let network = "Unknown";
    let publisher_intelligence = {
      publisher: "Unknown",
      publisher_group: "",
      type: "Unknown",
      media_group: "Unknown",
      subtype: "Unknown",
      confidence: "Low",
      matched_by: "none"
    };

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

    try {
      if (urlObj.hostname.includes("amazon.") && detectAmazonPublisherFromUrl) {
        const amazonResult = detectAmazonPublisherFromUrl(url);
        if (amazonResult && typeof amazonResult === "object") {
          network = "Amazon";
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
    return {
      version: "v3-safe",
      error: true,
      message: err.message
    };
  }
}

module.exports = { analyzeLink };
