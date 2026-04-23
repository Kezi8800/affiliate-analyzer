function safeDecode(value) {
  try {
    return decodeURIComponent(value || "");
  } catch (e) {
    return value || "";
  }
}

function getQueryParams(urlObj) {
  const params = {};
  if (!urlObj || !urlObj.searchParams) return params;

  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

function getParam(params, key) {
  return params && Object.prototype.hasOwnProperty.call(params, key)
    ? params[key]
    : "";
}

function hasAnyParam(params, keys) {
  return keys.some((k) => !!getParam(params, k));
}

function normalizeTag(tag) {
  return String(tag || "")
    .trim()
    .toLowerCase();
}

/**
 * 你可以持续扩充这个规则库
 * key = Amazon tag
 */
const AMAZON_TAG_PUBLISHER_MAP = {
  "dealnewscom": {
    publisher: "DealNews",
    publisher_type: "Deal Site"
  },
  "slickdeals09-20": {
    publisher: "Slickdeals",
    publisher_type: "Deal Community"
  },
  "cnetcommerce": {
    publisher: "CNET",
    publisher_type: "Editorial Review"
  },
  "mattressnrd": {
    publisher: "Mattress Nerd",
    publisher_type: "Editorial Review"
  },
  "amazondealclubs-20": {
    publisher: "Amazon Deal Clubs",
    publisher_type: "Deal Site"
  }
};

function inferPublisherFromAmazonTag(tag) {
  const normalized = normalizeTag(tag);
  if (!normalized) {
    return {
      publisher: "Unknown",
      publisher_type: "Unknown"
    };
  }

  if (AMAZON_TAG_PUBLISHER_MAP[normalized]) {
    return AMAZON_TAG_PUBLISHER_MAP[normalized];
  }

  return {
    publisher: tag,
    publisher_type: inferPublisherTypeFromTag(tag)
  };
}

function inferPublisherTypeFromTag(tag) {
  const value = normalizeTag(tag);

  if (!value) return "Unknown";

  if (
    value.includes("deal") ||
    value.includes("coupon") ||
    value.includes("bargain")
  ) {
    return "Deal Site";
  }

  if (
    value.includes("review") ||
    value.includes("guide") ||
    value.includes("nerd") ||
    value.includes("lab") ||
    value.includes("insider") ||
    value.includes("cnet")
  ) {
    return "Editorial Review";
  }

  if (
    value.includes("creator") ||
    value.includes("influencer") ||
    value.includes("tiktok") ||
    value.includes("youtube") ||
    value.includes("insta")
  ) {
    return "Creator / Influencer";
  }

  return "Affiliate Publisher";
}

function detectAmazonAttributionSystem(params) {
  const hasTag = !!getParam(params, "tag");

  const hasAccSignals =
    hasAnyParam(params, ["campaignId", "linkId"]) ||
    getParam(params, "linkCode") === "tr1";

  const hasAttributionSignals =
    hasAnyParam(params, [
      "maas",
      "aa_campaignid",
      "aa_adgroupid",
      "aa_creativeid"
    ]) ||
    String(getParam(params, "ref_") || "").includes("aa_maas");

  if (hasAccSignals) {
    return "Amazon Creator Connections";
  }

  if (hasAttributionSignals) {
    return "Amazon Attribution";
  }

  if (hasTag) {
    return "Amazon Associates";
  }

  return "Amazon";
}

function detectAmazonMerchant(hostname) {
  if (!hostname) return "Amazon";
  if (hostname.includes("amazon.")) return "Amazon";
  return "Amazon";
}

function detectCommercialIntent({ publisher_type, params }) {
  const qs = Object.keys(params || {}).join(" ").toLowerCase();

  if (
    publisher_type === "Deal Site" ||
    publisher_type === "Deal Community" ||
    qs.includes("coupon") ||
    qs.includes("deal")
  ) {
    return "High";
  }

  if (
    publisher_type === "Editorial Review" ||
    publisher_type === "Creator / Influencer"
  ) {
    return "Medium";
  }

  return "Medium";
}

function detectChannelRole({ attribution_system, publisher_type }) {
  if (
    attribution_system === "Amazon Associates" &&
    (publisher_type === "Deal Site" || publisher_type === "Deal Community")
  ) {
    return "Closer";
  }

  if (publisher_type === "Editorial Review") {
    return "Mid-Funnel Influencer";
  }

  if (publisher_type === "Creator / Influencer") {
    return "Influencer";
  }

  if (attribution_system === "Amazon Attribution") {
    return "Traffic Driver";
  }

  return "Closer";
}

function detectConflictRisk({ attribution_system, publisher_type, params }) {
  const hasSubtag = !!getParam(params, "ascsubtag");
  const hasPaidSignals = hasAnyParam(params, ["gclid", "fbclid", "ttclid", "msclkid"]);

  if (attribution_system === "Amazon Attribution") {
    return "Medium";
  }

  if (
    attribution_system === "Amazon Associates" &&
    (publisher_type === "Deal Site" || publisher_type === "Deal Community") &&
    hasSubtag
  ) {
    return "Low";
  }

  if (hasPaidSignals) {
    return "Medium";
  }

  return "Low";
}

function resolvePrimaryClaimer({
  attribution_system,
  publisher,
  merchant
}) {
  /**
   * 核心修正逻辑：
   * merchant = Amazon
   * primary_claimer = 真正拿佣 / 拿归因的人
   */

  if (
    attribution_system === "Amazon Associates" ||
    attribution_system === "Amazon Creator Connections"
  ) {
    return publisher && publisher !== "Unknown" ? publisher : attribution_system;
  }

  if (attribution_system === "Amazon Attribution") {
    return "Advertiser / Brand";
  }

  return merchant || "Amazon";
}

function buildAmazonAttributionLayer(urlObj) {
  const hostname = (urlObj.hostname || "").toLowerCase();
  const params = getQueryParams(urlObj);

  const merchant = detectAmazonMerchant(hostname);
  const attribution_system = detectAmazonAttributionSystem(params);

  const tag = getParam(params, "tag");
  const publisherInfo = inferPublisherFromAmazonTag(tag);

  const publisher = publisherInfo.publisher;
  const publisher_type = publisherInfo.publisher_type;

  const primary_claimer = resolvePrimaryClaimer({
    attribution_system,
    publisher,
    merchant
  });

  const commercial_intent = detectCommercialIntent({
    publisher_type,
    params
  });

  const channel_role = detectChannelRole({
    attribution_system,
    publisher_type
  });

  const conflict_risk = detectConflictRisk({
    attribution_system,
    publisher_type,
    params
  });

  return {
    engine: "Attribution Layer Engine v2",
    merchant,
    likely_type: "Amazon",
    attribution_system,
    primary_claimer,
    publisher,
    publisher_type,
    commercial_intent,
    channel_role,
    conflict_risk,
    evidence: {
      tag: getParam(params, "tag") || null,
      ascsubtag: getParam(params, "ascsubtag") || null,
      campaignId: getParam(params, "campaignId") || null,
      linkId: getParam(params, "linkId") || null,
      linkCode: getParam(params, "linkCode") || null,
      aa_campaignid: getParam(params, "aa_campaignid") || null,
      maas: getParam(params, "maas") || null
    }
  };
}

module.exports = {
  buildAmazonAttributionLayer
};
