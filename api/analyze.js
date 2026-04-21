export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing or invalid url" });
    }

    const normalizedUrl = normalizeUrl(url);
    const parsed = new URL(normalizedUrl);

    const queryEntries = [...parsed.searchParams.entries()];
    const queryMap = buildQueryMap(queryEntries);
    const lowerUrl = normalizedUrl.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();

    const parameterSignals = {};
    const trackingLayers = [];
    const platformCandidates = [];
    const decisionBasis = [];

    // -----------------------------
    // 1) Ads layer detection
    // -----------------------------
    const adsSignals = detectAds(queryMap);
    if (adsSignals.detected.length) {
      trackingLayers.push("Paid Media");
      decisionBasis.push(`Detected ad click identifiers: ${adsSignals.detected.join(", ")}`);
    }
    Object.assign(parameterSignals, adsSignals.params);

    // -----------------------------
    // 2) Affiliate network detection
    // -----------------------------
    const affiliateSignals = detectAffiliateNetworks(queryMap, lowerUrl);
    if (affiliateSignals.detected.length) {
      trackingLayers.push("Affiliate Network");
      decisionBasis.push(`Detected affiliate network signals: ${affiliateSignals.detected.join(", ")}`);
    }
    Object.assign(parameterSignals, affiliateSignals.params);

    // -----------------------------
    // 3) Amazon layer detection
    // -----------------------------
    const amazonSignals = detectAmazonSignals(queryMap, lowerUrl, hostname);
    if (amazonSignals.detected.length) {
      trackingLayers.push("Amazon Tracking Layer");
      decisionBasis.push(`Detected Amazon layer signals: ${amazonSignals.detected.join(", ")}`);
    }
    Object.assign(parameterSignals, amazonSignals.params);

    // -----------------------------
    // 4) Publisher detection
    // -----------------------------
    const publisher = detectPublisher(hostname, queryMap, lowerUrl);

    // -----------------------------
    // 5) Candidate scoring
    // -----------------------------
    const scored = scorePlatforms({
      adsSignals,
      affiliateSignals,
      amazonSignals,
      hostname,
      lowerUrl,
      queryMap
    });

    platformCandidates.push(...scored);

    // -----------------------------
    // 6) Primary platform
    // -----------------------------
    const primaryPlatform = platformCandidates.length
      ? platformCandidates[0]
      : {
          name: "Unknown / Generic Link",
          score: 10,
          confidence: "Low",
          signals: []
        };

    // -----------------------------
    // 7) Traffic type
    // -----------------------------
    const trafficType = inferTrafficType({
      adsSignals,
      affiliateSignals,
      amazonSignals
    });

    // -----------------------------
    // 8) Commission engine
    // -----------------------------
    const commissionEngine = inferCommissionEngine({
      adsSignals,
      affiliateSignals,
      amazonSignals,
      primaryPlatform,
      publisher
    });

    // -----------------------------
    // 9) Summary
    // -----------------------------
    const summary = buildSummary({
      primaryPlatform,
      trafficType,
      adsSignals,
      affiliateSignals,
      amazonSignals,
      commissionEngine,
      publisher
    });

    const response = {
      analyzed_url: normalizedUrl,
      primary_platform: {
        name: primaryPlatform.name,
        score: primaryPlatform.score,
        confidence: primaryPlatform.confidence,
        signals: primaryPlatform.signals
      },
      traffic_type: trafficType,
      confidence: primaryPlatform.confidence,
      tracking_layers: unique(trackingLayers),
      parameter_signals: parameterSignals,
      platform_candidates: platformCandidates,
      publisher,
      commission_engine: commissionEngine,
      summary
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unexpected server error"
    });
  }
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function normalizeUrl(input) {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function buildQueryMap(entries) {
  const map = {};
  for (const [key, value] of entries) {
    const k = String(key || "").trim();
    if (!k) continue;
    map[k] = value;
  }
  return map;
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function hasParam(queryMap, key) {
  return Object.prototype.hasOwnProperty.call(queryMap, key);
}

function hasAnyParam(queryMap, keys) {
  return keys.some((k) => hasParam(queryMap, k));
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

// --------------------------------------------------
// Ads detection
// --------------------------------------------------

function detectAds(queryMap) {
  const detected = [];
  const params = {};

  const defs = [
    { key: "gclid", label: "Google Ads" },
    { key: "gbraid", label: "Google Ads (gbraid)" },
    { key: "wbraid", label: "Google Ads (wbraid)" },
    { key: "fbclid", label: "Meta Ads" },
    { key: "ttclid", label: "TikTok Ads" },
    { key: "msclkid", label: "Microsoft Ads" }
  ];

  defs.forEach(({ key, label }) => {
    if (hasParam(queryMap, key)) {
      detected.push(label);
      params[key] = queryMap[key];
    }
  });

  return {
    detected: unique(detected),
    params
  };
}

// --------------------------------------------------
// Affiliate detection
// --------------------------------------------------

function detectAffiliateNetworks(queryMap, lowerUrl) {
  const detected = [];
  const params = {};

  const rules = [
    { name: "Impact", keys: ["irclickid"] },
    { name: "CJ Affiliate", keys: ["cjevent"] },
    { name: "Awin", keys: ["awc"] },
    { name: "Rakuten Advertising", keys: ["ranMID", "ranEAID", "ranSiteID"] },
    { name: "ShareASale", keys: ["shareasale", "sscid", "afftrack"] },
    { name: "Partnerize", keys: ["pjid", "pjmid"] },
    { name: "Webgains", keys: ["wgcampaignid", "wgprogramid"] },
    { name: "TradeDoubler", keys: ["tduid", "trafficsourceid"] },
    { name: "FlexOffers", keys: ["faid", "fobs"] },
    { name: "Sovrn / VigLink", keys: ["vglnk", "vgtid"] },
    { name: "Skimlinks", keys: ["skimlinks"] },
    { name: "PartnerStack", keys: ["ps_xid", "ps_partner_key"] },
    { name: "PartnerBoost", keys: ["pb_id", "pb_clickid", "pb_source"] },
    { name: "Everflow", keys: ["evclid", "everflow_id"] },
    { name: "TUNE", keys: ["tid", "aff_id", "offer_id"] },
    { name: "Admitad", keys: ["admitad_uid"] },
    { name: "Refersion", keys: ["refersion"] },
    { name: "GoAffPro", keys: ["goaffpro"] },
    { name: "UpPromote", keys: ["up_promote", "sref"] },
    { name: "ClickBank", keys: ["cbitems", "cbfid"] },
    { name: "JVZoo", keys: ["jv", "affiliate"] },
    { name: "Digistore24", keys: ["ds24"] }
  ];

  rules.forEach((rule) => {
    const matched = rule.keys.filter((k) => hasParam(queryMap, k));
    if (matched.length) {
      detected.push(rule.name);
      Object.assign(params, pickParams(queryMap, matched));
    }
  });

  if (lowerUrl.includes("wayward")) {
    detected.push("Wayward");
  }
  if (lowerUrl.includes("skimlinks")) {
    detected.push("Skimlinks");
  }
  if (lowerUrl.includes("viglink") || lowerUrl.includes("sovrn")) {
    detected.push("Sovrn / VigLink");
  }

  return {
    detected: unique(detected),
    params
  };
}

// --------------------------------------------------
// Amazon detection
// --------------------------------------------------

function detectAmazonSignals(queryMap, lowerUrl, hostname) {
  const detected = [];
  const params = {};

  // Amazon Associates
  if (hasParam(queryMap, "tag")) {
    detected.push("Amazon Associates");
    params.tag = queryMap.tag;
  }

  // Amazon Attribution
  const attributionKeys = [
    "maas",
    "aa_campaignid",
    "aa_adgroupid",
    "aa_creativeid"
  ];

  if (
    hasAnyParam(queryMap, attributionKeys) ||
    lowerUrl.includes("ref_=aa_maas")
  ) {
    detected.push("Amazon Attribution");
    Object.assign(params, pickParams(queryMap, attributionKeys));
    if (lowerUrl.includes("ref_=aa_maas")) {
      params["ref_"] = "aa_maas";
    }
  }

  // Amazon Creator Connections
  const accSignals = [];
  if (hasParam(queryMap, "campaignId")) accSignals.push("campaignId");
  if (hasParam(queryMap, "linkId")) accSignals.push("linkId");
  if (hasParam(queryMap, "ascsubtag")) accSignals.push("ascsubtag");
  if (
    String(queryMap.linkCode || "").toLowerCase() === "tr1"
  ) {
    accSignals.push("linkCode=tr1");
  }

  if (accSignals.length) {
    detected.push("Amazon Creator Connections");
    Object.assign(params, pickParams(queryMap, ["campaignId", "linkId", "ascsubtag", "linkCode"]));
  }

  if (hostname.includes("amazon.")) {
    params.amazon_domain = hostname;
  }

  return {
    detected: unique(detected),
    params
  };
}

// --------------------------------------------------
// Publisher detection
// --------------------------------------------------

function detectPublisher(hostname, queryMap, lowerUrl) {
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
  } else if (hostname.includes("future")) {
    publisher = "Future Publishing";
    type = "Media Publisher";
    confidence = "Medium";
  } else if (hostname.includes("forbes")) {
    publisher = "Forbes";
    type = "Media Publisher";
    confidence = "High";
  }

  if (hasParam(queryMap, "utm_source")) {
    const utmSource = String(queryMap.utm_source || "").trim();
    if (utmSource) {
      subSite = utmSource;
      if (publisher === "Unknown") {
        publisher = utmSource;
        type = "Traffic Source / Publisher";
        confidence = "Medium";
      }
    }
  }

  if (lowerUrl.includes("skimlinks")) {
    type = "Sub-affiliate / Link Router";
    if (publisher === "Unknown") publisher = "Skimlinks";
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

function scorePlatforms({ adsSignals, affiliateSignals, amazonSignals, hostname, lowerUrl, queryMap }) {
  const candidates = [];

  function addCandidate(name, score, signals) {
    candidates.push({
      name,
      score,
      confidence: confidenceFromScore(score),
      signals: unique(signals)
    });
  }

  if (amazonSignals.detected.includes("Amazon Attribution")) {
    addCandidate("Amazon Attribution", 95, ["maas", "aa_campaignid", "Amazon attribution layer"]);
  }

  if (amazonSignals.detected.includes("Amazon Creator Connections")) {
    addCandidate("Amazon Creator Connections", 92, ["campaignId/linkId/ascsubtag/linkCode", "Amazon creator layer"]);
  }

  if (amazonSignals.detected.includes("Amazon Associates")) {
    addCandidate("Amazon Associates", 88, ["tag", "Amazon affiliate tag"]);
  }

  affiliateSignals.detected.forEach((network) => {
    let score = 78;
    if (network === "Impact") score = 86;
    if (network === "CJ Affiliate") score = 84;
    if (network === "Awin") score = 84;
    if (network === "Rakuten Advertising") score = 84;
    if (network === "Wayward") score = 80;

    addCandidate(network, score, [network, "affiliate network signal"]);
  });

  adsSignals.detected.forEach((ad) => {
    let score = 58;
    if (ad.includes("Google Ads")) score = 66;
    if (ad.includes("Meta Ads")) score = 64;
    if (ad.includes("TikTok Ads")) score = 64;
    if (ad.includes("Microsoft Ads")) score = 62;

    addCandidate(ad, score, [ad, "paid media click id"]);
  });

  if (hostname.includes("amazon.")) {
    addCandidate("Amazon Domain", 50, ["amazon domain"]);
  }

  return candidates.sort((a, b) => b.score - a.score);
}

// --------------------------------------------------
// Traffic type
// --------------------------------------------------

function inferTrafficType({ adsSignals, affiliateSignals, amazonSignals }) {
  const hasAds = adsSignals.detected.length > 0;
  const hasAffiliate = affiliateSignals.detected.length > 0;
  const hasAmazon = amazonSignals.detected.length > 0;

  if (hasAds && hasAffiliate && hasAmazon) {
    return "Mixed: Paid Media + Affiliate + Amazon";
  }
  if (hasAds && hasAffiliate) {
    return "Mixed: Paid Media + Affiliate";
  }
  if (hasAffiliate && hasAmazon) {
    return "Mixed: Affiliate + Amazon";
  }
  if (hasAds && hasAmazon) {
    return "Mixed: Paid Media + Amazon";
  }
  if (hasAds) return "Paid Media";
  if (hasAffiliate) return "Affiliate";
  if (hasAmazon) return "Amazon-linked";
  return "Direct / Unknown";
}

// --------------------------------------------------
// Commission engine
// --------------------------------------------------

function inferCommissionEngine({ adsSignals, affiliateSignals, amazonSignals, primaryPlatform }) {
  const hasAds = adsSignals.detected.length > 0;
  const hasAffiliate = affiliateSignals.detected.length > 0;
  const hasAmazonAttribution = amazonSignals.detected.includes("Amazon Attribution");
  const hasAmazonAssociates = amazonSignals.detected.includes("Amazon Associates");
  const hasAmazonACC = amazonSignals.detected.includes("Amazon Creator Connections");

  let primaryClaimer = primaryPlatform.name || "Unknown";
  let secondaryClaimers = [];
  let conflictLevel = "Low";
  let confidence = primaryPlatform.confidence || "Low";
  let reason = "Single dominant signal detected.";

  if (hasAmazonAttribution) {
    primaryClaimer = "Amazon Attribution";
    reason = "Amazon Attribution parameters were detected and appear to be the strongest identifiable attribution layer.";
  } else if (hasAmazonACC) {
    primaryClaimer = "Amazon Creator Connections";
    reason = "Creator Connections style parameters were detected, suggesting influencer or creator-driven commission logic.";
  } else if (hasAmazonAssociates) {
    primaryClaimer = "Amazon Associates";
    reason = "Amazon Associates tag detected as the strongest direct commission signal.";
  } else if (affiliateSignals.detected.length) {
    primaryClaimer = affiliateSignals.detected[0];
    reason = "Affiliate network click identifiers were detected and likely control downstream attribution on the merchant side.";
  } else if (adsSignals.detected.length) {
    primaryClaimer = adsSignals.detected[0];
    reason = "Ad click identifiers were detected, but commission ownership may still depend on downstream systems.";
  }

  if (hasAds) {
    secondaryClaimers.push(...adsSignals.detected);
  }
  if (affiliateSignals.detected.length) {
    secondaryClaimers.push(...affiliateSignals.detected);
  }
  if (hasAmazonAttribution) secondaryClaimers.push("Amazon Attribution");
  if (hasAmazonAssociates) secondaryClaimers.push("Amazon Associates");
  if (hasAmazonACC) secondaryClaimers.push("Amazon Creator Connections");

  secondaryClaimers = unique(secondaryClaimers).filter((v) => v !== primaryClaimer);

  const activeLayers = [
    hasAds,
    affiliateSignals.detected.length > 0,
    hasAmazonAttribution || hasAmazonAssociates || hasAmazonACC
  ].filter(Boolean).length;

  if (activeLayers >= 3) {
    conflictLevel = "High";
    reason += " Multiple attribution layers are present in the same link, so different systems may all register influence.";
  } else if (activeLayers === 2) {
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
      `Primary platform scored highest as: ${primaryPlatform.name || "Unknown"}`,
      `Conflict level assessed as: ${conflictLevel}`,
      reason
    ]
  };
}

// --------------------------------------------------
// Summary
// --------------------------------------------------

function buildSummary({
  primaryPlatform,
  trafficType,
  adsSignals,
  affiliateSignals,
  amazonSignals,
  commissionEngine,
  publisher
}) {
  const parts = [];

  parts.push(`Primary detection points to ${primaryPlatform.name}.`);
  parts.push(`Traffic type is classified as ${trafficType}.`);

  if (adsSignals.detected.length) {
    parts.push(`Ad layer signals found: ${adsSignals.detected.join(", ")}.`);
  }

  if (affiliateSignals.detected.length) {
    parts.push(`Affiliate network signals found: ${affiliateSignals.detected.join(", ")}.`);
  }

  if (amazonSignals.detected.length) {
    parts.push(`Amazon-related layers found: ${amazonSignals.detected.join(", ")}.`);
  }

  if (publisher && publisher.publisher && publisher.publisher !== "Unknown") {
    parts.push(`Publisher context suggests ${publisher.publisher}.`);
  }

  parts.push(`Most likely primary claimer: ${commissionEngine.primary_claimer}.`);
  parts.push(`Conflict risk: ${commissionEngine.conflict_level}.`);

  return parts.join(" ");
}
