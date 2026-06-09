const { analyzeLink } = require("../lib/analyze");

function safeUrl(input) {
  try {
    if (!input || typeof input !== "string") return null;
    let url = input.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    return new URL(url);
  } catch {
    return null;
  }
}

function getParams(urlObj) {
  const params = {};
  if (!urlObj || !urlObj.searchParams) return params;

  for (const [key, value] of urlObj.searchParams.entries()) {
    const k = String(key).toLowerCase();
    params[k] = params[k] ? `${params[k]} ${value}` : value;
  }

  return params;
}

function getParam(params, key) {
  return params[String(key || "").toLowerCase()] || "";
}

function cleanHostname(hostname = "") {
  return String(hostname || "").replace(/^www\./, "").toLowerCase().trim();
}

function toTitleCaseBrand(hostname = "") {
  const name = cleanHostname(hostname).split(".")[0].replace(/-/g, " ").trim();
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : "Merchant";
}

function detectMerchant(hostname = "") {
  const host = cleanHostname(hostname);

  if (host.includes("amazon.")) return "Amazon";
  if (host.includes("casper.")) return "Casper";
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

function isConsumerReports(params = {}) {
  const text = Object.keys(params)
    .map(k => `${k}=${params[k]}`)
    .join("&")
    .toLowerCase();

  return (
    text.includes("consumerreports") ||
    text.includes("consumer reports") ||
    text.includes("consumer-reports")
  );
}

function isPartnerBoost(params = {}) {
  const utmSource = String(getParam(params, "utm_source") || "").toLowerCase();
  const utmMedium = String(getParam(params, "utm_medium") || "").toLowerCase();
  const source = String(getParam(params, "source") || "").toLowerCase();

  return Boolean(
    getParam(params, "pb") ||
    getParam(params, "pb_id") ||
    getParam(params, "pb_clickid") ||
    getParam(params, "pb_source") ||
    utmSource.includes("partnerboost") ||
    utmMedium.includes("partnerboost") ||
    source.includes("partnerboost")
  );
}

function isLevanta(params = {}) {
  const utmSource = String(getParam(params, "utm_source") || "").toLowerCase();
  const source = String(getParam(params, "source") || "").toLowerCase();

  return Boolean(
    getParam(params, "levanta") ||
    getParam(params, "levanta_id") ||
    getParam(params, "levanta_click") ||
    utmSource.includes("levanta") ||
    source.includes("levanta")
  );
}

function isAmazonAttributionMaas(params = {}) {
  const maas = String(getParam(params, "maas")).toLowerCase();
  const ref = String(getParam(params, "ref_")).toLowerCase();
  const tag = String(getParam(params, "tag")).toLowerCase();

  // Don't match PartnerBoost-only or Levanta-only links as MAAS
  if (isPartnerBoost(params) && !(getParam(params, "aa_campaignid") || getParam(params, "aa_adgroupid") || getParam(params, "aa_creativeid") || maas.includes("maas") || ref.includes("aa_maas"))) {
    return false;
  }
  if (isLevanta(params)) return false;

  return Boolean(
    getParam(params, "aa_campaignid") ||
    getParam(params, "aa_adgroupid") ||
    getParam(params, "aa_creativeid") ||
    maas.includes("maas") ||
    ref.includes("aa_maas") ||
    tag === "maas"
  );
}

function isFuturePublishing(params = {}) {
  const text = Object.keys(params)
    .map(k => `${k}=${params[k]}`)
    .join("&")
    .toLowerCase();

  return Boolean(
    text.includes("futurepublishing") ||
    text.includes("future publishing") ||
    text.includes("tomsguide") ||
    text.includes("techradar") ||
    text.includes("laptopmag") ||
    text.includes("homesandgardens") ||
    text.includes("space.com") ||
    text.includes("livescience")
  );
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

const AMAZON_PUBLISHER_TAG_MAP = {
  "theverge02-20": {
    publisher: "The Verge",
    group: "Vox Media",
    publisherType: "Tech Editorial / Commerce",
    quality: 82,
    intent: "Medium to High Research Intent"
  },
  "tomsguide-us-20": {
    publisher: "Tom's Guide",
    group: "Future plc",
    publisherType: "Review / SEO Media",
    quality: 84,
    intent: "High Research Intent"
  },
  "techradar-20": {
    publisher: "TechRadar",
    group: "Future plc",
    publisherType: "Review / SEO Media",
    quality: 84,
    intent: "High Research Intent"
  },
  "wirecutter-20": {
    publisher: "Wirecutter",
    group: "The New York Times",
    publisherType: "Review / Buyer Guide",
    quality: 88,
    intent: "High Research Intent"
  },
  "thewire06-20": {
    publisher: "Wirecutter",
    group: "The New York Times",
    publisherType: "Review / Buyer Guide",
    quality: 88,
    intent: "High Research Intent"
  },
  "bestproducts-20": {
    publisher: "Best Products",
    group: "Hearst",
    publisherType: "Content Commerce",
    quality: 80,
    intent: "Medium to High Research Intent"
  },
  "cnnunderscor-20": {
    publisher: "CNN Underscored",
    group: "CNN",
    publisherType: "Content Commerce",
    quality: 82,
    intent: "Medium to High Research Intent"
  },
  "forbesvetted-20": {
    publisher: "Forbes Vetted",
    group: "Forbes",
    publisherType: "Content Commerce",
    quality: 84,
    intent: "High Research Intent"
  },
  "forbes-personal-shopper-20": {
    publisher: "Forbes Vetted",
    group: "Forbes",
    publisherType: "Content Commerce",
    quality: 84,
    intent: "High Research Intent"
  },
  "peoplemag-20": {
    publisher: "People",
    group: "Dotdash Meredith",
    publisherType: "Content Commerce",
    quality: 75,
    intent: "Medium Purchase Intent"
  },
  "travelandleisure-20": {
    publisher: "Travel + Leisure",
    group: "Dotdash Meredith",
    publisherType: "Content Commerce",
    quality: 78,
    intent: "Medium Purchase Intent"
  },
  "rollingstone-20": {
    publisher: "Rolling Stone",
    group: "Penske Media",
    publisherType: "Content Commerce",
    quality: 76,
    intent: "Medium Purchase Intent"
  },
  "spyonspecial-20": {
    publisher: "SPY",
    group: "Penske Media",
    publisherType: "Content Commerce",
    quality: 76,
    intent: "Medium Purchase Intent"
  },
  "usatodayreviewed-20": {
    publisher: "USA Today Reviewed",
    group: "Gannett",
    publisherType: "Review / SEO Media",
    quality: 82,
    intent: "High Research Intent"
  },
  "bhgcom-20": {
    publisher: "Better Homes & Gardens",
    group: "Dotdash Meredith",
    publisherType: "Home / Lifestyle Media",
    quality: 80,
    intent: "Medium to High Research Intent"
  },
  "foodnetwork-20": {
    publisher: "Food Network",
    group: "Warner Bros. Discovery",
    publisherType: "Content Commerce",
    quality: 79,
    intent: "Medium to High Research Intent"
  },
  "thespruce-20": {
    publisher: "The Spruce",
    group: "Dotdash Meredith",
    publisherType: "Home / Lifestyle Media",
    quality: 84,
    intent: "High Research Intent"
  },
  "thespruceeats-20": {
    publisher: "The Spruce Eats",
    group: "Dotdash Meredith",
    publisherType: "Food / Kitchen Commerce",
    quality: 80,
    intent: "Medium to High Research Intent"
  },
  "pcmag-20": {
    publisher: "PCMag",
    group: "Ziff Davis",
    publisherType: "Review / SEO Media",
    quality: 84,
    intent: "High Research Intent"
  },
  "cnet-buy-button-20": {
    publisher: "CNET",
    group: "Ziff Davis",
    publisherType: "Review / SEO Media",
    quality: 82,
    intent: "High Research Intent"
  }
};

function buildEditorialResult({
  inputUrl,
  urlObj,
  params,
  publisher,
  group,
  network,
  platform,
  publisherType,
  quality,
  intent,
  matchedBy,
  matchedPattern,
  merchantType = "Marketplace",
  attributionLayer = "Affiliate Tracking",
  forcedKey = "forced_editorial_result"
}) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const merchant = detectMerchant(hostname);

  const pathClassification = {
    path_label: `${publisher} → ${network} → ${merchant}`,
    path_nodes: [publisher, network, merchant],
    publisher_label: publisher,
    publisher,
    media_group: group,
    channel_role: "Editorial Commerce Publisher"
  };

  return {
    ok: true,
    error: false,
    version: "BrandShuo Analyze v4.6 Publisher Intelligence",
    engine: "BrandShuo Attribution Intelligence Engine",

    analyzed_url: inputUrl,
    input: inputUrl,
    normalizedUrl: urlObj.href,
    final_url: urlObj.href,
    domain: hostname,
    hostname,

    platform,
    merchant,
    merchant_type: merchantType,

    network,
    detection_result: network,
    attribution_system: network,
    attribution_layer: attributionLayer,
    likely_type: "Editorial Affiliate",

    publisher,
    publisher_label: publisher,
    publisher_name: publisher,
    publisher_raw_name: publisher,
    publisher_group: group,
    media_group: group,
    publisher_type: "editorial_commerce",
    publisher_category: "commerce_media",

    primary_claimer: publisher,

    traffic_type: "Editorial Affiliate",
    commercial_intent: intent,
    channel_role: "Editorial Commerce Publisher",

    traffic_quality: quality,
    quality_score: quality,
    quality_label: quality >= 80 ? "Strong" : "Good",

    incrementality_risk: "Low-Medium",
    risk: "Low-Medium",
    conflict_risk: "Low-Medium",

    confidence: "high",

    publisher_intelligence: {
      publisher,
      publisher_label: publisher,
      type: "commerce_media",
      subtype: publisherType,
      media_group: group,
      parent_media_group: group,
      confidence: "high",
      matched_by: matchedBy,
      matched_pattern: matchedPattern,
      network,
      network_type: network,
      network_confidence: "high"
    },

    intelligence: {
      pathLabel: pathClassification.path_label,
      trafficType: "Editorial Affiliate",
      commercialIntent: intent,
      channelRole: "Editorial Commerce Publisher",
      qualityScore: quality,
      qualityLabel: quality >= 80 ? "Strong" : "Good",
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
      publisher_group: group,
      amazon_layer: network.includes("Amazon") ? "Amazon Associates" : "--",
      amazon_tag: getParam(params, "tag") || null,
      domain: hostname
    },

    attribution_layer_detail: {
      merchant,
      platform,
      network,
      attribution_system: network,
      attribution_layer: attributionLayer,
      publisher,
      publisher_label: publisher,
      publisher_group: group,
      media_group: group,
      publisher_type: "editorial_commerce",
      traffic_type: "Editorial Affiliate",
      commercial_intent: intent,
      traffic_quality: quality,
      incrementality_risk: "Low-Medium",
      channel_role: "Editorial Commerce Publisher",
      confidence: "high",
      path_classification: pathClassification,
      publisher_intelligence: {
        publisher,
        publisher_label: publisher,
        type: "commerce_media",
        subtype: publisherType,
        media_group: group,
        parent_media_group: group,
        confidence: "high",
        matched_by: matchedBy,
        matched_pattern: matchedPattern,
        network
      }
    },

    signals: {
      hasAffiliateTag: true,
      hasAmazonTag: Boolean(getParam(params, "tag")),
      hasPaidClickId: false,
      hasSubId: Boolean(
        getParam(params, "ascsubtag") ||
        getParam(params, "clickref") ||
        getParam(params, "click_ref")
      ),
      hasCouponOrDealPublisher: false,
      hasEditorialPublisher: true,
      hasPartnerizePublisherId: false
    },

    evidence: {
      params,
      tag: getParam(params, "tag") || null,
      ascsubtag: getParam(params, "ascsubtag") || null,
      clickref: getParam(params, "clickref") || null,
      click_ref: getParam(params, "click_ref") || null,
      utm_source: getParam(params, "utm_source") || null,
      utm_medium: getParam(params, "utm_medium") || null,
      utm_campaign: getParam(params, "utm_campaign") || null,
      utm_term: getParam(params, "utm_term") || null,
      utm_content: getParam(params, "utm_content") || null
    },

    params,

    raw: {
      [forcedKey]: true,
      publisher,
      network,
      merchant,
      media_group: group,
      amazon_tag: getParam(params, "tag") || null
    }
  };
}

function buildAmazonPublisherTagResult(inputUrl, urlObj, params) {
  const tag = String(getParam(params, "tag")).toLowerCase();
  const matched = AMAZON_PUBLISHER_TAG_MAP[tag];

  if (!matched) return null;

  return buildEditorialResult({
    inputUrl,
    urlObj,
    params,
    publisher: matched.publisher,
    group: matched.group,
    network: "Amazon Associates",
    platform: "Amazon",
    publisherType: matched.publisherType,
    quality: matched.quality,
    intent: matched.intent,
    matchedBy: "amazon_tag",
    matchedPattern: tag,
    merchantType: "Marketplace",
    attributionLayer: "Amazon Associates Tracking Tag",
    forcedKey: "forced_amazon_publisher_tag"
  });
}

function buildConsumerReportsResult(inputUrl, urlObj, params) {
  return buildEditorialResult({
    inputUrl,
    urlObj,
    params,
    publisher: "Consumer Reports",
    group: "Consumer Reports",
    network: "Partnerize",
    platform: "Partnerize",
    publisherType: "Editorial Commerce",
    quality: 86,
    intent: "Product Research Intent",
    matchedBy: "consumer_reports_signal",
    matchedPattern: "consumerreports / consumer reports / consumer-reports",
    merchantType: "Retail / DTC",
    attributionLayer: "Partnerize Affiliate Tracking",
    forcedKey: "forced_consumer_reports"
  });
}

function buildPartnerBoostResult(inputUrl, urlObj, params) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const merchant = detectMerchant(hostname);
  const pbId = getParam(params, "pb") || getParam(params, "pb_id") || getParam(params, "pb_clickid");
  const publisher = pbId ? `PartnerBoost Creator ${pbId}` : "PartnerBoost Creator";
  const network = "PartnerBoost"; const platform = "PartnerBoost";

  const pc = { path_label: `${publisher} → ${network} → ${merchant}`, path_nodes: [publisher, network, merchant], publisher_label: publisher, publisher, media_group: "PartnerBoost Creator", channel_role: "Creator / Affiliate Attribution" };

  return { ok: true, error: false, version: "BrandShuo Analyze v4.7 PartnerBoost", engine: "BrandShuo Attribution Intelligence Engine", analyzed_url: inputUrl, input: inputUrl, normalizedUrl: urlObj.href, final_url: urlObj.href, domain: hostname, hostname, platform, merchant, merchant_type: "Retail / DTC", network, detection_result: network, attribution_system: network, likely_type: "Creator / Affiliate Network", publisher, publisher_label: publisher, publisher_name: publisher, publisher_raw_name: publisher, publisher_group: "PartnerBoost Creator", media_group: "PartnerBoost Creator", publisher_type: "creator_commerce", publisher_category: "creator_commerce", primary_claimer: publisher, traffic_type: "Creator / Affiliate", commercial_intent: "Creator Recommendation Intent", channel_role: "Creator / Affiliate Attribution", traffic_quality: 62, quality_score: 62, quality_label: "Moderate", incrementality_risk: "Medium", risk: "Medium", conflict_risk: "Medium", confidence: "high", publisher_intelligence: { publisher, publisher_label: publisher, type: "creator_commerce", subtype: "Creator / Affiliate", media_group: "PartnerBoost Creator", parent_media_group: "PartnerBoost", confidence: "high", matched_by: "partnerboost_param", matched_pattern: pbId ? "pb/pb_id" : "utm_source=partnerboost", network, network_type: "Creator / Affiliate Network", network_confidence: "high" }, intelligence: { pathLabel: pc.path_label, trafficType: "Creator / Affiliate", commercialIntent: "Creator Recommendation Intent", channelRole: "Creator / Affiliate Attribution", qualityScore: 62, qualityLabel: "Moderate", incrementalityRisk: "Medium", confidence: "high" }, path_classification: pc, path: pc.path_nodes, tracking_layer: { platform, merchant, network, publisher, publisher_label: publisher, publisher_group: "PartnerBoost Creator", amazon_layer: "--", domain: hostname }, attribution_layer: { merchant, platform, network, attribution_system: network, publisher, publisher_label: publisher, publisher_group: "PartnerBoost Creator", media_group: "PartnerBoost Creator", publisher_type: "creator_commerce", traffic_type: "Creator / Affiliate", commercial_intent: "Creator Recommendation Intent", traffic_quality: 62, incrementality_risk: "Medium", channel_role: "Creator / Affiliate Attribution", confidence: "high", path_classification: pc }, signals: { hasAffiliateTag: true, hasAmazonTag: false, hasPaidClickId: false, hasSubId: false, hasCouponOrDealPublisher: false, hasEditorialPublisher: false, hasPartnerizePublisherId: false, hasPartnerBoostId: Boolean(pbId) }, evidence: { params, pb: getParam(params, "pb") || null, pb_id: getParam(params, "pb_id") || null, pb_clickid: getParam(params, "pb_clickid") || null, utm_source: getParam(params, "utm_source") || null, utm_medium: getParam(params, "utm_medium") || null, utm_campaign: getParam(params, "utm_campaign") || null }, params, raw: { forced_partnerboost: true, pbId, network } };
}

function buildLevantaResult(inputUrl, urlObj, params) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const merchant = detectMerchant(hostname);
  const levantaId = getParam(params, "levanta") || getParam(params, "levanta_id") || getParam(params, "levanta_click");
  const publisher = levantaId ? `Levanta Creator ${levantaId}` : "Levanta Creator";
  const network = "Levanta"; const platform = "Levanta";

  const pc = { path_label: `${publisher} → ${network} → ${merchant}`, path_nodes: [publisher, network, merchant], publisher_label: publisher, publisher, media_group: "Levanta Creator", channel_role: "Creator / Affiliate Attribution" };

  return { ok: true, error: false, version: "BrandShuo Analyze v4.7 Levanta", engine: "BrandShuo Attribution Intelligence Engine", analyzed_url: inputUrl, input: inputUrl, normalizedUrl: urlObj.href, final_url: urlObj.href, domain: hostname, hostname, platform, merchant, merchant_type: "Retail / DTC", network, detection_result: network, attribution_system: network, likely_type: "Amazon Creator / Affiliate Network", publisher, publisher_label: publisher, publisher_name: publisher, publisher_raw_name: publisher, publisher_group: "Levanta Creator", media_group: "Levanta Creator", publisher_type: "creator_commerce", publisher_category: "creator_commerce", primary_claimer: publisher, traffic_type: "Creator / Influencer", commercial_intent: "Creator Recommendation Intent", channel_role: "Creator / Affiliate Attribution", traffic_quality: 64, quality_score: 64, quality_label: "Moderate", incrementality_risk: "Medium", risk: "Medium", conflict_risk: "Medium", confidence: "high", publisher_intelligence: { publisher, publisher_label: publisher, type: "creator_commerce", subtype: "Creator / Influencer", media_group: "Levanta Creator", parent_media_group: "Levanta", confidence: "high", matched_by: "levanta_param", matched_pattern: levantaId ? "levanta/levanta_id" : "utm_source=levanta", network, network_type: "Amazon Creator / Affiliate Network", network_confidence: "high" }, intelligence: { pathLabel: pc.path_label, trafficType: "Creator / Influencer", commercialIntent: "Creator Recommendation Intent", channelRole: "Creator / Affiliate Attribution", qualityScore: 64, qualityLabel: "Moderate", incrementalityRisk: "Medium", confidence: "high" }, path_classification: pc, path: pc.path_nodes, tracking_layer: { platform, merchant, network, publisher, publisher_label: publisher, publisher_group: "Levanta Creator", amazon_layer: "--", domain: hostname }, attribution_layer: { merchant, platform, network, attribution_system: network, publisher, publisher_label: publisher, publisher_group: "Levanta Creator", media_group: "Levanta Creator", publisher_type: "creator_commerce", traffic_type: "Creator / Influencer", commercial_intent: "Creator Recommendation Intent", traffic_quality: 64, incrementality_risk: "Medium", channel_role: "Creator / Affiliate Attribution", confidence: "high", path_classification: pc }, signals: { hasAffiliateTag: true, hasAmazonTag: false, hasPaidClickId: false, hasSubId: false, hasCouponOrDealPublisher: false, hasEditorialPublisher: false, hasPartnerizePublisherId: false, hasLevantaId: Boolean(levantaId) }, evidence: { params, levanta: getParam(params, "levanta") || null, levanta_id: getParam(params, "levanta_id") || null, levanta_click: getParam(params, "levanta_click") || null, utm_source: getParam(params, "utm_source") || null, utm_medium: getParam(params, "utm_medium") || null, utm_campaign: getParam(params, "utm_campaign") || null }, params, raw: { forced_levanta: true, levantaId, network } };
}

function buildAmazonAttributionMaasResult(inputUrl, urlObj, params) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const merchant = detectMerchant(hostname);

  const publisher = "Brand / Advertiser";
  const network = "Amazon Attribution";
  const platform = "PartnerBoost";
  const layer = "Amazon Attribution / MAAS";

  const pathClassification = {
    path_label: `${publisher} → ${network} → ${merchant}`,
    path_nodes: [publisher, network, merchant],
    publisher_label: publisher,
    publisher,
    media_group: null,
    channel_role: "Traffic Driver"
  };

  return {
    ok: true,
    error: false,
    version: "BrandShuo Analyze v4.6 Amazon Attribution MAAS",
    engine: "BrandShuo Attribution Intelligence Engine",

    analyzed_url: inputUrl,
    input: inputUrl,
    normalizedUrl: urlObj.href,
    final_url: urlObj.href,
    domain: hostname,
    hostname,

    platform,
    managed_by: platform,
    merchant,
    merchant_type: "Marketplace",

    network,
    detection_result: network,
    attribution_system: network,
    attribution_layer: layer,
    layer,
    likely_type: layer,

    publisher,
    publisher_label: publisher,
    publisher_name: publisher,
    publisher_raw_name: publisher,
    publisher_group: null,
    media_group: null,
    publisher_type: "advertiser",
    publisher_category: "advertiser",

    primary_claimer: publisher,
    traffic_type: "Amazon Attribution",
    commercial_intent: "High",
    channel_role: "Traffic Driver",

    traffic_quality: 72,
    quality_score: 72,
    quality_label: "Good",

    incrementality_risk: "Medium",
    risk: "Medium",
    conflict_risk: "Medium",
    confidence: "high",

    publisher_intelligence: {
      publisher,
      publisher_label: publisher,
      type: "advertiser",
      subtype: "Amazon Attribution",
      media_group: null,
      parent_media_group: null,
      confidence: "high",
      matched_by: "amazon_attribution_maas_params",
      matched_pattern: "maas / ref_=aa_maas / tag=maas / aa_campaignid / aa_adgroupid / aa_creativeid",
      network,
      network_type: "Marketplace Attribution",
      network_confidence: "high",
      platform
    },

    intelligence: {
      pathLabel: pathClassification.path_label,
      trafficType: "Amazon Attribution",
      commercialIntent: "High",
      channelRole: "Traffic Driver",
      qualityScore: 72,
      qualityLabel: "Good",
      incrementalityRisk: "Medium",
      confidence: "high"
    },

    path_classification: pathClassification,
    path: pathClassification.path_nodes,

    tracking_layer: {
      platform,
      managed_by: platform,
      merchant,
      network,
      attribution_system: network,
      attribution_layer: layer,
      layer,
      publisher,
      publisher_label: publisher,
      publisher_group: null,
      amazon_layer: layer,
      domain: hostname
    },

    attribution_layer_detail: {
      merchant,
      platform,
      managed_by: platform,
      network,
      attribution_system: network,
      attribution_layer: layer,
      layer,
      publisher,
      publisher_label: publisher,
      publisher_group: null,
      media_group: null,
      publisher_type: "advertiser",
      traffic_type: "Amazon Attribution",
      commercial_intent: "High",
      traffic_quality: 72,
      incrementality_risk: "Medium",
      channel_role: "Traffic Driver",
      confidence: "high",
      path_classification: pathClassification
    },

    signals: {
      hasAffiliateTag: true,
      hasAmazonTag: true,
      hasPaidClickId: true,
      hasSubId: false,
      hasCouponOrDealPublisher: false,
      hasEditorialPublisher: false,
      hasPartnerizePublisherId: false,
      hasAmazonAttribution: true,
      hasMaas: Boolean(getParam(params, "maas")),
      hasAaCampaignId: Boolean(getParam(params, "aa_campaignid")),
      hasAaAdgroupId: Boolean(getParam(params, "aa_adgroupid")),
      hasAaCreativeId: Boolean(getParam(params, "aa_creativeid"))
    },

    evidence: {
      params,
      tag: getParam(params, "tag") || null,
      ref_: getParam(params, "ref_") || null,
      maas: getParam(params, "maas") || null,
      aa_campaignid: getParam(params, "aa_campaignid") || null,
      aa_adgroupid: getParam(params, "aa_adgroupid") || null,
      aa_creativeid: getParam(params, "aa_creativeid") || null
    },

    params,

    raw: {
      forced_amazon_attribution_maas: true,
      managed_by: platform,
      publisher,
      network,
      merchant,
      layer
    }
  };
}

function buildFuturePublishingResult(inputUrl, urlObj, params) {
  return buildEditorialResult({
    inputUrl,
    urlObj,
    params,
    publisher: "Future Publishing",
    group: "Future plc",
    network: "Affiliate Network",
    platform: "DTC",
    publisherType: "Editorial Commerce",
    quality: 84,
    intent: "Product Research Intent",
    matchedBy: "future_publishing_signal",
    matchedPattern: "futurepublishing / future publishing / Future-owned publisher",
    merchantType: "Retail / DTC",
    attributionLayer: "Affiliate Network",
    forcedKey: "forced_future_publishing"
  });
}

function buildPartnerizePepperjamResult(inputUrl, urlObj, params) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const merchant = detectMerchant(hostname);

  const publisherId = getParam(params, "pj_publisherid") || getParam(params, "publisherid");
  const publisher = publisherId ? `Publisher ID ${publisherId}` : "Unknown Publisher";

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
    version: "BrandShuo Analyze v4.6 Partnerize",
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
      matched_pattern: "pj_publisherid / publisherId / source=pepperjam / utm_source=partnerize / clickref",
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
      path_classification: pathClassification
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
      clickref: getParam(params, "clickref") || null,
      click_ref: getParam(params, "click_ref") || null,
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

const { withRateLimit } = require("../lib/rate-limiter");
const { withCache } = require("../lib/cache");

module.exports = withRateLimit(withCache(async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key, X-No-Cache");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: true,
      message: "Method not allowed"
    });
  }

  try {
    const url = req.body?.url || req.query?.url || "";

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

    if (isConsumerReports(params)) {
      return res.status(200).json(buildConsumerReportsResult(inputUrl, urlObj, params));
    }

    if (isLevanta(params)) {
      return res.status(200).json(buildLevantaResult(inputUrl, urlObj, params));
    }

    if (isPartnerBoost(params)) {
      return res.status(200).json(buildPartnerBoostResult(inputUrl, urlObj, params));
    }

    if (isAmazonAttributionMaas(params)) {
      return res.status(200).json(buildAmazonAttributionMaasResult(inputUrl, urlObj, params));
    }

    const amazonPublisherTagResult = buildAmazonPublisherTagResult(inputUrl, urlObj, params);

    if (amazonPublisherTagResult) {
      return res.status(200).json(amazonPublisherTagResult);
    }

    if (isFuturePublishing(params)) {
      return res.status(200).json(buildFuturePublishingResult(inputUrl, urlObj, params));
    }

    if (isPartnerizePepperjam(params)) {
      return res.status(200).json(buildPartnerizePepperjamResult(inputUrl, urlObj, params));
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
      message: err.message || "Analyze failed",
      request_id: require("crypto").randomBytes(4).toString("hex")
    });
  }
}));
