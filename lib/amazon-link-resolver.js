"use strict";

const { resolveAmazonCreatorConnections } = require("./amazon-creator-connections-rules");
const { matchInternationalPublisherFromUrl } = require("./international-publisher-rules");

function safeString(value) {
  return String(value || "").trim();
}

function lower(value) {
  return safeString(value).toLowerCase();
}

function getParam(params, key) {
  if (!params || !key) return "";

  if (typeof params.get === "function") {
    return params.get(key) || params.get(key.toLowerCase()) || params.get(key.toUpperCase()) || "";
  }

  return params[key] || params[key.toLowerCase()] || params[key.toUpperCase()] || "";
}

function paramsToObject(params) {
  if (!params) return {};

  if (typeof params.entries === "function") {
    const obj = {};
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  return { ...params };
}

function normalizeAmazonTag(value) {
  return lower(value).replace(/\s+/g, "");
}

function isAmazonHost(hostname = "") {
  const h = lower(hostname);
  return (
    h.includes("amazon.") ||
    h.includes("amzn.to") ||
    h.includes("a.co") ||
    h.includes("amzn.eu") ||
    h.includes("amzn.asia")
  );
}

function isValidMediaGroup(value = "") {
  const v = lower(value);

  return (
    v &&
    v !== "unknown" &&
    !v.includes("unidentified") &&
    !v.includes("amazon affiliate ecosystem") &&
    !v.includes("amazon creator ecosystem")
  );
}

function buildPublisherLabel(publisher = "", mediaGroup = "") {
  const finalPublisher = safeString(publisher) || "Amazon Publisher";
  const finalGroup = safeString(mediaGroup);

  if (
    isValidMediaGroup(finalGroup) &&
    lower(finalGroup) !== lower(finalPublisher)
  ) {
    return `${finalPublisher}（${finalGroup}）`;
  }

  return finalPublisher;
}

function inferPublisherFromAmazonTag(tag = "", ascsubtag = "") {
  const haystack = `${normalizeAmazonTag(tag)} ${normalizeAmazonTag(ascsubtag)}`;

  const rules = [
    {
      publisher: "Slickdeals",
      patterns: ["slickdeals09", "slickdeals", "sd-", "sd_"],
      type: "Deal Community",
      subtype: "Deal / Promo",
      media_group: "Slickdeals"
    },
    {
      publisher: "BuzzFeed",
      patterns: ["buzz0f", "buzzfeed", "bf-shp"],
      type: "Editorial Commerce",
      subtype: "Shopping Content",
      media_group: "BuzzFeed"
    },
    {
      publisher: "PCMag",
      patterns: ["p00935", "pcmag"],
      type: "Editorial Commerce",
      subtype: "Tech Review",
      media_group: "Ziff Davis"
    },
    {
      publisher: "TechRadar",
      patterns: [
        "fttr-techradar",
        "cx-future-tr",
        "future__tr",
        "techradar",
        "trdpro"
      ],
      type: "Editorial Commerce",
      subtype: "Tech Review / Buying Guide",
      media_group: "Future Publishing"
    },
    {
      publisher: "Tom's Guide",
      patterns: [
        "tomsguide",
        "tomsguide-us",
        "future-tomsguide",
        "cx-future-tg",
        "future__tg"
      ],
      type: "Editorial Commerce",
      subtype: "Tech Review / Buying Guide",
      media_group: "Future Publishing"
    },
    {
      publisher: "Laptop Mag",
      patterns: [
        "laptopmag",
        "future-laptopmag",
        "cx-future-lm",
        "future__lm"
      ],
      type: "Editorial Commerce",
      subtype: "Tech Review / Buying Guide",
      media_group: "Future Publishing"
    },
    {
      publisher: "Tom's Hardware",
      patterns: [
        "tomshardware",
        "tomshardware-us",
        "future-tomshardware",
        "cx-future-th",
        "future__th"
      ],
      type: "Editorial Commerce",
      subtype: "Tech Review / Buying Guide",
      media_group: "Future Publishing"
    },
    {
      publisher: "Android Central",
      patterns: [
        "androidcentral",
        "future-androidcentral",
        "cx-future-ac",
        "future__ac"
      ],
      type: "Editorial Commerce",
      subtype: "Tech Review / Buying Guide",
      media_group: "Future Publishing"
    },
    {
      publisher: "iMore",
      patterns: [
        "imore",
        "future-imore",
        "cx-future-im",
        "future__im"
      ],
      type: "Editorial Commerce",
      subtype: "Apple / Tech Review",
      media_group: "Future Publishing"
    },
    {
      publisher: "Windows Central",
      patterns: [
        "windowscentral",
        "future-windowscentral",
        "cx-future-wc",
        "future__wc"
      ],
      type: "Editorial Commerce",
      subtype: "Tech Review / Buying Guide",
      media_group: "Future Publishing"
    },
    {
      publisher: "GamesRadar+",
      patterns: [
        "gamesradar",
        "gamesradarplus",
        "future-gamesradar",
        "cx-future-gr",
        "future__gr"
      ],
      type: "Editorial Commerce",
      subtype: "Gaming Review / Buying Guide",
      media_group: "Future Publishing"
    },
    {
      publisher: "T3",
      patterns: [
        "t3com",
        "t3-",
        "future-t3",
        "cx-future-t3",
        "future__t3"
      ],
      type: "Editorial Commerce",
      subtype: "Lifestyle / Tech Review",
      media_group: "Future Publishing"
    },
    {
      publisher: "Digital Camera World",
      patterns: [
        "digitalcameraworld",
        "dcw",
        "future-dcw",
        "future__dcw"
      ],
      type: "Editorial Commerce",
      subtype: "Camera Review / Buying Guide",
      media_group: "Future Publishing"
    },
    {
      publisher: "Marie Claire",
      patterns: [
        "marieclaire",
        "future-marieclaire",
        "future__mc"
      ],
      type: "Editorial Commerce",
      subtype: "Lifestyle / Shopping Content",
      media_group: "Future Publishing"
    },
    {
      publisher: "Who What Wear",
      patterns: [
        "whowhatwear",
        "www-",
        "future-whowhatwear",
        "future__www"
      ],
      type: "Editorial Commerce",
      subtype: "Fashion / Shopping Content",
      media_group: "Future Publishing"
    },
    {
      publisher: "Wirecutter",
      patterns: ["wirecutter", "thewirecutter", "nytimes"],
      type: "Editorial Commerce",
      subtype: "Review / Buying Guide",
      media_group: "The New York Times"
    },
    {
      publisher: "CNET",
      patterns: ["cnet", "cnetcommerce"],
      type: "Editorial Commerce",
      subtype: "Tech Review",
      media_group: "Red Ventures"
    },
    {
      publisher: "ZDNET",
      patterns: ["zdnet", "zdnetcommerce"],
      type: "Editorial Commerce",
      subtype: "Tech Review / B2B Tech",
      media_group: "Red Ventures"
    },
    {
      publisher: "The Points Guy",
      patterns: ["thepointsguy", "tpg"],
      type: "Editorial Commerce",
      subtype: "Travel / Credit Card Commerce",
      media_group: "Red Ventures"
    },
    {
      publisher: "CNN Underscored",
      patterns: ["cnnunderscored", "underscored"],
      type: "Editorial Commerce",
      subtype: "Shopping Content",
      media_group: "CNN"
    },
    {
      publisher: "Forbes Vetted",
      patterns: ["forbesvetted", "forbes-vetted"],
      type: "Editorial Commerce",
      subtype: "Review / Buying Guide",
      media_group: "Forbes"
    },
    {
      publisher: "Business Insider",
      patterns: ["businessinsider", "insider"],
      type: "Editorial Commerce",
      subtype: "Shopping Content",
      media_group: "Insider Inc."
    },
    {
      publisher: "Reviewed",
      patterns: ["reviewed", "usatoday-reviewed"],
      type: "Editorial Commerce",
      subtype: "Review / Buying Guide",
      media_group: "Gannett"
    },
    {
      publisher: "Good Housekeeping",
      patterns: ["goodhousekeeping", "goodhousemag", "ghk"],
      type: "Editorial Commerce",
      subtype: "Product Review / Lifestyle",
      media_group: "Hearst"
    },
    {
      publisher: "Popular Mechanics",
      patterns: ["popularmechanics", "popmech"],
      type: "Editorial Commerce",
      subtype: "Product Review / Tech",
      media_group: "Hearst"
    },
    {
      publisher: "Esquire",
      patterns: ["esquire"],
      type: "Editorial Commerce",
      subtype: "Lifestyle / Shopping Content",
      media_group: "Hearst"
    },
    {
      publisher: "Car and Driver",
      patterns: ["caranddriver", "car-driver"],
      type: "Editorial Commerce",
      subtype: "Auto Review / Buying Guide",
      media_group: "Hearst"
    }
  ];

  for (const rule of rules) {
    const matchedPattern = rule.patterns.find(pattern =>
      haystack.includes(normalizeAmazonTag(pattern))
    );

    if (matchedPattern) {
      return {
        ...rule,
        confidence: "High",
        matched_by: "amazon_tag_rule",
        matched_pattern: matchedPattern,
        group: rule.media_group,
        parent_media_group: rule.media_group,
        evidence: {
          tag: tag || null,
          ascsubtag: ascsubtag || null
        }
      };
    }
  }

  return null;
}

function detectAmazonAttribution(params = {}) {
  const maas = getParam(params, "maas");
  const aaCampaign = getParam(params, "aa_campaignid");
  const aaAdgroup = getParam(params, "aa_adgroupid");
  const aaCreative = getParam(params, "aa_creativeid");

  const isAttribution = !!(maas || aaCampaign || aaAdgroup || aaCreative);

  return {
    is_amazon_attribution: isAttribution,
    attribution_system: isAttribution ? "Amazon Attribution" : null,
    confidence: isAttribution ? "High" : "Low",
    evidence: {
      maas: maas || null,
      aa_campaignid: aaCampaign || null,
      aa_adgroupid: aaAdgroup || null,
      aa_creativeid: aaCreative || null
    }
  };
}

function detectAmazonAssociates(params = {}) {
  const tag = getParam(params, "tag");
  const associateTag = getParam(params, "associateTag") || getParam(params, "associatetag");
  const ascsubtag = getParam(params, "ascsubtag");
  const linkCode = getParam(params, "linkCode");
  const creative = getParam(params, "creative");
  const camp = getParam(params, "camp");

  const finalTag = tag || associateTag;

  const hasAssociatesSignal = !!(
    finalTag ||
    ascsubtag ||
    linkCode ||
    creative ||
    camp
  );

  let score = 0;
  const signals = [];

  if (finalTag) {
    score += 50;
    signals.push("tag");
  }

  if (ascsubtag) {
    score += 20;
    signals.push("ascsubtag");
  }

  if (linkCode) {
    score += 12;
    signals.push("linkCode");
  }

  if (creative) {
    score += 8;
    signals.push("creative");
  }

  if (camp) {
    score += 8;
    signals.push("camp");
  }

  return {
    is_amazon_associates: hasAssociatesSignal,
    attribution_system: hasAssociatesSignal ? "Amazon Associates" : null,
    score,
    confidence: score >= 60 ? "High" : score >= 30 ? "Medium" : "Low",
    signals,
    evidence: {
      tag: finalTag || null,
      ascsubtag: ascsubtag || null,
      linkCode: linkCode || null,
      creative: creative || null,
      camp: camp || null
    }
  };
}

/**
 * Main Amazon resolver
 * Priority:
 * 1. Amazon Attribution
 * 2. Amazon Creator Connections
 * 3. Amazon Associates
 * 4. Amazon Organic / Marketplace URL
 */
function resolveAmazonLink(urlObj, rawParams = {}) {
  const params = paramsToObject(rawParams);

  const host = lower(urlObj?.hostname);
  const path = lower(urlObj?.pathname);

  const tag =
    getParam(params, "tag") ||
    getParam(params, "associateTag") ||
    getParam(params, "associatetag") ||
    getParam(params, "afftag") ||
    getParam(params, "tracking_id");

  const ascsubtag =
    getParam(params, "ascsubtag") ||
    getParam(params, "asc_subtag") ||
    getParam(params, "subtag") ||
    getParam(params, "subId") ||
    getParam(params, "subid") ||
    getParam(params, "sid");

  const attribution = detectAmazonAttribution(params);
  const creator = resolveAmazonCreatorConnections(params, urlObj);
  const associates = detectAmazonAssociates(params);

  const amazonTagPublisher = inferPublisherFromAmazonTag(tag, ascsubtag);
  const intlPublisher = matchInternationalPublisherFromUrl(urlObj, params);

  const publisherIntel =
    amazonTagPublisher ||
    intlPublisher ||
    null;

  let attributionSystem = "Amazon";
  let network = "Amazon";
  let confidence = "Low";
  let primaryClaimer = "Amazon";

  if (attribution.is_amazon_attribution) {
    attributionSystem = "Amazon Attribution";
    network = "Amazon Attribution";
    confidence = attribution.confidence;
    primaryClaimer = "Brand / Advertiser";
  } else if (creator.is_creator_connections) {
    attributionSystem = "Amazon Creator Connections";
    network = "Amazon Creator Connections";
    confidence = creator.confidence;
    primaryClaimer = publisherIntel?.publisher || "Creator / Publisher";
  } else if (associates.is_amazon_associates) {
    attributionSystem = "Amazon Associates";
    network = "Amazon Associates";
    confidence = associates.confidence;
    primaryClaimer = publisherIntel?.publisher || "Amazon Associates Publisher";
  } else if (isAmazonHost(host)) {
    attributionSystem = "Amazon Organic / Marketplace";
    network = "Amazon";
    confidence = "Medium";
    primaryClaimer = "Amazon";
  }

  const publisher = publisherIntel?.publisher || primaryClaimer;

  const publisherType =
    publisherIntel?.type ||
    (attributionSystem === "Amazon Creator Connections"
      ? "Creator / Influencer"
      : attributionSystem === "Amazon Associates"
      ? "Affiliate"
      : attributionSystem === "Amazon Attribution"
      ? "Advertiser"
      : "Marketplace");

  const subtype =
    publisherIntel?.subtype ||
    (attributionSystem === "Amazon Creator Connections"
      ? "Creator Commerce"
      : attributionSystem === "Amazon Associates"
      ? "Amazon Affiliate"
      : attributionSystem === "Amazon Attribution"
      ? "Paid Attribution"
      : "Organic Marketplace");

  const mediaGroup =
    publisherIntel?.media_group ||
    publisherIntel?.group ||
    publisherIntel?.parent_media_group ||
    (attributionSystem === "Amazon Creator Connections"
      ? "Amazon Creator Ecosystem"
      : attributionSystem === "Amazon Associates"
      ? "Amazon Affiliate Ecosystem"
      : "Amazon");

  const publisherLabel = buildPublisherLabel(publisher, mediaGroup);

  const channelRole =
    attributionSystem === "Amazon Creator Connections"
      ? "Creator / Affiliate Attribution"
      : attributionSystem === "Amazon Associates"
      ? "Affiliate / Last-click Attribution"
      : attributionSystem === "Amazon Attribution"
      ? "Paid Media / Attribution Measurement"
      : "Marketplace Touchpoint";

  return {
    engine: "Amazon Link Resolver v1.1",
    is_amazon: isAmazonHost(host),
    merchant: "Amazon",
    platform: "Amazon",
    hostname: host || null,
    pathname: path || null,

    attribution_system: attributionSystem,
    network,
    likely_type: attributionSystem,

    publisher,
    publisher_label: publisherLabel,
    publisher_group: isValidMediaGroup(mediaGroup) ? mediaGroup : null,
    media_group: isValidMediaGroup(mediaGroup) ? mediaGroup : null,
    publisher_type: publisherType,
    primary_claimer: primaryClaimer,

    confidence,

    publisher_intelligence: {
      publisher,
      publisher_label: publisherLabel,
      type: publisherType,
      subtype,
      media_group: isValidMediaGroup(mediaGroup) ? mediaGroup : null,
      parent_media_group: isValidMediaGroup(mediaGroup) ? mediaGroup : null,
      region: publisherIntel?.region || null,
      market: publisherIntel?.market || null,
      confidence: publisherIntel?.confidence || confidence,
      matched_by: publisherIntel?.matched_by || "amazon_link_resolver",
      matched_pattern: publisherIntel?.matched_pattern || null
    },

    path_classification: {
      path_label: `${publisherLabel} → ${attributionSystem} → Amazon`,
      path_nodes:
        isValidMediaGroup(mediaGroup) && lower(mediaGroup) !== lower(publisher)
          ? [publisher, mediaGroup, attributionSystem, "Amazon"]
          : [publisher, attributionSystem, "Amazon"],
      publisher_label: publisherLabel,
      publisher,
      media_group: isValidMediaGroup(mediaGroup) ? mediaGroup : null,
      channel_role: channelRole
    },

    traffic_type:
      publisherType.includes("Deal")
        ? "Deal / Promo"
        : publisherType.includes("Editorial")
        ? "Editorial / Review"
        : publisherType.includes("Creator")
        ? "Creator / Influencer"
        : "Affiliate / Commerce",

    commercial_intent:
      publisherType.includes("Deal")
        ? "Deal / Promo Intent"
        : publisherType.includes("Editorial")
        ? "Product Research Intent"
        : publisherType.includes("Creator")
        ? "Creator Recommendation Intent"
        : "Affiliate Commerce Intent",

    traffic_quality:
      publisherType.includes("Editorial")
        ? 82
        : publisherType.includes("Creator")
        ? 74
        : publisherType.includes("Deal")
        ? 72
        : 65,

    incrementality_risk:
      publisherType.includes("Deal")
        ? "Medium"
        : publisherType.includes("Coupon")
        ? "High"
        : "Medium",

    evidence: {
      tag: tag || null,
      ascsubtag: ascsubtag || null,
      campaignId: getParam(params, "campaignId") || null,
      linkId: getParam(params, "linkId") || null,
      linkCode: getParam(params, "linkCode") || null,
      creative: getParam(params, "creative") || null,
      camp: getParam(params, "camp") || null,
      maas: getParam(params, "maas") || null,
      aa_campaignid: getParam(params, "aa_campaignid") || null,
      aa_adgroupid: getParam(params, "aa_adgroupid") || null,
      aa_creativeid: getParam(params, "aa_creativeid") || null,
      resolver_priority: attribution.is_amazon_attribution
        ? "Amazon Attribution"
        : creator.is_creator_connections
        ? "Amazon Creator Connections"
        : associates.is_amazon_associates
        ? "Amazon Associates"
        : "Amazon Organic",
      attribution_signals: attribution.evidence,
      creator_signals: creator.signals,
      associates_signals: associates.signals,
      publisher_match: publisherIntel
        ? {
            publisher,
            media_group: isValidMediaGroup(mediaGroup) ? mediaGroup : null,
            matched_by: publisherIntel.matched_by || null,
            matched_pattern: publisherIntel.matched_pattern || null
          }
        : null
    }
  };
}

module.exports = {
  resolveAmazonLink,
  isAmazonHost,
  detectAmazonAttribution,
  detectAmazonAssociates,
  inferPublisherFromAmazonTag
};
