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

    function addParamSignal(key) {
      if (params.has(key)) {
        parameterSignals[key] = params.get(key);
        return true;
      }
      return false;
    }

    if (host.includes("amazon.com")) {
      platformCandidates.push({
        name: "Amazon",
        confidence: "medium",
        score: 50,
        signals: ["amazon domain"]
      });
      decisionBasis.push("Amazon domain detected.");
      trackingLayers.push("amazon");
    }

    if (addParamSignal("tag")) {
      platform = "Amazon Associates";
      trafficType = "affiliate";
      confidence = "high";

      trackingLayers.push("affiliate");
      trackingLayers.push("amazon associates");

      platformCandidates.push({
        name: "Amazon Associates",
        confidence: "high",
        score: 95,
        signals: ["tag"]
      });

      const tagValue = params.get("tag") || "";
      primaryClaimer = "Publisher";
      secondaryClaimers = ["Amazon"];
      reason = "Amazon Associates tag parameter detected.";
      commissionConfidence = "high";
      summary = "Amazon affiliate link detected via tag parameter.";
      decisionBasis.push("Amazon Associates tag parameter found in URL.");

      conflictLevel = "low";

      if (/tomsguide/i.test(tagValue)) {
        publisher = "Tom's Guide";
        subSite = "Tom's Guide";
        publisherType = "publisher";
        publisherConfidence = "high";
        decisionBasis.push("Tag value suggests Tom's Guide publisher mapping.");
      } else if (/wirecutter/i.test(tagValue)) {
        publisher = "Wirecutter";
        subSite = "Wirecutter";
        publisherType = "publisher";
        publisherConfidence = "high";
        decisionBasis.push("Tag value suggests Wirecutter publisher mapping.");
      } else if (/forbes/i.test(tagValue)) {
        publisher = "Forbes";
        subSite = "Forbes";
        publisherType = "publisher";
        publisherConfidence = "medium";
        decisionBasis.push("Tag value suggests Forbes publisher mapping.");
      } else {
        publisher = tagValue || "Unknown Publisher";
        subSite = "-";
        publisherType = "publisher";
        publisherConfidence = "medium";
        decisionBasis.push("Publisher inferred from Amazon tag value.");
      }
    }

    if (addParamSignal("maas") || addParamSignal("aa_campaignid") || addParamSignal("aa_adgroupid")) {
      platform = "Amazon Attribution";
      trafficType = "paid media";
      confidence = "high";

      trackingLayers.push("amazon attribution");
      trackingLayers.push("ads");

      platformCandidates.push({
        name: "Amazon Attribution",
        confidence: "high",
        score: 96,
        signals: ["maas", "aa_campaignid", "aa_adgroupid"]
      });

      primaryClaimer = "Brand / Advertiser";
      secondaryClaimers = ["Amazon"];
      conflictLevel = params.has("tag") ? "medium" : "low";
      reason = "Amazon Attribution parameters detected.";
      commissionConfidence = "high";
      summary = "Amazon Attribution link detected via campaign parameters.";
      decisionBasis.push("Amazon Attribution campaign parameters found in URL.");

      if (params.has("tag")) {
        decisionBasis.push("Affiliate tag and Amazon Attribution parameters coexist.");
        trackingLayers.push("conflict");
      }
    }

    if (addParamSignal("cjevent")) {
      platform = "CJ Affiliate";
      trafficType = "affiliate";
      confidence = "high";

      trackingLayers.push("affiliate");
      trackingLayers.push("cj");

      platformCandidates.push({
        name: "CJ Affiliate",
        confidence: "high",
        score: 92,
        signals: ["cjevent"]
      });

      primaryClaimer = "Publisher";
      secondaryClaimers = [];
      conflictLevel = "low";
      reason = "CJ click tracking parameter detected.";
      commissionConfidence = "high";
      summary = "CJ affiliate tracking detected.";
      decisionBasis.push("cjevent parameter found in URL.");
    }

    if (addParamSignal("irclickid")) {
      platform = "Impact";
      trafficType = "affiliate";
      confidence = "high";

      trackingLayers.push("affiliate");
      trackingLayers.push("impact");

      platformCandidates.push({
        name: "Impact",
        confidence: "high",
        score: 92,
        signals: ["irclickid"]
      });

      primaryClaimer = "Publisher";
      secondaryClaimers = [];
      conflictLevel = "low";
      reason = "Impact click tracking parameter detected.";
      commissionConfidence = "high";
      summary = "Impact affiliate tracking detected.";
      decisionBasis.push("irclickid parameter found in URL.");
    }

    if (addParamSignal("ranMID") || addParamSignal("ranEAID") || addParamSignal("ranSiteID")) {
      platform = "Rakuten";
      trafficType = "affiliate";
      confidence = "high";

      trackingLayers.push("affiliate");
      trackingLayers.push("rakuten");

      platformCandidates.push({
        name: "Rakuten",
        confidence: "high",
        score: 92,
        signals: ["ranMID", "ranEAID", "ranSiteID"]
      });

      primaryClaimer = "Publisher";
      secondaryClaimers = [];
      conflictLevel = "low";
      reason = "Rakuten tracking parameters detected.";
      commissionConfidence = "high";
      summary = "Rakuten affiliate tracking detected.";
      decisionBasis.push("Rakuten tracking parameters found in URL.");
    }

    if (addParamSignal("click_id")) {
      platformCandidates.push({
        name: "Awin",
        confidence: "medium",
        score: 75,
        signals: ["click_id"]
      });
      trackingLayers.push("affiliate");
      trackingLayers.push("awin");
      decisionBasis.push("click_id detected; may indicate Awin or another affiliate network.");
      if (platform === "-") {
        platform = "Awin";
        trafficType = "affiliate";
        confidence = "medium";
        primaryClaimer = "Publisher";
        reason = "click_id tracking parameter detected.";
        commissionConfidence = "medium";
        summary = "Likely affiliate tracking detected via click_id.";
      }
    }

    if (addParamSignal("pb_id") || addParamSignal("pb_clickid") || addParamSignal("pb_source")) {
      platform = "PartnerBoost";
      trafficType = "affiliate";
      confidence = "high";

      trackingLayers.push("affiliate");
      trackingLayers.push("partnerboost");

      platformCandidates.push({
        name: "PartnerBoost",
        confidence: "high",
        score: 92,
        signals: ["pb_id", "pb_clickid", "pb_source"]
      });

      primaryClaimer = "Publisher / Creator";
      secondaryClaimers = [];
      conflictLevel = "low";
      reason = "PartnerBoost parameters detected.";
      commissionConfidence = "high";
      summary = "PartnerBoost affiliate tracking detected.";
      decisionBasis.push("PartnerBoost parameters found in URL.");
    }

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
