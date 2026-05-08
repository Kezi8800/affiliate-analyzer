// lib/publisher-database.js
// BrandShuo Attribution Checker
// Publisher Intelligence Database v2.0 FIX
// Safe full replacement version

const PUBLISHERS = [
  {
    id: "slickdeals",
    publisher: "Slickdeals",
    name: "Slickdeals",
    group: "Slickdeals",
    groupKey: "slickdeals",
    category: "deal_coupon",
    publisherType: "Deal / Coupon",
    trafficType: "Deal Community",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Last-click Heavy",
    funnelRole: "Bottom Funnel / Last-click Heavy",
    quality: 72,
    incrementalityRisk: "High",
    attributionRisk: "Last-click / coupon interception risk",
    domains: ["slickdeals.net"],
    amazonTags: ["slickdeals09-20"],
    aliases: ["slickdeals", "slickdeals llc", "slickdeals deals"],
    networks: ["Amazon Associates", "Amazon Creator Connections", "Impact"]
  },
  {
    id: "buzzfeed",
    publisher: "BuzzFeed",
    name: "BuzzFeed",
    group: "BuzzFeed Inc.",
    groupKey: "buzzfeed",
    category: "content_commerce",
    publisherType: "Content Commerce",
    trafficType: "Editorial Commerce",
    intent: "Medium Purchase Intent",
    intentLevel: "Medium Purchase Intent",
    role: "Mid Funnel / Discovery",
    funnelRole: "Mid Funnel / Discovery",
    quality: 78,
    incrementalityRisk: "Medium",
    attributionRisk: "Content-assisted attribution",
    domains: ["buzzfeed.com"],
    amazonTags: ["buzz0f-20"],
    aliases: ["buzzfeed", "buzzfeed shopping"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "future",
    publisher: "Future Publishing",
    name: "Future Publishing",
    group: "Future plc",
    groupKey: "future",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Editorial Review / SEO",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
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
    amazonTags: ["cx-future-tr-search-20", "tomsguide-us-20", "techradar-20"],
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
    name: "PCMag",
    group: "Ziff Davis",
    groupKey: "ziff_davis",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Editorial Review / SEO",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
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
    name: "CNET",
    group: "CNET / Commerce Media",
    groupKey: "cnet",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Editorial Review / SEO",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
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
    name: "Wirecutter",
    group: "The New York Times",
    groupKey: "nyt_wirecutter",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Editorial Review / Buyer Guide",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 88,
    incrementalityRisk: "Low",
    attributionRisk: "Editorial commerce attribution",
    domains: ["nytimes.com", "thewirecutter.com"],
    amazonTags: ["thewire06-20", "wirecutter-20"],
    aliases: ["wirecutter", "the wirecutter", "new york times wirecutter"],
    networks: ["Amazon Associates", "Skimlinks", "Impact"]
  },
  {
    id: "retailmenot",
    publisher: "RetailMeNot",
    name: "RetailMeNot",
    group: "RetailMeNot",
    groupKey: "retailmenot",
    category: "deal_coupon",
    publisherType: "Deal / Coupon",
    trafficType: "Coupon / Promo Code",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Coupon Interception Risk",
    funnelRole: "Bottom Funnel / Coupon Interception Risk",
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
    name: "Honey",
    group: "PayPal Honey",
    groupKey: "honey",
    category: "coupon_extension",
    publisherType: "Coupon Extension",
    trafficType: "Browser Extension / Coupon",
    intent: "Very High Purchase Intent",
    intentLevel: "Very High Purchase Intent",
    role: "Bottom Funnel / Last-click Risk",
    funnelRole: "Bottom Funnel / Last-click Risk",
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
    name: "SimplyCodes",
    group: "SimplyCodes",
    groupKey: "simplycodes",
    category: "deal_coupon",
    publisherType: "Deal / Coupon",
    trafficType: "Coupon / Promo Code",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Coupon Discovery",
    funnelRole: "Bottom Funnel / Coupon Discovery",
    quality: 66,
    incrementalityRisk: "High",
    attributionRisk: "Coupon-assisted last-click risk",
    domains: ["simplycodes.com"],
    amazonTags: [],
    aliases: ["simplycodes", "simply codes"],
    networks: ["Impact", "CJ Affiliate", "Partnerize"]
  },
  {
    id: "rakuten_rewards",
    publisher: "Rakuten Rewards",
    name: "Rakuten Rewards",
    group: "Rakuten",
    groupKey: "rakuten_rewards",
    category: "cashback_rewards",
    publisherType: "Cashback / Rewards",
    trafficType: "Cashback / Rewards",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Loyalty",
    funnelRole: "Bottom Funnel / Loyalty",
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
    name: "TopCashback",
    group: "TopCashback",
    groupKey: "topcashback",
    category: "cashback_rewards",
    publisherType: "Cashback / Rewards",
    trafficType: "Cashback / Rewards",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Loyalty",
    funnelRole: "Bottom Funnel / Loyalty",
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
    name: "Capital One Shopping",
    group: "Capital One",
    groupKey: "capital_one",
    category: "cashback_rewards",
    publisherType: "Shopping Extension / Rewards",
    trafficType: "Shopping Extension / Rewards",
    intent: "Very High Purchase Intent",
    intentLevel: "Very High Purchase Intent",
    role: "Bottom Funnel / Extension",
    funnelRole: "Bottom Funnel / Extension",
    quality: 58,
    incrementalityRisk: "Very High",
    attributionRisk: "Extension / price comparison last-click risk",
    domains: ["capitaloneshopping.com", "wikibuy.com"],
    amazonTags: [],
    aliases: ["capital one shopping", "wikibuy"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "forbes_vetted",
    publisher: "Forbes Vetted",
    name: "Forbes Vetted",
    group: "Forbes",
    groupKey: "forbes",
    category: "content_commerce",
    publisherType: "Content Commerce",
    trafficType: "Editorial Commerce / Review",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
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
    name: "CNN Underscored",
    group: "CNN",
    groupKey: "cnn",
    category: "content_commerce",
    publisherType: "Content Commerce",
    trafficType: "Editorial Commerce",
    intent: "Medium to High Research Intent",
    intentLevel: "Medium to High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
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
    name: "Reviewed",
    group: "USA Today / Gannett",
    groupKey: "gannett",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Product Review / SEO",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
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
    name: "Digital Trends",
    group: "Digital Trends Media Group",
    groupKey: "digital_trends",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Tech Review / SEO",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel",
    funnelRole: "Upper-Mid Funnel",
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
    name: "The Verge",
    group: "Vox Media",
    groupKey: "vox_media",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Tech Editorial / Commerce",
    intent: "Medium to High Research Intent",
    intentLevel: "Medium to High Research Intent",
    role: "Upper-Mid Funnel",
    funnelRole: "Upper-Mid Funnel",
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
    name: "Engadget",
    group: "Yahoo",
    groupKey: "yahoo",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Tech Editorial / Deals",
    intent: "Medium to High Research Intent",
    intentLevel: "Medium to High Research Intent",
    role: "Upper-Mid Funnel",
    funnelRole: "Upper-Mid Funnel",
    quality: 80,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial/deal attribution",
    domains: ["engadget.com"],
    amazonTags: [],
    aliases: ["engadget"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn", "CJ Affiliate"]
  },
  {
    id: "nymag_strategist",
    publisher: "The Strategist",
    name: "The Strategist",
    group: "New York Magazine / Vox Media",
    groupKey: "vox_media",
    category: "content_commerce",
    publisherType: "Content Commerce",
    trafficType: "Editorial Commerce / Buyer Guide",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel",
    funnelRole: "Upper-Mid Funnel",
    quality: 84,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["nymag.com"],
    amazonTags: [],
    aliases: ["the strategist", "new york magazine strategist", "nymag strategist"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "good_housekeeping",
    publisher: "Good Housekeeping",
    name: "Good Housekeeping",
    group: "Hearst",
    groupKey: "hearst",
    category: "content_commerce",
    publisherType: "Content Commerce",
    trafficType: "Lifestyle Review / Commerce",
    intent: "Medium to High Research Intent",
    intentLevel: "Medium to High Research Intent",
    role: "Upper-Mid Funnel",
    funnelRole: "Upper-Mid Funnel",
    quality: 82,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["goodhousekeeping.com"],
    amazonTags: [],
    aliases: ["good housekeeping"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "the_spruce",
    publisher: "The Spruce",
    name: "The Spruce",
    group: "Dotdash Meredith",
    groupKey: "dotdash_meredith",
    category: "home_lifestyle_media",
    publisherType: "Home / Lifestyle Media",
    trafficType: "Home Review / SEO",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
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
    name: "Better Homes & Gardens",
    group: "Dotdash Meredith",
    groupKey: "dotdash_meredith",
    category: "home_lifestyle_media",
    publisherType: "Home / Lifestyle Media",
    trafficType: "Home / Lifestyle Commerce",
    intent: "Medium to High Research Intent",
    intentLevel: "Medium to High Research Intent",
    role: "Upper-Mid Funnel",
    funnelRole: "Upper-Mid Funnel",
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
    name: "Apartment Therapy",
    group: "Apartment Therapy Media",
    groupKey: "apartment_therapy",
    category: "home_lifestyle_media",
    publisherType: "Home / Lifestyle Media",
    trafficType: "Home / Lifestyle Commerce",
    intent: "Medium Purchase Intent",
    intentLevel: "Medium Purchase Intent",
    role: "Mid Funnel / Discovery",
    funnelRole: "Mid Funnel / Discovery",
    quality: 78,
    incrementalityRisk: "Medium",
    attributionRisk: "Lifestyle commerce attribution",
    domains: ["apartmenttherapy.com"],
    amazonTags: [],
    aliases: ["apartment therapy"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "skimlinks",
    publisher: "Skimlinks",
    name: "Skimlinks",
    group: "Skimlinks",
    groupKey: "skimlinks",
    category: "subnetwork_router",
    publisherType: "Subnetwork / Router",
    trafficType: "Commerce Router / Subnetwork",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Attribution Layer / Router",
    funnelRole: "Attribution Layer / Router",
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
    name: "Sovrn Commerce",
    group: "Sovrn",
    groupKey: "sovrn",
    category: "subnetwork_router",
    publisherType: "Subnetwork / Router",
    trafficType: "Commerce Router / Subnetwork",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Attribution Layer / Router",
    funnelRole: "Attribution Layer / Router",
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
    name: "Geniuslink",
    group: "Geniuslink",
    groupKey: "geniuslink",
    category: "smart_router",
    publisherType: "Smart Link Router",
    trafficType: "Smart Link Router",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Geo / Device / Retailer Routing Layer",
    funnelRole: "Geo / Device / Retailer Routing Layer",
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
    name: "LTK",
    group: "LTK",
    groupKey: "ltk",
    category: "creator_commerce",
    publisherType: "Creator Commerce",
    trafficType: "Creator Commerce / Influencer",
    intent: "Medium Purchase Intent",
    intentLevel: "Medium Purchase Intent",
    role: "Mid Funnel / Creator Assist",
    funnelRole: "Mid Funnel / Creator Assist",
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
    name: "ShopMy",
    group: "ShopMy",
    groupKey: "shopmy",
    category: "creator_commerce",
    publisherType: "Creator Commerce",
    trafficType: "Creator Commerce",
    intent: "Medium Purchase Intent",
    intentLevel: "Medium Purchase Intent",
    role: "Mid Funnel / Creator Assist",
    funnelRole: "Mid Funnel / Creator Assist",
    quality: 76,
    incrementalityRisk: "Medium",
    attributionRisk: "Creator commerce attribution",
    domains: ["shopmy.us", "shopmy.us.com", "shopmy.com"],
    amazonTags: [],
    aliases: ["shopmy", "shop my"],
    networks: ["ShopMy", "Amazon Associates"]
  },
  {
    id: "dealnews",
    publisher: "DealNews",
    name: "DealNews",
    group: "DealNews",
    groupKey: "dealnews",
    category: "deal_coupon",
    publisherType: "Deal / Coupon",
    trafficType: "Deal Editorial",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Deal Discovery",
    funnelRole: "Bottom Funnel / Deal Discovery",
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
    name: "Brad's Deals",
    group: "Brad's Deals",
    groupKey: "bradsdeals",
    category: "deal_coupon",
    publisherType: "Deal / Coupon",
    trafficType: "Deals / Coupon",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Deal Discovery",
    funnelRole: "Bottom Funnel / Deal Discovery",
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
    name: "TechBargains",
    group: "TechBargains",
    groupKey: "techbargains",
    category: "deal_coupon",
    publisherType: "Deal / Coupon",
    trafficType: "Tech Deals",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Tech Deal",
    funnelRole: "Bottom Funnel / Tech Deal",
    quality: 69,
    incrementalityRisk: "Medium to High",
    attributionRisk: "Deal-led attribution",
    domains: ["techbargains.com"],
    amazonTags: [],
    aliases: ["techbargains", "tech bargains"],
    networks: ["CJ Affiliate", "Impact"]
  },
  {
    id: "savings_com",
    publisher: "Savings.com",
    name: "Savings.com",
    group: "Savings.com",
    groupKey: "savings_com",
    category: "deal_coupon",
    publisherType: "Deal / Coupon",
    trafficType: "Coupon / Promo Code",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Coupon Discovery",
    funnelRole: "Bottom Funnel / Coupon Discovery",
    quality: 64,
    incrementalityRisk: "High",
    attributionRisk: "Coupon last-click risk",
    domains: ["savings.com"],
    amazonTags: [],
    aliases: ["savings.com", "savings com"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "couponfollow",
    publisher: "CouponFollow",
    name: "CouponFollow",
    group: "CouponFollow",
    groupKey: "couponfollow",
    category: "deal_coupon",
    publisherType: "Deal / Coupon",
    trafficType: "Coupon / Promo Code",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Coupon Discovery",
    funnelRole: "Bottom Funnel / Coupon Discovery",
    quality: 65,
    incrementalityRisk: "High",
    attributionRisk: "Coupon last-click risk",
    domains: ["couponfollow.com"],
    amazonTags: [],
    aliases: ["couponfollow", "coupon follow"],
    networks: ["CJ Affiliate", "Impact", "Partnerize"]
  },
  {
    id: "couponcabin",
    publisher: "CouponCabin",
    name: "CouponCabin",
    group: "CouponCabin",
    groupKey: "couponcabin",
    category: "deal_coupon",
    publisherType: "Deal / Coupon",
    trafficType: "Coupon / Cashback",
    intent: "High Purchase Intent",
    intentLevel: "High Purchase Intent",
    role: "Bottom Funnel / Coupon Cashback",
    funnelRole: "Bottom Funnel / Coupon Cashback",
    quality: 63,
    incrementalityRisk: "High",
    attributionRisk: "Coupon/cashback attribution risk",
    domains: ["couponcabin.com"],
    amazonTags: [],
    aliases: ["couponcabin", "coupon cabin"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "wired",
    publisher: "WIRED",
    name: "WIRED",
    group: "Condé Nast",
    groupKey: "conde_nast",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Tech Editorial / Reviews",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 84,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["wired.com"],
    amazonTags: [],
    aliases: ["wired", "wired gear"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "gear_patrol",
    publisher: "Gear Patrol",
    name: "Gear Patrol",
    group: "Gear Patrol",
    groupKey: "gear_patrol",
    category: "content_commerce",
    publisherType: "Content Commerce",
    trafficType: "Gear Review / Editorial Commerce",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 82,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution",
    domains: ["gearpatrol.com"],
    amazonTags: [],
    aliases: ["gear patrol", "gearpatrol"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn", "Impact"]
  },
  {
    id: "zdnet",
    publisher: "ZDNET",
    name: "ZDNET",
    group: "Ziff Davis",
    groupKey: "zdnet",
    category: "seo_review_media",
    publisherType: "Review / SEO Media",
    trafficType: "Tech Review / SEO",
    intent: "High Research Intent",
    intentLevel: "High Research Intent",
    role: "Upper-Mid Funnel / Content Assist",
    funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 82,
    incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO review attribution",
    domains: ["zdnet.com"],
    amazonTags: [],
    aliases: ["zdnet", "zd net"],
    networks: ["Amazon Associates", "CJ Affiliate", "Partnerize", "Impact"]
  },
  {
    id: "impact",
    publisher: "Impact",
    name: "Impact",
    group: "Impact",
    groupKey: "impact",
    category: "affiliate_network",
    publisherType: "Affiliate Network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Tracking / Attribution Network",
    funnelRole: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: ["impact.com", "impactradius.com"],
    amazonTags: [],
    aliases: ["impact", "impact radius", "impact.com", "irclickid", "irgwc", "cidimp"],
    networks: ["Impact"]
  },
  {
    id: "cj",
    publisher: "CJ Affiliate",
    name: "CJ Affiliate",
    group: "CJ Affiliate",
    groupKey: "cj",
    category: "affiliate_network",
    publisherType: "Affiliate Network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Tracking / Attribution Network",
    funnelRole: "Tracking / Attribution Network",
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
    aliases: ["cj", "commission junction", "cjevent", "cjdata"],
    networks: ["CJ Affiliate"]
  },
  {
    id: "rakuten_advertising",
    publisher: "Rakuten Advertising",
    name: "Rakuten Advertising",
    group: "Rakuten Advertising",
    groupKey: "rakuten_advertising",
    category: "affiliate_network",
    publisherType: "Affiliate Network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Tracking / Attribution Network",
    funnelRole: "Tracking / Attribution Network",
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
    name: "Partnerize",
    group: "Partnerize",
    groupKey: "partnerize",
    category: "affiliate_network",
    publisherType: "Affiliate Network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Tracking / Attribution Network",
    funnelRole: "Tracking / Attribution Network",
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
    name: "Awin",
    group: "Awin",
    groupKey: "awin",
    category: "affiliate_network",
    publisherType: "Affiliate Network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Tracking / Attribution Network",
    funnelRole: "Tracking / Attribution Network",
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
    name: "ShareASale",
    group: "Awin",
    groupKey: "awin",
    category: "affiliate_network",
    publisherType: "Affiliate Network",
    trafficType: "Affiliate Network Layer",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Tracking / Attribution Network",
    funnelRole: "Tracking / Attribution Network",
    quality: 65,
    incrementalityRisk: "Unknown",
    attributionRisk: "Network layer only; publisher needs verification",
    domains: ["shareasale.com"],
    amazonTags: [],
    aliases: ["shareasale", "share a sale", "afftrack"],
    networks: ["ShareASale", "Awin"]
  }
];

function normalize(value) {
  return String(value || "").toLowerCase().trim();
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
    publisher: publisher.publisher || publisher.name,
    name: publisher.name || publisher.publisher,
    group: publisher.group,
    groupKey: publisher.groupKey,
    category: publisher.category,
    publisherType: publisher.publisherType || publisher.category,
    trafficType: publisher.trafficType,
    intent: publisher.intent || publisher.intentLevel,
    intentLevel: publisher.intentLevel || publisher.intent,
    role: publisher.role || publisher.funnelRole,
    funnelRole: publisher.funnelRole || publisher.role,
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

function detectPublisherByUrl(rawUrl = "") {
  const host = getHostname(rawUrl);
  const full = normalize(safeDecode(rawUrl));
  const fullCompact = normalizeCompact(full);

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
      const ca = normalizeCompact(alias);
      return (a && full.includes(a)) || (ca && fullCompact.includes(ca));
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

  const ascCompact = normalizeCompact(ascsubtag);
  const linkCompact = normalizeCompact(linkId);

  for (const p of PUBLISHERS) {
    const tagHit = (p.amazonTags || []).some(t => normalize(t) === tag);

    if (tag && tagHit) {
      return buildResult(p, "amazon_tag", 96, `Matched Amazon tag: ${tag}`);
    }

    const aliasInSubtag = (p.aliases || []).some(alias => {
      const a = normalizeCompact(alias);
      return a && ascCompact.includes(a);
    });

    if (ascsubtag && aliasInSubtag) {
      return buildResult(p, "amazon_ascsubtag_alias", 78, "Matched alias inside Amazon ascsubtag.");
    }

    const linkSignal = linkId && (p.aliases || []).some(alias => {
      const a = normalizeCompact(alias);
      return a && linkCompact.includes(a);
    });

    if (linkSignal) {
      return buildResult(p, "amazon_linkid_alias", 70, "Matched alias inside Amazon linkId.");
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
    name: "Unknown Publisher",
    group: "Unknown / Needs Verification",
    groupKey: "unknown_group",
    category: "unknown",
    publisherType: "Unknown",
    trafficType: "Unknown",
    intent: "Unknown",
    intentLevel: "Unknown",
    role: "Unknown",
    funnelRole: "Unknown",
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

function getPublisherDatabase() {
  return PUBLISHERS;
}

function getPublisherById(id = "") {
  return PUBLISHERS.find(p => normalize(p.id) === normalize(id)) || null;
}

function searchPublishers(keyword = "") {
  const q = normalize(keyword);
  if (!q) return [];

  return PUBLISHERS.filter(p => {
    return (
      normalize(p.publisher).includes(q) ||
      normalize(p.name).includes(q) ||
      normalize(p.group).includes(q) ||
      (p.aliases || []).some(a => normalize(a).includes(q)) ||
      (p.domains || []).some(d => normalize(d).includes(q)) ||
      (p.amazonTags || []).some(t => normalize(t).includes(q))
    );
  });
}

function safeDetectPublisher(input = {}) {
  try {
    if (typeof input === "string") {
      return detectPublisherUniversal({ url: input });
    }

    return detectPublisherUniversal(input || {});
  } catch (error) {
    return {
      matched: false,
      matchType: "error",
      publisher: "Unknown Publisher",
      name: "Unknown Publisher",
      group: "Unknown / Needs Verification",
      groupKey: "unknown_group",
      category: "unknown",
      publisherType: "Unknown",
      trafficType: "Unknown",
      intent: "Unknown",
      intentLevel: "Unknown",
      role: "Unknown",
      funnelRole: "Unknown",
      quality: 40,
      confidence: "low",
      score: 0,
      reasons: [],
      networks: [],
      incrementalityRisk: "Unknown",
      attributionRisk: "Unknown",
      error: true,
      message: error.message || "Publisher detection failed."
    };
  }
}

function detectPublisher(input = {}) {
  return safeDetectPublisher(input);
}

module.exports = {
  PUBLISHERS,
  PUBLISHER_DATABASE: PUBLISHERS,
  publisherDatabase: PUBLISHERS,

  getPublisherDatabase,
  getPublisherById,
  searchPublishers,

  detectPublisher,
  safeDetectPublisher,
  detectPublisherByUrl,
  detectPublisherByAmazonParams,
  detectPublisherUniversal,
  getPublisherStats
};
