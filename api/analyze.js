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
  if (host.includes("nectarsleep.")) return "Nectar Sleep";

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
    hasAny(params, ["irclickid", "cidimp"]) ||
    params.irgwc === "1" ||
    sourceid.startsWith("imp_") ||
    wmlspartner.startsWith("imp_") ||
    url.includes("impactradius") ||
    utmSource.includes("impact")
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
