const {
  buildPublisherIntelligence,
  cleanHostname,
  getQueryParams,
  getParam,
  detectAffiliateNetwork
} = require("./detect-publisher");

const { buildQualityIntentProfile } = require("./quality-intent-engine");
const { buildPathLabel } = require("./path-label-engine");

function safeUrlParse(input) {
  try {
    if (!input || typeof input !== "string") return null;

    let url = input.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    return new URL(url);
  } catch (e) {
    return null;
  }
}

function tryDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

function extractNestedUrl(rawUrl) {
  let current = rawUrl;
  let depth = 0;

  while (depth < 4) {
    const urlObj = safeUrlParse(current);
    if (!urlObj) break;

    const keys = [
      "url",
      "u",
      "target",
      "redirect",
      "redirect_url",
      "destination",
      "dest",
      "r",
      "to",
      "link",
      "u1"
    ];

    let found = "";

    for (const key of keys) {
      const val = urlObj.searchParams.get(key);
      if (val && /^https?:\/\//i.test(tryDecode(val))) {
        found = tryDecode(val);
        break;
      }
    }

    if (!found || found === current) break;

    current = found;
    depth++;
  }

  return current;
}

function hasAnyParam(params, keys) {
  return keys.some((k) => !!getParam(params, k));
}

function isAmazonHost(hostname) {
  return cleanHostname(hostname).includes("amazon.");
}

function detectRetailMapping(urlObj) {
  const host = cleanHostname(urlObj.hostname || "");
  const path = (urlObj.pathname || "").toLowerCase();
  const search = (urlObj.search || "").toLowerCase();

  let merchant = "Unknown";
  let merchant_type = "Unknown";
  let retail_mapping = "Unknown";
  let retail_path_type = "Unknown";
  let purchase_intent = "Unknown";
  let funnel_stage = "Unknown";
  let commercial_value = "Unknown";
  let gmv_potential = "Unknown";

  if (host.includes("amazon.")) {
    merchant = "Amazon";
    merchant_type = "Marketplace";

    if (
      path.includes("/dp/") ||
      path.includes("/gp/product/") ||
      path.includes("/gp/aw/d/")
    ) {
      retail_mapping = "Amazon PDP";
      retail_path_type = "Product Detail Page";
      purchase_intent = "High";
      funnel_stage = "Conversion";
      commercial_value = "High";
      gmv_potential = "High";
    } else if (path === "/s" || search.includes("k=")) {
      retail_mapping = "Amazon Search";
      retail_path_type = "Search Results Page";
      purchase_intent = "Medium";
      funnel_stage = "Consideration";
      commercial_value = "Medium";
      gmv_potential = "Medium";
    } else if (
      path === "/b" ||
      search.includes("node=") ||
      search.includes("bbn=")
    ) {
      retail_mapping = "Amazon Category";
      retail_path_type = "Category / Browse Page";
      purchase_intent = "Medium";
      funnel_stage = "Consideration";
      commercial_value = "Medium";
      gmv_potential = "Medium";
    } else if (path.includes("/stores/")) {
      retail_mapping = "Amazon Brand Store";
      retail_path_type = "Brand Storefront";
      purchase_intent = "Medium";
      funnel_stage = "Consideration";
      commercial_value = "Medium";
      gmv_potential = "Medium";
    } else if (path.includes("/deals") || path.includes("/goldbox")) {
      retail_mapping = "Amazon Deals";
      retail_path_type = "Deals Page";
      purchase_intent = "High";
      funnel_stage = "Purchase Trigger";
      commercial_value = "High";
      gmv_potential = "High";
    } else if (path.includes("/cart") || path.includes("/gp/cart")) {
      retail_mapping = "Amazon Cart";
      retail_path_type = "Cart Page";
      purchase_intent = "Very High";
      funnel_stage = "Checkout";
      commercial_value = "Very High";
      gmv_potential = "Very High";
    } else {
      retail_mapping = "Amazon Other";
      retail_path_type = "Amazon Page";
      purchase_intent = "Low";
      funnel_stage = "Unknown";
      commercial_value = "Low";
      gmv_potential = "Low";
    }
  } else if (host.includes("walmart.")) {
    merchant = "Walmart";
    merchant_type = "Retailer / Marketplace";

    if (path.includes("/ip/")) {
      retail_mapping = "Walmart PDP";
      retail_path_type = "Product Detail Page";
      purchase_intent = "High";
      funnel_stage = "Conversion";
      commercial_value = "High";
      gmv_potential = "High";
    } else if (path.includes("/search") || search.includes("q=")) {
      retail_mapping = "Walmart Search";
      retail_path_type = "Search Results Page";
      purchase_intent = "Medium";
      funnel_stage = "Consideration";
      commercial_value = "Medium";
      gmv_potential = "Medium";
    } else if (path.includes("/browse/") || search.includes("cat_id=")) {
      retail_mapping = "Walmart Category";
      retail_path_type = "Category Page";
      purchase_intent = "Medium";
      funnel_stage = "Consideration";
      commercial_value = "Medium";
      gmv_potential = "Medium";
    } else {
      retail_mapping = "Walmart Other";
      retail_path_type = "Retail Page";
      purchase_intent = "Low";
      funnel_stage = "Unknown";
      commercial_value = "Low";
      gmv_potential = "Low";
    }
  } else if (host.includes("target.")) {
    merchant = "Target";
    merchant_type = "Retailer";

    if (path.includes("/p/")) {
      retail_mapping = "Target PDP";
      retail_path_type = "Product Detail Page";
      purchase_intent = "High";
      funnel_stage = "Conversion";
      commercial_value = "High";
      gmv_potential = "High";
    } else if (path.includes("/s") || search.includes("searchterm=")) {
      retail_mapping = "Target Search";
      retail_path_type = "Search Results Page";
      purchase_intent = "Medium";
      funnel_stage = "Consideration";
      commercial_value = "Medium";
      gmv_potential = "Medium";
    } else if (path.includes("/c/")) {
      retail_mapping = "Target Category";
      retail_path_type = "Category Page";
      purchase_intent = "Medium";
      funnel_stage = "Consideration";
      commercial_value = "Medium";
      gmv_potential = "Medium";
    }
  } else if (host.includes("bestbuy.")) {
    merchant = "Best Buy";
    merchant_type = "Retailer";

    if (path.includes("/site/")) {
      retail_mapping = "Best Buy PDP";
      retail_path_type = "Product Detail Page";
      purchase_intent = "High";
      funnel_stage = "Conversion";
      commercial_value = "High";
      gmv_potential = "High";
    } else if (path.includes("/searchpage.jsp") || search.includes("st=")) {
      retail_mapping = "Best Buy Search";
      retail_path_type = "Search Results Page";
      purchase_intent = "Medium";
      funnel_stage = "Consideration";
      commercial_value = "Medium";
      gmv_potential = "Medium";
    }
  } else {
    merchant = host.replace(/^www\./, "");
    merchant_type = "Brand / DTC";

    if (path.includes("/products/")) {
      retail_mapping = "Shopify / DTC PDP";
      retail_path_type = "Product Detail Page";
      purchase_intent = "High";
      funnel_stage = "Conversion";
      commercial_value = "High";
      gmv_potential = "High";
    } else if (path.includes("/collections/") || path.includes("/category/")) {
      retail_mapping = "Collection / Category Page";
      retail_path_type = "Category Page";
      purchase_intent = "Medium";
      funnel_stage = "Consideration";
      commercial_value = "Medium";
      gmv_potential = "Medium";
    } else if (path.includes("/cart")) {
      retail_mapping = "Cart Page";
      retail_path_type = "Checkout Stage";
      purchase_intent = "Very High";
      funnel_stage = "Checkout";
      commercial_value = "Very High";
      gmv_potential = "Very High";
    } else {
      retail_mapping = "Brand / DTC Page";
      retail_path_type = "Brand Site Page";
      purchase_intent = "Low";
      funnel_stage = "Unknown";
      commercial_value = "Low";
      gmv_potential = "Low";
    }
  }

  return {
    merchant,
    merchant_type,
    retail_mapping,
    retail_path_type,
    purchase_intent,
    funnel_stage,
    commercial_value,
    gmv_potential
  };
}

function buildRetailIntentGMVLayer({
  urlObj,
  merchant,
  attribution_system,
  publisher_type
}) {
  const retail = detectRetailMapping(urlObj);

  let gmv_score = 35;

  if (retail.purchase_intent === "Very High") gmv_score += 45;
  else if (retail.purchase_intent === "High") gmv_score += 35;
  else if (retail.purchase_intent === "Medium") gmv_score += 20;
  else if (retail.purchase_intent === "Low") gmv_score += 5;

  if (attribution_system === "Amazon Creator Connections") gmv_score += 15;
  else if (attribution_system === "Amazon Associates") gmv_score += 12;
  else if (attribution_system === "Amazon Attribution") gmv_score += 8;
  else if (attribution_system && attribution_system !== "Unknown") gmv_score += 6;

  if (publisher_type === "Deal Site" || publisher_type === "Deal Community") {
    gmv_score += 15;
  } else if (
    publisher_type === "Editorial Review" ||
    publisher_type === "Editorial Commerce"
  ) {
    gmv_score += 10;
  } else if (publisher_type === "Creator / Influencer") {
    gmv_score += 8;
  } else if (publisher_type === "Advertiser") {
    gmv_score += 6;
  }

  if (gmv_score > 100) gmv_score = 100;

  let gmv_band = "Low";
  if (gmv_score >= 85) gmv_band = "Very High";
  else if (gmv_score >= 70) gmv_band = "High";
  else if (gmv_score >= 50) gmv_band = "Medium";

  return {
    ...retail,
    gmv_score,
    gmv_band,
    gmv_explanation: [
      `Retail path detected as: ${retail.retail_mapping}`,
      `Purchase intent classified as: ${retail.purchase_intent}`,
      `Funnel stage classified as: ${retail.funnel_stage}`,
      `GMV potential estimated as: ${gmv_band}`
    ]
  };
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
    ]) || String(getParam(params, "ref_") || "").includes("aa_maas");

  if (hasAccSignals) return "Amazon Creator Connections";
  if (hasAttributionSignals) return "Amazon Attribution";
  if (hasTag) return "Amazon Associates";
  return "Amazon";
}

/* =========================
   Publisher Intelligence v3 Fallback
   用于处理 tag / ascsubtag 没命中静态库的 Amazon 链接
========================= */

function inferPublisherFromAmazonTag(tag) {
  if (!tag) return null;

  const t = String(tag).toLowerCase();

  if (
    t.includes("bf") ||
    t.includes("buzzfeed") ||
    t.includes("buzz")
  ) {
    return {
      publisher: "BuzzFeed",
      type: "Editorial Commerce",
      subtype: "Content Commerce",
      media_group: "BuzzFeed",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  if (t.includes("cnet")) {
    return {
      publisher: "CNET",
      type: "Editorial Review",
      subtype: "Commerce Review",
      media_group: "Ziff Davis / Red Ventures",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  if (
    t.includes("future") ||
    t.includes("tomsguide") ||
    t.includes("techradar") ||
    t.includes("toms")
  ) {
    return {
      publisher: "Future Publishing",
      type: "Editorial Review",
      subtype: "Commerce Content",
      media_group: "Future PLC",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  if (
    t.includes("slickdeals") ||
    t.includes("slick") ||
    t.includes("sd-")
  ) {
    return {
      publisher: "Slickdeals",
      type: "Deal Community",
      subtype: "Deal / Coupon",
      media_group: "Slickdeals",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  if (
    t.includes("pcmag") ||
    t.includes("p00935")
  ) {
    return {
      publisher: "PCMag",
      type: "Editorial Review",
      subtype: "Commerce Review",
      media_group: "Ziff Davis",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  if (
    t.includes("wirecutter") ||
    t.includes("nytimes")
  ) {
    return {
      publisher: "Wirecutter",
      type: "Editorial Review",
      subtype: "Product Review",
      media_group: "The New York Times",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  if (
    t.includes("forbes") ||
    t.includes("zdnet") ||
    t.includes("ign") ||
    t.includes("verge")
  ) {
    return {
      publisher: "Editorial Publisher",
      type: "Editorial Commerce",
      subtype: "Commerce Content",
      media_group: "Unknown Media Group",
      matched_by: "amazon_tag_pattern",
      confidence: "Low",
      evidence: tag
    };
  }

  return null;
}

function inferPublisherFromAscSubtag(ascsubtag) {
  if (!ascsubtag) return null;

  const raw = String(ascsubtag);
  const decoded = tryDecode(raw).toLowerCase();

  if (
    decoded.includes("bf-") ||
    decoded.includes("buzzfeed") ||
    decoded.includes("bf-sfp") ||
    decoded.includes("bf-shp") ||
    decoded.includes("bf-shopping")
  ) {
    return {
      publisher: "BuzzFeed",
      type: "Editorial Commerce",
      subtype: "Shopping / Content Commerce",
      media_group: "BuzzFeed",
      matched_by: "ascsubtag_pattern",
      confidence: "Medium",
      evidence: raw
    };
  }

  if (decoded.includes("cnet")) {
    return {
      publisher: "CNET",
      type: "Editorial Review",
      subtype: "Commerce Review",
      media_group: "Ziff Davis / Red Ventures",
      matched_by: "ascsubtag_pattern",
      confidence: "Medium",
      evidence: raw
    };
  }

  if (
    decoded.includes("future") ||
    decoded.includes("tomsguide") ||
    decoded.includes("techradar")
  ) {
    return {
      publisher: "Future Publishing",
      type: "Editorial Review",
      subtype: "Commerce Content",
      media_group: "Future PLC",
      matched_by: "ascsubtag_pattern",
      confidence: "Medium",
      evidence: raw
    };
  }

  if (
    decoded.includes("slickdeals") ||
    decoded.includes("sd-") ||
    decoded.includes("slick")
  ) {
    return {
      publisher: "Slickdeals",
      type: "Deal Community",
      subtype: "Deal / Coupon",
      media_group: "Slickdeals",
      matched_by: "ascsubtag_pattern",
      confidence: "Medium",
      evidence: raw
    };
  }

  if (
    decoded.includes("pcmag") ||
    decoded.includes("ziff")
  ) {
    return {
      publisher: "PCMag / Ziff Davis",
      type: "Editorial Review",
      subtype: "Commerce Review",
      media_group: "Ziff Davis",
      matched_by: "ascsubtag_pattern",
      confidence: "Medium",
      evidence: raw
    };
  }

  return null;
}

function detectChannelRole({ attribution_system, publisher_type }) {
  if (
    attribution_system === "Amazon Associates" &&
    (publisher_type === "Deal Site" || publisher_type === "Deal Community")
  ) {
    return "Closer";
  }

  if (publisher_type === "Deal Site" || publisher_type === "Deal Community") {
    return "Closer";
  }

  if (
    publisher_type === "Editorial Review" ||
    publisher_type === "Editorial Commerce"
  ) {
    return "Mid-Funnel Influencer";
  }

  if (publisher_type === "Creator / Influencer") {
    return "Influencer";
  }

  if (
    attribution_system === "Amazon Attribution" ||
    attribution_system === "Google Ads" ||
    attribution_system === "Meta Ads" ||
    attribution_system === "TikTok Ads" ||
    attribution_system === "Microsoft Ads"
  ) {
    return "Traffic Driver";
  }

  return "Closer";
}

function detectConflictRisk({ attribution_system, publisher_type, params }) {
  const hasSubtag = !!getParam(params, "ascsubtag");

  const hasPaidSignals = hasAnyParam(params, [
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
    "ttclid",
    "msclkid"
  ]);

  const hasAffiliateSignals = hasAnyParam(params, [
    "tag",
    "ascsubtag",
    "irclickid",
    "irgwc",
    "awc",
    "cjevent",
    "clickref",
    "ranMID",
    "ranEAID"
  ]);

  if (hasPaidSignals && hasAffiliateSignals) {
    return "High";
  }

  if (attribution_system === "Amazon Attribution") {
    return "Medium";
  }

  if (
    attribution_system === "Amazon Associates" &&
    (
      publisher_type === "Deal Site" ||
      publisher_type === "Deal Community" ||
      publisher_type === "Editorial Commerce" ||
      publisher_type === "Editorial Review"
    ) &&
    hasSubtag
  ) {
    return "Low";
  }

  if (hasPaidSignals) {
    return "Medium";
  }

  return "Low";
}

function detectConfidence({ attribution_system, publisher, params }) {
  if (
    attribution_system === "Amazon Associates" &&
    publisher &&
    publisher !== "Unknown" &&
    getParam(params, "tag")
  ) {
    return "High";
  }

  if (
    attribution_system === "Amazon Creator Connections" &&
    (getParam(params, "campaignId") || getParam(params, "linkId"))
  ) {
    return "High";
  }

  if (
    attribution_system === "Amazon Attribution" &&
    (getParam(params, "maas") || getParam(params, "aa_campaignid"))
  ) {
    return "High";
  }

  if (attribution_system && attribution_system !== "Unknown") {
    return "Medium";
  }

  return "Low";
}

function resolvePrimaryClaimer({ attribution_system, publisher, merchant }) {
  if (
    attribution_system === "Amazon Associates" ||
    attribution_system === "Amazon Creator Connections"
  ) {
    return publisher && publisher !== "Unknown" ? publisher : attribution_system;
  }

  if (attribution_system === "Amazon Attribution") {
    return "Advertiser / Brand";
  }

  if (
    attribution_system === "Google Ads" ||
    attribution_system === "Meta Ads" ||
    attribution_system === "TikTok Ads" ||
    attribution_system === "Microsoft Ads"
  ) {
    return "Advertiser / Brand";
  }

  return publisher && publisher !== "Unknown" ? publisher : merchant || "Merchant";
}

function buildAmazonAttributionLayer(urlObj) {
  const params = getQueryParams(urlObj);
  const merchant = "Amazon";
  const attribution_system = detectAmazonAttributionSystem(params);

  const tag = getParam(params, "tag");
  const ascsubtag = getParam(params, "ascsubtag");

  const tagInference = inferPublisherFromAmazonTag(tag);
  const subtagInference = inferPublisherFromAscSubtag(ascsubtag);

  const initialPublisherIntel = buildPublisherIntelligence(urlObj, {});
  let publisher = initialPublisherIntel.publisher || "Unknown";
  let publisher_type = initialPublisherIntel.type || "Unknown";
  let publisher_subtype = initialPublisherIntel.subtype || "Unknown";
  let publisher_media_group = initialPublisherIntel.media_group || "Unknown";
  let publisher_matched_by = initialPublisherIntel.matched_by || "Unknown";
  let publisher_evidence = initialPublisherIntel.evidence || null;

  if (!publisher || publisher === "Unknown") {
    const inferred = tagInference || subtagInference;

    if (inferred) {
      publisher = inferred.publisher;
      publisher_type = inferred.type;
      publisher_subtype = inferred.subtype || "Unknown";
      publisher_media_group = inferred.media_group || "Unknown";
      publisher_matched_by = inferred.matched_by;
      publisher_evidence = inferred.evidence;
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

  const finalPublisher =
    publisherIntel.publisher && publisherIntel.publisher !== "Unknown"
      ? publisherIntel.publisher
      : publisher || "Unknown";

  const finalPublisherType =
    publisherIntel.type && publisherIntel.type !== "Unknown"
      ? publisherIntel.type
      : publisher_type || "Unknown";

  const finalSubtype =
    publisherIntel.subtype && publisherIntel.subtype !== "Unknown"
      ? publisherIntel.subtype
      : publisher_subtype || "Unknown";

  const finalMediaGroup =
    publisherIntel.media_group && publisherIntel.media_group !== "Unknown"
      ? publisherIntel.media_group
      : publisher_media_group || "Unknown";

  const finalMatchedBy =
    publisherIntel.matched_by && publisherIntel.matched_by !== "Unknown"
      ? publisherIntel.matched_by
      : publisher_matched_by || "Unknown";

  const qualityIntent = buildQualityIntentProfile({
    attribution_system,
    publisher_type: finalPublisherType,
    subtype: finalSubtype,
    params
  });

  const pathInfo = buildPathLabel({
    network: attribution_system,
    attribution_system,
    likely_type: attribution_system,
    merchant,
    publisher: finalPublisher,
    publisher_type: finalPublisherType
  });

  const retailIntentGMV = buildRetailIntentGMVLayer({
    urlObj,
    merchant,
    attribution_system,
    publisher_type: finalPublisherType
  });

  return {
    engine:
      "Attribution Layer Engine v2 + Publisher Intelligence v3 Fallback + Quality & Intent Engine v2 + Path Label Engine v1 + Retail Intent GMV Engine v2.3",

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

    confidence: detectConfidence({
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
      evidence: publisherIntel.evidence || publisher_evidence || {
        tag: tag || null,
        ascsubtag: ascsubtag || null
      },
      fallback_inference: tagInference || subtagInference || null
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
      creative: getParam(params, "creative") || null
    }
  };
}

function detectGenericNetworkResult(urlObj) {
  const params = getQueryParams(urlObj);
  const hostname = cleanHostname(urlObj.hostname || "");
  const network = detectAffiliateNetwork(params, hostname);

  const retailIntentGMV = buildRetailIntentGMVLayer({
    urlObj,
    merchant: "Merchant",
    attribution_system: network,
    publisher_type: "Affiliate Publisher"
  });

  if (network === "Unknown" && retailIntentGMV.retail_mapping === "Unknown") {
    return null;
  }

  const publisherIntel = buildPublisherIntelligence(urlObj, {});
  const publisher = publisherIntel.publisher || "Unknown";

  const likelyType =
    network === "Google Ads" ||
    network === "Meta Ads" ||
    network === "TikTok Ads" ||
    network === "Microsoft Ads"
      ? "Paid Media"
      : network !== "Unknown"
        ? "Affiliate"
        : "Retail / DTC";

  const primaryClaimer =
    likelyType === "Paid Media"
      ? "Advertiser / Brand"
      : publisher !== "Unknown"
        ? publisher
        : network !== "Unknown"
          ? `${network} Publisher`
          : retailIntentGMV.merchant;

  const qualityIntent = buildQualityIntentProfile({
    attribution_system: network,
    publisher_type: publisherIntel.type || "Affiliate Publisher",
    subtype: publisherIntel.subtype || "General Affiliate",
    params
  });

  const pathInfo = buildPathLabel({
    network,
    attribution_system: network,
    likely_type: likelyType,
    merchant: retailIntentGMV.merchant || "Merchant",
    publisher,
    publisher_type: publisherIntel.type || "Affiliate Publisher"
  });

  return {
    network,
    likely_type: likelyType,
    merchant: retailIntentGMV.merchant,
    merchant_type: retailIntentGMV.merchant_type,
    retail_intent_gmv: retailIntentGMV,

    final_verdict: {
      likely_type: likelyType,
      primary_claimer: primaryClaimer,
      publisher,
      confidence: publisher !== "Unknown" ? "Medium" : "Low",
      conflict_risk: detectConflictRisk({
        attribution_system: network,
        publisher_type: publisherIntel.type || "Affiliate Publisher",
        params
      }),
      channel_role: detectChannelRole({
        attribution_system: network,
        publisher_type: publisherIntel.type || "Affiliate Publisher"
      }),
      gmv_band: retailIntentGMV.gmv_band,
      gmv_score: retailIntentGMV.gmv_score
    },

    publisher_intelligence: publisherIntel,
    quality_and_intent: qualityIntent,
    path_classification: pathInfo
  };
}

function analyzeLink(url) {
  if (!url || typeof url !== "string") {
    return {
      version: "v2.3.1",
      error: true,
      message: "Invalid URL"
    };
  }

  const originalUrl = url.trim();
  const resolvedUrl = extractNestedUrl(originalUrl);
  const urlObj = safeUrlParse(resolvedUrl);

  if (!urlObj) {
    return {
      version: "v2.3.1",
      error: true,
      message: "Invalid URL format",
      analyzed_url: originalUrl,
      resolved_url: resolvedUrl
    };
  }

  const hostname = cleanHostname(urlObj.hostname || "");

  if (isAmazonHost(hostname)) {
    const amazonLayer = buildAmazonAttributionLayer(urlObj);
    const retail = amazonLayer.retail_intent_gmv;

    return {
      version: "v2.3.1",
      analyzed_url: originalUrl,
      resolved_url: resolvedUrl,
      hostname,

      merchant: amazonLayer.merchant,
      merchant_type: amazonLayer.merchant_type,

      network: amazonLayer.attribution_system,
      likely_type: amazonLayer.likely_type,

      retail_mapping: retail.retail_mapping,
      retail_path_type: retail.retail_path_type,
      purchase_intent: retail.purchase_intent,
      funnel_stage: retail.funnel_stage,
      commercial_value: retail.commercial_value,
      gmv_potential: retail.gmv_potential,
      gmv_score: retail.gmv_score,
      gmv_band: retail.gmv_band,

      final_verdict: {
        likely_type: amazonLayer.likely_type,
        primary_claimer: amazonLayer.primary_claimer,
        publisher: amazonLayer.publisher,
        confidence: amazonLayer.confidence,
        conflict_risk: amazonLayer.conflict_risk,
        channel_role: amazonLayer.channel_role,
        gmv_band: retail.gmv_band,
        gmv_score: retail.gmv_score
      },

      attribution_layer: {
        merchant: amazonLayer.merchant,
        merchant_type: amazonLayer.merchant_type,
        attribution_system: amazonLayer.attribution_system,
        primary_claimer: amazonLayer.primary_claimer,
        publisher: amazonLayer.publisher,
        publisher_type: amazonLayer.publisher_type
      },

      retail_intent_gmv: retail,

      quality_and_intent: {
        traffic_quality: amazonLayer.traffic_quality,
        commercial_intent: amazonLayer.commercial_intent,
        traffic_type: amazonLayer.traffic_type,
        incrementality_risk: amazonLayer.incrementality_risk,
        purchase_intent: retail.purchase_intent,
        funnel_stage: retail.funnel_stage,
        commercial_value: retail.commercial_value,
        gmv_potential: retail.gmv_potential,
        gmv_score: retail.gmv_score,
        gmv_band: retail.gmv_band
      },

      publisher_intelligence: {
        publisher: amazonLayer.publisher_intelligence.publisher,
        type: amazonLayer.publisher_intelligence.type,
        media_group: amazonLayer.publisher_intelligence.media_group,
        subtype: amazonLayer.publisher_intelligence.subtype,
        matched_by: amazonLayer.publisher_intelligence.matched_by,
        evidence: amazonLayer.publisher_intelligence.evidence,
        fallback_inference: amazonLayer.publisher_intelligence.fallback_inference || null
      },

      path_classification: amazonLayer.path_classification,
      evidence: amazonLayer.evidence,
      engine: amazonLayer.engine,

      explanation: [
        `Original URL: ${originalUrl}`,
        `Resolved URL: ${resolvedUrl}`,
        `Merchant detected: ${amazonLayer.merchant}`,
        `Merchant type classified as: ${amazonLayer.merchant_type}`,
        `Retail mapping detected as: ${retail.retail_mapping}`,
        `Purchase intent classified as: ${retail.purchase_intent}`,
        `Funnel stage classified as: ${retail.funnel_stage}`,
        `GMV potential estimated as: ${retail.gmv_band} (${retail.gmv_score}/100)`,
        `Attribution system detected: ${amazonLayer.attribution_system}`,
        `Primary claimer resolved to: ${amazonLayer.primary_claimer}`,
        `Publisher identified as: ${amazonLayer.publisher}`,
        `Publisher type classified as: ${amazonLayer.publisher_type}`,
        `Traffic type classified as: ${amazonLayer.traffic_type}`,
        `Path label classified as: ${amazonLayer.path_classification.path_label}`
      ]
    };
  }

  const genericResult = detectGenericNetworkResult(urlObj);

  if (genericResult) {
    const retail = genericResult.retail_intent_gmv;

    return {
      version: "v2.3.1",
      analyzed_url: originalUrl,
      resolved_url: resolvedUrl,
      hostname,

      merchant: retail.merchant,
      merchant_type: retail.merchant_type,

      network: genericResult.network,
      likely_type: genericResult.likely_type,

      retail_mapping: retail.retail_mapping,
      retail_path_type: retail.retail_path_type,
      purchase_intent: retail.purchase_intent,
      funnel_stage: retail.funnel_stage,
      commercial_value: retail.commercial_value,
      gmv_potential: retail.gmv_potential,
      gmv_score: retail.gmv_score,
      gmv_band: retail.gmv_band,

      final_verdict: genericResult.final_verdict,

      attribution_layer: {
        merchant: retail.merchant,
        merchant_type: retail.merchant_type,
        attribution_system: genericResult.network,
        primary_claimer: genericResult.final_verdict.primary_claimer,
        publisher: genericResult.final_verdict.publisher,
        publisher_type:
          genericResult.publisher_intelligence.type || "Affiliate Publisher"
      },

      retail_intent_gmv: retail,
      publisher_intelligence: genericResult.publisher_intelligence,
      quality_and_intent: {
        ...genericResult.quality_and_intent,
        purchase_intent: retail.purchase_intent,
        funnel_stage: retail.funnel_stage,
        commercial_value: retail.commercial_value,
        gmv_potential: retail.gmv_potential,
        gmv_score: retail.gmv_score,
        gmv_band: retail.gmv_band
      },
      path_classification: genericResult.path_classification,

      explanation: [
        `Original URL: ${originalUrl}`,
        `Resolved URL: ${resolvedUrl}`,
        `Merchant detected: ${retail.merchant}`,
        `Merchant type classified as: ${retail.merchant_type}`,
        `Retail mapping detected as: ${retail.retail_mapping}`,
        `Network detected as: ${genericResult.network}`,
        `GMV potential estimated as: ${retail.gmv_band} (${retail.gmv_score}/100)`
      ]
    };
  }

  return {
    version: "v2.3.1",
    analyzed_url: originalUrl,
    resolved_url: resolvedUrl,
    hostname,
    network: "Unknown",
    likely_type: "Unknown",

    merchant: "Unknown",
    merchant_type: "Unknown",
    retail_mapping: "Unknown",
    retail_path_type: "Unknown",
    purchase_intent: "Unknown",
    funnel_stage: "Unknown",
    commercial_value: "Unknown",
    gmv_potential: "Unknown",
    gmv_score: 0,
    gmv_band: "Unknown",

    final_verdict: {
      likely_type: "Unknown",
      primary_claimer: "Unknown",
      publisher: "Unknown",
      confidence: "Low",
      conflict_risk: "Unknown",
      channel_role: "Unknown",
      gmv_band: "Unknown",
      gmv_score: 0
    },

    attribution_layer: {
      merchant: "Unknown",
      merchant_type: "Unknown",
      attribution_system: "Unknown",
      primary_claimer: "Unknown",
      publisher: "Unknown",
      publisher_type: "Unknown"
    },

    retail_intent_gmv: {
      merchant: "Unknown",
      merchant_type: "Unknown",
      retail_mapping: "Unknown",
      retail_path_type: "Unknown",
      purchase_intent: "Unknown",
      funnel_stage: "Unknown",
      commercial_value: "Unknown",
      gmv_potential: "Unknown",
      gmv_score: 0,
      gmv_band: "Unknown"
    },

    path_classification: {
      path_label: "Unknown Path - Orders",
      path_group: "Unknown Order Path",
      path_nodes: ["Unknown", "Unknown", "Orders"]
    },

    explanation: [
      "No strong affiliate, attribution, paid-media, or retail intent signals were detected."
    ]
  };
}

module.exports = {
  analyzeLink
};
