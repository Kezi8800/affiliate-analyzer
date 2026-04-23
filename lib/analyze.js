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

function analyzeLink(url) {
  try {
    if (!url || typeof url !== "string") {
      return {
        version: "v3-debug",
        error: true,
        message: "Invalid URL"
      };
    }

    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      return {
        version: "v3-debug",
        error: true,
        message: "Invalid URL format"
      };
    }

    const params = normalizeParams(urlObj.searchParams);
    const network = detectNetwork(urlObj.hostname, params);

    let publisher_intelligence = {
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

    try {
      const detected = detectPublisherFromGenericSignals(params, urlObj.hostname);
      if (detected && typeof detected === "object") {
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
        publisher: "Unknown",
        publisher_group: "",
        type: "Unknown",
        media_group: "Unknown",
        subtype: "Unknown",
        traffic_type: "Unknown",
        channel_role: "Unknown",
        incrementality_risk: "Medium",
        confidence: "Low",
        matched_by: "detect_publisher_runtime_error",
        evidence: {
          error: e.message
        }
      };
    }

    return {
      version: "v3-debug",
      analyzed_url: urlObj.toString(),
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      network,
      params,
      final_verdict: {
        primary_claimer: network,
        likely_closer: network,
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
      version: "v3-debug",
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
