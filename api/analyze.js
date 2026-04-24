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

  if (hasAny(params, ["cjevent"])) {
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

  if (hasAny(params, ["gclid", "gbraid", "wbraid", "gad_campaignid"])) {
    return "Google Ads";
  }

  if (hasAny(params, ["fbclid"])) {
    return "Meta Ads";
  }

  if (hasAny(params, ["ttclid"])) {
    return "TikTok Ads";
  }

  if (hasAny(params, ["msclkid"])) {
    return "Microsoft Ads";
  }

  /*
    Amazon special rule:
    ascsubtag / subId / sharedId are publisher tracking IDs on Amazon links.
    They should remain as signal flags, not override the main network.
  */
  if (isAmazon) {
    if (params.tag) return "Amazon Associates";
    return "Amazon";
  }

  if (hasAny(params, ["afftrack", "affid", "affiliate_id"])) {
    return "Affiliate Tracking";
  }

  if (hasAny(params, ["subid", "subid1", "subid2", "subid3", "sharedid", "ascsubtag"])) {
    return "Sub-affiliate / Publisher Tracking";
  }

  return "Unknown";
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

function detectCommercialIntent(params, network, publisherInfo) {
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

  if (network && network.includes("Ads")) return "Paid Traffic Intent";
  if (network && network !== "Unknown") return "Affiliate / Partner Intent";

  return "Unknown Intent";
}

function detectChannelRole(params, network, publisherInfo) {
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

  if (network && network.includes("Ads")) return "Paid Acquisition";
  if (network && network !== "Unknown") return "Affiliate Network Layer";

  return "Unknown Role";
}

function detectRisk(publisherInfo, network) {
  if (publisherInfo?.incrementalityRisk) {
    return publisherInfo.incrementalityRisk;
  }

  if (network === "Amazon Associates") return "Medium";
  if (network === "Amazon") return "Low";

  if (network && network.includes("Ads")) return "Medium";
  if (network && network !== "Unknown") return "Medium";

  return "Unknown";
}

function makePathLabel(platform, network, amazonLayer, publisherInfo) {
  const parts = [];

  if (platform && platform !== "Unknown Merchant") {
    parts.push(platform);
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

  if (
    publisherInfo?.publisher &&
    publisherInfo.publisher !== "Unknown Publisher"
  ) {
    parts.push(publisherInfo.publisher);
  }

  if (!parts.length) return "Unknown Link Path";

  return parts.join(" → ");
}

function detectSignals(params, network, publisherInfo) {
  const category = publisherInfo?.category || "unknown";

  return {
    hasAffiliateTag:
      !!params.tag ||
      network !== "Unknown" ||
      hasAny(params, [
        "irclickid",
        "cjevent",
        "awc",
        "clickref",
        "sscid",
        "ranmid",
        "affid",
        "afftrack"
      ]),

    hasAmazonTag: !!params.tag,

    hasPaidClickId: hasAny(params, [
      "gclid",
      "gbraid",
      "wbraid",
      "fbclid",
      "ttclid",
      "msclkid"
    ]),

    hasSubId: hasAny(params, [
      "subid",
      "subid1",
      "subid2",
      "subid3",
      "ascsubtag",
      "sharedid",
      "sid"
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
      version: "BrandShuo Analyze v2.8 Amazon Tag Publisher Map",
      error: "Invalid URL",
      input: inputUrl
    };
  }

  const rawUrl = String(inputUrl).trim();
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const params = getParams(parsed);

  const platform = detectPlatform(host);
  const network = detectNetwork(params, rawUrl, host);
  const amazonLayer = detectAmazonLayer(params, host);

  /*
    Publisher detection priority:
    1. Amazon tag mapping, e.g. slickdeals09-20 → Slickdeals
    2. URL/domain based publisher database
  */
  const publisherInfo =
    detectPublisherByAmazonTag(params.tag) ||
    detectPublisherByUrl(rawUrl);

  const commercialIntent = detectCommercialIntent(params, network, publisherInfo);
  const channelRole = detectChannelRole(params, network, publisherInfo);
  const incrementalityRisk = detectRisk(publisherInfo, network);
  const pathLabel = makePathLabel(platform, network, amazonLayer, publisherInfo);
  const signals = detectSignals(params, network, publisherInfo);

  return {
    ok: true,
    version: "BrandShuo Analyze v2.8 Amazon Tag Publisher Map",

    input: rawUrl,
    normalizedUrl: parsed.href,
    domain: host,
    platform,

    network,

    amazon: amazonLayer,

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
      trafficType: publisherInfo.trafficType,
      commercialIntent,
      channelRole,
      qualityScore: publisherInfo.quality,
      incrementalityRisk
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
      version: "BrandShuo Analyze v2.8 Amazon Tag Publisher Map",
      error: err.message || "Server error"
    });
  }
};

module.exports.analyzeLink = analyzeLink;
