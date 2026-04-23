const {
  buildPublisherIntelligence,
  cleanHostname,
  getQueryParams,
  getParam
} = require("./detect-publisher");

function safeUrlParse(input) {
  try {
    return new URL(input);
  } catch (e) {
    return null;
  }
}

function hasAnyParam(params, keys) {
  return keys.some((k) => !!getParam(params, k));
}

function isAmazonHost(hostname) {
  return cleanHostname(hostname).includes("amazon.");
}

function detectAmazonAttributionSystem(params) {
  const hasTag = !!getParam(params, "tag");

  const hasAccSignals =
    hasAnyParam(params, ["campaignId", "linkId"]) ||
    getParam(params, "linkCode") === "tr1";

  const hasAttributionSignals =
    hasAnyParam(params, [
      "maas",
      "aa_campaignid",
      "aa_adgroupid",
      "aa_creativeid"
    ]) ||
    String(getParam(params, "ref_") || "").includes("aa_maas");

  if (hasAccSignals) return "Amazon Creator Connections";
  if (hasAttributionSignals) return "Amazon Attribution";
  if (hasTag) return "Amazon Associates";
  return "Amazon";
}

function detectCommercialIntent({ publisher_type, params }) {
  const allText = Object.keys(params || {})
    .concat(Object.values(params || {}))
    .join(" ")
    .toLowerCase();

  if (
    publisher_type === "Deal Site" ||
    publisher_type === "Deal Community" ||
    allText.includes("deal") ||
    allText.includes("coupon") ||
    allText.includes("sale")
  ) {
    return "High";
  }

  if (
    publisher_type === "Editorial Review" ||
    publisher_type === "Creator / Influencer"
  ) {
    return "Medium";
  }

  return "Medium";
}

function detectChannelRole({ attribution_system, publisher_type }) {
  if (
    attribution_system === "Amazon Associates" &&
    (publisher_type === "Deal Site" || publisher_type === "Deal Community")
  ) {
    return "Closer";
  }

  if (publisher_type === "Editorial Review") {
    return "Mid-Funnel Influencer";
  }

  if (publisher_type === "Creator / Influencer") {
    return "Influencer";
  }

  if (attribution_system === "Amazon Attribution") {
    return "Traffic Driver";
  }

  return "Closer";
}

function detectConflictRisk({ attribution_system, publisher_type, params }) {
  const hasSubtag = !!getParam(params, "ascsubtag");
  const hasPaidSignals = hasAnyParam(params, [
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
    "ttclid",
    "msclkid"
  ]);

  if (attribution_system === "Amazon Attribution") {
    return "Medium";
  }

  if (
    attribution_system === "Amazon Associates" &&
    (publisher_type === "Deal Site" || publisher_type === "Deal Community") &&
    hasSubtag
  ) {
    return "Low";
  }

  if (hasPaidSignals) {
    return "Medium";
  }

  return "Low";
}

function detectConfidence({ attribution_system, publisher, params }) {
  if (
    attribution_system === "Amazon Associates" &&
    publisher &&
    publisher !== "Unknown" &&
    getParam(params, "tag")
  ) {
    return "High";
  }

  if (
    attribution_system === "Amazon Creator Connections" &&
    (getParam(params, "campaignId") || getParam(params, "linkId"))
  ) {
    return "High";
  }

  if (
    attribution_system === "Amazon Attribution" &&
    (getParam(params, "maas") || getParam(params, "aa_campaignid"))
  ) {
    return "High";
  }

  return "Medium";
}

function resolvePrimaryClaimer({ attribution_system, publisher, merchant }) {
  if (
    attribution_system === "Amazon Associates" ||
    attribution_system === "Amazon Creator Connections"
  ) {
    return publisher && publisher !== "Unknown" ? publisher : attribution_system;
  }

  if (attribution_system === "Amazon Attribution") {
    return "Advertiser / Brand";
  }

  return merchant || "Amazon";
}

function buildAmazonAttributionLayer(urlObj) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const params = getQueryParams(urlObj);

  const merchant = "Amazon";
  const attribution_system = detectAmazonAttributionSystem(params);

  const initialPublisherIntel = buildPublisherIntelligence(urlObj, {});
  let publisher = initialPublisherIntel.publisher || "Unknown";
  let publisher_type = initialPublisherIntel.type || "Unknown";

  if (attribution_system === "Amazon Creator Connections" && publisher === "Unknown") {
    publisher = "Creator / Publisher";
    publisher_type = "Creator / Influencer";
  }

  if (attribution_system === "Amazon Attribution" && publisher === "Unknown") {
    publisher = "Brand / Advertiser";
    publisher_type = "Advertiser";
  }

  const primary_claimer = resolvePrimaryClaimer({
    attribution_system,
    publisher,
    merchant
  });

  if ((!publisher || publisher === "Unknown") && primary_claimer && primary_claimer !== "Unknown") {
    publisher = primary_claimer;
  }

  const publisherIntel = buildPublisherIntelligence(urlObj, {
    primary_claimer,
    publisher_hint: publisher
  });

  const finalPublisher = publisherIntel.publisher || publisher || "Unknown";
  const finalPublisherType = publisherIntel.type || publisher_type || "Unknown";

  return {
    engine: "Attribution Layer Engine v2 + Publisher Intelligence v2",
    merchant,
    likely_type: attribution_system,
    attribution_system,
    primary_claimer,
    publisher: finalPublisher,
    publisher_type: finalPublisherType,
    commercial_intent: detectCommercialIntent({
      publisher_type: finalPublisherType,
      params
    }),
    channel_role: detectChannelRole({
      attribution_system,
      publisher_type: finalPublisherType
    }),
    conflict_risk: detectConflictRisk({
      attribution_system,
      publisher_type: finalPublisherType,
      params
    }),
    confidence: detectConfidence({
      attribution_system,
      publisher: finalPublisher,
      params
    }),
    publisher_intelligence: publisherIntel,
    evidence: {
      tag: getParam(params, "tag") || null,
      ascsubtag: getParam(params, "ascsubtag") || null,
      campaignId: getParam(params, "campaignId") || null,
      linkId: getParam(params, "linkId") || null,
      linkCode: getParam(params, "linkCode") || null,
      aa_campaignid: getParam(params, "aa_campaignid") || null,
      aa_adgroupid: getParam(params, "aa_adgroupid") || null,
      aa_creativeid: getParam(params, "aa_creativeid") || null,
      maas: getParam(params, "maas") || null,
      ref_: getParam(params, "ref_") || null,
      camp: getParam(params, "camp") || null,
      creative: getParam(params, "creative") || null
    }
  };
}

function detectGenericNetwork(urlObj) {
  const params = getQueryParams(urlObj);

  if (getParam(params, "irclickid")) {
    return {
      network: "Impact",
      likely_type: "Affiliate",
      final_verdict: {
        likely_type: "Affiliate",
        primary_claimer: "Affiliate Publisher",
        publisher: "Unknown",
        confidence: "Medium",
        conflict_risk: "Medium",
        channel_role: "Closer"
      }
    };
  }

  if (getParam(params, "awc")) {
    return {
      network: "Awin",
      likely_type: "Affiliate",
      final_verdict: {
        likely_type: "Affiliate",
        primary_claimer: "Affiliate Publisher",
        publisher: "Unknown",
        confidence: "Medium",
        conflict_risk: "Medium",
        channel_role: "Closer"
      }
    };
  }

  if (getParam(params, "cjevent")) {
    return {
      network: "CJ Affiliate",
      likely_type: "Affiliate",
      final_verdict: {
        likely_type: "Affiliate",
        primary_claimer: "Affiliate Publisher",
        publisher: "Unknown",
        confidence: "Medium",
        conflict_risk: "Medium",
        channel_role: "Closer"
      }
    };
  }

  if (
    getParam(params, "gclid") ||
    getParam(params, "gbraid") ||
    getParam(params, "wbraid")
  ) {
    return {
      network: "Google Ads",
      likely_type: "Paid Media",
      final_verdict: {
        likely_type: "Paid Media",
        primary_claimer: "Advertiser / Brand",
        publisher: "Google",
        confidence: "Medium",
        conflict_risk: "Medium",
        channel_role: "Traffic Driver"
      }
    };
  }

  if (getParam(params, "fbclid")) {
    return {
      network: "Meta Ads",
      likely_type: "Paid Media",
      final_verdict: {
        likely_type: "Paid Media",
        primary_claimer: "Advertiser / Brand",
        publisher: "Meta",
        confidence: "Medium",
        conflict_risk: "Medium",
        channel_role: "Traffic Driver"
      }
    };
  }

  return null;
}

function analyzeLink(url) {
  if (!url || typeof url !== "string") {
    return {
      version: "v1.7",
      error: true,
      message: "Invalid URL"
    };
  }

  const trimmedUrl = url.trim();
  const urlObj = safeUrlParse(trimmedUrl);

  if (!urlObj) {
    return {
      version: "v1.7",
      error: true,
      message: "Invalid URL format"
    };
  }

  const hostname = cleanHostname(urlObj.hostname || "");

  if (isAmazonHost(hostname)) {
    const amazonLayer = buildAmazonAttributionLayer(urlObj);

    return {
      version: "v1.7",
      analyzed_url: trimmedUrl,
      hostname,
      network: amazonLayer.attribution_system,
      likely_type: amazonLayer.likely_type,

      final_verdict: {
        likely_type: amazonLayer.likely_type,
        primary_claimer: amazonLayer.primary_claimer,
        publisher: amazonLayer.publisher,
        confidence: amazonLayer.confidence,
        conflict_risk: amazonLayer.conflict_risk,
        channel_role: amazonLayer.channel_role
      },

      attribution_layer: {
        merchant: amazonLayer.merchant,
        attribution_system: amazonLayer.attribution_system,
        primary_claimer: amazonLayer.primary_claimer,
        publisher: amazonLayer.publisher,
        publisher_type: amazonLayer.publisher_type,
        commercial_intent: amazonLayer.commercial_intent
      },

      publisher_intelligence: {
        publisher: amazonLayer.publisher_intelligence.publisher,
        type: amazonLayer.publisher_intelligence.type,
        media_group: amazonLayer.publisher_intelligence.media_group,
        subtype: amazonLayer.publisher_intelligence.subtype,
        matched_by: amazonLayer.publisher_intelligence.matched_by,
        evidence: amazonLayer.publisher_intelligence.evidence
      },

      evidence: amazonLayer.evidence,
      engine: amazonLayer.engine,
      explanation: [
        `Merchant detected: ${amazonLayer.merchant}`,
        `Attribution system detected: ${amazonLayer.attribution_system}`,
        `Primary claimer resolved to: ${amazonLayer.primary_claimer}`,
        `Publisher identified as: ${amazonLayer.publisher}`,
        `Publisher type classified as: ${amazonLayer.publisher_type}`
      ]
    };
  }

  const genericResult = detectGenericNetwork(urlObj);
  if (genericResult) {
    return {
      version: "v1.7",
      analyzed_url: trimmedUrl,
      hostname,
      network: genericResult.network,
      likely_type: genericResult.likely_type,
      final_verdict: genericResult.final_verdict
    };
  }

  return {
    version: "v1.7",
    analyzed_url: trimmedUrl,
    hostname,
    network: "Unknown",
    likely_type: "Unknown",
    final_verdict: {
      likely_type: "Unknown",
      primary_claimer: "Unknown",
      publisher: "Unknown",
      confidence: "Low",
      conflict_risk: "Unknown",
      channel_role: "Unknown"
    },
    explanation: [
      "No strong affiliate, attribution, or paid-media ownership signals were detected."
    ]
  };
}

module.exports = {
  analyzeLink
};
