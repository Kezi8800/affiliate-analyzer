const { detectPublisherFromGenericSignals } = require("./detect-publisher");

function normalizeParams(searchParams) {
  const raw = Object.fromEntries(searchParams.entries());
  const normalized = {};

  for (const key in raw) {
    normalized[String(key).toLowerCase()] = raw[key];
  }

  return normalized;
}

function detectNetwork(hostname = "", params = {}) {
  const host = String(hostname || "").toLowerCase();

  if (host.includes("amazon.")) return "Amazon";
  if (params.irclickid || params.irgwc) return "Impact";
  if (params.awc) return "Awin";
  if (params.cjevent) return "CJ Affiliate";
  if (params.clickref) return "Partnerize";
  if (params.gclid || params.gbraid || params.wbraid) return "Google Ads";
  if (params.fbclid) return "Meta Ads";
  if (params.ttclid) return "TikTok Ads";
  if (params.msclkid) return "Microsoft Ads";

  return "Unknown";
}

function buildUnknownPublisher() {
  return {
    publisher: "Unknown",
    publisher_group: "",
    type: "Unknown",
    media_group: "Unknown",
    subtype: "Unknown",
    traffic_type: "Unknown",
    channel_role: "Unknown",
    incrementality_risk: "Medium",
    confidence: "Low",
    matched_by: "none",
    evidence: null
  };
}

function detectAmazonPublisherFallback(params = {}) {
  const tag = String(params.tag || "").toLowerCase().trim();

  if (!tag) return null;

  const rules = [
    {
      test: /cnet/,
      result: {
        publisher: "CNET",
        publisher_group: "",
        type: "Review Media",
        media_group: "Commerce Editorial",
        subtype: "Tech Reviews",
        traffic_type: "Review / Consideration",
        channel_role: "Mid-funnel Influencer",
        incrementality_risk: "Medium"
      }
    },
    {
      test: /tomsguide/,
      result: {
        publisher: "Tom's Guide",
        publisher_group: "Future Publishing",
        type: "Review Media",
        media_group: "Commerce Editorial",
        subtype: "Tech Reviews",
        traffic_type: "Review / Consideration",
        channel_role: "Mid-funnel Influencer",
        incrementality_risk: "Medium"
      }
    },
    {
      test: /techradar/,
      result: {
        publisher: "TechRadar",
        publisher_group: "Future Publishing",
        type: "Review Media",
        media_group: "Commerce Editorial",
        subtype: "Tech Reviews",
        traffic_type: "Review / Consideration",
        channel_role: "Mid-funnel Influencer",
        incrementality_risk: "Medium"
      }
    },
    {
      test: /pcmag/,
      result: {
        publisher: "PCMag",
        publisher_group: "Ziff Davis",
        type: "Review Media",
        media_group: "Commerce Editorial",
        subtype: "Tech Reviews",
        traffic_type: "Review / Consideration",
        channel_role: "Mid-funnel Influencer",
        incrementality_risk: "Medium"
      }
    },
    {
      test: /wirecutter/,
      result: {
        publisher: "Wirecutter",
        publisher_group: "The New York Times",
        type: "Review Media",
        media_group: "Commerce Editorial",
        subtype: "Product Reviews",
        traffic_type: "Review / Consideration",
        channel_role: "Mid-funnel Influencer",
        incrementality_risk: "Medium"
      }
    },
    {
      test: /reviewed/,
      result: {
        publisher: "Reviewed",
        publisher_group: "Gannett",
        type: "Review Media",
        media_group: "Commerce Editorial",
        subtype: "Product Reviews",
        traffic_type: "Review / Consideration",
        channel_role: "Mid-funnel Influencer",
        incrementality_risk: "Medium"
      }
    },
    {
      test: /slickdeals/,
      result: {
        publisher: "Slickdeals",
        publisher_group: "Slickdeals",
        type: "Deal Community",
        media_group: "Coupons & Deals",
        subtype: "Forum Deal",
        traffic_type: "Coupon / Deal",
        channel_role: "Closer",
        incrementality_risk: "High"
      }
    },
    {
      test: /dealnews/,
      result: {
        publisher: "DealNews",
        publisher_group: "DealNews",
        type: "Deal Publisher",
        media_group: "Coupons & Deals",
        subtype: "Editorial Deal",
        traffic_type: "Coupon / Deal",
        channel_role: "Closer",
        incrementality_risk: "High"
      }
    }
  ];

  for (const rule of rules) {
    if (rule.test.test(tag)) {
      return {
        ...rule.result,
        confidence: "High",
        matched_by: "amazon_tag_fallback",
        evidence: {
          field: "tag",
          raw_value: tag,
          matched_value: tag,
          matcher: rule.test.toString()
        }
      };
    }
  }

  return {
    publisher: tag.split("-")[0] || "Unknown",
    publisher_group: "",
    type: "Unknown",
    media_group: "Unknown",
    subtype: "Unknown",
    traffic_type: "Unknown",
    channel_role: "Unknown",
    incrementality_risk: "Medium",
    confidence: "Medium",
    matched_by: "amazon_tag_fallback_generic",
    evidence: {
      field: "tag",
      raw_value: tag,
      matched_value: tag.split("-")[0] || tag,
      matcher: "generic-tag-prefix"
    }
  };
}

function analyzeLink(url) {
  try {
    if (!url || typeof url !== "string") {
      return {
        version: "v3-debug-amazon-fallback",
        error: true,
        message: "Invalid URL"
      };
    }

    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      return {
        version: "v3-debug-amazon-fallback",
        error: true,
        message: "Invalid URL format"
      };
    }

    const params = normalizeParams(urlObj.searchParams);
    const network = detectNetwork(urlObj.hostname, params);

    let publisher_intelligence = buildUnknownPublisher();

    try {
      const detected = detectPublisherFromGenericSignals(params, urlObj.hostname);
      if (detected && typeof detected === "object" && detected.publisher && detected.publisher !== "Unknown") {
        publisher_intelligence = {
          publisher: detected.publisher || "Unknown",
          publisher_group: detected.publisher_group || "",
          type: detected.type || "Unknown",
          media_group: detected.media_group || "Unknown",
          subtype: detected.subtype || "Unknown",
          traffic_type: detected.traffic_type || "Unknown",
          channel_role: detected.channel_role || "Unknown",
          incrementality_risk: detected.incrementality_risk || "Medium",
          confidence: detected.confidence || "Low",
          matched_by: detected.matched_by || "none",
          evidence: detected.evidence || null
        };
      }
    } catch (e) {
      publisher_intelligence = {
        ...buildUnknownPublisher(),
        matched_by: "detect_publisher_runtime_error",
        evidence: { error: e.message }
      };
    }

    if (
      publisher_intelligence.publisher === "Unknown" &&
      String(urlObj.hostname || "").toLowerCase().includes("amazon.") &&
      params.tag
    ) {
      const amazonFallback = detectAmazonPublisherFallback(params);
      if (amazonFallback) {
        publisher_intelligence = amazonFallback;
      }
    }

    return {
      version: "v3-debug-amazon-fallback",
      analyzed_url: urlObj.toString(),
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      network,
      params,
      final_verdict: {
        primary_claimer: network,
        likely_closer: publisher_intelligence.channel_role === "Closer"
          ? publisher_intelligence.publisher
          : network,
        true_influence_leader:
          publisher_intelligence.publisher !== "Unknown"
            ? publisher_intelligence.publisher
            : "Unknown",
        path_archetype: network !== "Unknown" ? network : "Single-layer path",
        confidence: publisher_intelligence.confidence || "Low"
      },
      publisher_intelligence,
      traffic_quality_intelligence: {
        quality_score: 50,
        quality_tier: "Medium",
        reasons: []
      },
      commercial_intelligence: {
        traffic_type: publisher_intelligence.traffic_type || "Unknown",
        intent_level: "Medium",
        channel_role: publisher_intelligence.channel_role || "Unknown",
        incrementality_risk: publisher_intelligence.incrementality_risk || "Medium",
        commercial_intent_score: 50,
        intent_band: "Medium",
        reasons: []
      },
      attribution_conflict_intelligence: {
        conflict_layers: [],
        conflict_count: 0,
        conflict_risk_score: 0,
        conflict_risk_level: "Low"
      },
      merchant_intelligence: {
        merchant: urlObj.hostname,
        merchant_type: hostIsMarketplace(urlObj.hostname) ? "Marketplace" : "DTC / Retail",
        retail_mapping: urlObj.pathname || "/"
      }
    };
  } catch (err) {
    return {
      version: "v3-debug-amazon-fallback",
      error: true,
      message: err.message
    };
  }
}

function hostIsMarketplace(hostname = "") {
  const host = String(hostname || "").toLowerCase();
  return host.includes("amazon.") || host.includes("walmart.") || host.includes("ebay.");
}

module.exports = { analyzeLink };
