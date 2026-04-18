const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 8000;

const PLATFORM_DOMAIN_RULES = [
  { name: "Impact", hosts: ["impact.com", "impactradius.com"] },
  { name: "CJ Affiliate", hosts: ["anrdoezrs.net", "jdoqocy.com", "kqzyfj.com", "dpbolvw.net", "tkqlhce.com", "emjcd.com", "cj.com"] },
  { name: "Awin", hosts: ["awin1.com", "awin.com"] },
  { name: "ShareASale", hosts: ["shareasale.com"] },
  { name: "Rakuten Advertising", hosts: ["click.linksynergy.com", "linksynergy.com"] },
  { name: "Partnerize / Pepperjam", hosts: ["partnerize.com", "pepperjamnetwork.com", "pntra.com"] },
  { name: "Pepperjam", hosts: ["pepperjamnetwork.com", "pntra.com"] },

  { name: "Levanta", hosts: ["levanta.io"] },
  { name: "Archer Affiliates", hosts: ["archeraffiliates.com"] },
  { name: "LinkConnector", hosts: ["linkconnector.com"] },
  { name: "Webgains", hosts: ["webgains.com", "track.webgains.com"] },
  { name: "TradeDoubler", hosts: ["tradedoubler.com", "clk.tradedoubler.com"] },
  { name: "TradeTracker", hosts: ["tradetracker.net", "tc.tradetracker.net"] },
  { name: "Optimise Media", hosts: ["optimisemedia.com", "optimise.co.uk"] },
  { name: "Daisycon", hosts: ["daisycon.com", "ds1.nl"] },
  { name: "Adservice", hosts: ["adservice.com", "track.adservice.com"] },
  { name: "Affilinet", hosts: ["affilinet.com"] },

  { name: "Adtraction", hosts: ["adtraction.com", "adtr.co"] },
  { name: "AvantLink", hosts: ["avantlink.com"] },
  { name: "MaxBounty", hosts: ["maxbounty.com"] },
  { name: "CPAlead", hosts: ["cpalead.com"] },
  { name: "ClickDealer", hosts: ["clickdealer.com"] },
  { name: "AdCombo", hosts: ["adcombo.com"] },
  { name: "Dr.Cash", hosts: ["dr.cash"] },

  { name: "Admitad", hosts: ["admitad.com", "ad.admitad.com"] },
  { name: "FlexOffers", hosts: ["clk.omgt5.com", "flexlinkspro.com"] },
  { name: "PartnerStack", hosts: ["partnerstack.com"] },
  { name: "PartnerBoost", hosts: ["partnerboost.com"] },
  { name: "TUNE", hosts: ["hasoffers.com", "tune.com"] },
  { name: "Everflow", hosts: ["everflow.io", "everflowtrk.com"] },
  { name: "Refersion", hosts: ["refersion.com"] },
  { name: "UpPromote", hosts: ["secomapp.com", "uppromote.com"] },
  { name: "GoAffPro", hosts: ["goaffpro.com"] },

  { name: "Skimlinks", hosts: ["go.skimresources.com", "skimresources.com"] },
  { name: "Sovrn Commerce", hosts: ["redirect.viglink.com", "viglink.com", "shop-links.co", "sovrn.com"] },

  { name: "Amazon Associates", hosts: ["amazon.com", "amzn.to", "amazon.ca", "amazon.co.uk", "amazon.de", "amazon.fr", "amazon.it", "amazon.es", "amazon.co.jp"] },
  { name: "Amazon Creator Connections", hosts: ["amazon.com"] },

  { name: "eBay Partner Network", hosts: ["rover.ebay.com", "ebay.com"] },
  { name: "Shopify Collabs", hosts: ["shopify.com", "shop.app"] },

  { name: "ClickBank", hosts: ["hop.clickbank.net", "clickbank.net", "clickbank.com"] },
  { name: "JVZoo", hosts: ["jvzoo.com", "jvz8.com"] },
  { name: "GiddyUp", hosts: ["giddyup.com"] },
  { name: "affiliaXe", hosts: ["affiliaxe.com"] }
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
  shopify_collabs: "Shopify Collabs"
};

function dedupe(arr) {
  return [...new Set(arr)];
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

function normalizeKeys(obj = {}) {
  const normalized = {};
  Object.keys(obj || {}).forEach((key) => {
    normalized[String(key).toLowerCase()] = obj[key];
  });
  return normalized;
}

function getUrlObject(input) {
  try { return new URL(input); } catch { return null; }
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

function detectByDomain(urlObj, detected) {
  if (!urlObj) return detected;

  const host = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname.toLowerCase();
  const result = [...detected];

  PLATFORM_DOMAIN_RULES.forEach((rule) => {
    if (rule.hosts.some((h) => host.includes(h))) {
      if (!result.includes(rule.name)) result.push(rule.name);
    }
  });

  if (host.includes("amazon.") && pathname.includes("/gp/product/")) {
    if (!result.includes("Amazon Associates")) result.push("Amazon Associates");
  }

  if (host.includes("shop.app") || pathname.includes("/collabs")) {
    if (!result.includes("Shopify Collabs")) result.push("Shopify Collabs");
  }

  return dedupe(result);
}

function detectNetworkFromText(text, push) {
  if (!text) return;
  const safeText = String(text).toLowerCase();

  Object.entries(UTM_NETWORK_MAP).forEach(([keyword, network]) => {
    if (safeText.includes(keyword)) push(network);
  });
}

function enrichDetectedFromParams(detected, params, urlObj) {
  const result = [...detected];
  const utmMedium = (params.utm_medium || "").toLowerCase();
  const utmSource = (params.utm_source || "").toLowerCase();
  const utmCampaign = (params.utm_campaign || "").toLowerCase();
  const utmContent = (params.utm_content || "").toLowerCase();
  const host = urlObj ? urlObj.hostname.toLowerCase() : "";

  const push = (name) => {
    if (!result.includes(name)) result.push(name);
  };

  if (params.campaignid || params.linkid) {
    push("Amazon Creator Connections");
  }

  if (
    params.tag ||
    params.ascsubtag ||
    ((params.camp || params.creative || params.linkcode) && params.tag)
  ) {
    push("Amazon Associates");
  }

  if (params.maas || params.aa_campaignid || params.aa_adgroupid || params.aa_creativeid || params.ref_) {
    push("Amazon Attribution");
  }

  if (
    params.irclickid ||
    params.irgwc ||
    params.cidimp ||
    utmCampaign.includes("impact") ||
    utmMedium.includes("impact")
  ) {
    push("Impact");
  }

  if (params.cjevent) push("CJ Affiliate");
  if (params.awc || params.clickref) push("Awin");
  if (params.afftrack) push("ShareASale");
  if (params.ranmid || params.raneaid || params.ransiteid) push("Rakuten Advertising");

  if (params.pjid || params.pjmid) {
    push("Partnerize / Pepperjam");
    push("Pepperjam");
  }

  if (params.lc_sid || params.lc_mid || params.lc_cid || params.atid) push("LinkConnector");
  if (params.wgcampaignid || params.wgprogramid) push("Webgains");
  if (params.tduid || params.trafficsourceid) push("TradeDoubler");
  if (params.tt || params.ttid) push("TradeTracker");

  if (params.adtractionid || params.adt_id) push("Adtraction");
  if (params.admitad_uid || params.admitad) push("Admitad");
  if (params.faid || params.fobs) push("FlexOffers");

  if (params.ef_transaction_id || params.everflow_id || params.everflow_click_id) push("Everflow");

  if (params.aff_sub || params.aff_sub2 || params.aff_sub3 || params.offer_id) {
    if (host.includes("hasoffers") || host.includes("tune")) push("TUNE");
  }

  if (params.refersion || params.refersion_id) push("Refersion");
  if (params.uppromote || params.secomapp_aff || params.upromote) push("UpPromote");

  if (params.goaffpro || params.gapr || params.ref) {
    if (host.includes("goaffpro")) push("GoAffPro");
  }

  if (params.ps_xid || params.ps_partner_key) push("PartnerStack");
  if (params.pb || params.pb_id || params.pb_clickid || params.pb_source) push("PartnerBoost");

  if (params.skimlinks || params.skm || utmSource.includes("skimbit") || utmSource.includes("skimlinks")) {
    push("Skimlinks");
  }

  if (params.vglnk || params.vgtid) push("Sovrn Commerce");

  if (params.tid || params.vtid) push("ClickBank");
  if (params.jvzoo || params.jvz) push("JVZoo");
  if (params.campid || params.customid || params.mpre || params.pub) push("eBay Partner Network");

  if (params.avantlink || params.advl) push("AvantLink");
  if (params.maxbounty || params.mbsy) push("MaxBounty");

  if (params.cpalead || params.pubid) {
    if (host.includes("cpalead")) push("CPAlead");
  }

  if (params.clickdealer || params.cd) push("ClickDealer");
  if (params.adcombo || params.acid) push("AdCombo");
  if (params.drcash || params.dr_cash || params.dr_id) push("Dr.Cash");

  if (
    host.includes("levanta.io") ||
    params.levanta_campaign ||
    params.levanta_creator ||
    (host.includes("levanta") &&
      (params.referral || params.creator || params.affiliate || utmSource.includes("levanta") || utmCampaign.includes("levanta")))
  ) {
    push("Levanta");
  }

  if (
    host.includes("archeraffiliates.com") ||
    params.archer_campaign ||
    params.archer_creator ||
    (host.includes("archer") &&
      (params.referral || params.creator || params.affiliate || utmSource.includes("archer") || utmCampaign.includes("archer")))
  ) {
    push("Archer Affiliates");
  }

  detectNetworkFromText(utmMedium, push);
  detectNetworkFromText(utmCampaign, push);
  detectNetworkFromText(utmSource, push);
  detectNetworkFromText(utmContent, push);

  if (
    params.subid ||
    params.sub_id ||
    params.aff_id ||
    params.affiliate_id ||
    params.click_id ||
    params.clickid ||
    utmMedium.includes("aff") ||
    utmMedium.includes("affiliate")
  ) {
    push("Generic Affiliate Tracking");
  }

  if (params.utm_source || params.utm_medium || params.utm_campaign || params.utm_term || params.utm_content) {
    push("UTM Tracking");
  }

  return dedupe(result);
}

function detectLinkStructure(detected, params, finalUrlObj) {
  const primaryOrder = [
    "Amazon Associates",
    "Amazon Attribution",
    "Impact",
    "CJ Affiliate",
    "Awin",
    "Rakuten Advertising",
    "ShareASale",
    "FlexOffers",
    "Admitad",
    "TradeDoubler",
    "Partnerize / Pepperjam",
    "PartnerStack",
    "TUNE",
    "Everflow",
    "PartnerBoost",
    "Levanta",
    "Archer Affiliates",
    "Refersion",
    "UpPromote",
    "GoAffPro",
    "Skimlinks",
    "Sovrn Commerce",
    "LinkConnector",
    "ClickBank",
    "JVZoo",
    "GiddyUp",
    "affiliaXe",
    "eBay Partner Network",
    "Shopify Collabs",
    "Webgains",
    "TradeTracker",
    "Optimise Media",
    "Daisycon",
    "Adservice",
    "Affilinet",
    "Pepperjam",
    "AvantLink",
    "MaxBounty",
    "CPAlead",
    "ClickDealer",
    "AdCombo",
    "Dr.Cash"
  ];

  let primary = "Unknown";
  for (const name of primaryOrder) {
    if (detected.includes(name)) {
      primary = name;
      break;
    }
  }

  const secondary = [];
  if (detected.includes("Amazon Creator Connections")) secondary.push("Amazon Creator Connections");

  let confidence = "medium";
  if (
    params.tag || params.ascsubtag || params.cjevent || params.awc || params.irclickid || params.irgwc ||
    params.ranmid || params.afftrack || params.tduid || params.wgcampaignid || params.ps_xid ||
    params.pb || params.pb_id || params.everflow_id || params.tid
  ) {
    confidence = "high";
  } else if (primary === "Unknown") {
    confidence = "low";
  }

  return { primary, secondary: dedupe(secondary), confidence };
}

function detectTrafficLayer(detected, params) {
  const secondary = [];
  let primary = "Unknown";
  let confidence = "low";

  if (params.gclid || params.gbraid || params.wbraid || params.gad_campaignid) {
    primary = "Google Ads";
    confidence = "high";
  } else if (params.fbclid) {
    primary = "Meta Ads";
    confidence = "high";
  } else if (params.ttclid) {
    primary = "TikTok Ads";
    confidence = "high";
  } else if (params.msclkid) {
    primary = "Microsoft Ads";
    confidence = "high";
  } else if (
    detected.includes("Impact") ||
    detected.includes("CJ Affiliate") ||
    detected.includes("Awin") ||
    detected.includes("ShareASale") ||
    detected.includes("Rakuten Advertising") ||
    detected.includes("Partnerize / Pepperjam") ||
    detected.includes("PartnerStack") ||
    detected.includes("Everflow") ||
    detected.includes("PartnerBoost") ||
    detected.includes("Skimlinks") ||
    detected.includes("Sovrn Commerce") ||
    (params.utm_medium || "").toLowerCase().includes("aff") ||
    (params.utm_medium || "").toLowerCase().includes("affiliate")
  ) {
    primary = "Affiliate Traffic";
    confidence = "medium";
  }

  if (params.utm_source || params.utm_medium || params.utm_campaign || params.utm_content) {
    secondary.push("UTM Tracking");
    if (confidence === "low") confidence = "medium";
  }

  if ((params.utm_source || "").toLowerCase().includes("skimbit") || (params.utm_source || "").toLowerCase().includes("skimlinks")) {
    secondary.push("Publisher Referral");
  }

  return { primary, secondary: dedupe(secondary), confidence };
}

function detectCampaignContext(detected, params) {
  let primary = "Unknown";
  const secondary = [];
  let inferred = false;
  let confidence = "low";

  if (params.campaignid || params.linkid) {
    primary = "Amazon Creator Connections";
    confidence = "high";
  } else if (
    detected.includes("Skimlinks") ||
    detected.includes("Sovrn Commerce") ||
    (params.utm_source || "").toLowerCase().includes("skimbit") ||
    (params.utm_source || "").toLowerCase().includes("skimlinks")
  ) {
    primary = "Publisher Deal";
    inferred = true;
    confidence = "medium";
  } else if (params.coupon || params.discount) {
    primary = "Coupon Campaign";
    inferred = true;
    confidence = "medium";
  } else if (
    detected.includes("PartnerBoost") ||
    detected.includes("PartnerStack") ||
    detected.includes("Refersion") ||
    detected.includes("UpPromote") ||
    detected.includes("GoAffPro") ||
    detected.includes("Everflow") ||
    detected.includes("TUNE")
  ) {
    primary = "Brand Affiliate Campaign";
    inferred = true;
    confidence = "medium";
  }

  if (detected.includes("Amazon Creator Connections") && primary !== "Amazon Creator Connections") {
    secondary.push("Amazon Creator Connections");
  }

  return { primary, secondary: dedupe(secondary), inferred, confidence };
}

function inferRisks(linkStructure, trafficLayer, campaignContext, params, redirectChain = [], detected = []) {
  const risks = [];
  const utmMedium = (params.utm_medium || "").toLowerCase();
  const utmCampaign = (params.utm_campaign || "").toLowerCase();

  if (linkStructure.primary === "Amazon Attribution" && detected.includes("Amazon Associates")) {
    risks.push("Possible duplicate attribution signal");
  }

  if (
    (
      params.irgwc ||
      params.irclickid ||
      params.cidimp ||
      utmMedium.includes("impact") ||
      utmCampaign.includes("impact")
    ) &&
    (params.utm_source || params.utm_medium || params.utm_campaign)
  ) {
    risks.push("Affiliate network + UTM layering detected");
  }

  if (detected.includes("Awin") && detected.includes("ShareASale")) {
    risks.push("Awin + ShareASale style markers both present");
  }

  if (redirectChain.length > 2) {
    risks.push("Multi-hop redirect chain detected");
  }

  if (Object.keys(params).length > 10) {
    risks.push("Link contains many tracking parameters");
  }

  if (campaignContext.inferred) {
    risks.push("Campaign context inferred, not explicit");
  }

  if (!risks.length) {
    risks.push("No obvious structural risk detected");
  }

  return risks;
}

function buildNotes(linkStructure, trafficLayer, campaignContext, redirectMeta, params) {
  const notes = [];

  if (linkStructure.primary === "Amazon Associates" && (params.camp || params.creative || params.linkcode)) {
    notes.push("Amazon legacy affiliate parameters detected.");
  }

  if (campaignContext.primary === "Amazon Creator Connections" && linkStructure.primary === "Amazon Associates") {
    notes.push("Creator Connections can coexist with standard Amazon Associates link structure.");
  }

  if (trafficLayer.secondary.includes("Publisher Referral")) {
    notes.push("Publisher referral signals detected from source-level markers.");
  }

  if (redirectMeta && redirectMeta.chain && redirectMeta.chain.length > 1) {
    notes.push(`Redirect chain analyzed across ${redirectMeta.chain.length} hop(s).`);
  }

  if (campaignContext.inferred) {
    notes.push("Campaign context is inferred from surrounding signals rather than explicit platform-only fields.");
  }

  return notes;
}

async function fetchWithManualRedirect(url, method = "HEAD") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "user-agent": "BrandShuo-Attribution-Intelligence/1.7"
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

async function expandRedirectChain(inputUrl, maxRedirects = MAX_REDIRECTS) {
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

function analyzeUrlList(urls, redirectMeta = null) {
  const allParams = [];
  const allDetected = [];
  let finalUrlObj = null;

  for (const rawUrl of urls) {
    const urlObj = getUrlObject(rawUrl);
    if (!urlObj) continue;

    finalUrlObj = urlObj;
    const params = normalizeKeys(extractParamsFromUrl(rawUrl));
    allParams.push(params);

    let detected = [];
    detected = enrichDetectedFromParams(detected, params, urlObj);
    detected = detectByDomain(urlObj, detected);
    allDetected.push(...detected);
  }

  const mergedParams = mergeObjectsPreferringFirst(...allParams.reverse());
  const detected = dedupe(allDetected);

  const linkStructure = detectLinkStructure(detected, mergedParams, finalUrlObj);
  const trafficLayer = detectTrafficLayer(detected, mergedParams);
  const campaignContext = detectCampaignContext(detected, mergedParams);
  const risks = inferRisks(linkStructure, trafficLayer, campaignContext, mergedParams, redirectMeta?.chain || [], detected);
  const notes = buildNotes(linkStructure, trafficLayer, campaignContext, redirectMeta, mergedParams);

  return {
    success: true,
    url: urls[0],
    final_url: redirectMeta?.finalUrl || urls[urls.length - 1] || urls[0],
    hostname: finalUrlObj ? finalUrlObj.hostname : null,
    redirect_chain: redirectMeta?.chain || [urls[0]],
    redirect_chain_length: (redirectMeta?.chain || [urls[0]]).length,
    redirect_status: redirectMeta?.stoppedReason || "not_checked",

    link_structure: linkStructure,
    traffic_layer: trafficLayer,
    campaign_context: campaignContext,

    detected,
    params: mergedParams,
    notes,
    risks
  };
}

async function analyzeUrl(inputUrl) {
  const urlObj = getUrlObject(inputUrl);
  if (!urlObj) return null;

  const redirectMeta = await expandRedirectChain(inputUrl, MAX_REDIRECTS);
  const urlsToAnalyze = redirectMeta.chain && redirectMeta.chain.length ? redirectMeta.chain : [inputUrl];

  return analyzeUrlList(urlsToAnalyze, redirectMeta);
}

app.get("/health", (req, res) => {
  res.json({ ok: true, version: "1.7" });
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Attribution Intelligence API running on port ${PORT}`);
});
