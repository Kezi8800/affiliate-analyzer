const { getPublisherRules, normalizeText } = require("./publisher-rules");

function cleanHostname(hostname) {
  return String(hostname || "")
    .toLowerCase()
    .replace(/^www\./, "");
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

function collectSignals(urlObj, extra = {}) {
  const hostname = cleanHostname(urlObj?.hostname || "");
  const params = getQueryParams(urlObj);

  const tag = normalizeText(getParam(params, "tag"));
  const utm_source = normalizeText(getParam(params, "utm_source"));
  const source = normalizeText(getParam(params, "source"));
  const sourceid = normalizeText(getParam(params, "sourceid"));
  const ref = normalizeText(getParam(params, "ref"));
  const ref_ = normalizeText(getParam(params, "ref_"));
  const clickref = normalizeText(getParam(params, "clickref"));
  const subid1 = normalizeText(getParam(params, "subid1"));
  const ascsubtag = normalizeText(getParam(params, "ascsubtag"));

  const joined = [
    hostname,
    tag,
    utm_source,
    source,
    sourceid,
    ref,
    ref_,
    clickref,
    subid1,
    ascsubtag,
    normalizeText(extra.publisher_hint),
    normalizeText(extra.primary_claimer)
  ]
    .filter(Boolean)
    .join(" ");

  return {
    hostname,
    params,
    tag,
    utm_source,
    source,
    sourceid,
    ref,
    ref_,
    clickref,
    subid1,
    ascsubtag,
    joined
  };
}

function matchByAmazonTag(tag) {
  if (!tag) return null;

  const rules = getPublisherRules();

  for (const rule of rules) {
    const tags = (rule.amazon_tags || []).map(normalizeText);
    if (tags.includes(normalizeText(tag))) {
      return {
        publisher: rule.name,
        media_group: rule.media_group,
        type: rule.type,
        subtype: rule.subtype,
        matched_by: "amazon_tag",
        evidence: `Matched amazon tag: ${tag}`
      };
    }
  }

  return null;
}

function matchByHostname(hostname) {
  if (!hostname) return null;

  const rules = getPublisherRules();
  const cleaned = cleanHostname(hostname);

  for (const rule of rules) {
    const hostnames = (rule.hostnames || []).map(cleanHostname);
    if (hostnames.includes(cleaned)) {
      return {
        publisher: rule.name,
        media_group: rule.media_group,
        type: rule.type,
        subtype: rule.subtype,
        matched_by: "hostname",
        evidence: `Matched hostname: ${cleaned}`
      };
    }
  }

  return null;
}

function matchByKeyword(joined) {
  const haystack = normalizeText(joined);
  if (!haystack) return null;

  const rules = getPublisherRules();

  for (const rule of rules) {
    const keywords = (rule.keywords || []).map(normalizeText);
    if (keywords.some((kw) => kw && haystack.includes(kw))) {
      return {
        publisher: rule.name,
        media_group: rule.media_group,
        type: rule.type,
        subtype: rule.subtype,
        matched_by: "keyword",
        evidence: `Matched keyword from signals: ${rule.keywords.join(", ")}`
      };
    }
  }

  return null;
}

function inferTypeFromText(joined) {
  const text = normalizeText(joined);

  if (!text) {
    return {
      type: "Unknown",
      subtype: "Unknown"
    };
  }

  if (
    text.includes("deal") ||
    text.includes("bargain") ||
    text.includes("sale") ||
    text.includes("discount")
  ) {
    return {
      type: "Deal Site",
      subtype: "Deal Aggregator"
    };
  }

  if (
    text.includes("coupon") ||
    text.includes("promo") ||
    text.includes("voucher") ||
    text.includes("cashback")
  ) {
    return {
      type: "Coupon Site",
      subtype: "Coupon / Cashback"
    };
  }

  if (
    text.includes("review") ||
    text.includes("guide") ||
    text.includes("best ") ||
    text.includes("compare") ||
    text.includes("editorial")
  ) {
    return {
      type: "Editorial Review",
      subtype: "SEO Review Site"
    };
  }

  if (
    text.includes("creator") ||
    text.includes("influencer") ||
    text.includes("youtube") ||
    text.includes("tiktok") ||
    text.includes("instagram")
  ) {
    return {
      type: "Creator / Influencer",
      subtype: "Social Commerce"
    };
  }

  if (
    text.includes("community") ||
    text.includes("forum") ||
    text.includes("reddit")
  ) {
    return {
      type: "Forum / Community",
      subtype: "User-Generated Discovery"
    };
  }

  return {
    type: "Affiliate Publisher",
    subtype: "General Affiliate"
  };
}

function inferMediaGroup(publisher, type) {
  const p = normalizeText(publisher);
  const t = normalizeText(type);

  if (!p || p === "unknown") {
    if (t === "deal site" || t === "deal community") {
      return "Independent Deal Publisher";
    }
    if (t === "editorial review") {
      return "Commerce Content Publisher";
    }
    if (t === "coupon site") {
      return "Coupon / Savings Publisher";
    }
    if (t === "creator / influencer") {
      return "Independent Creator";
    }
    return "Unknown";
  }

  return "Independent Publisher";
}

function buildPublisherIntelligence(urlObj, extra = {}) {
  const signals = collectSignals(urlObj, extra);

  const tagMatch = matchByAmazonTag(signals.tag);
  if (tagMatch) return tagMatch;

  const hostMatch = matchByHostname(signals.hostname);
  if (hostMatch) return hostMatch;

  const keywordMatch = matchByKeyword(signals.joined);
  if (keywordMatch) return keywordMatch;

  const fallbackPublisher =
    extra.primary_claimer && extra.primary_claimer !== "Unknown"
      ? extra.primary_claimer
      : extra.publisher_hint && extra.publisher_hint !== "Unknown"
      ? extra.publisher_hint
      : "Unknown";

  const inferred = inferTypeFromText(
    [signals.joined, fallbackPublisher].filter(Boolean).join(" ")
  );

  return {
    publisher: fallbackPublisher || "Unknown",
    media_group: inferMediaGroup(fallbackPublisher, inferred.type),
    type: inferred.type,
    subtype: inferred.subtype,
    matched_by:
      fallbackPublisher && fallbackPublisher !== "Unknown"
        ? "fallback_hint"
        : "heuristic",
    evidence:
      fallbackPublisher && fallbackPublisher !== "Unknown"
        ? `Used fallback publisher hint: ${fallbackPublisher}`
        : "No explicit publisher rule matched; classified by heuristic signals."
  };
}

module.exports = {
  buildPublisherIntelligence,
  cleanHostname,
  getQueryParams,
  getParam
};
