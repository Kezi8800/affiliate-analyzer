// lib/publisher-database.js
// BrandShuo Attribution Checker
// Publisher Intelligence Database v1.0

const PUBLISHERS = [
  {
    id: "slickdeals",
    publisher: "Slickdeals",
    group: "Slickdeals",
    groupKey: "slickdeals",
    category: "deal_coupon",
    trafficType: "Deal Community",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Last-click Heavy",
    quality: 72,
    domains: ["slickdeals.net"],
    amazonTags: ["slickdeals09-20"],
    aliases: ["slickdeals", "slickdeals llc", "slickdeals deals"],
    networks: ["Amazon Associates", "Amazon Creator Connections", "Impact"]
  },
  {
    id: "buzzfeed",
    publisher: "BuzzFeed",
    group: "BuzzFeed Inc.",
    groupKey: "buzzfeed",
    category: "content_commerce",
    trafficType: "Editorial Commerce",
    intent: "Medium Purchase Intent",
    role: "Mid Funnel / Discovery",
    quality: 78,
    domains: ["buzzfeed.com"],
    amazonTags: ["buzz0f-20"],
    aliases: ["buzzfeed", "buzzfeed shopping"],
    networks: ["Amazon Associates"]
  },
  {
    id: "future",
    publisher: "Future Publishing",
    group: "Future plc",
    groupKey: "future",
    category: "seo_review_media",
    trafficType: "Editorial Review / SEO",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    quality: 82,
    domains: [
      "tomsguide.com",
      "techradar.com",
      "laptopmag.com",
      "whathifi.com",
      "space.com",
      "gamesradar.com"
    ],
    amazonTags: [
      "cx-future-tr-search-20",
      "tomsguide-us-20",
      "techradar-20"
    ],
    aliases: [
      "future publishing",
      "future publishing limited",
      "future apac",
      "tom's guide",
      "tomsguide",
      "techradar"
    ],
    networks: ["Amazon Associates", "CJ Affiliate", "Rakuten", "Impact"]
  },
  {
    id: "pcmag",
    publisher: "PCMag",
    group: "Ziff Davis",
    groupKey: "ziff_davis",
    category: "seo_review_media",
    trafficType: "Editorial Review / SEO",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    quality: 84,
    domains: ["pcmag.com"],
    amazonTags: ["p00935-20"],
    aliases: ["pcmag", "pc magazine", "ziff davis"],
    networks: ["Amazon Associates", "CJ Affiliate", "Impact"]
  },
  {
    id: "cnet",
    publisher: "CNET",
    group: "Red Ventures / Ziff Davis style Commerce Media",
    groupKey: "cnet",
    category: "seo_review_media",
    trafficType: "Editorial Review / SEO",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    quality: 82,
    domains: ["cnet.com"],
    amazonTags: ["cnet-buy-button-20"],
    aliases: ["cnet", "cnet commerce"],
    networks: ["Amazon Associates", "Partnerize", "CJ Affiliate"]
  },
  {
    id: "retailmenot",
    publisher: "RetailMeNot",
    group: "RetailMeNot",
    groupKey: "retailmenot",
    category: "deal_coupon",
    trafficType: "Coupon / Promo Code",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Coupon Interception Risk",
    quality: 68,
    domains: ["retailmenot.com"],
    amazonTags: [],
    aliases: ["retailmenot", "retail me not"],
    networks: ["Impact", "CJ Affiliate", "Rakuten"]
  },
  {
    id: "honey",
    publisher: "Honey",
    group: "PayPal Honey",
    groupKey: "honey",
    category: "coupon_extension",
    trafficType: "Browser Extension / Coupon",
    intent: "Very High Purchase Intent",
    role: "Bottom Funnel / Last-click Risk",
    quality: 55,
    domains: ["joinhoney.com", "honey.com"],
    amazonTags: [],
    aliases: ["honey", "paypal honey"],
    networks: ["Impact", "CJ Affiliate", "Partnerize"]
  },
  {
    id: "rakuten_rewards",
    publisher: "Rakuten Rewards",
    group: "Rakuten",
    groupKey: "rakuten_rewards",
    category: "cashback_rewards",
    trafficType: "Cashback / Rewards",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Loyalty",
    quality: 66,
    domains: ["rakuten.com", "ebates.com"],
    amazonTags: [],
    aliases: ["rakuten rewards", "ebates"],
    networks: ["Rakuten Advertising"]
  },
  {
    id: "topcashback",
    publisher: "TopCashback",
    group: "TopCashback",
    groupKey: "topcashback",
    category: "cashback_rewards",
    trafficType: "Cashback / Rewards",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Loyalty",
    quality: 64,
    domains: ["topcashback.com"],
    amazonTags: [],
    aliases: ["topcashback", "top cash back"],
    networks: ["Impact", "CJ Affiliate", "Awin"]
  },
  {
    id: "skimlinks",
    publisher: "Skimlinks",
    group: "Skimlinks",
    groupKey: "skimlinks",
    category: "subnetwork_router",
    trafficType: "Commerce Router / Subnetwork",
    intent: "Unknown",
    role: "Attribution Layer / Router",
    quality: 60,
    domains: ["skimlinks.com", "go.skimresources.com"],
    amazonTags: [],
    aliases: ["skimlinks", "skimbit"],
    networks: ["Skimlinks"]
  },
  {
    id: "sovrn",
    publisher: "Sovrn Commerce",
    group: "Sovrn",
    groupKey: "sovrn",
    category: "subnetwork_router",
    trafficType: "Commerce Router / Subnetwork",
    intent: "Unknown",
    role: "Attribution Layer / Router",
    quality: 60,
    domains: ["sovrn.com", "viglink.com", "shop-links.co"],
    amazonTags: [],
    aliases: ["sovrn", "viglink", "sovrn commerce"],
    networks: ["Sovrn Commerce"]
  },
  {
    id: "geniuslink",
    publisher: "Geniuslink",
    group: "Geniuslink",
    groupKey: "geniuslink",
    category: "smart_router",
    trafficType: "Smart Link Router",
    intent: "Unknown",
    role: "Geo / Device / Retailer Routing Layer",
    quality: 62,
    domains: ["geni.us", "geniuslink.com"],
    amazonTags: [],
    aliases: ["geniuslink", "geni.us"],
    networks: ["Amazon Associates"]
  }
];

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function getHostname(rawUrl = "") {
  try {
    const parsed = new URL(rawUrl);
    return normalize(parsed.hostname).replace(/^www\./, "");
  } catch (e) {
    return "";
  }
}

function getParamFromUrl(rawUrl = "", key = "") {
  try {
    const parsed = new URL(rawUrl);
    return parsed.searchParams.get(key) || "";
  } catch (e) {
    return "";
  }
}

function buildResult(publisher, matchType, score, reason) {
  if (!publisher) return null;

  return {
    matched: true,
    matchType,
    publisher: publisher.publisher,
    group: publisher.group,
    groupKey: publisher.groupKey,
    category: publisher.category,
    trafficType: publisher.trafficType,
    intent: publisher.intent,
    role: publisher.role,
    quality: publisher.quality,
    confidence: score >= 90 ? "high" : score >= 70 ? "medium" : "low",
    score,
    reasons: [reason],
    networks: publisher.networks || [],
    publisherId: publisher.id
  };
}

function detectPublisherByUrl(rawUrl = "") {
  const host = getHostname(rawUrl);
  const full = normalize(rawUrl);

  if (!host && !full) return null;

  for (const p of PUBLISHERS) {
    const domainHit = (p.domains || []).some(domain => {
      const d = normalize(domain).replace(/^www\./, "");
      return host === d || host.endsWith("." + d) || full.includes(d);
    });

    if (domainHit) {
      return buildResult(p, "domain", 92, `Matched publisher domain: ${host}`);
    }

    const aliasHit = (p.aliases || []).some(alias => {
      return full.includes(normalize(alias));
    });

    if (aliasHit) {
      return buildResult(p, "alias", 76, "Matched publisher alias in URL.");
    }
  }

  return null;
}

function detectPublisherByAmazonParams(input = {}) {
  const rawUrl = input.url || input.inputUrl || "";
  const params = input.params || {};

  const tag =
    normalize(params.tag || getParamFromUrl(rawUrl, "tag"));

  const ascsubtag =
    normalize(params.ascsubtag || getParamFromUrl(rawUrl, "ascsubtag"));

  const linkId =
    normalize(params.linkId || params.linkid || getParamFromUrl(rawUrl, "linkId") || getParamFromUrl(rawUrl, "linkid"));

  for (const p of PUBLISHERS) {
    const tagHit = (p.amazonTags || []).some(t => normalize(t) === tag);

    if (tag && tagHit) {
      return buildResult(p, "amazon_tag", 96, `Matched Amazon tag: ${tag}`);
    }

    const aliasInSubtag = (p.aliases || []).some(alias => {
      const a = normalize(alias).replace(/\s+/g, "");
      return ascsubtag.includes(a);
    });

    if (ascsubtag && aliasInSubtag) {
      return buildResult(p, "amazon_ascsubtag_alias", 78, "Matched alias inside Amazon ascsubtag.");
    }

    const linkSignal = linkId && (p.aliases || []).some(alias => linkId.includes(normalize(alias)));
    if (linkSignal) {
      return buildResult(p, "amazon_linkid_alias", 70, "Matched alias inside Amazon linkId.");
    }
  }

  return null;
}

function detectPublisherUniversal(input = {}) {
  const rawUrl = input.url || input.inputUrl || "";

  const amazonResult = detectPublisherByAmazonParams(input);
  if (amazonResult) return amazonResult;

  const urlResult = detectPublisherByUrl(rawUrl);
  if (urlResult) return urlResult;

  return {
    matched: false,
    matchType: "none",
    publisher: "Unknown Publisher",
    group: "Unknown / Needs Verification",
    groupKey: "unknown_group",
    category: "unknown",
    trafficType: "Unknown",
    intent: "Unknown",
    role: "Unknown",
    quality: 40,
    confidence: "low",
    score: 0,
    reasons: [],
    notes: "No publisher detected."
  };
}

function getPublisherStats() {
  return {
    totalPublishers: PUBLISHERS.length,
    categories: [...new Set(PUBLISHERS.map(p => p.category))],
    groups: [...new Set(PUBLISHERS.map(p => p.group))]
  };
}

module.exports = {
  PUBLISHERS,
  detectPublisherByUrl,
  detectPublisherByAmazonParams,
  detectPublisherUniversal,
  getPublisherStats
};
