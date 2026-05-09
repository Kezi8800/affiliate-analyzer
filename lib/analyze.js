// lib/analyze.js
// BrandShuo Attribution Checker
// Main Analyze Engine v4.1
// Fix: Network priority + remove Pepper/Partnerize as media group display

const {
  resolveAmazonLink,
  isAmazonHost
} = require("./amazon-link-resolver");

const {
  detectPublisherUniversal,
  buildPublisherIntelligence,
  cleanHostname,
  getQueryParams,
  getParam,
  detectAffiliateNetwork
} = require("./detect-publisher");

const {
  detectNetworkSignatureFromUrl
} = require("./network-signature-rules");

/* =========================
   Basic Utils
========================= */

function safeUrl(input) {
  try {
    if (!input || typeof input !== "string") return null;

    let url = input.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    return new URL(url);
  } catch (e) {
    return null;
  }
}

function safeString(value) {
  return String(value || "").trim();
}

function lower(value) {
  return safeString(value).toLowerCase();
}

function cleanValue(value, fallback = "") {
  if (value === null || value === undefined) return fallback;

  if (typeof value === "object") {
    return (
      cleanValue(value.publisher) ||
      cleanValue(value.name) ||
      cleanValue(value.label) ||
      cleanValue(value.value) ||
      fallback
    );
  }

  const v = String(value).trim();

  if (!v || v.toLowerCase() === "unknown" || v === "--" || v === "[object Object]") {
    return fallback;
  }

  return v;
}

function detectMerchantFromHost(hostname = "") {
  const host = lower(hostname);

  if (host.includes("amazon.") || host.includes("amzn.to") || host.includes("a.co")) return "Amazon";
  if (host.includes("walmart.")) return "Walmart";
  if (host.includes("target.")) return "Target";
  if (host.includes("bestbuy.")) return "Best Buy";
  if (host.includes("dell.")) return "Dell";
  if (host.includes("samsung.")) return "Samsung";
  if (host.includes("newegg.")) return "Newegg";
  if (host.includes("ebay.")) return "eBay";
  if (host.includes("homedepot.")) return "Home Depot";
  if (host.includes("lowes.")) return "Lowe's";
  if (host.includes("wayfair.")) return "Wayfair";
  if (host.includes("chewy.")) return "Chewy";
  if (host.includes("petco.")) return "Petco";
  if (host.includes("petsmart.")) return "PetSmart";
  if (host.includes("sephora.")) return "Sephora";
  if (host.includes("ulta.")) return "Ulta";
  if (host.includes("nike.")) return "Nike";
  if (host.includes("adidas.")) return "Adidas";

  return cleanHostname(hostname) || "Unknown Merchant";
}

function inferPlatform(hostname = "", network = "") {
  const host = lower(hostname);
  const n = lower(network);

  if (host.includes("amazon.") || host.includes("amzn.to") || host.includes("a.co") || n.includes("amazon")) return "Amazon";
  if (host.includes("walmart.") || n.includes("walmart")) return "Walmart";
  if (host.includes("ebay.") || n.includes("ebay")) return "eBay";
  if (n.includes("impact")) return "Impact";
  if (n.includes("cj")) return "CJ";
  if (n.includes("rakuten")) return "Rakuten";
  if (n.includes("awin")) return "Awin";
  if (n.includes("partnerize") || n.includes("pepperjam")) return "Partnerize";

  return detectMerchantFromHost(hostname);
}

function inferRisk(publisherType = "", trafficType = "", network = "") {
  const t = lower(`${publisherType} ${trafficType} ${network}`);

  if (t.includes("coupon") || t.includes("browser extension")) return "High";
  if (t.includes("deal") || t.includes("cashback") || t.includes("loyalty")) return "Medium-High";
  if (t.includes("editorial") || t.includes("review") || t.includes("content")) return "Low-Medium";
  if (t.includes("creator") || t.includes("influencer")) return "Medium";

  return "Medium";
}

function inferChannelRole(publisherType = "", trafficType = "", network = "") {
  const t = lower(`${publisherType} ${trafficType} ${network}`);

  if (t.includes("amazon attribution")) return "Paid Media / Attribution Measurement";
  if (t.includes("creator connections")) return "Creator / Affiliate Attribution";
  if (t.includes("associates")) return "Affiliate / Last-click Attribution";
  if (t.includes("coupon")) return "Coupon / Conversion Closer";
  if (t.includes("deal")) return "Deal / Conversion Closer";
  if (t.includes("cashback")) return "Cashback / Loyalty Closer";
  if (t.includes("editorial") || t.includes("review")) return "Content / Consideration Driver";
  if (t.includes("creator") || t.includes("influencer")) return "Creator / Demand Influencer";

  return "Affiliate / Attribution Touchpoint";
}

function inferCommercialIntent(publisherType = "", trafficType = "", network = "") {
  const t = lower(`${publisherType} ${trafficType} ${network}`);

  if (t.includes("coupon")) return "Coupon / Savings Intent";
  if (t.includes("deal")) return "Deal / Promo Intent";
  if (t.includes("cashback")) return "Cashback / Loyalty Intent";
  if (t.includes("editorial") || t.includes("review")) return "Product Research Intent";
  if (t.includes("creator") || t.includes("influencer")) return "Creator Recommendation Intent";
  if (t.includes("amazon associates")) return "Affiliate Commerce Intent";

  return "Commerce / Affiliate Intent";
}

function inferTrafficQuality(publisherType = "", trafficType = "", publisher = "") {
  const t = lower(`${publisherType} ${trafficType} ${publisher}`);

  if (t.includes("wirecutter")) return 88;
  if (t.includes("pcmag") || t.includes("techradar") || t.includes("tom's guide") || t.includes("cnet")) return 84;
  if (t.includes("editorial") || t.includes("review")) return 82;
  if (t.includes("creator") || t.includes("influencer")) return 74;
  if (t.includes("slickdeals")) return 72;
  if (t.includes("deal")) return 70;
  if (t.includes("cashback")) return 68;
  if (t.includes("coupon")) return 62;

  return 60;
}

/* =========================
   Publisher / Path Label Utils
========================= */

const NETWORK_GROUPS = [
  "pepper",
  "pepperjam",
  "partnerize",
  "impact",
  "impact radius",
  "impactradius",
  "cj",
  "cj affiliate",
  "commission junction",
  "rakuten",
  "awin",
  "shareasale",
  "affiliate tracking",
  "affiliate network"
];

function isNetworkGroup(value = "") {
  const v = lower(value);
  return NETWORK_GROUPS.includes(v);
}

function isUnknownGroup(value = "") {
  const v = lower(value);

  return (
    !v ||
    v === "unknown" ||
    v.includes("unidentified") ||
    v.includes("unknown publisher") ||
    v.includes("amazon affiliate ecosystem")
  );
}

function buildPublisherDisplayLabel(publisher = "", mediaGroup = "") {
  const publisherName = cleanValue(publisher, "Affiliate Source");
  const groupName = cleanValue(mediaGroup, "");

  if (groupName && isNetworkGroup(groupName)) {
    return publisherName;
  }

  if (
    publisherName.toLowerCase().includes("unknown") &&
    groupName.toLowerCase().includes("unknown")
  ) {
    return publisherName;
  }

  if (
    groupName &&
    !isUnknownGroup(groupName) &&
    lower(groupName) !== lower(publisherName)
  ) {
    return `${publisherName}（${groupName}）`;
  }

  return publisherName;
}

function buildPathClassification({
  publisher,
  publisherGroup,
  mediaGroup,
  network,
  merchant,
  channelRole
}) {
  const finalPublisher = cleanValue(publisher, "Affiliate Source");
  const rawGroup = cleanValue(publisherGroup) || cleanValue(mediaGroup);
  const finalGroup = rawGroup && !isNetworkGroup(rawGroup) ? rawGroup : "";

  const finalPublisherLabel = buildPublisherDisplayLabel(finalPublisher, finalGroup);
  const finalNetwork = cleanValue(network, "Affiliate Network");
  const finalMerchant = cleanValue(merchant, "Merchant");

  return {
    path_label: `${finalPublisherLabel} → ${finalNetwork} → ${finalMerchant}`,
    path_nodes: finalGroup && !isUnknownGroup(finalGroup) && lower(finalGroup) !== lower(finalPublisher)
      ? [finalPublisher, finalGroup, finalNetwork, finalMerchant]
      : [finalPublisher, finalNetwork, finalMerchant],
    publisher_label: finalPublisherLabel,
    publisher: finalPublisher,
    media_group: finalGroup || null,
    channel_role: cleanValue(channelRole, "Affiliate / Attribution Touchpoint")
  };
}

function normalizePublisherIntel(publisherResult = {}, networkSignal = null) {
  const publisher =
    cleanValue(publisherResult.publisher, "Affiliate Source");

  const type =
    cleanValue(publisherResult.category) ||
    cleanValue(publisherResult.type) ||
    "affiliate_publisher";

  const subtype =
    cleanValue(publisherResult.trafficType) ||
    cleanValue(publisherResult.subtype) ||
    "Affiliate";

  let mediaGroup =
    cleanValue(publisherResult.group) ||
    cleanValue(publisherResult.media_group) ||
    cleanValue(publisherResult.parent_media_group) ||
    "Unidentified Publisher Group";

  if (isNetworkGroup(mediaGroup)) {
    mediaGroup = "Unidentified Publisher Group";
  }

  return {
    publisher,
    type,
    subtype,
    media_group: mediaGroup,
    parent_media_group: cleanValue(publisherResult.parent_media_group, mediaGroup),
    vertical: cleanValue(publisherResult.vertical, null),
    region: cleanValue(publisherResult.region, null),
    market: cleanValue(publisherResult.market, null),
    matched_by: cleanValue(publisherResult.matchType, "publisher_detection"),
    confidence: cleanValue(publisherResult.confidence, "Medium"),
    network: cleanValue(publisherResult.network) || cleanValue(networkSignal?.network, null),
    network_type: cleanValue(publisherResult.network_type) || cleanValue(networkSignal?.type, null),
    network_confidence: cleanValue(publisherResult.network_confidence) || cleanValue(networkSignal?.confidence, null),
    network_signals: publisherResult.network_signals || networkSignal?.matched_signals || [],
    evidence: publisherResult.raw || publisherResult
  };
}

/* =========================
   Main Analyze Function
========================= */

function analyzeLink(inputUrl) {
  if (!inputUrl || typeof inputUrl !== "string") {
    return {
      ok: false,
      error: true,
      message: "Invalid URL"
    };
  }

  const urlObj = safeUrl(inputUrl);

  if (!urlObj) {
    return {
      ok: false,
      error: true,
      message: "Unable to parse URL"
    };
  }

  const hostname = cleanHostname(urlObj.hostname || "");
  const params = getQueryParams(urlObj);

const forcePartnerizePepperjam =
  getParam(params, "pj_publisherid") ||
  getParam(params, "publisherid") ||
  getParam(params, "pj_creativeid") ||
  String(getParam(params, "source") || "").toLowerCase().includes("pepperjam") ||
  String(getParam(params, "utm_source") || "").toLowerCase().includes("partnerize");

if (forcePartnerizePepperjam) {
  const publisherId =
    getParam(params, "pj_publisherid") ||
    getParam(params, "publisherid");

  const publisher = publisherId
    ? `Publisher ID ${publisherId}`
    : "Unknown Publisher";

  const network = "Partnerize / Pepperjam";
  const merchant = detectMerchantFromHost(hostname);

  return {
    ok: true,
    version: "v4.1-partnerize-force",
    analyzed_url: inputUrl,
    final_url: urlObj.href,
    hostname,
    platform: "Partnerize",
    merchant,
    merchant_type: "Retail / DTC",
    network,
    attribution_system: network,
    likely_type: network,
    publisher,
    publisher_label: publisher,
    publisher_group: null,
    media_group: null,
    publisher_type: "affiliate_publisher",
    primary_claimer: publisher,
    traffic_type: "Affiliate",
    commercial_intent: "Affiliate / Partner Intent",
    traffic_quality: 55,
    incrementality_risk: "Medium",
    conflict_risk: "Medium",
    channel_role: "Affiliate Network Layer",
    confidence: "high",
    path_classification: {
      path_label: `${publisher} → ${network} → ${merchant}`,
      path_nodes: [publisher, network, merchant],
      publisher_label: publisher,
      publisher,
      media_group: null,
      channel_role: "Affiliate Network Layer"
    },
    attribution_layer: {
      merchant,
      platform: "Partnerize",
      network,
      attribution_system: network,
      publisher,
      publisher_label: publisher,
      publisher_group: null,
      media_group: null,
      publisher_type: "affiliate_publisher",
      traffic_type: "Affiliate",
      commercial_intent: "Affiliate / Partner Intent",
      traffic_quality: 55,
      incrementality_risk: "Medium",
      channel_role: "Affiliate Network Layer",
      confidence: "high",
      path_classification: {
        path_label: `${publisher} → ${network} → ${merchant}`,
        path_nodes: [publisher, network, merchant],
        publisher_label: publisher,
        publisher,
        media_group: null,
        channel_role: "Affiliate Network Layer"
      }
    },
    evidence: {
      pj_publisherid: getParam(params, "pj_publisherid") || null,
      publisherid: getParam(params, "publisherid") || null,
      pj_creativeid: getParam(params, "pj_creativeid") || null,
      source: getParam(params, "source") || null,
      utm_source: getParam(params, "utm_source") || null
    }
  };

  if (
    isAmazonHost(hostname) ||
    hostname.includes("amazon.") ||
    hostname.includes("amzn.to") ||
    hostname.includes("a.co")
  ) {
    const amazonResult = resolveAmazonLink(urlObj, params);

    const amazonPublisher =
      cleanValue(amazonResult.publisher, "Amazon Publisher");

    const amazonMediaGroup =
      cleanValue(amazonResult.group) ||
      cleanValue(amazonResult.media_group) ||
      cleanValue(amazonResult.parent_media_group) ||
      cleanValue(amazonResult.publisher_intelligence?.media_group) ||
      cleanValue(amazonResult.publisher_intelligence?.parent_media_group) ||
      null;

    const amazonNetwork =
      amazonResult.network || amazonResult.attribution_system || "Amazon";

    const amazonChannelRole =
      amazonResult.path_classification?.channel_role ||
      amazonResult.channel_role ||
      inferChannelRole(
        amazonResult.publisher_type,
        amazonResult.traffic_type,
        amazonResult.attribution_system
      );

    const amazonPathClassification = buildPathClassification({
      publisher: amazonPublisher,
      publisherGroup: amazonMediaGroup,
      network: amazonNetwork,
      merchant: "Amazon",
      channelRole: amazonChannelRole
    });

    const amazonPublisherIntelligence = amazonResult.publisher_intelligence || {
      publisher: amazonPublisher,
      type: amazonResult.publisher_type || "Affiliate",
      subtype: amazonResult.traffic_type || "Affiliate / Commerce",
      media_group: amazonMediaGroup || "Unidentified Publisher Group",
      matched_by: "amazon_link_resolver",
      confidence: amazonResult.confidence || "Medium"
    };

    return {
      ok: true,
      version: "v4.1",
      engine: "BrandShuo Attribution Intelligence Engine v4.1",
      analyzed_url: inputUrl,
      final_url: urlObj.href,
      hostname,

      platform: "Amazon",
      merchant: "Amazon",
      merchant_type: "Marketplace",

      network: amazonNetwork,
      attribution_system: amazonResult.attribution_system || amazonNetwork,
      likely_type: amazonResult.likely_type || amazonResult.attribution_system || "Amazon",

      publisher: amazonPublisher,
      publisher_label: amazonPathClassification.publisher_label,
      publisher_group: amazonMediaGroup,
      media_group: amazonMediaGroup,
      publisher_type: amazonResult.publisher_type || "Affiliate",

      primary_claimer: amazonResult.primary_claimer || amazonPublisher,

      traffic_type: amazonResult.traffic_type || "Affiliate / Commerce",
      commercial_intent: amazonResult.commercial_intent || "Affiliate Commerce Intent",
      traffic_quality: amazonResult.traffic_quality || 65,
      incrementality_risk: amazonResult.incrementality_risk || "Medium",
      conflict_risk: amazonResult.incrementality_risk || "Medium",

      channel_role: amazonChannelRole,

      confidence: amazonResult.confidence || "Medium",

      publisher_intelligence: {
        ...amazonPublisherIntelligence,
        publisher: amazonPublisher,
        media_group: amazonMediaGroup || amazonPublisherIntelligence.media_group || "Unidentified Publisher Group",
        parent_media_group:
          amazonMediaGroup ||
          amazonPublisherIntelligence.parent_media_group ||
          amazonPublisherIntelligence.media_group ||
          "Unidentified Publisher Group"
      },

      path_classification: amazonPathClassification,

      retail_intent_gmv: amazonResult.retail_intent_gmv || null,

      evidence: amazonResult.evidence || {},

      attribution_layer: {
        ...amazonResult,
        publisher: amazonPublisher,
        publisher_label: amazonPathClassification.publisher_label,
        publisher_group: amazonMediaGroup,
        media_group: amazonMediaGroup,
        network: amazonNetwork,
        path_classification: amazonPathClassification
      },

      raw: amazonResult
    };
  }

  /**
   * Non-Amazon universal resolver
   */
  const networkSignal = detectNetworkSignatureFromUrl(urlObj, params);
  const publisherResult = detectPublisherUniversal({
    url: inputUrl,
    urlObj,
    params,
    hostname
  });

const isPartnerizePepperjam =
  getParam(params, "pj_publisherid") ||
  getParam(params, "publisherid") ||
  getParam(params, "pj_creativeid") ||
  String(getParam(params, "source") || "").toLowerCase().includes("pepperjam") ||
  String(getParam(params, "utm_source") || "").toLowerCase().includes("partnerize");

if (isPartnerizePepperjam) {
  const publisherId =
    getParam(params, "pj_publisherid") ||
    getParam(params, "publisherid");

  const forcedPublisher = publisherId
    ? `Publisher ID ${publisherId}`
    : "Unknown Publisher";

  const forcedNetwork = "Partnerize / Pepperjam";
  const merchant = detectMerchantFromHost(hostname);
  const platform = inferPlatform(hostname, forcedNetwork);

  const pathClassification = buildPathClassification({
    publisher: forcedPublisher,
    publisherGroup: "",
    network: forcedNetwork,
    merchant,
    channelRole: "Affiliate Network Layer"
  });

  return {
    ok: true,
    version: "v4.1-partnerize-fix",
    engine: "BrandShuo Attribution Intelligence Engine v4.1",
    analyzed_url: inputUrl,
    final_url: urlObj.href,
    hostname,

    platform,
    merchant,
    merchant_type: "Retail / DTC",

    network: forcedNetwork,
    attribution_system: forcedNetwork,
    likely_type: forcedNetwork,

    publisher: forcedPublisher,
    publisher_label: forcedPublisher,
    publisher_group: null,
    media_group: null,
    publisher_type: "affiliate_publisher",

    primary_claimer: forcedPublisher,

    traffic_type: "Affiliate",
    commercial_intent: "Affiliate / Partner Intent",
    traffic_quality: 55,
    incrementality_risk: "Medium",
    conflict_risk: "Medium",

    channel_role: "Affiliate Network Layer",
    confidence: "high",

    publisher_intelligence: {
      publisher: forcedPublisher,
      type: "affiliate_publisher",
      subtype: "Affiliate",
      media_group: null,
      parent_media_group: null,
      matched_by: "partnerize_pepperjam_forced_rule",
      confidence: "high",
      network: forcedNetwork,
      network_type: "Affiliate Network",
      network_confidence: "high",
      network_signals: [
        "source=pepperjam",
        "utm_source=partnerize",
        "pj_publisherid",
        "publisherid",
        "pj_creativeid"
      ]
    },

    path_classification: pathClassification,

    retail_intent_gmv: {
      merchant,
      merchant_type: "Retail / DTC",
      platform,
      commercial_intent: "Affiliate / Partner Intent",
      traffic_quality: 55
    },

    evidence: {
      params,
      source: getParam(params, "source") || null,
      utm_source: getParam(params, "utm_source") || null,
      pj_publisherid: getParam(params, "pj_publisherid") || null,
      publisherid: getParam(params, "publisherid") || null,
      pj_creativeid: getParam(params, "pj_creativeid") || null
    },

    attribution_layer: {
      merchant,
      platform,
      network: forcedNetwork,
      attribution_system: forcedNetwork,
      publisher: forcedPublisher,
      publisher_label: forcedPublisher,
      publisher_group: null,
      media_group: null,
      publisher_type: "affiliate_publisher",
      traffic_type: "Affiliate",
      commercial_intent: "Affiliate / Partner Intent",
      traffic_quality: 55,
      incrementality_risk: "Medium",
      channel_role: "Affiliate Network Layer",
      confidence: "high",
      path_classification: pathClassification
    },

    raw: {
      forced_partnerize_pepperjam: true,
      params
    }
  };
}

const publisherIntel = normalizePublisherIntel(publisherResult, networkSignal);

const directNetwork = detectAffiliateNetwork(params, hostname);

const network =
  cleanValue(publisherResult?.network) ||
  cleanValue(directNetwork) ||
  cleanValue(networkSignal?.network) ||
  "Unknown";

  const merchant = detectMerchantFromHost(hostname);
  const platform = inferPlatform(hostname, network);

  const publisher = publisherIntel.publisher;
  const publisherGroup = publisherIntel.media_group;
  const publisherType = publisherIntel.type;
  const trafficType = publisherIntel.subtype;

  const commercialIntent =
    cleanValue(publisherResult?.commercialIntent) ||
    cleanValue(publisherResult?.intent) ||
    inferCommercialIntent(publisherType, trafficType, network);

  const channelRole =
    cleanValue(publisherResult?.channelRole) ||
    cleanValue(publisherResult?.role) ||
    inferChannelRole(publisherType, trafficType, network);

  const trafficQuality =
    Number(publisherResult?.quality || publisherResult?.score || 0) ||
    inferTrafficQuality(publisherType, trafficType, publisher);

  const incrementalityRisk =
    cleanValue(publisherResult?.incrementalityRisk) ||
    cleanValue(publisherResult?.risk) ||
    inferRisk(publisherType, trafficType, network);

  const pathClassification = buildPathClassification({
    publisher,
    publisherGroup,
    network,
    merchant,
    channelRole
  });

  return {
    ok: true,
    version: "v4.1",
    engine: "BrandShuo Attribution Intelligence Engine v4.1",
    analyzed_url: inputUrl,
    final_url: urlObj.href,
    hostname,

    platform,
    merchant,
    merchant_type: "Retail / DTC",

    network,
    attribution_system: network,
    likely_type: network,

    publisher,
    publisher_label: pathClassification.publisher_label,
    publisher_group: publisherGroup,
    media_group: publisherGroup,
    publisher_type: publisherType,

    primary_claimer: publisher,

    traffic_type: trafficType,
    commercial_intent: commercialIntent,
    traffic_quality: trafficQuality,
    incrementality_risk: incrementalityRisk,
    conflict_risk: incrementalityRisk,

    channel_role: channelRole,

    confidence:
      cleanValue(publisherResult?.confidence) ||
      cleanValue(networkSignal?.confidence) ||
      "Medium",

    publisher_intelligence: publisherIntel,

    path_classification: pathClassification,

    retail_intent_gmv: {
      merchant,
      merchant_type: "Retail / DTC",
      platform,
      commercial_intent: commercialIntent,
      traffic_quality: trafficQuality
    },

    evidence: {
      params,
      network_signal: networkSignal || null,
      publisher_detection: publisherResult || null,
      tag: getParam(params, "tag") || null,
      ascsubtag: getParam(params, "ascsubtag") || null,
      irclickid: getParam(params, "irclickid") || null,
      irgwc: getParam(params, "irgwc") || null,
      cjevent: getParam(params, "cjevent") || null,
      cjdata: getParam(params, "cjdata") || null,
      ranMID: getParam(params, "ranmid") || null,
      ranEAID: getParam(params, "raneaid") || null,
      ranSiteID: getParam(params, "ransiteid") || null,
      clickref: getParam(params, "clickref") || null,
      awc: getParam(params, "awc") || null,
      sourceid: getParam(params, "sourceid") || null,
      utm_source: getParam(params, "utm_source") || null,
      utm_medium: getParam(params, "utm_medium") || null,
      utm_campaign: getParam(params, "utm_campaign") || null,
      source: getParam(params, "source") || null,
      pj_publisherid: getParam(params, "pj_publisherid") || null,
      publisherid: getParam(params, "publisherid") || null,
      pj_creativeid: getParam(params, "pj_creativeid") || null
    },

    attribution_layer: {
      merchant,
      platform,
      network,
      attribution_system: network,
      publisher,
      publisher_label: pathClassification.publisher_label,
      publisher_group: publisherGroup,
      media_group: publisherGroup,
      publisher_type: publisherType,
      traffic_type: trafficType,
      commercial_intent: commercialIntent,
      traffic_quality: trafficQuality,
      incrementality_risk: incrementalityRisk,
      channel_role: channelRole,
      confidence:
        cleanValue(publisherResult?.confidence) ||
        cleanValue(networkSignal?.confidence) ||
        "Medium",
      publisher_intelligence: publisherIntel,
      path_classification: pathClassification
    },

    raw: {
      publisherResult,
      networkSignal,
      directNetwork
    }
  };
}

module.exports = {
  analyzeLink,
  analyzeUrl: analyzeLink,
  default: analyzeLink
};
