// publisher-database.js
// BrandShuo Attribution Checker
// 500+ Affiliate Publisher Database v1.0
// 用法：const { PUBLISHER_DATABASE, detectPublisherByUrl } = require("./publisher-database");

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
  commerce_media: { trafficType: "SEO / Editorial Commerce", intent: "Research Intent", role: "Upper / Mid Funnel", quality: 86, incrementalityRisk: "Low-Medium" },
  review_site: { trafficType: "SEO Review", intent: "High Consideration", role: "Mid Funnel", quality: 82, incrementalityRisk: "Low-Medium" },
  deal_site: { trafficType: "Deal / Promo", intent: "Discount Intent", role: "Lower Funnel", quality: 62, incrementalityRisk: "Medium-High" },
  coupon_site: { trafficType: "Coupon / Voucher", intent: "Checkout Intent", role: "Last Click", quality: 48, incrementalityRisk: "High" },
  cashback: { trafficType: "Cashback / Loyalty", intent: "Reward Intent", role: "Last Click / Loyalty", quality: 55, incrementalityRisk: "High" },
  sub_affiliate: { trafficType: "Sub-affiliate", intent: "Syndicated Click", role: "Tracking Layer", quality: 50, incrementalityRisk: "Medium-High" },
  creator: { trafficType: "Creator / Influencer", intent: "Creator Recommendation", role: "Demand Creation", quality: 78, incrementalityRisk: "Low-Medium" },
  price_tool: { trafficType: "Price Tracking / Extension", intent: "Price Comparison", role: "Assist / Last Click", quality: 58, incrementalityRisk: "Medium-High" },
  b2b_review: { trafficType: "B2B Review Marketplace", intent: "Software Evaluation", role: "Lead Assist", quality: 80, incrementalityRisk: "Medium" },
  unknown: { trafficType: "Unknown", intent: "Unknown", role: "Unknown", quality: 40, incrementalityRisk: "Unknown" }
};

const SEED_GROUPS = {
  "nyt": [
    "wirecutter.com",
    "nytimes.com/wirecutter"
  ],
  "ziff_davis": [
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
  "future": [
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
  "hearst": [
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
  "dotdash_meredith": [
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
  "red_ventures": [
    "bankrate.com",
    "creditcards.com",
    "thepointsguy.com",
    "lonelyplanet.com",
    "reviews.com",
    "bestcolleges.com"
  ],
  "condenast": [
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
  "vox": [
    "theverge.com",
    "nymag.com/strategist",
    "thecut.com",
    "eater.com",
    "polygon.com",
    "vox.com",
    "curbed.com",
    "vulture.com"
  ],
  "buzzfeed": [
    "buzzfeed.com",
    "huffpost.com",
    "tasty.co"
  ],
  "forbes": [
    "forbes.com/sites/forbes-personal-shopper",
    "forbes.com/vetted",
    "forbes.com/advisor"
  ],
  "gannett": [
    "usatoday.com",
    "reviewed.usatoday.com",
    "azcentral.com",
    "indystar.com",
    "detroitnews.com"
  ],
  "nbc": [
    "nbcnews.com/select",
    "today.com/shop",
    "cnbc.com/select"
  ],
  "cnn": [
    "cnn.com/cnn-underscored",
    "cnn.com/underscored"
  ],
  "commerce_independent": [
    "rtings.com",
    "consumerreports.org",
    "sleepfoundation.org",
    "mattressclarity.com",
    "mattressnerd.com",
    "sleepopolis.com",
    "tomsguide.com",
    "theinventory.com",
    "gearlab.com",
    "outdoorgearlab.com",
    "babygearlab.com",
    "switchbacktravel.com",
    "wirecutter.com",
    "reviewed.usatoday.com",
    "bestreviews.com",
    "techgearlab.com"
  ],
  "deal_community": [
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
  "coupon_cashback": [
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
    "givingassistant.org",
    "wikibuy.com"
  ],
  "sub_affiliate": [
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
  "tech_youtube_blogs": [
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
  "home_lifestyle": [
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
  "fashion_beauty": [
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
  "outdoor_travel": [
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
  "amazon_deal_publishers": [
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
  "b2b_saas": [
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

function normalizeDomain(input) {
  if (!input) return "";
  let s = String(input).toLowerCase().trim();
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return s.split(/[/?#]/)[0];
}

function typeForGroup(groupKey, domain) {
  if (groupKey === "deal_community" || groupKey === "amazon_deal_publishers") return "deal_site";
  if (groupKey === "coupon_cashback") {
    if (/rakuten|topcashback|befrugal|swagbucks|ibotta|fetch|upromise|rebates|cashback|extrabux/i.test(domain)) return "cashback";
    if (/honey|capitaloneshopping|wikibuy/i.test(domain)) return "price_tool";
    return "coupon_site";
  }
  if (groupKey === "sub_affiliate") return "sub_affiliate";
  if (groupKey === "b2b_saas") return "b2b_review";
  if (groupKey === "commerce_independent" || groupKey === "tech_youtube_blogs" || groupKey === "home_lifestyle" || groupKey === "fashion_beauty" || groupKey === "outdoor_travel") return "review_site";
  return "commerce_media";
}

function makeRule(domain, groupKey, extra = {}) {
  const type = extra.type || typeForGroup(groupKey, domain);
  return {
    id: `${groupKey}:${domain}`,
    publisher: extra.publisher || domain.replace(/\.[a-z.]+$/i, "").replace(/[-_]/g, " "),
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

function inferRegion(domain) {
  if (/\.co\.uk|hotukdeals|idealhome|livingetc/i.test(domain)) return "UK";
  if (/\.com\.au|ozbargain|redflagdeals/i.test(domain)) return "AU/CA";
  if (/\.de|mydealz/i.test(domain)) return "EU";
  if (/\.in|dealsheaven/i.test(domain)) return "IN";
  return "US / Global";
}

const CORE_RULES = Object.entries(SEED_GROUPS).flatMap(([groupKey, list]) =>
  list.map((domain) => makeRule(domain, groupKey))
);

// Pattern packs: 用来覆盖 500+ 长尾 publisher，不需要你手工写满 500 个。
// 命中这些 pattern 时，系统仍会返回分类、角色、风险、质量分。
const PATTERN_PACKS = [
  {
    idPrefix: "pattern:coupon",
    group: GROUPS.coupon_cashback,
    groupKey: "coupon_cashback",
    category: "coupon_site",
    patterns: [
      "coupon", "coupons", "promo", "promocode", "voucher", "discount", "saving", "savings",
      "deal", "deals", "offer", "offers", "code", "codes", "bargain", "markdown", "sale"
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
      "review", "reviews", "best", "buyer", "buyersguide", "guide", "tested", "lab", "gear",
      "sleep", "mattress", "home", "kitchen", "outdoor", "pet", "tech", "camera", "audio"
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
    patterns: ["go", "track", "click", "redirect", "link", "out", "r", "aff", "partner", "trk", "clk"],
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

const PUBLISHER_DATABASE = [...CORE_RULES, ...expandPatternRules()];

function detectPublisherByUrl(url) {
  const raw = String(url || "").toLowerCase();
  const host = normalizeDomain(raw);

  const exact = CORE_RULES.find(r => host === normalizeDomain(r.domain) || host.endsWith("." + normalizeDomain(r.domain)));
  if (exact) return { matched: true, matchType: "exact", ...exact };

  const pathHit = CORE_RULES.find(r => raw.includes(r.domain.toLowerCase()));
  if (pathHit) return { matched: true, matchType: "path_contains", ...pathHit };

  for (const rule of expandPatternRules()) {
    const token = rule.aliases?.[0];
    if (token && host.includes(token)) return { matched: true, matchType: "pattern", ...rule };
  }

  return {
    matched: false,
    matchType: "none",
    publisher: "Unknown Publisher",
    domain: host,
    group: GROUPS.unknown_group,
    groupKey: "unknown_group",
    category: "unknown",
    ...TYPE_META.unknown,
    confidence: "low",
    notes: "No publisher rule matched. Add this domain to SEED_GROUPS after manual validation."
  };
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
    patternRules: PUBLISHER_DATABASE.length - CORE_RULES.length,
    byCategory,
    byGroup
  };
}

module.exports = {
  GROUPS,
  TYPE_META,
  SEED_GROUPS,
  CORE_RULES,
  PATTERN_PACKS,
  PUBLISHER_DATABASE,
  detectPublisherByUrl,
  getPublisherStats
};
