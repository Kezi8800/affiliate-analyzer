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

function titleCaseFallback(str) {
  return String(str || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase())
    .trim();
}

function extractHostnameFromUrlLike(value) {
  if (!value) return "";
  try {
    return cleanHostname(new URL(value).hostname);
  } catch (e) {
    return "";
  }
}

function looksLikeDomain(value) {
  const v = normalizeText(value);
  if (!v) return false;
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v);
}

function collectSignals(urlObj, extra = {}) {
  const hostname = cleanHostname(urlObj?.hostname || "");
  const params = getQueryParams(urlObj);

  const tag = normalizeText(getParam(params, "tag"));
  const utm_source = normalizeText(getParam(params, "utm_source"));
  const utm_medium = normalizeText(getParam(params, "utm_medium"));
  const utm_campaign = normalizeText(getParam(params, "utm_campaign"));
  const source = normalizeText(getParam(params, "source"));
  const sourceid = normalizeText(getParam(params, "sourceid"));
  const ref = normalizeText(getParam(params, "ref"));
  const ref_ = normalizeText(getParam(params, "ref_"));
  const clickref = normalizeText(getParam(params, "clickref"));
  const subid1 = normalizeText(getParam(params, "subid1"));
  const subid2 = normalizeText(getParam(params, "subid2"));
  const subid3 = normalizeText(getParam(params, "subid3"));
  const ascsubtag = normalizeText(getParam(params, "ascsubtag"));
  const afftrack = normalizeText(getParam(params, "afftrack"));
  const aff_source = normalizeText(getParam(params, "aff_source"));
  const sid = normalizeText(getParam(params, "sid"));
  const pid = normalizeText(getParam(params, "pid"));
  const irclickid = normalizeText(getParam(params, "irclickid"));
  const awc = normalizeText(getParam(params, "awc"));
  const cjevent = normalizeText(getParam(params, "cjevent"));
  const ranmid = normalizeText(getParam(params, "ranmid"));
  const raneaid = normalizeText(getParam(params, "raneaid"));
  const ransiteid = normalizeText(getParam(params, "ransiteid"));
  const pjid = normalizeText(getParam(params, "pjid"));
  const pjmid = normalizeText(getParam(params, "pjmid"));
  const tduid = normalizeText(getParam(params, "tduid"));
  const wgcampaignid = normalizeText(getParam(params, "wgcampaignid"));
  const wgprogramid = normalizeText(getParam(params, "wgprogramid"));
  const faid = normalizeText(getParam(params, "faid"));
  const fobs = normalizeText(getParam(params, "fobs"));
  const pubref = normalizeText(getParam(params, "pubref"));
  const affiliate = normalizeText(getParam(params, "affiliate"));
  const publisher = normalizeText(getParam(params, "publisher"));
  const partner = normalizeText(getParam(params, "partner"));
  const partnerid = normalizeText(getParam(params, "partnerid"));
  const source_url = extractHostnameFromUrlLike(getParam(params, "u"));
  const url_param_host = extractHostnameFromUrlLike(getParam(params, "url"));

  const joined = [
    hostname,
    tag,
    utm_source,
    utm_medium,
    utm_campaign,
    source,
    sourceid,
    ref,
    ref_,
    clickref,
    subid1,
    subid2,
    subid3,
    ascsubtag,
    afftrack,
    aff_source,
    sid,
    pid,
    irclickid,
    awc,
    cjevent,
    ranmid,
    raneaid,
    ransiteid,
    pjid,
    pjmid,
    tduid,
    wgcampaignid,
    wgprogramid,
    faid,
    fobs,
    pubref,
    affiliate,
    publisher,
    partner,
    partnerid,
    source_url,
    url_param_host,
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
    utm_medium,
    utm_campaign,
    source,
    sourceid,
    ref,
    ref_,
    clickref,
    subid1,
    subid2,
    subid3,
    ascsubtag,
    afftrack,
    aff_source,
    sid,
    pid,
    irclickid,
    awc,
    cjevent,
    ranmid,
    raneaid,
    ransiteid,
    pjid,
    pjmid,
    tduid,
    wgcampaignid,
    wgprogramid,
    faid,
    fobs,
    pubref,
    affiliate,
    publisher,
    partner,
    partnerid,
    source_url,
    url_param_host,
    joined
  };
}

/* -------------------------------------------------------
 * Strong Rule Match
 * ----------------------------------------------------- */

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

  const cleaned = cleanHostname(hostname);
  const rules = getPublisherRules();

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

/* -------------------------------------------------------
 * Network Hint Detection
 * ----------------------------------------------------- */

function detectAffiliateNetwork(params, hostname) {
  const host = cleanHostname(hostname);

  if (
    getParam(params, "tag") ||
    getParam(params, "campaignId") ||
    getParam(params, "maas") ||
    host.includes("amazon.")
  ) {
    return "Amazon";
  }

  if (getParam(params, "irclickid") || host.includes("impact.com")) {
    return "Impact";
  }

  if (getParam(params, "awc")) {
    return "Awin";
  }

  if (getParam(params, "cjevent")) {
    return "CJ Affiliate";
  }

  if (
    getParam(params, "ranmid") ||
    getParam(params, "raneaid") ||
    getParam(params, "ransiteid")
  ) {
    return "Rakuten";
  }

  if (getParam(params, "pjid") || getParam(params, "pjmid")) {
    return "Partnerize";
  }

  if (getParam(params, "afftrack") || getParam(params, "aff_source")) {
    return "ShareASale";
  }

  if (getParam(params, "faid") || getParam(params, "fobs")) {
    return "FlexOffers";
  }

  if (getParam(params, "wgcampaignid") || getParam(params, "wgprogramid")) {
    return "Webgains";
  }

  if (getParam(params, "tduid")) {
    return "TradeDoubler";
  }

  if (
    getParam(params, "gclid") ||
    getParam(params, "gbraid") ||
    getParam(params, "wbraid")
  ) {
    return "Google Ads";
  }

  if (getParam(params, "fbclid")) {
    return "Meta Ads";
  }

  if (getParam(params, "ttclid")) {
    return "TikTok Ads";
  }

  if (getParam(params, "msclkid")) {
    return "Microsoft Ads";
  }

  return "Unknown";
}

/* -------------------------------------------------------
 * Non-Amazon Publisher Hint Extraction
 * ----------------------------------------------------- */

function inferPublisherTypeFromText(text) {
  const value = normalizeText(text);

  if (!value) {
    return {
      type: "Unknown",
      subtype: "Unknown"
    };
  }

  if (
    value.includes("deal") ||
    value.includes("sale") ||
    value.includes("bargain") ||
    value.includes("deals")
  ) {
    return {
      type: "Deal Site",
      subtype: "Deal Aggregator"
    };
  }

  if (
    value.includes("coupon") ||
    value.includes("promo") ||
    value.includes("voucher") ||
    value.includes("cashback")
  ) {
    return {
      type: "Coupon Site",
      subtype: "Coupon / Cashback"
    };
  }

  if (
    value.includes("review") ||
    value.includes("guide") ||
    value.includes("editorial") ||
    value.includes("compare")
  ) {
    return {
      type: "Editorial Review",
      subtype: "SEO Review Site"
    };
  }

  if (
    value.includes("creator") ||
    value.includes("influencer") ||
    value.includes("youtube") ||
    value.includes("tiktok") ||
    value.includes("instagram")
  ) {
    return {
      type: "Creator / Influencer",
      subtype: "Social Commerce"
    };
  }

  if (
    value.includes("forum") ||
    value.includes("community") ||
    value.includes("reddit")
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
    if (t === "coupon site") {
      return "Coupon / Savings Publisher";
    }
    if (t === "editorial review") {
      return "Commerce Content Publisher";
    }
    if (t === "creator / influencer") {
      return "Independent Creator";
    }
    return "Unknown";
  }

  return "Independent Publisher";
}

function extractPublisherFromUtmSource(signals) {
  const value = signals.utm_source;
  if (!value) return null;

  if (looksLikeDomain(value)) {
    const hostMatch = matchByHostname(value);
    if (hostMatch) {
      return {
        ...hostMatch,
        matched_by: "utm_source_domain",
        evidence: `Matched utm_source domain: ${value}`
      };
    }

    return {
      publisher: titleCaseFallback(value.replace(/\.[a-z]{2,}$/i, "")),
      media_group: "Independent Publisher",
      type: "Affiliate Publisher",
      subtype: "General Affiliate",
      matched_by: "utm_source_domain_fallback",
      evidence: `Derived publisher from utm_source domain: ${value}`
    };
  }

  const keywordMatch = matchByKeyword(value);
  if (keywordMatch) {
    return {
      ...keywordMatch,
      matched_by: "utm_source_keyword",
      evidence: `Matched utm_source keyword: ${value}`
    };
  }

  return {
    publisher: titleCaseFallback(value),
    media_group: "Independent Publisher",
    type: inferPublisherTypeFromText(value).type,
    subtype: inferPublisherTypeFromText(value).subtype,
    matched_by: "utm_source_fallback",
    evidence: `Derived publisher from utm_source: ${value}`
  };
}

function extractPublisherFromClickref(signals) {
  const candidates = [
    signals.clickref,
    signals.subid1,
    signals.subid2,
    signals.subid3,
    signals.pubref,
    signals.partner,
    signals.partnerid,
    signals.publisher
  ].filter(Boolean);

  for (const value of candidates) {
    const host = extractHostnameFromUrlLike(value);
    if (host) {
      const hostMatch = matchByHostname(host);
      if (hostMatch) {
        return {
          ...hostMatch,
          matched_by: "subid_hostname",
          evidence: `Matched hostname embedded in click/subid signal: ${host}`
        };
      }
    }

    const keywordMatch = matchByKeyword(value);
    if (keywordMatch) {
      return {
        ...keywordMatch,
        matched_by: "subid_keyword",
        evidence: `Matched keyword in click/subid signal: ${value}`
      };
    }

    if (looksLikeDomain(value)) {
      return {
        publisher: titleCaseFallback(value.replace(/\.[a-z]{2,}$/i, "")),
        media_group: "Independent Publisher",
        type: "Affiliate Publisher",
        subtype: "General Affiliate",
        matched_by: "subid_domain_fallback",
        evidence: `Derived publisher from click/subid domain: ${value}`
      };
    }
  }

  return null;
}

function extractPublisherFromNetworkHints(signals) {
  const network = detectAffiliateNetwork(signals.params, signals.hostname);

  // Walmart affiliate patterns
  if (signals.sourceid && signals.sourceid.startsWith("imp_")) {
    const clickHint = extractPublisherFromClickref(signals);
    if (clickHint) {
      return {
        ...clickHint,
        matched_by: "walmart_sourceid_plus_subid",
        evidence: `Walmart-style affiliate sourceid combined with publisher hint: ${clickHint.publisher}`
      };
    }

    return {
      publisher: "Impact Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "Network Publisher",
      matched_by: "walmart_sourceid_network",
      evidence: "Detected Walmart-style Impact sourceid affiliate pattern."
    };
  }

  if (network === "Impact") {
    const clickHint = extractPublisherFromClickref(signals);
    if (clickHint) {
      return {
        ...clickHint,
        matched_by: "impact_subid_hint",
        evidence: `Impact link with publisher hint from click/subid signal: ${clickHint.publisher}`
      };
    }

    if (signals.utm_source) {
      const utmHint = extractPublisherFromUtmSource(signals);
      if (utmHint) {
        return {
          ...utmHint,
          matched_by: "impact_utm_hint",
          evidence: `Impact link with publisher hint from utm_source: ${utmHint.publisher}`
        };
      }
    }

    return {
      publisher: "Impact Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "Impact Publisher",
      matched_by: "impact_network",
      evidence: "Detected Impact affiliate tracking pattern."
    };
  }

  if (network === "CJ Affiliate") {
    const hint = extractPublisherFromUtmSource(signals) || extractPublisherFromClickref(signals);
    if (hint) {
      return {
        ...hint,
        matched_by: "cj_hint",
        evidence: `CJ link with publisher hint: ${hint.publisher}`
      };
    }

    return {
      publisher: "CJ Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "CJ Publisher",
      matched_by: "cj_network",
      evidence: "Detected CJ Affiliate tracking pattern."
    };
  }

  if (network === "Awin") {
    const hint = extractPublisherFromUtmSource(signals) || extractPublisherFromClickref(signals);
    if (hint) {
      return {
        ...hint,
        matched_by: "awin_hint",
        evidence: `Awin link with publisher hint: ${hint.publisher}`
      };
    }

    return {
      publisher: "Awin Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "Awin Publisher",
      matched_by: "awin_network",
      evidence: "Detected Awin affiliate tracking pattern."
    };
  }

  if (network === "Rakuten") {
    const hint = extractPublisherFromUtmSource(signals) || extractPublisherFromClickref(signals);
    if (hint) {
      return {
        ...hint,
        matched_by: "rakuten_hint",
        evidence: `Rakuten link with publisher hint: ${hint.publisher}`
      };
    }

    return {
      publisher: "Rakuten Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "Rakuten Publisher",
      matched_by: "rakuten_network",
      evidence: "Detected Rakuten affiliate tracking pattern."
    };
  }

  if (network === "Partnerize") {
    const hint = extractPublisherFromUtmSource(signals) || extractPublisherFromClickref(signals);
    if (hint) {
      return {
        ...hint,
        matched_by: "partnerize_hint",
        evidence: `Partnerize link with publisher hint: ${hint.publisher}`
      };
    }

    return {
      publisher: "Partnerize Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "Partnerize Publisher",
      matched_by: "partnerize_network",
      evidence: "Detected Partnerize affiliate tracking pattern."
    };
  }

  if (network === "ShareASale") {
    const hint = extractPublisherFromUtmSource(signals) || extractPublisherFromClickref(signals);
    if (hint) {
      return {
        ...hint,
        matched_by: "shareasale_hint",
        evidence: `ShareASale link with publisher hint: ${hint.publisher}`
      };
    }

    return {
      publisher: "ShareASale Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "ShareASale Publisher",
      matched_by: "shareasale_network",
      evidence: "Detected ShareASale affiliate tracking pattern."
    };
  }

  if (network === "FlexOffers") {
    return {
      publisher: "FlexOffers Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "FlexOffers Publisher",
      matched_by: "flexoffers_network",
      evidence: "Detected FlexOffers affiliate tracking pattern."
    };
  }

  if (network === "Webgains") {
    return {
      publisher: "Webgains Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "Webgains Publisher",
      matched_by: "webgains_network",
      evidence: "Detected Webgains affiliate tracking pattern."
    };
  }

  if (network === "TradeDoubler") {
    return {
      publisher: "TradeDoubler Publisher",
      media_group: "Affiliate Network Publisher",
      type: "Affiliate Publisher",
      subtype: "TradeDoubler Publisher",
      matched_by: "tradedoubler_network",
      evidence: "Detected TradeDoubler affiliate tracking pattern."
    };
  }

  return null;
}

/* -------------------------------------------------------
 * Public API
 * ----------------------------------------------------- */

function buildPublisherIntelligence(urlObj, extra = {}) {
  const signals = collectSignals(urlObj, extra);

  const tagMatch = matchByAmazonTag(signals.tag);
  if (tagMatch) return tagMatch;

  const hostMatch = matchByHostname(signals.hostname);
  if (hostMatch) return hostMatch;

  const keywordMatch = matchByKeyword(signals.joined);
  if (keywordMatch) return keywordMatch;

  const utmMatch = extractPublisherFromUtmSource(signals);
  if (utmMatch) return utmMatch;

  const clickrefMatch = extractPublisherFromClickref(signals);
  if (clickrefMatch) return clickrefMatch;

  const networkHintMatch = extractPublisherFromNetworkHints(signals);
  if (networkHintMatch) return networkHintMatch;

  const fallbackPublisher =
    extra.primary_claimer && extra.primary_claimer !== "Unknown"
      ? extra.primary_claimer
      : extra.publisher_hint && extra.publisher_hint !== "Unknown"
      ? extra.publisher_hint
      : "Unknown";

  const inferred = inferPublisherTypeFromText(
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
  getParam,
  detectAffiliateNetwork
};
