function safeDecode(value) {
  try {
    return decodeURIComponent(value || "");
  } catch (e) {
    return value || "";
  }
}

function safeUrlParse(input) {
  try {
    return new URL(input);
  } catch (e) {
    return null;
  }
}

function getQueryParams(urlObj) {
  const params = {};
  if (!urlObj || !urlObj.searchParams) return params;

  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value;
  }

  return params;
}

function getParam(params, key) {
  return params && Object.prototype.hasOwnProperty.call(params, key)
    ? params[key]
    : "";
}

function hasAnyParam(params, keys) {
  return keys.some((k) => !!getParam(params, k));
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanHostname(hostname) {
  return String(hostname || "")
    .toLowerCase()
    .replace(/^www\./, "");
}

/* -------------------------------------------------------
 * Publisher Rules
 * ----------------------------------------------------- */

const AMAZON_TAG_PUBLISHER_MAP = {
  "dealnewscom": {
    publisher: "DealNews",
    publisher_type: "Deal Site"
  },
  "slickdeals09-20": {
    publisher: "Slickdeals",
    publisher_type: "Deal Community"
  },
  "cnetcommerce": {
    publisher: "CNET",
    publisher_type: "Editorial Review"
  },
  "mattressnrd": {
    publisher: "Mattress Nerd",
    publisher_type: "Editorial Review"
  },
  "amazondealclubs-20": {
    publisher: "Amazon Deal Clubs",
    publisher_type: "Deal Site"
  },
  "bdgeek-20": {
    publisher: "BD Geek",
    publisher_type: "Affiliate Publisher"
  }
};

function inferPublisherTypeFromTag(tag) {
  const value = normalizeText(tag);

  if (!value) return "Unknown";

  if (
    value.includes("deal") ||
    value.includes("coupon") ||
    value.includes("bargain") ||
    value.includes("promo")
  ) {
    return "Deal Site";
  }

  if (
    value.includes("review") ||
    value.includes("guide") ||
    value.includes("nerd") ||
    value.includes("lab") ||
    value.includes("insider") ||
    value.includes("cnet")
  ) {
    return "Editorial Review";
  }

  if (
    value.includes("creator") ||
    value.includes("influencer") ||
    value.includes("youtube") ||
    value.includes("tiktok") ||
    value.includes("insta")
  ) {
    return "Creator / Influencer";
  }

  return "Affiliate Publisher";
}

function titleCaseFallback(str) {
  return String(str || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

function inferPublisherFromAmazonTag(tag) {
  const normalized = normalizeText(tag);

  if (!normalized) {
    return {
      publisher: "Unknown",
      publisher_type: "Unknown"
    };
  }

  if (AMAZON_TAG_PUBLISHER_MAP[normalized]) {
    return AMAZON_TAG_PUBLISHER_MAP[normalized];
  }

  const cleaned = normalized.replace(/-20$|-21$|-22$|-23$|-24$|-25$/, "");

  return {
    publisher: titleCaseFallback(cleaned),
    publisher_type: inferPublisherTypeFromTag(normalized)
  };
}

/* -------------------------------------------------------
 * Amazon Detection
 * ----------------------------------------------------- */

function isAmazonHost(hostname) {
  const host = cleanHostname(hostname);
  return host.includes("amazon.");
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

  if (hasAccSignals) {
    return "Amazon Creator Connections";
  }

  if (hasAttributionSignals) {
    return "Amazon Attribution";
  }

  if (hasTag) {
    return "Amazon Associates";
  }

  return "Amazon";
}

function detectAmazonMerchant(hostname) {
  if (isAmazonHost(hostname)) return "Amazon";
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
    allText.includes("coupon") ||
    allText.includes("deal") ||
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

function resolvePrimaryClaimer({
  attribution_system,
  publisher,
  merchant
}) {
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

  const merchant = detectAmazonMerchant(hostname);
  const attribution_system = detectAmazonAttributionSystem(params);

  const tag = getParam(params, "tag");
  const publisherInfo = inferPublisherFromAmazonTag(tag);

  let publisher = publisherInfo.publisher;
  let publisher_type = publisherInfo.publisher_type;

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

  const commercial_intent = detectCommercialIntent({
    publisher_type,
    params
  });

  const channel_role = detectChannelRole({
    attribution_system,
    publisher_type
  });

  const conflict_risk = detectConflictRisk({
    attribution_system,
    publisher_type,
    params
  });

  const confidence = detectConfidence({
    attribution_system,
    publisher,
    params
  });

  return {
    engine: "Attribution Layer Engine v2",
    merchant,
    likely_type: "Amazon",
    attribution_system,
    primary_claimer,
    publisher,
    publisher_type,
    commercial_intent,
    channel_role,
    conflict_risk,
    confidence,
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

/* -------------------------------------------------------
 * Generic Affiliate / Ad Network Detection
 * ----------------------------------------------------- */

function detectGenericNetwork(urlObj) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const params = getQueryParams(urlObj);

  if (hostname.includes("impact.com") || getParam(params, "irclickid")) {
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

/* -------------------------------------------------------
 * Main
 * ----------------------------------------------------- */

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

  // Amazon
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

      evidence: amazonLayer.evidence,
      engine: amazonLayer.engine,

      explanation: [
        `Merchant detected: ${amazonLayer.merchant}`,
        `Attribution system detected: ${amazonLayer.attribution_system}`,
        `Primary claimer resolved to: ${amazonLayer.primary_claimer}`,
        `Publisher identified as: ${amazonLayer.publisher}`
      ]
    };
  }

  // Generic networks
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

  // Fallback
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
