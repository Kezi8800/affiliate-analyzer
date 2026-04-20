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

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, statusCode, payload) {
  setCors(res);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function dedupe(arr) {
  return [...new Set(arr)];
}

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

function tryDecodeRepeatedly(value, rounds = 3) {
  let current = value;
  for (let i = 0; i < rounds; i++) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }
  return current;
}

function extractWrappedDestinations(rawUrl, depth = MAX_WRAPPED_DEPTH) {
  const found = [];
  let current = rawUrl;

  for (let i = 0; i < depth; i++) {
    const u = getUrlObject(current);
    if (!u) break;

    let next = null;

    for (const key of WRAPPED_KEYS) {
      const value = u.searchParams.get(key);
      if (value) {
        const decoded = tryDecodeRepeatedly(value);
        if (/^https?:\/\//i.test(decoded)) {
          next = decoded;
          break;
        }
      }
    }

    if (!next) break;
    found.push(next);
    current = next;
  }

  return found;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveHttpRedirects(inputUrl) {
  const chain = [inputUrl];
  let current = inputUrl;

  for (let i = 0; i < MAX_HTTP_REDIRECTS; i++) {
    let response;
    try {
      response = await fetchWithTimeout(current, {
        method: "GET",
        redirect: "manual",
        headers: {
          "user-agent": "BrandShuo Attribution Checker/2.0"
        }
      });
    } catch {
      break;
    }

    const location = response.headers.get("location");
    const isRedirect = response.status >= 300 && response.status < 400;

    if (!isRedirect || !location) break;

    const nextUrl = new URL(location, current).toString();
    chain.push(nextUrl);
    current = nextUrl;
  }

  return chain;
}

function detectNetworkCandidates(urls = []) {
  const rawHits = [];

  urls.forEach((rawUrl) => {
    const u = getUrlObject(rawUrl);
    if (!u) return;

    const hostname = u.hostname.toLowerCase();
    const params = extractParamsFromUrl(rawUrl);

    NETWORK_SIGNATURES.forEach((sig) => {
      const domainHit = hostMatches(hostname, sig.hosts);
      const paramHits = getPresentParams(params, sig.keys);

      if (domainHit || paramHits.length) {
        rawHits.push({
          name: sig.name,
          confidence: sig.confidence,
          domainHit,
          paramHits
        });
      }
    });

    ["utm_source", "utm_medium", "utm_campaign", "source", "medium", "campaign", "ref", "origin"].forEach((key) => {
      if (params[key]) {
        detectNetworkFromText(params[key], (network) => {
          rawHits.push({
            name: network,
            confidence: 72,
            domainHit: false,
            paramHits: [key]
          });
        });
      }
    });
  });

  return dedupeObjectsByName(rawHits).sort((a, b) => b.confidence - a.confidence);
}

function detectTrafficSources(params = {}) {
  const hits = [];

  const sourceFields = [
    params.utm_source,
    params.utm_medium,
    params.utm_campaign,
    params.source,
    params.medium,
    params.campaign,
    params.ref,
    params.origin
  ].filter(Boolean);

  sourceFields.forEach((v) => {
    const lower = String(v).toLowerCase();
    if (/facebook|meta|ig|instagram/.test(lower)) hits.push("Meta");
    if (/tiktok/.test(lower)) hits.push("TikTok");
    if (/google|gclid|adwords|search/.test(lower)) hits.push("Google");
    if (/youtube/.test(lower)) hits.push("YouTube");
    if (/email|klaviyo|mailchimp/.test(lower)) hits.push("Email");
    if (/influencer|creator|affiliate|partner/.test(lower)) hits.push("Affiliate / Creator");
    if (/reddit/.test(lower)) hits.push("Reddit");
    if (/pinterest/.test(lower)) hits.push("Pinterest");
  });

  if (params.gclid) hits.push("Google Ads");
  if (params.fbclid) hits.push("Meta");
  if (params.ttclid) hits.push("TikTok");

  return dedupe(hits);
}

function detectAmazonRules(urls = [], params = {}) {
  const rules = [];

  const hasAmazonUrl = urls.some((u) => {
    const obj = getUrlObject(u);
    return obj && hostMatches(obj.hostname.toLowerCase(), AMAZON_HOSTS);
  });

  if (!hasAmazonUrl) return rules;

  if (params.tag) rules.push("Amazon Associates tag");
  if (params.ascsubtag) rules.push("Amazon Associates subtag");
  if (params.aa_campaignid || params.aa_adgroupid || params.aa_creativeid) rules.push("Amazon Attribution");
  if (params.maas) rules.push("Amazon Creator Connections / Amazon internal campaign hint");
  if (params.ref_ || params.linkcode || params.language) rules.push("Amazon merchandising params");
  if (params.smid || params.content_id) rules.push("Amazon creator/content tracking hint");

  const urlWithStore = urls.find((u) => {
    const obj = getUrlObject(u);
    return obj && pathIncludes(obj.pathname, AMAZON_STORE_PATHS);
  });

  if (urlWithStore) rules.push("Amazon product/store path detected");

  return dedupe(rules);
}

function classifyUrl(urls = [], networkCandidates = [], amazonRules = [], trafficSources = []) {
  const allUrls = urls.map((u) => getUrlObject(u)).filter(Boolean);
  const final = allUrls[allUrls.length - 1] || null;
  const hostname = final ? final.hostname.toLowerCase() : "";

  const matchedLayers = [];
  const signals = [];
  const risks = [];
  const notes = [];

  networkCandidates.forEach((n) => matchedLayers.push(n.name));
  amazonRules.forEach((r) => signals.push(r));
  trafficSources.forEach((t) => signals.push(`Traffic: ${t}`));

  let platform = "Unknown";
  let type = "Unknown";
  let subtype = "Unknown";
  let verdict = "Unclear";
  let title = "Unknown Link Type";
  let explanation = "The tool could not confidently determine the attribution type.";
  let confidenceScore = 40;

  const finalParams = final ? extractParamsFromUrl(final.toString()) : {};
  const mergedParams = urls
    .map((u) => extractParamsFromUrl(u))
    .reduce((acc, item) => mergeObjectsPreferringFirst(acc, item), {});

  const topNetwork = networkCandidates[0]?.name || null;

  if (hostname && hostMatches(hostname, AMAZON_HOSTS)) {
    platform = "Amazon";

    if (mergedParams.aa_campaignid || mergedParams.aa_adgroupid || mergedParams.aa_creativeid) {
      type = "Amazon Attribution";
      subtype = "Brand / Seller paid media attribution";
      verdict = "Brand-owned attribution likely";
      title = "Amazon Attribution";
      explanation = "Amazon Attribution parameters were detected. This usually means the seller or brand is measuring off-Amazon traffic performance rather than sending payout through a classic publisher affiliate tag.";
      confidenceScore = 95;
      matchedLayers.push("Amazon Attribution");
    } else if (mergedParams.tag) {
      type = "Amazon Associates";
      subtype = "Publisher affiliate link";
      verdict = "Publisher commission likely";
      title = "Amazon Associates";
      explanation = "An Amazon Associates tracking tag was detected. This usually indicates a publisher, creator, or affiliate partner is eligible for commission credit.";
      confidenceScore = 96;
      matchedLayers.push("Amazon Associates");
    } else if (mergedParams.maas || mergedParams.smid || mergedParams.content_id) {
      type = "Amazon Creator Connections";
      subtype = "Creator / influencer assist layer";
      verdict = "Creator-linked attribution possible";
      title = "Amazon Creator Connections";
      explanation = "Creator-oriented Amazon parameters were detected. This pattern suggests creator or influencer tracking rather than a standard Associates-only link.";
      confidenceScore = 85;
      matchedLayers.push("Amazon Creator Connections");
    } else {
      type = "Amazon";
      subtype = "Generic Amazon destination";
      verdict = "Amazon destination detected";
      title = "Amazon Link";
      explanation = "The link resolves to an Amazon destination, but no explicit Amazon affiliate or attribution parameter was strongly identified.";
      confidenceScore = 72;
    }
  } else if (hostname && hostMatches(hostname, WALMART_HOSTS)) {
    platform = "Walmart";
    title = "Walmart Affiliate / Attribution";
    if (mergedParams.wmlspartner || mergedParams.affiliates_ad_id || mergedParams.campaign_id) {
      type = "Walmart Affiliate";
      subtype = "Publisher affiliate link";
      verdict = "Publisher commission likely";
      explanation = "Walmart affiliate parameters were detected, which strongly indicates publisher or partner commission tracking.";
      confidenceScore = 92;
      matchedLayers.push("Walmart");
    } else {
      type = "Walmart";
      subtype = "Generic Walmart destination";
      verdict = "Walmart destination detected";
      explanation = "The link resolves to Walmart, though explicit affiliate parameters were not strongly detected.";
      confidenceScore = 74;
    }
  } else if (topNetwork) {
    platform = topNetwork;
    type = "Affiliate Network Redirect";
    subtype = "Network tracking layer";
    verdict = "Affiliate layer detected";
    title = `${topNetwork} Redirect`;
    explanation = `The URL contains one or more signatures associated with ${topNetwork}. This usually means the link is passing through an affiliate network tracking layer before reaching the final merchant.`;
    confidenceScore = Math.max(78, networkCandidates[0].confidence);
  } else if (trafficSources.length) {
    platform = "Traffic Tagged Link";
    type = "Tagged traffic link";
    subtype = "UTM / paid or organic source markers";
    verdict = "Traffic source tagging detected";
    title = "Traffic-Tagged URL";
    explanation = "Traffic source markers such as UTM-style parameters were detected, but a direct affiliate network signature was not strongly confirmed.";
    confidenceScore = 68;
  }

  if (networkCandidates.length > 1) {
    risks.push("Multiple affiliate or attribution layers detected.");
  }

  if (
    matchedLayers.includes("Amazon Attribution") &&
    matchedLayers.includes("Amazon Associates")
  ) {
    risks.push("Amazon Attribution and Amazon Associates appeared together. Commission ownership may be mixed or overridden depending on implementation.");
    notes.push("This can indicate a brand measurement layer plus a publisher monetization layer.");
  }

  if (
    matchedLayers.includes("Skimlinks") ||
    matchedLayers.includes("Sovrn Commerce")
  ) {
    notes.push("Commerce content monetization layer detected. This may act as an intermediary before the merchant destination.");
  }

  return {
    classification: {
      platform,
      type,
      subtype,
      verdict,
      title,
      explanation,
      confidenceScore,
      signals: dedupe(signals),
      matchedLayers: dedupe(matchedLayers),
      amazonRules: dedupe(amazonRules)
    },
    risks: dedupe(risks),
    notes: dedupe(notes)
  };
}

function buildCommissionEngine(classification, matchedLayers, trafficSources) {
  const type = classification?.type || "";
  const layers = matchedLayers || [];

  let payout_model = "Unknown";
  let commission_owner = "Unknown";
  let attribution_owner = "Unknown";
  let publisher_owner = "Unknown";
  let network_owner = "Unknown";
  let payout_confidence = 55;
  let override_risk = "low";
  const override_reasons = [];
  const assist_layers = [];

  const nonAmazonNetworks = layers.filter((x) => !String(x).startsWith("Amazon"));

  if (type === "Amazon Associates") {
    payout_model = "Affiliate payout";
    commission_owner = "Publisher / Creator";
    attribution_owner = "Amazon Associates";
    publisher_owner = "Publisher / Creator";
    payout_confidence = 95;
  } else if (type === "Amazon Attribution") {
    payout_model = "Brand measurement / attribution";
    commission_owner = "Brand / Seller";
    attribution_owner = "Amazon Attribution";
    publisher_owner = "Not primary payout owner";
    payout_confidence = 95;
  } else if (type === "Amazon Creator Connections") {
    payout_model = "Creator assist / creator commerce";
    commission_owner = "Creator / Influencer";
    attribution_owner = "Amazon creator-linked flow";
    publisher_owner = "Creator / Influencer";
    payout_confidence = 84;
  } else if (/Walmart Affiliate/i.test(type)) {
    payout_model = "Affiliate payout";
    commission_owner = "Publisher / Creator";
    attribution_owner = "Walmart Affiliate";
    publisher_owner = "Publisher / Creator";
    payout_confidence = 92;
  } else if (/Affiliate Network Redirect/i.test(type)) {
    payout_model = "Affiliate network payout";
    commission_owner = "Publisher / Partner";
    attribution_owner = "Affiliate Network";
    publisher_owner = "Publisher / Partner";
    payout_confidence = 86;
  }

  if (nonAmazonNetworks.length) {
    network_owner = nonAmazonNetworks[0];
    assist_layers.push(...nonAmazonNetworks);
  }

  if (trafficSources.length) {
    assist_layers.push(...trafficSources.map((x) => `${x} traffic`));
  }

  if (layers.includes("Amazon Attribution") && layers.includes("Amazon Associates")) {
    override_risk = "high";
    override_reasons.push("Amazon Attribution and Amazon Associates coexist in the same path.");
    override_reasons.push("Measurement and payout layers may not belong to the same stakeholder.");
    payout_confidence = Math.min(payout_confidence, 80);
  } else if (layers.length > 1) {
    override_risk = "medium";
    override_reasons.push("Multiple tracking layers detected in the redirect flow.");
  }

  const summary = [
    `Payout model: ${payout_model}.`,
    `Likely commission owner: ${commission_owner}.`,
    attribution_owner !== "Unknown" ? `Attribution owner: ${attribution_owner}.` : "",
    network_owner !== "Unknown" ? `Network layer: ${network_owner}.` : "",
    assist_layers.length ? `Assist layers: ${dedupe(assist_layers).join(", ")}.` : "",
    override_risk !== "low" ? `Override risk: ${override_risk}.` : ""
  ]
    .filter(Boolean)
    .join(" ");

  return {
    payout_model,
    commission_owner,
    attribution_owner,
    publisher_owner,
    network_owner,
    payout_confidence,
    assist_layers: dedupe(assist_layers),
    override_risk,
    override_reasons: dedupe(override_reasons),
    summary
  };
}

function buildFlowNodes(classification, matchedLayers, trafficSources, hostname) {
  const nodes = [];

  trafficSources.forEach((t) => nodes.push({ label: t, type: "traffic" }));
  matchedLayers.forEach((l) => {
    if (!String(l).includes("Amazon")) {
      nodes.push({ label: l, type: "network" });
    }
  });

  if (classification?.type) {
    nodes.push({ label: classification.type, type: "classification" });
  }

  nodes.push({ label: hostname || "Destination", type: "final" });

  return nodes;
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "GET") {
    json(res, 200, {
      success: true,
      message: "BrandShuo analyze API is running."
    });
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, {
      success: false,
      error: "Method not allowed"
    });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const inputUrl = String(body.url || "").trim();

    if (!inputUrl) {
      json(res, 400, {
        success: false,
        error: "Missing url"
      });
      return;
    }

    let normalizedInput = inputUrl;
    if (!/^https?:\/\//i.test(normalizedInput)) {
      normalizedInput = `https://${normalizedInput}`;
    }

    const parsed = getUrlObject(normalizedInput);
    if (!parsed) {
      json(res, 400, {
        success: false,
        error: "Invalid URL"
      });
      return;
    }

    const wrappedDestinations = extractWrappedDestinations(normalizedInput, MAX_WRAPPED_DEPTH);
    const redirectChain = await resolveHttpRedirects(normalizedInput);

    const allUrls = dedupe([
      normalizedInput,
      ...wrappedDestinations,
      ...redirectChain
    ]);

    const finalUrl = allUrls[allUrls.length - 1] || normalizedInput;
    const finalObj = getUrlObject(finalUrl);
    const hostname = finalObj?.hostname || parsed.hostname;

    const mergedParams = allUrls
      .map((u) => normalizeKeys(extractParamsFromUrl(u)))
      .reduce((acc, item) => mergeObjectsPreferringFirst(acc, item), {});

    const networkCandidates = detectNetworkCandidates(allUrls);
    const amazonRules = detectAmazonRules(allUrls, mergedParams);
    const trafficSources = detectTrafficSources(mergedParams);

    const classified = classifyUrl(
      allUrls,
      networkCandidates,
      amazonRules,
      trafficSources
    );

    const matchedLayers = dedupe([
      ...(classified.classification?.matchedLayers || []),
      ...networkCandidates.map((n) => n.name)
    ]);

    const commission_engine = buildCommissionEngine(
      classified.classification,
      matchedLayers,
      trafficSources
    );

    const flow_nodes = buildFlowNodes(
      classified.classification,
      matchedLayers,
      trafficSources,
      hostname
    );

    json(res, 200, {
      success: true,
      input_url: normalizedInput,
      final_url: finalUrl,
      hostname,
      params: mergedParams,
      redirect_chain: redirectChain,
      wrapped_destinations: wrappedDestinations,
      network_candidates: networkCandidates,
      matched_layers: matchedLayers,
      amazon_rules: amazonRules,
      traffic_sources: trafficSources,
      classification: classified.classification,
      commission_engine,
      risks: classified.risks,
      notes: classified.notes,
      flow_nodes
    });
  } catch (error) {
    json(res, 500, {
      success: false,
      error: error?.message || "Internal server error"
    });
  }
};
