// lib/inference-engine.js
// BrandShuo Attribution Inference Engine v1

function lower(v) {
  return String(v || "").toLowerCase().trim();
}

function detectTrafficInference({
  url = "",
  hostname = "",
  params = {}
}) {
  const full =
    lower(url) +
    " " +
    lower(hostname) +
    " " +
    JSON.stringify(params).toLowerCase();

  const result = {
    inferred: true,

    publisher: "Unknown Publisher",
    publisher_group: "Unknown Publisher Group",

    traffic_type: "Unknown Traffic",
    channel_role: "Unknown Attribution Role",
    commercial_intent: "Unknown Intent",

    likely_network: "Unknown",
    merchant_type: "Unknown",

    incrementality_risk: "Medium",
    confidence: "Low",

    labels: [],
    evidence: []
  };

  /* =========================
     Affiliate Signals
  ========================= */

  const affiliateSignals = [
    "utm_medium=affiliate",
    "affid",
    "affiliate",
    "subid",
    "clickid",
    "click_id",
    "irclickid",
    "irgwc",
    "cjevent",
    "ranmid",
    "raneaid",
    "ransiteid",
    "awc",
    "pubid",
    "partnerize",
    "pepperjam",
    "impact",
    "rakuten",
    "shareasale",
    "skimlinks",
    "viglink"
  ];

  const hasAffiliateSignal = affiliateSignals.some(s =>
    full.includes(lower(s))
  );

  if (hasAffiliateSignal) {
    result.labels.push("affiliate");

    result.traffic_type = "Affiliate Traffic";
    result.channel_role = "Affiliate Attribution Layer";
    result.commercial_intent = "Commerce / Affiliate Intent";

    result.confidence = "Medium";

    result.evidence.push(
      "Detected affiliate tracking parameters"
    );
  }

  /* =========================
     Editorial Commerce
  ========================= */

  const editorialSignals = [
    "/review",
    "/reviews",
    "/best",
    "/top",
    "/guide",
    "/vs",
    "/comparison",
    "futurepublishing",
    "techradar",
    "tomsguide",
    "pcmag",
    "cnet",
    "wirecutter"
  ];

  const hasEditorialSignal = editorialSignals.some(s =>
    full.includes(lower(s))
  );

  if (hasEditorialSignal) {
    result.labels.push("editorial");

    result.traffic_type = "Editorial Commerce";
    result.channel_role = "Content / Consideration Driver";
    result.commercial_intent = "Product Research Intent";

    result.incrementality_risk = "Low-Medium";
    result.confidence = "Medium-High";

    result.evidence.push(
      "Detected editorial commerce patterns"
    );
  }

  /* =========================
     Coupon / Deal Signals
  ========================= */

  const couponSignals = [
    "coupon",
    "promo",
    "discount",
    "deal",
    "save",
    "slickdeals",
    "cashback",
    "rebate"
  ];

  const hasCouponSignal = couponSignals.some(s =>
    full.includes(lower(s))
  );

  if (hasCouponSignal) {
    result.labels.push("coupon");

    result.traffic_type = "Coupon / Deal Traffic";
    result.channel_role = "Conversion Closer";
    result.commercial_intent = "Discount / Savings Intent";

    result.incrementality_risk = "High";
    result.confidence = "Medium";

    result.evidence.push(
      "Detected coupon / savings intent signals"
    );
  }

  /* =========================
     Paid Ads Signals
  ========================= */

  const paidSignals = [
    "gclid",
    "fbclid",
    "ttclid",
    "msclkid",
    "gad_source",
    "utm_medium=cpc",
    "utm_medium=paid"
  ];

  const hasPaidSignal = paidSignals.some(s =>
    full.includes(lower(s))
  );

  if (hasPaidSignal) {
    result.labels.push("paid-media");

    result.traffic_type = "Paid Media";
    result.channel_role = "Paid Acquisition";
    result.commercial_intent = "Paid Traffic Intent";

    result.incrementality_risk = "Medium";
    result.confidence = "High";

    result.evidence.push(
      "Detected paid advertising click IDs"
    );
  }

  /* =========================
     Marketplace / DTC
  ========================= */

  if (full.includes("amazon.")) {
    result.merchant_type = "Marketplace";
    result.evidence.push("Amazon marketplace detected");
  } else if (
    full.includes("walmart.") ||
    full.includes("ebay.")
  ) {
    result.merchant_type = "Marketplace";
    result.evidence.push("Marketplace domain detected");
  } else {
    result.merchant_type = "DTC";
    result.evidence.push("Direct-to-consumer merchant detected");
  }

  /* =========================
     Network Guess
  ========================= */

  if (full.includes("impact")) {
    result.likely_network = "Impact";
  } else if (full.includes("partnerize")) {
    result.likely_network = "Partnerize";
  } else if (full.includes("rakuten")) {
    result.likely_network = "Rakuten";
  } else if (full.includes("cj")) {
    result.likely_network = "CJ Affiliate";
  } else if (full.includes("awin")) {
    result.likely_network = "Awin";
  }

  return result;
}

module.exports = {
  detectTrafficInference
};
