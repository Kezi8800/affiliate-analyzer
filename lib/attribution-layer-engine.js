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
  },

  /**
   * Amazon Attribution / MAAS 常见占位 tag
   * 不是普通 Amazon Associates Publisher。
   */
  "maas": {
    publisher: "Advertiser / Brand",
    publisher_type: "Amazon Attribution"
  }
};

function inferPublisherFromAmazonTag(tag, attribution_system) {
  const normalized = normalizeTag(tag);

  if (attribution_system === "Amazon Attribution") {
    return {
      publisher: "Advertiser / Brand",
      publisher_type: "Amazon Attribution"
    };
  }

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
    hasAnyParam(params, ["campaignId", "campaignid", "linkId", "linkid"]) ||
    String(getParam(params, "linkCode") || "").toLowerCase() === "tr1" ||
    String(getParam(params, "linkcode") || "").toLowerCase() === "tr1";

  const refValue = String(getParam(params, "ref_") || "").toLowerCase();
  const tagValue = String(getParam(params, "tag") || "").toLowerCase();
  const maasValue = String(getParam(params, "maas") || "").toLowerCase();

  const hasAttributionSignals =
    hasAnyParam(params, [
      "maas",
      "aa_campaignid",
      "aa_adgroupid",
      "aa_creativeid"
    ]) ||
    refValue.includes("aa_maas") ||
    tagValue === "maas" ||
    maasValue.includes("maas_adg_api");

  /**
   * 优先级说明：
   * Amazon Attribution / MAAS 要优先于 Amazon Associates。
   * 因为这类链接也会出现 tag=maas，
   * 如果先判断 tag，会被误判成 Associates。
   */
  if (hasAttributionSignals) {
    return "Amazon Attribution";
  }

  if (hasAccSignals) {
    return "Amazon Creator Connections";
  }

  if (hasTag) {
    return "Amazon Associates";
  }

  return "Amazon";
}

function detectManagedBy(params) {
  const refValue = String(getParam(params, "ref_") || "").toLowerCase();
  const tagValue = String(getParam(params, "tag") || "").toLowerCase();
  const maasValue = String(getParam(params, "maas") || "").toLowerCase();

  const hasPartnerBoostLikeSignals =
    maasValue.includes("maas_adg_api") ||
    refValue.includes("aa_maas") ||
    tagValue === "maas" ||
    hasAnyParam(params, ["aa_campaignid", "aa_adgroupid", "aa_creativeid"]);

  if (hasPartnerBoostLikeSignals) {
    return "PartnerBoost";
  }

  return null;
}

function detectAmazonMerchant(hostname) {
  if (!hostname) return "Amazon";
  if (hostname.includes("amazon.")) return "Amazon";
  return "Amazon";
}

function detectCommercialIntent({ attribution_system, publisher_type, params }) {
  const qs = Object.keys(params || {}).join(" ").toLowerCase();

  if (attribution_system === "Amazon Attribution") {
    return "High";
  }

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
  if (attribution_system === "Amazon Attribution") {
    return "Traffic Driver";
  }

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
   * 核心逻辑：
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
  const managed_by = detectManagedBy(params);

  const tag = getParam(params, "tag");
  const publisherInfo = inferPublisherFromAmazonTag(tag, attribution_system);

  const publisher = publisherInfo.publisher;
  const publisher_type = publisherInfo.publisher_type;

  const primary_claimer = resolvePrimaryClaimer({
    attribution_system,
    publisher,
    merchant
  });

  const commercial_intent = detectCommercialIntent({
    attribution_system,
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

  const attribution_layer =
    attribution_system === "Amazon Attribution"
      ? "Amazon Attribution / MAAS"
      : attribution_system;

  return {
    engine: "Attribution Layer Engine v2",
    merchant,
    likely_type: "Amazon",
    attribution_system,
    attribution_layer,
    managed_by,
    primary_claimer,
    publisher,
    publisher_type,
    commercial_intent,
    channel_role,
    conflict_risk,
    evidence: {
      tag: getParam(params, "tag") || null,
      ascsubtag: getParam(params, "ascsubtag") || null,
      campaignId: getParam(params, "campaignId") || getParam(params, "campaignid") || null,
      linkId: getParam(params, "linkId") || getParam(params, "linkid") || null,
      linkCode: getParam(params, "linkCode") || getParam(params, "linkcode") || null,
      ref_: getParam(params, "ref_") || null,
      maas: getParam(params, "maas") || null,
      aa_campaignid: getParam(params, "aa_campaignid") || null,
      aa_adgroupid: getParam(params, "aa_adgroupid") || null,
      aa_creativeid: getParam(params, "aa_creativeid") || null
    }
  };
}

module.exports = {
  buildAmazonAttributionLayer
};
