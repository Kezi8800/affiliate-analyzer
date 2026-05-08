// lib/detect-publisher.js
// BrandShuo Attribution Checker
// Unified Publisher Detection Adapter v4.0

const publisherDB = require("./publisher-database");

const {
  matchInternationalPublisherFromUrl
} = require("./international-publisher-rules");

const {
  enrichPublisherWithMediaGroup
} = require("./publisher-media-groups");

const {
  enrichPublisherWithCategory
} = require("./category-publisher-rules");

const {
  detectNetworkSignatureFromUrl
} = require("./network-signature-rules");

let amazonTagMap = null;

try {
  amazonTagMap = require("./amazon-tag-publisher-map");
} catch (e) {
  amazonTagMap = null;
}

/* =========================
   Basic Utils
========================= */

function safeDecode(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function cleanHostname(hostname = "") {
  return String(hostname || "")
    .replace(/^www\./, "")
    .toLowerCase()
    .trim();
}

function safeUrl(input) {
  try {
    if (!input) return null;

    let url = String(input).trim();

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    return new URL(url);
  } catch (e) {
    return null;
  }
}

function getQueryParams(urlObj) {
  const params = {};

  if (!urlObj || !urlObj.searchParams) return params;

  for (const [key, value] of urlObj.searchParams.entries()) {
    params[String(key).toLowerCase()] = value;
  }

  return params;
}

function getParam(params = {}, key = "") {
  if (!params || !key) return null;

  const direct = params[key];
  if (direct !== undefined && direct !== null && direct !== "") return direct;

  const lower = params[String(key).toLowerCase()];
  if (lower !== undefined && lower !== null && lower !== "") return lower;

  return null;
}

function hasAnyParam(params = {}, keys = []) {
  return keys.some((k) => !!getParam(params, k));
}

function includesAny(source = "", patterns = []) {
  const text = safeDecode(source).toLowerCase();

  return patterns.some((p) => {
    const pattern = String(p || "").toLowerCase().trim();
    return pattern && text.includes(pattern);
  });
}

/* =========================
   Network Detection
========================= */

function detectAffiliateNetwork(params = {}, hostname = "") {
  const host = cleanHostname(hostname);

  const sourceid = String(getParam(params, "sourceid") || "").toLowerCase();
  const wmlspartner = String(getParam(params, "wmlspartner") || "").toLowerCase();
  const dgc = String(getParam(params, "dgc") || "").toLowerCase();
  const utmSource = String(getParam(params, "utm_source") || "").toLowerCase();

  if (
    hasAnyParam(params, ["irclickid"]) ||
    getParam(params, "irgwc") === "1" ||
    sourceid.startsWith("imp_") ||
    wmlspartner.startsWith("imp_") ||
    host.includes("impactradius")
  ) {
    return "Impact";
  }

  if (
    hasAnyParam(params, ["cjevent", "cjdata", "cj_publishercid"]) ||
    dgc === "cj" ||
    utmSource.includes("cj-affiliate")
  ) {
    return "CJ Affiliate";
  }

  if (
    hasAnyParam(params, ["ranmid", "ransiteid", "raneaid"]) ||
    getParam(params, "rktevent")
  ) {
    return "Rakuten";
  }

  if (hasAnyParam(params, ["awc"])) return "Awin";
  if (hasAnyParam(params, ["clickref", "click_ref"])) return "Partnerize";
  if (hasAnyParam(params, ["sscid"])) return "ShareASale";
  if (hasAnyParam(params, ["tduid", "trafficsourceid"])) return "TradeDoubler";
  if (hasAnyParam(params, ["wgcampaignid", "wgprogramid"])) return "Webgains";
  if (hasAnyParam(params, ["faid", "fobs"])) return "FlexOffers";
  if (hasAnyParam(params, ["pjid", "pjmid"])) return "Partnerize / Pepperjam";
  if (hasAnyParam(params, ["admitad_uid"])) return "Admitad";

  if (hasAnyParam(params, ["gclid", "gbraid", "wbraid", "gad_campaignid", "gad_source"])) {
    return "Google Ads";
  }

  if (hasAnyParam(params, ["fbclid"])) return "Meta Ads";
  if (hasAnyParam(params, ["ttclid"])) return "TikTok Ads";
  if (hasAnyParam(params, ["msclkid"])) return "Microsoft Ads";

  if (host.includes("amazon.")) {
    if (getParam(params, "tag")) return "Amazon Associates";
    return "Amazon";
  }

  return "Unknown";
}

/* =========================
   Normalized Publisher Shape
========================= */

function fallbackPublisher(errorMessage = "") {
  return {
    matched: false,
    matchType: "fallback",
    publisher: "Affiliate Source",
    domain: "",
    group: "Unidentified Affiliate Source",
    groupKey: "unidentified_affiliate",
    category: "affiliate_publisher",
    region: "unknown",
    trafficType: "Affiliate",
    commercialIntent: "Affiliate / Partner Intent",
    channelRole: "Affiliate / Publisher Attribution",
    role: "Affiliate / Publisher Attribution",
    intent: "Affiliate / Partner Intent",
    quality: 45,
    confidence: "low",
    score: 45,
    incrementalityRisk: "Medium",
    reasons: [],
    notes: errorMessage || "Affiliate signal detected, but publisher could not be precisely identified."
  };
}

function normalizePublisherResult(result, source = "unknown") {
  if (!result) return null;

  const publisher =
    result.publisher ||
    result.name ||
    result.publisher_name ||
    "Affiliate Source";

  const category =
    result.category ||
    result.type ||
    "affiliate_publisher";

  const trafficType =
    result.trafficType ||
    result.traffic_type ||
    result.subtype ||
    "Affiliate";

  const commercialIntent =
    result.commercialIntent ||
    result.commercial_intent ||
    result.intent ||
    "Affiliate / Partner Intent";

  const channelRole =
    result.channelRole ||
    result.channel_role ||
    result.role ||
    "Affiliate / Publisher Attribution";

  const quality = Number(
    result.quality ||
    result.qualityScore ||
    result.traffic_quality ||
    result.score ||
    50
  );

  return {
    matched: result.matched !== false,
    matchType: result.matchType || result.matched_by || source,
    publisher,
    domain: result.domain || "",
    group: result.group || result.media_group || result.parent_media_group || "Unidentified Publisher Group",
    groupKey: result.groupKey || result.group_key || "unidentified_group",
    category,
    vertical: result.vertical || result.category || "",
    region: result.region || "unknown",
    market: result.market || "",
    trafficType,
    commercialIntent,
    channelRole,
    role: channelRole,
    intent: commercialIntent,
    quality,
    confidence: result.confidence || "medium",
    score: quality,
    incrementalityRisk: result.incrementalityRisk || result.incrementality_risk || result.risk || "Medium",
    network: result.network || "",
    network_type: result.network_type || "",
    network_confidence: result.network_confidence || "",
    network_signals: result.network_signals || [],
    source: result.source || source,
    reasons: result.reasons || [],
    notes: result.notes || "",
    raw: result.raw || result
  };
}

function toPublisherIntelligence(result) {
  const normalized = normalizePublisherResult(result, "publisher_intelligence");

  if (!normalized) {
    return {
      publisher: "Affiliate Source",
      type: "affiliate_publisher",
      subtype: "Unidentified",
      media_group: "Unidentified Affiliate Source",
      matched_by: "fallback",
      evidence: null,
      confidence: "low"
    };
  }

  return {
    publisher: normalized.publisher,
    type: normalized.category,
    subtype: normalized.trafficType,
    media_group: normalized.group,
    parent_media_group: normalized.raw?.parent_media_group || normalized.group,
    vertical: normalized.vertical || null,
    region: normalized.region || null,
    market: normalized.market || null,
    matched_by: normalized.matchType,
    evidence: normalized.raw || normalized.reasons || null,
    confidence: normalized.confidence,
    network: normalized.network || null,
    network_type: normalized.network_type || null,
    network_confidence: normalized.network_confidence || null,
    network_signals: normalized.network_signals || []
  };
}

/* =========================
   Database / Pattern Detection
========================= */

function detectFromAmazonTagMap(params = {}, rawUrl = "") {
  try {
    if (
      amazonTagMap &&
      typeof amazonTagMap.detectPublisherByAmazonTag === "function"
    ) {
      return normalizePublisherResult(
        amazonTagMap.detectPublisherByAmazonTag(
          getParam(params, "tag"),
          getParam(params, "ascsubtag"),
          rawUrl
        ),
        "amazon_tag_map"
      );
    }

    return null;
  } catch (e) {
    return null;
  }
}

function detectFromPublisherDB(input = {}) {
  try {
    if (publisherDB && typeof publisherDB.detectPublisherUniversal === "function") {
      return normalizePublisherResult(
        publisherDB.detectPublisherUniversal(input),
        "publisher_database_universal"
      );
    }

    if (publisherDB && typeof publisherDB.detectPublisherByUrl === "function") {
      return normalizePublisherResult(
        publisherDB.detectPublisherByUrl(input.url || input.inputUrl || ""),
        "publisher_database_url"
      );
    }

    if (publisherDB && typeof publisherDB.detectPublisherByAmazonParams === "function") {
      return normalizePublisherResult(
        publisherDB.detectPublisherByAmazonParams(input.params || {}),
        "publisher_database_amazon_params"
      );
    }

    return null;
  } catch (err) {
    return null;
  }
}

function detectFromExtendedRules(urlObj, params = {}, rawUrl = "") {
  try {
    if (!urlObj) return null;

    const intl = matchInternationalPublisherFromUrl(urlObj, params);

    if (!intl) return null;

    let baseRaw = {
      ...intl,
      matched: true,
      publisher: intl.publisher,
      domain: urlObj?.hostname || "",
      group: intl.media_group || "International Publisher",
      groupKey: String(intl.media_group || "intl")
        .toLowerCase()
        .replace(/\s+/g, "_"),
      category: intl.type || "publisher",
      region: intl.region || "Global",
      market: intl.market || "",
      trafficType: intl.subtype || intl.type || "Affiliate",
      commercialIntent: "Commerce / Affiliate Intent",
      channelRole: "Affiliate / Commerce Publisher",
      quality: intl.type && String(intl.type).toLowerCase().includes("editorial") ? 82 : 72,
      incrementalityRisk: intl.type && String(intl.type).toLowerCase().includes("deal") ? "Medium-High" : "Medium",
      confidence: intl.confidence || "Medium",
      matchType: "international_publisher_rules",
      source: "extended_rules",
      notes: intl.market || ""
    };

    baseRaw = enrichPublisherWithMediaGroup(baseRaw);
    baseRaw = enrichPublisherWithCategory(baseRaw, rawUrl);

    return normalizePublisherResult({
      ...baseRaw,
      group: baseRaw.media_group || baseRaw.parent_media_group || baseRaw.group,
      category: baseRaw.type || baseRaw.category,
      trafficType: baseRaw.subtype || baseRaw.trafficType,
      commercialIntent: baseRaw.commercial_intent || baseRaw.commercialIntent,
      raw: baseRaw
    }, "extended_rules");
  } catch (e) {
    return null;
  }
}

function detectFromCommonParams(params = {}, rawUrl = "") {
  const raw = safeDecode(rawUrl).toLowerCase();

  const fields = [
    getParam(params, "aff"),
    getParam(params, "publisher"),
    getParam(params, "aff_user_id"),
    getParam(params, "ven1"),
    getParam(params, "sharedid"),
    getParam(params, "subid"),
    getParam(params, "subid1"),
    getParam(params, "sourceid"),
    getParam(params, "utm_source"),
    getParam(params, "utm_medium"),
    getParam(params, "utm_campaign"),
    getParam(params, "utm_content"),
    getParam(params, "cid"),
    getParam(params, "rktevent"),
    getParam(params, "raneaid"),
    getParam(params, "ransiteid"),
    getParam(params, "cj_publishercid"),
    getParam(params, "ascsubtag"),
    getParam(params, "tag"),
    raw
  ]
    .filter(Boolean)
    .map((v) => safeDecode(v).toLowerCase())
    .join(" ");

  if (includesAny(fields, ["buzzfeed", "bf-sfp", "bf-shp", "bfheather", "buzz0f"])) {
    return normalizePublisherResult({
      matched: true,
      publisher: "BuzzFeed",
      domain: "buzzfeed.com",
      group: "BuzzFeed",
      groupKey: "buzzfeed",
      category: "commerce_media",
      region: "US",
      trafficType: "Editorial Commerce",
      commercialIntent: "Shopping / Content Commerce Intent",
      channelRole: "Editorial Commerce / Deal Assist",
      quality: 75,
      incrementalityRisk: "Medium",
      confidence: "high",
      matchType: "common_param_match",
      source: "params"
    });
  }

  if (includesAny(fields, ["future publishing", "tomsguide", "techradar", "pcgamer", "laptopmag", "future__tr", "cx-future-tr"])) {
    return normalizePublisherResult({
      matched: true,
      publisher: "Future Publishing",
      domain: "futureplc.com",
      group: "Future",
      groupKey: "future",
      category: "commerce_media",
      region: "US / UK / Global",
      trafficType: "SEO / Editorial Commerce",
      commercialIntent: "Editorial Commerce Intent",
      channelRole: "Editorial Discovery / Consideration",
      quality: 84,
      incrementalityRisk: "Low-Medium",
      confidence: "high",
      matchType: "common_param_match",
      source: "params"
    });
  }

  if (includesAny(fields, ["cnet", "cnetcommerce"])) {
    return normalizePublisherResult({
      matched: true,
      publisher: "CNET",
      domain: "cnet.com",
      group: "Red Ventures",
      groupKey: "red_ventures",
      category: "commerce_media",
      region: "US / Global",
      trafficType: "SEO / Editorial Commerce",
      commercialIntent: "Editorial Commerce Intent",
      channelRole: "Editorial Discovery / Consideration",
      quality: 84,
      incrementalityRisk: "Low-Medium",
      confidence: "high",
      matchType: "common_param_match",
      source: "params"
    });
  }

  if (includesAny(fields, ["slickdeals", "slickdeals09"])) {
    return normalizePublisherResult({
      matched: true,
      publisher: "Slickdeals",
      domain: "slickdeals.net",
      group: "Slickdeals",
      groupKey: "slickdeals",
      category: "Deal Community",
      region: "US",
      trafficType: "Deal / Promo",
      commercialIntent: "Deal Hunting Intent",
      channelRole: "Promo Discovery / Lower Funnel",
      quality: 72,
      incrementalityRisk: "Medium-High",
      confidence: "high",
      matchType: "common_param_match",
      source: "params"
    });
  }

  if (getParam(params, "cj_publishercid")) {
    return normalizePublisherResult({
      matched: true,
      publisher: `CJ Publisher ID ${getParam(params, "cj_publishercid")}`,
      domain: "",
      group: "CJ Affiliate Publisher",
      groupKey: "cj_publisher",
      category: "affiliate_publisher",
      region: "unknown",
      trafficType: "Affiliate",
      commercialIntent: "Affiliate / Partner Intent",
      channelRole: "Affiliate Network Layer",
      quality: 55,
      incrementalityRisk: "Medium",
      confidence: "medium",
      matchType: "cj_publisher_id",
      source: "params"
    });
  }

  if (getParam(params, "ransiteid") || getParam(params, "raneaid") || getParam(params, "rktevent")) {
    return normalizePublisherResult({
      matched: true,
      publisher: getParam(params, "ransiteid")
        ? `Rakuten Publisher ID ${getParam(params, "ransiteid")}`
        : "Rakuten Publisher",
      domain: "",
      group: "Rakuten Publisher",
      groupKey: "rakuten_publisher",
      category: "affiliate_publisher",
      region: "unknown",
      trafficType: "Affiliate",
      commercialIntent: "Affiliate / Partner Intent",
      channelRole: "Affiliate Network Layer",
      quality: 55,
      incrementalityRisk: "Medium",
      confidence: "medium",
      matchType: "rakuten_publisher_id",
      source: "params"
    });
  }

  return null;
}

function inferPublisherSmart(params = {}, rawUrl = "", hostname = "") {
  const tag = String(getParam(params, "tag") || "").toLowerCase();
  const asc = safeDecode(getParam(params, "ascsubtag") || "").toLowerCase();
  const raw = safeDecode(rawUrl || "").toLowerCase();
  const host = cleanHostname(hostname);

  if (tag.startsWith("bf") || asc.includes("bf-") || raw.includes("buzzfeed")) {
    return normalizePublisherResult({
      matched: true,
      publisher: "BuzzFeed",
      domain: "buzzfeed.com",
      group: "BuzzFeed",
      groupKey: "buzzfeed",
      category: "commerce_media",
      region: "US",
      trafficType: "Editorial Commerce",
      commercialIntent: "Shopping / Content Commerce Intent",
      channelRole: "Editorial Commerce / Deal Assist",
      quality: 70,
      incrementalityRisk: "Medium",
      confidence: "medium",
      matchType: "smart_inference",
      source: "tag_or_ascsubtag"
    });
  }

  if (tag.includes("deal") || asc.includes("deal") || raw.includes("deal")) {
    return normalizePublisherResult({
      matched: true,
      publisher: "Deal / Coupon Publisher",
      domain: "",
      group: "Unidentified Deal Publisher",
      groupKey: "unidentified_deal",
      category: "deal_site",
      region: "unknown",
      trafficType: "Deal / Coupon",
      commercialIntent: "Deal Hunting Intent",
      channelRole: "Promo Discovery / Lower Funnel",
      quality: 58,
      incrementalityRisk: "High",
      confidence: "low",
      matchType: "smart_inference",
      source: "keyword_pattern"
    });
  }

  if (
    host.includes("amazon.") &&
    (getParam(params, "tag") || getParam(params, "ascsubtag"))
  ) {
    return normalizePublisherResult({
      matched: true,
      publisher: "Amazon Affiliate Source",
      domain: "",
      group: "Unidentified Amazon Affiliate",
      groupKey: "unidentified_amazon_affiliate",
      category: "affiliate_publisher",
      region: "unknown",
      trafficType: "Amazon Affiliate",
      commercialIntent: "Amazon Affiliate Intent",
      channelRole: "Affiliate / Publisher Attribution",
      quality: 50,
      incrementalityRisk: "Medium",
      confidence: "low",
      matchType: "amazon_affiliate_fallback",
      source: "amazon_tag_or_subtag_detected"
    });
  }

  return null;
}

/* =========================
   Public Detection Functions
========================= */

function detectPublisherUniversal(input = {}) {
  try {
    const rawUrl = input.url || input.inputUrl || input.rawUrl || "";
    const urlObj = input.urlObj || safeUrl(rawUrl);
    const hostname = input.hostname || cleanHostname(urlObj?.hostname || "");
    const params = input.params || (urlObj ? getQueryParams(urlObj) : {});

    const networkSignal = urlObj
      ? detectNetworkSignatureFromUrl(urlObj, params)
      : null;

    const result =
      detectFromAmazonTagMap(params, rawUrl) ||
      detectFromExtendedRules(urlObj, params, rawUrl) ||
      detectFromCommonParams(params, rawUrl) ||
      detectFromPublisherDB({
        ...input,
        url: rawUrl,
        params,
        hostname
      }) ||
      inferPublisherSmart(params, rawUrl, hostname) ||
      fallbackPublisher();

    if (result && networkSignal && !result.network) {
      result.network = networkSignal.network;
      result.network_type = networkSignal.type;
      result.network_confidence = networkSignal.confidence;
      result.network_signals = networkSignal.matched_signals || [];
    }

    return result;
  } catch (err) {
    return fallbackPublisher(err.message);
  }
}

function detectPublisherByUrl(url) {
  const urlObj = safeUrl(url);
  const params = urlObj ? getQueryParams(urlObj) : {};

  return detectPublisherUniversal({
    url,
    urlObj,
    params,
    hostname: cleanHostname(urlObj?.hostname || "")
  });
}

function detectPublisherByAmazonParams(params = {}) {
  return (
    detectFromAmazonTagMap(params, "") ||
    detectFromCommonParams(params, "") ||
    detectFromPublisherDB({ params }) ||
    inferPublisherSmart(params, "", "") ||
    fallbackPublisher()
  );
}

function detectPublisher(input) {
  if (typeof input === "string") {
    return detectPublisherByUrl(input);
  }

  return detectPublisherUniversal(input || {});
}

function safeDetectPublisher(input = {}) {
  try {
    return detectPublisher(input);
  } catch (e) {
    return fallbackPublisher(e.message);
  }
}

function buildPublisherIntelligence(urlObj, options = {}) {
  const result = detectPublisherUniversal({
    urlObj,
    url: urlObj?.href || "",
    params: urlObj ? getQueryParams(urlObj) : {},
    hostname: cleanHostname(urlObj?.hostname || ""),
    ...options
  });

  return toPublisherIntelligence(result);
}

function getPublisherStats() {
  const stats = {
    adapterVersion: "v4.0",
    supports: [
      "amazon_tag_map",
      "ascsubtag_patterns",
      "domain_patterns",
      "publisher_database",
      "international_publisher_rules",
      "publisher_media_groups",
      "category_publisher_rules",
      "network_signature_rules",
      "smart_inference",
      "affiliate_fallback"
    ]
  };

  if (publisherDB && typeof publisherDB.getPublisherStats === "function") {
    stats.publisherDatabase = publisherDB.getPublisherStats();
  }

  if (
    amazonTagMap &&
    typeof amazonTagMap.getAmazonPublisherMapStats === "function"
  ) {
    stats.amazonPublisherMap = amazonTagMap.getAmazonPublisherMapStats();
  }

  return stats;
}

module.exports = {
  buildPublisherIntelligence,
  cleanHostname,
  getQueryParams,
  getParam,
  detectAffiliateNetwork,

  detectPublisher,
  safeDetectPublisher,
  detectPublisherByUrl,
  detectPublisherByAmazonParams,
  detectPublisherUniversal,

  getPublisherStats
};
