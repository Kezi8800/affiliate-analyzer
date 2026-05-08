function normalizeAmazonTag(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function getAmazonParam(params, keys) {
  for (const key of keys) {
    const value = getParam(params, key);
    if (value) return value;
  }
  return null;
}

const AMAZON_PUBLISHER_TAG_RULES = [
  {
    publisher: "Slickdeals",
    patterns: ["slickdeals09", "slickdeals", "slick", "sd-", "sd_"],
    type: "Deal Community",
    subtype: "Deal / Coupon",
    media_group: "Slickdeals"
  },
  {
    publisher: "Wirecutter",
    patterns: ["wirecutter", "thewirecutter", "nytimes"],
    type: "Editorial Commerce",
    subtype: "Review / Buying Guide",
    media_group: "NYTimes"
  },
  {
    publisher: "RetailMeNot",
    patterns: ["retailmenot", "rmn"],
    type: "Coupon / Rewards",
    subtype: "Coupon",
    media_group: "RetailMeNot"
  },
  {
    publisher: "Honey",
    patterns: ["joinhoney", "honey"],
    type: "Coupon / Extension",
    subtype: "Browser Extension",
    media_group: "PayPal Honey"
  },
  {
    publisher: "Rakuten",
    patterns: ["rakuten", "ebates"],
    type: "Cashback / Loyalty",
    subtype: "Cashback",
    media_group: "Rakuten"
  }
];

function resolveAmazonPublisher({ tag, ascsubtag, urlObj }) {
  const tagNorm = normalizeAmazonTag(tag);
  const subtagNorm = normalizeAmazonTag(ascsubtag);
  const hostNorm = normalizeAmazonTag(urlObj?.hostname);

  const haystack = [tagNorm, subtagNorm, hostNorm].filter(Boolean).join("|");

  for (const rule of AMAZON_PUBLISHER_TAG_RULES) {
    if (rule.patterns.some(pattern => haystack.includes(pattern))) {
      return {
        publisher: rule.publisher,
        type: rule.type,
        subtype: rule.subtype,
        media_group: rule.media_group,
        matched_by: "amazon_publisher_rule_match",
        confidence: "High",
        evidence: {
          tag: tag || null,
          ascsubtag: ascsubtag || null,
          host: urlObj?.hostname || null
        }
      };
    }
  }

  return null;
}

function resolvePublisherFromContext(urlObj, params = {}) {
  const hostname = String(urlObj?.hostname || "").toLowerCase();
  const pathname = String(urlObj?.pathname || "").toLowerCase();
  const search = String(urlObj?.search || "").toLowerCase();

  const referrer =
    typeof document !== "undefined"
      ? String(document.referrer || "").toLowerCase()
      : "";

  const full = [
    hostname,
    pathname,
    search,
    referrer,
    getParam(params, "utm_source"),
    getParam(params, "utm_medium"),
    getParam(params, "utm_campaign"),
    getParam(params, "source"),
    getParam(params, "ref"),
    getParam(params, "ref_"),
    getParam(params, "tag"),
    getParam(params, "ascsubtag")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const rules = [
    {
      publisher: "Slickdeals",
      patterns: ["slickdeals", "slickdeals.net", "slickdeals09"],
      type: "Deal Community",
      subtype: "Deal / Coupon",
      media_group: "Slickdeals"
    },
    {
      publisher: "Wirecutter",
      patterns: ["wirecutter", "thewirecutter", "nytimes"],
      type: "Editorial Commerce",
      subtype: "Review / Buying Guide",
      media_group: "NYTimes"
    },
    {
      publisher: "Reddit",
      patterns: ["reddit", "redd.it"],
      type: "Community",
      subtype: "Forum / Social",
      media_group: "Reddit"
    },
    {
      publisher: "YouTube Creator",
      patterns: ["youtube", "youtu.be"],
      type: "Creator",
      subtype: "Video Creator",
      media_group: "YouTube"
    },
    {
      publisher: "TikTok Creator",
      patterns: ["tiktok"],
      type: "Creator",
      subtype: "Short Video Creator",
      media_group: "TikTok"
    },
    {
      publisher: "Instagram Creator",
      patterns: ["instagram"],
      type: "Creator",
      subtype: "Social Creator",
      media_group: "Meta"
    },
    {
      publisher: "Facebook",
      patterns: ["facebook", "fbclid"],
      type: "Social",
      subtype: "Social Network",
      media_group: "Meta"
    },
    {
      publisher: "Rakuten",
      patterns: ["rakuten", "ebates"],
      type: "Cashback / Loyalty",
      subtype: "Cashback",
      media_group: "Rakuten"
    },
    {
      publisher: "Honey",
      patterns: ["joinhoney", "honey"],
      type: "Coupon / Extension",
      subtype: "Browser Extension",
      media_group: "PayPal Honey"
    },
    {
      publisher: "RetailMeNot",
      patterns: ["retailmenot", "rmn"],
      type: "Coupon / Rewards",
      subtype: "Coupon",
      media_group: "RetailMeNot"
    },
    {
      publisher: "Capital One Shopping",
      patterns: ["capitaloneshopping", "wikibuy"],
      type: "Coupon / Extension",
      subtype: "Shopping Extension",
      media_group: "Capital One"
    }
  ];

  for (const rule of rules) {
    if (rule.patterns.some(pattern => full.includes(pattern))) {
      return {
        publisher: rule.publisher,
        type: rule.type,
        subtype: rule.subtype,
        media_group: rule.media_group,
        matched_by: "contextual_publisher_inference",
        confidence: "High",
        evidence: {
          host: hostname || null,
          path: pathname || null,
          referrer: referrer || null
        }
      };
    }
  }

  return null;
}

function buildAmazonAttributionLayer(urlObj) {
  const params = getQueryParams(urlObj);
  const merchant = "Amazon";
  const attribution_system = detectAmazonAttributionSystem(params);

  const tag = getAmazonParam(params, [
    "tag",
    "associateTag",
    "associatetag",
    "afftag",
    "tracking_id",
    "asc_source"
  ]);

  const ascsubtag = getAmazonParam(params, [
    "ascsubtag",
    "asc_subtag",
    "subtag",
    "subId",
    "subid",
    "sid"
  ]);

  const amazonPublisherInference =
    resolveAmazonPublisher({ tag, ascsubtag, urlObj }) ||
    inferPublisherFromAmazonTag(tag) ||
    inferPublisherFromAscSubtag(ascsubtag) ||
    resolvePublisherFromContext(urlObj, params);

  const initialPublisherIntel = buildPublisherIntelligence(urlObj, {});

  let publisher = initialPublisherIntel.publisher;
  let publisher_type = initialPublisherIntel.type;
  let publisher_subtype = initialPublisherIntel.subtype;
  let publisher_media_group = initialPublisherIntel.media_group;
  let publisher_matched_by = initialPublisherIntel.matched_by;
  let publisher_evidence = initialPublisherIntel.evidence || null;

  if (!publisher || publisher === "Unknown") {
    if (amazonPublisherInference) {
      publisher = amazonPublisherInference.publisher;
      publisher_type = amazonPublisherInference.type;
      publisher_subtype = amazonPublisherInference.subtype;
      publisher_media_group = amazonPublisherInference.media_group;
      publisher_matched_by = amazonPublisherInference.matched_by;
      publisher_evidence = amazonPublisherInference.evidence;
    }
  }

  if (
    attribution_system === "Amazon Creator Connections" &&
    (!publisher || publisher === "Unknown")
  ) {
    publisher = "Creator / Publisher";
    publisher_type = "Creator / Influencer";
    publisher_subtype = "Amazon Creator Connections";
    publisher_media_group = "Amazon Creator Ecosystem";
    publisher_matched_by = "amazon_creator_connections_signal";
  }

  if (
    attribution_system === "Amazon Attribution" &&
    (!publisher || publisher === "Unknown")
  ) {
    publisher = "Brand / Advertiser";
    publisher_type = "Advertiser";
    publisher_subtype = "Amazon Attribution";
    publisher_media_group = "Brand";
    publisher_matched_by = "amazon_attribution_signal";
  }

  if (!publisher || publisher === "Unknown") {
    publisher = "Amazon Associates Publisher";
    publisher_type = "Affiliate";
    publisher_subtype = "Amazon Associates";
    publisher_media_group = "Amazon Affiliate Ecosystem";
    publisher_matched_by = "forced_no_unknown_fallback";
    publisher_evidence = {
      tag: tag || null,
      ascsubtag: ascsubtag || null,
      host: urlObj?.hostname || null
    };
  }

  const primary_claimer = resolvePrimaryClaimer({
    attribution_system,
    publisher,
    merchant
  });

  const publisherIntel = buildPublisherIntelligence(urlObj, {
    primary_claimer,
    publisher_hint: publisher
  });

  let finalPublisher = publisher;
  let finalPublisherType = publisher_type || "Affiliate";
  let finalSubtype = publisher_subtype || attribution_system || "Amazon Associates";
  let finalMediaGroup = publisher_media_group || "Amazon Affiliate Ecosystem";
  let finalMatchedBy = publisher_matched_by || "forced_no_unknown_fallback";

  if (
    publisherIntel.publisher &&
    publisherIntel.publisher !== "Unknown" &&
    !amazonPublisherInference
  ) {
    finalPublisher = publisherIntel.publisher;
    finalPublisherType = publisherIntel.type || finalPublisherType;
    finalSubtype = publisherIntel.subtype || finalSubtype;
    finalMediaGroup = publisherIntel.media_group || finalMediaGroup;
    finalMatchedBy = publisherIntel.matched_by || finalMatchedBy;
  }

  if (amazonPublisherInference) {
    finalPublisher = amazonPublisherInference.publisher;
    finalPublisherType = amazonPublisherInference.type || finalPublisherType;
    finalSubtype = amazonPublisherInference.subtype || finalSubtype;
    finalMediaGroup = amazonPublisherInference.media_group || finalMediaGroup;
    finalMatchedBy = amazonPublisherInference.matched_by || finalMatchedBy;
  }

  if (!finalPublisher || finalPublisher === "Unknown") {
    finalPublisher = "Amazon Associates Publisher";
    finalPublisherType = "Affiliate";
    finalSubtype = "Amazon Associates";
    finalMediaGroup = "Amazon Affiliate Ecosystem";
    finalMatchedBy = "hard_no_unknown_fallback";
  }

  const qualityIntent = buildQualityIntentProfile({
    attribution_system,
    publisher_type: finalPublisherType,
    subtype: finalSubtype,
    params
  });

  const pathInfo = buildAmazonPathClassification({
    publisher: finalPublisher,
    attribution_system,
    merchant
  });

  const retailIntentGMV = buildRetailIntentGMVLayer({
    urlObj,
    merchant,
    attribution_system,
    publisher_type: finalPublisherType
  });

  return {
    engine:
      "Attribution Layer Engine v2 + Amazon Publisher Resolver + No Unknown",

    merchant,
    merchant_type: retailIntentGMV.merchant_type,

    likely_type: attribution_system,
    attribution_system,
    primary_claimer,

    publisher: finalPublisher,
    publisher_type: finalPublisherType,

    traffic_type: qualityIntent.traffic_type,
    commercial_intent: qualityIntent.commercial_intent,
    traffic_quality: qualityIntent.traffic_quality,
    incrementality_risk: qualityIntent.incrementality_risk,

    retail_intent_gmv: retailIntentGMV,

    channel_role: detectChannelRole({
      attribution_system,
      publisher_type: finalPublisherType
    }),

    conflict_risk: detectConflictRisk({
      attribution_system,
      publisher_type: finalPublisherType,
      params
    }),

    confidence:
      amazonPublisherInference?.confidence ||
      (finalMatchedBy === "hard_no_unknown_fallback" ||
      finalMatchedBy === "forced_no_unknown_fallback"
        ? "Low"
        : "Medium"),

    publisher_intelligence: {
      ...publisherIntel,
      publisher: finalPublisher,
      type: finalPublisherType,
      subtype: finalSubtype,
      media_group: finalMediaGroup,
      matched_by: finalMatchedBy,
      evidence:
        amazonPublisherInference?.evidence ||
        publisherIntel.evidence ||
        publisher_evidence || {
          tag: tag || null,
          ascsubtag: ascsubtag || null,
          host: urlObj?.hostname || null
        },
      fallback_inference: amazonPublisherInference || null
    },

    path_classification: pathInfo,

    evidence: {
      tag: tag || null,
      ascsubtag: ascsubtag || null,
      campaignId: getParam(params, "campaignId") || null,
      linkId: getParam(params, "linkId") || null,
      linkCode: getParam(params, "linkCode") || null,
      aa_campaignid: getParam(params, "aa_campaignid") || null,
      aa_adgroupid: getParam(params, "aa_adgroupid") || null,
      aa_creativeid: getParam(params, "aa_creativeid") || null,
      maas: getParam(params, "maas") || null,
      ref_: getParam(params, "ref_") || null,
      camp: getParam(params, "camp") || null,
      creative: getParam(params, "creative") || null,
      btn_ref: getParam(params, "btn_ref") || null,
      utm_source: getParam(params, "utm_source") || null,
      utm_medium: getParam(params, "utm_medium") || null,
      utm_campaign: getParam(params, "utm_campaign") || null
    }
  };
}
