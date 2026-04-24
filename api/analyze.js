const { detectPublisherByUrl } = require("../lib/publisher-database");
const { detectPublisherByAmazonTag } = require("../lib/amazon-tag-publisher-map");

/**
 * BrandShuo Analyze v3.0
 * Single-file backend version for Vercel / GitHub
 * Focus:
 * - 30+ Affiliate Network Detection
 * - SaaS Affiliate Tracking Detection
 * - Publisher Learning / Needs Verification
 * - Frontend compatibility fields preserved
 */

const VERSION = "BrandShuo Analyze v3.0 Modular Intelligence Engine";

/* -----------------------------
   Basic URL Helpers
------------------------------ */

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

function val(params, key) {
  return String(params[key] || "").toLowerCase();
}

function decodeValue(value) {
  try {
    return decodeURIComponent(String(value || "")).toLowerCase();
  } catch {
    return String(value || "").toLowerCase();
  }
}

function getCombinedSignalText(params, rawUrl) {
  return [
    params.aff,
    params.publisher,
    params.aff_user_id,
    params.ven1,
    params.ven2,
    params.sharedid,
    params.subid,
    params.subid1,
    params.subid2,
    params.subid3,
    params.sid,
    params.sourceid,
    params.utm_source,
    params.utm_medium,
    params.utm_campaign,
    params.utm_content,
    params.cid,
    params.rktevent,
    params.raneaid,
    params.ransiteid,
    params.cj_publishercid,
    params.wmlspartner,
    params.campaign_id,
    params.coupon,
    params.m,
    rawUrl
  ]
    .filter(Boolean)
    .map(decodeValue)
    .join(" ");
}

/* -----------------------------
   Merchant Detection
------------------------------ */

function detectPlatform(host) {
  if (!host) return "Unknown Merchant";

  const rules = [
    ["samsung.", "Samsung"],
    ["lg.com", "LG"],
    ["dell.", "Dell"],
    ["walmart.", "Walmart"],
    ["amazon.", "Amazon"],
    ["ebay.", "eBay"],
    ["target.", "Target"],
    ["bestbuy.", "Best Buy"],
    ["homedepot.", "The Home Depot"],
    ["lowes.", "Lowe's"],
    ["wayfair.", "Wayfair"],
    ["auslogics.", "Auslogics"],
    ["lenovo.", "Lenovo"],
    ["hp.com", "HP"],
    ["newegg.", "Newegg"],
    ["bhphotovideo.", "B&H Photo"],
    ["adorama.", "Adorama"],
    ["costco.", "Costco"],
    ["staples.", "Staples"],
    ["officedepot.", "Office Depot"],
    ["microsoft.", "Microsoft"],
    ["apple.", "Apple"],
    ["logitech.", "Logitech"],
    ["razer.", "Razer"],
    ["asus.", "ASUS"],
    ["acer.", "Acer"],
    ["msi.", "MSI"]
  ];

  const found = rules.find(([domain]) => host.includes(domain));
  return found ? found[1] : "Unknown Merchant";
}

/* -----------------------------
   Paid Layer Detection
------------------------------ */

function detectPaidLayer(params) {
  const signals = [];

  if (params.gclid) signals.push("Google Ads");
  if (params.gad_campaignid || params.gad_source) signals.push("Google Ads");
  if (params.gbraid || params.wbraid) signals.push("Google Ads iOS");
  if (params.dclid) signals.push("DV360 / Display Ads");
  if (params.fbclid) signals.push("Meta Ads");
  if (params.ttclid) signals.push("TikTok Ads");
  if (params.msclkid) signals.push("Microsoft Ads");
  if (params.li_fat_id) signals.push("LinkedIn Ads");
  if (params.twclid) signals.push("X / Twitter Ads");
  if (params.epik) signals.push("Pinterest Ads");

  const uniqueSignals = [...new Set(signals)];

  return {
    hasPaidLayer: uniqueSignals.length > 0,
    signals: uniqueSignals,
    trafficType: uniqueSignals.length > 0 ? "Paid Media" : "Unknown"
  };
}

/* -----------------------------
   Affiliate Network Detection
------------------------------ */

function detectNetwork(params, rawUrl, host) {
  const url = String(rawUrl || "").toLowerCase();
  const isAmazon = host && host.includes("amazon.");

  const sourceid = val(params, "sourceid");
  const wmlspartner = val(params, "wmlspartner");
  const dgc = val(params, "dgc");
  const utmSource = val(params, "utm_source");
  const utmMedium = val(params, "utm_medium");
  const m = val(params, "m");

  /*
    Network priority:
    1. Strong affiliate network signals
    2. SaaS/payment affiliate networks
    3. Marketplace affiliate systems
    4. Weak publisher/subid signals as fallback only
  */

  // Impact
  if (
    hasAny(params, ["irclickid"]) ||
    params.irgwc === "1" ||
    sourceid.startsWith("imp_") ||
    wmlspartner.startsWith("imp_") ||
    url.includes("impactradius")
  ) {
    return "Impact";
  }

  // CJ Affiliate
  if (
    hasAny(params, ["cjevent", "cjdata", "cj_publishercid"]) ||
    dgc === "cj" ||
    utmSource.includes("cj-affiliate")
  ) {
    return "CJ Affiliate";
  }

  // Rakuten
  if (
    hasAny(params, ["ranmid", "ransiteid", "raneaid", "rktevent"]) ||
    url.includes("rakuten")
  ) {
    return "Rakuten";
  }

  // Awin / ShareASale
  if (hasAny(params, ["awc"])) return "Awin";
  if (hasAny(params, ["sscid"])) return "ShareASale";

  // Partnerize / Pepperjam
  if (hasAny(params, ["clickref", "click_ref"])) return "Partnerize";
  if (hasAny(params, ["pjid", "pjmid"])) return "Partnerize / Pepperjam";

  // Webgains / TradeDoubler / FlexOffers
  if (hasAny(params, ["wgcampaignid", "wgprogramid"])) return "Webgains";
  if (hasAny(params, ["tduid", "trafficsourceid"])) return "TradeDoubler";
  if (hasAny(params, ["faid", "fobs"])) return "FlexOffers";

  // Affiliate networks / CPA networks
  if (hasAny(params, ["admitad_uid"])) return "Admitad";
  if (hasAny(params, ["lcid", "atid"])) return "LinkConnector";
  if (hasAny(params, ["avantlink", "ctc"])) return "AvantLink";
  if (hasAny(params, ["epn_cid", "campid"]) && host.includes("ebay.")) return "eBay Partner Network";
  if (hasAny(params, ["subid", "affid"]) && url.includes("maxbounty")) return "MaxBounty";
  if (url.includes("cpalead")) return "CPAlead";
  if (url.includes("clickdealer")) return "ClickDealer";

  // Skimlinks / Sovrn / VigLink
  if (
    url.includes("skimlinks") ||
    hasAny(params, ["skimlinks", "xcust"])
  ) {
    return "Skimlinks";
  }

  if (
    url.includes("viglink") ||
    url.includes("sovrn") ||
    hasAny(params, ["vglnk", "vgtid"])
  ) {
    return "Sovrn / VigLink";
  }

  // Refersion / GoAffPro / UpPromote
  if (hasAny(params, ["rfsn"])) return "Refersion";
  if (hasAny(params, ["ref", "refcode"]) && url.includes("goaffpro")) return "GoAffPro";
  if (hasAny(params, ["sca_ref", "sca_source"])) return "UpPromote";

  // Everflow / TUNE / HasOffers
  if (hasAny(params, ["ef_id", "oid", "affid"]) && url.includes("everflow")) return "Everflow";
  if (hasAny(params, ["offer_id", "aff_id", "transaction_id"]) && url.includes("tune")) return "TUNE / HasOffers";

  // PartnerStack / Rewardful / FirstPromoter / Tapfiliate
  if (hasAny(params, ["ps_xid", "ps_partner_key"])) return "PartnerStack";
  if (hasAny(params, ["via", "rewardful"])) return "Rewardful";
  if (hasAny(params, ["fpr"])) return "FirstPromoter";
  if (hasAny(params, ["tap_a", "tap_s"])) return "Tapfiliate";

  // ClickBank / JVZoo / Digistore24
  if (hasAny(params, ["hop", "hoplink"]) || url.includes("clickbank")) return "ClickBank";
  if (hasAny(params, ["jvzoo", "tid"]) && url.includes("jvzoo")) return "JVZoo";
  if (hasAny(params, ["ds24tr", "digistore24"])) return "Digistore24";

  // SaaS / payment affiliate systems
  if (
    utmSource.includes("paypro") ||
    m.includes("affiliate_paypro") ||
    url.includes("payproglobal") ||
    url.includes("paypro")
  ) {
    return "PayPro Affiliate";
  }

  if (
    utmSource.includes("paddle") ||
    url.includes("paddle.com") ||
    hasAny(params, ["paddle_ref", "paddle_affiliate"])
  ) {
    return "Paddle Affiliate";
  }

  if (
    utmSource.includes("lemonsqueezy") ||
    url.includes("lemonsqueezy") ||
    hasAny(params, ["lms_affiliate", "aff_ref"])
  ) {
    return "LemonSqueezy Affiliate";
  }

  if (
    utmSource.includes("fastspring") ||
    url.includes("fastspring") ||
    hasAny(params, ["fs_affiliate", "fs_ref"])
  ) {
    return "FastSpring Affiliate";
  }

  if (
    utmSource.includes("2checkout") ||
    utmSource.includes("avangate") ||
    url.includes("2checkout") ||
    url.includes("avangate")
  ) {
    return "2Checkout / Avangate";
  }

  if (
    utmSource.includes("gumroad") ||
    url.includes("gumroad") ||
    hasAny(params, ["wanted", "gumroad_ref"])
  ) {
    return "Gumroad Affiliate";
  }

  if (
    utmSource.includes("postaffiliatepro") ||
    url.includes("postaffiliatepro") ||
    hasAny(params, ["a_aid", "a_bid"])
  ) {
    return "Post Affiliate Pro";
  }

  // Amazon special handling
  if (isAmazon) {
    if (params.tag) return "Amazon Associates";
    return "Amazon";
  }

  // Walmart affiliate fallback
  if (
    host.includes("walmart.") &&
    (params.veh === "aff" || hasAny(params, ["wmlspartner", "campaign_id"]))
  ) {
    return "Walmart Affiliate";
  }

  // Weak fallback tracking signals
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

  if (hasAny(params, ["afftrack", "affid", "affiliate_id", "publisherid"])) {
    return "Affiliate Tracking";
  }

  if (utmMedium === "affiliate") {
    return "Affiliate Tracking";
  }

  return "Unknown";
}

/* -----------------------------
   Publisher Detection
------------------------------ */

function makePublisher({
  publisher,
  domain = "",
  group = "",
  groupKey = "",
  category = "affiliate_publisher",
  region = "unknown",
  confidence = "medium",
  matchType = "param_match",
  source = "param",
  trafficType = "Affiliate",
  quality = 55,
  incrementalityRisk = "Medium"
}) {
  return {
    publisher,
    domain,
    group,
    groupKey,
    category,
    region,
    confidence,
    matchType,
    source,
    trafficType,
    quality,
    incrementalityRisk
  };
}

function detectPublisherFromParams(params, rawUrl, network) {
  const fields = getCombinedSignalText(params, rawUrl);

  // Future Publishing family
  if (
    fields.includes("future us") ||
    fields.includes("future+us") ||
    fields.includes("future publishing") ||
    fields.includes("future+publishing") ||
    fields.includes("tomsguide") ||
    fields.includes("tom's guide") ||
    fields.includes("techradar") ||
    fields.includes("pcgamer") ||
    fields.includes("laptopmag")
  ) {
    return makePublisher({
      publisher: fields.includes("tomsguide") || fields.includes("tom's guide") ? "Tom's Guide" : "Future US",
      group: "Future Publishing",
      groupKey: "future_publishing",
      category: "review_site",
      region: "US",
      confidence: "high",
      matchType: "multi_param_match",
      source: "utm_or_affiliate_param",
      trafficType: "Content / Review",
      quality: 75,
      incrementalityRisk: "Medium"
    });
  }

  // Known publishers
  if (fields.includes("cnet")) {
    return makePublisher({
      publisher: "CNET",
      domain: "cnet.com",
      group: "Red Ventures",
      groupKey: "red_ventures",
      category: "review_site",
      region: "US",
      confidence: "high",
      trafficType: "Content / Review",
      quality: 75
    });
  }

  if (fields.includes("slickdeals")) {
    return makePublisher({
      publisher: "Slickdeals",
      domain: "slickdeals.net",
      group: "Slickdeals",
      groupKey: "slickdeals",
      category: "deal_site",
      region: "US",
      confidence: "high",
      trafficType: "Deal / Coupon",
      quality: 60,
      incrementalityRisk: "High"
    });
  }

  if (fields.includes("hawk")) {
    return makePublisher({
      publisher: "Hawk",
      group: "Affiliate Publisher",
      groupKey: "hawk",
      category: "commerce_media",
      region: "US",
      confidence: "medium",
      matchType: "sharedid_match",
      source: "sharedid_param",
      trafficType: "Commerce / Affiliate",
      quality: 65
    });
  }

  if (fields.includes("retailmenot")) {
    return makePublisher({
      publisher: "RetailMeNot",
      domain: "retailmenot.com",
      group: "Ziff Davis",
      groupKey: "ziff_davis",
      category: "coupon_site",
      confidence: "high",
      trafficType: "Coupon / Deal",
      quality: 50,
      incrementalityRisk: "High"
    });
  }

  if (fields.includes("couponcabin")) {
    return makePublisher({
      publisher: "CouponCabin",
      domain: "couponcabin.com",
      group: "CouponCabin",
      category: "coupon_site",
      confidence: "high",
      trafficType: "Coupon / Deal",
      quality: 50,
      incrementalityRisk: "High"
    });
  }

  if (fields.includes("rakuten rewards") || fields.includes("ebates")) {
   
