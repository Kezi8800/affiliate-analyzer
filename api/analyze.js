module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const rawUrl = body?.url;

    if (!rawUrl) {
      return res.status(400).json({ error: "Missing url" });
    }

    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname || "";
    const params = parsed.searchParams;

    const trackingLayers = [];
    const decisionBasis = [];
    const parameterSignals = {};
    const platformCandidates = [];

    let platform = "-";
    let trafficType = "unknown";
    let confidence = "low";

    let publisher = "-";
    let subSite = "-";
    let publisherType = "-";
    let publisherConfidence = "low";

    let primaryClaimer = "-";
    let secondaryClaimers = [];
    let conflictLevel = "low";
    let reason = "No strong attribution signal detected.";
    let commissionConfidence = "low";
    let summary = "No strong attribution signal detected.";

    function getParam(key) {
      return params.get(key);
    }

    function hasParam(key) {
      return params.has(key);
    }

    function addSignal(key) {
      if (hasParam(key)) {
        parameterSignals[key] = getParam(key);
        return true;
      }
      return false;
    }

    function addTrackingLayer(value) {
      if (!trackingLayers.includes(value)) {
        trackingLayers.push(value);
      }
    }

    function addDecision(value) {
      if (!decisionBasis.includes(value)) {
        decisionBasis.push(value);
      }
    }

    function addCandidate(name, score, confidenceLevel, signals) {
      const existing = platformCandidates.find((x) => x.name === name);
      if (!existing) {
        platformCandidates.push({
          name,
          confidence: confidenceLevel,
          score,
          signals
        });
        return;
      }

      if (score > existing.score) existing.score = score;
      if (
        confidenceRank(confidenceLevel) > confidenceRank(existing.confidence)
      ) {
        existing.confidence = confidenceLevel;
      }

      const merged = [...existing.signals, ...signals];
      existing.signals = [...new Set(merged)];
    }

    function confidenceRank(v) {
      if (v === "high") return 3;
      if (v === "medium") return 2;
      return 1;
    }

    function pickPrimaryPlatform(name, type, conf, why, claimer, secondary, conflict, cConf, sum) {
      if (confidenceRank(conf) < confidenceRank(confidence)) {
        return;
      }

      if (
        confidenceRank(conf) === confidenceRank(confidence) &&
        platform !== "-" &&
        platform !== name
      ) {
        return;
      }

      platform = name;
      trafficType = type;
      confidence = conf;
      primaryClaimer = claimer;
      secondaryClaimers = secondary;
      conflictLevel = conflict;
      reason = why;
      commissionConfidence = cConf;
      summary = sum;
    }

    function safeDecode(value) {
      try {
        return decodeURIComponent(value || "");
      } catch {
        return value || "";
      }
    }

    function normalizeText(v) {
      return String(v || "").trim().toLowerCase();
    }

    function inferPublisherFromText(text) {
      const t = normalizeText(text);

      if (!t) return null;

      const rules = [
        { match: /tomsguide/, publisher: "Tom's Guide", subSite: "Tom's Guide", type: "publisher", confidence: "high" },
        { match: /wirecutter/, publisher: "Wirecutter", subSite: "Wirecutter", type: "publisher", confidence: "high" },
        { match: /forbes/, publisher: "Forbes", subSite: "Forbes", type: "publisher", confidence: "medium" },
        { match: /mattressnerd/, publisher: "Mattress Nerd", subSite: "Mattress Nerd", type: "publisher", confidence: "high" },
        { match: /slickdeals/, publisher: "Slickdeals", subSite: "Slickdeals", type: "publisher", confidence: "high" },
        { match: /cnnunderscored|cnn-underscored/, publisher: "CNN Underscored", subSite: "CNN Underscored", type: "publisher", confidence: "high" },
        { match: /nypost/, publisher: "New York Post", subSite: "New York Post", type: "publisher", confidence: "medium" },
        { match: /businessinsider|insider/, publisher: "Business Insider", subSite: "Business Insider", type: "publisher", confidence: "medium" },
        { match: /futurepublishing|future/, publisher: "Future", subSite: "Future Publishing", type: "publisher", confidence: "medium" },
        { match: /cnet/, publisher: "CNET", subSite: "CNET", type: "publisher", confidence: "high" },
        { match: /pcgamer/, publisher: "PC Gamer", subSite: "PC Gamer", type: "publisher", confidence: "high" },
        { match: /techradar/, publisher: "TechRadar", subSite: "TechRadar", type: "publisher", confidence: "high" }
      ];

      for (const rule of rules) {
        if (rule.match.test(t)) {
          return rule;
        }
      }

      return null;
    }

    function applyPublisherInference(sourceText, sourceLabel) {
      const inferred = inferPublisherFromText(sourceText);
      if (!inferred) return;

      if (
        publisher === "-" ||
        confidenceRank(inferred.confidence) >= confidenceRank(publisherConfidence)
      ) {
        publisher = inferred.publisher;
        subSite = inferred.subSite;
        publisherType = inferred.type;
        publisherConfidence = inferred.confidence;
        addDecision(`Publisher inferred from ${sourceLabel}.`);
      }
    }

    function finalizeCandidateOrdering() {
      platformCandidates.sort((a, b) => b.score - a.score);
    }

    // Basic domain context
    if (host.includes("amazon.")) {
      addTrackingLayer("amazon");
      addCandidate("Amazon", 25, "medium", ["amazon domain"]);
      addDecision("Amazon domain detected.");
    }

    // Capture common parameters when present
    [
      "tag",
      "maas",
      "aa_campaignid",
      "aa_adgroupid",
      "cjevent",
      "irclickid",
      "ranMID",
      "ranEAID",
      "ranSiteID",
      "click_id",
      "awc",
      "source",
      "sv1",
      "sv_campaign_id",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "pb_id",
      "pb_clickid",
      "pb_source",
      "ascsubtag",
      "asc_source",
      "creative",
      "camp",
      "linkCode"
    ].forEach((k) => {
      if (hasParam(k)) parameterSignals[k] = getParam(k);
    });

    // Publisher inference from useful fields
    applyPublisherInference(getParam("tag"), "tag");
    applyPublisherInference(safeDecode(getParam("utm_source")), "utm_source");
    applyPublisherInference(safeDecode(getParam("ascsubtag")), "ascsubtag");
    applyPublisherInference(path, "path");

    // AMAZON ASSOCIATES
    let amazonAssocScore = 0;
    const amazonAssocSignals = [];

    if (host.includes("amazon.")) {
      amazonAssocScore += 15;
      amazonAssocSignals.push("amazon domain");
    }
    if (hasParam("tag")) {
      amazonAssocScore += 70;
      amazonAssocSignals.push("tag");
    }
    if (hasParam("ascsubtag")) {
      amazonAssocScore += 8;
      amazonAssocSignals.push("ascsubtag");
    }
    if (hasParam("linkCode")) {
      amazonAssocScore += 8;
      amazonAssocSignals.push("linkCode");
    }
    if (hasParam("creative")) {
      amazonAssocScore += 5;
      amazonAssocSignals.push("creative");
    }
    if (hasParam("camp")) {
      amazonAssocScore += 5;
      amazonAssocSignals.push("camp");
    }

    if (amazonAssocScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("amazon associates");

      addCandidate(
        "Amazon Associates",
        amazonAssocScore,
        amazonAssocScore >= 70 ? "high" : "medium",
        amazonAssocSignals
      );

      const tagValue = getParam("tag") || "";
      if (tagValue) {
        applyPublisherInference(tagValue, "Amazon tag");
      }

      pickPrimaryPlatform(
        "Amazon Associates",
        "affiliate",
        amazonAssocScore >= 70 ? "high" : "medium",
        "Amazon Associates tag parameter detected.",
        "Publisher",
        ["Amazon"],
        "low",
        amazonAssocScore >= 70 ? "high" : "medium",
        "Amazon affiliate link detected via tag parameter."
      );

      addDecision("Amazon Associates signals found in URL.");
    }

    // AMAZON ATTRIBUTION
    let amazonAttributionScore = 0;
    const amazonAttributionSignals = [];

    if (host.includes("amazon.")) {
      amazonAttributionScore += 10;
      amazonAttributionSignals.push("amazon domain");
    }
    if (hasParam("maas")) {
      amazonAttributionScore += 45;
      amazonAttributionSignals.push("maas");
    }
    if (hasParam("aa_campaignid")) {
      amazonAttributionScore += 35;
      amazonAttributionSignals.push("aa_campaignid");
    }
    if (hasParam("aa_adgroupid")) {
      amazonAttributionScore += 25;
      amazonAttributionSignals.push("aa_adgroupid");
    }

    if (amazonAttributionScore >= 40) {
      addTrackingLayer("amazon attribution");
      addTrackingLayer("ads");

      addCandidate(
        "Amazon Attribution",
        amazonAttributionScore,
        amazonAttributionScore >= 70 ? "high" : "medium",
        amazonAttributionSignals
      );

      const hasAffiliateTagConflict = hasParam("tag");
      if (hasAffiliateTagConflict) {
        addTrackingLayer("conflict");
      }

      pickPrimaryPlatform(
        "Amazon Attribution",
        "paid media",
        amazonAttributionScore >= 70 ? "high" : "medium",
        "Amazon Attribution campaign parameters detected.",
        "Brand / Advertiser",
        hasAffiliateTagConflict ? ["Publisher", "Amazon"] : ["Amazon"],
        hasAffiliateTagConflict ? "medium" : "low",
        amazonAttributionScore >= 70 ? "high" : "medium",
        hasAffiliateTagConflict
          ? "Amazon Attribution detected, with affiliate overlap present."
          : "Amazon Attribution link detected via campaign parameters."
      );

      addDecision("Amazon Attribution signals found in URL.");
      if (hasAffiliateTagConflict) {
        addDecision("Affiliate tag and Amazon Attribution parameters coexist.");
      }
    }

    // AWIN
    let awinScore = 0;
    const awinSignals = [];

    if (hasParam("awc")) {
      awinScore += 55;
      awinSignals.push("awc");
    }
    if (hasParam("click_id")) {
      awinScore += 20;
      awinSignals.push("click_id");
    }
    if (normalizeText(getParam("source")) === "aw") {
      awinScore += 20;
      awinSignals.push("source=aw");
    }
    if (hasParam("sv1")) {
      awinScore += 10;
      awinSignals.push("sv1");
    }
    if (hasParam("sv_campaign_id")) {
      awinScore += 22;
      awinSignals.push("sv_campaign_id");
    }
    if (normalizeText(getParam("utm_medium")) === "affiliate") {
      awinScore += 8;
      awinSignals.push("utm_medium=affiliate");
    }
    if (normalizeText(safeDecode(getParam("utm_source"))).includes("awin")) {
      awinScore += 20;
      awinSignals.push("utm_source=awin");
    }

    if (awinScore >= 35) {
      addTrackingLayer("affiliate");
      addTrackingLayer("awin");

      addCandidate(
        "Awin",
        awinScore,
        awinScore >= 65 ? "high" : "medium",
        awinSignals
      );

      pickPrimaryPlatform(
        "Awin",
        "affiliate",
        awinScore >= 65 ? "high" : "medium",
        "Awin affiliate tracking parameters detected.",
        "Publisher",
        [],
        "low",
        awinScore >= 65 ? "high" : "medium",
        "Awin affiliate tracking detected."
      );

      addDecision("Awin signals found in URL parameters.");
      applyPublisherInference(safeDecode(getParam("utm_source")), "Awin utm_source");
    }

    // CJ
    let cjScore = 0;
    const cjSignals = [];

    if (hasParam("cjevent")) {
      cjScore += 75;
      cjSignals.push("cjevent");
    }
    if (normalizeText(getParam("utm_medium")) === "affiliate") {
      cjScore += 5;
      cjSignals.push("utm_medium=affiliate");
    }

    if (cjScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("cj");

      addCandidate(
        "CJ Affiliate",
        cjScore,
        cjScore >= 70 ? "high" : "medium",
        cjSignals
      );

      pickPrimaryPlatform(
        "CJ Affiliate",
        "affiliate",
        cjScore >= 70 ? "high" : "medium",
        "CJ click tracking parameter detected.",
        "Publisher",
        [],
        "low",
        cjScore >= 70 ? "high" : "medium",
        "CJ affiliate tracking detected."
      );

      addDecision("cjevent parameter found in URL.");
    }

    // IMPACT
    let impactScore = 0;
    const impactSignals = [];

    if (hasParam("irclickid")) {
      impactScore += 78;
      impactSignals.push("irclickid");
    }
    if (normalizeText(getParam("utm_medium")) === "affiliate") {
      impactScore += 5;
      impactSignals.push("utm_medium=affiliate");
    }

    if (impactScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("impact");

      addCandidate(
        "Impact",
        impactScore,
        impactScore >= 70 ? "high" : "medium",
        impactSignals
      );

      pickPrimaryPlatform(
        "Impact",
        "affiliate",
        impactScore >= 70 ? "high" : "medium",
        "Impact click tracking parameter detected.",
        "Publisher",
        [],
        "low",
        impactScore >= 70 ? "high" : "medium",
        "Impact affiliate tracking detected."
      );

      addDecision("irclickid parameter found in URL.");
    }

    // RAKUTEN
    let rakutenScore = 0;
    const rakutenSignals = [];

    if (hasParam("ranMID")) {
      rakutenScore += 28;
      rakutenSignals.push("ranMID");
    }
    if (hasParam("ranEAID")) {
      rakutenScore += 28;
      rakutenSignals.push("ranEAID");
    }
    if (hasParam("ranSiteID")) {
      rakutenScore += 28;
      rakutenSignals.push("ranSiteID");
    }

    if (rakutenScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("rakuten");

      addCandidate(
        "Rakuten",
        rakutenScore,
        rakutenScore >= 70 ? "high" : "medium",
        rakutenSignals
      );

      pickPrimaryPlatform(
        "Rakuten",
        "affiliate",
        rakutenScore >= 70 ? "high" : "medium",
        "Rakuten tracking parameters detected.",
        "Publisher",
        [],
        "low",
        rakutenScore >= 70 ? "high" : "medium",
        "Rakuten affiliate tracking detected."
      );

      addDecision("Rakuten tracking parameters found in URL.");
    }

    // PARTNERBOOST
    let partnerBoostScore = 0;
    const partnerBoostSignals = [];

    if (hasParam("pb_id")) {
      partnerBoostScore += 30;
      partnerBoostSignals.push("pb_id");
    }
    if (hasParam("pb_clickid")) {
      partnerBoostScore += 35;
      partnerBoostSignals.push("pb_clickid");
    }
    if (hasParam("pb_source")) {
      partnerBoostScore += 20;
      partnerBoostSignals.push("pb_source");
    }

    if (partnerBoostScore >= 35) {
      addTrackingLayer("affiliate");
      addTrackingLayer("partnerboost");

      addCandidate(
        "PartnerBoost",
        partnerBoostScore,
        partnerBoostScore >= 65 ? "high" : "medium",
        partnerBoostSignals
      );

      pickPrimaryPlatform(
        "PartnerBoost",
        "affiliate",
        partnerBoostScore >= 65 ? "high" : "medium",
        "PartnerBoost parameters detected.",
        "Publisher / Creator",
        [],
        "low",
        partnerBoostScore >= 65 ? "high" : "medium",
        "PartnerBoost affiliate tracking detected."
      );

      addDecision("PartnerBoost parameters found in URL.");
    }

    // GENERIC AFFILIATE HINTS
    if (platform === "-" && normalizeText(getParam("utm_medium")) === "affiliate") {
      trafficType = "affiliate";
      confidence = "medium";
      addTrackingLayer("affiliate");
      addDecision("utm_medium=affiliate suggests affiliate traffic.");
      summary = "Affiliate-like traffic detected, but network confidence is limited.";
    }

    // If generic affiliate source suggests a publisher and none is set
    if (publisher === "-") {
      applyPublisherInference(safeDecode(getParam("utm_source")), "utm_source");
      applyPublisherInference(safeDecode(getParam("ascsubtag")), "ascsubtag");
    }

    // Fallback publisher if tag exists but no mapping found
    if (publisher === "-" && hasParam("tag")) {
      publisher = getParam("tag") || "-";
      subSite = "-";
      publisherType = "publisher";
      publisherConfidence = "medium";
      addDecision("Publisher inferred from raw tag value.");
    }

    // Extra overlap/conflict handling
    const affiliatePlatforms = ["Amazon Associates", "Awin", "CJ Affiliate", "Impact", "Rakuten", "PartnerBoost"];
    const hasAffiliatePrimary = affiliatePlatforms.includes(platform);
    const hasPaidSignal = amazonAttributionScore >= 40;

    if (hasAffiliatePrimary && hasPaidSignal) {
      conflictLevel = "medium";
      addTrackingLayer("conflict");
      addDecision("Affiliate and paid media signals coexist.");
    }

    if (platform === "-" && platformCandidates.length > 0) {
      const top = [...platformCandidates].sort((a, b) => b.score - a.score)[0];
      platform = top.name;
      confidence = top.confidence;
      trafficType = "affiliate";
      primaryClaimer = "Publisher";
      commissionConfidence = top.confidence;
      reason = "Top platform candidate selected from weighted URL signals.";
      summary = `${top.name} appears most likely based on detected URL parameters.`;
      addDecision("Primary platform inferred from top weighted candidate.");
    }

    if (platform === "-" && trafficType === "unknown") {
      trafficType = "unknown";
      confidence = "low";
      summary = "No strong attribution or affiliate platform signal detected.";
    }

    finalizeCandidateOrdering();

    return res.status(200).json({
      primary_platform: { name: platform },
      traffic_type: trafficType,
      confidence,
      publisher: {
        publisher,
        sub_site: subSite,
        type: publisherType,
        confidence: publisherConfidence
      },
      commission_engine: {
        primary_claimer: primaryClaimer,
        secondary_claimers: secondaryClaimers,
        conflict_level: conflictLevel,
        reason,
        confidence: commissionConfidence,
        decision_basis: decisionBasis
      },
      tracking_layers: trackingLayers,
      parameter_signals: parameterSignals,
      platform_candidates: platformCandidates,
      summary
    });
  } catch (error) {
    console.error("analyze error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};
