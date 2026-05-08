const publisherDB = require("../lib/publisher-database");
const detectPublisherAdapter = require("../lib/detect-publisher");
const { detectPublisherByAmazonTag } = require("../lib/amazon-tag-publisher-map");

function detectPublisherByUrl(url) {
  try {
    if (
      detectPublisherAdapter &&
      typeof detectPublisherAdapter.detectPublisherByUrl === "function"
    ) {
      return detectPublisherAdapter.detectPublisherByUrl(url);
    }

    if (
      publisherDB &&
      typeof publisherDB.detectPublisherByUrl === "function"
    ) {
      return publisherDB.detectPublisherByUrl(url);
    }

    if (
      publisherDB &&
      typeof publisherDB.detectPublisherUniversal === "function"
    ) {
      return publisherDB.detectPublisherUniversal({ url });
    }

    return null;
  } catch (e) {
    return null;
  }
}

function safeDecode(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

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

function normalizePublisherInfo(info) {
  if (!info) return null;

  return {
    publisher: info.publisher || info.name || "Affiliate Source",
    domain: info.domain || "",
    group: info.group || info.media_group || "Unidentified Affiliate Source",
    groupKey: info.groupKey || info.group_key || "unidentified_affiliate",
    category: info.category || info.type || "affiliate_publisher",
    region: info.region || "unknown",
    confidence: info.confidence || "low",
    matchType: info.matchType || info.matched_by || "unknown_match",
    source: info.source || "publisher_database",
    trafficType: info.trafficType || info.traffic_type || "Affiliate",
    commercialIntent: info.commercialIntent || info.intent || "Affiliate / Partner Intent",
    channelRole: info.channelRole || info.role || "Affiliate / Publisher Attribution",
    quality: Number(info.quality || info.qualityScore || 50),
    incrementalityRisk: info.incrementalityRisk || info.risk || "Medium"
  };
}

function buildPublisherLabel(publisher, group) {
  const p = String(publisher || "").trim();
  const g = String(group || "").trim();

  if (
    p &&
    g &&
    p.toLowerCase() !== g.toLowerCase() &&
    !g.toLowerCase().includes("unidentified") &&
    !g.toLowerCase().includes("affiliate ecosystem")
  ) {
    return `${p}（${g}）`;
  }

  return p || "Affiliate Source";
}

function toTitleCaseBrand(host) {
  const brandName = String(host || "")
    .replace(/^www\./, "")
    .split(".")[0]
    .replace(/-/g, " ")
    .trim();

  return brandName
    ? brandName.charAt(0).toUpperCase() + brandName.slice(1)
    : "DTC Merchant";
}

function detectPlatform(host) {
  if (!host) return "Unknown Merchant";

  if (host.includes("samsung.")) return "Samsung";
  if (host.includes("lg.com")) return "LG";
  if (host.includes("dell.")) return "Dell";
  if (host.includes("walmart.")) return "Walmart";
  if (host.includes("amazon.")) return "Amazon";
  if (host.includes("ebay.")) return "eBay";
  if (host.includes("target.")) return "Target";
  if (host.includes("bestbuy.")) return "Best Buy";
  if (host.includes("homedepot.")) return "The Home Depot";
  if (host.includes("lowes.")) return "Lowe's";
  if (host.includes("wayfair.")) return "Wayfair";
  if (host.includes("newegg.")) return "Newegg";
  if (host.includes("casabrews.")) return "Casabrews";

  return toTitleCaseBrand(host);
}

function detectNetwork(params, rawUrl, host) {
  const url = String(rawUrl || "").toLowerCase();
  const isAmazon = host && host.includes("amazon.");

  const sourceid = String(params.sourceid || "").toLowerCase();
  const wmlspartner = String(params.wmlspartner || "").toLowerCase();
  const dgc = String(params.dgc || "").toLowerCase();
  const utmSource = String(params.utm_source || "").toLowerCase();

  if (
    hasAny(params, ["irclickid"]) ||
    params.irgwc === "1" ||
    sourceid.startsWith("imp_") ||
    wmlspartner.startsWith("imp_") ||
    url.includes("impactradius")
  ) {
    return "Impact";
  }

  if (
    hasAny(params, ["cjevent", "cjdata", "cj_publishercid"]) ||
    dgc === "cj" ||
    utmSource.includes("cj-affiliate")
  ) {
    return "CJ Affiliate";
  }

  if (
    hasAny(params, ["ranmid", "ransiteid", "raneaid", "affid", "affname", "asubid"]) ||
    params.rktevent ||
    url.includes("afc-ran-com")
  ) {
    return "Rakuten";
  }

  if (hasAny(params, ["awc"])) return "Awin";
  if (hasAny(params, ["clickref", "click_ref"])) return "Partnerize";
  if (hasAny(params, ["sscid"])) return "ShareASale";
  if (hasAny(params, ["tduid", "trafficsourceid"])) return "TradeDoubler";
  if (hasAny(params, ["wgcampaignid", "wgprogramid"])) return "Webgains";
  if (hasAny(params, ["faid", "fobs"])) return "FlexOffers";
  if (hasAny(params, ["pjid", "pjmid"])) return "Partnerize / Pepperjam";
  if (hasAny(params, ["admitad_uid"])) return "Admitad";

  if (isAmazon) {
    if (params.tag) return "Amazon Associates";
    return "Amazon";
  }

  if (
    hasAny(params, [
      "subid",
      "subid1",
      "subid2",
      "subid3",
      "ascsubtag",
      "sharedid",
      "sid"
    ])
  ) {
    return "Sub-affiliate / Publisher Tracking";
  }

  if (hasAny(params, ["afftrack", "affiliate_id", "publisherid"])) {
    return "Affiliate Tracking";
  }

  return "Unknown";
}

function detectPaidLayer(params) {
  const signals = [];

  if (params.gclid) signals.push("Google Ads");
  if (params.gad_campaignid || params.gad_source) signals.push("Google Ads");
  if (params.gbraid || params.wbraid) signals.push("Google Ads iOS");
  if (params.dclid) signals.push("DV360 / Display Ads");
  if (params.fbclid) signals.push("Meta Ads");
  if (params.ttclid) signals.push("TikTok Ads");
  if (params.msclkid) signals.push("Microsoft Ads");

  const uniqueSignals = [...new Set(signals)];

  return {
    hasPaidLayer: uniqueSignals.length > 0,
    signals: uniqueSignals,
    trafficType: uniqueSignals.length > 0 ? "Paid Media" : "Unknown"
  };
}

function detectPublisherFromParams(params, rawUrl) {
  const fields = [
    params.aff,
    params.affid,
    params.affname,
    params.publisher,
    params.aff_user_id,
    params.ven1,
    params.sharedid,
    params.subid,
    params.subid1,
    params.asubid,
    params.asid,
    params.sourceid,
    params.utm_source,
    params.utm_medium,
    params.utm_campaign,
    params.utm_content,
    params.cid,
    params.rktevent,
    params.raneaid,
    params.ransiteid,
    params.ranmid,
    params.cj_publishercid,
    params.ascsubtag,
    params.tag,
    rawUrl
  ]
    .filter(Boolean)
    .map((v) => safeDecode(v).toLowerCase())
    .join(" ");

  // Future Publishing media brands — specific publisher first
  if (
    fields.includes("techradar") ||
    fields.includes("fttr-techradar") ||
    fields.includes("cx-future-tr") ||
    fields.includes("future__tr")
  ) {
    return {
      publisher: "TechRadar",
      domain: "techradar.com",
      group: "Future Publishing",
      groupKey: "future",
      category: "commerce_media",
      region: "US / UK / Global",
      confidence: "high",
      matchType: "future_media_match",
      source: "future_param",
      trafficType: "SEO / Editorial Commerce",
      commercialIntent: "Editorial Commerce Intent",
      channelRole: "Editorial Discovery / Consideration",
      quality: 84,
      incrementalityRisk: "Low"
    };
  }

  if (
    fields.includes("tomsguide") ||
    fields.includes("tom's guide") ||
    fields.includes("tomsguide-us") ||
    fields.includes("cx-future-tg") ||
    fields.includes("future__tg")
  ) {
    return {
      publisher: "Tom's Guide",
      domain: "tomsguide.com",
      group: "Future Publishing",
      groupKey: "future",
      category: "commerce_media",
      region: "US / UK / Global",
      confidence: "high",
      matchType: "future_media_match",
      source: "future_param",
      trafficType: "SEO / Editorial Commerce",
      commercialIntent: "Editorial Commerce Intent",
      channelRole: "Editorial Discovery / Consideration",
      quality: 84,
      incrementalityRisk: "Low"
    };
  }

  if (fields.includes("laptopmag")) {
    return {
      publisher: "Laptop Mag",
      domain: "laptopmag.com",
      group: "Future Publishing",
      groupKey: "future",
      category: "commerce_media",
      region: "US / UK / Global",
      confidence: "high",
      matchType: "future_media_match",
      source: "future_param",
      trafficType: "SEO / Editorial Commerce",
      commercialIntent: "Editorial Commerce Intent",
      channelRole: "Editorial Discovery / Consideration",
      quality: 84,
      incrementalityRisk: "Low"
    };
  }

  if (fields.includes("pcgamer")) {
    return {
      publisher: "PC Gamer",
      domain: "pcgamer.com",
      group: "Future Publishing",
      groupKey: "future",
      category: "commerce_media",
      region: "US / UK / Global",
      confidence: "high",
      matchType: "future_media_match",
      source: "future_param",
      trafficType: "SEO / Editorial Commerce",
      commercialIntent: "Editorial Commerce Intent",
      channelRole: "Editorial Discovery / Consideration",
      quality: 84,
      incrementalityRisk: "Low"
    };
  }

  if (
    fields.includes("future apac") ||
    fields.includes("future publishing") ||
    fields.includes("future+apac") ||
    fields.includes("future+publishing")
  ) {
    return {
      publisher: "Future Publishing",
      domain: "futureplc.com",
      group: "Future Publishing",
      groupKey: "future",
      category: "commerce_media",
      region: fields.includes("future apac") ? "APAC / Global" : "US / UK / Global",
      confidence: "medium",
      matchType: "future_group_match",
      source: "future_param",
      trafficType: "Editorial Commerce",
      commercialIntent: "Editorial Commerce Intent",
      channelRole: "Editorial Discovery / Consideration",
      quality: 78,
      incrementalityRisk: "Low-Medium"
    };
  }

  if (fields.includes("cnet")) {
    return {
      publisher: "CNET",
      domain: "cnet.com",
      group: "Red Ventures",
      groupKey: "red_ventures",
      category: "commerce_media",
      region: "US",
      confidence: "high",
      matchType: "param_match",
      source: "aff_param",
      trafficType: "Editorial Commerce",
      commercialIntent: "Shopping / Review Intent",
      channelRole: "Editorial Discovery / Consideration",
      quality: 78,
      incrementalityRisk: "Medium"
    };
  }

  if (fields.includes("slickdeals")) {
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
      commercialIntent: "Deal Hunting Intent",
      channelRole: "Promo Discovery / Lower Funnel",
      quality: 62,
      incrementalityRisk: "High"
    };
  }

  if (params.cj_publishercid || String(params.utm_source || "").toLowerCase().includes("cj-affiliate")) {
    return {
      publisher: params.cj_publishercid
        ? `CJ Publisher ID ${params.cj_publishercid}`
        : "CJ Publisher",
      domain: "",
      group: "CJ Affiliate Publisher",
      groupKey: "cj_publisher",
      category: "affiliate_publisher",
      region: "unknown",
      confidence: "medium",
      matchType: "cj_publisher_id",
      source: "cj_param",
      trafficType: "Affiliate",
      commercialIntent: "Affiliate / Partner Intent",
      channelRole: "Affiliate Network Layer",
      quality: 55,
      incrementalityRisk: "Medium"
    };
  }

  if (params.awc || params.sscid || params.sv_campaign_id) {
    const awinParts = String(params.awc || params.sscid || "").split("_");
    const publisherId = awinParts[1] || "";

    return {
      publisher: publisherId
        ? `Awin Publisher ID ${publisherId}`
        : "Awin Publisher",
      domain: "",
      group: "Awin Publisher",
      groupKey: "awin_publisher",
      category: "affiliate_publisher",
      region: "unknown",
      confidence: "medium",
      matchType: "awin_publisher_id",
      source: "awin_param",
      trafficType: "Affiliate",
      commercialIntent: "Affiliate / Partner Intent",
      channelRole: "Affiliate Network Layer",
      quality: 55,
      incrementalityRisk: "Medium"
    };
  }

  if (
    params.ransiteid ||
    params.raneaid ||
    params.rktevent ||
    params.affid ||
    params.affname ||
    params.asubid
  ) {
    return {
      publisher: params.affname
        ? safeDecode(params.affname)
        : params.asubid
          ? `Rakuten Publisher (${safeDecode(params.asubid)})`
          : `Rakuten Publisher ID ${params.ransiteid || params.raneaid || params.affid || ""}`,
      domain: "",
      group: "Rakuten Publisher",
      groupKey: "rakuten_publisher",
      category: "affiliate_publisher",
      region: "unknown",
      confidence: "medium",
      matchType: "rakuten_publisher_id",
      source: "rakuten_param",
      trafficType: "Affiliate",
      commercialIntent: "Affiliate / Partner Intent",
      channelRole: "Affiliate Network Layer",
      quality: 55,
      incrementalityRisk: "Medium"
    };
  }

  return null;
}

function inferPublisherSmart(params, rawUrl) {
  const tag = String(params.tag || "").toLowerCase();
  const asc = safeDecode(params.ascsubtag || "").toLowerCase();
  const raw = safeDecode(rawUrl || "").toLowerCase();

  if (tag || asc) {
    if (tag.startsWith("bf") || asc.includes("bf-") || raw.includes("buzzfeed")) {
      return {
        publisher: "BuzzFeed (Inferred)",
        domain: "buzzfeed.com",
        group: "BuzzFeed",
        groupKey: "buzzfeed",
        category: "commerce_media",
        region: "US",
        confidence: "medium",
        matchType: "smart_inference",
        source: "tag_or_ascsubtag_pattern",
        trafficType: "Editorial Commerce",
        commercialIntent: "Shopping / Content Commerce Intent",
        channelRole: "Editorial Commerce / Deal Assist",
        quality: 70,
        incrementalityRisk: "Medium"
      };
    }

    if (tag.includes("deal") || asc.includes("deal")) {
      return {
        publisher: "Deal / Coupon Publisher (Inferred)",
        domain: "",
        group: "Unidentified Deal Publisher",
        groupKey: "unidentified_deal",
        category: "deal_site",
        region: "unknown",
        confidence: "low",
        matchType: "smart_inference",
        source: "tag_or_subtag_pattern",
        trafficType: "Deal / Coupon",
        commercialIntent: "Deal Hunting Intent",
        channelRole: "Promo Discovery / Lower Funnel",
        quality: 58,
        incrementalityRisk: "High"
      };
    }

    return {
      publisher: "Affiliate Source",
      domain: "",
      group: "Unidentified Affiliate Source",
      groupKey: "unidentified_affiliate",
      category: "affiliate_publisher",
      region: "unknown",
      confidence: "low",
      matchType: "affiliate_signal_fallback",
      source: "tag_or_subtag_detected",
      trafficType: "Affiliate",
      commercialIntent: "Affiliate / Partner Intent",
      channelRole: "Affiliate / Publisher Attribution",
      quality: 50,
      incrementalityRisk: "Medium"
    };
  }

  return null;
}

function getFallbackPublisherInfo() {
  return {
    publisher: "Affiliate Source",
    domain: "",
    group: "Unidentified Affiliate Source",
    groupKey: "unidentified_affiliate",
    category: "affiliate_publisher",
    region: "unknown",
    confidence: "low",
    matchType: "fallback",
    source: "fallback",
    trafficType: "Affiliate",
    commercialIntent: "Affiliate / Partner Intent",
    channelRole: "Affiliate / Publisher Attribution",
    quality: 45,
    incrementalityRisk: "Medium"
  };
}

function detectAmazonLayer(params, host) {
  if (!host.includes("amazon.")) return null;

  const hasTag = !!params.tag;
  const linkCode = String(params.linkcode || "").toLowerCase();
  const refValue = String(params.ref_ || "").toLowerCase();

  const hasAttribution =
    hasAny(params, ["maas", "aa_campaignid", "aa_adgroupid", "aa_creativeid"]) ||
    refValue.includes("aa_maas");

  const hasCreatorSignal =
    hasAny(params, ["campaignid", "linkid"]) ||
    linkCode === "tr1" ||
    linkCode === "ur2";

  const hasClassicAssociateSignal = hasTag || hasAny(params, ["camp", "creative"]);

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
  if (publisherInfo?.commercialIntent) return publisherInfo.commercialIntent;

  const category = publisherInfo?.category || "unknown";

  if (category === "coupon_site") return "Coupon / Checkout Intent";
  if (category === "cashback") return "Cashback / Reward Intent";
  if (category === "deal_site") return "Deal Hunting Intent";
  if (category === "review_site") return "Research / Review Intent";
  if (category === "commerce_media") return "Shopping / Content Commerce Intent";
  if (category === "affiliate_publisher") return "Affiliate / Partner Intent";
  if (category === "creator") return "Creator Recommendation Intent";
  if (category === "sub_affiliate") return "Syndicated Click Intent";
  if (category === "b2b_review") return "Software Evaluation Intent";

  if (network === "Amazon Associates") return "Amazon Affiliate Intent";
  if (network === "Amazon") return "Amazon Retail Intent";

  if (paidLayer?.hasPaidLayer && network !== "Unknown") return "Paid + Affiliate Intent";
  if (network && network !== "Unknown") return "Affiliate / Partner Intent";
  if (paidLayer?.hasPaidLayer) return "Paid Traffic Intent";

  return "Unknown Intent";
}

function detectChannelRole(params, network, publisherInfo, paidLayer) {
  if (publisherInfo?.channelRole) return publisherInfo.channelRole;

  const category = publisherInfo?.category || "unknown";

  if (category === "coupon_site") return "Last-click / Checkout Interceptor";
  if (category === "cashback") return "Loyalty / Cashback Layer";
  if (category === "deal_site") return "Promo Discovery / Lower Funnel";
  if (category === "review_site") return "Mid-funnel Review Assist";
  if (category === "commerce_media") return "Editorial Commerce / Deal Assist";
  if (category === "affiliate_publisher") return "Affiliate Network Layer";
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
  if (paidLayer?.hasPaidLayer && network !== "Unknown") return "High";
  if (publisherInfo?.incrementalityRisk) return publisherInfo.incrementalityRisk;

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
  if (
    publisherInfo?.publisher &&
    publisherInfo.publisher !== "Unknown Publisher" &&
    publisherInfo.publisher !== "Affiliate Source"
  ) {
    score += 30;
  }
  if (paidLayer?.hasPaidLayer) score += 10;

  if (publisherInfo?.confidence === "high") return "high";
  if (publisherInfo?.confidence === "medium" && score >= 50) return "medium";

  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function getQualityLabel(score) {
  if (score >= 70) return "Strong";
  if (score >= 50) return "Moderate";
  return "Weak";
}

function makePathLabel(platform, network, amazonLayer, publisherInfo, paidLayer) {
  const parts = [];
  const publisherLabel = buildPublisherLabel(publisherInfo?.publisher, publisherInfo?.group);

  if (paidLayer?.hasPaidLayer) parts.push("Paid Media");
  if (publisherLabel) parts.push(publisherLabel);
  if (network && network !== "Unknown") parts.push(network);

  if (amazonLayer?.layer && amazonLayer.layer !== network) {
    parts.push(amazonLayer.layer);
  }

  if (platform && platform !== "Unknown Merchant") parts.push(platform);
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
        "irgwc",
        "cjevent",
        "cjdata",
        "cj_publishercid",
        "awc",
        "clickref",
        "sscid",
        "ranmid",
        "raneaid",
        "ransiteid",
        "rktevent",
        "affid",
        "afftrack",
        "publisherid",
        "wmlspartner",
        "sourceid"
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
      "aff_user_id",
      "asubid"
    ]),
    hasCouponOrDealPublisher: ["coupon_site", "cashback", "deal_site"].includes(category),
    hasEditorialPublisher: ["review_site", "commerce_media", "b2b_review"].includes(category),
    hasCJPublisherId: !!params.cj_publishercid,
    hasRakutenPublisherId: !!params.ransiteid || !!params.raneaid || !!params.rktevent || !!params.affid
  };
}

function analyzeLink(inputUrl) {
  const parsed = safeUrl(inputUrl);

  if (!parsed) {
    return {
      ok: false,
      version: "BrandShuo Analyze v3.0.2 Publisher Group Fix",
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

  const publisherInfo = normalizePublisherInfo(
    detectPublisherByAmazonTag(params.tag, params.ascsubtag, rawUrl) ||
      detectPublisherFromParams(params, rawUrl) ||
      detectPublisherByUrl(rawUrl) ||
      inferPublisherSmart(params, rawUrl) ||
      getFallbackPublisherInfo()
  );

  const publisherLabel = buildPublisherLabel(publisherInfo.publisher, publisherInfo.group);
  const commercialIntent = detectCommercialIntent(params, network, publisherInfo, paidLayer);
  const channelRole = detectChannelRole(params, network, publisherInfo, paidLayer);
  const incrementalityRisk = detectRisk(publisherInfo, network, paidLayer);
  const confidence = detectConfidence(platform, network, publisherInfo, paidLayer);
  const pathLabel = makePathLabel(platform, network, amazonLayer, publisherInfo, paidLayer);
  const signals = detectSignals(params, network, publisherInfo, paidLayer);

  let finalTrafficType = publisherInfo.trafficType || "Affiliate";

  if (paidLayer.hasPaidLayer && network !== "Unknown") {
    finalTrafficType = "Paid Media + Affiliate";
  } else if (network !== "Unknown" && publisherInfo.publisher !== "Affiliate Source") {
    finalTrafficType = publisherInfo.trafficType || "Affiliate";
  } else if (network !== "Unknown") {
    finalTrafficType = "Affiliate";
  } else if (paidLayer.hasPaidLayer) {
    finalTrafficType = "Paid Media";
  }

  let qualityScore = publisherInfo.quality || 45;

  if (network === "Impact" && platform === "Walmart") qualityScore = Math.max(qualityScore, 60);
  if (network === "CJ Affiliate" && platform === "LG") qualityScore = Math.max(qualityScore, 55);
  if (network === "Rakuten" && platform === "Samsung") qualityScore = Math.max(qualityScore, 55);
  if (network === "Rakuten" && platform === "Newegg") qualityScore = Math.max(qualityScore, 60);
  if (paidLayer.hasPaidLayer && network !== "Unknown") qualityScore = Math.max(55, qualityScore - 5);

  const qualityLabel = getQualityLabel(qualityScore);
  const pathNodes = pathLabel.split(" → ");

  return {
    ok: true,
    version: "BrandShuo Analyze v3.0.2 Publisher Group Fix",

    input: rawUrl,
    normalizedUrl: parsed.href,
    domain: host,

    platform,
    merchant: platform,

    network,
    detection_result: network,

    amazon: amazonLayer,
    paid: paidLayer,

    publisher: {
      name: publisherInfo.publisher,
      label: publisherLabel,
      domain: publisherInfo.domain,
      group: publisherInfo.group,
      groupKey: publisherInfo.groupKey,
      category: publisherInfo.category,
      region: publisherInfo.region,
      confidence: publisherInfo.confidence,
      matchType: publisherInfo.matchType,
      source: publisherInfo.source
    },

    publisher_label: publisherLabel,
    media_group: publisherInfo.group,
    publisher_group: publisherInfo.group,

    intelligence: {
      pathLabel,
      trafficType: finalTrafficType,
      commercialIntent,
      channelRole,
      qualityScore,
      qualityLabel,
      incrementalityRisk,
      confidence
    },

    path_classification: {
      path_label: pathLabel,
      path_nodes: pathNodes,
      publisher_label: publisherLabel,
      publisher: publisherInfo.publisher,
      media_group: publisherInfo.group,
      channel_role: channelRole
    },

    publisher_intelligence: {
      publisher: publisherInfo.publisher,
      publisher_label: publisherLabel,
      type: publisherInfo.category,
      subtype: finalTrafficType,
      media_group: publisherInfo.group,
      parent_media_group: publisherInfo.group,
      confidence: publisherInfo.confidence,
      matched_by: publisherInfo.matchType,
      matched_pattern: publisherInfo.source
    },

    publisher_name: publisherLabel,
    publisher_raw_name: publisherInfo.publisher,
    publisher_category: publisherInfo.category,
    traffic_type: finalTrafficType,
    commercial_intent: commercialIntent,
    channel_role: channelRole,
    traffic_quality: qualityScore,
    quality_score: qualityScore,
    quality_label: qualityLabel,
    incrementality_risk: incrementalityRisk,
    risk: incrementalityRisk,
    confidence,

    tracking_layer: {
      platform,
      merchant: platform,
      network,
      publisher: publisherInfo.publisher,
      publisher_label: publisherLabel,
      publisher_group: publisherInfo.group,
      amazon_layer: amazonLayer?.layer || "--",
      domain: host
    },

    path: pathNodes,
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
      version: "BrandShuo Analyze v3.0.2 Publisher Group Fix",
      error: err.message || "Server error"
    });
  }
};

module.exports.analyzeLink = analyzeLink;
