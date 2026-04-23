function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

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

function titleCaseFallback(str) {
  return String(str || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

/* -------------------------------------------------------
 * Strong Publisher Rules
 * 优先级最高：tag / hostname 直接命中
 * ----------------------------------------------------- */

const PUBLISHER_RULES = [
  {
    name: "DealNews",
    media_group: "Independently Operated / Commerce Media",
    type: "Deal Site",
    subtype: "Deal Aggregator",
    amazon_tags: ["dealnewscom"],
    hostnames: ["dealnews.com"],
    keywords: ["dealnews"]
  },
  {
    name: "Slickdeals",
    media_group: "Community Commerce Media",
    type: "Deal Community",
    subtype: "Forum + Deal Aggregator",
    amazon_tags: ["slickdeals09-20"],
    hostnames: ["slickdeals.net"],
    keywords: ["slickdeals"]
  },
  {
    name: "CNET",
    media_group: "Ziff Davis",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: ["cnetcommerce"],
    hostnames: ["cnet.com"],
    keywords: ["cnetcommerce", "cnet"]
  },
  {
    name: "Mattress Nerd",
    media_group: "Nectar / Resident Commerce Content",
    type: "Editorial Review",
    subtype: "SEO Review Site",
    amazon_tags: ["mattressnrd"],
    hostnames: ["mattressnerd.com"],
    keywords: ["mattressnerd", "mattressnrd"]
  },
  {
    name: "Amazon Deal Clubs",
    media_group: "Affiliate Publisher",
    type: "Deal Site",
    subtype: "Amazon Deal Curator",
    amazon_tags: ["amazondealclubs-20"],
    hostnames: [],
    keywords: ["amazondealclubs"]
  },
  {
    name: "Tom's Guide",
    media_group: "Future",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["tomsguide.com"],
    keywords: ["tomsguide"]
  },
  {
    name: "TechRadar",
    media_group: "Future",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["techradar.com"],
    keywords: ["techradar"]
  },
  {
    name: "PC Gamer",
    media_group: "Future",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["pcgamer.com"],
    keywords: ["pcgamer"]
  },
  {
    name: "Wirecutter",
    media_group: "The New York Times",
    type: "Editorial Review",
    subtype: "Product Recommendation",
    amazon_tags: [],
    hostnames: ["nytimes.com", "wirecutter.com"],
    keywords: ["wirecutter"]
  },
  {
    name: "Business Insider",
    media_group: "Business Insider",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["businessinsider.com", "insider.com"],
    keywords: ["businessinsider", "insider"]
  },
  {
    name: "Forbes Vetted",
    media_group: "Forbes",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["forbes.com"],
    keywords: ["forbes"]
  },
  {
    name: "CNN Underscored",
    media_group: "CNN",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["cnn.com"],
    keywords: ["underscored", "cnn"]
  },
  {
    name: "RetailMeNot",
    media_group: "Ziff Davis",
    type: "Coupon Site",
    subtype: "Coupon / Cashback",
    amazon_tags: [],
    hostnames: ["retailmenot.com"],
    keywords: ["retailmenot"]
  },
  {
    name: "CouponCabin",
    media_group: "CouponCabin",
    type: "Coupon Site",
    subtype: "Coupon / Cashback",
    amazon_tags: [],
    hostnames: ["couponcabin.com"],
    keywords: ["couponcabin"]
  },
  {
    name: "Brad's Deals",
    media_group: "Brad's Deals",
    type: "Deal Site",
    subtype: "Deal Aggregator",
    amazon_tags: [],
    hostnames: ["bradsdeals.com"],
    keywords: ["bradsdeals"]
  },
  {
    name: "Kinja Deals",
    media_group: "G/O Media",
    type: "Deal Site",
    subtype: "Commerce Editorial Deals",
    amazon_tags: [],
    hostnames: ["kinjadeals.com"],
    keywords: ["kinjadeals"]
  }
];

/* -------------------------------------------------------
 * Matching Helpers
 * ----------------------------------------------------- */

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
    joined
  };
}

function matchByAmazonTag(tag) {
  if (!tag) return null;

  for (const rule of PUBLISHER_RULES) {
    if ((rule.amazon_tags || []).map(normalizeText).includes(normalizeText(tag))) {
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

  for (const rule of PUBLISHER_RULES) {
    const hostnames = (rule.hostnames || []).map(cleanHostname);
    if (hostnames.includes(cleanHostname(hostname))) {
      return {
        publisher: rule.name,
        media_group: rule.media_group,
        type: rule.type,
        subtype: rule.subtype,
        matched_by: "hostname",
        evidence: `Matched hostname: ${hostname}`
      };
    }
  }

  return null;
}

function matchByKeyword(joined) {
  const haystack = normalizeText(joined);
  if (!haystack) return null;

  for (const rule of PUBLISHER_RULES) {
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

/* -------------------------------------------------------
 * Heuristic Classification
 * 命不中强规则时的兜底
 * ----------------------------------------------------- */

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
    text.includes("best-") ||
    text.includes("best ") ||
    text.includes("guide") ||
    text.includes("editorial") ||
    text.includes("compare")
  ) {
    return {
      type: "Editorial Review",
      subtype: "SEO Review Site"
    };
  }

  if (
    text.includes("youtube") ||
    text.includes("tiktok") ||
    text.includes("instagram") ||
    text.includes("creator") ||
    text.includes("influencer")
  ) {
    return {
      type: "Creator / Influencer",
      subtype: "Social Commerce"
    };
  }

  if (
    text.includes("forum") ||
    text.includes("community") ||
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

/* -------------------------------------------------------
 * Public API
 * ----------------------------------------------------- */

function buildPublisherIntelligence(urlObj, extra = {}) {
  const signals = collectSignals(urlObj, extra);

  // 1. strong match: amazon tag
  const tagMatch = matchByAmazonTag(signals.tag);
  if (tagMatch) {
    return {
      publisher: tagMatch.publisher,
      type: tagMatch.type,
      media_group: tagMatch.media_group,
      subtype: tagMatch.subtype,
      matched_by: tagMatch.matched_by,
      evidence: tagMatch.evidence
    };
  }

  // 2. strong match: hostname
  const hostMatch = matchByHostname(signals.hostname);
  if (hostMatch) {
    return {
      publisher: hostMatch.publisher,
      type: hostMatch.type,
      media_group: hostMatch.media_group,
      subtype: hostMatch.subtype,
      matched_by: hostMatch.matched_by,
      evidence: hostMatch.evidence
    };
  }

  // 3. keyword match
  const keywordMatch = matchByKeyword(signals.joined);
  if (keywordMatch) {
    return {
      publisher: keywordMatch.publisher,
      type: keywordMatch.type,
      media_group: keywordMatch.media_group,
      subtype: keywordMatch.subtype,
      matched_by: keywordMatch.matched_by,
      evidence: keywordMatch.evidence
    };
  }

  // 4. fallback from extra hints
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
    type: inferred.type,
    media_group: inferMediaGroup(fallbackPublisher, inferred.type),
    subtype: inferred.subtype,
    matched_by: fallbackPublisher && fallbackPublisher !== "Unknown" ? "fallback_hint" : "heuristic",
    evidence:
      fallbackPublisher && fallbackPublisher !== "Unknown"
        ? `Used fallback publisher hint: ${fallbackPublisher}`
        : "No explicit publisher rule matched; classified by heuristic signals."
  };
}

module.exports = {
  buildPublisherIntelligence
};
