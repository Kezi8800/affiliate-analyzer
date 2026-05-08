"use strict";

const { resolveAmazonCreatorConnections } = require("./amazon-creator-connections-rules");
const { matchInternationalPublisherFromUrl } = require("./international-publisher-rules");

function safeString(value) {
  return String(value || "").trim();
}

function lower(value) {
  return safeString(value).toLowerCase();
}

function getParam(params, key) {
  if (!params || !key) return "";

  if (typeof params.get === "function") {
    return params.get(key) || params.get(key.toLowerCase()) || params.get(key.toUpperCase()) || "";
  }

  return params[key] || params[key.toLowerCase()] || params[key.toUpperCase()] || "";
}

function paramsToObject(params) {
  if (!params) return {};

  if (typeof params.entries === "function") {
    const obj = {};
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  return { ...params };
}

function normalizeAmazonTag(value) {
  return lower(value).replace(/\s+/g, "");
}

function isAmazonHost(hostname = "") {
  const h = lower(hostname);
  return (
    h.includes("amazon.") ||
    h.includes("amzn.to") ||
    h.includes("a.co") ||
    h.includes("amzn.eu") ||
    h.includes("amzn.asia")
  );
}

function inferPublisherFromAmazonTag(tag = "", ascsubtag = "") {
  const haystack = `${normalizeAmazonTag(tag)} ${normalizeAmazonTag(ascsubtag)}`;

  const rules = [
    {
      publisher: "Slickdeals",
      patterns: ["slickdeals09", "slickdeals", "sd-", "sd_"],
      type: "Deal Community",
      subtype: "Deal / Promo",
      media_group: "Slickdeals"
    },
    {
      publisher: "BuzzFeed",
      patterns: ["buzz0f", "buzzfeed", "bf-shp"],
      type: "Editorial Commerce",
      subtype: "Shopping Content",
      media_group: "BuzzFeed"
    },
    {
      publisher: "PCMag",
      patterns: ["p00935", "pcmag"],
      type: "Editorial Commerce",
      subtype: "Tech Review",
      media_group: "Ziff Davis"
    },
    {
      publisher: "TechRadar",
      patterns: ["cx-future-tr", "future__tr", "techradar", "trdpro"],
      type: "Editorial Commerce",
      subtype: "Tech Review / Buying Guide",
      media_group: "Future"
    },
    {
      publisher: "Tom's Guide",
      patterns: ["tomsguide", "tomsguide-us"],
      type: "Editorial Commerce",
      subtype: "Tech Review / Buying Guide",
      media_group: "Future"
    },
    {
      publisher: "Wirecutter",
      patterns: ["wirecutter", "thewirecutter", "nytimes"],
      type: "Editorial Commerce",
      subtype: "Review / Buying Guide",
      media_group: "NYTimes"
    },
    {
      publisher: "CNET",
      patterns: ["cnet", "cnetcommerce"],
      type: "Editorial Commerce",
      subtype: "Tech Review",
      media_group: "Red Ventures"
    }
  ];

  for (const rule of rules) {
    if (rule.patterns.some(pattern => haystack.includes(normalizeAmazonTag(pattern)))) {
      return {
        ...rule,
        confidence: "High",
        matched_by: "amazon_tag_rule",
        evidence: {
          tag: tag || null,
          ascsubtag: ascsubtag || null
        }
      };
    }
  }

  return null;
}

function detectAmazonAttribution(params = {}) {
  const maas = getParam(params, "maas");
  const aaCampaign = getParam(params, "aa_campaignid");
  const aaAdgroup = getParam(params, "aa_adgroupid");
  const aaCreative = getParam(params, "aa_creativeid");

  const isAttribution = !!(maas || aaCampaign || aaAdgroup || aaCreative);

  return {
    is_amazon_attribution: isAttribution,
    attribution_system: isAttribution ? "Amazon Attribution" : null,
    confidence: isAttribution ? "High" : "Low",
    evidence: {
      maas: maas || null,
      aa_campaignid: aaCampaign || null,
      aa_adgroupid: aaAdgroup || null,
      aa_creativeid: aaCreative || null
    }
  };
}

function detectAmazonAssociates(params = {}) {
  const tag = getParam(params, "tag");
  const associateTag = getParam(params, "associateTag") || getParam(params, "associatetag");
  const ascsubtag = getParam(params, "ascsubtag");
  const linkCode = getParam(params, "linkCode");
  const creative = getParam(params, "creative");
  const camp = getParam(params, "camp");

  const finalTag = tag || associateTag;

  const hasAssociatesSignal = !!(
    finalTag ||
    ascsubtag ||
    linkCode ||
    creative ||
    camp
  );

  let score = 0;
  const signals = [];

  if (finalTag) {
    score += 50;
    signals.push("tag");
  }

  if (ascsubtag) {
    score += 20;
    signals.push("ascsubtag");
  }

  if (linkCode) {
    score += 12;
    signals.push("linkCode");
  }

  if (creative) {
    score += 8;
    signals.push("creative");
  }

  if (camp) {
    score += 8;
    signals.push("camp");
  }

  return {
    is_amazon_associates: hasAssociatesSignal,
    attribution_system: hasAssociatesSignal ? "Amazon Associates" : null,
    score,
    confidence: score >= 60 ? "High" : score >= 30 ? "Medium" : "Low",
    signals,
    evidence: {
      tag: finalTag || null,
      ascsubtag: ascsubtag || null,
      linkCode: linkCode || null,
      creative: creative || null,
      camp: camp || null
    }
  };
}

/**
 * Main Amazon resolver
 * Priority:
 * 1. Amazon Attribution
 * 2. Amazon Creator Connections
 * 3. Amazon Associates
 * 4. Amazon Organic / Marketplace URL
 */
function resolveAmazonLink(urlObj, rawParams = {}) {
  const params = paramsToObject(rawParams);

  const host = lower(urlObj?.hostname);
  const path = lower(urlObj?.pathname);

  const tag =
    getParam(params, "tag") ||
    getParam(params, "associateTag") ||
    getParam(params, "associatetag") ||
    getParam(params, "afftag") ||
    getParam(params, "tracking_id");

  const ascsubtag =
    getParam(params, "ascsubtag") ||
    getParam(params, "asc_subtag") ||
    getParam(params, "subtag") ||
    getParam(params, "subId") ||
    getParam(params, "subid") ||
    getParam(params, "sid");

  const attribution = detectAmazonAttribution(params);
  const creator = resolveAmazonCreatorConnections(params, urlObj);
  const associates = detectAmazonAssociates(params);

  const amazonTagPublisher = inferPublisherFromAmazonTag(tag, ascsubtag);
  const intlPublisher = matchInternationalPublisherFromUrl(urlObj, params);

  const publisherIntel =
    amazonTagPublisher ||
    intlPublisher ||
    null;

  let attributionSystem = "Amazon";
  let network = "Amazon";
  let confidence = "Low";
  let primaryClaimer = "Amazon";

  if (attribution.is_amazon_attribution) {
    attributionSystem = "Amazon Attribution";
    network = "Amazon Attribution";
    confidence = attribution.confidence;
    primaryClaimer = "Brand / Advertiser";
  } else if (creator.is_creator_connections) {
    attributionSystem = "Amazon Creator Connections";
    network = "Amazon Creator Connections";
    confidence = creator.confidence;
    primaryClaimer = publisherIntel?.publisher || "Creator / Publisher";
  } else if (associates.is_amazon_associates) {
    attributionSystem = "Amazon Associates";
    network = "Amazon Associates";
    confidence = associates.confidence;
    primaryClaimer = publisherIntel?.publisher || "Amazon Associates Publisher";
  } else if (isAmazonHost(host)) {
    attributionSystem = "Amazon Organic / Marketplace";
    network = "Amazon";
    confidence = "Medium";
    primaryClaimer = "Amazon";
  }

  const publisher = publisherIntel?.publisher || primaryClaimer;
  const publisherType =
    publisherIntel?.type ||
    (attributionSystem === "Amazon Creator Connections"
      ? "Creator / Influencer"
      : attributionSystem === "Amazon Associates"
      ? "Affiliate"
      : attributionSystem === "Amazon Attribution"
      ? "Advertiser"
      : "Marketplace");

  const subtype =
    publisherIntel?.subtype ||
    (attributionSystem === "Amazon Creator Connections"
      ? "Creator Commerce"
      : attributionSystem === "Amazon Associates"
      ? "Amazon Affiliate"
      : attributionSystem === "Amazon Attribution"
      ? "Paid Attribution"
      : "Organic Marketplace");

  const mediaGroup =
    publisherIntel?.media_group ||
    (attributionSystem === "Amazon Creator Connections"
      ? "Amazon Creator Ecosystem"
      : attributionSystem === "Amazon Associates"
      ? "Amazon Affiliate Ecosystem"
      : "Amazon");

  return {
    engine: "Amazon Link Resolver v1",
    is_amazon: isAmazonHost(host),
    merchant: "Amazon",
    platform: "Amazon",
    hostname: host || null,
    pathname: path || null,

    attribution_system: attributionSystem,
    network,
    likely_type: attributionSystem,

    publisher,
    publisher_type: publisherType,
    primary_claimer: primaryClaimer,

    confidence,

    publisher_intelligence: {
      publisher,
      type: publisherType,
      subtype,
      media_group: mediaGroup,
      region: publisherIntel?.region || null,
      market: publisherIntel?.market || null,
      confidence: publisherIntel?.confidence || confidence,
      matched_by: publisherIntel?.matched_by || "amazon_link_resolver",
      matched_pattern: publisherIntel?.matched_pattern || null
    },

    path_classification: {
      path_label: `${publisher} → ${attributionSystem} → Amazon`,
      path_nodes: [publisher, attributionSystem, "Amazon"],
      channel_role:
        attributionSystem === "Amazon Creator Connections"
          ? "Creator / Affiliate Attribution"
          : attributionSystem === "Amazon Associates"
          ? "Affiliate / Last-click Attribution"
          : attributionSystem === "Amazon Attribution"
          ? "Paid Media / Attribution Measurement"
          : "Marketplace Touchpoint"
    },

    traffic_type:
      publisherType.includes("Deal")
        ? "Deal / Promo"
        : publisherType.includes("Editorial")
        ? "Editorial / Review"
        : publisherType.includes("Creator")
        ? "Creator / Influencer"
        : "Affiliate / Commerce",

    commercial_intent:
      publisherType.includes("Deal")
        ? "Deal / Promo Intent"
        : publisherType.includes("Editorial")
        ? "Product Research Intent"
        : publisherType.includes("Creator")
        ? "Creator Recommendation Intent"
        : "Affiliate Commerce Intent",

    traffic_quality:
      publisherType.includes("Editorial")
        ? 82
        : publisherType.includes("Creator")
        ? 74
        : publisherType.includes("Deal")
        ? 72
        : 65,

    incrementality_risk:
      publisherType.includes("Deal")
        ? "Medium"
        : publisherType.includes("Coupon")
        ? "High"
        : "Medium",

    evidence: {
      tag: tag || null,
      ascsubtag: ascsubtag || null,
      campaignId: getParam(params, "campaignId") || null,
      linkId: getParam(params, "linkId") || null,
      linkCode: getParam(params, "linkCode") || null,
      creative: getParam(params, "creative") || null,
      camp: getParam(params, "camp") || null,
      maas: getParam(params, "maas") || null,
      aa_campaignid: getParam(params, "aa_campaignid") || null,
      aa_adgroupid: getParam(params, "aa_adgroupid") || null,
      aa_creativeid: getParam(params, "aa_creativeid") || null,
      resolver_priority: attribution.is_amazon_attribution
        ? "Amazon Attribution"
        : creator.is_creator_connections
        ? "Amazon Creator Connections"
        : associates.is_amazon_associates
        ? "Amazon Associates"
        : "Amazon Organic",
      attribution_signals: attribution.evidence,
      creator_signals: creator.signals,
      associates_signals: associates.signals
    }
  };
}

module.exports = {
  resolveAmazonLink,
  isAmazonHost,
  detectAmazonAttribution,
  detectAmazonAssociates,
  inferPublisherFromAmazonTag
};
