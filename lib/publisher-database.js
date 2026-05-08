// lib/publisher-database.js
// BrandShuo Attribution Checker
// Publisher Intelligence Database v2.0
// Safe replacement version

const PUBLISHERS = [
  // =========================
  // Deal / Coupon
  // =========================
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
    incrementalityRisk: "High",
    attributionRisk: "Last-click / coupon interception risk",
    domains: ["slickdeals.net"],
    amazonTags: ["slickdeals09-20"],
    aliases: ["slickdeals", "slickdeals llc", "slickdeals deals"],
    networks: ["Amazon Associates", "Amazon Creator Connections", "Impact"]
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
    incrementalityRisk: "High",
    attributionRisk: "Coupon code / last-click risk",
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
    incrementalityRisk: "Very High",
    attributionRisk: "Extension-based attribution overwrite risk",
    domains: ["joinhoney.com", "honey.com"],
    amazonTags: [],
    aliases: ["honey", "paypal honey"],
    networks: ["Impact", "CJ Affiliate", "Partnerize"]
  },
  {
    id: "simplycodes",
    publisher: "SimplyCodes",
    group: "SimplyCodes",
    groupKey: "simplycodes",
    category: "deal_coupon",
    trafficType: "Coupon / Promo Code",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Coupon Discovery",
    quality: 66,
    incrementalityRisk: "High",
    attributionRisk: "Coupon-assisted last-click risk",
    domains: ["simplycodes.com"],
    amazonTags: [],
    aliases: ["simplycodes", "simply codes"],
    networks: ["Impact", "CJ Affiliate", "Partnerize"]
  },
  {
    id: "offers",
    publisher: "Offers.com",
    group: "Offers.com",
    groupKey: "offers",
    category: "deal_coupon",
    trafficType: "Coupon / Deals",
    intent: "High Purchase Intent",
    role: "Bottom Funnel",
    quality: 64,
    incrementalityRisk: "High",
    attributionRisk: "Promo code attribution risk",
    domains: ["offers.com"],
    amazonTags: [],
    aliases: ["offers.com", "offers"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "dealnews",
    publisher: "DealNews",
    group: "DealNews",
    groupKey: "dealnews",
    category: "deal_coupon",
    trafficType: "Deal Editorial",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Deal Discovery",
    quality: 70,
    incrementalityRisk: "Medium to High",
    attributionRisk: "Deal-driven attribution",
    domains: ["dealnews.com"],
    amazonTags: [],
    aliases: ["dealnews", "deal news"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "bradsdeals",
    publisher: "Brad's Deals",
    group: "Brad's Deals",
    groupKey: "bradsdeals",
    category: "deal_coupon",
    trafficType: "Deals / Coupon",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Deal Discovery",
    quality: 68,
    incrementalityRisk: "High",
    attributionRisk: "Deal/coupon last-click risk",
    domains: ["bradsdeals.com"],
    amazonTags: [],
    aliases: ["brad's deals", "bradsdeals", "brads deals"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "techbargains",
    publisher: "TechBargains",
    group: "TechBargains",
    groupKey: "techbargains",
    category: "deal_coupon",
    trafficType: "Tech Deals",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Tech Deal",
    quality: 69,
    incrementalityRisk: "Medium to High",
    attributionRisk: "Deal-led attribution",
    domains: ["techbargains.com"],
    amazonTags: [],
    aliases: ["techbargains", "tech bargains"],
    networks: ["CJ Affiliate", "Impact"]
  },

  // =========================
  // Cashback / Rewards
  // =========================
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
    incrementalityRisk: "High",
    attributionRisk: "Cashback last-click risk",
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
    incrementalityRisk: "High",
    attributionRisk: "Cashback attribution risk",
    domains: ["topcashback.com"],
    amazonTags: [],
    aliases: ["topcashback", "top cash back"],
    networks: ["Impact", "CJ Affiliate", "Awin"]
  },
  {
    id: "capital_one_shopping",
    publisher: "Capital One Shopping",
    group: "Capital One",
    groupKey: "capital_one",
    category: "cashback_rewards",
    trafficType: "Shopping Extension / Rewards",
    intent: "Very High Purchase Intent",
    role: "Bottom Funnel / Extension",
    quality: 58,
    incrementalityRisk: "Very High",
    attributionRisk: "Extension / price comparison last-click risk",
    domains: ["capitaloneshopping.com", "wikibuy.com"],
    amazonTags: [],
    aliases: ["capital one shopping", "wikibuy"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "befrugal",
    publisher: "BeFrugal",
    group: "BeFrugal",
    groupKey: "befrugal",
    category: "cashback_rewards",
    trafficType: "Cashback / Coupons",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Loyalty",
    quality: 62,
    incrementalityRisk: "High",
    attributionRisk: "Cashback/coupon attribution",
    domains: ["befrugal.com"],
    amazonTags: [],
    aliases: ["befrugal", "be frugal"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "swagbucks",
    publisher: "Swagbucks",
    group: "Prodege",
    groupKey: "prodege",
    category: "cashback_rewards",
    trafficType: "Rewards / Loyalty",
    intent: "Medium to High Purchase Intent",
    role: "Bottom Funnel / Rewards",
    quality: 60,
    incrementalityRisk: "High",
    attributionRisk: "Reward-based attribution",
    domains: ["swagbucks.com"],
    amazonTags: [],
    aliases: ["swagbucks", "prodege"],
    networks: ["Impact", "CJ Affiliate", "Awin"]
  },
  {
    id: "ibotta",
    publisher: "Ibotta",
    group: "Ibotta",
    groupKey: "ibotta",
    category: "cashback_rewards",
    trafficType: "Cashback / Rewards App",
    intent: "High Purchase Intent",
    role: "Bottom Funnel / Rewards",
    quality: 62,
    incrementalityRisk: "High",
    attributionRisk: "Cashback app attribution",
    domains: ["ibotta.com"],
    amazonTags: [],
    aliases: ["ibotta"],
    networks: ["Impact", "CJ Affiliate"]
  },

  // =========================
  // Review / SEO Media
  // =========================
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
    incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO content-assisted attribution",
    domains: [
      "tomsguide.com",
      "techradar.com",
      "laptopmag.com",
      "whathifi.com",
      "space.com",
      "gamesradar.com",
      "androidcentral.com",
      "windowscentral.com",
      "digitalcameraworld.com",
      "t3.com"
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
      "techradar",
      "android central",
      "windows central"
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
    incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO review attribution",
    domains: ["pcmag.com"],
    amazonTags: ["p00935-20"],
    aliases: ["pcmag", "pc magazine", "ziff davis"],
    networks: ["Amazon Associates", "CJ Affiliate", "Impact"]
  },
  {
    id: "cnet",
    publisher: "CNET",
    group: "CNET / Commerce Media",
    groupKey: "cnet",
    category: "seo_review_media",
    trafficType: "Editorial Review / SEO",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    quality: 82,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO content-assisted attribution",
    domains: ["cnet.com"],
    amazonTags: ["cnet-buy-button-20"],
    aliases: ["cnet", "cnet commerce"],
    networks: ["Amazon Associates", "Partnerize", "CJ Affiliate"]
  },
  {
    id: "wirecutter",
    publisher: "Wirecutter",
    group: "The New York Times",
    groupKey: "nyt_wirecutter",
    category: "seo_review_media",
    trafficType: "Editorial Review / Buyer Guide",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    quality: 88,
    incrementalityRisk: "Low",
    attributionRisk: "Editorial commerce attribution",
    domains: ["nytimes.com", "thewirecutter.com"],
    amazonTags: ["thewire06-20", "wirecutter-20"],
    aliases: ["wirecutter", "the wirecutter", "new york times wirecutter"],
    networks: ["Amazon Associates", "Skimlinks", "Impact"]
  },
  {
    id: "forbes_vetted",
    publisher: "Forbes Vetted",
    group: "Forbes",
    groupKey: "forbes",
    category: "content_commerce",
    trafficType: "Editorial Commerce / Review",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    quality: 84,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["forbes.com"],
    amazonTags: [],
    aliases: ["forbes vetted", "forbes"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn", "Impact"]
  },
  {
    id: "cnn_underscored",
    publisher: "CNN Underscored",
    group: "CNN",
    groupKey: "cnn",
    category: "content_commerce",
    trafficType: "Editorial Commerce",
    intent: "Medium to High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    quality: 82,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["cnn.com"],
    amazonTags: [],
    aliases: ["cnn underscored", "underscored"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn", "Impact"]
  },
  {
    id: "reviewed",
    publisher: "Reviewed",
    group: "USA Today / Gannett",
    groupKey: "gannett",
    category: "seo_review_media",
    trafficType: "Product Review / SEO",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    quality: 82,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Review content attribution",
    domains: ["reviewed.usatoday.com", "usatoday.com"],
    amazonTags: [],
    aliases: ["reviewed", "usa today reviewed"],
    networks: ["Amazon Associates", "Skimlinks", "Impact"]
  },
  {
    id: "digital_trends",
    publisher: "Digital Trends",
    group: "Digital Trends Media Group",
    groupKey: "digital_trends",
    category: "seo_review_media",
    trafficType: "Tech Review / SEO",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel",
    quality: 80,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO review attribution",
    domains: ["digitaltrends.com"],
    amazonTags: [],
    aliases: ["digital trends"],
    networks: ["Amazon Associates", "CJ Affiliate", "Impact"]
  },
  {
    id: "the_verge",
    publisher: "The Verge",
    group: "Vox Media",
    groupKey: "vox_media",
    category: "seo_review_media",
    trafficType: "Tech Editorial / Commerce",
    intent: "Medium to High Research Intent",
    role: "Upper-Mid Funnel",
    quality: 82,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["theverge.com"],
    amazonTags: [],
    aliases: ["the verge", "verge deals"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "engadget",
    publisher: "Engadget",
    group: "Yahoo",
    groupKey: "yahoo",
    category: "seo_review_media",
    trafficType: "Tech Editorial / Deals",
    intent: "Medium to High Research Intent",
    role: "Upper-Mid Funnel",
    quality: 80,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial/deal attribution",
    domains: ["engadget.com"],
    amazonTags: [],
    aliases: ["engadget"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn", "CJ Affiliate"]
  },

  // =========================
  // Content Commerce / Lifestyle
  // =========================
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
    incrementalityRisk: "Medium",
    attributionRisk: "Content-assisted attribution",
    domains: ["buzzfeed.com"],
    amazonTags: ["buzz0f-20"],
    aliases: ["buzzfeed", "buzzfeed shopping"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "nymag_strategist",
    publisher: "The Strategist",
    group: "New York Magazine / Vox Media",
    groupKey: "vox_media",
    category: "content_commerce",
    trafficType: "Editorial Commerce / Buyer Guide",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel",
    quality: 84,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["nymag.com"],
    amazonTags: [],
    aliases: ["the strategist", "new york magazine strategist", "nymag strategist"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "people_shopping",
    publisher: "People Shopping",
    group: "Dotdash Meredith",
    groupKey: "dotdash_meredith",
    category: "content_commerce",
    trafficType: "Lifestyle Commerce",
    intent: "Medium Purchase Intent",
    role: "Mid Funnel / Discovery",
    quality: 78,
    incrementalityRisk: "Medium",
    attributionRisk: "Lifestyle editorial commerce attribution",
    domains: ["people.com"],
    amazonTags: [],
    aliases: ["people shopping", "people picks"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "good_housekeeping",
    publisher: "Good Housekeeping",
    group: "Hearst",
    groupKey: "hearst",
    category: "content_commerce",
    trafficType: "Lifestyle Review / Commerce",
    intent: "Medium to High Research Intent",
    role: "Upper-Mid Funnel",
    quality: 82,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["goodhousekeeping.com"],
    amazonTags: [],
    aliases: ["good housekeeping"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "real_simple",
    publisher: "Real Simple",
    group: "Dotdash Meredith",
    groupKey: "dotdash_meredith",
    category: "content_commerce",
    trafficType: "Lifestyle Commerce",
    intent: "Medium Purchase Intent",
    role: "Mid Funnel / Discovery",
    quality: 78,
    incrementalityRisk: "Medium",
    attributionRisk: "Lifestyle commerce attribution",
    domains: ["realsimple.com"],
    amazonTags: [],
    aliases: ["real simple"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "the_spruce",
    publisher: "The Spruce",
    group: "Dotdash Meredith",
    groupKey: "dotdash_meredith",
    category: "home_lifestyle_media",
    trafficType: "Home Review / SEO",
    intent: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    quality: 84,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO home review attribution",
    domains: ["thespruce.com"],
    amazonTags: [],
    aliases: ["the spruce", "spruce"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "better_homes_gardens",
    publisher: "Better Homes & Gardens",
    group: "Dotdash Meredith",
    groupKey: "dotdash_meredith",
    category: "home_lifestyle_media",
    trafficType: "Home / Lifestyle Commerce",
    intent: "Medium to High Research Intent",
    role: "Upper-Mid Funnel",
    quality: 80,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["bhg.com"],
    amazonTags: [],
    aliases: ["better homes and gardens", "bhg"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "apartment_therapy",
    publisher: "Apartment Therapy",
    group: "Apartment Therapy Media",
    groupKey: "apartment_therapy",
    category: "home_lifestyle_media",
    trafficType: "Home / Lifestyle Commerce",
    intent: "Medium Purchase Intent",
    role: "Mid Funnel / Discovery",
    quality: 78,
    incrementalityRisk: "Medium",
    attributionRisk: "Lifestyle commerce attribution",
    domains: ["apartmenttherapy.com"],
    amazonTags: [],
    aliases: ["apartment therapy"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },

  // =========================
  // Router / Subnetwork / Creator Commerce
  // =========================
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
    incrementalityRisk: "Medium",
    attributionRisk: "Subnetwork attribution layer",
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
    incrementalityRisk: "Medium",
    attributionRisk: "Subnetwork attribution layer",
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
    incrementalityRisk: "Medium",
    attributionRisk: "Smart-link routing attribution ambiguity",
    domains: ["geni.us", "geniuslink.com"],
    amazonTags: [],
    aliases: ["geniuslink", "geni.us"],
    networks: ["Amazon Associates"]
  },
  {
    id: "ltk",
    publisher: "LTK",
    group: "LTK",
    groupKey: "ltk",
    category: "creator_commerce",
    trafficType: "Creator Commerce / Influencer",
    intent: "Medium Purchase Intent",
    role: "Mid Funnel / Creator Assist",
    quality: 76,
    incrementalityRisk: "Medium",
    attributionRisk: "Creator commerce attribution",
    domains: ["shopltk.com", "ltk.app"],
    amazonTags: [],
    aliases: ["ltk", "rewardstyle", "like to know it", "liketoknow.it"],
    networks: ["LTK", "Amazon Associates"]
  },
  {
    id: "shopmy",
    publisher: "ShopMy",
    group: "ShopMy",
    groupKey: "shopmy",
    category: "creator_commerce",
    trafficType: "Creator Commerce",
    intent: "Medium Purchase Intent",
    role: "Mid Funnel / Creator Assist",
    quality: 76,
    incrementalityRisk: "Medium",
    attributionRisk: "Creator commerce attribution",
    domains: ["shopmy.us", "shopmy.us.com", "shopmy.com"],
    amazonTags: [],
    aliases: ["shopmy", "shop my"],
    networks: ["ShopMy", "Amazon Associates"]
  },
  {
    id: "linkby",
    publisher: "Linkby",
    group: "Linkby",
    groupKey: "linkby",
    category: "content_commerce_network",
    trafficType: "Content Commerce Network",
    intent: "Medium Purchase Intent",
    role: "Mid Funnel / Content Distribution",
    quality: 72,
    incrementalityRisk: "Medium",
    attributionRisk: "Sponsored content / commerce attribution",
    domains: ["linkby.com"],
    amazonTags: [],
    aliases: ["linkby"],
    networks: ["Linkby"]
  },

  // =========================
  // Network Signals
  // =========================
  {
    id: "impact",
    publisher: "Impact",
    group: "Impact",
    groupKey: "impact",
    category: "affiliate_network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    role: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: ["impact.com", "impactradius.com", "go.skimresources.com"],
    amazonTags: [],
    aliases: ["impact", "impact radius", "impact.com", "irclickid", "irgwc", "cidimp"],
    networks: ["Impact"]
  },
  {
    id: "cj",
    publisher: "CJ Affiliate",
    group: "CJ Affiliate",
    groupKey: "cj",
    category: "affiliate_network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    role: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: [
      "cj.com",
      "anrdoezrs.net",
      "jdoqocy.com",
      "kqzyfj.com",
      "dpbolvw.net",
      "tkqlhce.com",
      "emjcd.com"
    ],
    amazonTags: [],
    aliases: ["cj", "commission junction", "cjevent"],
    networks: ["CJ Affiliate"]
  },
  {
    id: "rakuten_advertising",
    publisher: "Rakuten Advertising",
    group: "Rakuten Advertising",
    groupKey: "rakuten_advertising",
    category: "affiliate_network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    role: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: ["linksynergy.com", "rakutenadvertising.com"],
    amazonTags: [],
    aliases: ["rakuten advertising", "linksynergy", "ranmid", "ransiteid", "raneaid"],
    networks: ["Rakuten Advertising"]
  },
  {
    id: "partnerize",
    publisher: "Partnerize",
    group: "Partnerize",
    groupKey: "partnerize",
    category: "affiliate_network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    role: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: ["partnerize.com", "prf.hn"],
    amazonTags: [],
    aliases: ["partnerize", "performance horizon", "clickref"],
    networks: ["Partnerize"]
  },
  {
    id: "awin",
    publisher: "Awin",
    group: "Awin",
    groupKey: "awin",
    category: "affiliate_network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    role: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: ["awin.com", "awstrack.me"],
    amazonTags: [],
    aliases: ["awin", "affiliate window", "awc"],
    networks: ["Awin"]
  },
  {
    id: "shareasale",
    publisher: "ShareASale",
    group: "Awin",
    groupKey: "awin",
    category: "affiliate_network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    role: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: ["shareasale.com"],
    amazonTags: [],
    aliases: ["shareasale", "share a sale", "afftrack"],
    networks: ["ShareASale", "Awin"]
  },
  {
    id: "flexoffers",
    publisher: "FlexOffers",
    group: "FlexOffers",
    groupKey: "flexoffers",
    category: "affiliate_network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    role: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: ["flexoffers.com"],
    amazonTags: [],
    aliases: ["flexoffers", "faid", "fobs"],
    networks: ["FlexOffers"]
  },
  {
    id: "avantlink",
    publisher: "AvantLink",
    group: "AvantLink",
    groupKey: "avantlink",
    category: "affiliate_network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    role: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: ["avantlink.com"],
    amazonTags: [],
    aliases: ["avantlink", "avant link"],
    networks: ["AvantLink"]
  }
];

// =========================
// Helpers
// =========================

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function normalizeCompact(value) {
  return normalize(value).replace(/[\s._\-+%]+/g, "");
}

function safeDecode(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch (e) {
    return String(value || "");
  }
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

function getAllUrlText(rawUrl = "", params = {}) {
  const paramText = Object.entries(params || {})
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return normalize(safeDecode(`${rawUrl} ${paramText}`));
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
    publisherId: publisher.id,
    incrementalityRisk: publisher.incrementalityRisk || "Unknown",
    attributionRisk: publisher.attributionRisk || "Unknown"
  };
}

// =========================
// Detection
// =========================

function detectPublisherByUrl(rawUrl = "") {
  const host = getHostname(rawUrl);
  const full = normalize(safeDecode(rawUrl));

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
      const a = normalize(alias);
      const compactAlias = normalizeCompact(alias);
      return full.includes(a) || normalizeCompact(full).includes(compactAlias);
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

  const tag = normalize(params.tag || getParamFromUrl(rawUrl, "tag"));

  const ascsubtag = normalize(
    safeDecode(params.ascsubtag || getParamFromUrl(rawUrl, "ascsubtag"))
  );

  const linkId = normalize(
    params.linkId ||
      params.linkid ||
      getParamFromUrl(rawUrl, "linkId") ||
      getParamFromUrl(rawUrl, "linkid")
  );

  for (const p of PUBLISHERS) {
    const tagHit = (p.amazonTags || []).some(t => normalize(t) === tag);

    if (tag && tagHit) {
      return buildResult(p, "amazon_tag", 96, `Matched Amazon tag: ${tag}`);
    }

    const aliasInSubtag = (p.aliases || []).some(alias => {
      const a = normalizeCompact(alias);
      return a && normalizeCompact(ascsubtag).includes(a);
    });

    if (ascsubtag && aliasInSubtag) {
      return buildResult(p, "amazon_ascsubtag_alias", 78, "Matched alias inside Amazon ascsubtag.");
    }

    const linkSignal = linkId && (p.aliases || []).some(alias => {
      const a = normalizeCompact(alias);
      return a && normalizeCompact(linkId).includes(a);
    });

    if (linkSignal) {
      return buildResult(p, "amazon_linkid_alias", 70, "Matched alias inside Amazon linkId.");
    }
  }

  return null;
}

function detectPublisherByNetworkSignals(input = {}) {
  const rawUrl = input.url || input.inputUrl || "";
  const params = input.params || {};
  const text = getAllUrlText(rawUrl, params);

  const networkRules = [
    { keys: ["irclickid", "irgwc", "cidimp"], id: "impact" },
    { keys: ["cjevent", "cjdata", "anrdoezrs.net", "jdoqocy.com"], id: "cj" },
    { keys: ["ranmid", "ransiteid", "raneaid", "linksynergy"], id: "rakuten_advertising" },
    { keys: ["clickref", "partnerize", "prf.hn"], id: "partnerize" },
    { keys: ["awc", "awstrack", "awin"], id: "awin" },
    { keys: ["shareasale", "afftrack"], id: "shareasale" },
    { keys: ["faid", "fobs", "flexoffers"], id: "flexoffers" },
    { keys: ["avantlink"], id: "avantlink" },
    { keys: ["skimlinks", "skimresources", "xcust"], id: "skimlinks" },
    { keys: ["viglink", "sovrn", "shop-links.co"], id: "sovrn" }
  ];

  for (const rule of networkRules) {
    if (rule.keys.some(k => text.includes(normalize(k)))) {
      const p = PUBLISHERS.find(item => item.id === rule.id);
      if (p) {
        return buildResult(p, "network_signal", 74, `Matched affiliate network signal: ${rule.id}`);
      }
    }
  }

  return null;
}

function detectPublisherByAliasAnywhere(input = {}) {
  const rawUrl = input.url || input.inputUrl || "";
  const params = input.params || {};
  const text = getAllUrlText(rawUrl, params);
  const compactText = normalizeCompact(text);

  for (const p of PUBLISHERS) {
    const aliasHit = (p.aliases || []).some(alias => {
      const a = normalize(alias);
      const ca = normalizeCompact(alias);
      return (a && text.includes(a)) || (ca && compactText.includes(ca));
    });

    if (aliasHit) {
      return buildResult(p, "alias_anywhere", 80, "Matched publisher alias in URL or tracking parameters.");
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

  const aliasResult = detectPublisherByAliasAnywhere(input);
  if (aliasResult) return aliasResult;

  const networkResult = detectPublisherByNetworkSignals(input);
  if (networkResult) return networkResult;

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
    networks: [],
    incrementalityRisk: "Unknown",
    attributionRisk: "Unknown",
    notes: "No publisher detected."
  };
}

function getPublisherStats() {
  return {
    totalPublishers: PUBLISHERS.length,
    categories: [...new Set(PUBLISHERS.map(p => p.category))],
    groups: [...new Set(PUBLISHERS.map(p => p.group))],
    networks: [...new Set(PUBLISHERS.flatMap(p => p.networks || []))]
  };
}

module.exports = {
  PUBLISHERS,
  detectPublisherByUrl,
  detectPublisherByAmazonParams,
  detectPublisherUniversal,
  getPublisherStats
};
