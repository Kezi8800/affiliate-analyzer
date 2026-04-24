const { detectPublisherByUrl } = require("../lib/publisher-database");
const { detectPublisherByAmazonTag } = require("../lib/amazon-tag-publisher-map");

function safeUrl(input) {
  try {
    if (!input) return null;

    let url = String(input).trim();

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    return new URL(url);
  } catch {
    return null;
  }
}

function getParams(u) {
  const params = {};

  if (!u) return params;

  for (const [k, v] of u.searchParams.entries()) {
    params[k.toLowerCase()] = v;
  }

  return params;
}

function hasAny(params, keys) {
  return keys.some((k) => {
    const key = k.toLowerCase();
    return params[key] !== undefined && params[key] !== null && params[key] !== "";
  });
}

function detectPlatform(host) {
  if (!host) return "Unknown Merchant";

  if (host.includes("dell.")) return "Dell";
  if (host.includes("amazon.")) return "Amazon";
  if (host.includes("walmart.")) return "Walmart";
  if (host.includes("ebay.")) return "eBay";
  if (host.includes("target.")) return "Target";
  if (host.includes("bestbuy.")) return "Best Buy";
  if (host.includes("homedepot.")) return "The Home Depot";
  if (host.includes("lowes.")) return "Lowe's";
  if (host.includes("wayfair.")) return "Wayfair";

  return "Unknown Merchant";
}

function detectNetwork(params, rawUrl, host) {
  const url = String(rawUrl || "").toLowerCase();
  const isAmazon = host && host.includes("amazon.");

  if (hasAny(params, ["irclickid"]) || url.includes("impactradius")) {
    return "Impact";
  }

  if (
    hasAny(params, ["cjevent", "cjdata"]) ||
    String(params.dgc || "").toLowerCase() === "cj"
  ) {
    return "CJ Affiliate";
  }

  if (hasAny(params, ["awc"])) {
    return "Awin";
  }

  if (hasAny(params, ["ranmid", "ransiteid", "raneaid"])) {
    return "Rakuten";
  }

  if (hasAny(params, ["clickref", "click_ref"])) {
    return "Partnerize";
  }

  if (hasAny(params, ["sscid"])) {
    return "ShareASale";
  }

  if (hasAny(params, ["tduid", "trafficsourceid"])) {
    return "TradeDoubler";
  }

  if (hasAny(params, ["wgcampaignid", "wgprogramid"])) {
    return "Webgains";
  }

  if (hasAny(params, ["faid", "fobs"])) {
    return "FlexOffers";
  }

  if (hasAny(params, ["pjid", "pjmid"])) {
    return "Partnerize / Pepperjam";
  }

  if (hasAny(params, ["admitad_uid"])) {
    return "Admitad";
  }

  /*
    Paid click ids are traffic layers, not affiliate networks.
    Do not return Google Ads / Meta Ads here.
  */

  if (isAmazon) {
    if (params.tag) return "Amazon Associates";
    return "Amazon";
  }

  if (hasAny(params, ["afftrack", "affid", "affiliate_id", "publisherid"])) {
    return "Affiliate Tracking";
  }

  if (hasAny(params, ["subid", "subid1", "subid2", "subid3", "sharedid", "ascsubtag"])) {
    return "Sub-affiliate / Publisher Tracking";
  }

  return "Unknown";
}

function detectPaidLayer(params) {
  const signals = [];

  if (params.gclid) signals.push("Google Ads");
  if (params.gbraid || params.wbraid) signals.push("Google Ads iOS");
  if (params.gad_campaignid || params.gad_source) signals.push("Google Ads");
  if (params.dclid) signals.push("DV360 / Display Ads");
  if (params.fbclid) signals.push("Meta Ads");
  if (params.ttclid) signals.push("TikTok Ads");
  if (params.msclkid) signals.push("Microsoft Ads");

  const uniqueSignals = [...new Set(signals)];

  return {
    hasPaidLayer: uniqueSignals.length > 0,
    signals: uniqueSignals,
    trafficType: uniqueSignals.length > 0 ? "Paid Media + Affiliate" : null
  };
}

function detectPublisherFromParams(params, rawUrl) {
  const aff = decodeURIComponent(params.aff || "").toLowerCase();
  const publisher = decodeURIComponent(params.publisher || "").toLowerCase();
  const affUserId = decodeURIComponent(params.aff_user_id || "").toLowerCase();
  const ven1 = decodeURIComponent(params.ven1 || "").toLowerCase();
  const raw = decodeURIComponent(String(rawUrl || "")).toLowerCase();

  const combined = `${aff} ${publisher} ${affUserId} ${ven1} ${raw}`;

  if (
    combined.includes("future publishing") ||
    combined.includes("tomsguide") ||
    combined.includes("tom's guide")
  ) {
    return {
      publisher: "Tom's Guide",
      domain: "tomsguide.com",
      group: "Future Publishing",
      groupKey: "future_publishing",
      category: "review_site",
      region: "US",
      confidence: "high",
      matchType: "param_match",
      source: "aff_param",
      trafficType: "Content / Review",
      quality: 75,
      incrementalityRisk: "Medium"
    };
  }

  if (combined.includes("cnet")) {
    return {
      publisher: "CNET",
      domain: "cnet.com",
      group: "Red Ventures",
      groupKey: "red_ventures",
      category: "review_site",
      region: "US",
      confidence: "high",
      matchType: "param_match",
      source: "aff_param",
      trafficType: "Content / Review",
      quality: 75,
      incrementalityRisk: "Medium"
    };
  }

  if (combined.includes("slickdeals")) {
    return {
      publisher: "Slickdeals",
      domain: "slickdeals.net",
      group: "Slickdeals",
      groupKey: "slickdeals",
      category: "deal_site",
      region: "US",
      confidence: "high",
      matchType: "param_match",
      source: "aff_param",
      trafficType: "Deal / Coupon",
      quality: 60,
      incrementalityRisk: "High"
    };
  }

  return null;
}

function getFallbackPublisherInfo() {
  return {
    publisher: "Unknown Publisher",
    domain: "",
    group: "Unknown / Needs Verification",
    groupKey: "unknown",
    category: "unknown",
    region: "unknown",
    confidence: "low",
    matchType: "none",
    source: "fallback",
    trafficType: "Unknown",
    quality: 40,
    incrementalityRisk: "Unknown"
  };
}

function detectAmazonLayer(params, host) {
  if (!host.includes("amazon.")) return null;

  const hasTag = !!params.tag;

  const linkCode = String(params.linkcode || "").toLowerCase();
  const refValue = String(params.ref_ || "").toLowerCase();

  const hasAttribution =
    hasAny(params, [
      "maas",
      "aa_campaignid",
      "aa_adgroupid",
      "aa_creativeid"
    ]) ||
    refValue.includes("aa_maas");

  const hasCreatorSignal =
    hasAny(params, ["campaignid", "linkid"]) ||
    linkCode === "tr1" ||
    linkCode === "ur2";

  const hasClassicAssociateSignal =
    hasTag ||
    hasAny(params, ["camp", "creative"]);

  if (hasAttribution) {
    return {
      layer: "Amazon Attribution",
      ownership: "Amazon Attribution / Ad Measurement",
      priority: 1
    };
  }

  if (hasCreatorSignal && hasTag) {
    return {
      layer: "Amazon Creator Connections + Associates",
      ownership: params.tag || "Creator / Publisher likely involved",
      priority: 2
    };
  }

  if (hasCreatorSignal) {
    return {
      layer: "Amazon Creator Connections Signal",
      ownership: "Creator Connections signal detected",
      priority: 3
    };
  }

  if (hasClassicAssociateSignal && hasTag) {
    return {
      layer: "Amazon Associates",
      ownership: params.tag,
      priority: 4
    };
  }

  if (hasClassicAssociateSignal) {
    return {
      layer: "Amazon Affiliate Link Signal",
      ownership: "Affiliate-style parameters detected",
      priority: 5
    };
  }

  return {
    layer: "Amazon Organic / Retail Link",
    ownership: "No affiliate tag detected",
    priority: 9
  };
}

function detectCommercialIntent(params, network, publisherInfo, paidLayer) {
  const category = publisherInfo?.category || "unknown";

  if (category === "coupon_site") return "Coupon / Checkout Intent";
  if (category === "cashback") return "Cashback / Reward Intent";
  if (category === "deal_site") return "Deal Hunting Intent";
  if (category === "review_site") return "Research / Review Intent";
  if (category === "commerce_media") return "Editorial Commerce Intent";
  if (category === "creator") return "Creator Recommendation Intent";
  if (category === "sub_affiliate") return "Syndicated Click Intent";
  if (category === "b2b_review") return "Software Evaluation Intent";

  if (network === "Amazon Associates") return "Amazon Affiliate Intent";
  if (network === "Amazon") return "Amazon Retail Intent";

  if (paidLayer?.hasPaidLayer && network !== "Unknown") {
    return "Paid + Affiliate Intent";
  }

  if (network && network !== "Unknown") return "Affiliate / Partner Intent";

  if (paidLayer?.hasPaidLayer) return "Paid Traffic Intent";

  return "Unknown Intent";
}

function detectChannelRole(params, network, publisherInfo, paidLayer) {
  const category = publisherInfo?.category || "unknown";

  if (category === "coupon_site") return "Last-click / Checkout Interceptor";
  if (category === "cashback") return "Loyalty / Cashback Layer";
  if (category === "deal_site") return "Promo Discovery / Lower Funnel";
  if (category === "review_site") return "Mid-funnel Review Assist";
  if (category === "commerce_media") return "Editorial Discovery / Consideration";
  if (category === "creator") return "Demand Creation / Creator Influence";
  if (category === "sub_affiliate") return "Tracking / Syndication Layer";
  if (category === "b2b_review") return "Lead Assist / Evaluation Layer";

  if (network === "Amazon Associates") return "Affiliate / Publisher Attribution";
  if (network === "Amazon") return "Retail / Marketplace Destination";

  if (paidLayer?.hasPaidLayer && network !== "Unknown") {
    return "Paid Acquisition + Affiliate Network Layer";
  }

  if (network && network !== "Unknown") return "Affiliate Network Layer";

  if (paidLayer?.hasPaidLayer) return "Paid Acquisition";

  return "Unknown Role";
}

function detectRisk(publisherInfo, network, paidLayer) {
  if (paidLayer?.hasPaidLayer && network !== "Unknown") {
    return "High";
  }

  if (publisherInfo?.incrementalityRisk) {
    return publisherInfo.incrementalityRisk;
  }

  if (network === "Amazon Associates") return "Medium";
  if (network === "Amazon") return "Low";

  if (network && network !== "Unknown") return "Medium";

  if (paidLayer?.hasPaidLayer) return "Medium";

  return "Unknown";
}

function detectConfidence(platform, network, publisherInfo, paidLayer) {
  let score = 0;

  if (platform && platform !== "Unknown Merchant") score += 30;
  if (network && network !== "Unknown") score += 30;
  if (publisherInfo?.publisher && publisherInfo.publisher !== "Unknown Publisher") score += 30;
  if (paidLayer?.hasPaidLayer) score += 10;

  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function makePathLabel(platform, network, amazonLayer, publisherInfo, paidLayer) {
  const parts = [];

  if (paidLayer?.hasPaidLayer) {
    parts.push("Paid Media");
  }

  if (
    publisherInfo?.publisher &&
    publisherInfo.publisher !== "Unknown Publisher"
  ) {
    parts.push(publisherInfo.publisher);
  }

  if (network && network !== "Unknown") {
    parts.push(network);
  }

  if (
    amazonLayer?.layer &&
    amazonLayer.layer !== network
  ) {
    parts.push(amazonLayer.layer);
  }

  if (platform && platform !== "Unknown Merchant") {
    parts.push(platform);
  }

  if (!parts.length) return "Unknown Link Path";

  return parts.join(" → ");
}

function detectSignals(params, network, publisherInfo, paidLayer) {
  const category = publisherInfo?.category || "unknown";

  return {
    hasAffiliateTag:
      !!params.tag ||
      network !== "Unknown" ||
      hasAny(params, [
        "irclickid",
        "cjevent",
        "cjdata",
        "awc",
        "clickref",
        "sscid",
        "ranmid",
        "affid",
        "afftrack",
        "publisherid"
      ]),

    hasAmazonTag: !!params.tag,

    hasPaidClickId: paidLayer?.hasPaidLayer || false,

    hasSubId: hasAny(params, [
      "subid",
      "subid1",
      "subid2",
      "subid3",
      "ascsubtag",
      "sharedid",
      "sid",
      "aff_user_id"
    ]),

    hasCouponOrDealPublisher: [
      "coupon_site",
      "cashback",
      "deal_site"
    ].includes(category),

    hasEditorialPublisher: [
      "review_site",
      "commerce_media",
      "b2b_review"
    ].includes(category)
  };
}

function analyzeLink(inputUrl) {
  const parsed = safeUrl(inputUrl);

  if (!parsed) {
    return {
      ok: false,
      version: "BrandShuo Analyze v2.9 Param Publisher + Paid Layer",
      error: "Invalid URL",
      input: inputUrl
    };
  }

  const rawUrl = String(inputUrl).trim();
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const params = getParams(parsed);

  const platform = detectPlatform(host);
  const network = detectNetwork(params, rawUrl, host);
  const paidLayer = detectPaidLayer(params);
  const amazonLayer = detectAmazonLayer(params, host);

  /*
    Publisher detection priority:
    1. URL params, e.g. aff=Future Publishing / aff_user_id=tomsguide
    2. Amazon tag mapping, e.g. slickdeals09-20 → Slickdeals
    3. URL/domain based publisher database
    4. fallback unknown object
  */
  const publisherInfo =
    detectPublisherFromParams(params, rawUrl) ||
    detectPublisherByAmazonTag(params.tag) ||
    detectPublisherByUrl(rawUrl) ||
    getFallbackPublisherInfo();

  const commercialIntent = detectCommercialIntent(params, network, publisherInfo, paidLayer);
  const channelRole = detectChannelRole(params, network, publisherInfo, paidLayer);
  const incrementalityRisk = detectRisk(publisherInfo, network, paidLayer);
  const confidence = detectConfidence(platform, network, publisherInfo, paidLayer);
  const pathLabel = makePathLabel(platform, network, amazonLayer, publisherInfo, paidLayer);
  const signals = detectSignals(params, network, publisherInfo, paidLayer);

  let finalTrafficType = publisherInfo.trafficType || "Unknown";

  if (paidLayer.hasPaidLayer && network !== "Unknown") {
    finalTrafficType = "Paid Media + Affiliate";
  } else if (paidLayer.hasPaidLayer) {
    finalTrafficType = "Paid Media";
  }

  let qualityScore = publisherInfo.quality || 40;

  if (paidLayer.hasPaidLayer && network !== "Unknown") {
    qualityScore = Math.max(55, qualityScore - 5);
  }

  return {
    ok: true,
    version: "BrandShuo Analyze v2.9 Param Publisher + Paid Layer",

    input: rawUrl,
    normalizedUrl: parsed.href,
    domain: host,
    platform,

    network,

    amazon: amazonLayer,

    paid: paidLayer,

    publisher: {
      name: publisherInfo.publisher,
      domain: publisherInfo.domain,
      group: publisherInfo.group,
      groupKey: publisherInfo.groupKey,
      category: publisherInfo.category,
      region: publisherInfo.region,
      confidence: publisherInfo.confidence,
      matchType: publisherInfo.matchType,
      source: publisherInfo.source || "url_database"
    },

    intelligence: {
      pathLabel,
      trafficType: finalTrafficType,
      commercialIntent,
      channelRole,
      qualityScore,
      incrementalityRisk,
      confidence
    },

    signals,

    params
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const url =
      req.method === "POST"
        ? req.body?.url
        : req.query?.url;

    const result = analyzeLink(url);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      ok: false,
      version: "BrandShuo Analyze v2.9 Param Publisher + Paid Layer",
      error: err.message || "Server error"
    });
  }
};

module.exports.analyzeLink = analyzeLink;
