export default async function handler(req, res) {
  // -----------------------------------
  // CORS
  // -----------------------------------
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      detail: "Use POST to submit a URL for analysis."
    });
  }

  try {
    const body = req.body || {};
    const { url } = body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        error: "Missing or invalid url",
        detail: "Request body must contain a non-empty string field: url"
      });
    }

    const normalizedUrl = normalizeUrl(url);
    let parsed;

    try {
      parsed = new URL(normalizedUrl);
    } catch (e) {
      return res.status(400).json({
        error: "Invalid URL",
        detail: `Could not parse URL: ${normalizedUrl}`
      });
    }

    const hostname = parsed.hostname.toLowerCase();
    const lowerUrl = normalizedUrl.toLowerCase();
    const queryEntries = [...parsed.searchParams.entries()];
    const queryMap = buildQueryMap(queryEntries);

    // 1) Redirect / destination / router analysis
    const redirectChain = analyzeRedirectChain(parsed, queryMap, lowerUrl);

    // 2) Detect layers from entry URL
    const adsLayer = detectAdsLayer(queryMap);
    const affiliateLayer = detectAffiliateLayer(queryMap, lowerUrl, hostname, redirectChain);
    const amazonLayer = detectAmazonLayer(queryMap, lowerUrl, hostname, redirectChain);

    // 3) Publisher
    const publisher = detectPublisher(hostname, queryMap, lowerUrl, redirectChain);

    // 4) Platform candidates
    const platformCandidates = scorePlatforms({
      adsLayer,
      affiliateLayer,
      amazonLayer,
      hostname,
      lowerUrl,
      queryMap,
      redirectChain
    });

    const primaryPlatform = platformCandidates.length
      ? platformCandidates[0]
      : {
          name: "Unknown / Generic Link",
          score: 10,
          confidence: "Low",
          signals: []
        };

    // 5) Traffic type
    const trafficType = inferTrafficType({
      adsLayer,
      affiliateLayer,
      amazonLayer
    });

    // 6) Commission engine
    const commissionEngine = inferCommissionEngine({
      adsLayer,
      affiliateLayer,
      amazonLayer,
      primaryPlatform,
      redirectChain
    });

    // 7) Tracking layers
    const trackingLayers = [];
    if (adsLayer.detected) trackingLayers.push("Paid Media");
    if (affiliateLayer.detected) trackingLayers.push("Affiliate Network");
    if (amazonLayer.detected) trackingLayers.push("Amazon Tracking Layer");
    if (redirectChain.router_layer.detected) trackingLayers.push("Router Layer");

    // 8) Parameter signals
    const parameterSignals = {
      ...adsLayer.params,
      ...affiliateLayer.params,
      ...amazonLayer.params
    };

    // 9) Participant stack
    const participantStack = {
      paid_media: adsLayer.detected ? adsLayer.items.join(", ") : "No paid media click IDs detected",
      affiliate_network: affiliateLayer.detected ? affiliateLayer.items.join(", ") : "No affiliate network signals detected",
      amazon_layer: amazonLayer.detected
        ? (amazonLayer.items.length ? amazonLayer.items.join(", ") : "Amazon destination detected")
        : "No Amazon-specific layer detected",
      router_layer: redirectChain.router_layer.detected
        ? redirectChain.router_layer.items.join(", ")
        : "No router layer detected",
      publisher: publisher.publisher !== "Unknown"
        ? `${publisher.publisher}${publisher.sub_site && publisher.sub_site !== "-" ? " / " + publisher.sub_site : ""}`
        : "Not clearly identified",
      final_destination: redirectChain.final_destination.domain || "Unknown",
      likely_claimer: commissionEngine.primary_claimer
    };

    // 10) Conflict insight
    const conflictInsight = buildConflictInsight({
      adsLayer,
      affiliateLayer,
      amazonLayer,
      commissionEngine,
      redirectChain
    });

    // 11) Summary
    const summary = buildSummary({
      primaryPlatform,
      trafficType,
      adsLayer,
      affiliateLayer,
      amazonLayer,
      publisher,
      commissionEngine,
      redirectChain
    });

    return res.status(200).json({
      analyzed_url: normalizedUrl,
      confidence: primaryPlatform.confidence,
      traffic_type: trafficType,
      summary,
      primary_platform: {
        name: primaryPlatform.name,
        score: primaryPlatform.score,
        confidence: primaryPlatform.confidence,
        signals: primaryPlatform.signals
      },
      layers: {
        ads: adsLayer,
        affiliate: affiliateLayer,
        amazon: amazonLayer
      },
      tracking_layers: unique(trackingLayers),
      parameter_signals: parameterSignals,
      platform_candidates: platformCandidates,
      publisher,
      commission_engine: commissionEngine,
      participant_stack: participantStack,
      conflict_insight: conflictInsight,
      redirect_chain: redirectChain,
      debug: {
        hostname,
        query_keys: Object.keys(queryMap),
        router_detected: redirectChain.router_layer.detected,
        amazon_classification: amazonLayer.classification || "Unknown",
        amazon_decision_basis: amazonLayer.decision_basis || []
      }
    });
  } catch (error) {
    console.error("Analyze API error:", error);

    return res.status(500).json({
      error: "Unexpected server error",
      detail: error && error.message ? error.message : "Unknown internal error",
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
    });
  }
}

// --------------------------------------------------
// Basic helpers
// --------------------------------------------------

function normalizeUrl(input) {
  const trimmed = String(input || "").trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function buildQueryMap(entries) {
  const map = {};
  for (const [key, value] of entries) {
    if (!key) continue;
    map[String(key).trim()] = value;
  }
  return map;
}

function unique(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

function hasParam(queryMap, key) {
  return Object.prototype.hasOwnProperty.call(queryMap, key);
}

function hasAnyParam(queryMap, keys) {
  return keys.some((key) => hasParam(queryMap, key));
}

function pickParams(queryMap, keys) {
  const out = {};
  keys.forEach((k) => {
    if (hasParam(queryMap, k)) out[k] = queryMap[k];
  });
  return out;
}

function confidenceFromScore(score) {
  if (score >= 90) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

function getDomain(urlString) {
  try {
    return new URL(urlString).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function looksLikeUrl(value) {
  if (!value || typeof value !== "string") return false;
  const v = safeDecode(value).trim();
  return /^https?:\/\//i.test(v);
}

function pickNestedDestination(queryMap) {
  const nestedKeys = [
    "url",
    "u",
    "redirect",
    "redirect_url",
    "redirecturl",
    "destination",
    "dest",
    "to",
    "target",
    "target_url",
    "out",
    "murl",
    "dl",
    "deal",
    "rd",
    "r",
    "p"
  ];

  for (const key of nestedKeys) {
    if (hasParam(queryMap, key) && looksLikeUrl(queryMap[key])) {
      return safeDecode(queryMap[key]);
    }
  }

  return "";
}

// --------------------------------------------------
// Redirect / destination / router analysis
// --------------------------------------------------

function analyzeRedirectChain(parsedUrl, queryMap, lowerUrl) {
  const entryUrl = parsedUrl.toString();
  const entryDomain = parsedUrl.hostname.toLowerCase();

  const routerMatches = detectRouterLayer(entryDomain, lowerUrl, queryMap);
  const nestedDestination = pickNestedDestination(queryMap);

  let finalUrl = nestedDestination || entryUrl;
  let finalDomain = getDomain(finalUrl) || entryDomain;
  let finalPath = "/";

  try {
    finalPath = new URL(finalUrl).pathname || "/";
  } catch {
    finalPath = parsedUrl.pathname || "/";
  }

  const steps = [
    {
      type: "entry",
      label: "Original URL",
      domain: entryDomain,
      url: entryUrl
    }
  ];

  if (routerMatches.detected) {
    steps.push({
      type: "router",
      label: "Router Layer",
      domain: entryDomain,
      url: entryUrl
    });
  }

  steps.push({
    type: "destination",
    label: "Final Destination",
    domain: finalDomain,
    url: finalUrl
  });

  return {
    entry_url: entryUrl,
    final_url: finalUrl,
    final_destination: {
      domain: finalDomain,
      path: finalPath,
      is_amazon: finalDomain.includes("amazon.")
    },
    router_layer: routerMatches,
    steps
  };
}

function detectRouterLayer(hostname, lowerUrl, queryMap) {
  const items = [];
  const reasons = [];

  const routerDomains = [
    { name: "Skimlinks", match: ["go.skimresources.com", "skimresources.com", "skimlinks.com"] },
    { name: "Sovrn / VigLink", match: ["redirect.viglink.com", "viglink.com", "sovrn.com"] },
    { name: "Impact Tracking Redirect", match: ["impact.com", "impactradius.com"] },
    { name: "CJ Redirect", match: ["jdoqocy.com", "tkqlhce.com", "dpbolvw.net", "anrdoezrs.net"] },
    { name: "Awin Redirect", match: ["awin1.com"] },
    { name: "Rakuten Redirect", match: ["click.linksynergy.com"] },
    { name: "Partnerize Redirect", match: ["prf.hn"] },
    { name: "TradeDoubler Redirect", match: ["clk.tradedoubler.com"] },
    { name: "Webgains Redirect", match: ["track.webgains.com"] },
    { name: "FlexOffers Redirect", match: ["track.flexlinkspro.com"] },
    { name: "Geniuslink", match: ["geni.us", "geniuslink.com"] }
  ];

  routerDomains.forEach((rule) => {
    if (rule.match.some((m) => hostname.includes(m) || lowerUrl.includes(m))) {
      items.push(rule.name);
      reasons.push(`Matched router domain pattern: ${rule.match[0]}`);
    }
  });

  if (hasParam(queryMap, "geniuslink")) {
    items.push("Geniuslink");
    reasons.push("Detected geniuslink parameter.");
  }

  const nestedDest = pickNestedDestination(queryMap);
  if (nestedDest) {
    items.push("Nested Destination Redirect");
    reasons.push("URL contains a nested destination parameter.");
  }

  return {
    detected: items.length > 0,
    items: unique(items),
    reason: reasons.length ? reasons.join(" ") : "No router layer detected."
  };
}

// --------------------------------------------------
// Ads layer
// --------------------------------------------------

function detectAdsLayer(queryMap) {
  const items = [];
  const params = {};

  const rules = [
    { key: "gclid", label: "Google Ads" },
    { key: "gbraid", label: "Google Ads (gbraid)" },
    { key: "wbraid", label: "Google Ads (wbraid)" },
    { key: "fbclid", label: "Meta Ads" },
    { key: "ttclid", label: "TikTok Ads" },
    { key: "msclkid", label: "Microsoft Ads" },
    { key: "gad_source", label: "Google Ads / Google Surface" }
  ];

  rules.forEach(({ key, label }) => {
    if (hasParam(queryMap, key)) {
      items.push(label);
      params[key] = queryMap[key];
    }
  });

  return {
    detected: items.length > 0,
    items: unique(items),
    params
  };
}

// --------------------------------------------------
// Affiliate layer
// --------------------------------------------------

function detectAffiliateLayer(queryMap, lowerUrl, hostname, redirectChain) {
  const items = [];
  const params = {};

  const rules = [
    {
      name: "Impact",
      keys: ["irclickid", "ir_partnerid", "ir_adid", "ir_campaignid", "irgwc"]
    },
    { name: "CJ Affiliate", keys: ["cjevent"] },
    { name: "Awin", keys: ["awc"] },
    { name: "Rakuten", keys: ["ranMID", "ranEAID", "ranSiteID"] },
    { name: "ShareASale", keys: ["shareasale", "sscid", "afftrack"] },
    { name: "Partnerize", keys: ["pjid", "pjmid", "clickref"] },
    { name: "Webgains", keys: ["wgcampaignid", "wgprogramid"] },
    { name: "TradeDoubler", keys: ["tduid", "trafficsourceid"] },
    { name: "FlexOffers", keys: ["faid", "fobs"] },
    { name: "Sovrn / VigLink", keys: ["vglnk", "vgtid"] },
    { name: "Skimlinks", keys: ["skimlinks"] },
    { name: "PartnerStack", keys: ["ps_xid", "ps_partner_key"] },
    { name: "PartnerBoost", keys: ["pb", "pb_id", "pb_clickid", "pb_source"] },
    { name: "Everflow", keys: ["evclid", "everflow_id", "oid", "affid"] },
    { name: "TUNE", keys: ["tid", "aff_id", "offer_id"] },
    { name: "Admitad", keys: ["admitad_uid"] },
    { name: "Refersion", keys: ["refersion"] },
    { name: "GoAffPro", keys: ["goaffpro"] },
    { name: "UpPromote", keys: ["up_promote", "sref"] },
    { name: "ClickBank", keys: ["cbitems", "cbfid"] },
    { name: "JVZoo", keys: ["jv", "affiliate"] },
    { name: "Digistore24", keys: ["ds24"] },
    {
      name: "eBay Partner Network",
      keys: ["mkevt", "toolid", "campid", "siteid", "mkrid", "mkcid", "customid"]
    }
  ];

  rules.forEach((rule) => {
    const matched = rule.keys.filter((k) => hasParam(queryMap, k));
    if (matched.length) {
      items.push(rule.name);
      Object.assign(params, pickParams(queryMap, matched));
    }
  });

  if (hasParam(queryMap, "afsrc")) {
    params.afsrc = queryMap.afsrc;
  }

  if (String(queryMap.utm_source || "").toLowerCase() === "impact") {
    items.push("Impact");
    params.utm_source = queryMap.utm_source;
  }

  if (hostname.includes("ebay.com") && (hasParam(queryMap, "mkrid") || hasParam(queryMap, "campid"))) {
    items.push("eBay Partner Network");
  }

  if (lowerUrl.includes("wayward")) items.push("Wayward");
  if (lowerUrl.includes("skimlinks")) items.push("Skimlinks");
  if (lowerUrl.includes("viglink") || lowerUrl.includes("sovrn")) items.push("Sovrn / VigLink");

  if (hostname.includes("awin1.com")) items.push("Awin");
  if (hostname.includes("prf.hn")) items.push("Partnerize");
  if (hostname.includes("click.linksynergy.com")) items.push("Rakuten");
  if (hostname.includes("track.webgains.com")) items.push("Webgains");
  if (hostname.includes("clk.tradedoubler.com")) items.push("TradeDoubler");
  if (hostname.includes("impact.com") || hostname.includes("impactradius.com")) items.push("Impact");
  if (hostname.includes("geni.us") || hostname.includes("geniuslink.com")) items.push("Geniuslink");

  if (redirectChain.router_layer.detected) {
    redirectChain.router_layer.items.forEach((item) => {
      if (/Skimlinks|Sovrn|Impact|CJ|Awin|Rakuten|Partnerize|TradeDoubler|Webgains|FlexOffers|Geniuslink/i.test(item)) {
        items.push(item.replace(" Redirect", "").replace(" Tracking Redirect", ""));
      }
    });
  }

  return {
    detected: items.length > 0,
    items: unique(items),
    params
  };
}

// --------------------------------------------------
// Amazon layer - latest stable logic
// --------------------------------------------------

function detectAmazonLayer(queryMap, lowerUrl, hostname, redirectChain) {
  const items = [];
  const params = {};
  const decisionBasis = [];

  const refParam = String(queryMap.ref_ || "");
  const linkCode = String(queryMap.linkCode || "").toLowerCase();

  const attributionKeys = ["maas", "aa_campaignid", "aa_adgroupid", "aa_creativeid"];

  const hasAttributionParams = hasAnyParam(queryMap, attributionKeys);
  const hasAttributionRef = lowerUrl.includes("ref_=aa_maas") || refParam === "aa_maas";
  const hasAttribution = hasAttributionParams || hasAttributionRef;

  const hasTag = hasParam(queryMap, "tag");
  const hasCampaignId = hasParam(queryMap, "campaignId");
  const hasLinkId = hasParam(queryMap, "linkId");
  const hasAscSubtag = hasParam(queryMap, "ascsubtag");

  const isCreatorLinkCode = linkCode === "tr1";
  const isAssociatesLinkCode = ["ll1", "ll2", "sl1", "sl2", "as2", "assoc", "ur2"].includes(linkCode);

  const isAssociatesRef =
    refParam === "as_li_ss_tl" ||
    refParam === "as_li_tl" ||
    refParam === "as_li_ss_il";

  const isAmazonDomain = hostname.includes("amazon.") || redirectChain.final_destination.is_amazon;

  const hasAssociatesStrong =
    hasTag ||
    isAssociatesRef ||
    isAssociatesLinkCode;

  // ACC must be stronger and cleaner than plain ascsubtag.
  // ascsubtag alone is NOT enough if tag exists.
  const hasCreatorConnectionsStrong =
    hasCampaignId ||
    isCreatorLinkCode ||
    (
      hasAscSubtag &&
      !hasTag &&
      !hasAttribution &&
      !isAssociatesRef &&
      !isAssociatesLinkCode
    );

  if (hasAttribution) {
    items.push("Amazon Attribution");
    Object.assign(params, pickParams(queryMap, attributionKeys));
    if (hasAttributionRef) params.ref_ = "aa_maas";
    decisionBasis.push("Detected Amazon Attribution parameters/ref signal.");
  } else if (hasCreatorConnectionsStrong) {
    items.push("Amazon Creator Connections");
    Object.assign(params, pickParams(queryMap, ["campaignId", "ascsubtag", "linkCode"]));
    if (hasLinkId) params.linkId = queryMap.linkId;
    decisionBasis.push("Detected strong ACC signal: campaignId / linkCode=tr1 / clean ascsubtag without tag.");
  } else if (hasAssociatesStrong) {
    items.push("Amazon Associates");
    Object.assign(params, pickParams(queryMap, ["tag", "linkCode"]));
    if (refParam) params.ref_ = refParam;
    if (hasAscSubtag) params.ascsubtag = queryMap.ascsubtag;
    if (hasLinkId) params.linkId = queryMap.linkId;
    decisionBasis.push("Detected Associates signal: tag / associates-style ref / associates-style linkCode.");
    if (hasAscSubtag) {
      decisionBasis.push("ascsubtag present but treated as supporting subtag, not ACC, because Associates signal exists.");
    }
  } else if (isAmazonDomain) {
    decisionBasis.push("Amazon destination detected, but no strong attribution/ACC/ASS signal.");
  }

  if (hostname.includes("amazon.")) {
    params.amazon_domain = hostname;
  }

  if (redirectChain.final_destination.is_amazon) {
    params.final_destination_amazon = redirectChain.final_destination.domain;
  }

  let classification = "Amazon Destination Only";
  if (items.includes("Amazon Attribution")) classification = "Amazon Attribution";
  else if (items.includes("Amazon Creator Connections")) classification = "Amazon Creator Connections";
  else if (items.includes("Amazon Associates")) classification = "Amazon Associates";

  return {
    detected: items.length > 0 || redirectChain.final_destination.is_amazon,
    items: unique(items),
    params,
    classification,
    decision_basis: decisionBasis
  };
}

// --------------------------------------------------
// Publisher
// --------------------------------------------------

function detectPublisher(hostname, queryMap, lowerUrl, redirectChain) {
  let publisher = "Unknown";
  let subSite = "-";
  let type = "Unknown";
  let confidence = "Low";

  if (hostname.includes("slickdeals")) {
    publisher = "Slickdeals";
    type = "Deal Site";
    confidence = "High";
  } else if (hostname.includes("mattressnerd")) {
    publisher = "Mattress Nerd";
    type = "Review Publisher";
    confidence = "High";
  } else if (hostname.includes("cnet")) {
    publisher = "CNET";
    type = "Media Publisher";
    confidence = "High";
  } else if (hostname.includes("forbes")) {
    publisher = "Forbes";
    type = "Media Publisher";
    confidence = "High";
  } else if (hostname.includes("future")) {
    publisher = "Future Publishing";
    type = "Media Publisher";
    confidence = "Medium";
  } else if (hostname.includes("tomsguide")) {
    publisher = "Tom's Guide";
    type = "Media Publisher";
    confidence = "High";
  }

  if (hasParam(queryMap, "utm_source")) {
    const source = String(queryMap.utm_source || "").trim();
    if (source) {
      subSite = source;
      if (publisher === "Unknown") {
        publisher = source;
        type = "Traffic Source / Publisher";
        confidence = "Medium";
      }
    }
  }

  if (redirectChain.router_layer.items.includes("Skimlinks")) {
    if (publisher === "Unknown") publisher = "Skimlinks";
    type = "Sub-affiliate / Link Router";
    confidence = "Medium";
  }

  if (redirectChain.router_layer.items.includes("Geniuslink") && publisher === "Unknown") {
    publisher = "Geniuslink";
    type = "Link Router";
    confidence = "Medium";
  }

  return {
    publisher,
    sub_site: subSite,
    type,
    confidence
  };
}

// --------------------------------------------------
// Scoring
// --------------------------------------------------

function scorePlatforms({ adsLayer, affiliateLayer, amazonLayer, hostname, redirectChain }) {
  const candidates = [];

  function addCandidate(name, score, signals) {
    candidates.push({
      name,
      score,
      confidence: confidenceFromScore(score),
      signals: unique(signals)
    });
  }

  if (amazonLayer.classification === "Amazon Attribution") {
    addCandidate("Amazon Attribution", 96, [
      "maas / aa_* / ref_=aa_maas",
      "Amazon attribution layer",
      "highest-priority Amazon classification"
    ]);
  }

  if (amazonLayer.classification === "Amazon Creator Connections") {
    addCandidate("Amazon Creator Connections", 91, [
      "campaignId / linkCode=tr1 / clean ascsubtag",
      "Amazon creator layer"
    ]);
  }

  if (amazonLayer.classification === "Amazon Associates") {
    addCandidate("Amazon Associates", 90, [
      "tag / associates-style ref / associates-style linkCode",
      "Amazon affiliate tag"
    ]);
  }

  affiliateLayer.items.forEach((name) => {
    let score = 78;
    if (name === "Impact") score = 88;
    if (name === "CJ Affiliate") score = 84;
    if (name === "Awin") score = 84;
    if (name === "Rakuten") score = 84;
    if (name === "eBay Partner Network") score = 84;
    if (name === "Wayward") score = 80;
    if (name === "Skimlinks") score = 82;
    if (name === "Sovrn / VigLink") score = 82;
    if (name === "Geniuslink") score = 76;
    addCandidate(name, score, [name, "affiliate network signal"]);
  });

  adsLayer.items.forEach((name) => {
    let score = 58;
    if (name.includes("Google Ads")) score = 66;
    if (name.includes("Meta Ads")) score = 64;
    if (name.includes("TikTok Ads")) score = 64;
    if (name.includes("Microsoft Ads")) score = 62;
    addCandidate(name, score, [name, "paid media click id"]);
  });

  if (redirectChain.router_layer.detected) {
    redirectChain.router_layer.items.forEach((name) => {
      let score = 70;
      if (name === "Geniuslink") score = 68;
      addCandidate(name, score, [name, "router layer"]);
    });
  }

  if (hostname.includes("amazon.") || redirectChain.final_destination.is_amazon) {
    addCandidate("Amazon Destination", 50, ["amazon destination"]);
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .filter((item, idx, arr) => arr.findIndex((x) => x.name === item.name) === idx);
}

// --------------------------------------------------
// Traffic type
// --------------------------------------------------

function inferTrafficType({ adsLayer, affiliateLayer, amazonLayer }) {
  const hasAds = adsLayer.detected;
  const hasAffiliate = affiliateLayer.detected;
  const hasAmazon = amazonLayer.detected;

  if (hasAds && hasAffiliate && hasAmazon) return "Mixed: Paid Media + Affiliate + Amazon";
  if (hasAds && hasAffiliate) return "Mixed: Paid Media + Affiliate";
  if (hasAffiliate && hasAmazon) return "Mixed: Affiliate + Amazon";
  if (hasAds && hasAmazon) return "Mixed: Paid Media + Amazon";
  if (hasAds) return "Paid Media";
  if (hasAffiliate) return "Affiliate";
  if (hasAmazon) return "Amazon-linked";
  return "Direct / Unknown";
}

// --------------------------------------------------
// Commission engine
// --------------------------------------------------

function inferCommissionEngine({ adsLayer, affiliateLayer, amazonLayer, primaryPlatform, redirectChain }) {
  const hasAds = adsLayer.detected;
  const hasAffiliate = affiliateLayer.detected;
  const hasRouter = redirectChain.router_layer.detected;

  const amazonClassification = amazonLayer.classification || "Unknown";
  const hasAmazonAttribution = amazonClassification === "Amazon Attribution";
  const hasAmazonACC = amazonClassification === "Amazon Creator Connections";
  const hasAmazonAssociates = amazonClassification === "Amazon Associates";

  let primaryClaimer = primaryPlatform.name || "Unknown";
  let secondaryClaimers = [];
  let conflictLevel = "Low";
  let confidence = primaryPlatform.confidence || "Low";
  let reason = "Single dominant signal detected.";

  if (hasAmazonAttribution) {
    primaryClaimer = "Amazon Attribution";
    reason = "Amazon Attribution parameters were detected and classified as the dominant Amazon measurement layer.";
  } else if (hasAmazonACC) {
    primaryClaimer = "Amazon Creator Connections";
    reason = "Strong Creator Connections signals were detected and outranked generic Amazon destination indicators.";
  } else if (hasAmazonAssociates) {
    primaryClaimer = "Amazon Associates";
    reason = "Associates signals were detected as the clearest direct commission indicator.";
  } else if (hasAffiliate) {
    primaryClaimer = affiliateLayer.items[0];
    reason = "Affiliate network identifiers were detected and likely control downstream merchant-side attribution.";
  } else if (hasAds) {
    primaryClaimer = adsLayer.items[0];
    reason = "Paid media click IDs were detected, though final commission ownership may depend on downstream systems.";
  }

  if (hasAds) secondaryClaimers.push(...adsLayer.items);
  if (hasAffiliate) secondaryClaimers.push(...affiliateLayer.items);
  if (hasAmazonAttribution) secondaryClaimers.push("Amazon Attribution");
  if (hasAmazonAssociates) secondaryClaimers.push("Amazon Associates");
  if (hasAmazonACC) secondaryClaimers.push("Amazon Creator Connections");
  if (hasRouter) secondaryClaimers.push(...redirectChain.router_layer.items);

  secondaryClaimers = unique(secondaryClaimers).filter((v) => v !== primaryClaimer);

  const activeLayerCount = [
    hasAds,
    hasAffiliate,
    amazonLayer.detected,
    hasRouter
  ].filter(Boolean).length;

  if (activeLayerCount >= 4) {
    conflictLevel = "High";
    reason += " Paid media, affiliate, router, and Amazon-related signals coexist in the same path, so several systems may try to claim influence.";
  } else if (activeLayerCount >= 3) {
    conflictLevel = "High";
    reason += " Multiple attribution layers are present in the same link, so several systems may all record influence.";
  } else if (activeLayerCount === 2) {
    conflictLevel = "Medium";
    reason += " More than one attribution layer is present, so overlap or duplicate attribution is possible.";
  }

  return {
    primary_claimer: primaryClaimer,
    secondary_claimers: secondaryClaimers,
    reason,
    confidence,
    conflict_level: conflictLevel,
    decision_basis: [
      `Top scored platform: ${primaryPlatform.name || "Unknown"}`,
      `Amazon classification: ${amazonClassification}`,
      `Conflict level: ${conflictLevel}`,
      `Final destination: ${redirectChain.final_destination.domain || "Unknown"}`,
      reason
    ]
  };
}

// --------------------------------------------------
// Conflict insight
// --------------------------------------------------

function buildConflictInsight({ adsLayer, affiliateLayer, amazonLayer, commissionEngine, redirectChain }) {
  const activeLayerCount = [
    adsLayer.detected,
    affiliateLayer.detected,
    amazonLayer.detected,
    redirectChain.router_layer.detected
  ].filter(Boolean).length;

  let title = "Low overlap";
  let message = "This link does not show strong evidence of multi-layer attribution conflict.";

  if (activeLayerCount >= 2 || commissionEngine.conflict_level === "Medium") {
    title = "Attribution overlap detected";
    message = "More than one tracking layer is present. Paid media, affiliate platforms, routers, or Amazon systems may each register influence using their own attribution logic.";
  }

  if (activeLayerCount >= 3 || commissionEngine.conflict_level === "High") {
    title = "High duplicate attribution risk";
    message = "This link contains multiple active layers across paid media, affiliate routing, router redirects, and Amazon-related signals. In practice, several systems may all attempt to claim the same conversion.";
  }

  return { title, message };
}

// --------------------------------------------------
// Summary
// --------------------------------------------------

function buildSummary({
  primaryPlatform,
  trafficType,
  adsLayer,
  affiliateLayer,
  amazonLayer,
  publisher,
  commissionEngine,
  redirectChain
}) {
  const parts = [];

  parts.push(`Primary detection points to ${primaryPlatform.name}.`);
  parts.push(`Traffic type is classified as ${trafficType}.`);

  if (adsLayer.detected) {
    parts.push(`Ad layer signals found: ${adsLayer.items.join(", ")}.`);
  }

  if (affiliateLayer.detected) {
    parts.push(`Affiliate network signals found: ${affiliateLayer.items.join(", ")}.`);
  }

  if (redirectChain.router_layer.detected) {
    parts.push(`Router layer detected: ${redirectChain.router_layer.items.join(", ")}.`);
  }

  if (amazonLayer.detected && amazonLayer.items.length) {
    parts.push(`Amazon-related layers found: ${amazonLayer.items.join(", ")}.`);
  } else if (redirectChain.final_destination.is_amazon) {
    parts.push(`Final destination resolves to Amazon.`);
  }

  if (publisher.publisher !== "Unknown") {
    parts.push(`Publisher context suggests ${publisher.publisher}.`);
  }

  if (redirectChain.final_destination.domain) {
    parts.push(`Final destination resolves to ${redirectChain.final_destination.domain}.`);
  }

  parts.push(`Most likely primary claimer: ${commissionEngine.primary_claimer}.`);
  parts.push(`Conflict risk: ${commissionEngine.conflict_level}.`);

  return parts.join(" ");
}
