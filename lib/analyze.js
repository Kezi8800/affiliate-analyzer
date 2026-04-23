const {
  buildPublisherIntelligence,
  cleanHostname,
  getQueryParams,
  getParam,
  detectAffiliateNetwork
} = require("./detect-publisher");
const { buildQualityIntentProfile } = require("./quality-intent-engine");
const { buildPathLabel } = require("./path-label-engine");

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
  const finalSubtype = publisherIntel.subtype || "Unknown";

  const qualityIntent = buildQualityIntentProfile({
    attribution_system,
    publisher_type: finalPublisherType,
    subtype: finalSubtype,
    params
  });

  const pathInfo = buildPathLabel({
    network: attribution_system,
    attribution_system,
    likely_type: attribution_system,
    merchant,
    publisher: finalPublisher,
    publisher_type: finalPublisherType
  });

  return {
    engine: "Attribution Layer Engine v2 + Publisher Intelligence v2.1 + Quality & Intent Engine v2 + Path Label Engine v1",
    merchant,
    likely_type: attribution_system,
    attribution_system,
    primary_claimer,
    publisher: finalPublisher,
    publisher_type: finalPublisherType,
    traffic_type: qualityIntent.traffic_type,
    commercial_intent: qualityIntent.commercial_intent,
    traffic_quality: qualityIntent.traffic_quality,
    incrementality_risk: qualityIntent.incrementality_risk,
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
    path_classification: pathInfo,
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

function detectGenericNetworkResult(urlObj) {
  const params = getQueryParams(urlObj);
  const hostname = cleanHostname(urlObj.hostname || "");
  const network = detectAffiliateNetwork(params, hostname);

  if (network === "Unknown") return null;

  const publisherIntel = buildPublisherIntelligence(urlObj, {});
  const publisher = publisherIntel.publisher || "Unknown";

  const likelyType =
    network === "Google Ads" ||
    network === "Meta Ads" ||
    network === "TikTok Ads" ||
    network === "Microsoft Ads"
      ? "Paid Media"
      : "Affiliate";

  const primaryClaimer =
    likelyType === "Paid Media"
      ? "Advertiser / Brand"
      : (publisher !== "Unknown" ? publisher : `${network} Publisher`);

  const qualityIntent = buildQualityIntentProfile({
    attribution_system: network,
    publisher_type: publisherIntel.type || "Affiliate Publisher",
    subtype: publisherIntel.subtype || "General Affiliate",
    params
  });

  const pathInfo = buildPathLabel({
    network,
    attribution_system: network,
    likely_type: likelyType,
    merchant: "Merchant",
    publisher,
    publisher_type: publisherIntel.type || "Affiliate Publisher"
  });

  return {
    network,
    likely_type: likelyType,
    final_verdict: {
      likely_type: likelyType,
      primary_claimer: primaryClaimer,
      publisher,
      confidence: publisher !== "Unknown" ? "Medium" : "Low",
      conflict_risk: "Medium",
      channel_role: likelyType === "Paid Media" ? "Traffic Driver" : "Closer"
    },
    publisher_intelligence: publisherIntel,
    quality_and_intent: qualityIntent,
    path_classification: pathInfo
  };
}

function analyzeLink(url) {
  if (!url || typeof url !== "string") {
    return {
      version: "v2.1",
      error: true,
      message: "Invalid URL"
    };
  }

  const trimmedUrl = url.trim();
  const urlObj = safeUrlParse(trimmedUrl);

  if (!urlObj) {
    return {
      version: "v2.1",
      error: true,
      message: "Invalid URL format"
    };
  }

  const hostname = cleanHostname(urlObj.hostname || "");

  if (isAmazonHost(hostname)) {
    const amazonLayer = buildAmazonAttributionLayer(urlObj);

    return {
      version: "v2.1",
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
        publisher_type: amazonLayer.publisher_type
      },

      quality_and_intent: {
        traffic_quality: amazonLayer.traffic_quality,
        commercial_intent: amazonLayer.commercial_intent,
        traffic_type: amazonLayer.traffic_type,
        incrementality_risk: amazonLayer.incrementality_risk
      },

      publisher_intelligence: {
        publisher: amazonLayer.publisher_intelligence.publisher,
        type: amazonLayer.publisher_intelligence.type,
        media_group: amazonLayer.publisher_intelligence.media_group,
        subtype: amazonLayer.publisher_intelligence.subtype,
        matched_by: amazonLayer.publisher_intelligence.matched_by,
        evidence: amazonLayer.publisher_intelligence.evidence
      },

      path_classification: amazonLayer.path_classification,
      evidence: amazonLayer.evidence,
      engine: amazonLayer.engine,
      explanation: [
        `Merchant detected: ${amazonLayer.merchant}`,
        `Attribution system detected: ${amazonLayer.attribution_system}`,
        `Primary claimer resolved to: ${amazonLayer.primary_claimer}`,
        `Publisher identified as: ${amazonLayer.publisher}`,
        `Publisher type classified as: ${amazonLayer.publisher_type}`,
        `Traffic type classified as: ${amazonLayer.traffic_type}`,
        `Path label classified as: ${amazonLayer.path_classification.path_label}`
      ]
    };
  }

  const genericResult = detectGenericNetworkResult(urlObj);
  if (genericResult) {
    return {
      version: "v2.1",
      analyzed_url: trimmedUrl,
      hostname,
      network: genericResult.network,
      likely_type: genericResult.likely_type,
      final_verdict: genericResult.final_verdict,
      publisher_intelligence: genericResult.publisher_intelligence,
      quality_and_intent: genericResult.quality_and_intent,
      path_classification: genericResult.path_classification
    };
  }

  return {
    version: "v2.1",
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
    path_classification: {
      path_label: "Unknown Path - Orders",
      path_group: "Unknown Order Path",
      path_nodes: ["Unknown", "Unknown", "Orders"]
    },
    explanation: [
      "No strong affiliate, attribution, or paid-media ownership signals were detected."
    ]
  };
}

module.exports = {
  analyzeLink
};
