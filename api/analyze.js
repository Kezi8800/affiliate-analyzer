const { analyzeLink } = require("../lib/analyze");

function safeUrl(input) {
  try {
    if (!input || typeof input !== "string") return null;

    let url = input.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    return new URL(url);
  } catch {
    return null;
  }
}

function getParams(urlObj) {
  const params = {};
  if (!urlObj || !urlObj.searchParams) return params;

  for (const [key, value] of urlObj.searchParams.entries()) {
    params[String(key).toLowerCase()] = value;
  }

  return params;
}

function getParam(params, key) {
  return params[String(key || "").toLowerCase()] || "";
}

function cleanHostname(hostname = "") {
  return String(hostname || "")
    .replace(/^www\./, "")
    .toLowerCase()
    .trim();
}

function toTitleCaseBrand(hostname = "") {
  const name = cleanHostname(hostname)
    .split(".")[0]
    .replace(/-/g, " ")
    .trim();

  return name ? name.charAt(0).toUpperCase() + name.slice(1) : "Merchant";
}

function detectMerchant(hostname = "") {
  const host = cleanHostname(hostname);

  if (host.includes("amazon.")) return "Amazon";
  if (host.includes("saatva.")) return "Saatva";
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
  if (host.includes("interiordefine.")) return "Interior Define";

  return toTitleCaseBrand(host);
}

function isPartnerizePepperjam(params = {}) {
  const source = String(getParam(params, "source")).toLowerCase();
  const utmSource = String(getParam(params, "utm_source")).toLowerCase();

  return Boolean(
    getParam(params, "pj_publisherid") ||
    getParam(params, "publisherid") ||
    getParam(params, "pj_creativeid") ||
    getParam(params, "clickref") ||
    getParam(params, "click_ref") ||
    source.includes("pepperjam") ||
    utmSource.includes("partnerize") ||
    utmSource.includes("pepperjam")
  );
}

function isFuturePublishing(params = {}) {
  const utmSource = String(getParam(params, "utm_source")).toLowerCase();
  const utmCampaign = String(getParam(params, "utm_campaign")).toLowerCase();

  return Boolean(
    utmSource.includes("futurepublishing") ||
    utmSource.includes("future publishing") ||
    utmSource === "future" ||
    utmCampaign.includes("futurepublishing") ||
    utmCampaign.includes("future publishing")
  );
}

function buildFuturePublishingResult(inputUrl, urlObj, params) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const merchant = detectMerchant(hostname);
  const publisher = "Future Publishing";
  const network = "Affiliate Network";
  const platform = "DTC";

  const pathClassification = {
    path_label: `${publisher} → ${network} → ${merchant}`,
    path_nodes: [publisher, network, merchant],
    publisher_label: publisher,
    publisher,
    media_group: "Future Publishing",
    channel_role: "Content / Consideration Driver"
  };

  return {
    ok: true,
    error: false,
    version: "BrandShuo Analyze v4.2 Future Publishing Production",
    engine: "BrandShuo Attribution Intelligence Engine",

    analyzed_url: inputUrl,
    input: inputUrl,
    normalizedUrl: urlObj.href,
    final_url: urlObj.href,
    domain: hostname,
    hostname,

    platform,
    merchant,
    merchant_type: "Retail / DTC",

    network,
    detection_result: network,
    attribution_system: network,
    likely_type: network,

    publisher,
    publisher_label: publisher,
    publisher_name: publisher,
    publisher_raw_name: publisher,
    publisher_group: "Future Publishing",
    media_group: "Future Publishing",
    publisher_type: "editorial_affiliate",
    publisher_category: "commerce_media",

    primary_claimer: publisher,

    traffic_type: "Editorial Commerce",
    commercial_intent: "Product Research Intent",
    channel_role: "Content / Consideration Driver",

    traffic_quality: 84,
    quality_score: 84,
    quality_label: "High",

    incrementality_risk: "Low-Medium",
    risk: "Low-Medium",
    conflict_risk: "Low-Medium",

    confidence: "high",

    publisher_intelligence: {
      publisher,
      publisher_label: publisher,
      type: "commerce_media",
      subtype: "Editorial Commerce",
      media_group: "Future Publishing",
      parent_media_group: "Future Publishing",
      confidence: "high",
      matched_by: "utm_source_futurepublishing",
      matched_pattern: "utm_source=futurepublishing",
      network,
      network_type: "Affiliate Network",
      network_confidence: "medium"
    },

    intelligence: {
      pathLabel: pathClassification.path_label,
      trafficType: "Editorial Commerce",
      commercialIntent: "Product Research Intent",
      channelRole: "Content / Consideration Driver",
      qualityScore: 84,
      qualityLabel: "High",
      incrementalityRisk: "Low-Medium",
      confidence: "high"
    },

    path_classification: pathClassification,
    path: pathClassification.path_nodes,

    tracking_layer: {
      platform,
      merchant,
      network,
      publisher,
      publisher_label: publisher,
      publisher_group: "Future Publishing",
      amazon_layer: "--",
      domain: hostname
    },

    attribution_layer: {
      merchant,
      platform,
      network,
      attribution_system: network,
      publisher,
      publisher_label: publisher,
      publisher_group: "Future Publishing",
      media_group: "Future Publishing",
      publisher_type: "editorial_affiliate",
      traffic_type: "Editorial Commerce",
      commercial_intent: "Product Research Intent",
      traffic_quality: 84,
      incrementality_risk: "Low-Medium",
      channel_role: "Content / Consideration Driver",
      confidence: "high",
      path_classification: pathClassification,
      publisher_intelligence: {
        publisher,
        publisher_label: publisher,
        type: "commerce_media",
        subtype: "Editorial Commerce",
        media_group: "Future Publishing",
        parent_media_group: "Future Publishing",
        confidence: "high",
        matched_by: "utm_source_futurepublishing",
        network
      }
    },

    signals: {
      hasAffiliateTag: true,
      hasAmazonTag: false,
      hasPaidClickId: false,
      hasSubId: Boolean(getParam(params, "click_id")),
      hasCouponOrDealPublisher: false,
      hasEditorialPublisher: true,
      hasPartnerizePublisherId: false
    },

    evidence: {
      params,
      click_id: getParam(params, "click_id") || null,
      clickid: getParam(params, "clickid") || null,
      source: getParam(params, "source") || null,
      utm_source: getParam(params, "utm_source") || null,
      utm_medium: getParam(params, "utm_medium") || null,
      utm_campaign: getParam(params, "utm_campaign") || null,
      utm_content: getParam(params, "utm_content") || null
    },

    params,

    raw: {
      forced_future_publishing: true,
      publisher,
      network
    }
  };
}

function buildPartnerizePepperjamResult(inputUrl, urlObj, params) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const merchant = detectMerchant(hostname);

  const publisherId =
    getParam(params, "pj_publisherid") ||
    getParam(params, "publisherid");

  const publisher = publisherId
    ? `Publisher ID ${publisherId}`
    : "Unknown Publisher";

  const network = "Partnerize / Pepperjam";
  const platform = "Partnerize";

  const pathClassification = {
    path_label: `${publisher} → ${network} → ${merchant}`,
    path_nodes: [publisher, network, merchant],
    publisher_label: publisher,
    publisher,
    media_group: null,
    channel_role: "Affiliate Network Layer"
  };

  return {
    ok: true,
    error: false,
    version: "BrandShuo Analyze v4.2 Partnerize Production",
    engine: "BrandShuo Attribution Intelligence Engine",

    analyzed_url: inputUrl,
    input: inputUrl,
    normalizedUrl: urlObj.href,
    final_url: urlObj.href,
    domain: hostname,
    hostname,

    platform,
    merchant,
    merchant_type: "Retail / DTC",

    network,
    detection_result: network,
    attribution_system: network,
    likely_type: network,

    publisher,
    publisher_label: publisher,
    publisher_name: publisher,
    publisher_raw_name: publisher,
    publisher_group: null,
    media_group: null,
    publisher_type: "affiliate_publisher",
    publisher_category: "affiliate_publisher",

    primary_claimer: publisher,

    traffic_type: "Affiliate",
    commercial_intent: "Affiliate / Partner Intent",
    channel_role: "Affiliate Network Layer",

    traffic_quality: 55,
    quality_score: 55,
    quality_label: "Moderate",

    incrementality_risk: "Medium",
    risk: "Medium",
    conflict_risk: "Medium",

    confidence: "high",

    publisher_intelligence: {
      publisher,
      publisher_label: publisher,
      type: "affiliate_publisher",
      subtype: "Affiliate",
      media_group: null,
      parent_media_group: null,
      confidence: "high",
      matched_by: "partnerize_pepperjam_param",
      matched_pattern: "pj_publisherid / publisherId / source=pepperjam / utm_source=partnerize",
      network,
      network_type: "Affiliate Network",
      network_confidence: "high"
    },

    intelligence: {
      pathLabel: pathClassification.path_label,
      trafficType: "Affiliate",
      commercialIntent: "Affiliate / Partner Intent",
      channelRole: "Affiliate Network Layer",
      qualityScore: 55,
      qualityLabel: "Moderate",
      incrementalityRisk: "Medium",
      confidence: "high"
    },

    path_classification: pathClassification,
    path: pathClassification.path_nodes,

    tracking_layer: {
      platform,
      merchant,
      network,
      publisher,
      publisher_label: publisher,
      publisher_group: null,
      amazon_layer: "--",
      domain: hostname
    },

    attribution_layer: {
      merchant,
      platform,
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
      path_classification: pathClassification,
      publisher_intelligence: {
        publisher,
        publisher_label: publisher,
        type: "affiliate_publisher",
        subtype: "Affiliate",
        media_group: null,
        parent_media_group: null,
        confidence: "high",
        matched_by: "partnerize_pepperjam_param",
        network
      }
    },

    signals: {
      hasAffiliateTag: true,
      hasAmazonTag: false,
      hasPaidClickId: false,
      hasSubId: false,
      hasCouponOrDealPublisher: false,
      hasEditorialPublisher: false,
      hasPartnerizePublisherId: Boolean(publisherId)
    },

    evidence: {
      params,
      pj_publisherid: getParam(params, "pj_publisherid") || null,
      publisherid: getParam(params, "publisherid") || null,
      pj_creativeid: getParam(params, "pj_creativeid") || null,
      clickid: getParam(params, "clickid") || null,
      source: getParam(params, "source") || null,
      utm_source: getParam(params, "utm_source") || null,
      utm_medium: getParam(params, "utm_medium") || null,
      utm_campaign: getParam(params, "utm_campaign") || null,
      utm_content: getParam(params, "utm_content") || null
    },

    params,

    raw: {
      forced_partnerize_pepperjam: true,
      publisherId,
      network
    }
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: true,
      message: "Method not allowed"
    });
  }

  try {
    const url =
      req.body?.url ||
      req.query?.url ||
      "";

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        ok: false,
        error: true,
        message: "Missing or invalid URL"
      });
    }

    const inputUrl = url.trim();
    const urlObj = safeUrl(inputUrl);

    if (!urlObj) {
      return res.status(400).json({
        ok: false,
        error: true,
        message: "Invalid URL"
      });
    }

    const params = getParams(urlObj);

    if (isFuturePublishing(params)) {
      return res.status(200).json(
        buildFuturePublishingResult(inputUrl, urlObj, params)
      );
    }

    if (isPartnerizePepperjam(params)) {
      return res.status(200).json(
        buildPartnerizePepperjamResult(inputUrl, urlObj, params)
      );
    }

    const result = analyzeLink(inputUrl);

    return res.status(200).json({
      ...result,
      ok: result?.ok !== false,
      error: false
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: true,
      message: err.message || "Analyze failed"
    });
  }
};
