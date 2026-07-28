// lib/amazon-tag-publisher-map.js
// BrandShuo Attribution Checker
// Amazon Tag / AscSubtag / URL → Publisher Mapping v2.0

const AMAZON_TAG_PUBLISHER_MAP = [
  // =========================
  // North America - Commerce Media
  // =========================
  {
    tagPatterns: [
      "bf",
      "bfheather",
      "bfshop",
      "bfshopping",
      "bfhome",
      "bfstyle",
      "bfbeauty",
      "bffinds",
      "buzzfeed",
      "buzzfeedshopping"
    ],
    ascsubtagPatterns: [
      "bf-sfp",
      "bf-shp",
      "bf-shopping",
      "buzzfeed",
      "buzzfeed-shopping"
    ],
    domainPatterns: ["buzzfeed.com"],
    publisher: "BuzzFeed",
    domain: "buzzfeed.com",
    group: "BuzzFeed",
    groupKey: "buzzfeed",
    category: "commerce_media",
    region: "US",
    trafficType: "Editorial Commerce",
    commercialIntent: "Shopping / Content Commerce Intent",
    channelRole: "Editorial Commerce / Deal Assist",
    quality: 75,
    incrementalityRisk: "Medium",
    confidence: "high"
  },
  {
    tagPatterns: ["cnet", "cnet-api", "cnet-buy-button"],
    ascsubtagPatterns: ["cnet"],
    domainPatterns: ["cnet.com"],
    publisher: "CNET",
    domain: "cnet.com",
    group: "Ziff Davis",
    groupKey: "ziff_davis",
    category: "commerce_media",
    region: "US / Global",
    trafficType: "SEO / Editorial Commerce",
    commercialIntent: "Editorial Commerce Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 84,
    incrementalityRisk: "Low-Medium",
    confidence: "high"
  },
  {
    tagPatterns: ["pcmag", "p00935"],
    ascsubtagPatterns: ["pcmag", "ziff"],
    domainPatterns: ["pcmag.com"],
    publisher: "PCMag",
    domain: "pcmag.com",
    group: "Ziff Davis",
    groupKey: "ziff_davis",
    category: "commerce_media",
    region: "US / Global",
    trafficType: "SEO / Editorial Commerce",
    commercialIntent: "Editorial Commerce Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 84,
    incrementalityRisk: "Low-Medium",
    confidence: "high"
  },
  {
    tagPatterns: [
      "tomsguide",
      "toms-guide",
      "tomshardware",
      "techradar",
      "pcgamer",
      "laptopmag",
      "future",
      "futurenet"
    ],
    ascsubtagPatterns: [
      "tomsguide",
      "tom's guide",
      "techradar",
      "tomshardware",
      "pcgamer",
      "laptopmag",
      "future"
    ],
    domainPatterns: [
      "tomsguide.com",
      "techradar.com",
      "tomshardware.com",
      "pcgamer.com",
      "laptopmag.com"
    ],
    publisher: "Future Publishing",
    domain: "futureplc.com",
    group: "Future plc",
    groupKey: "future",
    category: "commerce_media",
    region: "US / UK / Global",
    trafficType: "SEO / Editorial Commerce",
    commercialIntent: "Editorial Commerce Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 84,
    incrementalityRisk: "Low-Medium",
    confidence: "high"
  },
  {
    tagPatterns: ["wirecutter", "thewirecutter", "nytimes"],
    ascsubtagPatterns: ["wirecutter", "nytimes", "nyt"],
    domainPatterns: ["nytimes.com/wirecutter", "wirecutter.com"],
    publisher: "Wirecutter",
    domain: "nytimes.com/wirecutter",
    group: "The New York Times Company",
    groupKey: "nyt",
    category: "commerce_media",
    region: "US",
    trafficType: "SEO / Editorial Commerce",
    commercialIntent: "Editorial Commerce Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 88,
    incrementalityRisk: "Low-Medium",
    confidence: "high"
  },
  {
    tagPatterns: ["reviewed", "usatoday"],
    ascsubtagPatterns: ["reviewed", "usatoday", "usa today"],
    domainPatterns: ["reviewed.usatoday.com", "usatoday.com"],
    publisher: "Reviewed / USA Today",
    domain: "reviewed.usatoday.com",
    group: "Gannett / USA Today Network",
    groupKey: "gannett",
    category: "commerce_media",
    region: "US",
    trafficType: "SEO / Editorial Commerce",
    commercialIntent: "Editorial Commerce Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 83,
    incrementalityRisk: "Low-Medium",
    confidence: "high"
  },
  {
    tagPatterns: ["forbes", "forbesvetted"],
    ascsubtagPatterns: ["forbes", "forbes vetted"],
    domainPatterns: ["forbes.com"],
    publisher: "Forbes Vetted",
    domain: "forbes.com",
    group: "Forbes",
    groupKey: "forbes",
    category: "commerce_media",
    region: "US / Global",
    trafficType: "SEO / Editorial Commerce",
    commercialIntent: "Editorial Commerce Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 82,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["nymag", "strategist"],
    ascsubtagPatterns: ["nymag", "strategist"],
    domainPatterns: ["nymag.com/strategist"],
    publisher: "The Strategist",
    domain: "nymag.com/strategist",
    group: "Vox Media",
    groupKey: "vox_media",
    category: "commerce_media",
    region: "US",
    trafficType: "Editorial Commerce",
    commercialIntent: "Shopping / Review Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 82,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
 {
  tagPatterns: [
    "theverge",
    "theverge02",
    "verge"
  ],
    ascsubtagPatterns: ["theverge", "verge"],
    domainPatterns: ["theverge.com"],
    publisher: "The Verge",
    domain: "theverge.com",
    group: "Vox Media",
    groupKey: "vox_media",
    category: "commerce_media",
    region: "US",
    trafficType: "Editorial Commerce",
    commercialIntent: "Shopping / Review Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 80,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
{
  tagPatterns: [
    "androautho",
    "androidauthority",
    "android-authority"
  ],
  ascsubtagPatterns: [
    "android authority",
    "androidauthority"
  ],
  domainPatterns: [
    "androidauthority.com"
  ],
  publisher: "Android Authority",
  domain: "androidauthority.com",
  group: "Authority Media",
  groupKey: "authority_media",
  category: "commerce_media",
  region: "US / Global",
  trafficType: "Tech Editorial Commerce",
  commercialIntent: "Shopping / Review Intent",
  channelRole: "Editorial Discovery / Consideration",
  quality: 85,
  incrementalityRisk: "Low-Medium",
  confidence: "high"
},
  {
    tagPatterns: ["engadget"],
    ascsubtagPatterns: ["engadget"],
    domainPatterns: ["engadget.com"],
    publisher: "Engadget",
    domain: "engadget.com",
    group: "Yahoo / AOL",
    groupKey: "yahoo_aol",
    category: "commerce_media",
    region: "US / Global",
    trafficType: "Tech Editorial Commerce",
    commercialIntent: "Shopping / Review Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 80,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["lifewire", "thespruce", "verywell", "people", "instyle", "travelandleisure"],
    ascsubtagPatterns: ["lifewire", "the spruce", "verywell", "people", "instyle", "travel leisure"],
    domainPatterns: [
      "lifewire.com",
      "thespruce.com",
      "verywellfit.com",
      "people.com",
      "instyle.com",
      "travelandleisure.com"
    ],
    publisher: "Dotdash Meredith",
    domain: "dotdashmeredith.com",
    group: "Dotdash Meredith",
    groupKey: "dotdash_meredith",
    category: "commerce_media",
    region: "US",
    trafficType: "SEO / Editorial Commerce",
    commercialIntent: "Shopping / Review Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 81,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["goodhousekeeping", "popularmechanics", "menshealth", "womenshealth", "esquire"],
    ascsubtagPatterns: [
      "good housekeeping",
      "goodhousekeeping",
      "popular mechanics",
      "mens health",
      "women's health",
      "esquire"
    ],
    domainPatterns: [
      "goodhousekeeping.com",
      "popularmechanics.com",
      "menshealth.com",
      "womenshealthmag.com",
      "esquire.com"
    ],
    publisher: "Hearst Commerce",
    domain: "hearst.com",
    group: "Hearst",
    groupKey: "hearst",
    category: "commerce_media",
    region: "US / UK",
    trafficType: "Editorial Commerce",
    commercialIntent: "Shopping / Review Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 81,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["businessinsider", "insider", "bi"],
    ascsubtagPatterns: ["business insider", "insider reviews"],
    domainPatterns: ["businessinsider.com", "insider.com"],
    publisher: "Business Insider Reviews",
    domain: "businessinsider.com",
    group: "Axel Springer",
    groupKey: "axel_springer",
    category: "commerce_media",
    region: "US / Global",
    trafficType: "Editorial Commerce",
    commercialIntent: "Shopping / Review Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 82,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },

  // =========================
  // North America - Review Sites
  // =========================
  {
    tagPatterns: ["mattressnerd", "mattress-nerd"],
    ascsubtagPatterns: ["mattressnerd", "mattress nerd"],
    domainPatterns: ["mattressnerd.com"],
    publisher: "Mattress Nerd",
    domain: "mattressnerd.com",
    group: "Independent Publisher",
    groupKey: "commerce_independent",
    category: "review_site",
    region: "US",
    trafficType: "SEO Review",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 82,
    incrementalityRisk: "Low-Medium",
    confidence: "high"
  },
  {
    tagPatterns: ["sleepopolis"],
    ascsubtagPatterns: ["sleepopolis"],
    domainPatterns: ["sleepopolis.com"],
    publisher: "Sleepopolis",
    domain: "sleepopolis.com",
    group: "Independent Publisher",
    groupKey: "commerce_independent",
    category: "review_site",
    region: "US",
    trafficType: "SEO Review",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 82,
    incrementalityRisk: "Low-Medium",
    confidence: "high"
  },
  {
    tagPatterns: ["rtings"],
    ascsubtagPatterns: ["rtings"],
    domainPatterns: ["rtings.com"],
    publisher: "RTINGS",
    domain: "rtings.com",
    group: "Independent Publisher",
    groupKey: "commerce_independent",
    category: "review_site",
    region: "US / CA",
    trafficType: "SEO Review",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 86,
    incrementalityRisk: "Low-Medium",
    confidence: "high"
  },
  {
    tagPatterns: ["bestreviews"],
    ascsubtagPatterns: ["bestreviews", "best reviews"],
    domainPatterns: ["bestreviews.com"],
    publisher: "BestReviews",
    domain: "bestreviews.com",
    group: "Independent Publisher",
    groupKey: "commerce_independent",
    category: "review_site",
    region: "US",
    trafficType: "SEO Review",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 80,
    incrementalityRisk: "Low-Medium",
    confidence: "high"
  },
  {
    tagPatterns: ["techgearlab", "gearlab"],
    ascsubtagPatterns: ["techgearlab", "gear lab"],
    domainPatterns: ["techgearlab.com", "outdoorgearlab.com"],
    publisher: "TechGearLab / OutdoorGearLab",
    domain: "techgearlab.com",
    group: "Independent Publisher",
    groupKey: "commerce_independent",
    category: "review_site",
    region: "US",
    trafficType: "SEO Review",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 82,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["consumerreports", "consumer-reports"],
    ascsubtagPatterns: ["consumer reports"],
    domainPatterns: ["consumerreports.org"],
    publisher: "Consumer Reports",
    domain: "consumerreports.org",
    group: "Consumer Reports",
    groupKey: "consumer_reports",
    category: "review_site",
    region: "US",
    trafficType: "Independent Review",
    commercialIntent: "Research / Review Intent",
    channelRole: "Upper / Mid-funnel Research Assist",
    quality: 88,
    incrementalityRisk: "Low",
    confidence: "medium"
  },

  // =========================
  // North America - Deal / Coupon / Cashback / Tools
  // =========================
  {
    tagPatterns: ["slickdeals", "slickdeal", "slick", "sd"],
    ascsubtagPatterns: ["slickdeals", "slick deals"],
    domainPatterns: ["slickdeals.net"],
    publisher: "Slickdeals",
    domain: "slickdeals.net",
    group: "Deal / Community Publisher",
    groupKey: "deal_community",
    category: "deal_site",
    region: "US",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 66,
    incrementalityRisk: "Medium-High",
    confidence: "high"
  },
  {
    tagPatterns: ["dealmoon"],
    ascsubtagPatterns: ["dealmoon"],
    domainPatterns: ["dealmoon.com"],
    publisher: "Dealmoon",
    domain: "dealmoon.com",
    group: "Deal / Community Publisher",
    groupKey: "deal_community",
    category: "deal_site",
    region: "US / Global",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 62,
    incrementalityRisk: "Medium-High",
    confidence: "high"
  },
  {
    tagPatterns: ["dealnews"],
    ascsubtagPatterns: ["dealnews"],
    domainPatterns: ["dealnews.com"],
    publisher: "DealNews",
    domain: "dealnews.com",
    group: "Deal / Community Publisher",
    groupKey: "deal_community",
    category: "deal_site",
    region: "US",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 62,
    incrementalityRisk: "Medium-High",
    confidence: "high"
  },
  {
    tagPatterns: ["dealseekweb", "dealseek"],
    ascsubtagPatterns: ["dealseek", "deal seek"],
    domainPatterns: ["dealseek.com"],
    publisher: "DealSeek",
    domain: "dealseek.com",
    group: "Deal / Community Publisher",
    groupKey: "deal_community",
    category: "deal_site",
    region: "US",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 62,
    incrementalityRisk: "Medium-High",
    confidence: "high"
  },
  {
    tagPatterns: ["bensbargains"],
    ascsubtagPatterns: ["bensbargains", "ben's bargains"],
    domainPatterns: ["bensbargains.com"],
    publisher: "Ben's Bargains",
    domain: "bensbargains.com",
    group: "Deal / Community Publisher",
    groupKey: "deal_community",
    category: "deal_site",
    region: "US",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 60,
    incrementalityRisk: "Medium-High",
    confidence: "high"
  },
  {
    tagPatterns: ["bradsdeals"],
    ascsubtagPatterns: ["bradsdeals", "brad's deals"],
    domainPatterns: ["bradsdeals.com"],
    publisher: "Brad's Deals",
    domain: "bradsdeals.com",
    group: "Deal / Community Publisher",
    groupKey: "deal_community",
    category: "deal_site",
    region: "US",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 60,
    incrementalityRisk: "Medium-High",
    confidence: "high"
  },
  {
    tagPatterns: ["retailmenot"],
    ascsubtagPatterns: ["retailmenot", "retail me not"],
    domainPatterns: ["retailmenot.com"],
    publisher: "RetailMeNot",
    domain: "retailmenot.com",
    group: "Ziff Davis",
    groupKey: "ziff_davis",
    category: "coupon_site",
    region: "US",
    trafficType: "Coupon / Voucher",
    commercialIntent: "Coupon / Checkout Intent",
    channelRole: "Last-click / Checkout Interceptor",
    quality: 48,
    incrementalityRisk: "High",
    confidence: "high"
  },
  {
    tagPatterns: ["coupons", "couponcabin", "coupon-cabin"],
    ascsubtagPatterns: ["couponcabin", "coupon cabin"],
    domainPatterns: ["couponcabin.com", "coupons.com"],
    publisher: "Coupon Publisher",
    domain: "",
    group: "Coupon Publisher",
    groupKey: "coupon_publisher",
    category: "coupon_site",
    region: "US",
    trafficType: "Coupon / Voucher",
    commercialIntent: "Coupon / Checkout Intent",
    channelRole: "Last-click / Checkout Interceptor",
    quality: 45,
    incrementalityRisk: "High",
    confidence: "medium"
  },
  {
    tagPatterns: ["honey", "joinhoney", "paypalhoney"],
    ascsubtagPatterns: ["honey", "joinhoney", "paypal honey"],
    domainPatterns: ["joinhoney.com", "paypal.com"],
    publisher: "Honey / PayPal Honey",
    domain: "joinhoney.com",
    group: "PayPal",
    groupKey: "paypal_honey",
    category: "price_tool",
    region: "US / Global",
    trafficType: "Price Tracking / Extension",
    commercialIntent: "Coupon / Checkout Intent",
    channelRole: "Last-click / Browser Extension",
    quality: 50,
    incrementalityRisk: "High",
    confidence: "high"
  },
  {
    tagPatterns: ["capitaloneshopping", "capitalone"],
    ascsubtagPatterns: ["capital one shopping", "capitaloneshopping"],
    domainPatterns: ["capitaloneshopping.com"],
    publisher: "Capital One Shopping",
    domain: "capitaloneshopping.com",
    group: "Capital One",
    groupKey: "capital_one",
    category: "price_tool",
    region: "US",
    trafficType: "Price Tool / Browser Extension",
    commercialIntent: "Coupon / Checkout Intent",
    channelRole: "Last-click / Browser Extension",
    quality: 50,
    incrementalityRisk: "High",
    confidence: "medium"
  },
  {
    tagPatterns: ["rakuten"],
    ascsubtagPatterns: ["rakuten rewards"],
    domainPatterns: ["rakuten.com"],
    publisher: "Rakuten Rewards",
    domain: "rakuten.com",
    group: "Cashback / Loyalty Publisher",
    groupKey: "coupon_cashback",
    category: "cashback",
    region: "US / Global",
    trafficType: "Cashback / Loyalty",
    commercialIntent: "Cashback / Reward Intent",
    channelRole: "Last Click / Loyalty",
    quality: 55,
    incrementalityRisk: "High",
    confidence: "medium"
  },
  {
    tagPatterns: ["topcashback"],
    ascsubtagPatterns: ["topcashback", "top cash back"],
    domainPatterns: ["topcashback.com"],
    publisher: "TopCashback",
    domain: "topcashback.com",
    group: "Cashback / Loyalty Publisher",
    groupKey: "coupon_cashback",
    category: "cashback",
    region: "US / UK",
    trafficType: "Cashback / Loyalty",
    commercialIntent: "Cashback / Reward Intent",
    channelRole: "Last Click / Loyalty",
    quality: 55,
    incrementalityRisk: "High",
    confidence: "medium"
  },

  // =========================
  // Sub-affiliate / Creator Commerce
  // =========================
  {
    tagPatterns: ["skimlinks", "skimbit"],
    ascsubtagPatterns: ["skimlinks", "skimbit"],
    domainPatterns: ["skimlinks.com", "go.skimresources.com"],
    publisher: "Skimlinks",
    domain: "skimlinks.com",
    group: "Sub-affiliate / Commerce Network",
    groupKey: "sub_affiliate",
    category: "sub_affiliate",
    region: "Global",
    trafficType: "Syndicated Commerce Traffic",
    commercialIntent: "Syndicated Affiliate Intent",
    channelRole: "Tracking / Syndication Layer",
    quality: 58,
    incrementalityRisk: "Medium-High",
    confidence: "medium"
  },
  {
    tagPatterns: ["sovrn", "viglink", "vglnk"],
    ascsubtagPatterns: ["sovrn", "viglink", "vglnk"],
    domainPatterns: ["sovrn.com", "viglink.com", "redirect.viglink.com"],
    publisher: "Sovrn / VigLink",
    domain: "sovrn.com",
    group: "Sub-affiliate / Commerce Network",
    groupKey: "sub_affiliate",
    category: "sub_affiliate",
    region: "Global",
    trafficType: "Syndicated Commerce Traffic",
    commercialIntent: "Syndicated Affiliate Intent",
    channelRole: "Tracking / Syndication Layer",
    quality: 58,
    incrementalityRisk: "Medium-High",
    confidence: "medium"
  },
  {
    tagPatterns: ["geniuslink", "geni"],
    ascsubtagPatterns: ["geniuslink", "geni.us"],
    domainPatterns: ["geni.us", "geniuslink.com"],
    publisher: "Geniuslink",
    domain: "geniuslink.com",
    group: "Link Routing / Sub-affiliate",
    groupKey: "link_router",
    category: "sub_affiliate",
    region: "Global",
    trafficType: "Smart Link / Geo Routing",
    commercialIntent: "Affiliate Routing Intent",
    channelRole: "Routing / Attribution Layer",
    quality: 55,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["ltk", "liketoknowit"],
    ascsubtagPatterns: ["ltk", "liketoknowit"],
    domainPatterns: ["shopltk.com", "liketoknow.it"],
    publisher: "LTK",
    domain: "shopltk.com",
    group: "Creator Commerce Platform",
    groupKey: "creator_commerce",
    category: "creator",
    region: "US / Global",
    trafficType: "Creator Commerce",
    commercialIntent: "Creator Recommendation Intent",
    channelRole: "Demand Creation / Creator Influence",
    quality: 68,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["shopmy"],
    ascsubtagPatterns: ["shopmy"],
    domainPatterns: ["shopmy.us", "shopmy.com"],
    publisher: "ShopMy",
    domain: "shopmy.us",
    group: "Creator Commerce Platform",
    groupKey: "creator_commerce",
    category: "creator",
    region: "US / Global",
    trafficType: "Creator Commerce",
    commercialIntent: "Creator Recommendation Intent",
    channelRole: "Demand Creation / Creator Influence",
    quality: 68,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },

  // =========================
  // Europe - UK / EU
  // =========================
  {
    tagPatterns: ["which"],
    ascsubtagPatterns: ["which"],
    domainPatterns: ["which.co.uk"],
    publisher: "Which?",
    domain: "which.co.uk",
    group: "Which?",
    groupKey: "which_uk",
    category: "review_site",
    region: "UK",
    trafficType: "Independent Review",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 86,
    incrementalityRisk: "Low",
    confidence: "medium"
  },
  {
    tagPatterns: ["trustedreviews"],
    ascsubtagPatterns: ["trustedreviews", "trusted reviews"],
    domainPatterns: ["trustedreviews.com"],
    publisher: "Trusted Reviews",
    domain: "trustedreviews.com",
    group: "Trusted Reviews",
    groupKey: "trusted_reviews",
    category: "review_site",
    region: "UK",
    trafficType: "SEO Review",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 80,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["expertreviews"],
    ascsubtagPatterns: ["expertreviews", "expert reviews"],
    domainPatterns: ["expertreviews.co.uk"],
    publisher: "Expert Reviews",
    domain: "expertreviews.co.uk",
    group: "Expert Reviews",
    groupKey: "expert_reviews",
    category: "review_site",
    region: "UK",
    trafficType: "SEO Review",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 79,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["t3"],
    ascsubtagPatterns: ["t3"],
    domainPatterns: ["t3.com"],
    publisher: "T3",
    domain: "t3.com",
    group: "Future plc",
    groupKey: "future",
    category: "commerce_media",
    region: "UK / Global",
    trafficType: "Editorial Commerce",
    commercialIntent: "Shopping / Review Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 80,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["idealo"],
    ascsubtagPatterns: ["idealo"],
    domainPatterns: ["idealo.de", "idealo.co.uk", "idealo.fr", "idealo.es"],
    publisher: "Idealo",
    domain: "idealo.de",
    group: "Price Comparison",
    groupKey: "price_comparison",
    category: "price_comparison",
    region: "DE / UK / EU",
    trafficType: "Price Comparison",
    commercialIntent: "Comparison / Shopping Intent",
    channelRole: "Comparison Assist / Lower Funnel",
    quality: 70,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["kelkoo"],
    ascsubtagPatterns: ["kelkoo"],
    domainPatterns: ["kelkoo.com", "kelkoo.co.uk", "kelkoo.fr", "kelkoo.de"],
    publisher: "Kelkoo",
    domain: "kelkoo.com",
    group: "Price Comparison",
    groupKey: "price_comparison",
    category: "price_comparison",
    region: "EU",
    trafficType: "Price Comparison",
    commercialIntent: "Comparison / Shopping Intent",
    channelRole: "Comparison Assist / Lower Funnel",
    quality: 68,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["pricerunner"],
    ascsubtagPatterns: ["pricerunner"],
    domainPatterns: ["pricerunner.com", "pricerunner.co.uk"],
    publisher: "PriceRunner",
    domain: "pricerunner.com",
    group: "Price Comparison",
    groupKey: "price_comparison",
    category: "price_comparison",
    region: "UK / Nordics / EU",
    trafficType: "Price Comparison",
    commercialIntent: "Comparison / Shopping Intent",
    channelRole: "Comparison Assist / Lower Funnel",
    quality: 68,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["hotukdeals"],
    ascsubtagPatterns: ["hotukdeals"],
    domainPatterns: ["hotukdeals.com"],
    publisher: "HotUKDeals",
    domain: "hotukdeals.com",
    group: "Pepper.com",
    groupKey: "pepper",
    category: "deal_site",
    region: "UK",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 62,
    incrementalityRisk: "Medium-High",
    confidence: "medium"
  },
  {
    tagPatterns: ["mydealz"],
    ascsubtagPatterns: ["mydealz"],
    domainPatterns: ["mydealz.de"],
    publisher: "mydealz",
    domain: "mydealz.de",
    group: "Pepper.com",
    groupKey: "pepper",
    category: "deal_site",
    region: "DE",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 62,
    incrementalityRisk: "Medium-High",
    confidence: "medium"
  },
  {
    tagPatterns: ["dealabs"],
    ascsubtagPatterns: ["dealabs"],
    domainPatterns: ["dealabs.com"],
    publisher: "Dealabs",
    domain: "dealabs.com",
    group: "Pepper.com",
    groupKey: "pepper",
    category: "deal_site",
    region: "FR",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 62,
    incrementalityRisk: "Medium-High",
    confidence: "medium"
  },
  {
    tagPatterns: ["quidco"],
    ascsubtagPatterns: ["quidco"],
    domainPatterns: ["quidco.com"],
    publisher: "Quidco",
    domain: "quidco.com",
    group: "Cashback / Loyalty Publisher",
    groupKey: "coupon_cashback",
    category: "cashback",
    region: "UK",
    trafficType: "Cashback / Loyalty",
    commercialIntent: "Cashback / Reward Intent",
    channelRole: "Last Click / Loyalty",
    quality: 55,
    incrementalityRisk: "High",
    confidence: "medium"
  },
  {
    tagPatterns: ["vouchercloud"],
    ascsubtagPatterns: ["vouchercloud"],
    domainPatterns: ["vouchercloud.com"],
    publisher: "Vouchercloud",
    domain: "vouchercloud.com",
    group: "Coupon Publisher",
    groupKey: "coupon_publisher",
    category: "coupon_site",
    region: "UK / EU",
    trafficType: "Coupon / Voucher",
    commercialIntent: "Coupon / Checkout Intent",
    channelRole: "Last-click / Checkout Interceptor",
    quality: 48,
    incrementalityRisk: "High",
    confidence: "medium"
  },

  // =========================
  // Japan
  // =========================
  {
    tagPatterns: ["kakaku", "kakakukom"],
    ascsubtagPatterns: ["kakaku", "価格"],
    domainPatterns: ["kakaku.com"],
    publisher: "Kakaku.com",
    domain: "kakaku.com",
    group: "Kakaku.com",
    groupKey: "kakaku",
    category: "price_comparison",
    region: "JP",
    trafficType: "Price Comparison",
    commercialIntent: "Comparison / Shopping Intent",
    channelRole: "Comparison Assist / Lower Funnel",
    quality: 72,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["mybest"],
    ascsubtagPatterns: ["mybest", "my best"],
    domainPatterns: ["my-best.com"],
    publisher: "mybest",
    domain: "my-best.com",
    group: "mybest",
    groupKey: "mybest",
    category: "review_site",
    region: "JP",
    trafficType: "SEO Review / Comparison",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 78,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["rakutenjp", "rakuten-jp"],
    ascsubtagPatterns: ["rakuten jp", "rakuten japan"],
    domainPatterns: ["rakuten.co.jp"],
    publisher: "Rakuten Japan",
    domain: "rakuten.co.jp",
    group: "Rakuten",
    groupKey: "rakuten_jp",
    category: "marketplace",
    region: "JP",
    trafficType: "Marketplace / Affiliate",
    commercialIntent: "Marketplace Shopping Intent",
    channelRole: "Marketplace Destination / Affiliate Layer",
    quality: 65,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["yahooshopping", "yahoojp"],
    ascsubtagPatterns: ["yahoo shopping", "yahoo japan"],
    domainPatterns: ["shopping.yahoo.co.jp"],
    publisher: "Yahoo! Shopping Japan",
    domain: "shopping.yahoo.co.jp",
    group: "Yahoo Japan",
    groupKey: "yahoo_jp",
    category: "marketplace",
    region: "JP",
    trafficType: "Marketplace / Shopping",
    commercialIntent: "Marketplace Shopping Intent",
    channelRole: "Marketplace Destination",
    quality: 65,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["monoqlo", "360life"],
    ascsubtagPatterns: ["monoqlo", "360life"],
    domainPatterns: ["360life.shinyusha.co.jp"],
    publisher: "MONOQLO / 360LiFE",
    domain: "360life.shinyusha.co.jp",
    group: "Shinyusha",
    groupKey: "shinyusha",
    category: "review_site",
    region: "JP",
    trafficType: "Product Review / Comparison",
    commercialIntent: "Research / Review Intent",
    channelRole: "Mid-funnel Review Assist",
    quality: 76,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },

  // =========================
  // Australia
  // =========================
  {
    tagPatterns: ["finder", "finderau"],
    ascsubtagPatterns: ["finder au", "finder"],
    domainPatterns: ["finder.com.au"],
    publisher: "Finder AU",
    domain: "finder.com.au",
    group: "Finder",
    groupKey: "finder",
    category: "review_site",
    region: "AU",
    trafficType: "Comparison / Review",
    commercialIntent: "Comparison / Research Intent",
    channelRole: "Mid-funnel Comparison Assist",
    quality: 78,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["canstar", "canstarblue"],
    ascsubtagPatterns: ["canstar", "canstar blue"],
    domainPatterns: ["canstar.com.au", "canstarblue.com.au"],
    publisher: "Canstar / Canstar Blue",
    domain: "canstar.com.au",
    group: "Canstar",
    groupKey: "canstar",
    category: "review_site",
    region: "AU",
    trafficType: "Comparison / Review",
    commercialIntent: "Comparison / Research Intent",
    channelRole: "Mid-funnel Comparison Assist",
    quality: 78,
    incrementalityRisk: "Low-Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["getprice"],
    ascsubtagPatterns: ["getprice"],
    domainPatterns: ["getprice.com.au"],
    publisher: "Getprice",
    domain: "getprice.com.au",
    group: "Price Comparison",
    groupKey: "price_comparison",
    category: "price_comparison",
    region: "AU",
    trafficType: "Price Comparison",
    commercialIntent: "Comparison / Shopping Intent",
    channelRole: "Comparison Assist / Lower Funnel",
    quality: 68,
    incrementalityRisk: "Medium",
    confidence: "medium"
  },
  {
    tagPatterns: ["ozbargain"],
    ascsubtagPatterns: ["ozbargain", "oz bargain"],
    domainPatterns: ["ozbargain.com.au"],
    publisher: "OzBargain",
    domain: "ozbargain.com.au",
    group: "Deal Community",
    groupKey: "deal_community",
    category: "deal_site",
    region: "AU",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 62,
    incrementalityRisk: "Medium-High",
    confidence: "medium"
  },
  {
    tagPatterns: ["cashrewards"],
    ascsubtagPatterns: ["cashrewards"],
    domainPatterns: ["cashrewards.com.au"],
    publisher: "Cashrewards",
    domain: "cashrewards.com.au",
    group: "Cashback / Loyalty Publisher",
    groupKey: "coupon_cashback",
    category: "cashback",
    region: "AU",
    trafficType: "Cashback / Loyalty",
    commercialIntent: "Cashback / Reward Intent",
    channelRole: "Last Click / Loyalty",
    quality: 55,
    incrementalityRisk: "High",
    confidence: "medium"
  },
  {
    tagPatterns: ["shopback"],
    ascsubtagPatterns: ["shopback"],
    domainPatterns: ["shopback.com.au", "shopback.com"],
    publisher: "ShopBack",
    domain: "shopback.com",
    group: "Cashback / Loyalty Publisher",
    groupKey: "coupon_cashback",
    category: "cashback",
    region: "AU / APAC",
    trafficType: "Cashback / Loyalty",
    commercialIntent: "Cashback / Reward Intent",
    channelRole: "Last Click / Loyalty",
    quality: 55,
    incrementalityRisk: "High",
    confidence: "medium"
  },

  // =========================
  // Generic Amazon Deal Tags
  // =========================
  {
    tagPatterns: ["amazondealclubs", "amazondealclub", "amazon-deal"],
    ascsubtagPatterns: ["amazon deal", "dealclub"],
    domainPatterns: ["amazondealclubs.com"],
    publisher: "Amazon Deal Clubs",
    domain: "amazondealclubs.com",
    group: "Amazon Deal Publisher",
    groupKey: "amazon_deal",
    category: "deal_site",
    region: "US",
    trafficType: "Deal / Promo",
    commercialIntent: "Deal Hunting Intent",
    channelRole: "Promo Discovery / Lower Funnel",
    quality: 58,
    incrementalityRisk: "Medium-High",
    confidence: "medium"
  }
];

function safeDecode(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function normalizeAmazonTag(tag) {
  return String(tag || "")
    .toLowerCase()
    .trim()
    .replace(/-20$/, "")
    .replace(/-21$/, "")
    .replace(/-22$/, "")
    .replace(/[^a-z0-9-_]/g, "");
}

function normalizeText(value) {
  return safeDecode(value)
    .toLowerCase()
    .trim();
}

function matchPatterns(source, patterns = []) {
  if (!source || !Array.isArray(patterns)) return false;

  return patterns.some((pattern) => {
    const p = String(pattern || "").toLowerCase().trim();
    if (!p) return false;

    return source.includes(p);
  });
}

function detectPublisherByAmazonTag(tag, ascsubtag = "", rawUrl = "") {
  const cleanTag = normalizeAmazonTag(tag);
  const asc = normalizeText(ascsubtag);
  const raw = normalizeText(rawUrl);

  if (!cleanTag && !asc && !raw) return null;

  const matched = AMAZON_TAG_PUBLISHER_MAP.find((item) => {
    const tagMatch = matchPatterns(cleanTag, item.tagPatterns);
    const ascMatch = matchPatterns(asc, item.ascsubtagPatterns);
    const domainMatch = matchPatterns(raw, item.domainPatterns);

    return tagMatch || ascMatch || domainMatch;
  });

  if (!matched) return null;

  let matchType = "amazon_tag";
  if (matchPatterns(asc, matched.ascsubtagPatterns)) {
    matchType = "amazon_ascsubtag";
  } else if (matchPatterns(raw, matched.domainPatterns)) {
    matchType = "amazon_url_domain";
  }

  return {
    matched: true,
    matchType,
    publisher: matched.publisher,
    domain: matched.domain,
    group: matched.group,
    groupKey: matched.groupKey,
    category: matched.category,
    region: matched.region,
    trafficType: matched.trafficType,
    commercialIntent: matched.commercialIntent,
    channelRole: matched.channelRole,
    quality: matched.quality,
    incrementalityRisk: matched.incrementalityRisk,
    confidence: matched.confidence || "medium",
    source: matchType,
    tag: tag || null,
    ascsubtag: ascsubtag || null
  };
}

function getAmazonPublisherMapStats() {
  return {
    totalRules: AMAZON_TAG_PUBLISHER_MAP.length,
    supportedMatchTypes: ["tagPatterns", "ascsubtagPatterns", "domainPatterns"],
    regions: ["US", "CA", "UK", "EU", "JP", "AU", "Global"],
    categories: [
      "commerce_media",
      "review_site",
      "deal_site",
      "coupon_site",
      "cashback",
      "price_tool",
      "price_comparison",
      "sub_affiliate",
      "creator",
      "marketplace"
    ]
  };
}

module.exports = {
  AMAZON_TAG_PUBLISHER_MAP,
  detectPublisherByAmazonTag,
  getAmazonPublisherMapStats
};
