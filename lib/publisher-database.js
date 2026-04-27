// lib/publisher-database.js
// BrandShuo Attribution Checker
// Publisher Intelligence Database v2.0
// 用法：
// const {
//   detectPublisherByUrl,
//   detectPublisherByAmazonParams,
//   detectPublisherUniversal,
//   getPublisherStats
// } = require("./publisher-database");

const GROUPS = {
  nyt: "The New York Times Company",
  ziff_davis: "Ziff Davis",
  future: "Future plc",
  hearst: "Hearst",
  dotdash_meredith: "Dotdash Meredith / IAC",
  red_ventures: "Red Ventures",
  condenast: "Condé Nast",
  vox: "Vox Media",
  buzzfeed: "BuzzFeed Inc.",
  forbes: "Forbes",
  gannett: "Gannett / USA Today Network",
  nbc: "NBCUniversal",
  cnn: "CNN / Warner Bros. Discovery",
  independent: "Independent Publisher",
  deal_community: "Deal / Community Publisher",
  coupon_cashback: "Coupon / Cashback Publisher",
  sub_affiliate: "Sub-affiliate / Link Monetization Layer",
  creator_platform: "Creator Commerce Platform",
  amazon_deal: "Amazon Deal Publisher",
  b2b_saas: "B2B / SaaS Review Publisher",
  unknown_group: "Unknown / Needs Verification"
};

const TYPE_META = {
  commerce_media: {
    trafficType: "SEO / Editorial Commerce",
    intent: "Research Intent",
    role: "Upper / Mid Funnel",
    quality: 86,
    incrementalityRisk: "Low-Medium"
  },
  review_site: {
    trafficType: "SEO Review",
    intent: "High Consideration",
    role: "Mid Funnel",
    quality: 82,
    incrementalityRisk: "Low-Medium"
  },
  deal_site: {
    trafficType: "Deal / Promo",
    intent: "Discount Intent",
    role: "Lower Funnel",
    quality: 62,
    incrementalityRisk: "Medium-High"
  },
  coupon_site: {
    trafficType: "Coupon / Voucher",
    intent: "Checkout Intent",
    role: "Last Click",
    quality: 48,
    incrementalityRisk: "High"
  },
  cashback: {
    trafficType: "Cashback / Loyalty",
    intent: "Reward Intent",
    role: "Last Click / Loyalty",
    quality: 55,
    incrementalityRisk: "High"
  },
  sub_affiliate: {
    trafficType: "Sub-affiliate",
    intent: "Syndicated Click",
    role: "Tracking Layer",
    quality: 50,
    incrementalityRisk: "Medium-High"
  },
  creator: {
    trafficType: "Creator / Influencer",
    intent: "Creator Recommendation",
    role: "Demand Creation",
    quality: 78,
    incrementalityRisk: "Low-Medium"
  },
  price_tool: {
    trafficType: "Price Tracking / Extension",
    intent: "Price Comparison",
    role: "Assist / Last Click",
    quality: 58,
    incrementalityRisk: "Medium-High"
  },
  b2b_review: {
    trafficType: "B2B Review Marketplace",
    intent: "Software Evaluation",
    role: "Lead Assist",
    quality: 80,
    incrementalityRisk: "Medium"
  },
  unknown: {
    trafficType: "Unknown",
    intent: "Unknown",
    role: "Unknown",
    quality: 40,
    incrementalityRisk: "Unknown"
  }
};

const SEED_GROUPS = {
  nyt: ["wirecutter.com", "nytimes.com/wirecutter"],

  ziff_davis: [
    "cnet.com",
    "zdnet.com",
    "pcmag.com",
    "mashable.com",
    "lifehacker.com",
    "ign.com",
    "retailmenot.com",
    "blackfriday.com",
    "offers.com",
    "couponcodes.com"
  ],

  future: [
    "tomsguide.com",
    "techradar.com",
    "livescience.com",
    "space.com",
    "t3.com",
    "whathifi.com",
    "laptopmag.com",
    "toptenreviews.com",
    "windowscentral.com",
    "androidcentral.com",
    "imore.com",
    "gamesradar.com",
    "digitalcameraworld.com"
  ],

  hearst: [
    "goodhousekeeping.com",
    "popularmechanics.com",
    "esquire.com",
    "elle.com",
    "cosmopolitan.com",
    "menshealth.com",
    "womenshealthmag.com",
    "oprahdaily.com",
    "townandcountrymag.com",
    "bestproducts.com",
    "caranddriver.com",
    "roadandtrack.com",
    "bicycling.com",
    "runnersworld.com"
  ],

  dotdash_meredith: [
    "people.com",
    "instyle.com",
    "realsimple.com",
    "verywellhealth.com",
    "verywellfit.com",
    "thespruce.com",
    "thespruceeats.com",
    "travelandleisure.com",
    "foodandwine.com",
    "allrecipes.com",
    "parents.com",
    "byrdie.com",
    "treehugger.com",
    "investopedia.com",
    "lifewire.com",
    "simplyrecipes.com",
    "seriouseats.com",
    "southernliving.com",
    "betterhomesandgardens.com",
    "marthastewart.com"
  ],

  red_ventures: [
    "bankrate.com",
    "creditcards.com",
    "thepointsguy.com",
    "lonelyplanet.com",
    "reviews.com",
    "bestcolleges.com"
  ],

  condenast: [
    "wired.com",
    "gq.com",
    "vogue.com",
    "architecturaldigest.com",
    "bonappetit.com",
    "epicurious.com",
    "glamour.com",
    "self.com",
    "teenvogue.com",
    "vanityfair.com",
    "cntraveler.com",
    "them.us",
    "pitchfork.com"
  ],

  vox: [
    "theverge.com",
    "nymag.com/strategist",
    "thecut.com",
    "eater.com",
    "polygon.com",
    "vox.com",
    "curbed.com",
    "vulture.com"
  ],

  buzzfeed: ["buzzfeed.com", "huffpost.com", "tasty.co"],

  forbes: [
    "forbes.com/sites/forbes-personal-shopper",
    "forbes.com/vetted",
    "forbes.com/advisor"
  ],

  gannett: [
    "usatoday.com",
    "reviewed.usatoday.com",
    "azcentral.com",
    "indystar.com",
    "detroitnews.com"
  ],

  nbc: ["nbcnews.com/select", "today.com/shop", "cnbc.com/select"],

  cnn: ["cnn.com/cnn-underscored", "cnn.com/underscored"],

  commerce_independent: [
    "rtings.com",
    "consumerreports.org",
    "sleepfoundation.org",
    "mattressclarity.com",
    "mattressnerd.com",
    "sleepopolis.com",
    "theinventory.com",
    "gearlab.com",
    "outdoorgearlab.com",
    "babygearlab.com",
    "switchbacktravel.com",
    "bestreviews.com",
    "techgearlab.com"
  ],

  deal_community: [
    "slickdeals.net",
    "dealnews.com",
    "bensbargains.com",
    "bradsdeals.com",
    "dealsplus.com",
    "hip2save.com",
    "krazycouponlady.com",
    "dealcatcher.com",
    "1sale.com",
    "woot.com",
    "meh.com",
    "hotukdeals.com",
    "ozbargain.com.au",
    "redflagdeals.com",
    "pepper.com"
  ],

  coupon_cashback: [
    "rakuten.com",
    "capitaloneshopping.com",
    "joinhoney.com",
    "paypal.com/honey",
    "retailmenot.com",
    "groupon.com",
    "couponcabin.com",
    "coupons.com",
    "topcashback.com",
    "befrugal.com",
    "swagbucks.com",
    "mybpoints.com",
    "extrabux.com",
    "givingassistant.org",
    "rebatesme.com",
    "shopatverdient.com",
    "ibotta.com",
    "fetch.com",
    "upromise.com",
    "couponfollow.com",
    "dontpayfull.com",
    "couponbirds.com",
    "couponchief.com",
    "savings.com",
    "dealspotr.com",
    "wikibuy.com"
  ],

  sub_affiliate: [
    "skimlinks.com",
    "sovrn.com",
    "viglink.com",
    "monetizer101.com",
    "digidip.net",
    "yieldkit.com",
    "geniuslink.com",
    "rewardstyle.com",
    "ltk.app",
    "shopmy.us",
    "magiclinks.com",
    "collectivevoice.com",
    "shoplooks.com",
    "pepperjamnetwork.com"
  ],

  tech_youtube_blogs: [
    "9to5toys.com",
    "9to5mac.com",
    "androidauthority.com",
    "arstechnica.com",
    "engadget.com",
    "gizmodo.com",
    "makeuseof.com",
    "howtogeek.com",
    "digitaltrends.com",
    "macrumors.com",
    "xda-developers.com",
    "techcrunch.com",
    "slashgear.com",
    "tomshardware.com",
    "anandtech.com",
    "notebookcheck.net",
    "gsmarena.com",
    "dpreview.com"
  ],

  home_lifestyle: [
    "apartmenttherapy.com",
    "kitchn.com",
    "domino.com",
    "housebeautiful.com",
    "elledecor.com",
    "dwell.com",
    "bobvila.com",
    "familyhandyman.com",
    "thisoldhouse.com",
    "homecrux.com",
    "hunker.com",
    "livingetc.com",
    "idealhome.co.uk",
    "homesandgardens.com"
  ],

  fashion_beauty: [
    "whowhatwear.com",
    "refinery29.com",
    "fashionista.com",
    "theeverygirl.com",
    "popsugar.com",
    "stylecaster.com",
    "shefinds.com",
    "rankandstyle.com",
    "byrdie.com",
    "allure.com",
    "beautyheaven.com.au"
  ],

  outdoor_travel: [
    "gearjunkie.com",
    "thetrek.co",
    "outsideonline.com",
    "sectionhiker.com",
    "adventure-journal.com",
    "fieldandstream.com",
    "outdoorlife.com",
    "backpacker.com",
    "themanual.com",
    "travelandleisure.com",
    "afar.com",
    "theplanetd.com",
    "nomadicmatt.com"
  ],

  amazon_deal_publishers: [
    "amazondealclubs.com",
    "thedealexperts.com",
    "dealsfinders.blog",
    "dealsheaven.in",
    "dealmoon.com",
    "dealsucker.com",
    "mydealz.de",
    "jungle.deals",
    "camelcamelcamel.com",
    "keepa.com"
  ],

  b2b_saas: [
    "g2.com",
    "capterra.com",
    "softwareadvice.com",
    "getapp.com",
    "trustradius.com",
    "sourceforge.net",
    "saasworthy.com",
    "financesonline.com",
    "selecthub.com",
    "producthunt.com"
  ]
};

// Amazon tag / ascsubtag 精确映射库
const AMAZON_TAG_RULES = [
  {
    publisher: "BuzzFeed",
    groupKey: "buzzfeed",
    category: "commerce_media",
    amazonTags: ["buzz0f-20"],
    tagPrefixes: ["buzz0f"],
    keywords: ["buzzfeed", "bf-shp", "bf-shopping", "bf-"],
    notes: "Matched BuzzFeed commerce signal from Amazon tag / ascsubtag."
  },
  {
    publisher: "CNET",
    groupKey: "ziff_davis",
    category: "commerce_media",
    amazonTags: ["cnet-api-20", "cnet-buy-button-20"],
    tagPrefixes: ["cnet"],
    keywords: ["cnet"],
    notes: "Matched CNET Amazon Associates tag."
  },
  {
    publisher: "PCMag",
    groupKey: "ziff_davis",
    category: "review_site",
    amazonTags: ["p00935-20"],
    tagPrefixes: ["pcmag", "pcmagcom"],
    keywords: ["pcmag"],
    notes: "Matched PCMag Amazon Associates tag."
  },
  {
    publisher: "Tom's Guide",
    groupKey: "future",
    category: "review_site",
    tagPrefixes: ["tomsguide", "tomsguide-us"],
    keywords: ["tomsguide", "toms-guide"],
    notes: "Matched Tom's Guide Amazon publisher signal."
  },
  {
    publisher: "TechRadar",
    groupKey: "future",
    category: "review_site",
    tagPrefixes: ["techradar"],
    keywords: ["techradar"],
    notes: "Matched TechRadar Amazon publisher signal."
  },
  {
    publisher: "Slickdeals",
    groupKey: "deal_community",
    category: "deal_site",
    tagPrefixes: ["slickdeals", "slickdeal", "sd-"],
    keywords: ["slickdeals"],
    notes: "Matched Slickdeals Amazon publisher signal."
  },
  {
    publisher: "Wirecutter",
    groupKey: "nyt",
    category: "review_site",
    tagPrefixes: ["wirecutter", "nytwirecutter"],
    keywords: ["wirecutter"],
    notes: "Matched Wirecutter Amazon publisher signal."
  },
  {
    publisher: "Forbes Vetted",
    groupKey: "forbes",
    category: "commerce_media",
    tagPrefixes: ["forbes", "forbesvetted"],
    keywords: ["forbes", "vetted"],
    notes: "Matched Forbes commerce publisher signal."
  },
  {
    publisher: "CNN Underscored",
    groupKey: "cnn",
    category: "commerce_media",
    tagPrefixes: ["cnnunderscored", "cnn-underscored"],
    keywords: ["cnn-underscored", "underscored"],
    notes: "Matched CNN Underscored publisher signal."
  },
  {
    publisher: "Reviewed / USA Today",
    groupKey: "gannett",
    category: "review_site",
    tagPrefixes: ["reviewed", "usatoday", "reviewedcom"],
    keywords: ["reviewed", "usatoday"],
    notes: "Matched Reviewed / USA Today publisher signal."
  }
];

function normalizeValue(input) {
  return String(input || "").toLowerCase().trim();
}

function normalizeDomain(input) {
  if (!input) return "";
  let s = String(input).toLowerCase().trim();
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return s.split(/[/?#]/)[0];
}

function getParamsFromUrl(url) {
  const params = {};

  try {
    const u = new URL(url);
    for (const [key, value] of u.searchParams.entries()) {
      params[key.toLowerCase()] = value;
    }
  } catch (e) {
    const query = String(url || "").split("?")[1] || "";
    const pairs = query.split("&");

    for (const pair of pairs) {
      const [rawKey, rawValue] = pair.split("=");
      if (!rawKey) continue;

      try {
        params[decodeURIComponent(rawKey).toLowerCase()] = decodeURIComponent(rawValue || "");
      } catch (_) {
        params[String(rawKey).toLowerCase()] = String(rawValue || "");
      }
    }
  }

  return params;
}

function inferRegion(domain) {
  if (/\.co\.uk|hotukdeals|idealhome|livingetc/i.test(domain)) return "UK";
  if (/\.com\.au|ozbargain/i.test(domain)) return "AU";
  if (/redflagdeals|\.ca/i.test(domain)) return "CA";
  if (/\.de|mydealz/i.test(domain)) return "EU";
  if (/\.in|dealsheaven/i.test(domain)) return "IN";
  return "US / Global";
}

function typeForGroup(groupKey, domain) {
  if (groupKey === "deal_community" || groupKey === "amazon_deal_publishers") return "deal_site";

  if (groupKey === "coupon_cashback") {
    if (/rakuten|topcashback|befrugal|swagbucks|ibotta|fetch|upromise|rebates|cashback|extrabux/i.test(domain)) {
      return "cashback";
    }

    if (/honey|capitaloneshopping|wikibuy/i.test(domain)) {
      return "price_tool";
    }

    return "coupon_site";
  }

  if (groupKey === "sub_affiliate") return "sub_affiliate";
  if (groupKey === "b2b_saas") return "b2b_review";

  if (
    groupKey === "commerce_independent" ||
    groupKey === "tech_youtube_blogs" ||
    groupKey === "home_lifestyle" ||
    groupKey === "fashion_beauty" ||
    groupKey === "outdoor_travel"
  ) {
    return "review_site";
  }

  return "commerce_media";
}

function formatPublisherName(domain) {
  return String(domain || "")
    .replace(/^www\./, "")
    .replace(/\.[a-z.]+$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function makeRule(domain, groupKey, extra = {}) {
  const type = extra.type || typeForGroup(groupKey, domain);

  return {
    id: `${groupKey}:${domain}`,
    publisher: extra.publisher || formatPublisherName(domain),
    domain,
    aliases: extra.aliases || [],
    group: GROUPS[groupKey] || GROUPS.unknown_group,
    groupKey,
    category: type,
    region: extra.region || inferRegion(domain),
    ...TYPE_META[type],
    confidence: extra.confidence || "high",
    notes: extra.notes || ""
  };
}

const CORE_RULES = Object.entries(SEED_GROUPS).flatMap(([groupKey, list]) =>
  list.map(domain => makeRule(domain, groupKey))
);

const PATTERN_PACKS = [
  {
    idPrefix: "pattern:coupon",
    group: GROUPS.coupon_cashback,
    groupKey: "coupon_cashback",
    category: "coupon_site",
    patterns: [
      "coupon",
      "coupons",
      "promo",
      "promocode",
      "voucher",
      "discount",
      "saving",
      "savings",
      "deal",
      "deals",
      "offer",
      "offers",
      "code",
      "codes",
      "bargain",
      "markdown",
      "sale"
    ],
    domainSuffixes: [".com", ".net", ".org", ".co", ".io", ".co.uk", ".de", ".ca", ".com.au", ".in"]
  },
  {
    idPrefix: "pattern:cashback",
    group: GROUPS.coupon_cashback,
    groupKey: "coupon_cashback",
    category: "cashback",
    patterns: ["cashback", "rebate", "rebates", "rewards", "loyalty", "points", "earn", "shopback"],
    domainSuffixes: [".com", ".net", ".co", ".io", ".co.uk", ".ca", ".com.au", ".in"]
  },
  {
    idPrefix: "pattern:review",
    group: GROUPS.independent,
    groupKey: "independent",
    category: "review_site",
    patterns: [
      "review",
      "reviews",
      "best",
      "buyer",
      "buyersguide",
      "guide",
      "tested",
      "lab",
      "gear",
      "sleep",
      "mattress",
      "home",
      "kitchen",
      "outdoor",
      "pet",
      "tech",
      "camera",
      "audio"
    ],
    domainSuffixes: [".com", ".net", ".org", ".co", ".io", ".co.uk", ".ca", ".com.au"]
  },
  {
    idPrefix: "pattern:creator",
    group: GROUPS.creator_platform,
    groupKey: "creator_platform",
    category: "creator",
    patterns: ["creator", "influencer", "shopmy", "ltk", "liketoknow", "linkinbio", "storefront", "myshop"],
    domainSuffixes: [".com", ".co", ".io", ".app", ".me"]
  },
  {
    idPrefix: "pattern:subaffiliate",
    group: GROUPS.sub_affiliate,
    groupKey: "sub_affiliate",
    category: "sub_affiliate",
    patterns: ["track", "click", "redirect", "aff", "partner", "trk", "clk"],
    domainSuffixes: [".com", ".net", ".io", ".co"]
  }
];

function expandPatternRules() {
  const out = [];

  for (const pack of PATTERN_PACKS) {
    for (const p of pack.patterns) {
      for (const suffix of pack.domainSuffixes) {
        const domain = `*${p}*${suffix}`;
        const type = pack.category;

        out.push({
          id: `${pack.idPrefix}:${p}:${suffix}`,
          publisher: `Long-tail ${p} publisher pattern`,
          domain,
          aliases: [p],
          group: pack.group,
          groupKey: pack.groupKey,
          category: type,
          region: "Global Pattern",
          ...TYPE_META[type],
          confidence: "pattern",
          notes: "Pattern rule. Use as fallback when exact publisher is not in CORE_RULES."
        });
      }
    }
  }

  return out;
}

// 避免每次 detect 都重新生成
const PATTERN_RULES = expandPatternRules();

const PUBLISHER_DATABASE = [...CORE_RULES, ...PATTERN_RULES];

function buildPublisherResult({
  matched = true,
  matchType = "unknown",
  publisher,
  groupKey,
  category,
  confidence = "medium",
  notes = "",
  domain = "",
  region = "US / Global",
  score = 0,
  reasons = []
}) {
  const meta = TYPE_META[category] || TYPE_META.unknown;

  return {
    matched,
    matchType,
    publisher: publisher || "Unknown Publisher",
    domain,
    group: GROUPS[groupKey] || GROUPS.unknown_group,
    groupKey: groupKey || "unknown_group",
    category: category || "unknown",
    region,
    ...meta,
    confidence,
    score,
    reasons,
    notes
  };
}

function detectPublisherByAmazonParams(params = {}) {
  const tag = normalizeValue(params.tag);
  const ascsubtag = normalizeValue(params.ascsubtag);
  const ref = normalizeValue(params.ref);
  const btnRef = normalizeValue(params.btn_ref);
  const full = `${tag} ${ascsubtag} ${ref} ${btnRef}`;

  if (!tag && !ascsubtag && !ref && !btnRef) return null;

  let bestMatch = null;

  for (const rule of AMAZON_TAG_RULES) {
    let score = 0;
    const reasons = [];

    const amazonTags = (rule.amazonTags || []).map(normalizeValue);
    const tagPrefixes = (rule.tagPrefixes || []).map(normalizeValue);
    const keywords = (rule.keywords || []).map(normalizeValue);

    if (tag && amazonTags.includes(tag)) {
      score += 100;
      reasons.push("Exact Amazon Associates tag matched");
    }

    if (tag && tagPrefixes.some(prefix => tag.startsWith(prefix))) {
      score += 75;
      reasons.push("Amazon tag prefix matched");
    }

    if (keywords.some(keyword => full.includes(keyword))) {
      score += 45;
      reasons.push("Amazon ascsubtag / keyword signal matched");
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        ...rule,
        score,
        reasons
      };
    }
  }

  if (!bestMatch || bestMatch.score <= 0) return null;

  let confidence = "medium";

  if (bestMatch.score >= 100) confidence = "high";
  else if (bestMatch.score >= 75) confidence = "medium-high";
  else if (bestMatch.score >= 45) confidence = "medium";

  return buildPublisherResult({
    matched: true,
    matchType: "amazon_tag",
    publisher: bestMatch.publisher,
    groupKey: bestMatch.groupKey,
    category: bestMatch.category,
    confidence,
    notes: bestMatch.notes,
    score: bestMatch.score,
    reasons: bestMatch.reasons
  });
}

function detectPublisherByUrl(url) {
  const raw = String(url || "").toLowerCase();
  const host = normalizeDomain(raw);

  if (!raw) {
    return buildPublisherResult({
      matched: false,
      matchType: "none",
      publisher: "Unknown Publisher",
      groupKey: "unknown_group",
      category: "unknown",
      confidence: "low",
      notes: "Empty URL."
    });
  }

  const exact = CORE_RULES.find(rule => {
    const ruleDomain = normalizeDomain(rule.domain);
    return host === ruleDomain || host.endsWith("." + ruleDomain);
  });

  if (exact) {
    return {
      matched: true,
      matchType: "exact_domain",
      ...exact,
      score: 100,
      reasons: ["Exact publisher domain matched"]
    };
  }

  const pathHit = CORE_RULES.find(rule => raw.includes(rule.domain.toLowerCase()));

  if (pathHit) {
    return {
      matched: true,
      matchType: "path_contains",
      ...pathHit,
      score: 80,
      reasons: ["Publisher domain appeared inside URL path or encoded destination"]
    };
  }

  for (const rule of PATTERN_RULES) {
    const token = rule.aliases?.[0];

    if (token && host.includes(token)) {
      return {
        matched: true,
        matchType: "pattern",
        ...rule,
        score: 45,
        reasons: [`Fallback pattern matched: ${token}`]
      };
    }
  }

  return buildPublisherResult({
    matched: false,
    matchType: "none",
    publisher: "Unknown Publisher",
    domain: host,
    groupKey: "unknown_group",
    category: "unknown",
    confidence: "low",
    notes: "No publisher rule matched. Add this domain or Amazon tag to the database after manual validation.",
    score: 0,
    reasons: []
  });
}

function detectPublisherUniversal(input = {}) {
  const url = input.url || input.inputUrl || "";
  const params = input.params || getParamsFromUrl(url);

  // Amazon tag / ascsubtag 优先级最高
  const amazonPublisher = detectPublisherByAmazonParams(params);

  if (amazonPublisher) {
    return amazonPublisher;
  }

  return detectPublisherByUrl(url);
}

function getPublisherStats() {
  const byCategory = {};
  const byGroup = {};

  for (const r of PUBLISHER_DATABASE) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    byGroup[r.groupKey] = (byGroup[r.groupKey] || 0) + 1;
  }

  return {
    totalRules: PUBLISHER_DATABASE.length,
    exactRules: CORE_RULES.length,
    patternRules: PATTERN_RULES.length,
    amazonTagRules: AMAZON_TAG_RULES.length,
    byCategory,
    byGroup
  };
}

module.exports = {
  GROUPS,
  TYPE_META,
  SEED_GROUPS,
  AMAZON_TAG_RULES,
  CORE_RULES,
  PATTERN_PACKS,
  PATTERN_RULES,
  PUBLISHER_DATABASE,
  detectPublisherByUrl,
  detectPublisherByAmazonParams,
  detectPublisherUniversal,
  getPublisherStats
};
