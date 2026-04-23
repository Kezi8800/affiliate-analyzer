const { detectPublisherFromGenericSignals } = require("./detect-publisher");

function analyzeLink(url) {
  try {
    if (!url || typeof url !== "string") {
      return {
        version: "v3-step-publisher",
        error: true,
        message: "Invalid URL"
      };
    }

    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());

    let network = "Unknown";

    if (urlObj.hostname.includes("amazon.")) network = "Amazon";
    if (params.irclickid || params.irgwc) network = "Impact";
    if (params.awc) network = "Awin";
    if (params.cjevent) network = "CJ Affiliate";
    if (params.clickref) network = "Partnerize";

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
      const detected = detectPublisherFromGenericSignals(params, urlObj.hostname);
      if (detected) {
        publisher_intelligence = detected;
      }
    } catch (e) {
      console.log("publisher detect error:", e.message);
    }

    return {
      version: "v3-step-publisher",
      analyzed_url: urlObj.toString(),
      hostname: urlObj.hostname,
      network,
      publisher_intelligence
    };

  } catch (err) {
    return {
      version: "v3-step-publisher",
      error: true,
      message: err.message
    };
  }
}

module.exports = { analyzeLink };
