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

    const host = (parsed.hostname || "").toLowerCase();
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
    let summary = "No strong attribution or affiliate platform signal detected.";

    function getParam(key) {
      return params.get(key);
    }

    function hasParam(key) {
      return params.has(key);
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

    function confidenceRank(v) {
      if (v === "high") return 3;
      if (v === "medium") return 2;
      return 1;
    }

    function addTrackingLayer(value) {
      if (value && !trackingLayers.includes(value)) {
        trackingLayers.push(value);
      }
    }

    function addDecision(value) {
      if (value && !decisionBasis.includes(value)) {
        decisionBasis.push(value);
      }
    }

    function captureParam(key) {
      if (hasParam(key)) {
        parameterSignals[key] = getParam(key);
        return true;
      }
      return false;
    }

    function addCandidate(name, score, confidenceLevel, signals) {
      const existing = platformCandidates.find((x) => x.name === name);

      if (!existing) {
        platformCandidates.push({
          name,
          confidence: confidenceLevel,
          score,
          signals: [...new Set(signals || [])]
        });
        return;
      }

      if (score > existing.score) existing.score = score;
      if (confidenceRank(confidenceLevel) > confidenceRank(existing.confidence)) {
        existing.confidence = confidenceLevel;
      }
      existing.signals = [...new Set([...(existing.signals || []), ...(signals || [])])];
    }

    function pickPrimaryPlatform(
      name,
      type,
      conf,
      why,
      claimer,
      secondary,
      conflict,
      cConf,
      sum
    ) {
      const incomingRank = confidenceRank(conf);
      const currentRank = confidenceRank(confidence);

      if (incomingRank < currentRank) return;

      if (incomingRank === currentRank && platform !== "-" && platform !== name) {
        return;
      }

      platform = name;
      trafficType = type;
      confidence = conf;
      primaryClaimer = claimer;
      secondaryClaimers = Array.isArray(secondary) ? secondary : [];
      conflictLevel = conflict;
      reason = why;
      commissionConfidence = cConf;
      summary = sum;
    }

    function finalizeCandidateOrdering() {
      platformCandidates.sort((a, b) => b.score - a.score);
    }

    function classifyScore(score) {
      if (score >= 70) return "high";
      if (score >= 40) return "medium";
      return "low";
    }

    function hasAnyParam(keys) {
      return keys.some((k) => hasParam(k));
    }

    function valueContains(key, fragments) {
      const value = normalizeText(getParam(key));
      if (!value) return false;
      return fragments.some((f) => value.includes(normalizeText(f)));
    }

    function isAmazonHost() {
      return /(^|\.)amazon\./i.test(host);
    }

    function isAffiliateLikeMedium() {
      const medium = normalizeText(getParam("utm_medium"));
      return ["affiliate", "aff", "partner", "publisher", "influencer"].includes(medium);
    }

    function isPaidLikeMedium() {
      const medium = normalizeText(getParam("utm_medium"));
      return [
        "cpc",
        "ppc",
        "paid",
        "paid_social",
        "display",
        "retargeting",
        "remarketing",
        "social_paid"
      ].includes(medium);
    }

    function isAffiliateDomainHint() {
      const affiliateHosts = [
        "linksynergy.com",
        "awin1.com",
        "awin.com",
        "impact.com",
        "impactradius.com",
        "pjatr.com",
        "partnerize.com",
        "skimresources.com",
        "viglink.com",
        "sovrn.com",
        "shareasale.com",
        "webgains.com",
        "rakutenadvertising.com",
        "doubleclick.net"
      ];
      return affiliateHosts.some((d) => host.includes(d));
    }

    function isAwinStyleClickId(value) {
      const v = String(value || "").trim();
      if (!v) return false;
      return /^\d{3,}l[A-Za-z0-9]+$/.test(v);
    }

    function isPartnerizeStyleClickRef(value) {
      const v = String(value || "").trim();
      if (!v) return false;
      return /^\d{3,}l[A-Za-z0-9]+$/.test(v);
    }

    function inferPublisherFromText(text) {
      const t = normalizeText(text);
      if (!t) return null;

      const rules = [
        { match: /cnetcommerce/, publisher: "CNET", subSite: "CNET Commerce", type: "publisher", confidence: "high" },
        { match: /mattressnrd|mattressnerd/, publisher: "Mattress Nerd", subSite: "Mattress Nerd", type: "publisher", confidence: "high" },
        { match: /mattressadvisor|mattress advisor/, publisher: "Mattress Advisor", subSite: "Mattress Advisor", type: "publisher", confidence: "high" },
        { match: /sleepfoundation|sleep foundation/, publisher: "Sleep Foundation", subSite: "Sleep Foundation", type: "publisher", confidence: "high" },
        { match: /tomsguide/, publisher: "Tom's Guide", subSite: "Tom's Guide", type: "publisher", confidence: "high" },
        { match: /wirecutter/, publisher: "Wirecutter", subSite: "Wirecutter", type: "publisher", confidence: "high" },
        { match: /forbes/, publisher: "Forbes", subSite: "Forbes", type: "publisher", confidence: "medium" },
        { match: /slickdeals/, publisher: "Slickdeals", subSite: "Slickdeals", type: "deal site", confidence: "high" },
        { match: /cnnunderscored|cnn-underscored/, publisher: "CNN Underscored", subSite: "CNN Underscored", type: "publisher", confidence: "high" },
        { match: /businessinsider|insider/, publisher: "Business Insider", subSite: "Business Insider", type: "publisher", confidence: "medium" },
        { match: /futurepublishing|future/, publisher: "Future", subSite: "Future Publishing", type: "publisher", confidence: "medium" },
        { match: /cnet/, publisher: "CNET", subSite: "CNET", type: "publisher", confidence: "high" },
        { match: /pcgamer/, publisher: "PC Gamer", subSite: "PC Gamer", type: "publisher", confidence: "high" },
        { match: /techradar/, publisher: "TechRadar", subSite: "TechRadar", type: "publisher", confidence: "high" },
        { match: /newsweek/, publisher: "Newsweek", subSite: "Newsweek", type: "publisher", confidence: "medium" },
        { match: /usatoday/, publisher: "USA Today", subSite: "USA Today", type: "publisher", confidence: "medium" },
        { match: /reviewed/, publisher: "Reviewed", subSite: "Reviewed", type: "publisher", confidence: "medium" }
      ];

      for (const rule of rules) {
        if (rule.match.test(t)) return rule;
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

    function setFallbackPublisherFromRaw(value, label, conf = "medium") {
      const raw = String(value || "").trim();
      if (!raw || raw === "-" || publisher !== "-") return;
      publisher = raw;
      subSite = "-";
      publisherType = "publisher";
      publisherConfidence = conf;
      addDecision(`Publisher inferred from raw ${label} value.`);
    }

    function isKnownAffiliatePublisher() {
      return [
        "Mattress Nerd",
        "Mattress Advisor",
        "Sleep Foundation",
        "Tom's Guide",
        "Wirecutter",
        "Slickdeals",
        "CNN Underscored",
        "Business Insider",
        "Future",
        "CNET",
        "PC Gamer",
        "TechRadar",
        "Reviewed"
      ].includes(publisher);
    }

    [
      "tag",
      "maas",
      "ref_",
      "aa_campaignid",
      "aa_adgroupid",
      "aa_creativeid",
      "cjevent",
      "irclickid",
      "irgwc",
      "CIDIMP",
      "cidimp",
      "afsrc",
      "ranMID",
      "ranEAID",
      "ranSiteID",
      "click_id",
      "clickref",
      "awc",
      "source",
      "sv1",
      "sv_campaign_id",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "pb_id",
      "pb_clickid",
      "pb_source",
      "ascsubtag",
      "asc_source",
      "creative",
      "camp",
      "linkCode",
      "gclid",
      "gbraid",
      "wbraid",
      "gad_campaignid",
      "fbclid",
      "ttclid",
      "msclkid",
      "pid",
      "sid",
      "subid",
      "sub_id",
      "affiliate_id",
      "aff_id",
      "affid",
      "aff",
      "partner_id",
      "partner",
      "campaignId",
      "linkId",
      "admitad_uid",
      "vglnk",
      "vgtid",
      "skimlinks",
      "sclid",
      "epik",
      "mkwid",
      "tw_source",
      "tw_adid",
      "tw_campaign",
      "coupon",
      "pjID",
      "pjMID"
    ].forEach(captureParam);

    if (isAmazonHost()) {
      addTrackingLayer("amazon");
      addCandidate("Amazon", 25, "medium", ["amazon domain"]);
      addDecision("Amazon domain detected.");
    }

    if (isAffiliateDomainHint()) {
      addTrackingLayer("affiliate");
      addDecision("Affiliate-network-like redirect or tracking host detected.");
    }

    applyPublisherInference(getParam("tag"), "tag");
    applyPublisherInference(safeDecode(getParam("utm_source")), "utm_source");
    applyPublisherInference(safeDecode(getParam("utm_campaign")), "utm_campaign");
    applyPublisherInference(safeDecode(getParam("utm_content")), "utm_content");
    applyPublisherInference(safeDecode(getParam("ascsubtag")), "ascsubtag");
    applyPublisherInference(path, "path");

    // AMAZON ASSOCIATES
    let amazonAssocScore = 0;
    const amazonAssocSignals = [];

    if (isAmazonHost()) {
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
    if (valueContains("linkCode", ["ur2", "sl1", "ll1", "oas", "as2"])) {
      amazonAssocScore += 10;
      amazonAssocSignals.push("linkCode affiliate format");
    }

    if (amazonAssocScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("amazon associates");

      const conf = classifyScore(amazonAssocScore);
      addCandidate("Amazon Associates", amazonAssocScore, conf, amazonAssocSignals);

      if (getParam("tag")) {
        applyPublisherInference(getParam("tag"), "Amazon tag");
        setFallbackPublisherFromRaw(getParam("tag"), "tag");
      }

      pickPrimaryPlatform(
        "Amazon Associates",
        "affiliate",
        conf,
        "Amazon Associates tag parameter detected.",
        "Publisher",
        ["Amazon"],
        "low",
        conf,
        "Amazon affiliate link detected via tag parameter."
      );

      addDecision("Amazon Associates signals found in URL.");
    }

    // AMAZON ATTRIBUTION
    let amazonAttributionScore = 0;
    const amazonAttributionSignals = [];

    if (isAmazonHost()) {
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
    if (hasParam("aa_creativeid")) {
      amazonAttributionScore += 18;
      amazonAttributionSignals.push("aa_creativeid");
    }
    if (valueContains("ref_", ["aa_maas"])) {
      amazonAttributionScore += 18;
      amazonAttributionSignals.push("ref_=aa_maas");
    }

    if (amazonAttributionScore >= 40) {
      addTrackingLayer("amazon attribution");
      addTrackingLayer("ads");

      const conf = classifyScore(amazonAttributionScore);
      addCandidate("Amazon Attribution", amazonAttributionScore, conf, amazonAttributionSignals);

      const hasAffiliateTagConflict = hasParam("tag");
      const hasCreatorConflict = hasAnyParam(["campaignId", "linkId"]) || valueContains("linkCode", ["tr1"]);

      if (hasAffiliateTagConflict || hasCreatorConflict) {
        addTrackingLayer("conflict");
      }

      pickPrimaryPlatform(
        "Amazon Attribution",
        "paid media",
        conf,
        "Amazon Attribution campaign parameters detected.",
        "Brand / Advertiser",
        [
          ...(hasAffiliateTagConflict ? ["Publisher"] : []),
          ...(hasCreatorConflict ? ["Creator / Publisher"] : []),
          "Amazon"
        ],
        hasAffiliateTagConflict || hasCreatorConflict ? "medium" : "low",
        conf,
        hasAffiliateTagConflict || hasCreatorConflict
          ? "Amazon Attribution detected, with affiliate overlap present."
          : "Amazon Attribution link detected via campaign parameters."
      );

      addDecision("Amazon Attribution signals found in URL.");
      if (hasAffiliateTagConflict) {
        addDecision("Affiliate tag and Amazon Attribution parameters coexist.");
      }
      if (hasCreatorConflict) {
        addDecision("Creator-style Amazon parameters overlap with Attribution signals.");
      }
    }

    // AMAZON CREATOR CONNECTIONS / CREATOR-LIKE AMAZON
    let amazonCreatorScore = 0;
    const amazonCreatorSignals = [];

    if (isAmazonHost()) {
      amazonCreatorScore += 10;
      amazonCreatorSignals.push("amazon domain");
    }
    if (hasParam("campaignId")) {
      amazonCreatorScore += 35;
      amazonCreatorSignals.push("campaignId");
    }
    if (hasParam("linkId")) {
      amazonCreatorScore += 28;
      amazonCreatorSignals.push("linkId");
    }
    if (valueContains("linkCode", ["tr1"])) {
      amazonCreatorScore += 18;
      amazonCreatorSignals.push("linkCode=tr1");
    }
    if (hasParam("tag")) {
      amazonCreatorScore += 8;
      amazonCreatorSignals.push("tag");
    }
    if (hasParam("ascsubtag")) {
      amazonCreatorScore += 6;
      amazonCreatorSignals.push("ascsubtag");
    }

    if (amazonCreatorScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("creator");
      addTrackingLayer("amazon creator");

      const conf = classifyScore(amazonCreatorScore);
      addCandidate("Amazon Creator Connections", amazonCreatorScore, conf, amazonCreatorSignals);

      pickPrimaryPlatform(
        "Amazon Creator Connections",
        "affiliate",
        conf,
        "Creator-style Amazon campaign parameters detected.",
        "Creator / Publisher",
        hasParam("tag") ? ["Amazon Associates", "Amazon"] : ["Amazon"],
        hasParam("tag") ? "medium" : "low",
        conf,
        hasParam("tag")
          ? "Amazon creator-style link detected, with Associates overlap present."
          : "Amazon creator-style affiliate link detected."
      );

      addDecision("Amazon creator-style parameters found in URL.");
    }

    // IMPACT
    let impactScore = 0;
    const impactSignals = [];

    if (hasParam("irclickid")) {
      impactScore += 78;
      impactSignals.push("irclickid");
    }
    if (hasParam("CIDIMP") || hasParam("cidimp")) {
      impactScore += 52;
      impactSignals.push(hasParam("CIDIMP") ? "CIDIMP" : "cidimp");
    }
    if (hasParam("irgwc")) {
      impactScore += 26;
      impactSignals.push("irgwc");
    }
    if (hasParam("afsrc")) {
      impactScore += 18;
      impactSignals.push("afsrc");
    }
    if (isAffiliateLikeMedium()) {
      impactScore += 10;
      impactSignals.push("utm_medium=affiliate/aff");
    }
    if (valueContains("utm_campaign", ["impact"])) {
      impactScore += 18;
      impactSignals.push("utm_campaign=impact");
    }
    if (valueContains("utm_source", ["impact"])) {
      impactScore += 15;
      impactSignals.push("utm_source=impact");
    }
    if (valueContains("utm_content", ["impact"])) {
      impactScore += 10;
      impactSignals.push("utm_content=impact");
    }
    if (valueContains("utm_source", ["mn_", "mattressadvisor", "mattress advisor"])) {
      impactScore += 10;
      impactSignals.push("publisher-like utm_source");
    }

    if (impactScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("impact");

      const conf = classifyScore(impactScore);
      addCandidate("Impact", impactScore, conf, impactSignals);

      pickPrimaryPlatform(
        "Impact",
        "affiliate",
        conf,
        "Impact tracking parameters detected.",
        "Publisher",
        [],
        "low",
        conf,
        "Impact affiliate tracking detected."
      );

      addDecision("Impact signals found in URL parameters.");
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

      if (isAwinStyleClickId(getParam("click_id"))) {
        awinScore += 14;
        awinSignals.push("awin-style click_id pattern");
      }
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

    if (isAffiliateLikeMedium()) {
      awinScore += 8;
      awinSignals.push("utm_medium=affiliate/aff");
    }

    if (valueContains("utm_source", ["awin"])) {
      awinScore += 20;
      awinSignals.push("utm_source=awin");
    }

    if (publisher === "Mattress Nerd") {
      awinScore += 8;
      awinSignals.push("publisher=Mattress Nerd");
    }

    if (publisher === "Mattress Advisor") {
      awinScore += 6;
      awinSignals.push("publisher=Mattress Advisor");
    }

    if (isKnownAffiliatePublisher() && hasParam("click_id")) {
      awinScore += 6;
      awinSignals.push("publisher + click_id affiliate context");
    }

    if (awinScore >= 35) {
      addTrackingLayer("affiliate");
      addTrackingLayer("awin");

      const conf = classifyScore(awinScore);
      addCandidate("Awin", awinScore, conf, awinSignals);

      pickPrimaryPlatform(
        "Awin",
        "affiliate",
        conf,
        "Awin affiliate tracking parameters detected.",
        "Publisher",
        [],
        "low",
        conf,
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
    if (isAffiliateLikeMedium()) {
      cjScore += 5;
      cjSignals.push("utm_medium=affiliate/aff");
    }

    if (cjScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("cj");

      const conf = classifyScore(cjScore);
      addCandidate("CJ Affiliate", cjScore, conf, cjSignals);

      pickPrimaryPlatform(
        "CJ Affiliate",
        "affiliate",
        conf,
        "CJ click tracking parameter detected.",
        "Publisher",
        [],
        "low",
        conf,
        "CJ affiliate tracking detected."
      );

      addDecision("cjevent parameter found in URL.");
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

      const conf = classifyScore(rakutenScore);
      addCandidate("Rakuten", rakutenScore, conf, rakutenSignals);

      pickPrimaryPlatform(
        "Rakuten",
        "affiliate",
        conf,
        "Rakuten tracking parameters detected.",
        "Publisher",
        [],
        "low",
        conf,
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

      const conf = classifyScore(partnerBoostScore);
      addCandidate("PartnerBoost", partnerBoostScore, conf, partnerBoostSignals);

      pickPrimaryPlatform(
        "PartnerBoost",
        "affiliate",
        conf,
        "PartnerBoost parameters detected.",
        "Publisher / Creator",
        [],
        "low",
        conf,
        "PartnerBoost affiliate tracking detected."
      );

      addDecision("PartnerBoost parameters found in URL.");
    }

    // SHAREASALE
    let shareASaleScore = 0;
    const shareASaleSignals = [];

    if (hasParam("afftrack")) {
      shareASaleScore += 40;
      shareASaleSignals.push("afftrack");
    }
    if (hasParam("sscid")) {
      shareASaleScore += 35;
      shareASaleSignals.push("sscid");
    }
    if (host.includes("shareasale")) {
      shareASaleScore += 35;
      shareASaleSignals.push("shareasale host");
    }

    if (shareASaleScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("shareasale");

      const conf = classifyScore(shareASaleScore);
      addCandidate("ShareASale", shareASaleScore, conf, shareASaleSignals);

      pickPrimaryPlatform(
        "ShareASale",
        "affiliate",
        conf,
        "ShareASale signals detected.",
        "Publisher",
        [],
        "low",
        conf,
        "ShareASale affiliate tracking detected."
      );

      addDecision("ShareASale signals found in URL.");
    }

    // SKIMLINKS / SOVRN
    let skimScore = 0;
    const skimSignals = [];

    if (hasParam("skimlinks")) {
      skimScore += 45;
      skimSignals.push("skimlinks");
    }
    if (hasParam("sclid")) {
      skimScore += 28;
      skimSignals.push("sclid");
    }
    if (hasParam("vc") || hasParam("v")) {
      skimScore += 8;
      skimSignals.push("skim-style short params");
    }
    if (hasAnyParam(["vglnk", "vgtid"])) {
      skimScore += 45;
      skimSignals.push(hasParam("vglnk") ? "vglnk" : "vgtid");
    }
    if (valueContains("utm_source", ["skimlinks", "sovrn", "viglink"])) {
      skimScore += 22;
      skimSignals.push("utm_source=skimlinks/sovrn/viglink");
    }

    if (skimScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("content commerce");

      const networkName = hasAnyParam(["vglnk", "vgtid"]) || valueContains("utm_source", ["sovrn", "viglink"])
        ? "Sovrn / VigLink"
        : "Skimlinks";

      const conf = classifyScore(skimScore);
      addCandidate(networkName, skimScore, conf, skimSignals);

      pickPrimaryPlatform(
        networkName,
        "affiliate",
        conf,
        `${networkName} parameters detected.`,
        "Publisher",
        [],
        "low",
        conf,
        `${networkName} affiliate tracking detected.`
      );

      addDecision(`${networkName} signals found in URL.`);
    }

    // FLEXOFFERS
    let flexOffersScore = 0;
    const flexOffersSignals = [];

    if (hasParam("faid")) {
      flexOffersScore += 38;
      flexOffersSignals.push("faid");
    }
    if (hasParam("fobs")) {
      flexOffersScore += 32;
      flexOffersSignals.push("fobs");
    }

    if (flexOffersScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("flexoffers");

      const conf = classifyScore(flexOffersScore);
      addCandidate("FlexOffers", flexOffersScore, conf, flexOffersSignals);

      pickPrimaryPlatform(
        "FlexOffers",
        "affiliate",
        conf,
        "FlexOffers parameters detected.",
        "Publisher",
        [],
        "low",
        conf,
        "FlexOffers affiliate tracking detected."
      );

      addDecision("FlexOffers signals found in URL.");
    }

    // PARTNERIZE v2.0.2
    let partnerizeScore = 0;
    const partnerizeSignals = [];

    if (hasParam("pjID")) {
      partnerizeScore += 38;
      partnerizeSignals.push("pjID");
    }

    if (hasParam("pjMID")) {
      partnerizeScore += 34;
      partnerizeSignals.push("pjMID");
    }

    if (hasParam("clickref")) {
      partnerizeScore += 34;
      partnerizeSignals.push("clickref");

      if (isPartnerizeStyleClickRef(getParam("clickref"))) {
        partnerizeScore += 10;
        partnerizeSignals.push("partnerize-style clickref pattern");
      }
    }

    if (host.includes("partnerize")) {
      partnerizeScore += 25;
      partnerizeSignals.push("partnerize host");
    }

    if (valueContains("utm_source", ["partnerize"])) {
      partnerizeScore += 28;
      partnerizeSignals.push("utm_source=partnerize");
    }

    if (isAffiliateLikeMedium()) {
      partnerizeScore += 8;
      partnerizeSignals.push("utm_medium=affiliate/aff");
    }

    if (valueContains("utm_campaign", ["cnet", "cnetcommerce"])) {
      partnerizeScore += 8;
      partnerizeSignals.push("utm_campaign publisher hint");
    }

    if (publisher === "CNET") {
      partnerizeScore += 6;
      partnerizeSignals.push("publisher=CNET");
    }

    if (partnerizeScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("partnerize");

      const conf = classifyScore(partnerizeScore);
      addCandidate("Partnerize", partnerizeScore, conf, partnerizeSignals);

      pickPrimaryPlatform(
        "Partnerize",
        "affiliate",
        conf,
        "Partnerize parameters detected.",
        "Publisher",
        [],
        "low",
        conf,
        "Partnerize affiliate tracking detected."
      );

      addDecision("Partnerize signals found in URL.");
    }

    // ADMITAD
    let admitadScore = 0;
    const admitadSignals = [];

    if (hasParam("admitad_uid")) {
      admitadScore += 60;
      admitadSignals.push("admitad_uid");
    }

    if (admitadScore >= 40) {
      addTrackingLayer("affiliate");
      addTrackingLayer("admitad");

      const conf = classifyScore(admitadScore);
      addCandidate("Admitad", admitadScore, conf, admitadSignals);

      pickPrimaryPlatform(
        "Admitad",
        "affiliate",
        conf,
        "Admitad parameter detected.",
        "Publisher",
        [],
        "low",
        conf,
        "Admitad affiliate tracking detected."
      );

      addDecision("Admitad signals found in URL.");
    }

    // GENERIC PAID SIGNALS
    let genericPaidScore = 0;
    const genericPaidSignals = [];

    if (hasAnyParam(["gclid", "gbraid", "wbraid", "gad_campaignid", "mkwid"])) {
      genericPaidScore += 50;
      genericPaidSignals.push("google ads click params");
    }
    if (hasParam("fbclid")) {
      genericPaidScore += 30;
      genericPaidSignals.push("fbclid");
    }
    if (hasParam("ttclid")) {
      genericPaidScore += 30;
      genericPaidSignals.push("ttclid");
    }
    if (hasParam("msclkid")) {
      genericPaidScore += 30;
      genericPaidSignals.push("msclkid");
    }
    if (isPaidLikeMedium()) {
      genericPaidScore += 15;
      genericPaidSignals.push("utm_medium=paid/cpc/ppc");
    }
    if (valueContains("utm_source", ["google", "facebook", "meta", "tiktok", "bing"])) {
      genericPaidScore += 10;
      genericPaidSignals.push("utm_source paid channel hint");
    }

    if (genericPaidScore >= 35) {
      addTrackingLayer("ads");

      const conf = classifyScore(genericPaidScore);
      addCandidate("Paid Media", genericPaidScore, conf, genericPaidSignals);

      if (platform === "-") {
        pickPrimaryPlatform(
          "Paid Media",
          "paid media",
          conf,
          "Paid-media click identifiers detected.",
          "Brand / Advertiser",
          [],
          "low",
          conf,
          "Paid-media tracking parameters detected."
        );
      }

      addDecision("Generic paid-media signals found in URL.");
    }

    // GENERIC AFFILIATE
    let genericAffiliateScore = 0;
    const genericAffiliateSignals = [];

    if (isAffiliateLikeMedium()) {
      genericAffiliateScore += 18;
      genericAffiliateSignals.push("utm_medium=affiliate/aff");
    }
    if (valueContains("utm_source", ["affiliate", "publisher", "partner"])) {
      genericAffiliateScore += 16;
      genericAffiliateSignals.push("utm_source affiliate hint");
    }
    if (valueContains("utm_campaign", ["affiliate", "partner", "creator"])) {
      genericAffiliateScore += 16;
      genericAffiliateSignals.push("utm_campaign affiliate hint");
    }
    if (hasAnyParam(["aff_id", "affiliate_id", "affid", "aff", "partner_id", "partner", "subid", "sub_id"])) {
      genericAffiliateScore += 20;
      genericAffiliateSignals.push("generic affiliate params");
    }

    if (genericAffiliateScore >= 20) {
      addTrackingLayer("affiliate");
      addCandidate("Generic Affiliate", genericAffiliateScore, "medium", genericAffiliateSignals);

      if (platform === "-") {
        trafficType = "affiliate";
        confidence = "medium";
        primaryClaimer = "Publisher";
        commissionConfidence = "medium";
        reason = "Affiliate-like URL patterns detected, but network confidence is limited.";
        summary = "Affiliate-like traffic detected, but the exact network is not fully confirmed.";
        addDecision("Generic affiliate-like signals found in URL.");
      }
    }

    if (publisher === "-") {
      applyPublisherInference(safeDecode(getParam("utm_source")), "utm_source");
      applyPublisherInference(safeDecode(getParam("utm_content")), "utm_content");
      applyPublisherInference(safeDecode(getParam("utm_campaign")), "utm_campaign");
      applyPublisherInference(safeDecode(getParam("ascsubtag")), "ascsubtag");
    }

    if (publisher === "-" && hasParam("tag")) {
      setFallbackPublisherFromRaw(getParam("tag"), "tag");
    }

    if (publisher === "-" && hasParam("utm_source")) {
      setFallbackPublisherFromRaw(getParam("utm_source"), "utm_source", "low");
    }

    const hasAmazonAssoc = platformCandidates.some((x) => x.name === "Amazon Associates" && x.score >= 40);
    const hasAmazonAttr = platformCandidates.some((x) => x.name === "Amazon Attribution" && x.score >= 40);
    const hasAmazonCreator = platformCandidates.some((x) => x.name === "Amazon Creator Connections" && x.score >= 40);
    const hasPaidMedia = platformCandidates.some((x) => x.name === "Paid Media" && x.score >= 35);

    const affiliatePlatforms = [
      "Amazon Associates",
      "Amazon Creator Connections",
      "Awin",
      "CJ Affiliate",
      "Impact",
      "Rakuten",
      "PartnerBoost",
      "ShareASale",
      "Skimlinks",
      "Sovrn / VigLink",
      "FlexOffers",
      "Partnerize",
      "Admitad",
      "Generic Affiliate"
    ];

    const hasAffiliatePrimary = affiliatePlatforms.includes(platform);

    if (hasAmazonAssoc && hasAmazonAttr) {
      conflictLevel = "medium";
      addTrackingLayer("conflict");
      addDecision("Amazon Associates and Amazon Attribution signals coexist.");
      if (platform === "Amazon Attribution") {
        secondaryClaimers = [...new Set([...(secondaryClaimers || []), "Publisher", "Amazon"])];
      }
    }

    if (hasAmazonAssoc && hasAmazonCreator) {
      conflictLevel = "medium";
      addTrackingLayer("conflict");
      addDecision("Amazon Associates and creator-style Amazon signals coexist.");
    }

    if ((hasAffiliatePrimary || affiliatePlatforms.includes(platform)) && (hasPaidMedia || hasAmazonAttr)) {
      conflictLevel = conflictLevel === "low" ? "medium" : conflictLevel;
      addTrackingLayer("conflict");
      addDecision("Affiliate and paid-media signals coexist.");
    }

    if (platform === "-" && platformCandidates.length > 0) {
      const top = [...platformCandidates].sort((a, b) => b.score - a.score)[0];
      platform = top.name;
      confidence = top.confidence;

      if (top.name === "Paid Media") {
        trafficType = "paid media";
        primaryClaimer = "Brand / Advertiser";
      } else {
        trafficType = "affiliate";
        primaryClaimer = "Publisher";
      }

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
