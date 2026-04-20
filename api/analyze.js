const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3000;
const MAX_HTTP_REDIRECTS = 5;
const MAX_WRAPPED_DEPTH = 3;
const FETCH_TIMEOUT_MS = 8000;

const AMAZON_HOSTS = [
  "amazon.com",
  "amzn.to",
  "amazon.ca",
  "amazon.co.uk",
  "amazon.de",
  "amazon.fr",
  "amazon.it",
  "amazon.es",
  "amazon.co.jp"
];

const AMAZON_STORE_PATHS = [
  "/dp/",
  "/gp/product/",
  "/stores/page/",
  "/hz/mobile/merchant-store/",
  "/s"
];

const WALMART_HOSTS = [
  "walmart.com",
  "www.walmart.com"
];

const WRAPPED_KEYS = [
  "url",
  "u",
  "target",
  "dest",
  "destination",
  "redirect",
  "redirect_url",
  "redirect_uri",
  "to",
  "next",
  "goto",
  "forward"
];

const NETWORK_SIGNATURES = [
  { name: "Impact", hosts: ["impact.com", "impactradius.com"], keys: ["irclickid", "irgwc", "cidimp"], confidence: 92 },
  { name: "CJ Affiliate", hosts: ["anrdoezrs.net", "jdoqocy.com", "kqzyfj.com", "dpbolvw.net", "tkqlhce.com", "emjcd.com", "cj.com"], keys: ["cjevent"], confidence: 92 },
  { name: "Awin", hosts: ["awin1.com", "awin.com"], keys: ["awc", "awinaffid"], confidence: 92 },
  { name: "ShareASale", hosts: ["shareasale.com"], keys: ["afftrack", "sscid"], confidence: 92 },
  { name: "Rakuten Advertising", hosts: ["click.linksynergy.com", "linksynergy.com"], keys: ["ranmid", "raneaid", "ransiteid"], confidence: 92 },
  { name: "Partnerize / Pepperjam", hosts: ["partnerize.com", "pepperjamnetwork.com", "pntra.com"], keys: ["clickref", "clickref2", "pubref", "pjid", "pjmid"], confidence: 84 },
  { name: "Pepperjam", hosts: ["pepperjamnetwork.com", "pntra.com"], keys: ["pjid", "pjmid"], confidence: 90 },

  { name: "Levanta", hosts: ["levanta.io"], keys: ["levanta", "lev", "levanta_campaign", "levanta_creator"], confidence: 88 },
  { name: "Archer Affiliates", hosts: ["archeraffiliates.com"], keys: ["archer_click_id", "archer_aff_id", "archer_campaign", "archer_creator"], confidence: 84 },
  { name: "LinkConnector", hosts: ["linkconnector.com"], keys: ["lc", "lc_sid", "lc_mid", "lc_cid", "atid"], confidence: 82 },
  { name: "Webgains", hosts: ["webgains.com", "track.webgains.com"], keys: ["wgcampaignid", "wgprogramid", "clickref"], confidence: 90 },
  { name: "TradeDoubler", hosts: ["tradedoubler.com", "clk.tradedoubler.com"], keys: ["tduid", "trafficsourceid", "epi"], confidence: 90 },
  { name: "TradeTracker", hosts: ["tradetracker.net", "tc.tradetracker.net"], keys: ["tt", "ttid", "ttclid", "r"], confidence: 90 },
  { name: "Optimise Media", hosts: ["optimisemedia.com", "optimise.co.uk"], keys: ["optid", "affiliateid"], confidence: 82 },
  { name: "Daisycon", hosts: ["daisycon.com", "ds1.nl"], keys: ["wsd", "dsrc", "media_id", "affiliate_id"], confidence: 82 },
  { name: "Adservice", hosts: ["adservice.com", "track.adservice.com"], keys: ["adservice", "asid"], confidence: 82 },
  { name: "Affilinet", hosts: ["affilinet.com", "affili.net"], keys: ["affmt", "affmn"], confidence: 82 },

  { name: "Adtraction", hosts: ["adtraction.com", "adtr.co"], keys: ["adtractionid", "adt_id"], confidence: 82 },
  { name: "AvantLink", hosts: ["avantlink.com"], keys: ["avantlink", "advl"], confidence: 82 },
  { name: "MaxBounty", hosts: ["maxbounty.com"], keys: ["maxbounty", "mbsy"], confidence: 82 },
  { name: "CPAlead", hosts: ["cpalead.com"], keys: ["cpalead", "pubid"], confidence: 82 },
  { name: "ClickDealer", hosts: ["clickdealer.com"], keys: ["clickdealer", "cd", "clickid", "aff_sub", "aff_sub2"], confidence: 82 },
  { name: "AdCombo", hosts: ["adcombo.com"], keys: ["adcombo", "acid"], confidence: 82 },
  { name: "Dr.Cash", hosts: ["dr.cash"], keys: ["drcash", "dr_cash", "dr_id"], confidence: 82 },

  { name: "Admitad", hosts: ["admitad.com", "ad.admitad.com"], keys: ["admitad_uid", "admitad"], confidence: 90 },
  { name: "FlexOffers", hosts: ["clk.omgt5.com", "flexlinkspro.com"], keys: ["faid", "fobs", "foid"], confidence: 84 },
  { name: "PartnerStack", hosts: ["partnerstack.com"], keys: ["ps_xid", "ps_partner_key", "pscn"], confidence: 92 },
  { name: "PartnerBoost", hosts: ["partnerboost.com"], keys: ["pb", "pb_id", "pb_clickid", "pb_source"], confidence: 90 },
  { name: "TUNE", hosts: ["hasoffers.com", "tune.com"], keys: ["tid", "tune_offer_id", "tune_aff_id", "offer_id"], confidence: 84 },
  { name: "Everflow", hosts: ["everflow.io", "everflowtrk.com", "track.everflow.io"], keys: ["ef_transaction_id", "everflow_id", "everflow_click_id", "oid", "affid"], confidence: 84 },
  { name: "Refersion", hosts: ["refersion.com"], keys: ["refersion", "refersion_id", "rfsn"], confidence: 90 },
  { name: "UpPromote", hosts: ["secomapp.com", "uppromote.com"], keys: ["uppromote", "secomapp_aff", "upromote"], confidence: 82 },
  { name: "GoAffPro", hosts: ["goaffpro.com"], keys: ["goaffpro", "gafpr"], confidence: 82 },

  { name: "Skimlinks", hosts: ["go.skimresources.com", "skimresources.com"], keys: ["skimlinks", "skm"], confidence: 90 },
  { name: "Sovrn Commerce", hosts: ["redirect.viglink.com", "viglink.com", "shop-links.co", "sovrn.com"], keys: ["vglnk", "vgtid", "vlid"], confidence: 90 },

  { name: "Walmart", hosts: ["walmart.com", "www.walmart.com"], keys: ["wmlspartner", "affiliates_ad_id", "campaign_id", "veh", "afsrc"], confidence: 90 },

  { name: "eBay Partner Network", hosts: ["rover.ebay.com", "ebay.com"], keys: ["campid", "customid", "mkevt", "mkcid", "mkrid"], confidence: 92 },
  { name: "Shopify Collabs", hosts: ["shopify.com", "shop.app"], keys: ["sca_ref", "smcid"], confidence: 82 },

  { name: "ClickBank", hosts: ["hop.clickbank.net", "clickbank.net", "clickbank.com"], keys: ["tid", "vtid", "affiliate"], confidence: 90 },
  { name: "JVZoo", hosts: ["jvzoo.com", "jvz8.com"], keys: ["jvzoo", "jvz"], confidence: 90 },
  { name: "GiddyUp", hosts: ["giddyup.com", "giddyup.io"], keys: ["aff_id", "subid"], confidence: 82 },
  { name: "affiliaXe", hosts: ["affiliaxe.com"], keys: ["affiliatix", "subid"], confidence: 82 }
];

const UTM_NETWORK_MAP = {
  impact: "Impact",
  impactradius: "Impact",
  impact_radius: "Impact",
  ignite: "Impact",

  cj: "CJ Affiliate",
  cjaffiliate: "CJ Affiliate",
  commissionjunction: "CJ Affiliate",

  awin: "Awin",
  shareasale: "ShareASale",
  sas: "ShareASale",

  rakuten: "Rakuten Advertising",
  linkshare: "Rakuten Advertising",
  linksynergy: "Rakuten Advertising",

  partnerize: "Partnerize / Pepperjam",
  pepperjam: "Pepperjam",
  pntra: "Partnerize / Pepperjam",

  levanta: "Levanta",
  archer: "Archer Affiliates",

  webgains: "Webgains",
  tradedoubler: "TradeDoubler",
  tradedbl: "TradeDoubler",
  tradetracker: "TradeTracker",
  optimisemedia: "Optimise Media",
  optimise: "Optimise Media",
  daisycon: "Daisycon",
  adservice: "Adservice",
  affilinet: "Affilinet",
  adtraction: "Adtraction",
  linkconnector: "LinkConnector",

  admitad: "Admitad",
  flexoffers: "FlexOffers",
  partnerstack: "PartnerStack",
  partnerboost: "PartnerBoost",
  partner_boost: "PartnerBoost",
  tune: "TUNE",
  hasoffers: "TUNE",
  everflow: "Everflow",
  everflowtrk: "Everflow",
  refersion: "Refersion",
  uppromote: "UpPromote",
  secomapp: "UpPromote",
  goaffpro: "GoAffPro",

  skimlinks: "Skimlinks",
  skimbit: "Skimlinks",
  sovrn: "Sovrn Commerce",
  viglink: "Sovrn Commerce",

  clickbank: "ClickBank",
  jvzoo: "JVZoo",
  giddyup: "GiddyUp",
  affiliaxe: "affiliaXe",

  avantlink: "AvantLink",
  maxbounty: "MaxBounty",
  cpalead: "CPAlead",
  clickdealer: "ClickDealer",
  adcombo: "AdCombo",
  drcash: "Dr.Cash",
  "dr.cash": "Dr.Cash",

  ebay: "eBay Partner Network",
  epn: "eBay Partner Network",

  collabs: "Shopify Collabs",
  shopifycollabs: "Shopify Collabs",
  shopify_collabs: "Shopify Collabs",

  walmart: "Walmart",
  walmartaffiliate: "Walmart",
  walmart_affiliate: "Walmart"
};

/* =========================
   工具函数
========================= */

function dedupeObjectsByName(arr) {
  const map = new Map();
  for (const item of arr) {
    if (!map.has(item.name)) {
      map.set(item.name, item);
    } else {
      const existing = map.get(item.name);
      existing.confidence = Math.max(existing.confidence, item.confidence);
      existing.domainHit = existing.domainHit || item.domainHit;
      existing.paramHits = dedupe([...(existing.paramHits || []), ...(item.paramHits || [])]);
      map.set(item.name, existing);
    }
  }
  return [...map.values()];
}

function getUrlObject(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function normalizeKeys(obj = {}) {
  const normalized = {};
  Object.keys(obj || {}).forEach((key) => {
    normalized[String(key).toLowerCase()] = obj[key];
  });
  return normalized;
}

function mergeObjectsPreferringFirst(...objects) {
  const result = {};
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj || {})) {
      if (!(key in result)) result[key] = value;
    }
  }
  return result;
}

function hostMatches(hostname, domains = []) {
  return domains.some((d) => hostname === d || hostname.endsWith("." + d) || hostname.includes(d));
}

function pathIncludes(pathname, arr = []) {
  const p = String(pathname || "").toLowerCase();
  return arr.some((x) => p.includes(String(x).toLowerCase()));
}

function getPresentParams(params, keys = []) {
  return keys.filter((k) => Object.prototype.hasOwnProperty.call(params, k));
}

function extractParamsFromUrl(rawUrl) {
  const u = getUrlObject(rawUrl);
  if (!u) return {};
  const out = {};
  u.searchParams.forEach((value, key) => {
    out[String(key).toLowerCase()] = value;
  });
  return out;
}

function detectNetworkFromText(text, push) {
  if (!text) return;
  const safeText = String(text).toLowerCase();
  Object.entries(UTM_NETWORK_MAP).forEach(([keyword, network]) => {
    if (safeText.includes(keyword)) push(network);
  });
}

function detectTrafficSources(params) {
  const out = [];
  if (params.gclid || params.gbraid || params.wbraid || params.gad_campaignid) out.push("Google Ads");
  if (params.fbclid) out.push("Meta Ads");
  if (params.ttclid) out.push("TikTok Ads");
  if (params.msclkid) out.push("Microsoft Ads");
  if (params.li_fat_id) out.push("LinkedIn Ads");
  return dedupe(out);
}

/* =========================
   Amazon Rule Panel
========================= */

function getAmazonRulePanel(urlObj, params) {
  const rules = [];
  const hasTag = !!params.tag;
  const hasAscSubtag = !!params.ascsubtag;
  const hasCampaignId = Object.prototype.hasOwnProperty.call(params, "campaignid");
  const hasLinkId = Object.prototype.hasOwnProperty.call(params, "linkid");
  const hasTr1 = (params.linkcode || "").toLowerCase() === "tr1";
  const hasCreatorId = Object.prototype.hasOwnProperty.call(params, "creatorid");
  const hasAaCampaign = Object.prototype.hasOwnProperty.call(params, "aa_campaignid");
  const hasAaAdgroup = Object.prototype.hasOwnProperty.call(params, "aa_adgroupid");
  const hasAaCreative = Object.prototype.hasOwnProperty.call(params, "aa_creativeid");
  const hasMaas = Object.prototype.hasOwnProperty.call(params, "maas");
  const hasAaRef = String(params.ref_ || "").toLowerCase().includes("aa_");
  const creatorPath = pathIncludes(urlObj?.pathname || "", ["/creator", "/creators", "/influencer"]);
  const storePath = pathIncludes(urlObj?.pathname || "", AMAZON_STORE_PATHS);

  rules.push(hasTag ? "tag=true" : "tag=false");
  rules.push(hasAscSubtag ? "ascsubtag=true" : "ascsubtag=false");
  rules.push(hasCampaignId ? "campaignId=true" : "campaignId=false");
  rules.push(hasLinkId ? "linkId=true" : "linkId=false");
  rules.push(hasTr1 ? "linkCode=tr1" : "linkCode!=tr1");
  rules.push(hasCreatorId ? "creatorId=true" : "creatorId=false");
  rules.push(hasAaCampaign ? "aa_campaignid=true" : "aa_campaignid=false");
  rules.push(hasAaAdgroup ? "aa_adgroupid=true" : "aa_adgroupid=false");
  rules.push(hasAaCreative ? "aa_creativeid=true" : "aa_creativeid=false");
  rules.push(hasMaas ? "maas=true" : "maas=false");
  rules.push(hasAaRef ? "ref_=aa_*" : "ref_=aa_* false");
  rules.push(creatorPath ? "creator_path=true" : "creator_path=false");
  rules.push(storePath ? "amazon_store_or_product_path=true" : "amazon_store_or_product_path=false");
  return rules;
}

/* =========================
   外部联盟平台识别
========================= */

function detectExternalNetworks(urlObj, params) {
  if (!urlObj) return [];
  const host = urlObj.hostname.toLowerCase();
  const hits = [];

  for (const net of NETWORK_SIGNATURES) {
    const domainHit = hostMatches(host, net.hosts || []);
    const paramHits = getPresentParams(params, net.keys || []);
    if (domainHit || paramHits.length > 0) {
      hits.push({
        name: net.name,
        confidence: net.confidence,
        domainHit,
        paramHits
      });
    }
  }

  const utmSource = String(params.utm_source || "").toLowerCase();
  const utmMedium = String(params.utm_medium || "").toLowerCase();
  const utmCampaign = String(params.utm_campaign || "").toLowerCase();
  const utmContent = String(params.utm_content || "").toLowerCase();

  const inferred = [];
  const push = (name) => {
    if (!inferred.includes(name)) inferred.push(name);
  };

  detectNetworkFromText(utmSource, push);
  detectNetworkFromText(utmMedium, push);
  detectNetworkFromText(utmCampaign, push);
  detectNetworkFromText(utmContent, push);

  inferred.forEach((name) => {
    const existing = hits.find((x) => x.name === name);
    if (!existing) {
      hits.push({
        name,
        confidence: 78,
        domainHit: false,
        paramHits: ["utm_inference"]
      });
    }
  });

  return hits;
}

/* =========================
   Amazon Detection
========================= */

function detectAmazon(urlObj, params) {
  if (!urlObj) return null;

  const hostname = urlObj.hostname.toLowerCase();
  const isAmazon = hostMatches(hostname, AMAZON_HOSTS);
  if (!isAmazon) return null;

  const isStoreOrProductPath = pathIncludes(urlObj.pathname, AMAZON_STORE_PATHS);

  const attributionKeys = ["aa_campaignid", "aa_adgroupid", "aa_creativeid", "maas"];
  const attributionPresent = getPresentParams(params, attributionKeys);
  const attributionRef = String(params.ref_ || "").toLowerCase().includes("aa_");
  const hasAttribution = attributionPresent.length > 0 || attributionRef;

  if (hasAttribution) {
    const signals = attributionPresent.map((k) => `param:${k}`);
    if (attributionRef) signals.push("ref_:aa_*");
    if (isStoreOrProductPath) signals.push("amazon_store_or_product_path");

    return {
      platform: "Amazon",
      type: "Amazon Attribution",
      subtype: "Off-Amazon measurement / attribution",
      verdict: "High-confidence Amazon Attribution link",
      confidenceScore:
        attributionPresent.length >= 2 || (attributionPresent.length >= 1 && attributionRef) ? 96 : 92,
      signals,
      explanation:
        "This URL was classified as Amazon Attribution because it includes Amazon Ads measurement signals such as aa_campaignid, aa_adgroupid, aa_creativeid, maas, or an aa_* ref_ value.",
      matchedLayers: ["Amazon Attribution"]
    };
  }

  if (Object.prototype.hasOwnProperty.call(params, "tag")) {
    const signals = ["param:tag"];
    let subtype = "Special Link / tracking ID";

    if (Object.prototype.hasOwnProperty.call(params, "ascsubtag")) {
      subtype = "Associates + subtag tracking";
      signals.push("param:ascsubtag");
    }

    if (params.linkcode) signals.push(`linkCode:${params.linkcode}`);
    if (params.camp) signals.push("param:camp");
    if (params.creative) signals.push("param:creative");
    if (isStoreOrProductPath) signals.push("amazon_store_or_product_path");

    return {
      platform: "Amazon",
      type: "Amazon Associates",
      subtype,
      verdict: "High-confidence Amazon Associates link",
      confidenceScore: 95,
      signals,
      explanation:
        "This URL was classified as Amazon Associates because it contains the tag parameter, which is the strongest public signal for an Amazon Associates tracking ID.",
      matchedLayers: ["Amazon Associates", ...(params.ascsubtag ? ["Amazon Subtag Tracking"] : [])]
    };
  }

  let accScore = 0;
  const accSignals = [];

  if (Object.prototype.hasOwnProperty.call(params, "campaignid")) {
    accScore += 3;
    accSignals.push("param:campaignId");
  }

  if (Object.prototype.hasOwnProperty.call(params, "linkid")) {
    accScore += 2;
    accSignals.push("param:linkId");
  }

  if ((params.linkcode || "").toLowerCase() === "tr1") {
    accScore += 3;
    accSignals.push("linkCode:tr1");
  }

  if (Object.prototype.hasOwnProperty.call(params, "creatorid")) {
    accScore += 2;
    accSignals.push("param:creatorId");
  }

  if (pathIncludes(urlObj.pathname, ["/creator", "/creators", "/influencer"])) {
    accScore += 1;
    accSignals.push("path:creator-context");
  }

  if (Object.prototype.hasOwnProperty.call(params, "ascsubtag")) {
    accScore += 0.5;
    accSignals.push("param:ascsubtag(weak)");
  }

  if (isStoreOrProductPath) {
    accSignals.push("amazon_store_or_product_path");
  }

  if (accScore >= 6) {
    return {
      platform: "Amazon",
      type: "Amazon Creator Connections",
      subtype: "High-confidence creator campaign link",
      verdict: "Likely ACC link (high confidence)",
      confidenceScore: 90,
      signals: accSignals,
      explanation:
        "This URL was classified as Amazon Creator Connections because it shows multiple creator-campaign style signals without a tag parameter that would indicate Amazon Associates.",
      matchedLayers: ["Amazon Creator Connections"]
    };
  }

  if (accScore >= 4) {
    return {
      platform: "Amazon",
      type: "Amazon Creator Connections",
      subtype: "Possible creator campaign link",
      verdict: "Possible ACC link (medium confidence)",
      confidenceScore: 78,
      signals: accSignals,
      explanation:
        "This URL shows creator-campaign style signals consistent with Amazon Creator Connections, but the signal set is not strong enough to treat it as definitive without manual review.",
      matchedLayers: ["Amazon Creator Connections"]
    };
  }

  if (accScore >= 2.5) {
    return {
      platform: "Amazon",
      type: "Amazon Creator Connections",
      subtype: "Weak creator-campaign signal",
      verdict: "Weak ACC signal; manual review recommended",
      confidenceScore: 64,
      signals: accSignals,
      explanation:
        "This URL contains some weak creator-style signals, but not enough to reliably distinguish it from other Amazon campaign or wrapped-link formats.",
      matchedLayers: ["Amazon Creator Connections"]
    };
  }

  return {
    platform: "Amazon",
    type: "Amazon Link",
    subtype: isStoreOrProductPath ? "Store / product / search path" : "Unknown",
    verdict: "Amazon URL detected, but no clear affiliate / attribution pattern",
    confidenceScore: isStoreOrProductPath ? 42 : 38,
    signals: isStoreOrProductPath ? ["amazon_store_or_product_path"] : [],
    explanation:
      "This is an Amazon URL, but it does not expose strong public signals for Amazon Attribution, Amazon Associates, or Creator Connections.",
    matchedLayers: ["Amazon"]
  };
}

/* =========================
   Walmart Detection
========================= */

function detectWalmart(urlObj, params) {
  if (!urlObj) return null;

  const hostname = urlObj.hostname.toLowerCase();
  const isWalmart = hostMatches(hostname, WALMART_HOSTS);
  if (!isWalmart) return null;

  const hasImpactSignal =
    Object.prototype.hasOwnProperty.call(params, "irgwc") ||
    Object.prototype.hasOwnProperty.call(params, "clickid") ||
    String(params.sourceid || "").toLowerCase().startsWith("imp_") ||
    String(params.wmlspartner || "").toLowerCase().startsWith("imp_");

  const hasWalmartAffiliateSignal =
    Object.prototype.hasOwnProperty.call(params, "wmlspartner") ||
    Object.prototype.hasOwnProperty.call(params, "affiliates_ad_id") ||
    Object.prototype.hasOwnProperty.call(params, "campaign_id") ||
    Object.prototype.hasOwnProperty.call(params, "veh") ||
    Object.prototype.hasOwnProperty.call(params, "afsrc");

  if (hasImpactSignal && hasWalmartAffiliateSignal) {
    return {
      platform: "Walmart",
      type: "Impact Affiliate",
      subtype: "Retailer affiliate landing page",
      verdict: "High-confidence Walmart affiliate link via Impact",
      confidenceScore: 95,
      signals: [
        ...(params.irgwc ? ["param:irgwc"] : []),
        ...(params.clickid ? ["param:clickid"] : []),
        ...(params.sourceid ? ["param:sourceid"] : []),
        ...(params.wmlspartner ? ["param:wmlspartner"] : []),
        ...(params.affiliates_ad_id ? ["param:affiliates_ad_id"] : []),
        ...(params.campaign_id ? ["param:campaign_id"] : []),
        ...(params.veh ? ["param:veh"] : []),
        ...(params.afsrc ? ["param:afsrc"] : [])
      ],
      explanation:
        "This URL was classified as a Walmart affiliate link because it lands on Walmart and includes Walmart partner fields together with Impact-style affiliate identifiers such as irgwc, clickid, or imp_-prefixed source values.",
      matchedLayers: ["Walmart", "Impact", "Affiliate Traffic"]
    };
  }

  if (hasWalmartAffiliateSignal) {
    return {
      platform: "Walmart",
      type: "Walmart Affiliate",
      subtype: "Retailer affiliate landing page",
      verdict: "Likely Walmart affiliate link",
      confidenceScore: 88,
      signals: [
        ...(params.wmlspartner ? ["param:wmlspartner"] : []),
        ...(params.affiliates_ad_id ? ["param:affiliates_ad_id"] : []),
        ...(params.campaign_id ? ["param:campaign_id"] : []),
        ...(params.veh ? ["param:veh"] : []),
        ...(params.afsrc ? ["param:afsrc"] : [])
      ],
      explanation:
        "This URL was classified as a Walmart affiliate link because it lands on Walmart and includes Walmart affiliate partner parameters.",
      matchedLayers: ["Walmart", "Affiliate Traffic"]
    };
  }

  return {
    platform: "Walmart",
    type: "Walmart Link",
    subtype: "Retail product page",
    verdict: "Walmart URL detected, but no clear affiliate pattern",
    confidenceScore: 40,
    signals: [],
    explanation:
      "This is a Walmart URL, but it does not expose strong affiliate identifiers.",
    matchedLayers: ["Walmart"]
  };
}

/* =========================
   Best Match Across Chain
========================= */

function getBestExternalAcrossChain(chain) {
  const hits = [];

  chain.forEach((node) => {
    const networks = detectExternalNetworks(node.urlObj, node.params);
    networks.forEach((net) => {
      hits.push({
        name: net.name,
        confidence: net.confidence,
        domainHit: net.domainHit,
        paramHits: [...net.paramHits]
      });
    });
  });

  return dedupeObjectsByName(hits).sort((a, b) => b.confidence - a.confidence);
}

function getBestAmazonAcrossChain(chain) {
  for (let i = chain.length - 1; i >= 0; i--) {
    const node = chain[i];
    const amazon = detectAmazon(node.urlObj, node.params);
    if (amazon) {
      return { result: amazon, node };
    }
  }
  return null;
}

function getBestWalmartAcrossChain(chain) {
  for (let i = chain.length - 1; i >= 0; i--) {
    const node = chain[i];
    const walmart = detectWalmart(node.urlObj, node.params);
    if (walmart) {
      return { result: walmart, node };
    }
  }
  return null;
}

/* =========================
   主 Classification
========================= */

function buildCompositeClassification(chain) {
  const firstNode = chain[0];
  const bestAmazon = getBestAmazonAcrossChain(chain);
  const bestWalmart = getBestWalmartAcrossChain(chain);
  const externalHits = getBestExternalAcrossChain(chain);
  const primaryExternal = externalHits.length ? externalHits[0] : null;

  if (bestWalmart) {
    return {
      title: bestWalmart.result.type === "Impact Affiliate"
        ? "Walmart (Impact Affiliate)"
        : bestWalmart.result.type,
      platform: bestWalmart.result.platform,
      type: bestWalmart.result.type,
      subtype: bestWalmart.result.subtype,
      verdict: bestWalmart.result.verdict,
      confidenceScore: bestWalmart.result.confidenceScore,
      signals: bestWalmart.result.signals,
      explanation: bestWalmart.result.explanation,
      matchedLayers: dedupe(
        bestWalmart.result.matchedLayers.concat(primaryExternal ? [primaryExternal.name] : [])
      ),
      amazonRules: [],
      domain: firstNode?.urlObj?.hostname || "—"
    };
  }

  if (bestAmazon && bestAmazon.result.type === "Amazon Attribution" && primaryExternal) {
    const signals = [
      ...primaryExternal.paramHits.map((k) => `param:${k}`),
      ...(primaryExternal.domainHit ? [`network:${primaryExternal.name}`] : []),
      ...bestAmazon.result.signals
    ];

    return {
      title: `${primaryExternal.name} (Amazon Attribution)`,
      platform: primaryExternal.name,
      type: "Amazon Attribution",
      subtype: bestAmazon.result.subtype,
      verdict: bestAmazon.result.verdict,
      confidenceScore: Math.max(bestAmazon.result.confidenceScore, primaryExternal.confidence),
      signals: dedupe(signals),
      explanation:
        `This URL shows both an external affiliate-network signature and Amazon Attribution measurement parameters across the redirect chain. It is therefore classified as ${primaryExternal.name} (Amazon Attribution).`,
      matchedLayers: dedupe([primaryExternal.name, ...bestAmazon.result.matchedLayers]),
      amazonRules: getAmazonRulePanel(bestAmazon.node.urlObj, bestAmazon.node.params),
      domain: firstNode?.urlObj?.hostname || "—"
    };
  }

  if (bestAmazon) {
    return {
      title: bestAmazon.result.type,
      platform: bestAmazon.result.platform,
      type: bestAmazon.result.type,
      subtype: bestAmazon.result.subtype,
      verdict: bestAmazon.result.verdict,
      confidenceScore: bestAmazon.result.confidenceScore,
      signals: bestAmazon.result.signals,
      explanation: bestAmazon.result.explanation,
      matchedLayers: dedupe(
        bestAmazon.result.matchedLayers.concat(primaryExternal ? [primaryExternal.name] : [])
      ),
      amazonRules: getAmazonRulePanel(bestAmazon.node.urlObj, bestAmazon.node.params),
      domain: firstNode?.urlObj?.hostname || "—"
    };
  }

  if (primaryExternal) {
    const signals = [
      ...(primaryExternal.domainHit ? [`network:${primaryExternal.name}`] : []),
      ...primaryExternal.paramHits.map((k) => `param:${k}`)
    ];

    return {
      title: primaryExternal.name,
      platform: primaryExternal.name,
      type: primaryExternal.name,
      subtype: "Affiliate Network",
      verdict: `${primaryExternal.name} detected`,
      confidenceScore: primaryExternal.confidence,
      signals: dedupe(signals),
      explanation:
        `This URL was matched to ${primaryExternal.name} because its domain or parameter structure matches the known network signature library across the redirect chain.`,
      matchedLayers: [primaryExternal.name],
      amazonRules: [],
      domain: firstNode?.urlObj?.hostname || "—"
    };
  }

  return {
    title: "Unknown",
    platform: "Unknown",
    type: "Unknown",
    subtype: "No signature matched",
    verdict: "No known affiliate / attribution pattern detected",
    confidenceScore: 18,
    signals: [],
    explanation:
      "No signature in the current detection library matched this URL or the resolved redirect-chain targets.",
    matchedLayers: [],
    amazonRules: [],
    domain: firstNode?.urlObj?.hostname || "—"
  };
}

/* =========================
   Mixed Signals / Risks
========================= */

function detectMixedSignals(classification, trafficSources) {
  const warnings = [];
  const layers = classification.matchedLayers || [];

  if (layers.includes("Amazon Attribution") && layers.includes("Amazon Associates")) {
    warnings.push("Amazon Attribution and Amazon Associates signals both appear. This may indicate layered tracking or a mixed measurement setup.");
  }

  if (
    layers.includes("Amazon Attribution") &&
    layers.some((x) => x !== "Amazon Attribution" && x !== "Amazon" && !x.startsWith("Amazon "))
  ) {
    warnings.push("An external affiliate-network signature appears alongside Amazon Attribution. This is often a wrapped redirect or measurement handoff flow.");
  }

  if (layers.includes("Amazon Creator Connections") && layers.includes("Amazon Associates")) {
    warnings.push("Amazon Associates and ACC-style signals both appear. In public links, tag= should generally take precedence over ACC heuristics.");
  }

  if ((trafficSources || []).length) {
    warnings.push(`Paid traffic identifiers were also detected: ${trafficSources.join(", ")}.`);
  }

  return warnings;
}

/* =========================
   Commission Engine
========================= */

function inferPublisherFromTag(tag) {
  if (!tag) return null;
  const t = String(tag).toLowerCase();

  if (t.includes("slickdeals")) return "Slickdeals";
  if (t.includes("dealnews")) return "DealNews";
  if (t.includes("forbes")) return "Forbes";
  if (t.includes("cnn")) return "CNN";
  if (t.includes("nymag")) return "New York Magazine";
  if (t.includes("wirecutter")) return "Wirecutter";

  return null;
}

function buildCommissionEngine(classification, params, matchedLayers, trafficSources) {
  const layers = matchedLayers || [];
  const type = classification?.type || "Unknown";
  const tag = params?.tag || null;
  const publisher = inferPublisherFromTag(tag);

  const result = {
    payout_model: "unknown",
    commission_owner: "Unknown",
    attribution_owner: "Unknown",
    publisher_owner: publisher,
    network_owner: null,
    assist_layers: [],
    override_risk: "low",
    override_reasons: [],
    payout_confidence: 50,
    summary: "Unable to determine commission ownership confidently."
  };

  if (type === "Amazon Associates") {
    result.payout_model = "affiliate_commission";
    result.commission_owner = publisher
      ? `Amazon Associates publisher (${publisher})`
      : "Amazon Associates publisher";
    result.attribution_owner = "Amazon Associates";
    result.publisher_owner = publisher;
    result.payout_confidence = 94;
    result.summary = publisher
      ? `Likely Amazon Associates commission to the publisher tied to tag=${tag}.`
      : "Likely Amazon Associates commission to the publisher tied to the tag parameter.";

    if (params?.ascsubtag) {
      result.assist_layers.push("Subtag Tracking");
    }
  }

  if (type === "Amazon Attribution") {
    result.payout_model = "measurement_only";
    result.commission_owner = "No direct affiliate commission visible";
    result.attribution_owner = "Amazon Attribution";
    result.payout_confidence = 88;
    result.summary = "This link most likely supports attribution measurement rather than direct affiliate payout.";

    if ((trafficSources || []).length) {
      result.assist_layers.push(...trafficSources);
    }

    const nonAmazonLayers = layers.filter(
      (x) => x !== "Amazon Attribution" && x !== "Amazon" && !String(x).startsWith("Amazon ")
    );

    if (nonAmazonLayers.length) {
      result.assist_layers.push(...nonAmazonLayers);
      result.override_risk = "medium";
      result.override_reasons.push("Affiliate or intermediary layer present before attribution layer.");
    }
  }

  if (type === "Amazon Creator Connections") {
    result.payout_model = "creator_bonus_or_campaign";
    result.commission_owner = "Creator campaign participant";
    result.attribution_owner = "Amazon Creator Connections";
    result.payout_confidence = 78;
    result.summary = "This link most likely belongs to a creator campaign or bonus-commission style flow.";
  }

  if (classification?.platform === "Walmart" && type === "Impact Affiliate") {
    result.payout_model = "affiliate_commission";
    result.commission_owner = "Impact publisher on Walmart";
    result.attribution_owner = "Impact";
    result.network_owner = "Impact";
    result.assist_layers.push("Walmart Affiliate Program");
    result.payout_confidence = 95;
    result.summary = "Likely Walmart affiliate commission routed through Impact.";
  }

  if (classification?.platform === "Walmart" && type === "Walmart Affiliate") {
    result.payout_model = "affiliate_commission";
    result.commission_owner = "Walmart affiliate publisher";
    result.attribution_owner = "Walmart Affiliate";
    result.payout_confidence = 88;
    result.summary = "Likely Walmart affiliate payout.";
  }

  if (layers.includes("Skimlinks")) {
    result.assist_layers.push("Skimlinks");
  }
  if (layers.includes("Sovrn Commerce")) {
    result.assist_layers.push("Sovrn Commerce");
  }
  if (layers.includes("Impact") && result.network_owner !== "Impact" && type !== "Impact Affiliate") {
    result.assist_layers.push("Impact");
  }

  const hasAmazonAttribution = layers.includes("Amazon Attribution");
  const hasAmazonAssociates = layers.includes("Amazon Associates");
  const affiliateNetworks = layers.filter((x) =>
    [
      "Impact","CJ Affiliate","Awin","ShareASale","Rakuten Advertising","Partnerize / Pepperjam",
      "Pepperjam","PartnerStack","PartnerBoost","Levanta","Archer Affiliates","Skimlinks",
      "Sovrn Commerce","Webgains","TradeDoubler","TradeTracker","Refersion","UpPromote","GoAffPro"
    ].includes(x)
  );

  if (hasAmazonAttribution && hasAmazonAssociates) {
    result.override_risk = "high";
    result.override_reasons.push("Amazon Attribution and Amazon Associates both detected.");
  } else if (affiliateNetworks.length > 1) {
    result.override_risk = "high";
    result.override_reasons.push("Multiple affiliate/intermediary networks detected.");
  } else if (affiliateNetworks.length === 1 && hasAmazonAttribution) {
    result.override_risk = "medium";
    result.override_reasons.push("Affiliate network present with Amazon Attribution.");
  }

  result.assist_layers = dedupe(result.assist_layers.filter(Boolean));
  return result;
}

/* =========================
   Redirect Chain
========================= */

async function fetchWithManualRedirect(url, method = "HEAD") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "user-agent": "BrandShuo-Attribution-Intelligence/1.8.3"
      }
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function resolveRedirectUrl(currentUrl, locationHeader) {
  try {
    return new URL(locationHeader, currentUrl).toString();
  } catch {
    return null;
  }
}

async function expandHttpRedirectChain(inputUrl, maxRedirects = MAX_HTTP_REDIRECTS) {
  const chain = [inputUrl];
  const visited = new Set([inputUrl]);
  let currentUrl = inputUrl;
  let finalUrl = inputUrl;
  let stoppedReason = "final";

  for (let i = 0; i < maxRedirects; i++) {
    let response;

    try {
      response = await fetchWithManualRedirect(currentUrl, "HEAD");
    } catch {
      try {
        response = await fetchWithManualRedirect(currentUrl, "GET");
      } catch {
        stoppedReason = "network_error";
        break;
      }
    }

    const status = response.status;
    const locationHeader = response.headers.get("location");

    if (status >= 300 && status < 400 && locationHeader) {
      const nextUrl = resolveRedirectUrl(currentUrl, locationHeader);
      if (!nextUrl) {
        stoppedReason = "invalid_location";
        break;
      }

      if (visited.has(nextUrl)) {
        stoppedReason = "redirect_loop";
        finalUrl = nextUrl;
        chain.push(nextUrl);
        break;
      }

      visited.add(nextUrl);
      chain.push(nextUrl);
      currentUrl = nextUrl;
      finalUrl = nextUrl;
      continue;
    }

    finalUrl = currentUrl;
    stoppedReason = "final";
    break;
  }

  if (chain.length - 1 >= maxRedirects) {
    stoppedReason = "max_redirects_reached";
  }

  return {
    finalUrl,
    chain,
    stoppedReason
  };
}

function expandWrappedChain(urls, maxDepth = MAX_WRAPPED_DEPTH) {
  const out = [...urls];
  const visited = new Set(out);

  for (let depth = 0; depth < maxDepth; depth++) {
    const current = out[out.length - 1];
    const urlObj = getUrlObject(current);
    if (!urlObj) break;

    let nextUrl = null;

    for (const key of WRAPPED_KEYS) {
      const v = urlObj.searchParams.get(key);
      if (!v) continue;

      const decoded = (() => {
        try {
          return decodeURIComponent(v);
        } catch {
          return v;
        }
      })();

      if (/^https?:\/\//i.test(decoded)) {
        nextUrl = decoded;
        break;
      }
    }

    if (!nextUrl || visited.has(nextUrl)) break;
    visited.add(nextUrl);
    out.push(nextUrl);
  }

  return out;
}

async function buildResolvedChain(inputUrl) {
  const httpMeta = await expandHttpRedirectChain(inputUrl, MAX_HTTP_REDIRECTS);
  const urlsAfterHttp = httpMeta.chain && httpMeta.chain.length ? httpMeta.chain : [inputUrl];
  const fullUrls = expandWrappedChain(urlsAfterHttp, MAX_WRAPPED_DEPTH);

  const chain = fullUrls
    .map((raw, index) => {
      const urlObj = getUrlObject(raw);
      return {
        step: index + 1,
        raw,
        urlObj,
        params: normalizeKeys(extractParamsFromUrl(raw))
      };
    })
    .filter((x) => x.urlObj);

  return {
    stoppedReason: httpMeta.stoppedReason,
    finalUrl: chain.length ? chain[chain.length - 1].raw : inputUrl,
    chain
  };
}

/* =========================
   Notes
========================= */

function buildNotes(classification, chain) {
  const notes = [];

  if (
    classification.type === "Amazon Associates" &&
    classification.signals.some((s) => s.includes("camp") || s.includes("creative"))
  ) {
    notes.push("Amazon legacy affiliate parameters detected.");
  }

  if (
    classification.type === "Amazon Attribution" &&
    classification.matchedLayers.some((x) => x !== "Amazon Attribution" && !x.startsWith("Amazon "))
  ) {
    notes.push("External affiliate network and Amazon Attribution were both detected across the chain.");
  }

  if (classification.platform === "Walmart" && classification.type === "Impact Affiliate") {
    notes.push("Walmart partner fields and Impact-style click markers were both detected.");
  }

  if (chain.length > 1) {
    notes.push(`Redirect chain analyzed across ${chain.length} hop(s).`);
  }

  return notes;
}

/* =========================
   Main Analyze
========================= */

async function analyzeUrl(inputUrl) {
  const urlObj = getUrlObject(inputUrl);
  if (!urlObj) return null;

  const resolved = await buildResolvedChain(inputUrl);
  const chain = resolved.chain;
  const classification = buildCompositeClassification(chain);

  const mergedParams = mergeObjectsPreferringFirst(
    ...chain.map((node) => node.params).reverse()
  );

  const trafficSources = dedupe(
    chain.flatMap((node) => detectTrafficSources(node.params))
  );

  const mixedWarnings = detectMixedSignals(classification, trafficSources);
  const notes = buildNotes(classification, chain);
  const commissionEngine = buildCommissionEngine(
    classification,
    mergedParams,
    classification.matchedLayers || [],
    trafficSources
  );

  return {
    success: true,
    version: "1.8.3",
    input_url: inputUrl,
    final_url: resolved.finalUrl,
    hostname: classification.domain || urlObj.hostname,
    redirect_chain: chain.map((x) => x.raw),
    redirect_chain_length: chain.length,
    redirect_status: resolved.stoppedReason,

    classification,
    commission_engine: commissionEngine,

    traffic_sources: trafficSources,
    params: mergedParams,
    notes,
    risks: mixedWarnings,
    matched_layers: classification.matchedLayers || [],
    amazon_rules: classification.amazonRules || [],
    signals: classification.signals || []
  };
}

/* =========================
   API
========================= */

app.get("/health", (req, res) => {
  res.json({ ok: true, version: "1.8.3" });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const inputUrl = String(req.body?.url || "").trim();

    if (!inputUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing url"
      });
    }

    const result = await analyzeUrl(inputUrl);

    if (!result) {
      return res.status(400).json({
        success: false,
        error: "Invalid URL"
      });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Attribution Intelligence API running on port ${PORT}`);
});
