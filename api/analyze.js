const { detectPublisherByUrl } = require("../lib/publisher-database");

function safeUrl(input) {
  try {
    if (!input) return null;
    let url = String(input).trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
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
  return keys.some((k) => params[k.toLowerCase()]);
}

function detectPlatform(host) {
  if (host.includes("amazon.")) return "Amazon";
  if (host.includes("walmart.")) return "Walmart";
  if (host.includes("ebay.")) return "eBay";
  if (host.includes("target.")) return "Target";
  if (host.includes("bestbuy.")) return "Best Buy";
  return "Unknown Merchant";
}

function detectNetwork(params, rawUrl) {
  const url = rawUrl.toLowerCase();

  if (hasAny(params, ["irclickid"]) || url.includes("impactradius")) return "Impact";
  if (hasAny(params, ["cjevent"])) return "CJ Affiliate";
  if (hasAny(params, ["awc"])) return "Awin";
  if (hasAny(params, ["ranmid", "ranSiteID", "ranEAID"])) return "Rakuten";
  if (hasAny(params, ["clickref", "click_ref"])) return "Partnerize";
  if (hasAny(params, ["sscid"])) return "ShareASale";
  if (hasAny(params, ["afftrack", "affid"])) return "Affiliate Tracking";
  if (hasAny(params, ["subid", "subid1", "subid2", "subid3"])) return "Sub-affiliate / Publisher Tracking";
  if (hasAny(params, ["gclid", "gbraid", "wbraid"])) return "Google Ads";
  if (hasAny(params, ["fbclid"])) return "Meta Ads";
  if (hasAny(params, ["ttclid"])) return "TikTok Ads";
  if (hasAny(params, ["msclkid"])) return "Microsoft Ads";

  return "Unknown";
}

function detectAmazonLayer(params, host) {
  if (!host.includes("amazon.")) return null;

  const hasTag = !!params.tag;
  const hasAttribution =
    hasAny(params, [
      "maas",
      "aa_campaignid",
      "aa_adgroupid",
      "aa_creativeid",
      "ref_",
    ]) || String(params.ref_ || "").includes("aa_maas");

  const hasACC =
    hasAny(params, ["campaignid", "linkid"]) ||
    params.linkcode === "tr1" ||
    params.linkcode === "ur2";

  if (hasAttribution) {
    return {
      layer: "Amazon Attribution",
      ownership: "Amazon Attribution / Ad Measurement",
      priority: 1,
    };
  }

  if (hasACC && hasTag) {
    return {
      layer: "Amazon Creator Connections + Associates",
      ownership: "Creator / Publisher likely involved",
      priority: 2,
    };
  }

  if (hasACC) {
    return {
      layer: "Amazon Creator Connections Signal",
      ownership: "Creator Connections signal detected",
      priority: 3,
    };
  }

  if (hasTag) {
    return {
      layer: "Amazon Associates",
      ownership: params.tag,
      priority: 4,
    };
  }

  return {
    layer: "Amazon Organic / Retail Link",
    ownership: "No affiliate tag detected",
    priority: 9,
  };
}

function detectCommercialIntent(params, network, publisherInfo) {
  const category = publisherInfo.category;

  if (category === "coupon_site") return "Coupon / Checkout Intent";
  if (category === "cashback") return "Cashback / Reward Intent";
  if (category === "deal_site") return "Deal Hunting Intent";
  if (category === "review_site") return "Research / Review Intent";
  if (category === "commerce_media") return "Editorial Commerce Intent";
  if (category === "creator") return "Creator Recommendation Intent";

  if (network.includes("Ads")) return "Paid Traffic Intent";
  if (network !== "Unknown") return "Affiliate / Partner Intent";

  return "Unknown Intent";
}

function detectChannelRole(params, network, publisherInfo) {
  const category = publisherInfo.category;

  if (category === "coupon_site") return "Last-click / Checkout Interceptor";
  if (category === "cashback") return "Loyalty / Cashback Layer";
  if (category === "deal_site") return "Promo Discovery / Lower Funnel";
  if (category === "review_site") return "Mid-funnel Review Assist";
  if (category === "commerce_media") return "Editorial Discovery / Consideration";
  if (category === "creator") return "Demand Creation / Creator Influence";
  if (category === "sub_affiliate") return "Tracking / Syndication Layer";

  if (network.includes("Ads")) return "Paid Acquisition";
  if (network !== "Unknown") return "Affiliate Network Layer";

  return "Unknown Role";
}

function detectRisk(publisherInfo, network) {
  if (publisherInfo.incrementalityRisk) return publisherInfo.incrementalityRisk;
  if (network.includes("Ads")) return "Medium";
  if (network !== "Unknown") return "Medium";
  return "Unknown";
}

function makePathLabel(platform, network, amazonLayer, publisherInfo) {
  const parts = [];

  if (platform && platform !== "Unknown Merchant") parts.push(platform);
  if (network && network !== "Unknown") parts.push(network);
  if (amazonLayer?.layer) parts.push(amazonLayer.layer);
  if (publisherInfo?.publisher && publisherInfo.publisher !== "Unknown Publisher") {
    parts.push(publisherInfo.publisher);
  }

  if (!parts.length) return "Unknown Link Path";
  return parts.join(" → ");
}

function analyzeLink(inputUrl) {
  const parsed = safeUrl(inputUrl);

  if (!parsed) {
    return {
      ok: false,
      version: "BrandShuo Analyze v2.5 Publisher DB",
      error: "Invalid URL",
      input: inputUrl,
    };
  }

  const rawUrl = String(inputUrl).trim();
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const params = getParams(parsed);

  const platform = detectPlatform(host);
  const network = detectNetwork(params, rawUrl);
  const amazonLayer = detectAmazonLayer(params, host);
  const publisherInfo = detectPublisherByUrl(rawUrl);

  const commercialIntent = detectCommercialIntent(params, network, publisherInfo);
  const channelRole = detectChannelRole(params, network, publisherInfo);
  const incrementalityRisk = detectRisk(publisherInfo, network);
  const pathLabel = makePathLabel(platform, network, amazonLayer, publisherInfo);

  const signals = {
    hasAffiliateTag: !!params.tag || network !== "Unknown",
    hasAmazonTag: !!params.tag,
    hasPaidClickId: hasAny(params, ["gclid", "gbraid", "wbraid", "fbclid", "ttclid", "msclkid"]),
    hasSubId: hasAny(params, ["subid", "subid1", "subid2", "subid3", "ascsubtag", "sharedid"]),
    hasCouponOrDealPublisher: ["coupon_site", "cashback", "deal_site"].includes(publisherInfo.category),
    hasEditorialPublisher: ["review_site", "commerce_media"].includes(publisherInfo.category),
  };

  return {
    ok: true,
    version: "BrandShuo Analyze v2.5 Publisher DB",

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
    },

    intelligence: {
      pathLabel,
      trafficType: publisherInfo.trafficType,
      commercialIntent,
      channelRole,
      qualityScore: publisherInfo.quality,
      incrementalityRisk,
    },

    signals,

    params,
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
      version: "BrandShuo Analyze v2.5 Publisher DB",
      error: err.message || "Server error",
    });
  }
};

module.exports.analyzeLink = analyzeLink;
