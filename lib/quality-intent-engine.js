function getParam(params, key) {
  return params && Object.prototype.hasOwnProperty.call(params, key)
    ? params[key]
    : "";
}

function hasAnyParam(params, keys) {
  return keys.some((k) => !!getParam(params, k));
}

function detectTrafficType({ attribution_system, publisher_type, subtype, params }) {
  const hasPaidSignals = hasAnyParam(params, [
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
    "ttclid",
    "msclkid"
  ]);

  if (hasPaidSignals) {
    return "Paid Traffic";
  }

  if (attribution_system === "Amazon Attribution") {
    return "Paid / Attributed Traffic";
  }

  if (publisher_type === "Deal Site" || publisher_type === "Deal Community") {
    return "Deal Traffic";
  }

  if (publisher_type === "Coupon Site") {
    return "Coupon Traffic";
  }

  if (publisher_type === "Editorial Review") {
    return "Review Traffic";
  }

  if (publisher_type === "Creator / Influencer") {
    return "Creator Traffic";
  }

  if (publisher_type === "Forum / Community") {
    return "Community Traffic";
  }

  if (publisher_type === "Advertiser") {
    return "Owned / Brand Traffic";
  }

  if (publisher_type === "Affiliate Publisher") {
    return "Affiliate Traffic";
  }

  if (subtype && String(subtype).toLowerCase().includes("deal")) {
    return "Deal Traffic";
  }

  return "Unknown";
}

function detectCommercialIntent({ traffic_type, publisher_type, subtype, params }) {
  let score = 50;
  let reason = "No extra commercial intent signals surfaced.";

  const allText = Object.keys(params || {})
    .concat(Object.values(params || {}))
    .join(" ")
    .toLowerCase();

  if (traffic_type === "Deal Traffic" || traffic_type === "Coupon Traffic") {
    score = 85;
    reason = "Deal / coupon-oriented publisher signals indicate strong purchase intent.";
  } else if (
    traffic_type === "Review Traffic" ||
    publisher_type === "Editorial Review"
  ) {
    score = 68;
    reason = "Review-style content usually carries mid-to-high purchase consideration intent.";
  } else if (traffic_type === "Creator Traffic") {
    score = 62;
    reason = "Creator-led traffic usually carries moderate commercial intent.";
  } else if (
    traffic_type === "Paid Traffic" ||
    traffic_type === "Paid / Attributed Traffic"
  ) {
    score = 72;
    reason = "Paid traffic usually reflects active acquisition intent.";
  }

  if (
    allText.includes("coupon") ||
    allText.includes("deal") ||
    allText.includes("sale") ||
    allText.includes("discount") ||
    allText.includes("promo")
  ) {
    score = Math.max(score, 85);
    reason = "Promotional terms suggest strong conversion-oriented intent.";
  }

  if (score >= 80) {
    return { label: "High", score, reason };
  }
  if (score >= 60) {
    return { label: "Medium", score, reason };
  }
  return { label: "Low", score, reason };
}

function detectTrafficQuality({
  traffic_type,
  publisher_type,
  subtype,
  attribution_system,
  params
}) {
  let score = 50;
  let reason = "No extra traffic quality signals surfaced.";

  const hasSubtag = !!getParam(params, "ascsubtag");
  const hasPaidSignals = hasAnyParam(params, [
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
    "ttclid",
    "msclkid"
  ]);

  if (traffic_type === "Review Traffic") {
    score = 72;
    reason = "Editorial review traffic is often more qualified and research-driven.";
  } else if (traffic_type === "Deal Traffic") {
    score = 64;
    reason = "Deal traffic is conversion-oriented, though often price-sensitive.";
  } else if (traffic_type === "Coupon Traffic") {
    score = 58;
    reason = "Coupon traffic is usually purchase-near, but often less incremental.";
  } else if (traffic_type === "Creator Traffic") {
    score = 60;
    reason = "Creator traffic quality varies, but often carries audience trust.";
  } else if (
    traffic_type === "Paid Traffic" ||
    traffic_type === "Paid / Attributed Traffic"
  ) {
    score = 55;
    reason = "Paid traffic quality depends heavily on campaign targeting and query quality.";
  }

  if (
    attribution_system === "Amazon Associates" &&
    hasSubtag &&
    (publisher_type === "Deal Site" || publisher_type === "Deal Community")
  ) {
    score = Math.max(score, 66);
    reason = "Subtagged affiliate deal traffic suggests trackable publisher-origin clicks.";
  }

  if (hasPaidSignals) {
    score = Math.min(score, 60);
  }

  if (score >= 75) {
    return { label: "High", score, reason };
  }
  if (score >= 55) {
    return { label: "Medium", score, reason };
  }
  return { label: "Low", score, reason };
}

function detectIncrementalityRisk({
  traffic_type,
  publisher_type,
  attribution_system,
  params
}) {
  let score = 50;
  let reason = "No extra incrementality risk signals surfaced.";

  const hasSubtag = !!getParam(params, "ascsubtag");
  const hasPaidSignals = hasAnyParam(params, [
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
    "ttclid",
    "msclkid"
  ]);

  if (traffic_type === "Deal Traffic") {
    score = 74;
    reason = "Deal traffic often captures users close to conversion, which can reduce incrementality.";
  } else if (traffic_type === "Coupon Traffic") {
    score = 82;
    reason = "Coupon traffic frequently intercepts users near checkout, increasing incrementality risk.";
  } else if (traffic_type === "Review Traffic") {
    score = 48;
    reason = "Editorial review traffic often supports earlier-stage discovery and consideration.";
  } else if (traffic_type === "Creator Traffic") {
    score = 52;
    reason = "Creator traffic can drive discovery, but incrementality varies by audience and placement.";
  } else if (
    traffic_type === "Paid Traffic" ||
    traffic_type === "Paid / Attributed Traffic"
  ) {
    score = 58;
    reason = "Paid traffic may be incremental, but overlap with branded demand can raise risk.";
  }

  if (
    attribution_system === "Amazon Associates" &&
    hasSubtag &&
    (publisher_type === "Deal Site" || publisher_type === "Deal Community")
  ) {
    score = Math.max(score, 72);
    reason = "Deal-site affiliate traffic with subtag tracking is often closer to the point of purchase.";
  }

  if (hasPaidSignals && attribution_system === "Amazon Attribution") {
    score = Math.max(score, 60);
  }

  if (score >= 75) {
    return { label: "High", score, reason };
  }
  if (score >= 55) {
    return { label: "Medium", score, reason };
  }
  return { label: "Low", score, reason };
}

function buildQualityIntentProfile({
  attribution_system,
  publisher_type,
  subtype,
  params
}) {
  const traffic_type = detectTrafficType({
    attribution_system,
    publisher_type,
    subtype,
    params
  });

  const commercial_intent = detectCommercialIntent({
    traffic_type,
    publisher_type,
    subtype,
    params
  });

  const traffic_quality = detectTrafficQuality({
    traffic_type,
    publisher_type,
    subtype,
    attribution_system,
    params
  });

  const incrementality_risk = detectIncrementalityRisk({
    traffic_type,
    publisher_type,
    attribution_system,
    params
  });

  return {
    engine: "Quality & Intent Engine v2",
    traffic_type,
    commercial_intent,
    traffic_quality,
    incrementality_risk
  };
}

module.exports = {
  buildQualityIntentProfile
};
