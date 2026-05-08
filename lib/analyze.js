function normalizeAmazonTag(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
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

  if (tagNorm) {
    return {
      publisher: "Unknown Amazon Associate",
      type: "Affiliate",
      subtype: "Amazon Associates",
      media_group: "Unknown",
      matched_by: "amazon_tag_present_unknown_publisher",
      confidence: "Medium",
      evidence: {
        tag,
        ascsubtag: ascsubtag || null,
        host: urlObj?.hostname || null
      }
    };
  }

  return null;
}

function buildAmazonAttributionLayer(urlObj) {
  const params = getQueryParams(urlObj);
  const merchant = "Amazon";
  const attribution_system = detectAmazonAttributionSystem(params);

  const tag = getParam(params, "tag");
  const ascsubtag = getParam(params, "ascsubtag");

  const amazonPublisherInference =
    resolveAmazonPublisher({ tag, ascsubtag, urlObj }) ||
    inferPublisherFromAmazonTag(tag) ||
    inferPublisherFromAscSubtag(ascsubtag);

  const forcedPublisher =
    amazonPublisherInference?.confidence === "High"
      ? amazonPublisherInference
      : null;

  const initialPublisherIntel = buildPublisherIntelligence(urlObj, {});

  let publisher = initialPublisherIntel.publisher || "Unknown";
  let publisher_type = initialPublisherIntel.type || "Unknown";
  let publisher_subtype = initialPublisherIntel.subtype || "Unknown";
  let publisher_media_group = initialPublisherIntel.media_group || "Unknown";
  let publisher_matched_by = initialPublisherIntel.matched_by || "Unknown";
  let publisher_evidence = initialPublisherIntel.evidence || null;

  if (
    amazonPublisherInference &&
    (!publisher || publisher === "Unknown")
  ) {
    publisher = amazonPublisherInference.publisher;
    publisher_type = amazonPublisherInference.type;
    publisher_subtype = amazonPublisherInference.subtype || "Unknown";
    publisher_media_group = amazonPublisherInference.media_group || "Unknown";
    publisher_matched_by = amazonPublisherInference.matched_by;
    publisher_evidence = amazonPublisherInference.evidence;
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

  const primary_claimer = resolvePrimaryClaimer({
    attribution_system,
    publisher,
    merchant
  });

  if (
    (!publisher || publisher === "Unknown") &&
    primary_claimer &&
    primary_claimer !== "Unknown"
  ) {
    publisher = primary_claimer;
  }

  const publisherIntel = buildPublisherIntelligence(urlObj, {
    primary_claimer,
    publisher_hint: publisher
  });

  let finalPublisher =
    publisherIntel.publisher && publisherIntel.publisher !== "Unknown"
      ? publisherIntel.publisher
      : publisher || "Unknown";

  let finalPublisherType =
    publisherIntel.type && publisherIntel.type !== "Unknown"
      ? publisherIntel.type
      : publisher_type || "Unknown";

  let finalSubtype =
    publisherIntel.subtype && publisherIntel.subtype !== "Unknown"
      ? publisherIntel.subtype
      : publisher_subtype || "Unknown";

  let finalMediaGroup =
    publisherIntel.media_group && publisherIntel.media_group !== "Unknown"
      ? publisherIntel.media_group
      : publisher_media_group || "Unknown";

  let finalMatchedBy =
    publisherIntel.matched_by && publisherIntel.matched_by !== "Unknown"
      ? publisherIntel.matched_by
      : publisher_matched_by || "Unknown";

  if (amazonPublisherInference) {
    finalPublisher = amazonPublisherInference.publisher;
    finalPublisherType = amazonPublisherInference.type;
    finalSubtype = amazonPublisherInference.subtype;
    finalMediaGroup = amazonPublisherInference.media_group;
    finalMatchedBy = amazonPublisherInference.matched_by;
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
      "Attribution Layer Engine v2 + Publisher Intelligence v3 Fallback + Amazon Program Split v2.5 + Amazon Publisher Resolver",

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

    confidence: amazonPublisherInference?.confidence
      ? amazonPublisherInference.confidence
      : detectConfidence({
          attribution_system,
          publisher: finalPublisher,
          params
        }),

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
          ascsubtag: ascsubtag || null
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
      btn_ref: getParam(params, "btn_ref") || null
    }
  };
}
