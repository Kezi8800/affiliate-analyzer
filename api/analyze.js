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
    const hostname = parsed.hostname.toLowerCase();
    const lowerUrl = normalizedUrl.toLowerCase();
    const queryEntries = [...parsed.searchParams.entries()];
    const queryMap = buildQueryMap(queryEntries);

    // 1) detect layers
    const adsLayer = detectAdsLayer(queryMap);
    const affiliateLayer = detectAffiliateLayer(queryMap, lowerUrl);
    const amazonLayer = detectAmazonLayer(queryMap, lowerUrl, hostname);

    // 2) publisher
    const publisher = detectPublisher(hostname, queryMap, lowerUrl);

    // 3) platform candidates
    const platformCandidates = scorePlatforms({
      adsLayer,
      affiliateLayer,
      amazonLayer,
      hostname,
      lowerUrl,
      queryMap
    });

    const primaryPlatform = platformCandidates.length
      ? platformCandidates[0]
      : {
          name: "Unknown / Generic Link",
          score: 10,
          confidence: "Low",
          signals: []
        };

    // 4) traffic type
    const trafficType = inferTrafficType({
      adsLayer,
      affiliateLayer,
      amazonLayer
    });

    // 5) commission engine
    const commissionEngine = inferCommissionEngine({
      adsLayer,
      affiliateLayer,
      amazonLayer,
      primaryPlatform
    });

    // 6) tracking layers
    const trackingLayers = [];
    if (adsLayer.detected) trackingLayers.push("Paid Media");
    if (affiliateLayer.detected) trackingLayers.push("Affiliate Network");
    if (amazonLayer.detected) trackingLayers.push("Amazon Tracking Layer");

    // 7) parameter signals
    const parameterSignals = {
      ...adsLayer.params,
      ...affiliateLayer.params,
      ...amazonLayer.params
    };

    // 8) participant stack
    const participantStack = {
      paid_media: adsLayer.detected ? adsLayer.items.join(", ") : "No paid media click IDs detected",
      affiliate_network: affiliateLayer.detected ? affiliateLayer.items.join(", ") : "No affiliate network signals detected",
      amazon_layer: amazonLayer.detected ? amazonLayer.items.join(", ") : "No Amazon-specific layer detected",
      publisher: publisher.publisher !== "Unknown"
        ? `${publisher.publisher}${publisher.sub_site && publisher.sub_site !== "-" ? " / " + publisher.sub_site : ""}`
        : "Not clearly identified",
      likely_claimer: commissionEngine.primary_claimer
    };

    // 9) conflict insight
    const conflictInsight = buildConflictInsight({
      adsLayer,
      affiliateLayer,
      amazonLayer,
      commissionEngine
    });

    // 10) summary
    const summary = buildSummary({
      primaryPlatform,
      trafficType,
      adsLayer,
      affiliateLayer,
      amazonLayer,
      publisher,
      commissionEngine
    });

    const response = {
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
      conflict_insight: conflictInsight
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unexpected server error"
    });
  }
}

function normalizeUrl(input) {
  const trimmed = input.trim();
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

// --------------------
// Ads layer
// --------------------
function detectAdsLayer(queryMap) {
  const items = [];
  const params = {};

  const rules = [
    { key: "gclid", label: "Google Ads" },
    { key: "gbraid", label: "Google Ads (gbraid)" },
    { key: "wbraid", label: "Google Ads (wbraid)" },
    { key: "fbclid", label: "Meta Ads" },
    { key: "ttclid", label: "TikTok Ads" },
    { key: "msclkid", label: "Microsoft Ads" }
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

// --------------------
// Affiliate layer
// --------------------
function detectAffiliateLayer(queryMap, lowerUrl) {
  const items = [];
  const params = {};

  const rules = [
    { name: "Impact", keys: ["irclickid"] },
    { name: "CJ Affiliate", keys: ["cjevent"] },
    { name: "Awin", keys: ["awc"] },
    { name: "Rakuten", keys: ["ranMID", "ranEAID", "ranSiteID"] },
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
      items.push(rule.name);
      Object.assign(params, pickParams(queryMap, matched));
    }
  });

  if (lowerUrl.includes("wayward")) items.push("Wayward");
  if (lowerUrl.includes("skimlinks")) items.push("Skimlinks");
  if (lowerUrl.includes("viglink") || lowerUrl.includes("sovrn")) items.push("Sovrn / VigLink");

  return {
    detected: items.length > 0,
    items: unique(items),
    params
  };
}

// --------------------
// Amazon layer
// --------------------
function detectAmazonLayer(queryMap, lowerUrl, hostname) {
  const items = [];
  const params = {};

  if (hasParam(queryMap, "tag")) {
    items.push("Amazon Associates");
    params.tag = queryMap.tag;
  }

  const attributionKeys = ["maas", "aa_campaignid", "aa_adgroupid", "aa_creativeid"];
  if (hasAnyParam(queryMap, attributionKeys) || lowerUrl.includes("ref_=aa_maas")) {
    items.push("Amazon Attribution");
    Object.assign(params, pickParams(queryMap, attributionKeys));
    if (lowerUrl.includes("ref_=aa_maas")) params.ref_ = "aa_maas";
  }

  const accSignals = [];
  if (hasParam(queryMap, "campaignId")) accSignals.push("campaignId");
  if (hasParam(queryMap, "linkId")) accSignals.push("linkId");
  if (hasParam(queryMap, "ascsubtag")) accSignals.push("ascsubtag");
  if (String(queryMap.linkCode || "").toLowerCase() === "tr1") accSignals.push("linkCode=tr1");

  if (accSignals.length) {
    items.push("Amazon Creator Connections");
    Object.assign(params, pickParams(queryMap, ["campaignId", "linkId", "ascsubtag", "linkCode"]));
  }

  if (hostname.includes("amazon.")) {
    params.amazon_domain = hostname;
  }

  return {
    detected: items.length > 0,
    items: unique(items),
    params
  };
}

// --------------------
// Publisher
// --------------------
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
  } else if (hostname.includes("forbes")) {
    publisher = "Forbes";
    type = "Media Publisher";
    confidence = "High";
  } else if (hostname.includes("future")) {
    publisher = "Future Publishing";
    type = "Media Publisher";
    confidence = "Medium";
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

  if (lowerUrl.includes("skimlinks")) {
    if (publisher === "Unknown") publisher = "Skimlinks";
    type = "Sub-affiliate / Link Router";
    confidence = "Medium";
  }

  return {
    publisher,
    sub_site: subSite,
    type,
    confidence
  };
}

// --------------------
// Scoring
// --------------------
function scorePlatforms({ adsLayer, affiliateLayer, amazonLayer, hostname }) {
  const candidates = [];

  function addCandidate(name, score, signals) {
    candidates.push({
      name,
      score,
      confidence: confidenceFromScore(score),
      signals: unique(signals)
    });
  }

  if (amazonLayer.items.includes("Amazon Attribution")) {
    addCandidate("Amazon Attribution", 95, ["maas", "aa_campaignid", "Amazon attribution layer"]);
  }

  if (amazonLayer.items.includes("Amazon Creator Connections")) {
    addCandidate("Amazon Creator Connections", 92, ["campaignId", "linkId", "ascsubtag", "Amazon creator layer"]);
  }

  if (amazonLayer.items.includes("Amazon Associates")) {
    addCandidate("Amazon Associates", 88, ["tag", "Amazon affiliate tag"]);
  }

  affiliateLayer.items.forEach((name) => {
    let score = 78;
    if (name === "Impact") score = 86;
    if (name === "CJ Affiliate") score = 84;
    if (name === "Awin") score = 84;
    if (name === "Rakuten") score = 84;
    if (name === "Wayward") score = 80;
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

  if (hostname.includes("amazon.")) {
    addCandidate("Amazon Domain", 50, ["amazon domain"]);
  }

  return candidates.sort((a, b) => b.score - a.score);
}

// --------------------
// Traffic type
// --------------------
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

// --------------------
// Commission engine
// --------------------
function inferCommissionEngine({ adsLayer, affiliateLayer, amazonLayer, primaryPlatform }) {
  const hasAds = adsLayer.detected;
  const hasAffiliate = affiliateLayer.detected;
  const hasAmazonAttribution = amazonLayer.items.includes("Amazon Attribution");
  const hasAmazonAssociates = amazonLayer.items.includes("Amazon Associates");
  const hasAmazonACC = amazonLayer.items.includes("Amazon Creator Connections");

  let primaryClaimer = primaryPlatform.name || "Unknown";
  let secondaryClaimers = [];
  let conflictLevel = "Low";
  let confidence = primaryPlatform.confidence || "Low";
  let reason = "Single dominant signal detected.";

  if (hasAmazonAttribution) {
    primaryClaimer = "Amazon Attribution";
    reason = "Amazon Attribution parameters were detected and appear to be the strongest measurable attribution layer.";
  } else if (hasAmazonACC) {
    primaryClaimer = "Amazon Creator Connections";
    reason = "Creator-oriented Amazon parameters were detected, suggesting creator or influencer commission logic.";
  } else if (hasAmazonAssociates) {
    primaryClaimer = "Amazon Associates";
    reason = "Amazon Associates tag was detected as the clearest direct commission indicator.";
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

  secondaryClaimers = unique(secondaryClaimers).filter((v) => v !== primaryClaimer);

  const activeLayerCount = [hasAds, hasAffiliate, amazonLayer.detected].filter(Boolean).length;

  if (activeLayerCount >= 3) {
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
      `Conflict level: ${conflictLevel}`,
      reason
    ]
  };
}

// --------------------
// Conflict insight
// --------------------
function buildConflictInsight({ adsLayer, affiliateLayer, amazonLayer, commissionEngine }) {
  const activeLayerCount = [adsLayer.detected, affiliateLayer.detected, amazonLayer.detected].filter(Boolean).length;

  let title = "Low overlap";
  let message = "This link does not show strong evidence of multi-layer attribution conflict.";

  if (activeLayerCount >= 2 || commissionEngine.conflict_level === "Medium") {
    title = "Attribution overlap detected";
    message = "More than one tracking layer is present. Paid media, affiliate platforms, or Amazon systems may each register influence using their own attribution logic.";
  }

  if (activeLayerCount >= 3 || commissionEngine.conflict_level === "High") {
    title = "High duplicate attribution risk";
    message = "This link contains multiple active tracking layers across paid media, affiliate routing, and Amazon-related signals. In practice, several systems may all attempt to claim the same conversion.";
  }

  return { title, message };
}

// --------------------
// Summary
// --------------------
function buildSummary({
  primaryPlatform,
  trafficType,
  adsLayer,
  affiliateLayer,
  amazonLayer,
  publisher,
  commissionEngine
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

  if (amazonLayer.detected) {
    parts.push(`Amazon-related layers found: ${amazonLayer.items.join(", ")}.`);
  }

  if (publisher.publisher !== "Unknown") {
    parts.push(`Publisher context suggests ${publisher.publisher}.`);
  }

  parts.push(`Most likely primary claimer: ${commissionEngine.primary_claimer}.`);
  parts.push(`Conflict risk: ${commissionEngine.conflict_level}.`);

  return parts.join(" ");
}
