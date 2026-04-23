function analyzeLink(url) {
  try {
    if (!url || typeof url !== "string") {
      return {
        version: "v3-step-amazon",
        error: true,
        message: "Invalid URL"
      };
    }

    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());

    let network = "Unknown";

    // 👉 Amazon 基础识别
    if (urlObj.hostname.includes("amazon.")) {
      network = "Amazon";
    }

    // 👉 简单 affiliate network 判断
    if (params.irclickid || params.irgwc) network = "Impact";
    if (params.awc) network = "Awin";
    if (params.cjevent) network = "CJ Affiliate";
    if (params.clickref) network = "Partnerize";

    return {
      version: "v3-step-amazon",
      analyzed_url: urlObj.toString(),
      hostname: urlObj.hostname,
      network,
      publisher_intelligence: {
        publisher: "Unknown",
        publisher_group: "",
        type: "Unknown",
        media_group: "Unknown",
        subtype: "Unknown",
        confidence: "Low",
        matched_by: "none"
      }
    };

  } catch (err) {
    return {
      version: "v3-step-amazon",
      error: true,
      message: err.message
    };
  }
}
