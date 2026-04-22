// /lib/publisher-rules.js

const { detectAmazonPublisherFromUrl } = require("./amazon-publisher-rules");

function safeDecode(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getHostname(input = "") {
  try {
    return new URL(input).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function normalizeHostname(host = "") {
  return String(host).replace(/^www\./, "").toLowerCase();
}

function getQueryParams(input = "") {
  try {
    const u = new URL(input);
    const params = {};
    for (const [k, v] of u.searchParams.entries()) {
      params[k] = v;
    }
    return params;
  } catch {
    return {};
  }
}

function pushEvidence(arr, label, value) {
  if (value !== undefined && value !== null && value !== "") {
    arr.push({ label, value });
  }
}

function extractNumericId(value = "") {
  const m = String(value).match(/(\d{2,})/);
  return m ? m[1] : null;
}

function inferPublisherTypeByName(name = "") {
  const n = String(name).toLowerCase();

  if (!n) return null;

  if (
    n.includes("slickdeals") ||
    n.includes("dealnews") ||
    n.includes("bradsdeals") ||
    n.includes("offers.com") ||
    n.includes("coupon") ||
    n.includes("deals")
  ) {
    return "Deal / Coupon";
  }

  if (
    n.includes("cnet") ||
    n.includes("forbes") ||
    n.includes("business insider") ||
    n.includes("cnn") ||
    n.includes("tom's guide") ||
    n.includes("wirecutter") ||
    n.includes("review") ||
    n.includes("nerd") ||
    n.includes("pcmag")
  ) {
    return "Review / Editorial";
  }

  if (
    n.includes("youtube") ||
    n.includes("instagram") ||
    n.includes("tiktok") ||
    n.includes("creator") ||
    n.includes("influencer")
  ) {
    return "Influencer / Creator";
  }

  if (
    n.includes("skimlinks") ||
    n.includes("viglink") ||
    n.includes("sovrn") ||
    n.includes("subnetwork")
  ) {
    return "Subnetwork / Commerce Content";
  }

  if (
    n.includes("topcashback") ||
    n.includes("rakuten rewards") ||
    n.includes("honey") ||
    n.includes("capital one shopping") ||
    n.includes("coupon cabin")
  ) {
    return "Cashback / Loyalty";
  }

  return "Publisher";
}

const PUBLISHER_RULES = [
  {
    id: "impact_partner_token",
    match: ({ params }) =>
      /^imp_\d+$/i.test(params.wmlspartner || "") ||
      /^imp_/i.test(params.sourceid || ""),
    resolve: ({ params }) => {
      const token = params.wmlspartner || params.sourceid || "";
      const partnerId = extractNumericId(token);
      return {
        network: "Impact",
        publisherToken: token,
        publisherId: partnerId,
        publisherName: null,
        publisherType: null,
        confidence: 0.93,
        resolutionStatus: "partial",
        note: "Impact partner token detected, but exact publisher name requires mapping library or platform lookup."
      };
    }
  },

  {
    id: "skimlinks",
    match: ({ params, url }) =>
      "skimlinks" in params ||
      ("utm_campaign" in params && /skimlinks/i.test(params.utm_campaign || "")) ||
      /skimlinks/i.test(url),
    resolve: () => ({
      network: "Skimlinks",
      publisherName: "Skimlinks",
      publisherType: "Subnetwork / Commerce Content",
      confidence: 0.97,
      resolutionStatus: "resolved"
    })
  },

  {
    id: "sovrn_viglink",
    match: ({ params, url }) =>
      "vglnk" in params ||
      "vgtid" in params ||
      /viglink|sovrn/i.test(url),
    resolve: () => ({
      network: "Sovrn / VigLink",
      publisherName: "Sovrn / VigLink",
      publisherType: "Subnetwork / Commerce Content",
      confidence: 0.97,
      resolutionStatus: "resolved"
    })
  },

  {
    id: "cj",
    match: ({ params }) => "cjevent" in params,
    resolve: ({ params }) => ({
      network: "CJ Affiliate",
      publisherToken: params.cjevent || null,
      confidence: 0.98,
      resolutionStatus: "partial"
    })
  },

  {
    id: "awin",
    match: ({ params }) => "awc" in params,
    resolve: ({ params }) => ({
      network: "Awin",
      publisherToken: params.awc || null,
      confidence: 0.98,
      resolutionStatus: "partial"
    })
  },

  {
    id: "partnerize",
    match: ({ params, url }) =>
      "clickref" in params ||
      /partnerize/i.test(params.utm_source || "") ||
      /partnerize/i.test(url),
    resolve: ({ params }) => ({
      network: "Partnerize",
      publisherToken: params.clickref || null,
      confidence: 0.95,
      resolutionStatus: "partial"
    })
  },

  {
    id: "rakuten",
    match: ({ params }) =>
      "ranMID" in params || "ranEAID" in params || "ranSiteID" in params,
    resolve: ({ params }) => ({
      network: "Rakuten Advertising",
      publisherId: params.ranEAID || null,
      publisherToken: params.ranSiteID || null,
      confidence: 0.98,
      resolutionStatus: "partial"
    })
  },

  {
    id: "shareasale",
    match: ({ params }) =>
      "afftrack" in params || "shareasale" in params || "sscid" in params,
    resolve: ({ params }) => ({
      network: "ShareASale",
      publisherToken: params.afftrack || params.sscid || null,
      confidence: 0.96,
      resolutionStatus: "partial"
    })
  }
];

const IMPACT_PUBLISHER_MAP = {
  // "52269": { name: "Some Publisher", type: "Deal / Coupon" },
  // "1943169": { name: "TopCashback", type: "Cashback / Loyalty" },
};

function resolveImpactPublisherByMap(publisherId) {
  if (!publisherId) return null;
  const hit = IMPACT_PUBLISHER_MAP[String(publisherId)];
  if (!hit) return null;

  return {
    publisherName: hit.name || null,
    publisherType: hit.type || inferPublisherTypeByName(hit.name || ""),
    resolutionStatus: "resolved",
    confidence: 0.99
  };
}

function detectMerchant(hostname, params = {}) {
  const host = normalizeHostname(hostname);

  if (host.includes("walmart.com")) return "Walmart";
  if (host.includes("amazon.com")) return "Amazon";
  if (host.includes("target.com")) return "Target";
  if (host.includes("bestbuy.com")) return "Best Buy";
  if (host.includes("homedepot.com")) return "Home Depot";
  if (host.includes("saatva.com")) return "Saatva";
  if (host.includes("casper.com")) return "Casper";
  if (host.includes("nectarsleep.com")) return "Nectar";
  if (host.includes("wayfair.com")) return "Wayfair";

  if (/wmlspartner|irgwc|affiliates_ad_id/i.test(JSON.stringify(params))) {
    return "Walmart";
  }

  return null;
}

function detectChannel(params = {}) {
  if (
    params.veh === "aff" ||
    params.irgwc === "1" ||
    params.afsrc === "1" ||
    "cjevent" in params ||
    "awc" in params ||
    "clickref" in params ||
    "irclickid" in params ||
    "ranMID" in params ||
    "ranEAID" in params ||
    "ranSiteID" in params ||
    "afftrack" in params ||
    "sscid" in params
  ) {
    return "Affiliate";
  }

  return null;
}

function detectWalmartImpactPublisher(url) {
  const hostname = getHostname(url);
  const params = getQueryParams(url);
  const evidence = [];

  const merchant = detectMerchant(hostname, params);
  const channel = detectChannel(params);

  let result = {
    merchant,
    network: null,
    channel,
    publisherToken: null,
    publisherId: null,
    publisherName: null,
    publisherType: null,
    clickId: null,
    sharedId: null,
    sourceId: null,
    campaignId: null,
    adId: null,
    confidence: 0,
    resolutionStatus: "unresolved",
    matchedRules: [],
    evidence: [],
    note: null
  };

  for (const rule of PUBLISHER_RULES) {
    if (rule.match({ url, hostname, params })) {
      const resolved = rule.resolve({ url, hostname, params }) || {};
      result = {
        ...result,
        ...resolved,
        matchedRules: [...result.matchedRules, rule.id]
      };
    }
  }

  result.clickId = params.clickid || null;
  result.sharedId = params.sharedid || null;
  result.sourceId = params.sourceid || null;
  result.campaignId = params.campaign_id || null;
  result.adId = params.affiliates_ad_id || null;

  if (
    result.merchant === "Walmart" &&
    (
      /^imp_\d+$/i.test(params.wmlspartner || "") ||
      /^imp_/i.test(params.sourceid || "") ||
      "irgwc" in params
    )
  ) {
    result.network = result.network || "Impact";
    result.channel = result.channel || "Affiliate";
    result.publisherToken = result.publisherToken || params.wmlspartner || null;
    result.publisherId = result.publisherId || extractNumericId(params.wmlspartner || "");
    result.confidence = Math.max(result.confidence || 0, 0.96);
    result.resolutionStatus = result.publisherId ? "partial" : result.resolutionStatus;
  }

  if (result.network === "Impact" && result.publisherId) {
    const mapped = resolveImpactPublisherByMap(result.publisherId);
    if (mapped) {
      result = { ...result, ...mapped };
    }
  }

  pushEvidence(evidence, "hostname", hostname);
  pushEvidence(evidence, "merchant", result.merchant);
  pushEvidence(evidence, "network", result.network);
  pushEvidence(evidence, "channel", result.channel);
  pushEvidence(evidence, "wmlspartner", params.wmlspartner);
  pushEvidence(evidence, "clickid", params.clickid);
  pushEvidence(evidence, "sourceid", params.sourceid);
  pushEvidence(evidence, "sharedid", params.sharedid);
  pushEvidence(evidence, "campaign_id", params.campaign_id);
  pushEvidence(evidence, "affiliates_ad_id", params.affiliates_ad_id);

  result.evidence = evidence;

  return result;
}

function detectPublisherFromUrl(url) {
  const hostname = getHostname(url);
  const params = getQueryParams(url);
  const merchant = detectMerchant(hostname, params);
  const channel = detectChannel(params);

  // Amazon 优先分流
  const amazonResult = detectAmazonPublisherFromUrl(url);
  if (amazonResult) {
    return {
      merchant: amazonResult.merchant,
      network: amazonResult.network,
      channel: amazonResult.channel,
      program: amazonResult.program || null,

      publisherToken: amazonResult.publisherToken,
      publisherId: amazonResult.publisherId,
      publisherName: amazonResult.publisherName,
      publisherType: amazonResult.publisherType,
      publisherSlug: amazonResult.publisherSlug || null,

      clickId: null,
      sharedId: null,
      sourceId: null,
      campaignId: amazonResult.tracking?.camp || null,
      adId: amazonResult.tracking?.creative || null,

      subtag: amazonResult.tracking?.ascsubtag || null,
      linkCode: amazonResult.tracking?.linkCode || null,
      creative: amazonResult.tracking?.creative || null,
      creativeASIN: amazonResult.tracking?.creativeASIN || null,

      confidence: amazonResult.confidence,
      resolutionStatus: amazonResult.status || "unresolved",
      matchedRules: amazonResult.matchedRules || [],
      evidence: amazonResult.evidence || [],
      note: amazonResult.note || null,
      matchMethod: amazonResult.matchMethod || null,
      pageType: amazonResult.pageType || null
    };
  }

  let result = {
    merchant,
    network: null,
    channel,
    publisherToken: null,
    publisherId: null,
    publisherName: null,
    publisherType: null,
    clickId: params.clickid || params.irclickid || null,
    sharedId: params.sharedid || null,
    sourceId: params.sourceid || null,
    campaignId: params.campaign_id || null,
    adId: params.affiliates_ad_id || null,
    confidence: 0,
    resolutionStatus: "unresolved",
    matchedRules: [],
    evidence: [],
    note: null
  };

  for (const rule of PUBLISHER_RULES) {
    if (rule.match({ url, hostname, params })) {
      const resolved = rule.resolve({ url, hostname, params }) || {};
      result = {
        ...result,
        ...resolved,
        matchedRules: [...result.matchedRules, rule.id]
      };
    }
  }

  if (
    merchant === "Walmart" &&
    (
      /^imp_\d+$/i.test(params.wmlspartner || "") ||
      /^imp_/i.test(params.sourceid || "") ||
      params.irgwc === "1"
    )
  ) {
    result.network = result.network || "Impact";
    result.channel = result.channel || "Affiliate";
    result.publisherToken = result.publisherToken || params.wmlspartner || null;
    result.publisherId = result.publisherId || extractNumericId(params.wmlspartner || "");
    result.confidence = Math.max(result.confidence || 0, 0.96);

    if (result.publisherId) {
      result.resolutionStatus = "partial";
      result.note = result.note || "Walmart Impact partner ID detected, but exact publisher name requires mapping.";
    }
  }

  if (result.network === "Impact" && result.publisherId) {
    const mapped = resolveImpactPublisherByMap(result.publisherId);
    if (mapped) {
      result = { ...result, ...mapped };
    }
  }

  if (!result.resolutionStatus || result.resolutionStatus === "unresolved") {
    if (result.publisherName || result.publisherId || result.publisherToken) {
      result.resolutionStatus = result.publisherName ? "resolved" : "partial";
    }
  }

  const evidence = [];
  pushEvidence(evidence, "hostname", hostname);
  pushEvidence(evidence, "merchant", result.merchant);
  pushEvidence(evidence, "network", result.network);
  pushEvidence(evidence, "channel", result.channel);
  pushEvidence(evidence, "publisherToken", result.publisherToken);
  pushEvidence(evidence, "publisherId", result.publisherId);
  pushEvidence(evidence, "clickid", params.clickid);
  pushEvidence(evidence, "irclickid", params.irclickid);
  pushEvidence(evidence, "sourceid", params.sourceid);
  pushEvidence(evidence, "sharedid", params.sharedid);
  pushEvidence(evidence, "campaign_id", params.campaign_id);
  pushEvidence(evidence, "affiliates_ad_id", params.affiliates_ad_id);
  pushEvidence(evidence, "awc", params.awc);
  pushEvidence(evidence, "cjevent", params.cjevent);
  pushEvidence(evidence, "clickref", params.clickref);
  pushEvidence(evidence, "ranEAID", params.ranEAID);
  pushEvidence(evidence, "ranSiteID", params.ranSiteID);
  pushEvidence(evidence, "afftrack", params.afftrack);
  pushEvidence(evidence, "sscid", params.sscid);

  result.evidence = evidence;

  return result;
}

module.exports = {
  PUBLISHER_RULES,
  IMPACT_PUBLISHER_MAP,
  detectPublisherFromUrl,
  detectWalmartImpactPublisher,
  inferPublisherTypeByName,
  extractNumericId
};
