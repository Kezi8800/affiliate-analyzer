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

    // 3) Publisher / Merchant / Retailer hint / Group
    const publisher = detectPublisher(hostname, queryMap, lowerUrl, redirectChain);
    const merchant = detectMerchant(hostname, queryMap, redirectChain);
    const retailerProgramHint = detectRetailerProgramHint(
      hostname,
      queryMap,
      redirectChain,
      affiliateLayer,
      merchant
    );
    const publisherGroup = detectPublisherGroup(publisher.publisher);

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

    // 7) Traffic quality / intent / incrementality / conflict / roles
    const trafficQuality = evaluateTrafficQuality({
      publisher,
      publisherGroup,
      affiliateLayer,
      merchant,
      retailerProgramHint,
      trafficType,
      adsLayer,
      amazonLayer,
      redirectChain
    });

    const commercialIntent = evaluateCommercialIntent({
      publisher,
      publisherGroup,
      affiliateLayer,
      merchant,
      retailerProgramHint,
      trafficType,
      adsLayer,
      amazonLayer,
      redirectChain,
      queryMap
    });

    const incrementalityRisk = evaluateIncrementalityRisk({
      publisher,
      publisherGroup,
      affiliateLayer,
      merchant,
      retailerProgramHint,
      trafficType,
      adsLayer,
      amazonLayer,
      redirectChain,
      trafficQuality,
      commercialIntent,
      queryMap
    });

    const attributionConflict = evaluateAttributionConflictV2({
      adsLayer,
      affiliateLayer,
      amazonLayer,
      publisher,
      publisherGroup,
      merchant,
      retailerProgramHint,
      trafficType,
      redirectChain,
      commissionEngine,
      trafficQuality,
      commercialIntent,
      incrementalityRisk,
      queryMap
    });

    const channelRoles = evaluateChannelRoles({
      adsLayer,
      affiliateLayer,
      amazonLayer,
      publisher,
      publisherGroup,
      merchant,
      retailerProgramHint,
      trafficType,
      redirectChain,
      trafficQuality,
      commercialIntent,
      incrementalityRisk,
      attributionConflict
    });

    // 8) Tracking layers
    const trackingLayers = [];
    if (adsLayer.detected) trackingLayers.push("Paid Media");
    if (affiliateLayer.detected) trackingLayers.push("Affiliate Network");
    if (amazonLayer.detected) trackingLayers.push("Amazon Tracking Layer");
    if (redirectChain.router_layer.detected) trackingLayers.push("Router Layer");

    // 9) Parameter signals
    const parameterSignals = {
      ...adsLayer.params,
      ...affiliateLayer.params,
      ...amazonLayer.params
    };

    // 10) Participant stack
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
      publisher_group: publisherGroup.group !== "Unknown"
        ? publisherGroup.group
        : "Unknown",
      merchant: merchant.merchant !== "Unknown" ? merchant.merchant : "Not clearly identified",
      retailer_program_hint: retailerProgramHint.likely_program !== "Unknown"
        ? retailerProgramHint.likely_program
        : "No retailer program hint",
      traffic_quality_tier: trafficQuality.tier,
      commercial_intent: commercialIntent.label,
      incrementality_risk: incrementalityRisk.risk_level,
      attribution_conflict: attributionConflict.duplicate_risk_level,
      demand_creator: channelRoles.roles.demand_creator.actor,
      demand_shaper: channelRoles.roles.demand_shaper.actor,
      demand_closer: channelRoles.roles.demand_closer.actor,
      measurement_layer: channelRoles.roles.measurement_layer.actor,
      commission_layer: channelRoles.roles.commission_layer.actor,
      final_destination: redirectChain.final_destination.domain || "Unknown",
      likely_claimer: commissionEngine.primary_claimer
    };

    // 11) Conflict insight
    const conflictInsight = buildConflictInsight({
      adsLayer,
      affiliateLayer,
      amazonLayer,
      commissionEngine,
      redirectChain
    });

    // 12) Summary
    const summary = buildSummary({
      primaryPlatform,
      trafficType,
      adsLayer,
      affiliateLayer,
      amazonLayer,
      publisher,
      merchant,
      retailerProgramHint,
      publisherGroup,
      trafficQuality,
      commercialIntent,
      incrementalityRisk,
      attributionConflict,
      channelRoles,
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
      publisher_group: publisherGroup,
      merchant,
      retailer_program_hint: retailerProgramHint,
      commission_engine: commissionEngine,
      traffic_quality: trafficQuality,
      commercial_intent: commercialIntent,
      incrementality_risk: incrementalityRisk,
      attribution_conflict: attributionConflict,
      channel_roles: channelRoles,
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
      keys: ["irclickid", "ir_partnerid", "ir_adid", "ir_campaignid", "irgwc", "sourceid"]
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
      if (
        rule.name === "Impact" &&
        matched.length === 1 &&
        matched[0] === "sourceid" &&
        !String(queryMap.sourceid || "").toLowerCase().startsWith("imp_")
      ) {
        return;
      }

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

  if (String(queryMap.sourceid || "").toLowerCase().startsWith("imp_")) {
    items.push("Impact");
    params.sourceid = queryMap.sourceid;
  }

  if (hostname.includes("goto.walmart.com")) {
    items.push("Impact");
  }

  if (hostname.includes("bestbuy.7tiv.net")) {
    items.push("Impact");
  }

  if (hostname.includes("howl.me")) {
    items.push("Rakuten");
  }

  if (hostname.includes("click.linksynergy.com")) {
    items.push("Rakuten");
  }

  if (hostname.includes("awin1.com")) {
    items.push("Awin");
  }

  if (hostname.includes("prf.hn")) {
    items.push("Partnerize");
  }

  if (hostname.includes("track.webgains.com")) {
    items.push("Webgains");
  }

  if (hostname.includes("clk.tradedoubler.com")) {
    items.push("TradeDoubler");
  }

  if (hostname.includes("impact.com") || hostname.includes("impactradius.com")) {
    items.push("Impact");
  }

  if (
    hostname.includes("jdoqocy.com") ||
    hostname.includes("tkqlhce.com") ||
    hostname.includes("dpbolvw.net") ||
    hostname.includes("anrdoezrs.net")
  ) {
    items.push("CJ Affiliate");
  }

  if (hostname.includes("geni.us") || hostname.includes("geniuslink.com")) {
    items.push("Geniuslink");
  }

  if (hostname.includes("ebay.com") && (hasParam(queryMap, "mkrid") || hasParam(queryMap, "campid"))) {
    items.push("eBay Partner Network");
  }

  if (lowerUrl.includes("wayward")) items.push("Wayward");
  if (lowerUrl.includes("skimlinks")) items.push("Skimlinks");
  if (lowerUrl.includes("viglink") || lowerUrl.includes("sovrn")) items.push("Sovrn / VigLink");

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
// Amazon layer
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
  let reason = "No clear publisher detected.";

  const finalDomain = String(redirectChain?.final_destination?.domain || "").toLowerCase();
  const nestedUrl = pickNestedDestination(queryMap);
  const nestedDomain = getDomain(nestedUrl);

  const domainsToCheck = [hostname, finalDomain, nestedDomain]
    .filter(Boolean)
    .map((d) => String(d).toLowerCase());

  const publisherRules = [
    { match: ["cnet.com"], publisher: "CNET", type: "Media Publisher", confidence: "High" },
    { match: ["forbes.com"], publisher: "Forbes", type: "Media Publisher", confidence: "High" },
    { match: ["forbesvetted.com"], publisher: "Forbes Vetted", type: "Commerce Publisher", confidence: "High" },
    { match: ["tomsguide.com"], publisher: "Tom's Guide", type: "Media Publisher", confidence: "High" },
    { match: ["techradar.com"], publisher: "TechRadar", type: "Media Publisher", confidence: "High" },
    { match: ["cnn.com", "cnnunderscored.com"], publisher: "CNN Underscored", type: "Commerce Publisher", confidence: "High" },
    { match: ["businessinsider.com", "insider.com"], publisher: "Business Insider", type: "Media Publisher", confidence: "High" },
    { match: ["nypost.com"], publisher: "New York Post", type: "Media Publisher", confidence: "High" },
    { match: ["reviewed.com"], publisher: "Reviewed", type: "Review Publisher", confidence: "High" },
    { match: ["thespruce.com"], publisher: "The Spruce", type: "Media Publisher", confidence: "High" },
    { match: ["people.com"], publisher: "People", type: "Media Publisher", confidence: "High" },
    { match: ["buzzfeed.com"], publisher: "BuzzFeed", type: "Media Publisher", confidence: "High" },
    { match: ["wired.com"], publisher: "WIRED", type: "Media Publisher", confidence: "High" },
    { match: ["engadget.com"], publisher: "Engadget", type: "Media Publisher", confidence: "High" },
    { match: ["zdnet.com"], publisher: "ZDNET", type: "Media Publisher", confidence: "High" },
    { match: ["pcmag.com"], publisher: "PCMag", type: "Review Publisher", confidence: "High" },
    { match: ["theverge.com"], publisher: "The Verge", type: "Media Publisher", confidence: "High" },
    { match: ["wirecutter.com", "nytimes.com"], publisher: "Wirecutter", type: "Commerce Publisher", confidence: "High" },
    { match: ["usatoday.com"], publisher: "USA TODAY", type: "Media Publisher", confidence: "High" },
    { match: ["newsweek.com"], publisher: "Newsweek", type: "Media Publisher", confidence: "High" },
    { match: ["consumerreports.org"], publisher: "Consumer Reports", type: "Review Publisher", confidence: "High" },
    { match: ["goodhousekeeping.com"], publisher: "Good Housekeeping", type: "Media Publisher", confidence: "High" },
    { match: ["menshealth.com"], publisher: "Men's Health", type: "Media Publisher", confidence: "High" },
    { match: ["womenshealthmag.com"], publisher: "Women's Health", type: "Media Publisher", confidence: "High" },
    { match: ["housebeautiful.com"], publisher: "House Beautiful", type: "Media Publisher", confidence: "High" },
    { match: ["marieclaire.com"], publisher: "Marie Claire", type: "Media Publisher", confidence: "High" },
    { match: ["cosmopolitan.com"], publisher: "Cosmopolitan", type: "Media Publisher", confidence: "High" },
    { match: ["esquire.com"], publisher: "Esquire", type: "Media Publisher", confidence: "High" },
    { match: ["travelandleisure.com"], publisher: "Travel + Leisure", type: "Media Publisher", confidence: "High" },
    { match: ["foodandwine.com"], publisher: "Food & Wine", type: "Media Publisher", confidence: "High" },
    { match: ["allrecipes.com"], publisher: "Allrecipes", type: "Media Publisher", confidence: "High" },
    { match: ["bhg.com"], publisher: "Better Homes & Gardens", type: "Media Publisher", confidence: "High" },
    { match: ["parents.com"], publisher: "Parents", type: "Media Publisher", confidence: "High" },
    { match: ["shape.com"], publisher: "Shape", type: "Media Publisher", confidence: "High" },
    { match: ["wellandgood.com"], publisher: "Well+Good", type: "Media Publisher", confidence: "High" },
    { match: ["self.com"], publisher: "SELF", type: "Media Publisher", confidence: "High" },
    { match: ["slickdeals.net"], publisher: "Slickdeals", type: "Deal Site", confidence: "High" },
    { match: ["dealnews.com"], publisher: "DealNews", type: "Deal Site", confidence: "High" },
    { match: ["bradsdeals.com"], publisher: "Brad's Deals", type: "Deal Site", confidence: "High" },
    { match: ["offers.com"], publisher: "Offers.com", type: "Deal Site", confidence: "High" },
    { match: ["couponfollow.com"], publisher: "CouponFollow", type: "Coupon / Deal Site", confidence: "High" },
    { match: ["retailmenot.com"], publisher: "RetailMeNot", type: "Coupon / Deal Site", confidence: "High" },
    { match: ["capitaloneshopping.com"], publisher: "Capital One Shopping", type: "Shopping / Rewards Publisher", confidence: "High" },
    { match: ["rakuten.com"], publisher: "Rakuten", type: "Cashback / Rewards Publisher", confidence: "High" },
    { match: ["topcashback.com"], publisher: "TopCashback", type: "Cashback / Rewards Publisher", confidence: "High" },
    { match: ["couponcabin.com"], publisher: "CouponCabin", type: "Cashback / Coupon Publisher", confidence: "High" },
    { match: ["hip2save.com"], publisher: "Hip2Save", type: "Deal Site", confidence: "High" },
    { match: ["thekrazycouponlady.com"], publisher: "The Krazy Coupon Lady", type: "Deal Site", confidence: "High" },
    { match: ["mattressnerd.com"], publisher: "Mattress Nerd", type: "Review Publisher", confidence: "High" },
    { match: ["sleepfoundation.org"], publisher: "Sleep Foundation", type: "Review Publisher", confidence: "High" },
    { match: ["sleepopolis.com"], publisher: "Sleepopolis", type: "Review Publisher", confidence: "High" },
    { match: ["naplab.com"], publisher: "NapLab", type: "Review Publisher", confidence: "High" },
    { match: ["tuck.com"], publisher: "Tuck", type: "Review Publisher", confidence: "Medium" },
    { match: ["thesleepjudge.com"], publisher: "The Sleep Judge", type: "Review Publisher", confidence: "High" },
    { match: ["mattressclarity.com"], publisher: "Mattress Clarity", type: "Review Publisher", confidence: "High" },
    { match: ["eachnight.com"], publisher: "Eachnight", type: "Review Publisher", confidence: "High" },
    { match: ["sleepadvisor.org"], publisher: "Sleep Advisor", type: "Review Publisher", confidence: "High" },
    { match: ["apartmenttherapy.com"], publisher: "Apartment Therapy", type: "Media Publisher", confidence: "High" },
    { match: ["futureplc.com"], publisher: "Future Publishing", type: "Publisher Group", confidence: "Medium" },
    { match: ["future.net"], publisher: "Future Publishing", type: "Publisher Group", confidence: "Medium" },
    { match: ["future.com"], publisher: "Future Publishing", type: "Publisher Group", confidence: "Medium" }
  ];

  for (const domain of domainsToCheck) {
    const matched = publisherRules.find((rule) =>
      rule.match.some((m) => domain.includes(m))
    );

    if (matched) {
      publisher = matched.publisher;
      type = matched.type;
      confidence = matched.confidence;
      reason = `Matched publisher domain pattern: ${domain}`;
      break;
    }
  }

  if (hasParam(queryMap, "utm_source")) {
    const source = String(queryMap.utm_source || "").trim();
    if (source) {
      subSite = source;

      if (publisher === "Unknown") {
        publisher = source;
        type = "Traffic Source / Publisher";
        confidence = "Medium";
        reason = "Used utm_source as publisher fallback.";
      }
    }
  }

  if (publisher === "Unknown" && hasParam(queryMap, "subId1")) {
    const subId1 = String(queryMap.subId1 || "").trim();
    if (subId1) {
      subSite = subId1;
      const normalizedSubId = subId1.toLowerCase();

      if (normalizedSubId.includes("slickdeals")) {
        publisher = "Slickdeals";
        type = "Deal Site";
        confidence = "Medium";
        reason = "Detected publisher hint from subId1.";
      } else if (normalizedSubId.includes("cnet")) {
        publisher = "CNET";
        type = "Media Publisher";
        confidence = "Medium";
        reason = "Detected publisher hint from subId1.";
      } else if (normalizedSubId.includes("future")) {
        publisher = "Future Publishing";
        type = "Media Publisher";
        confidence = "Medium";
        reason = "Detected publisher hint from subId1.";
      } else if (normalizedSubId.includes("cnn")) {
        publisher = "CNN Underscored";
        type = "Commerce Publisher";
        confidence = "Medium";
        reason = "Detected publisher hint from subId1.";
      }
    }
  }

  if (publisher === "Unknown" && redirectChain.router_layer.items.includes("Skimlinks")) {
    publisher = "Skimlinks";
    type = "Sub-affiliate / Link Router";
    confidence = "Medium";
    reason = "Publisher inferred from router layer: Skimlinks.";
  }

  if (publisher === "Unknown" && redirectChain.router_layer.items.includes("Geniuslink")) {
    publisher = "Geniuslink";
    type = "Link Router";
    confidence = "Medium";
    reason = "Publisher inferred from router layer: Geniuslink.";
  }

  return {
    publisher,
    sub_site: subSite,
    type,
    confidence,
    reason,
    checked_domains: domainsToCheck
  };
}

// --------------------------------------------------
// Merchant / Retailer hint / Publisher group
// --------------------------------------------------

function detectMerchant(hostname, queryMap, redirectChain) {
  const finalDomain = String(redirectChain?.final_destination?.domain || "").toLowerCase();
  const entryDomain = String(hostname || "").toLowerCase();
  const nestedUrl = pickNestedDestination(queryMap);
  const nestedDomain = getDomain(nestedUrl);

  let merchant = "Unknown";
  let confidence = "Low";
  let reason = "No clear merchant domain detected.";

  const rules = [
    { match: ["walmart.com", "goto.walmart.com"], merchant: "Walmart" },
    { match: ["target.com"], merchant: "Target" },
    { match: ["bestbuy.com", "bestbuy.7tiv.net"], merchant: "Best Buy" },
    { match: ["macys.com"], merchant: "Macy's" },
    { match: ["nordstrom.com"], merchant: "Nordstrom" },
    { match: ["sephora.com"], merchant: "Sephora" },
    { match: ["ulta.com"], merchant: "Ulta Beauty" },
    { match: ["homedepot.com"], merchant: "Home Depot" },
    { match: ["lowes.com"], merchant: "Lowe's" },
    { match: ["kohls.com"], merchant: "Kohl's" },
    { match: ["wayfair.com"], merchant: "Wayfair" },
    { match: ["overstock.com"], merchant: "Overstock" },
    { match: ["bedbathandbeyond.com"], merchant: "Bed Bath & Beyond" },
    { match: ["saksfifthavenue.com"], merchant: "Saks Fifth Avenue" },
    { match: ["neimanmarcus.com"], merchant: "Neiman Marcus" },
    { match: ["bloomingdales.com"], merchant: "Bloomingdale's" },
    { match: ["adidas.com"], merchant: "Adidas" },
    { match: ["nike.com"], merchant: "Nike" },
    { match: ["lululemon.com"], merchant: "Lululemon" },
    { match: ["apple.com"], merchant: "Apple" },
    { match: ["dell.com"], merchant: "Dell" },
    { match: ["lenovo.com"], merchant: "Lenovo" },
    { match: ["hp.com"], merchant: "HP" },
    { match: ["samsung.com"], merchant: "Samsung" },
    { match: ["ebay.com"], merchant: "eBay" },
    { match: ["amazon.com", "amazon.ca", "amazon.co.uk", "amazon.de", "amazon.fr", "amazon.it", "amazon.es"], merchant: "Amazon" }
  ];

  const domainsToCheck = [finalDomain, entryDomain, nestedDomain].filter(Boolean);

  for (const domain of domainsToCheck) {
    const matched = rules.find((rule) => rule.match.some((d) => domain.includes(d)));
    if (matched) {
      merchant = matched.merchant;
      confidence = "High";
      reason = `Matched merchant domain pattern: ${domain}`;
      break;
    }
  }

  return {
    merchant,
    confidence,
    reason,
    matched_domains: domainsToCheck
  };
}

function detectRetailerProgramHint(hostname, queryMap, redirectChain, affiliateLayer, merchant) {
  const entryDomain = String(hostname || "").toLowerCase();
  const finalDomain = String(redirectChain?.final_destination?.domain || "").toLowerCase();
  const nestedUrl = pickNestedDestination(queryMap);
  const nestedDomain = getDomain(nestedUrl);

  const allDomains = [entryDomain, finalDomain, nestedDomain].filter(Boolean);

  let likelyProgram = "Unknown";
  let confidence = "Low";
  let reason = "No retailer program hint detected.";

  const hasImpact = affiliateLayer.items.includes("Impact");
  const hasRakuten = affiliateLayer.items.includes("Rakuten");
  const hasCJ = affiliateLayer.items.includes("CJ Affiliate");
  const hasAwin = affiliateLayer.items.includes("Awin");
  const hasPartnerize = affiliateLayer.items.includes("Partnerize");

  const hints = [
    { merchant: "Walmart", networks: ["Impact"], match: ["walmart.com", "goto.walmart.com"] },
    { merchant: "Target", networks: ["Impact"], match: ["target.com"] },
    { merchant: "Best Buy", networks: ["Impact"], match: ["bestbuy.com", "bestbuy.7tiv.net"] },
    { merchant: "Macy's", networks: ["Rakuten"], match: ["macys.com"] },
    { merchant: "Nordstrom", networks: ["Rakuten"], match: ["nordstrom.com"] },
    { merchant: "Sephora", networks: ["Rakuten"], match: ["sephora.com"] },
    { merchant: "Ulta Beauty", networks: ["Rakuten", "Impact"], match: ["ulta.com"] },
    { merchant: "Home Depot", networks: ["Impact", "CJ Affiliate"], match: ["homedepot.com"] },
    { merchant: "Lowe's", networks: ["Impact", "CJ Affiliate"], match: ["lowes.com"] },
    { merchant: "Kohl's", networks: ["Rakuten"], match: ["kohls.com"] }
  ];

  const matchedHint = hints.find((hint) =>
    allDomains.some((domain) => hint.match.some((m) => domain.includes(m)))
  );

  if (matchedHint) {
    likelyProgram = matchedHint.networks.join(" / ");
    confidence = "Medium";
    reason = `Matched retailer program hint for ${matchedHint.merchant}.`;

    if (
      (matchedHint.networks.includes("Impact") && hasImpact) ||
      (matchedHint.networks.includes("Rakuten") && hasRakuten) ||
      (matchedHint.networks.includes("CJ Affiliate") && hasCJ) ||
      (matchedHint.networks.includes("Awin") && hasAwin) ||
      (matchedHint.networks.includes("Partnerize") && hasPartnerize)
    ) {
      confidence = "High";
      reason = `Retailer program hint aligns with detected affiliate network for ${matchedHint.merchant}.`;
    }
  }

  return {
    merchant: merchant?.merchant || "Unknown",
    likely_program: likelyProgram,
    confidence,
    reason
  };
}

function detectPublisherGroup(publisher) {
  if (!publisher || publisher === "Unknown") {
    return {
      group: "Unknown",
      confidence: "Low",
      reason: "No publisher detected, cannot map group."
    };
  }

  const name = String(publisher).toLowerCase();

  const groupRules = [
    {
      group: "Future Publishing",
      match: [
        "tom's guide",
        "techradar",
        "t3",
        "gamesradar",
        "marie claire",
        "homes & gardens",
        "laptop mag",
        "android central",
        "windows central"
      ]
    },
    {
      group: "New York Times",
      match: ["wirecutter", "new york times"]
    },
    {
      group: "CNN / Warner Bros. Discovery",
      match: ["cnn underscored", "cnn"]
    },
    {
      group: "Forbes Media",
      match: ["forbes", "forbes vetted"]
    },
    {
      group: "Red Ventures",
      match: ["cnet", "zdnet", "healthline", "bankrate"]
    },
    {
      group: "Dotdash Meredith",
      match: ["people", "verywell", "the spruce", "allrecipes", "food & wine", "better homes & gardens", "bhg"]
    },
    {
      group: "Hearst",
      match: ["cosmopolitan", "esquire", "good housekeeping", "house beautiful", "men's health", "women's health"]
    },
    {
      group: "Vox Media",
      match: ["the verge", "vox"]
    },
    {
      group: "Condé Nast",
      match: ["wired", "gq", "vogue"]
    },
    {
      group: "Ziff Davis",
      match: ["pcmag", "ign", "speedtest"]
    },
    {
      group: "Business Insider Inc.",
      match: ["business insider", "insider"]
    },
    {
      group: "News Corp",
      match: ["new york post", "nypost"]
    },
    {
      group: "BuzzFeed Inc.",
      match: ["buzzfeed"]
    },
    {
      group: "Consumer Reports",
      match: ["consumer reports"]
    }
  ];

  const matched = groupRules.find((rule) =>
    rule.match.some((m) => name.includes(m))
  );

  if (matched) {
    return {
      group: matched.group,
      confidence: "High",
      reason: `Mapped publisher to media group: ${matched.group}`
    };
  }

  return {
    group: "Independent / Unknown Group",
    confidence: "Low",
    reason: "Publisher not mapped to known media group."
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

  const activeLayerCount = [hasAds, hasAffiliate, amazonLayer.detected, hasRouter].filter(Boolean).length;

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
// Traffic Quality Engine v1
// --------------------------------------------------

function evaluateTrafficQuality({
  publisher,
  publisherGroup,
  affiliateLayer,
  merchant,
  retailerProgramHint,
  trafficType,
  adsLayer,
  amazonLayer,
  redirectChain
}) {
  let score = 50;
  const signals = [];
  const reasons = [];

  const publisherName = String(publisher?.publisher || "Unknown");
  const publisherType = String(publisher?.type || "Unknown");
  const groupName = String(publisherGroup?.group || "Unknown");
  const merchantName = String(merchant?.merchant || "Unknown");

  const affiliateItems = affiliateLayer?.items || [];
  const hasImpact = affiliateItems.includes("Impact");
  const hasRakuten = affiliateItems.includes("Rakuten");
  const hasCJ = affiliateItems.includes("CJ Affiliate");
  const hasAwin = affiliateItems.includes("Awin");
  const hasSkimlinks = affiliateItems.includes("Skimlinks");
  const hasSovrn = affiliateItems.includes("Sovrn / VigLink");
  const hasGeniuslink = affiliateItems.includes("Geniuslink");

  const hasAmazonAttribution = amazonLayer?.classification === "Amazon Attribution";
  const hasAmazonACC = amazonLayer?.classification === "Amazon Creator Connections";
  const hasAmazonASS = amazonLayer?.classification === "Amazon Associates";

  const isDealSite =
    publisherType.includes("Deal") ||
    publisherType.includes("Coupon");

  const isCashbackSite =
    publisherType.includes("Cashback") ||
    publisherType.includes("Rewards");

  const isCommercePublisher =
    publisherType.includes("Commerce") ||
    publisherType.includes("Review") ||
    publisherType.includes("Media");

  const isUnknownPublisher = publisherName === "Unknown";
  const isMixedTraffic = String(trafficType || "").toLowerCase().includes("mixed");
  const isPaidTraffic = String(trafficType || "").toLowerCase().includes("paid");
  const hasRouter = !!redirectChain?.router_layer?.detected;

  const topTierGroups = [
    "New York Times",
    "Future Publishing",
    "CNN / Warner Bros. Discovery",
    "Forbes Media"
  ];

  const strongCommercialGroups = [
    "Red Ventures",
    "Dotdash Meredith",
    "Hearst",
    "Vox Media",
    "Condé Nast",
    "Ziff Davis",
    "Business Insider Inc."
  ];

  if (topTierGroups.includes(groupName)) {
    score += 22;
    signals.push(`Top-tier media group: ${groupName}`);
    reasons.push(`${groupName} is generally associated with stronger editorial trust and higher-intent commerce traffic.`);
  } else if (strongCommercialGroups.includes(groupName)) {
    score += 16;
    signals.push(`Strong media group: ${groupName}`);
    reasons.push(`${groupName} is a strong commercial publisher ecosystem with meaningful affiliate and commerce influence.`);
  } else if (groupName === "Consumer Reports") {
    score += 20;
    signals.push(`High-trust review group: ${groupName}`);
    reasons.push(`Consumer Reports implies high trust and strong evaluation-driven intent.`);
  }

  if (publisherType === "Review Publisher") {
    score += 14;
    signals.push("Review publisher");
    reasons.push(`Review publishers usually drive higher-intent comparison traffic.`);
  } else if (publisherType === "Commerce Publisher") {
    score += 12;
    signals.push("Commerce publisher");
    reasons.push(`Commerce publishers often sit close to purchase intent.`);
  } else if (publisherType === "Media Publisher") {
    score += 8;
    signals.push("Media publisher");
    reasons.push(`Editorial media traffic tends to have stronger trust than generic affiliate traffic.`);
  } else if (publisherType === "Deal Site") {
    score -= 4;
    signals.push("Deal site");
    reasons.push(`Deal traffic can convert well, but it is usually more price-sensitive and less brand-loyal.`);
  } else if (publisherType === "Coupon / Deal Site") {
    score -= 8;
    signals.push("Coupon / deal site");
    reasons.push(`Coupon traffic is often lower-quality from a brand perspective and highly discount-driven.`);
  } else if (publisherType === "Cashback / Rewards Publisher") {
    score -= 10;
    signals.push("Cashback / rewards publisher");
    reasons.push(`Cashback traffic often appears late in the funnel and may have weaker incremental value.`);
  } else if (publisherType === "Cashback / Coupon Publisher") {
    score -= 12;
    signals.push("Cashback / coupon publisher");
    reasons.push(`This traffic is usually highly incentive-led and often weaker on incrementality.`);
  }

  const elitePublishers = [
    "Wirecutter",
    "Tom's Guide",
    "TechRadar",
    "CNET",
    "CNN Underscored",
    "Forbes",
    "Forbes Vetted",
    "Business Insider",
    "Consumer Reports"
  ];

  const strongNichePublishers = [
    "Mattress Nerd",
    "Sleep Foundation",
    "Sleepopolis",
    "NapLab",
    "Mattress Clarity",
    "Sleep Advisor",
    "Reviewed"
  ];

  if (elitePublishers.includes(publisherName)) {
    score += 10;
    signals.push(`Elite publisher: ${publisherName}`);
    reasons.push(`${publisherName} is a strong commerce/editorial publisher with recognizable consumer trust.`);
  } else if (strongNichePublishers.includes(publisherName)) {
    score += 8;
    signals.push(`Strong niche publisher: ${publisherName}`);
    reasons.push(`${publisherName} is a strong vertical publisher with category-level purchase intent.`);
  }

  if (hasImpact) {
    score += 4;
    signals.push("Impact network");
    reasons.push(`Impact is common among higher-quality direct affiliate programs and larger brand partnerships.`);
  }

  if (hasRakuten) {
    score += 4;
    signals.push("Rakuten network");
    reasons.push(`Rakuten is common in established retail affiliate programs and stronger publisher relationships.`);
  }

  if (hasCJ) {
    score += 4;
    signals.push("CJ Affiliate network");
    reasons.push(`CJ is common among large retailer affiliate programs and mature affiliate ecosystems.`);
  }

  if (hasAwin) {
    score += 3;
    signals.push("Awin network");
    reasons.push(`Awin is a mature affiliate network with many quality commerce publishers.`);
  }

  if (hasSkimlinks || hasSovrn) {
    score -= 3;
    signals.push("Aggregator / sub-affiliate router");
    reasons.push(`Skimlinks/Sovrn-style layers can reduce transparency and often indicate more indirect publisher attribution.`);
  }

  if (hasGeniuslink) {
    score -= 1;
    signals.push("Router layer: Geniuslink");
    reasons.push(`Geniuslink adds routing utility, but does not itself improve traffic quality.`);
  }

  if (isCommercePublisher && !isDealSite && !isCashbackSite) {
    score += 6;
    signals.push("Editorial / comparison intent");
    reasons.push(`The traffic looks more comparison-led than purely discount-led.`);
  }

  if (isDealSite) score -= 3;
  if (isCashbackSite) score -= 6;

  if (isMixedTraffic) {
    score -= 2;
    signals.push("Mixed attribution path");
    reasons.push(`Mixed attribution paths can indicate overlap and weaker clarity on true source quality.`);
  }

  if (isPaidTraffic && !isCommercePublisher) {
    score -= 4;
    signals.push("Paid-led signal");
    reasons.push(`Paid-led traffic without strong editorial context may be less trustworthy or less incremental.`);
  }

  if (hasRouter) {
    score -= 2;
    signals.push("Router present");
    reasons.push(`Router layers add indirection and can reduce transparency of the original source.`);
  }

  if (hasAmazonAttribution) {
    score += 2;
    signals.push("Amazon Attribution");
    reasons.push(`Amazon Attribution implies structured measurement, though not necessarily higher source quality by itself.`);
  }

  if (hasAmazonACC) {
    score += 4;
    signals.push("Amazon Creator Connections");
    reasons.push(`ACC often indicates creator-led recommendation traffic, which can be more discovery-driven.`);
  }

  if (hasAmazonASS && isUnknownPublisher) {
    score -= 4;
    signals.push("Generic Amazon Associates");
    reasons.push(`Generic Amazon Associates without a clear publisher usually gives weaker source-quality signals.`);
  }

  const strongRetailMerchants = [
    "Amazon",
    "Walmart",
    "Target",
    "Best Buy",
    "Sephora",
    "Ulta Beauty",
    "Home Depot",
    "Lowe's",
    "Macy's",
    "Nordstrom"
  ];

  if (strongRetailMerchants.includes(merchantName) && retailerProgramHint?.confidence === "High") {
    score += 3;
    signals.push(`Strong retailer-program alignment: ${merchantName}`);
    reasons.push(`The merchant and affiliate setup align with a known retail affiliate structure.`);
  }

  if (isUnknownPublisher) {
    score -= 10;
    signals.push("Unknown publisher");
    reasons.push(`Unknown publisher identity lowers confidence in traffic quality assessment.`);
  }

  if (
    (isUnknownPublisher && !groupName) ||
    groupName === "Unknown" ||
    groupName === "Independent / Unknown Group"
  ) {
    score -= 4;
    signals.push("Unknown media group");
    reasons.push(`No known publisher-group mapping reduces trust and comparability.`);
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  let tier = "Tier 4";
  let label = "Low-quality / unclear traffic";

  if (score >= 85) {
    tier = "Tier 1";
    label = "Premium editorial / high-intent traffic";
  } else if (score >= 70) {
    tier = "Tier 2";
    label = "Strong commercial traffic";
  } else if (score >= 50) {
    tier = "Tier 3";
    label = "Mixed-value affiliate traffic";
  }

  let incrementality = "Medium";

  if (tier === "Tier 1" && !isDealSite && !isCashbackSite) {
    incrementality = "High";
  } else if (isCashbackSite || publisherType.includes("Coupon")) {
    incrementality = "Low";
  }

  return {
    score,
    tier,
    label,
    incrementality,
    reason: reasons.join(" "),
    signals: unique(signals)
  };
}

// --------------------------------------------------
// Commercial Intent Model v1
// --------------------------------------------------

function evaluateCommercialIntent({
  publisher,
  publisherGroup,
  affiliateLayer,
  merchant,
  retailerProgramHint,
  trafficType,
  adsLayer,
  amazonLayer,
  redirectChain,
  queryMap
}) {
  const signals = [];
  const reasons = [];

  const publisherName = String(publisher?.publisher || "Unknown");
  const publisherType = String(publisher?.type || "Unknown");
  const groupName = String(publisherGroup?.group || "Unknown");
  const merchantName = String(merchant?.merchant || "Unknown");

  const affiliateItems = affiliateLayer?.items || [];
  const hasImpact = affiliateItems.includes("Impact");
  const hasRakuten = affiliateItems.includes("Rakuten");
  const hasCJ = affiliateItems.includes("CJ Affiliate");
  const hasAwin = affiliateItems.includes("Awin");
  const hasSkimlinks = affiliateItems.includes("Skimlinks");
  const hasSovrn = affiliateItems.includes("Sovrn / VigLink");
  const hasGeniuslink = affiliateItems.includes("Geniuslink");

  const amazonClassification = String(amazonLayer?.classification || "Unknown");
  const hasAmazonAttribution = amazonClassification === "Amazon Attribution";
  const hasAmazonACC = amazonClassification === "Amazon Creator Connections";
  const hasAmazonASS = amazonClassification === "Amazon Associates";

  const isDealSite =
    publisherType.includes("Deal") ||
    publisherType.includes("Coupon");

  const isCashbackSite =
    publisherType.includes("Cashback") ||
    publisherType.includes("Rewards");

  const isReviewPublisher =
    publisherType === "Review Publisher";

  const isCommercePublisher =
    publisherType === "Commerce Publisher" ||
    publisherType === "Media Publisher" ||
    publisherType === "Review Publisher";

  const hasAds = !!adsLayer?.detected;
  const hasRouter = !!redirectChain?.router_layer?.detected;
  const finalIsAmazon = !!redirectChain?.final_destination?.is_amazon;

  const subSite = String(publisher?.sub_site || "").toLowerCase();
  const utmSource = String(queryMap?.utm_source || "").toLowerCase();
  const subId1 = String(queryMap?.subId1 || "").toLowerCase();
  const veh = String(queryMap?.veh || "").toLowerCase();

  const scoreMap = {
    research_intent: 0,
    deal_intent: 0,
    cashback_intent: 0,
    creator_intent: 0,
    paid_intent: 0
  };

  function addScore(bucket, points, signal, reason) {
    scoreMap[bucket] += points;
    if (signal) signals.push(signal);
    if (reason) reasons.push(reason);
  }

  if (isReviewPublisher) {
    addScore(
      "research_intent",
      28,
      "Review publisher",
      "Review publishers usually indicate comparison-led, research-heavy purchase behavior."
    );
  }

  if (publisherType === "Commerce Publisher") {
    addScore(
      "research_intent",
      20,
      "Commerce publisher",
      "Commerce publishers often sit close to evaluation and purchase consideration."
    );
  }

  if (publisherType === "Media Publisher") {
    addScore(
      "research_intent",
      12,
      "Media publisher",
      "Editorial media often reflects upper- or mid-funnel research intent."
    );
  }

  if (isDealSite) {
    addScore(
      "deal_intent",
      30,
      "Deal / coupon site",
      "Deal and coupon environments strongly suggest discount-seeking behavior."
    );
  }

  if (isCashbackSite) {
    addScore(
      "cashback_intent",
      36,
      "Cashback / rewards publisher",
      "Cashback and rewards publishers strongly indicate incentive-led checkout behavior."
    );
  }

  const strongResearchPublishers = [
    "Wirecutter",
    "Tom's Guide",
    "TechRadar",
    "CNET",
    "CNN Underscored",
    "Forbes",
    "Forbes Vetted",
    "Business Insider",
    "Consumer Reports",
    "Mattress Nerd",
    "Sleep Foundation",
    "Sleepopolis",
    "NapLab",
    "Mattress Clarity",
    "Sleep Advisor",
    "Reviewed"
  ];

  const strongDealPublishers = [
    "Slickdeals",
    "DealNews",
    "Brad's Deals",
    "Hip2Save",
    "The Krazy Coupon Lady",
    "RetailMeNot",
    "CouponFollow"
  ];

  const strongCashbackPublishers = [
    "Rakuten",
    "TopCashback",
    "CouponCabin",
    "Capital One Shopping"
  ];

  if (strongResearchPublishers.includes(publisherName)) {
    addScore(
      "research_intent",
      18,
      `Research-oriented publisher: ${publisherName}`,
      `${publisherName} usually captures users comparing products before purchase.`
    );
  }

  if (strongDealPublishers.includes(publisherName)) {
    addScore(
      "deal_intent",
      18,
      `Deal-oriented publisher: ${publisherName}`,
      `${publisherName} usually attracts users actively looking for discounts and promotions.`
    );
  }

  if (strongCashbackPublishers.includes(publisherName)) {
    addScore(
      "cashback_intent",
      18,
      `Cashback-oriented publisher: ${publisherName}`,
      `${publisherName} usually attracts users optimizing savings at or near checkout.`
    );
  }

  const researchHeavyGroups = [
    "New York Times",
    "Future Publishing",
    "CNN / Warner Bros. Discovery",
    "Forbes Media",
    "Red Ventures",
    "Dotdash Meredith",
    "Hearst",
    "Vox Media",
    "Condé Nast",
    "Ziff Davis",
    "Business Insider Inc.",
    "Consumer Reports"
  ];

  if (researchHeavyGroups.includes(groupName)) {
    addScore(
      "research_intent",
      10,
      `Research-heavy media group: ${groupName}`,
      `${groupName} tends to generate editorial and evaluation-driven commerce traffic.`
    );
  }

  if (hasImpact || hasRakuten || hasCJ || hasAwin) {
    addScore(
      "research_intent",
      4,
      "Established affiliate network",
      "Established retailer affiliate networks often support editorial and commerce-driven traffic."
    );
  }

  if (hasSkimlinks || hasSovrn) {
    addScore(
      "research_intent",
      2,
      "Sub-affiliate router",
      "Skimlinks/Sovrn often sit behind editorial commerce traffic, though with less transparency."
    );
  }

  if (hasGeniuslink) {
    addScore(
      "creator_intent",
      6,
      "Geniuslink router",
      "Geniuslink is commonly used in creator, influencer, and cross-platform outbound commerce flows."
    );
  }

  if (hasAmazonACC) {
    addScore(
      "creator_intent",
      30,
      "Amazon Creator Connections",
      "ACC strongly suggests creator-led recommendation traffic."
    );
  }

  if (hasAmazonASS && finalIsAmazon) {
    addScore(
      "research_intent",
      6,
      "Amazon Associates",
      "Amazon Associates often appears in editorial, niche review, and creator recommendation traffic."
    );
  }

  if (hasAmazonAttribution) {
    addScore(
      "paid_intent",
      16,
      "Amazon Attribution",
      "Amazon Attribution often reflects paid or structured off-Amazon campaign traffic."
    );
  }

  if (hasAds) {
    addScore(
      "paid_intent",
      32,
      "Paid media click IDs detected",
      "Paid media identifiers strongly suggest ad-driven traffic."
    );
  }

  if (String(trafficType || "").toLowerCase().includes("paid")) {
    addScore(
      "paid_intent",
      10,
      "Traffic type includes paid media",
      "Traffic classification itself suggests ad-driven acquisition."
    );
  }

  if (veh === "aff") {
    addScore(
      "deal_intent",
      4,
      "veh=aff",
      "Affiliate-marked retail paths often indicate transactional commerce traffic."
    );
  }

  if (utmSource.includes("coupon") || subSite.includes("coupon") || subId1.includes("coupon")) {
    addScore(
      "deal_intent",
      14,
      "Coupon-related source signal",
      "Source parameters suggest coupon-seeking behavior."
    );
  }

  if (utmSource.includes("deal") || subSite.includes("deal") || subId1.includes("deal")) {
    addScore(
      "deal_intent",
      12,
      "Deal-related source signal",
      "Source parameters suggest deal-driven traffic."
    );
  }

  if (utmSource.includes("cashback") || subSite.includes("cashback") || subId1.includes("cashback")) {
    addScore(
      "cashback_intent",
      14,
      "Cashback-related source signal",
      "Source parameters suggest cashback-led purchase behavior."
    );
  }

  if (
    utmSource.includes("creator") ||
    utmSource.includes("influencer") ||
    subSite.includes("creator") ||
    subSite.includes("influencer") ||
    subId1.includes("creator") ||
    subId1.includes("influencer")
  ) {
    addScore(
      "creator_intent",
      14,
      "Creator / influencer source signal",
      "Source parameters suggest creator-led discovery or recommendation traffic."
    );
  }

  if (
    utmSource.includes("google") ||
    utmSource.includes("meta") ||
    utmSource.includes("facebook") ||
    utmSource.includes("tiktok")
  ) {
    addScore(
      "paid_intent",
      10,
      "Paid-source naming pattern",
      "Source naming suggests campaign or paid-channel traffic."
    );
  }

  const highConsiderationMerchants = [
    "Amazon",
    "Best Buy",
    "Home Depot",
    "Lowe's",
    "Target",
    "Walmart"
  ];

  const beautyDealSensitiveMerchants = [
    "Sephora",
    "Ulta Beauty",
    "Macy's",
    "Nordstrom"
  ];

  if (highConsiderationMerchants.includes(merchantName) && isCommercePublisher) {
    addScore(
      "research_intent",
      4,
      `High-consideration merchant: ${merchantName}`,
      `${merchantName} often receives comparison-led and evaluation-led traffic in commerce content.`
    );
  }

  if (beautyDealSensitiveMerchants.includes(merchantName) && (isDealSite || isCashbackSite)) {
    addScore(
      "deal_intent",
      4,
      `Promotion-sensitive merchant: ${merchantName}`,
      `${merchantName} traffic from deal/coupon environments often reflects offer-driven intent.`
    );
  }

  if (hasRouter && !isCommercePublisher && publisherName === "Unknown") {
    addScore(
      "paid_intent",
      2,
      "Unknown source behind router",
      "Router presence without a known publisher can indicate opaque or non-editorial acquisition."
    );
    addScore(
      "deal_intent",
      2,
      "Opaque routed commerce path",
      "Some routed commerce traffic tends to be transactional rather than deeply research-led."
    );
  }

  const ranked = Object.entries(scoreMap)
    .sort((a, b) => b[1] - a[1]);

  const primary_intent = ranked[0][0];
  const primary_score_raw = ranked[0][1];
  const secondary_intent = ranked[1][0];
  const secondary_score = ranked[1][1];

  let confidenceScore = primary_score_raw;
  if (confidenceScore > 100) confidenceScore = 100;
  if (confidenceScore < 0) confidenceScore = 0;

  let confidence = "Low";
  if (confidenceScore >= 55) confidence = "High";
  else if (confidenceScore >= 30) confidence = "Medium";

  let label = "Unclear / mixed purchase intent";

  const labels = {
    research_intent: "Research-led / comparison intent",
    deal_intent: "Deal-seeking / promotion intent",
    cashback_intent: "Cashback / incentive intent",
    creator_intent: "Creator-led / recommendation intent",
    paid_intent: "Paid acquisition / campaign intent"
  };

  if (labels[primary_intent]) {
    label = labels[primary_intent];
  }

  let funnel_stage = "Mid funnel";
  if (primary_intent === "research_intent") funnel_stage = "Upper-mid funnel";
  if (primary_intent === "creator_intent") funnel_stage = "Upper-mid funnel";
  if (primary_intent === "deal_intent") funnel_stage = "Lower funnel";
  if (primary_intent === "cashback_intent") funnel_stage = "Bottom funnel";
  if (primary_intent === "paid_intent") funnel_stage = hasAds ? "Variable / campaign-driven" : "Mid funnel";

  return {
    primary_intent,
    primary_score: confidenceScore,
    secondary_intent,
    secondary_score,
    confidence,
    label,
    funnel_stage,
    intent_distribution: scoreMap,
    reason: reasons.join(" "),
    signals: unique(signals)
  };
}

// --------------------------------------------------
// Incrementality Risk Model v1
// --------------------------------------------------

function evaluateIncrementalityRisk({
  publisher,
  publisherGroup,
  affiliateLayer,
  merchant,
  retailerProgramHint,
  trafficType,
  adsLayer,
  amazonLayer,
  redirectChain,
  trafficQuality,
  commercialIntent,
  queryMap
}) {
  let riskScore = 50;
  const signals = [];
  const reasons = [];

  const publisherName = String(publisher?.publisher || "Unknown");
  const publisherType = String(publisher?.type || "Unknown");
  const groupName = String(publisherGroup?.group || "Unknown");
  const merchantName = String(merchant?.merchant || "Unknown");

  const affiliateItems = affiliateLayer?.items || [];
  const hasImpact = affiliateItems.includes("Impact");
  const hasRakuten = affiliateItems.includes("Rakuten");
  const hasCJ = affiliateItems.includes("CJ Affiliate");
  const hasAwin = affiliateItems.includes("Awin");
  const hasSkimlinks = affiliateItems.includes("Skimlinks");
  const hasSovrn = affiliateItems.includes("Sovrn / VigLink");
  const hasGeniuslink = affiliateItems.includes("Geniuslink");

  const amazonClassification = String(amazonLayer?.classification || "Unknown");
  const hasAmazonAttribution = amazonClassification === "Amazon Attribution";
  const hasAmazonACC = amazonClassification === "Amazon Creator Connections";
  const hasAmazonASS = amazonClassification === "Amazon Associates";

  const hasAds = !!adsLayer?.detected;
  const hasRouter = !!redirectChain?.router_layer?.detected;
  const isMixedTraffic = String(trafficType || "").toLowerCase().includes("mixed");

  const intent = String(commercialIntent?.primary_intent || "unknown");
  const qualityTier = String(trafficQuality?.tier || "Unknown");
  const qualityScore = Number(trafficQuality?.score || 0);

  const subSite = String(publisher?.sub_site || "").toLowerCase();
  const utmSource = String(queryMap?.utm_source || "").toLowerCase();
  const subId1 = String(queryMap?.subId1 || "").toLowerCase();
  const veh = String(queryMap?.veh || "").toLowerCase();
  const refParam = String(queryMap?.ref_ || "").toLowerCase();

  const isDealSite =
    publisherType.includes("Deal") ||
    publisherType.includes("Coupon");

  const isCashbackSite =
    publisherType.includes("Cashback") ||
    publisherType.includes("Rewards");

  const isReviewPublisher =
    publisherType === "Review Publisher";

  const isCommercePublisher =
    publisherType === "Commerce Publisher" ||
    publisherType === "Media Publisher" ||
    publisherType === "Review Publisher";

  function addRisk(points, signal, reason) {
    riskScore += points;
    if (signal) signals.push(signal);
    if (reason) reasons.push(reason);
  }

  if (intent === "cashback_intent") {
    addRisk(
      24,
      "Cashback intent",
      "Cashback-led traffic is often very late-funnel and more likely to capture existing purchase intent than create new demand."
    );
  }

  if (intent === "deal_intent") {
    addRisk(
      18,
      "Deal intent",
      "Deal-seeking traffic often converts well but may reflect users already close to purchase and simply looking for a better price."
    );
  }

  if (intent === "paid_intent") {
    addRisk(
      10,
      "Paid acquisition intent",
      "Paid traffic can be incremental, but late-funnel or branded paid traffic can also produce attribution overlap."
    );
  }

  if (intent === "creator_intent") {
    addRisk(
      -6,
      "Creator-led intent",
      "Creator-led discovery traffic is often more demand-generating than pure last-click capture."
    );
  }

  if (intent === "research_intent") {
    addRisk(
      -10,
      "Research-led intent",
      "Research and comparison behavior tends to be more incremental than bottom-funnel coupon or cashback behavior."
    );
  }

  if (isCashbackSite) {
    addRisk(
      22,
      "Cashback / rewards publisher",
      "Cashback sites are among the highest-risk publisher types for low incrementality."
    );
  }

  if (isDealSite) {
    addRisk(
      14,
      "Deal / coupon publisher",
      "Deal and coupon publishers commonly appear near checkout or at the final decision stage."
    );
  }

  if (isReviewPublisher) {
    addRisk(
      -8,
      "Review publisher",
      "Review publishers are more likely to influence consideration earlier in the journey."
    );
  } else if (isCommercePublisher && !isDealSite && !isCashbackSite) {
    addRisk(
      -5,
      "Editorial commerce publisher",
      "Editorial commerce traffic is generally more incremental than pure incentive-led traffic."
    );
  }

  const highRiskPublishers = [
    "Rakuten",
    "TopCashback",
    "CouponCabin",
    "Capital One Shopping",
    "RetailMeNot",
    "CouponFollow"
  ];

  const mediumRiskDealPublishers = [
    "Slickdeals",
    "DealNews",
    "Brad's Deals",
    "Hip2Save",
    "The Krazy Coupon Lady"
  ];

  const lowerRiskResearchPublishers = [
    "Wirecutter",
    "Tom's Guide",
    "TechRadar",
    "CNET",
    "CNN Underscored",
    "Forbes",
    "Forbes Vetted",
    "Business Insider",
    "Consumer Reports",
    "Mattress Nerd",
    "Sleep Foundation",
    "Sleepopolis",
    "NapLab",
    "Mattress Clarity",
    "Sleep Advisor",
    "Reviewed"
  ];

  if (highRiskPublishers.includes(publisherName)) {
    addRisk(
      16,
      `High-risk publisher pattern: ${publisherName}`,
      `${publisherName} often captures value late in the funnel and may have weaker incrementality.`
    );
  }

  if (mediumRiskDealPublishers.includes(publisherName)) {
    addRisk(
      8,
      `Deal-oriented publisher: ${publisherName}`,
      `${publisherName} can drive conversion, but often in discount-sensitive, lower-incrementality contexts.`
    );
  }

  if (lowerRiskResearchPublishers.includes(publisherName)) {
    addRisk(
      -10,
      `Research-oriented publisher: ${publisherName}`,
      `${publisherName} typically reflects comparison shopping and earlier consideration-stage influence.`
    );
  }

  const lowerRiskGroups = [
    "New York Times",
    "Future Publishing",
    "CNN / Warner Bros. Discovery",
    "Forbes Media",
    "Red Ventures",
    "Dotdash Meredith",
    "Hearst",
    "Vox Media",
    "Condé Nast",
    "Ziff Davis",
    "Business Insider Inc.",
    "Consumer Reports"
  ];

  if (lowerRiskGroups.includes(groupName) && !isDealSite && !isCashbackSite) {
    addRisk(
      -6,
      `Established media group: ${groupName}`,
      `${groupName} usually signals editorial-led discovery or evaluation rather than pure checkout interception.`
    );
  }

  if (hasSkimlinks || hasSovrn) {
    addRisk(
      4,
      "Sub-affiliate router",
      "Sub-affiliate and router layers can reduce transparency and sometimes indicate indirect or opportunistic attribution paths."
    );
  }

  if (hasGeniuslink && hasAmazonASS) {
    addRisk(
      2,
      "Geniuslink + Amazon Associates",
      "Routing layers plus Associates can be valid, but often indicate more link-optimization than clear incremental demand creation."
    );
  }

  if (hasImpact || hasRakuten || hasCJ || hasAwin) {
    addRisk(
      1,
      "Established affiliate network",
      "Established affiliate networks are neutral by themselves; incrementality depends more on publisher type than network brand."
    );
  }

  if (hasAmazonACC) {
    addRisk(
      -4,
      "Amazon Creator Connections",
      "ACC often reflects creator recommendation and can be more discovery-oriented than generic coupon behavior."
    );
  }

  if (hasAmazonASS && publisherName === "Unknown") {
    addRisk(
      8,
      "Generic Amazon Associates with unknown publisher",
      "Associates traffic without a visible publisher identity is harder to evaluate and often less clearly incremental."
    );
  }

  if (hasAmazonAttribution && hasAds) {
    addRisk(
      6,
      "Amazon Attribution + paid media",
      "Paid-to-Amazon flows can be incremental, but may also overlap with brand search or lower-funnel campaign capture."
    );
  }

  if (isMixedTraffic) {
    addRisk(
      10,
      "Mixed attribution path",
      "Mixed attribution paths increase the chance that multiple systems are claiming the same already-converting user."
    );
  }

  if (hasRouter) {
    addRisk(
      4,
      "Router layer present",
      "Router layers add indirection and can increase uncertainty around the true original source."
    );
  }

  if (hasAds && affiliateLayer?.detected) {
    addRisk(
      10,
      "Paid + affiliate overlap",
      "When paid media and affiliate signals coexist, the affiliate touch may be assisting or intercepting an already-acquired user."
    );
  }

  if (veh === "aff") {
    addRisk(
      2,
      "veh=aff",
      "Affiliate-specific routing is neutral on its own, but often appears in lower-funnel commerce paths."
    );
  }

  if (utmSource.includes("coupon") || subSite.includes("coupon") || subId1.includes("coupon")) {
    addRisk(
      12,
      "Coupon-named source",
      "Coupon-labelled source parameters are a strong sign of discount-led conversion capture."
    );
  }

  if (utmSource.includes("deal") || subSite.includes("deal") || subId1.includes("deal")) {
    addRisk(
      10,
      "Deal-named source",
      "Deal-labelled source parameters suggest users are likely already close to purchase and optimizing price."
    );
  }

  if (utmSource.includes("cashback") || subSite.includes("cashback") || subId1.includes("cashback")) {
    addRisk(
      14,
      "Cashback-named source",
      "Cashback-labelled source parameters strongly suggest late-funnel, incentive-led behavior."
    );
  }

  if (
    utmSource.includes("brand") ||
    subSite.includes("brand") ||
    subId1.includes("brand")
  ) {
    addRisk(
      8,
      "Brand-oriented source naming",
      "Brand-oriented traffic labels can indicate branded search or users who already knew the merchant."
    );
  }

  if (refParam === "aa_maas") {
    addRisk(
      2,
      "ref_=aa_maas",
      "Structured attribution is useful, but does not guarantee high incrementality."
    );
  }

  if (qualityTier === "Tier 1" || qualityScore >= 85) {
    addRisk(
      -12,
      "High traffic quality",
      "High-quality editorial traffic tends to have stronger incremental potential."
    );
  } else if (qualityTier === "Tier 2" || qualityScore >= 70) {
    addRisk(
      -6,
      "Strong traffic quality",
      "Stronger commercial traffic tends to be somewhat more incremental than generic or incentive-led traffic."
    );
  } else if (qualityTier === "Tier 4" || qualityScore < 50) {
    addRisk(
      8,
      "Low / unclear traffic quality",
      "Lower-quality or opaque traffic often has weaker evidence of real demand creation."
    );
  }

  const strongResearchMerchants = [
    "Amazon",
    "Best Buy",
    "Home Depot",
    "Lowe's",
    "Target",
    "Walmart"
  ];

  const promoSensitiveMerchants = [
    "Sephora",
    "Ulta Beauty",
    "Macy's",
    "Nordstrom"
  ];

  if (strongResearchMerchants.includes(merchantName) && isReviewPublisher) {
    addRisk(
      -3,
      `Research-heavy merchant context: ${merchantName}`,
      `${merchantName} often receives meaningful research-led traffic in editorial comparison journeys.`
    );
  }

  if (promoSensitiveMerchants.includes(merchantName) && (isDealSite || isCashbackSite)) {
    addRisk(
      5,
      `Promo-sensitive merchant context: ${merchantName}`,
      `${merchantName} traffic from coupon/cashback environments is more likely to be discount-assisted than fully incremental.`
    );
  }

  if (riskScore > 100) riskScore = 100;
  if (riskScore < 0) riskScore = 0;

  let riskLevel = "Medium";
  let label = "Moderate incrementality risk";

  if (riskScore >= 75) {
    riskLevel = "High";
    label = "High risk of low incrementality / attribution capture";
  } else if (riskScore <= 34) {
    riskLevel = "Low";
    label = "Lower risk / more likely incremental influence";
  }

  let interpretation = "This traffic may contain both genuine influence and some degree of lower-funnel capture.";
  if (riskLevel === "High") {
    interpretation = "This traffic looks more likely to capture existing purchase intent than to create new demand.";
  } else if (riskLevel === "Low") {
    interpretation = "This traffic looks more likely to contribute genuine discovery, evaluation, or demand creation.";
  }

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    label,
    interpretation,
    reason: reasons.join(" "),
    signals: unique(signals)
  };
}

// --------------------------------------------------
// Attribution Conflict Engine v2
// --------------------------------------------------

function evaluateAttributionConflictV2({
  adsLayer,
  affiliateLayer,
  amazonLayer,
  publisher,
  publisherGroup,
  merchant,
  retailerProgramHint,
  trafficType,
  redirectChain,
  commissionEngine,
  trafficQuality,
  commercialIntent,
  incrementalityRisk
}) {
  const signals = [];
  const reasons = [];

  const affiliateItems = affiliateLayer?.items || [];
  const adsItems = adsLayer?.items || [];
  const amazonItems = amazonLayer?.items || [];

  const amazonClassification = String(amazonLayer?.classification || "Unknown");
  const publisherName = String(publisher?.publisher || "Unknown");
  const publisherType = String(publisher?.type || "Unknown");
  const merchantName = String(merchant?.merchant || "Unknown");

  const hasAds = !!adsLayer?.detected;
  const hasAffiliate = !!affiliateLayer?.detected;
  const hasAmazon = !!amazonLayer?.detected;
  const hasRouter = !!redirectChain?.router_layer?.detected;

  const hasAmazonAttribution = amazonClassification === "Amazon Attribution";
  const hasAmazonACC = amazonClassification === "Amazon Creator Connections";
  const hasAmazonASS = amazonClassification === "Amazon Associates";

  const isDealSite =
    publisherType.includes("Deal") ||
    publisherType.includes("Coupon");

  const isCashbackSite =
    publisherType.includes("Cashback") ||
    publisherType.includes("Rewards");

  const isReviewPublisher = publisherType === "Review Publisher";
  const isCommercePublisher =
    publisherType === "Commerce Publisher" ||
    publisherType === "Media Publisher" ||
    publisherType === "Review Publisher";

  const commercialPrimary = String(commercialIntent?.primary_intent || "unknown");
  const incrementalityLevel = String(incrementalityRisk?.risk_level || "Medium");
  const qualityTier = String(trafficQuality?.tier || "Unknown");

  const conflictActors = [];
  const paths = [];

  function pushUnique(arr, value) {
    if (value && !arr.includes(value)) arr.push(value);
  }

  function addSignal(signal, reason) {
    if (signal) signals.push(signal);
    if (reason) reasons.push(reason);
  }

  if (hasAds) adsItems.forEach((x) => pushUnique(conflictActors, x));
  if (hasAffiliate) affiliateItems.forEach((x) => pushUnique(conflictActors, x));
  if (hasAmazon) amazonItems.forEach((x) => pushUnique(conflictActors, x));
  if (hasRouter) {
    (redirectChain?.router_layer?.items || []).forEach((x) => pushUnique(conflictActors, x));
  }

  let duplicateRiskScore = 15;

  if (hasAds) duplicateRiskScore += 12;
  if (hasAffiliate) duplicateRiskScore += 16;
  if (hasAmazon) duplicateRiskScore += 16;
  if (hasRouter) duplicateRiskScore += 8;

  if (String(trafficType || "").toLowerCase().includes("mixed")) {
    duplicateRiskScore += 14;
    addSignal(
      "Mixed traffic path",
      "The path contains more than one measurable ecosystem, increasing attribution overlap."
    );
  }

  if (hasAds && hasAffiliate) {
    duplicateRiskScore += 14;
    addSignal(
      "Paid + affiliate overlap",
      "Paid media and affiliate signals coexist, which is a common source of duplicate attribution."
    );
  }

  if (hasAffiliate && hasAmazon) {
    duplicateRiskScore += 12;
    addSignal(
      "Affiliate + Amazon overlap",
      "Affiliate/network signals coexist with Amazon-layer signals, which can lead to competing claim logic."
    );
  }

  if (hasAds && hasAmazonAttribution) {
    duplicateRiskScore += 10;
    addSignal(
      "Paid + Amazon Attribution",
      "Paid media combined with Amazon Attribution creates a structured but potentially overlapping measurement setup."
    );
  }

  if (hasRouter) {
    addSignal(
      "Router layer present",
      "Routing layers increase path complexity and reduce transparency around which actor truly originated the click."
    );
  }

  let likelyCloser = "Unknown";
  let likelyAssist = "Unknown";
  let likelyOriginator = "Unknown";

  if (isCashbackSite) {
    likelyCloser = publisherName !== "Unknown" ? publisherName : "Cashback / Rewards Publisher";
    addSignal(
      "Cashback-style closer",
      "Cashback/rewards traffic often behaves like a late-funnel closer."
    );
  } else if (isDealSite) {
    likelyCloser = publisherName !== "Unknown" ? publisherName : "Deal / Coupon Publisher";
    addSignal(
      "Deal-style closer",
      "Deal/coupon traffic often appears near the final conversion decision."
    );
  } else if (hasAffiliate && !hasAds && !hasAmazonAttribution) {
    likelyCloser = affiliateItems[0] || "Affiliate Network";
  } else if (hasAmazonASS) {
    likelyCloser = "Amazon Associates";
  } else if (hasAmazonACC) {
    likelyCloser = "Amazon Creator Connections";
  } else if (hasAmazonAttribution) {
    likelyCloser = "Amazon Attribution";
  } else if (hasAds) {
    likelyCloser = adsItems[0] || "Paid Media";
  }

  if (hasAds && hasAffiliate) {
    likelyAssist = adsItems[0] || "Paid Media";
  }

  if (hasAmazonACC && isCommercePublisher) {
    likelyAssist = publisherName !== "Unknown" ? publisherName : "Creator / Publisher";
  }

  if (isReviewPublisher || (isCommercePublisher && commercialPrimary === "research_intent")) {
    likelyAssist = publisherName !== "Unknown" ? publisherName : likelyAssist;
    addSignal(
      "Research-led assist",
      "Editorial/review traffic often influences evaluation even when it is not the final claimer."
    );
  }

  if (commercialPrimary === "research_intent" || commercialPrimary === "creator_intent") {
    likelyOriginator = publisherName !== "Unknown" ? publisherName : "Publisher / Creator";
  } else if (hasAds) {
    likelyOriginator = adsItems[0] || "Paid Media";
  } else if (hasAffiliate) {
    likelyOriginator = affiliateItems[0] || "Affiliate Network";
  } else if (hasAmazon) {
    likelyOriginator = amazonClassification;
  }

  let predictedPrimaryClaimer = "Unknown";
  let claimerConfidence = "Low";
  let claimBasis = "No clear dominant claimant was detected.";

  if (hasAmazonAttribution) {
    predictedPrimaryClaimer = "Amazon Attribution";
    claimerConfidence = hasAds ? "High" : "Medium";
    claimBasis = "Amazon Attribution was explicitly detected and usually serves as the dominant measurement layer in Amazon campaign flows.";
  } else if (hasAmazonACC) {
    predictedPrimaryClaimer = "Amazon Creator Connections";
    claimerConfidence = "High";
    claimBasis = "Strong ACC signals were detected, making ACC the clearest Amazon-side claimant.";
  } else if (hasAmazonASS) {
    predictedPrimaryClaimer = "Amazon Associates";
    claimerConfidence = "High";
    claimBasis = "Associates tag-based signals were detected as the clearest direct commission claimant.";
  } else if (hasAffiliate) {
    predictedPrimaryClaimer = affiliateItems[0] || "Affiliate Network";
    claimerConfidence = "Medium";
    claimBasis = "Affiliate-network signals were detected and are the most likely commission claimant outside Amazon.";
  } else if (hasAds) {
    predictedPrimaryClaimer = adsItems[0] || "Paid Media";
    claimerConfidence = "Low";
    claimBasis = "Paid media can claim influence, but payment ownership is often controlled downstream by merchant or affiliate systems.";
  }

  let pathArchetype = "Single-layer path";
  let pathInterpretation = "This path looks relatively simple and less likely to trigger serious attribution competition.";

  if (hasAds && hasAffiliate && hasAmazon) {
    pathArchetype = "Triple-stack path";
    pathInterpretation = "This path combines paid media, affiliate/network logic, and Amazon-layer tracking, making it highly susceptible to duplicate attribution.";
    duplicateRiskScore += 12;
  } else if (hasAds && hasAffiliate) {
    pathArchetype = "Paid-to-affiliate path";
    pathInterpretation = "This path suggests ads may have originated demand while affiliate logic may attempt to close or claim the conversion.";
    duplicateRiskScore += 8;
  } else if (hasAffiliate && hasAmazon) {
    pathArchetype = "Affiliate-to-Amazon path";
    pathInterpretation = "This path suggests an affiliate or publisher layer feeding into Amazon measurement or commission logic.";
    duplicateRiskScore += 6;
  } else if (hasAds && hasAmazon) {
    pathArchetype = "Paid-to-Amazon path";
    pathInterpretation = "This path suggests campaign-driven traffic entering Amazon-tracked flows.";
    duplicateRiskScore += 5;
  } else if (hasRouter && hasAffiliate) {
    pathArchetype = "Routed affiliate path";
    pathInterpretation = "This path contains routing and affiliate layers, increasing opacity around the true source.";
    duplicateRiskScore += 4;
  }

  paths.push(pathArchetype);

  let overwriteRisk = "Low";
  let overwriteReason = "No strong signs of last-click overwrite behavior.";

  if (isCashbackSite || incrementalityLevel === "High") {
    overwriteRisk = "High";
    overwriteReason = "Cashback/coupon-like or low-incrementality traffic often behaves like a late-funnel overwriter.";
  } else if (isDealSite || (hasAffiliate && hasAds)) {
    overwriteRisk = "Medium";
    overwriteReason = "This path has some characteristics of lower-funnel claim capture or overlap with demand already created elsewhere.";
  }

  let trueInfluenceLeader = "Unknown";
  let trueInfluenceReason = "No strong signal of earlier-funnel influence.";

  if (commercialPrimary === "research_intent" && publisherName !== "Unknown") {
    trueInfluenceLeader = publisherName;
    trueInfluenceReason = "Research-led publisher traffic is the strongest candidate for genuine earlier-stage influence.";
  } else if (commercialPrimary === "creator_intent" && publisherName !== "Unknown") {
    trueInfluenceLeader = publisherName;
    trueInfluenceReason = "Creator-led traffic is often a genuine discovery touchpoint.";
  } else if (hasAds) {
    trueInfluenceLeader = adsItems[0] || "Paid Media";
    trueInfluenceReason = "Paid media may have originated the user journey even if another layer attempts to close it.";
  }

  if (qualityTier === "Tier 1" && commercialPrimary === "research_intent") {
    duplicateRiskScore -= 8;
    addSignal(
      "High-quality research traffic",
      "Top-tier editorial/research traffic is more likely to reflect genuine influence than pure attribution capture."
    );
  }

  if (incrementalityLevel === "High") {
    duplicateRiskScore += 10;
    addSignal(
      "High incrementality risk",
      "Low-incrementality traffic increases the chance that attribution is capturing existing demand instead of creating it."
    );
  } else if (incrementalityLevel === "Low") {
    duplicateRiskScore -= 8;
    addSignal(
      "Lower incrementality risk",
      "More incremental traffic is less likely to behave like pure last-click capture."
    );
  }

  if (publisherName === "Unknown" && hasRouter) {
    duplicateRiskScore += 5;
    addSignal(
      "Unknown source behind router",
      "An unknown publisher hidden behind a router increases ambiguity over the true origin of influence."
    );
  }

  if (merchantName !== "Unknown" && retailerProgramHint?.confidence === "High") {
    addSignal(
      `Retailer-program alignment: ${merchantName}`,
      "Known retailer-program alignment improves confidence in understanding who is likely to claim the conversion."
    );
  }

  if (duplicateRiskScore > 100) duplicateRiskScore = 100;
  if (duplicateRiskScore < 0) duplicateRiskScore = 0;

  let duplicateRiskLevel = "Medium";
  let duplicateRiskLabel = "Moderate duplicate attribution risk";

  if (duplicateRiskScore >= 75) {
    duplicateRiskLevel = "High";
    duplicateRiskLabel = "High duplicate attribution risk";
  } else if (duplicateRiskScore <= 34) {
    duplicateRiskLevel = "Low";
    duplicateRiskLabel = "Lower duplicate attribution risk";
  }

  let recommendation = "Treat this path as a mixed-influence path and validate using order-level or cross-system reporting where possible.";

  if (duplicateRiskLevel === "High") {
    recommendation = "Treat claimed conversions cautiously. This path likely contains overlapping layers where the final recorded claimer may not be the true demand creator.";
  } else if (duplicateRiskLevel === "Low") {
    recommendation = "This path looks comparatively cleaner, with less evidence of serious attribution conflict.";
  }

  return {
    predicted_primary_claimer: predictedPrimaryClaimer,
    claimer_confidence: claimerConfidence,
    claim_basis: claimBasis,
    likely_originator: likelyOriginator,
    likely_assist: likelyAssist,
    likely_closer: likelyCloser,
    true_influence_leader: trueInfluenceLeader,
    true_influence_reason: trueInfluenceReason,
    path_archetype: pathArchetype,
    path_interpretation: pathInterpretation,
    conflict_actors: conflictActors,
    duplicate_risk_score: duplicateRiskScore,
    duplicate_risk_level: duplicateRiskLevel,
    duplicate_risk_label: duplicateRiskLabel,
    overwrite_risk: overwriteRisk,
    overwrite_reason: overwriteReason,
    recommendation,
    reason: reasons.join(" "),
    signals: [...new Set(signals)]
  };
}

// --------------------------------------------------
// Channel Role Engine v1
// --------------------------------------------------

function evaluateChannelRoles({
  adsLayer,
  affiliateLayer,
  amazonLayer,
  publisher,
  publisherGroup,
  merchant,
  retailerProgramHint,
  trafficType,
  redirectChain,
  trafficQuality,
  commercialIntent,
  incrementalityRisk,
  attributionConflict
}) {
  const signals = [];
  const reasons = [];

  const adsItems = adsLayer?.items || [];
  const affiliateItems = affiliateLayer?.items || [];

  const publisherName = String(publisher?.publisher || "Unknown");
  const publisherType = String(publisher?.type || "Unknown");

  const amazonClassification = String(amazonLayer?.classification || "Unknown");
  const commercialPrimary = String(commercialIntent?.primary_intent || "unknown");
  const incrementalityLevel = String(incrementalityRisk?.risk_level || "Medium");
  const qualityTier = String(trafficQuality?.tier || "Unknown");

  const hasAds = !!adsLayer?.detected;
  const hasAffiliate = !!affiliateLayer?.detected;
  const hasAmazon = !!amazonLayer?.detected;
  const hasRouter = !!redirectChain?.router_layer?.detected;

  const hasAmazonAttribution = amazonClassification === "Amazon Attribution";
  const hasAmazonACC = amazonClassification === "Amazon Creator Connections";
  const hasAmazonASS = amazonClassification === "Amazon Associates";

  const isDealSite =
    publisherType.includes("Deal") ||
    publisherType.includes("Coupon");

  const isCashbackSite =
    publisherType.includes("Cashback") ||
    publisherType.includes("Rewards");

  const isReviewPublisher = publisherType === "Review Publisher";
  const isCommercePublisher =
    publisherType === "Commerce Publisher" ||
    publisherType === "Media Publisher" ||
    publisherType === "Review Publisher";

  const roles = {
    demand_creator: {
      actor: "Unknown",
      confidence: "Low",
      reason: "No clear demand creator detected."
    },
    demand_shaper: {
      actor: "Unknown",
      confidence: "Low",
      reason: "No clear demand shaper detected."
    },
    demand_closer: {
      actor: "Unknown",
      confidence: "Low",
      reason: "No clear demand closer detected."
    },
    measurement_layer: {
      actor: "Unknown",
      confidence: "Low",
      reason: "No explicit measurement layer detected."
    },
    commission_layer: {
      actor: "Unknown",
      confidence: "Low",
      reason: "No explicit commission layer detected."
    }
  };

  function addSignal(signal, reason) {
    if (signal) signals.push(signal);
    if (reason) reasons.push(reason);
  }

  if (
    publisherName !== "Unknown" &&
    (commercialPrimary === "research_intent" || commercialPrimary === "creator_intent") &&
    incrementalityLevel !== "High"
  ) {
    roles.demand_creator = {
      actor: publisherName,
      confidence: qualityTier === "Tier 1" ? "High" : "Medium",
      reason: "Publisher appears to be the most likely source of original demand or early discovery."
    };
    addSignal(
      `Demand creator: ${publisherName}`,
      "Research-led or creator-led publisher traffic usually indicates earlier-stage influence."
    );
  } else if (hasAds) {
    roles.demand_creator = {
      actor: adsItems[0] || "Paid Media",
      confidence: "Medium",
      reason: "Paid media may have originated the session or introduced the user into the funnel."
    };
    addSignal(
      "Demand creator: Paid Media",
      "Paid media is often the first measurable touch when no strong editorial/creator source is visible."
    );
  } else if (hasAffiliate && !isDealSite && !isCashbackSite) {
    roles.demand_creator = {
      actor: publisherName !== "Unknown" ? publisherName : (affiliateItems[0] || "Affiliate Publisher"),
      confidence: "Low",
      reason: "Affiliate source may have introduced the user, but evidence of early-stage demand creation is limited."
    };
  }

  if (publisherName !== "Unknown" && isReviewPublisher) {
    roles.demand_shaper = {
      actor: publisherName,
      confidence: "High",
      reason: "Review publishers often shape user evaluation and product comparison."
    };
    addSignal(
      `Demand shaper: ${publisherName}`,
      "Review content commonly influences consideration even if it is not the final claimer."
    );
  } else if (publisherName !== "Unknown" && isCommercePublisher && !isDealSite && !isCashbackSite) {
    roles.demand_shaper = {
      actor: publisherName,
      confidence: "Medium",
      reason: "Editorial commerce publishers often influence selection, confidence, and decision framing."
    };
    addSignal(
      `Demand shaper: ${publisherName}`,
      "Commerce/editorial environments often shape product perception and shortlist decisions."
    );
  } else if (hasAmazonACC && publisherName !== "Unknown") {
    roles.demand_shaper = {
      actor: publisherName,
      confidence: "Medium",
      reason: "Creator-driven Amazon flows often shape demand through recommendation and trust."
    };
  }

  if (isCashbackSite) {
    roles.demand_closer = {
      actor: publisherName !== "Unknown" ? publisherName : "Cashback / Rewards Publisher",
      confidence: "High",
      reason: "Cashback/rewards partners usually operate closest to checkout and final conversion."
    };
    addSignal(
      "Demand closer: Cashback site",
      "Cashback flows are often late-funnel and more likely to close than to create demand."
    );
  } else if (isDealSite) {
    roles.demand_closer = {
      actor: publisherName !== "Unknown" ? publisherName : "Deal / Coupon Publisher",
      confidence: "High",
      reason: "Deal/coupon traffic often appears at the final decision stage and helps close the sale."
    };
    addSignal(
      "Demand closer: Deal site",
      "Deal/coupon environments often act as conversion closers."
    );
  } else if (hasAmazonASS) {
    roles.demand_closer = {
      actor: "Amazon Associates",
      confidence: "High",
      reason: "Associates links are typically the direct commission-capturing closing layer in Amazon flows."
    };
  } else if (hasAmazonACC) {
    roles.demand_closer = {
      actor: "Amazon Creator Connections",
      confidence: "Medium",
      reason: "ACC can function as the visible closing layer within Amazon creator-led commerce."
    };
  } else if (hasAffiliate) {
    roles.demand_closer = {
      actor: affiliateItems[0] || "Affiliate Network",
      confidence: "Medium",
      reason: "Affiliate-network tracking often behaves as the practical closer in commission ownership terms."
    };
  } else if (hasAds) {
    roles.demand_closer = {
      actor: adsItems[0] || "Paid Media",
      confidence: "Low",
      reason: "Paid media may act as the final measurable touch when no other layer is present."
    };
  }

  if (hasAmazonAttribution) {
    roles.measurement_layer = {
      actor: "Amazon Attribution",
      confidence: "High",
      reason: "Amazon Attribution is an explicit measurement layer designed to record campaign-driven influence."
    };
    addSignal(
      "Measurement layer: Amazon Attribution",
      "Amazon Attribution is primarily a measurement construct rather than a publisher or closer."
    );
  } else if (hasAds) {
    roles.measurement_layer = {
      actor: adsItems[0] || "Paid Media Tracking",
      confidence: "Medium",
      reason: "Paid media click IDs function as measurement signals for campaign tracking."
    };
  } else if (hasRouter) {
    roles.measurement_layer = {
      actor: redirectChain?.router_layer?.items?.[0] || "Router Layer",
      confidence: "Low",
      reason: "Router layers may support path tracking, but are not always the final measurement authority."
    };
  }

  if (hasAmazonASS) {
    roles.commission_layer = {
      actor: "Amazon Associates",
      confidence: "High",
      reason: "Amazon Associates is the clearest commission-bearing layer in tagged Amazon affiliate flows."
    };
    addSignal(
      "Commission layer: Amazon Associates",
      "Tagged Amazon affiliate flows strongly indicate Associates as the commission layer."
    );
  } else if (hasAmazonACC) {
    roles.commission_layer = {
      actor: "Amazon Creator Connections",
      confidence: "High",
      reason: "Creator Connections is the most direct commission-bearing layer in ACC flows."
    };
    addSignal(
      "Commission layer: Amazon Creator Connections",
      "ACC indicates creator-oriented commission logic on Amazon."
    );
  } else if (hasAffiliate) {
    roles.commission_layer = {
      actor: affiliateItems[0] || "Affiliate Network",
      confidence: "Medium",
      reason: "Affiliate-network tracking is the most likely commission layer outside direct Amazon commission structures."
    };
    addSignal(
      "Commission layer: Affiliate Network",
      "Affiliate signals usually represent the network through which commissions are credited."
    );
  }

  const predictedPrimaryClaimer = String(attributionConflict?.predicted_primary_claimer || "Unknown");
  const trueInfluenceLeader = String(attributionConflict?.true_influence_leader || "Unknown");
  const likelyCloser = String(attributionConflict?.likely_closer || "Unknown");

  if (predictedPrimaryClaimer !== "Unknown") {
    roles.commission_layer.actor = predictedPrimaryClaimer;
    roles.commission_layer.confidence = attributionConflict?.claimer_confidence || roles.commission_layer.confidence;
    roles.commission_layer.reason = "Role aligned to predicted primary claimer from Attribution Conflict Engine.";
  }

  if (trueInfluenceLeader !== "Unknown") {
    roles.demand_creator.actor = trueInfluenceLeader;
    roles.demand_creator.confidence = roles.demand_creator.confidence === "Low" ? "Medium" : roles.demand_creator.confidence;
    roles.demand_creator.reason = "Role aligned to true influence leader from Attribution Conflict Engine.";
  }

  if (likelyCloser !== "Unknown") {
    roles.demand_closer.actor = likelyCloser;
    roles.demand_closer.reason = "Role aligned to likely closer from Attribution Conflict Engine.";
  }

  let architecture = "Simple path";
  let architectureReason = "This path appears to have limited functional separation between demand creation, measurement, and commission.";

  if (hasAds && hasAffiliate && hasAmazon) {
    architecture = "Multi-layer commerce stack";
    architectureReason = "This path includes distinct creation, measurement, and commission possibilities across ad, affiliate, and Amazon systems.";
  } else if (hasAffiliate && hasAmazon) {
    architecture = "Affiliate-to-Amazon stack";
    architectureReason = "This path combines publisher/affiliate influence with Amazon-side attribution or commission layers.";
  } else if (hasAds && hasAffiliate) {
    architecture = "Paid-to-affiliate stack";
    architectureReason = "This path suggests paid demand generation with affiliate-layer closing or commission capture.";
  } else if (hasAds && hasAmazon) {
    architecture = "Paid-to-Amazon stack";
    architectureReason = "This path suggests campaign-driven entry with Amazon-side measurement or commission resolution.";
  }

  return {
    roles,
    architecture,
    architecture_reason: architectureReason,
    signals: [...new Set(signals)],
    reason: reasons.join(" ")
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
  merchant,
  retailerProgramHint,
  publisherGroup,
  trafficQuality,
  commercialIntent,
  incrementalityRisk,
  attributionConflict,
  channelRoles,
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

  if (publisherGroup && publisherGroup.group !== "Unknown") {
    parts.push(`Publisher belongs to media group ${publisherGroup.group}.`);
  }

  if (merchant && merchant.merchant !== "Unknown") {
    parts.push(`Merchant appears to be ${merchant.merchant}.`);
  }

  if (retailerProgramHint && retailerProgramHint.likely_program !== "Unknown") {
    parts.push(`Retailer program hint suggests ${retailerProgramHint.likely_program}.`);
  }

  if (redirectChain.final_destination.domain) {
    parts.push(`Final destination resolves to ${redirectChain.final_destination.domain}.`);
  }

  parts.push(`Most likely primary claimer: ${commissionEngine.primary_claimer}.`);
  parts.push(`Conflict risk: ${commissionEngine.conflict_level}.`);

  if (trafficQuality && trafficQuality.tier) {
    parts.push(`Traffic quality is rated ${trafficQuality.tier} (${trafficQuality.label}) with score ${trafficQuality.score}.`);
  }

  if (commercialIntent && commercialIntent.label) {
    parts.push(
      `Commercial intent is classified as ${commercialIntent.label} with ${commercialIntent.confidence.toLowerCase()} confidence.`
    );
  }

  if (incrementalityRisk && incrementalityRisk.risk_level) {
    parts.push(
      `Incrementality risk is rated ${incrementalityRisk.risk_level} (${incrementalityRisk.label}) with score ${incrementalityRisk.risk_score}.`
    );
  }

  if (attributionConflict && attributionConflict.duplicate_risk_level) {
    parts.push(
      `Attribution conflict is rated ${attributionConflict.duplicate_risk_level} (${attributionConflict.duplicate_risk_label}) with score ${attributionConflict.duplicate_risk_score}.`
    );
  }

  if (attributionConflict && attributionConflict.predicted_primary_claimer) {
    parts.push(
      `Predicted primary claimer is ${attributionConflict.predicted_primary_claimer}, while likely closer appears to be ${attributionConflict.likely_closer}.`
    );
  }

  if (channelRoles && channelRoles.roles) {
    parts.push(
      `Channel roles suggest demand creator: ${channelRoles.roles.demand_creator.actor}, demand shaper: ${channelRoles.roles.demand_shaper.actor}, demand closer: ${channelRoles.roles.demand_closer.actor}.`
    );

    parts.push(
      `Measurement layer appears to be ${channelRoles.roles.measurement_layer.actor}, while commission layer appears to be ${channelRoles.roles.commission_layer.actor}.`
    );
  }

  return parts.join(" ");
}
