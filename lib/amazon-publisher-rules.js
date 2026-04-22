// /lib/amazon-publisher-rules.js

const { getHostname, getQueryParams, pushEvidence } = require("./url-utils");
const {
  findPublisherByAmazonTag,
  findPublisherByTextFingerprint
} = require("./publisher-library");

/**
 * Amazon Associates tag 主映射表
 * 这里放你已经确认过的 tag -> publisher
 */
const AMAZON_ASSOCIATES_TAG_MAP = {
  "p00935-20": {
    name: "PCMag",
    type: "Review / Editorial",
    slug: "pcmag",
    notes: "Confirmed from multiple PCMag Amazon Associates links."
  },

  "slickdeals09-20": {
    name: "Slickdeals",
    type: "Deal / Coupon",
    slug: "slickdeals",
    notes: "Confirmed from repeated Slickdeals Amazon links."
  }

  // 后面持续补：
  // "xxxxxx-20": {
  //   name: "CNET",
  //   type: "Review / Editorial",
  //   slug: "cnet",
  //   notes: "Confirmed from multiple CNET Amazon links."
  // }
};

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function looksLikeAmazonHost(hostname = "") {
  const h = normalizeText(hostname);
  return (
    h === "amazon.com" ||
    h.endsWith(".amazon.com") ||
    h === "www.amazon.com" ||
    h.includes("amazon.")
  );
}

function resolveAmazonAssociateTag(tag) {
  if (!tag) return null;

  const normalized = String(tag).trim();
  const direct = AMAZON_ASSOCIATES_TAG_MAP[normalized];
  if (direct) {
    return {
      publisherName: direct.name || null,
      publisherType: direct.type || null,
      publisherSlug: direct.slug || null,
      matchMethod: "amazonTagMap",
      confidence: 0.99,
      note: direct.notes || null
    };
  }

  // fallback: 去 publisher library 查 amazonTags
  const libraryHit = findPublisherByAmazonTag(normalized);
  if (libraryHit) {
    return {
      publisherName: libraryHit.name || null,
      publisherType: libraryHit.type || null,
      publisherSlug: libraryHit.slug || null,
      matchMethod: "publisherLibrary.amazonTag",
      confidence: 0.97,
      note: libraryHit.notes || null
    };
  }

  return null;
}

function inferAmazonLinkMode(params = {}) {
  const linkCode = normalizeText(params.linkCode || "");

  if (!linkCode) return null;

  // 常见 Amazon affiliate linkCode
  // ur2 / ll1 / ll2 / as2 / sl1 / sl2 等
  if (["ur2", "ll1", "ll2", "as2", "sl1", "sl2", "ogi", "ogi1"].includes(linkCode)) {
    return "Amazon Associates";
  }

  if (linkCode.startsWith("ur") || linkCode.startsWith("ll") || linkCode.startsWith("as")) {
    return "Amazon Associates";
  }

  return "Amazon Tracking";
}

function detectAmazonCommercialFormat(url = "", params = {}) {
  const lowerUrl = normalizeText(url);

  if (lowerUrl.includes("/dp/")) return "Product Detail Page";
  if (lowerUrl.includes("/gp/product/")) return "Product Detail Page";
  if (lowerUrl.includes("/hz/wishlist/")) return "Wishlist";
  if (lowerUrl.includes("/shops/")) return "Storefront / Creator Page";
  if (lowerUrl.includes("/b?")) return "Browse / Category";
  if (lowerUrl.includes("/s?")) return "Search Results";

  if (params.node) return "Browse / Category";
  if (params.k) return "Search Results";

  return "Amazon Page";
}

function buildAmazonFingerprintText({ url = "", params = {} }) {
  return [
    url,
    params.tag,
    params.ascsubtag,
    params.linkCode,
    params.camp,
    params.creative,
    params.creativeASIN,
    params.asc_source,
    params.ref_,
    params.subtag
  ]
    .filter(Boolean)
    .join(" | ");
}

function resolveAmazonByFingerprint({ url = "", params = {} }) {
  const text = buildAmazonFingerprintText({ url, params });

  const libraryHit = findPublisherByTextFingerprint(text);
  if (!libraryHit) return null;

  return {
    publisherName: libraryHit.name || null,
    publisherType: libraryHit.type || null,
    publisherSlug: libraryHit.slug || null,
    matchMethod: "publisherLibrary.fingerprint",
    confidence: 0.78,
    note: libraryHit.notes || null
  };
}

function detectAmazonPublisherFromUrl(url = "") {
  const hostname = getHostname(url);
  const params = getQueryParams(url);
  const evidence = [];

  if (!looksLikeAmazonHost(hostname)) {
    return null;
  }

  const tag = params.tag || null;
  const ascsubtag = params.ascsubtag || null;
  const linkCode = params.linkCode || null;
  const camp = params.camp || null;
  const creative = params.creative || null;
  const creativeASIN = params.creativeASIN || null;

  let result = {
    isAmazon: true,
    merchant: "Amazon",
    network: null,
    channel: null,
    program: null,

    status: "unresolved",
    confidence: 0,

    publisherToken: null,
    publisherId: null,
    publisherName: null,
    publisherType: null,
    publisherSlug: null,

    matchMethod: null,
    note: null,

    tracking: {
      tag,
      ascsubtag,
      linkCode,
      camp,
      creative,
      creativeASIN,
      ref: params.ref_ || null,
      th: params.th || null
    },

    pageType: detectAmazonCommercialFormat(url, params),
    matchedRules: [],
    evidence: []
  };

  // -------- Rule 1: tag -> Amazon Associates --------
  if (tag) {
    result.network = "Amazon Associates";
    result.channel = "Affiliate";
    result.program = "Amazon Associates";
    result.publisherToken = tag;
    result.publisherId = tag;
    result.status = "partial";
    result.confidence = 0.96;
    result.matchedRules.push("amazon_tag");
  }

  // -------- Rule 2: linkCode / camp / creative 常见 Amazon affiliate signals --------
  if (linkCode || camp || creative) {
    result.network = result.network || inferAmazonLinkMode(params) || "Amazon Tracking";
    result.channel = result.channel || "Affiliate";
    result.program = result.program || inferAmazonLinkMode(params) || "Amazon Tracking";
    result.status = result.status === "unresolved" ? "partial" : result.status;
    result.confidence = Math.max(result.confidence, 0.9);
    result.matchedRules.push("amazon_linkcode_campaign_creative");
  }

  // -------- Rule 3: 明确 tag map 命中 --------
  if (tag) {
    const tagResolved = resolveAmazonAssociateTag(tag);
    if (tagResolved) {
      result.publisherName = tagResolved.publisherName;
      result.publisherType = tagResolved.publisherType;
      result.publisherSlug = tagResolved.publisherSlug;
      result.matchMethod = tagResolved.matchMethod;
      result.note = tagResolved.note;
      result.status = "resolved";
      result.confidence = Math.max(result.confidence, tagResolved.confidence || 0.99);
      result.matchedRules.push("amazon_tag_map");
    }
  }

  // -------- Rule 4: fallback 指纹推断 --------
  if (!result.publisherName) {
    const fpResolved = resolveAmazonByFingerprint({ url, params });
    if (fpResolved) {
      result.publisherName = fpResolved.publisherName;
      result.publisherType = fpResolved.publisherType;
      result.publisherSlug = fpResolved.publisherSlug;
      result.matchMethod = fpResolved.matchMethod;
      result.note = fpResolved.note;
      result.status = "resolved";
      result.confidence = Math.max(result.confidence, fpResolved.confidence || 0.78);
      result.matchedRules.push("amazon_fingerprint");
    }
  }

  // -------- Evidence --------
  pushEvidence(evidence, "hostname", hostname);
  pushEvidence(evidence, "tag", tag);
  pushEvidence(evidence, "ascsubtag", ascsubtag);
  pushEvidence(evidence, "linkCode", linkCode);
  pushEvidence(evidence, "camp", camp);
  pushEvidence(evidence, "creative", creative);
  pushEvidence(evidence, "creativeASIN", creativeASIN);
  pushEvidence(evidence, "ref_", params.ref_);
  pushEvidence(evidence, "pageType", result.pageType);
  pushEvidence(evidence, "publisherName", result.publisherName);
  pushEvidence(evidence, "publisherType", result.publisherType);
  pushEvidence(evidence, "matchMethod", result.matchMethod);

  result.evidence = evidence;

  return result;
}

module.exports = {
  AMAZON_ASSOCIATES_TAG_MAP,
  detectAmazonPublisherFromUrl,
  resolveAmazonAssociateTag,
  inferAmazonLinkMode
};
