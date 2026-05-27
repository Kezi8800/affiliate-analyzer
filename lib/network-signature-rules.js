"use strict";

/**
 * Network Signature Rules
 * Purpose:
 * Detect affiliate / commerce network by URL params, host, and tracking patterns.
 */

const NETWORK_SIGNATURE_RULES = [
  {
    network: "Impact",
    platform: "Impact",
    patterns: [
      "irclickid",
      "irgwc",
      "impactradius",
      "impact.com",
      "impact",
      "sourceid=imp_",
      "cidimp",
      "subid1",
      "sharedid"
    ],
    param_keys: ["irclickid", "irgwc", "cidimp", "impact_clickid"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "CJ Affiliate",
    platform: "CJ",
    patterns: [
      "cjevent",
      "cjdata",
      "anrdoezrs.net",
      "jdoqocy.com",
      "kqzyfj.com",
      "dpbolvw.net",
      "tkqlhce.com",
      "emjcd.com",
      "cj.com"
    ],
    param_keys: ["cjevent", "cjdata"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "Awin",
    platform: "Awin",
    patterns: ["awin", "awc=", "awclick", "awin1.com", "zanox"],
    param_keys: ["awc", "clickref", "p"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "ShareASale",
    platform: "ShareASale",
    patterns: ["shareasale", "sas", "sscid", "afftrack"],
    param_keys: ["sscid", "afftrack"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "Rakuten Advertising",
    platform: "Rakuten",
    patterns: ["linksynergy", "rakuten", "rkt", "ranmid", "raneaid", "ransiteid"],
    param_keys: ["ranMID", "ranEAID", "ranSiteID", "raneaid", "ranmid", "ransiteid"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "Partnerize",
    platform: "Partnerize",
    patterns: ["partnerize", "clickref", "prf.hn", "pntra.com", "t.cfjump.com"],
    param_keys: ["clickref", "pubref", "publisherId", "publisherid"],
    type: "Affiliate Network",
    confidence: "High"
  },

  /**
   * PartnerBoost / Amazon Attribution
   * 重点：
   * 这类链接经常不会出现 partnerboost 域名或 pb_clickid，
   * 而是直接落到 Amazon，使用 Amazon Attribution / MAAS 参数。
   *
   * Example:
   * maas=maas_adg_api_...
   * ref_=aa_maas
   * tag=maas
   * aa_campaignid=...
   * aa_adgroupid=...
   * aa_creativeid=...
   */
  {
    network: "Amazon Attribution",
    platform: "PartnerBoost",
    patterns: [
      "partnerboost",
      "pbid",
      "pb_clickid",
      "pb_source",
      "maas_adg_api",
      "ref_=aa_maas",
      "tag=maas",
      "aa_maas",
      "aa_campaignid",
      "aa_adgroupid",
      "aa_creativeid"
    ],
    param_keys: [
      "pb",
      "pb_id",
      "pb_clickid",
      "pb_source",
      "maas",
      "aa_campaignid",
      "aa_adgroupid",
      "aa_creativeid"
    ],
    type: "Amazon Attribution / Managed Affiliate Attribution",
    confidence: "High"
  },

  {
    network: "Pepperjam / Ascend",
    platform: "Pepperjam",
    patterns: ["pepperjam", "pjatr", "pjtra", "pjxads", "pjmedia", "pjtra.com"],
    param_keys: ["pjID", "pjMID", "pjcid", "pjaffid"],
    type: "Affiliate Network",
    confidence: "Medium"
  },
  {
    network: "LinkConnector",
    platform: "LinkConnector",
    patterns: ["linkconnector", "lc_sid", "lc_mid", "lc_cid", "atid"],
    param_keys: ["lc_sid", "lc_mid", "lc_cid", "atid"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "Webgains",
    platform: "Webgains",
    patterns: ["webgains", "wgcampaignid", "wgprogramid"],
    param_keys: ["wgcampaignid", "wgprogramid", "wgtarget"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "TradeDoubler",
    platform: "TradeDoubler",
    patterns: ["tradedoubler", "tduid", "trafficsourceid"],
    param_keys: ["tduid", "trafficsourceid"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "TradeTracker",
    platform: "TradeTracker",
    patterns: ["tradetracker", "ttid", "tt="],
    param_keys: ["tt", "ttid", "campaignID", "affiliateID"],
    type: "Affiliate Network",
    confidence: "Medium"
  },
  {
    network: "Adtraction",
    platform: "Adtraction",
    patterns: ["adtraction", "at_gd", "adtr"],
    param_keys: ["at_gd", "adtr"],
    type: "Affiliate Network",
    confidence: "Medium"
  },
  {
    network: "Admitad",
    platform: "Admitad",
    patterns: ["admitad", "admitad_uid"],
    param_keys: ["admitad_uid", "admitad_subid"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "FlexOffers",
    platform: "FlexOffers",
    patterns: ["flexoffers", "fobs", "foid", "fid"],
    param_keys: ["fobs", "foid", "fid", "foc"],
    type: "Affiliate Network",
    confidence: "High"
  },
  {
    network: "Everflow",
    platform: "Everflow",
    patterns: ["everflow", "ef_transaction_id", "everflow_click_id"],
    param_keys: ["ef_transaction_id", "everflow_id", "everflow_click_id"],
    type: "Affiliate / Partner Tracking",
    confidence: "High"
  },
  {
    network: "TUNE / HasOffers",
    platform: "TUNE",
    patterns: ["hasoffers", "tune", "offer_id", "aff_id", "transaction_id"],
    param_keys: ["offer_id", "aff_id", "transaction_id", "affiliate_id"],
    type: "Affiliate / CPA Tracking",
    confidence: "Medium"
  },
  {
    network: "Refersion",
    platform: "Refersion",
    patterns: ["refersion", "rfsn"],
    param_keys: ["rfsn", "subid", "utm_source"],
    type: "Shopify Affiliate App",
    confidence: "Medium"
  },
  {
    network: "UpPromote",
    platform: "UpPromote",
    patterns: ["uppromote", "sca_ref"],
    param_keys: ["sca_ref", "sca_source", "sca_campaign"],
    type: "Shopify Affiliate App",
    confidence: "High"
  },
  {
    network: "GoAffPro",
    platform: "GoAffPro",
    patterns: ["goaffpro", "ref=", "gfp_ref"],
    param_keys: ["ref", "gfp_ref"],
    type: "Shopify Affiliate App",
    confidence: "Medium"
  },
  {
    network: "Skimlinks",
    platform: "Skimlinks",
    patterns: ["skimlinks", "skimbit", "go.redirectingat.com", "shop-links.co"],
    param_keys: ["xcust", "xuuid", "xs"],
    type: "Commerce Content Network",
    confidence: "High"
  },
  {
    network: "Sovrn Commerce / VigLink",
    platform: "Sovrn",
    patterns: ["viglink", "sovrn", "shop-links.co", "redirect.viglink.com"],
    param_keys: ["u", "cuid", "key"],
    type: "Commerce Content Network",
    confidence: "High"
  },
  {
    network: "Amazon Associates",
    platform: "Amazon",
    patterns: ["tag=", "ascsubtag", "linkcode", "creative", "camp"],
    param_keys: ["tag", "ascsubtag", "linkCode", "creative", "camp"],
    type: "Marketplace Affiliate",
    confidence: "High"
  },
  {
    network: "Amazon Attribution",
    platform: "Amazon",
    patterns: [
      "maas",
      "maas_adg_api",
      "ref_=aa_maas",
      "tag=maas",
      "aa_campaignid",
      "aa_adgroupid",
      "aa_creativeid"
    ],
    param_keys: ["maas", "aa_campaignid", "aa_adgroupid", "aa_creativeid"],
    type: "Marketplace Attribution",
    confidence: "High"
  },
  {
    network: "Amazon Creator Connections",
    platform: "Amazon",
    patterns: ["campaignid", "linkid", "linkcode=tr1"],
    param_keys: ["campaignId", "campaignid", "linkId", "linkid"],
    type: "Marketplace Creator Affiliate",
    confidence: "High"
  },
  {
    network: "eBay Partner Network",
    platform: "eBay",
    patterns: ["rover.ebay", "campid", "customid", "mkcid=1", "mkevt=1"],
    param_keys: ["campid", "customid", "mkcid", "mkevt", "toolid"],
    type: "Marketplace Affiliate",
    confidence: "High"
  },
  {
    network: "Walmart / Impact",
    platform: "Walmart",
    patterns: ["goto.walmart.com", "sourceid=imp_", "irgwc", "veh=aff"],
    param_keys: ["sourceid", "irgwc", "veh", "sharedId", "subId1"],
    type: "Retail Affiliate",
    confidence: "High"
  }
];

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function getParam(params, key) {
  if (!params || !key) return "";

  if (typeof params.get === "function") {
    return params.get(key) || params.get(key.toLowerCase()) || params.get(key.toUpperCase()) || "";
  }

  return params[key] || params[key.toLowerCase()] || params[key.toUpperCase()] || "";
}

function paramsToObject(params) {
  if (!params) return {};
  if (typeof params.entries === "function") {
    const obj = {};
    for (const [key, value] of params.entries()) obj[key] = value;
    return obj;
  }
  return { ...params };
}

function detectNetworkSignature(input = "", params = {}) {
  const paramObj = paramsToObject(params);

  const paramText = Object.keys(paramObj)
    .map(key => `${key}=${paramObj[key]}`)
    .join("&");

  const haystack = normalize(`${input} ${paramText}`);

  let best = null;

  for (const rule of NETWORK_SIGNATURE_RULES) {
    let score = 0;
    const matched = [];

    for (const key of rule.param_keys || []) {
      if (getParam(paramObj, key)) {
        score += 35;
        matched.push(key);
      }
    }

    for (const pattern of rule.patterns || []) {
      if (haystack.includes(normalize(pattern))) {
        score += 18;
        matched.push(pattern);
      }
    }

    if (score > 0 && (!best || score > best.score)) {
      best = {
        network: rule.network,
        platform: rule.platform,
        type: rule.type,
        confidence: score >= 50 ? "High" : rule.confidence || "Medium",
        matched_by: "network_signature_rules",
        matched_signals: [...new Set(matched)],
        score
      };
    }
  }

  return best;
}

function detectNetworkSignatureFromUrl(urlObj, params = {}) {
  const input = [
    urlObj?.hostname,
    urlObj?.pathname,
    urlObj?.search
  ].filter(Boolean).join(" ");

  return detectNetworkSignature(input, params);
}

module.exports = {
  NETWORK_SIGNATURE_RULES,
  detectNetworkSignature,
  detectNetworkSignatureFromUrl
};
