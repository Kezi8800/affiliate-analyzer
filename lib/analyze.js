// lib/analyze.js
// BrandShuo Attribution Checker
// Main Analyze Engine v4.0

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
  if (n.includes("partnerize")) return "Partnerize";

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

function buildPathClassification({ publisher, network, merchant, channelRole }) {
  const finalPublisher = cleanValue(publisher, "Affiliate Source");
  const finalNetwork = cleanValue(network, "Affiliate Network");
  const finalMerchant = cleanValue(merchant, "Merchant");

  return {
    path_label: `${finalPublisher} → ${finalNetwork} → ${finalMerchant}`,
    path_nodes: [finalPublisher, finalNetwork, finalMerchant],
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

  const mediaGroup =
    cleanValue(publisherResult.group) ||
    cleanValue(publisherResult.media_group) ||
    cleanValue(publisherResult.parent_media_group) ||
    "Unidentified Publisher Group";

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

  /**
   * Amazon dedicated resolver
   * Priority:
   * 1. Amazon Attribution
   * 2. Amazon Creator Connections
   * 3. Amazon Associates
   * 4. Amazon Organic / Marketplace
   */
  if (
    isAmazonHost(hostname) ||
    hostname.includes("amazon.") ||
    hostname.includes("amzn.to") ||
    hostname.includes("a.co")
  ) {
    const amazonResult = resolveAmazonLink(urlObj, params);

    return {
      ok: true,
      version: "v4.0",
      engine: "BrandShuo Attribution Intelligence Engine v4",
      analyzed_url: inputUrl,
      final_url: urlObj.href,
      hostname,

      platform: "Amazon",
      merchant: "Amazon",
      merchant_type: "Marketplace",

      network: amazonResult.network || amazonResult.attribution_system || "Amazon",
      attribution_system: amazonResult.attribution_system || amazonResult.network || "Amazon",
      likely_type: amazonResult.likely_type || amazonResult.attribution_system || "Amazon",

      publisher: amazonResult.publisher || "Amazon Publisher",
      publisher_type: amazonResult.publisher_type || "Affiliate",

      primary_claimer: amazonResult.primary_claimer || amazonResult.publisher || "Amazon Publisher",

      traffic_type: amazonResult.traffic_type || "Affiliate / Commerce",
      commercial_intent: amazonResult.commercial_intent || "Affiliate Commerce Intent",
      traffic_quality: amazonResult.traffic_quality || 65,
      incrementality_risk: amazonResult.incrementality_risk || "Medium",
      conflict_risk: amazonResult.incrementality_risk || "Medium",

      channel_role:
        amazonResult.path_classification?.channel_role ||
        inferChannelRole(
          amazonResult.publisher_type,
          amazonResult.traffic_type,
          amazonResult.attribution_system
        ),

      confidence: amazonResult.confidence || "Medium",

      publisher_intelligence: amazonResult.publisher_intelligence || {
        publisher: amazonResult.publisher || "Amazon Publisher",
        type: amazonResult.publisher_type || "Affiliate",
        subtype: amazonResult.traffic_type || "Affiliate / Commerce",
        media_group: "Amazon Affiliate Ecosystem",
        matched_by: "amazon_link_resolver",
        confidence: amazonResult.confidence || "Medium"
      },

      path_classification:
        amazonResult.path_classification ||
        buildPathClassification({
          publisher: amazonResult.publisher,
          network: amazonResult.network,
          merchant: "Amazon",
          channelRole: amazonResult.channel_role
        }),

      retail_intent_gmv: amazonResult.retail_intent_gmv || null,

      evidence: amazonResult.evidence || {},

      attribution_layer: amazonResult,
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

  const publisherIntel = normalizePublisherIntel(publisherResult, networkSignal);

  const network =
    cleanValue(networkSignal?.network) ||
    cleanValue(publisherResult?.network) ||
    detectAffiliateNetwork(params, hostname) ||
    "Unknown";

  const merchant = detectMerchantFromHost(hostname);
  const platform = inferPlatform(hostname, network);

  const publisher = publisherIntel.publisher;
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
    network,
    merchant,
    channelRole
  });

  return {
    ok: true,
    version: "v4.0",
    engine: "BrandShuo Attribution Intelligence Engine v4",
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
      utm_campaign: getParam(params, "utm_campaign") || null
    },

    attribution_layer: {
      merchant,
      platform,
      network,
      attribution_system: network,
      publisher,
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
      networkSignal
    }
  };
}

module.exports = {
  analyzeLink,
  analyzeUrl: analyzeLink,
  default: analyzeLink
};
