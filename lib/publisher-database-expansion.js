// lib/publisher-database-expansion.js
// BrandShuo Attribution Checker
// Phase 2: Global Publisher Database Expansion — add to PUBLISHERS array in publisher-database.js
//
// Categories covered:
//   1. Global Editorial/Review Media (测评站/编辑媒体)
//   2. Deal/Coupon Sites (折扣站)
//   3. Cashback/Rewards (返现站)
//   4. Browser Extensions (浏览器插件)
//   5. Creator/Influencer Platforms (创作者平台)
//   6. Smart Router/Link Tools (智能链接)
//   7. International — UK
//   8. International — EU (DE/FR/ES/IT)
//   9. International — APAC (JP/AU/CN)
//  10. DTC/Niche Vertical Publishers

module.exports = [
  // ============================
  // 1. GLOBAL EDITORIAL/REVIEW MEDIA (测评站/编辑媒体)
  // ============================

  // --- Major US Editorial Commerce ---
  {
    id: "nerdwallet", publisher: "NerdWallet", name: "NerdWallet", group: "NerdWallet", groupKey: "nerdwallet",
    category: "finance_review", publisherType: "Finance Editorial / Review", trafficType: "Financial Product Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 86, incrementalityRisk: "Low to Medium", attributionRisk: "Financial editorial attribution",
    domains: ["nerdwallet.com"], amazonTags: [], aliases: ["nerdwallet", "nerd wallet"],
    networks: ["Impact", "CJ Affiliate", "Awin", "Partnerize"]
  },
  {
    id: "bankrate", publisher: "Bankrate", name: "Bankrate", group: "Red Ventures", groupKey: "red_ventures",
    category: "finance_review", publisherType: "Finance Editorial / Review", trafficType: "Financial Product Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 84, incrementalityRisk: "Low to Medium", attributionRisk: "Financial editorial attribution",
    domains: ["bankrate.com"], amazonTags: [], aliases: ["bankrate", "bank rate"],
    networks: ["Impact", "CJ Affiliate", "Awin"]
  },
  {
    id: "the_points_guy", publisher: "The Points Guy", name: "The Points Guy", group: "Red Ventures", groupKey: "red_ventures",
    category: "finance_review", publisherType: "Travel / Credit Card Editorial", trafficType: "Travel Rewards / Credit Card Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 84, incrementalityRisk: "Low to Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["thepointsguy.com"], amazonTags: [], aliases: ["the points guy", "points guy", "tpg"],
    networks: ["Impact", "CJ Affiliate", "Awin"]
  },
  {
    id: "credit_karma", publisher: "Credit Karma", name: "Credit Karma", group: "Intuit", groupKey: "intuit",
    category: "finance_review", publisherType: "Finance / Credit Platform", trafficType: "Credit Product Recommendation",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Credit Match", funnelRole: "Bottom Funnel / Credit Match",
    quality: 82, incrementalityRisk: "Medium", attributionRisk: "Credit platform attribution",
    domains: ["creditkarma.com"], amazonTags: [], aliases: ["credit karma", "creditkarma"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "investopedia", publisher: "Investopedia", name: "Investopedia", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "finance_review", publisherType: "Finance Education / Review", trafficType: "Financial Education / Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Education", funnelRole: "Upper-Mid Funnel / Education",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "Financial education attribution",
    domains: ["investopedia.com"], amazonTags: [], aliases: ["investopedia"],
    networks: ["Impact", "CJ Affiliate", "Skimlinks"]
  },
  {
    id: "us_news", publisher: "U.S. News & World Report", name: "U.S. News & World Report", group: "U.S. News", groupKey: "us_news",
    category: "seo_review_media", publisherType: "Review / Ranking Media", trafficType: "Product Ranking / Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "Ranking/review attribution",
    domains: ["usnews.com"], amazonTags: [], aliases: ["us news", "usnews", "u.s. news"],
    networks: ["Impact", "CJ Affiliate", "Awin"]
  },

  // --- Tech/Gadget Review ---
  {
    id: "arstechnica", publisher: "Ars Technica", name: "Ars Technica", group: "Condé Nast", groupKey: "conde_nast",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / SEO",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["arstechnica.com"], amazonTags: [], aliases: ["ars technica", "arstechnica"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "mashable", publisher: "Mashable", name: "Mashable", group: "Ziff Davis", groupKey: "ziff_davis",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Lifestyle / Tech Editorial Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 78, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["mashable.com"], amazonTags: [], aliases: ["mashable"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "lifehacker", publisher: "Lifehacker", name: "Lifehacker", group: "Ziff Davis", groupKey: "ziff_davis",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Lifestyle / Tech How-to Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 78, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["lifehacker.com"], amazonTags: [], aliases: ["lifehacker"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "gizmodo", publisher: "Gizmodo", name: "Gizmodo", group: "G/O Media", groupKey: "go_media",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / Editorial",
    intent: "Medium to High Research Intent", intentLevel: "Medium to High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 78, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["gizmodo.com"], amazonTags: [], aliases: ["gizmodo"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "bgr", publisher: "BGR", name: "BGR", group: "BGR Media", groupKey: "bgr",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / SEO",
    intent: "Medium to High Research Intent", intentLevel: "Medium to High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 76, incrementalityRisk: "Medium", attributionRisk: "SEO editorial attribution",
    domains: ["bgr.com"], amazonTags: [], aliases: ["bgr", "boy genius report"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "imore", publisher: "iMore", name: "iMore", group: "Future plc", groupKey: "future",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Apple Review / SEO",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["imore.com"], amazonTags: [], aliases: ["imore"],
    networks: ["Amazon Associates", "CJ Affiliate", "Impact"]
  },
  {
    id: "9to5mac", publisher: "9to5Mac", name: "9to5Mac", group: "9to5", groupKey: "9to5",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Apple Review / SEO",
    intent: "Medium to High Research Intent", intentLevel: "Medium to High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 78, incrementalityRisk: "Medium", attributionRisk: "SEO review attribution",
    domains: ["9to5mac.com"], amazonTags: [], aliases: ["9to5mac", "9 to 5 mac"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "macrumors", publisher: "MacRumors", name: "MacRumors", group: "MacRumors", groupKey: "macrumors",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Apple News / Review",
    intent: "Medium to High Research Intent", intentLevel: "Medium to High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 78, incrementalityRisk: "Medium", attributionRisk: "SEO review attribution",
    domains: ["macrumors.com"], amazonTags: [], aliases: ["macrumors", "mac rumors"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "xda", publisher: "XDA Developers", name: "XDA Developers", group: "Valnet", groupKey: "valnet",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Android / Mobile Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["xda-developers.com"], amazonTags: [], aliases: ["xda", "xda developers"],
    networks: ["Amazon Associates", "CJ Affiliate", "Impact"]
  },
  {
    id: "techspot", publisher: "TechSpot", name: "TechSpot", group: "TechSpot", groupKey: "techspot",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / SEO",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["techspot.com"], amazonTags: [], aliases: ["techspot", "tech spot"],
    networks: ["Amazon Associates", "CJ Affiliate"]
  },
  {
    id: "anandtech", publisher: "AnandTech", name: "AnandTech", group: "Future plc", groupKey: "future",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Deep Tech Review",
    intent: "Very High Research Intent", intentLevel: "Very High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 86, incrementalityRisk: "Low", attributionRisk: "Deep review attribution",
    domains: ["anandtech.com"], amazonTags: [], aliases: ["anandtech", "anand tech"],
    networks: ["Amazon Associates", "CJ Affiliate"]
  },

  // --- Auto / Motor ---
  {
    id: "car_and_driver", publisher: "Car and Driver", name: "Car and Driver", group: "Hearst", groupKey: "hearst",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Auto Review / SEO",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "Auto review attribution",
    domains: ["caranddriver.com"], amazonTags: [], aliases: ["car and driver", "caranddriver"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "motortrend", publisher: "MotorTrend", name: "MotorTrend", group: "MotorTrend Group", groupKey: "motortrend",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Auto Review / SEO",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "Auto review attribution",
    domains: ["motortrend.com"], amazonTags: [], aliases: ["motortrend", "motor trend"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "autoblog", publisher: "Autoblog", name: "Autoblog", group: "Yahoo", groupKey: "yahoo",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Auto Review / SEO",
    intent: "Medium to High Research Intent", intentLevel: "Medium to High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 76, incrementalityRisk: "Medium", attributionRisk: "Auto editorial attribution",
    domains: ["autoblog.com"], amazonTags: [], aliases: ["autoblog", "auto blog"],
    networks: ["Amazon Associates", "Skimlinks"]
  },

  // --- Outdoor / Gear ---
  {
    id: "outdoor_gear_lab", publisher: "Outdoor Gear Lab", name: "Outdoor Gear Lab", group: "OutdoorGearLab", groupKey: "outdoorgearlab",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Outdoor Gear Review",
    intent: "Very High Research Intent", intentLevel: "Very High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 86, incrementalityRisk: "Low", attributionRisk: "Gear review attribution",
    domains: ["outdoorgearlab.com"], amazonTags: [], aliases: ["outdoor gear lab", "outdoorgearlab"],
    networks: ["Amazon Associates", "Impact", "CJ Affiliate"]
  },
  {
    id: "switchback_travel", publisher: "Switchback Travel", name: "Switchback Travel", group: "Switchback Travel", groupKey: "switchback_travel",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Outdoor Gear Review",
    intent: "Very High Research Intent", intentLevel: "Very High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 84, incrementalityRisk: "Low", attributionRisk: "Gear review attribution",
    domains: ["switchbacktravel.com"], amazonTags: [], aliases: ["switchback travel", "switchbacktravel"],
    networks: ["Amazon Associates", "Impact"]
  },
  {
    id: "gearjunkie", publisher: "GearJunkie", name: "GearJunkie", group: "AllGear Digital", groupKey: "allgear",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Outdoor Gear Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "Gear review attribution",
    domains: ["gearjunkie.com"], amazonTags: [], aliases: ["gearjunkie", "gear junkie"],
    networks: ["Amazon Associates", "Impact"]
  },
  {
    id: "cleverhiker", publisher: "CleverHiker", name: "CleverHiker", group: "CleverHiker", groupKey: "cleverhiker",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Camping / Backpacking Review",
    intent: "Very High Research Intent", intentLevel: "Very High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 84, incrementalityRisk: "Low", attributionRisk: "Gear review attribution",
    domains: ["cleverhiker.com"], amazonTags: [], aliases: ["cleverhiker", "clever hiker"],
    networks: ["Amazon Associates", "Impact"]
  },
  {
    id: "pack_hacker", publisher: "Pack Hacker", name: "Pack Hacker", group: "Pack Hacker", groupKey: "pack_hacker",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Travel Gear Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "Gear review attribution",
    domains: ["packhacker.com"], amazonTags: [], aliases: ["pack hacker", "packhacker"],
    networks: ["Amazon Associates", "Impact"]
  },

  // --- Food / Kitchen ---
  {
    id: "serious_eats", publisher: "Serious Eats", name: "Serious Eats", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Food / Kitchen Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 84, incrementalityRisk: "Low to Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["seriouseats.com"], amazonTags: [], aliases: ["serious eats", "seriouseats"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "the_kitchn", publisher: "The Kitchn", name: "The Kitchn", group: "Apartment Therapy Media", groupKey: "apartment_therapy",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Kitchen / Food Commerce",
    intent: "Medium to High Research Intent", intentLevel: "Medium to High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["thekitchn.com"], amazonTags: [], aliases: ["the kitchn", "kitchn"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },

  // --- Home / DIY ---
  {
    id: "bob_vila", publisher: "Bob Vila", name: "Bob Vila", group: "BobVila.com", groupKey: "bob_vila",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home Improvement / DIY",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "Home editorial attribution",
    domains: ["bobvila.com"], amazonTags: [], aliases: ["bob vila", "bobvila"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "this_old_house", publisher: "This Old House", name: "This Old House", group: "This Old House", groupKey: "this_old_house",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home Improvement / How-to",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "Home editorial attribution",
    domains: ["thisoldhouse.com"], amazonTags: [], aliases: ["this old house", "thisoldhouse"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "family_handyman", publisher: "Family Handyman", name: "Family Handyman", group: "Trusted Media Brands", groupKey: "trusted_media",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home Improvement / DIY",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "Home editorial attribution",
    domains: ["familyhandyman.com"], amazonTags: [], aliases: ["family handyman", "familyhandyman"],
    networks: ["Amazon Associates", "Skimlinks"]
  },

  // ============================
  // 2. DEAL / COUPON SITES (折扣站)
  // ============================
  {
    id: "groupon", publisher: "Groupon", name: "Groupon", group: "Groupon", groupKey: "groupon",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Local Deal / Coupon",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 68, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["groupon.com"], amazonTags: [], aliases: ["groupon"],
    networks: ["Impact", "CJ Affiliate", "Rakuten"]
  },
  {
    id: "offers_com", publisher: "Offers.com", name: "Offers.com", group: "Ziff Davis", groupKey: "ziff_davis",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal / Coupon Aggregator",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 66, incrementalityRisk: "High", attributionRisk: "Deal aggregation attribution",
    domains: ["offers.com"], amazonTags: [], aliases: ["offers.com", "offers"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "coupons_com", publisher: "Coupons.com", name: "Coupons.com", group: "Coupons.com", groupKey: "coupons_com",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Coupon / Promo Code",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Coupon Discovery", funnelRole: "Bottom Funnel / Coupon Discovery",
    quality: 64, incrementalityRisk: "High", attributionRisk: "Coupon last-click risk",
    domains: ["coupons.com"], amazonTags: [], aliases: ["coupons.com", "coupons"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "befrugal", publisher: "BeFrugal", name: "BeFrugal", group: "BeFrugal", groupKey: "befrugal",
    category: "cashback_rewards", publisherType: "Cashback / Coupon", trafficType: "Cashback / Coupon",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Cashback + Coupon", funnelRole: "Bottom Funnel / Cashback + Coupon",
    quality: 64, incrementalityRisk: "High", attributionRisk: "Cashback/coupon last-click risk",
    domains: ["befrugal.com"], amazonTags: [], aliases: ["befrugal", "be frugal"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "giving_assistant", publisher: "Giving Assistant", name: "Giving Assistant", group: "Giving Assistant", groupKey: "giving_assistant",
    category: "cashback_rewards", publisherType: "Cashback / Donation", trafficType: "Cashback / Charity",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Cashback", funnelRole: "Bottom Funnel / Cashback",
    quality: 62, incrementalityRisk: "High", attributionRisk: "Cashback last-click risk",
    domains: ["givingassistant.org"], amazonTags: [], aliases: ["giving assistant", "givingassistant"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },
  {
    id: "mr_rebates", publisher: "Mr. Rebates", name: "Mr. Rebates", group: "Mr. Rebates", groupKey: "mr_rebates",
    category: "cashback_rewards", publisherType: "Cashback", trafficType: "Cashback",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Cashback", funnelRole: "Bottom Funnel / Cashback",
    quality: 60, incrementalityRisk: "High", attributionRisk: "Cashback last-click risk",
    domains: ["mrrebates.com"], amazonTags: [], aliases: ["mr rebates", "mrrebates", "mr. rebates"],
    networks: ["CJ Affiliate", "Impact"]
  },
  {
    id: "dealsplus", publisher: "DealsPlus", name: "DealsPlus", group: "DealsPlus", groupKey: "dealsplus",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 66, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["dealsplus.com"], amazonTags: [], aliases: ["dealsplus", "deals plus"],
    networks: ["CJ Affiliate", "Impact"]
  },
  {
    id: "dealcat", publisher: "Dealcat", name: "Dealcat", group: "Dealcat", groupKey: "dealcat",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Aggregator",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 64, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["dealcat.com"], amazonTags: [], aliases: ["dealcat", "deal cat"],
    networks: ["CJ Affiliate", "Impact"]
  },
  {
    id: "dealspotr", publisher: "Dealspotr", name: "Dealspotr", group: "Dealspotr", groupKey: "dealspotr",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal / Coupon Community",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 64, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["dealspotr.com"], amazonTags: [], aliases: ["dealspotr", "deal spotr"],
    networks: ["CJ Affiliate", "Impact"]
  },
  {
    id: "couponbirds", publisher: "CouponBirds", name: "CouponBirds", group: "CouponBirds", groupKey: "couponbirds",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Coupon Aggregator / Extension",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Coupon", funnelRole: "Bottom Funnel / Coupon",
    quality: 58, incrementalityRisk: "High", attributionRisk: "Coupon last-click risk",
    domains: ["couponbirds.com"], amazonTags: [], aliases: ["couponbirds", "coupon birds"],
    networks: ["CJ Affiliate", "Impact", "Rakuten"]
  },

  // ============================
  // 3. CASHBACK / REWARDS (返现站)
  // ============================
  {
    id: "ibotta", publisher: "Ibotta", name: "Ibotta", group: "Ibotta", groupKey: "ibotta",
    category: "cashback_rewards", publisherType: "Mobile Cashback", trafficType: "Mobile Cashback / Receipt",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Mobile Cashback", funnelRole: "Bottom Funnel / Mobile Cashback",
    quality: 68, incrementalityRisk: "Medium to High", attributionRisk: "Mobile cashback attribution",
    domains: ["ibotta.com"], amazonTags: [], aliases: ["ibotta"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "fetch_rewards", publisher: "Fetch Rewards", name: "Fetch Rewards", group: "Fetch Rewards", groupKey: "fetch",
    category: "cashback_rewards", publisherType: "Mobile Rewards", trafficType: "Receipt Scanning / Rewards",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Rewards", funnelRole: "Bottom Funnel / Rewards",
    quality: 62, incrementalityRisk: "Medium to High", attributionRisk: "Receipt rewards attribution",
    domains: ["fetch.com"], amazonTags: [], aliases: ["fetch rewards", "fetch"],
    networks: ["Impact"]
  },
  {
    id: "swagbucks", publisher: "Swagbucks", name: "Swagbucks", group: "Prodege", groupKey: "prodege",
    category: "cashback_rewards", publisherType: "Rewards / Cashback", trafficType: "Rewards / Survey / Cashback",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Rewards", funnelRole: "Bottom Funnel / Rewards",
    quality: 58, incrementalityRisk: "High", attributionRisk: "Rewards-driven attribution",
    domains: ["swagbucks.com"], amazonTags: [], aliases: ["swagbucks", "swag bucks"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "mypoints", publisher: "MyPoints", name: "MyPoints", group: "Prodege", groupKey: "prodege",
    category: "cashback_rewards", publisherType: "Rewards / Cashback", trafficType: "Rewards / Cashback",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Rewards", funnelRole: "Bottom Funnel / Rewards",
    quality: 58, incrementalityRisk: "High", attributionRisk: "Rewards-driven attribution",
    domains: ["mypoints.com"], amazonTags: [], aliases: ["mypoints", "my points"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "shopkick", publisher: "Shopkick", name: "Shopkick", group: "Trax", groupKey: "trax",
    category: "cashback_rewards", publisherType: "Mobile Rewards", trafficType: "In-Store / Online Rewards",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Rewards", funnelRole: "Bottom Funnel / Rewards",
    quality: 62, incrementalityRisk: "Medium to High", attributionRisk: "Rewards attribution",
    domains: ["shopkick.com"], amazonTags: [], aliases: ["shopkick", "shop kick"],
    networks: ["Impact"]
  },
  {
    id: "dosh", publisher: "Dosh", name: "Dosh", group: "Dosh", groupKey: "dosh",
    category: "cashback_rewards", publisherType: "Card-linked Cashback", trafficType: "Card-linked Cashback",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Card Cashback", funnelRole: "Bottom Funnel / Card Cashback",
    quality: 64, incrementalityRisk: "Medium", attributionRisk: "Card-linked cashback attribution",
    domains: ["dosh.com"], amazonTags: [], aliases: ["dosh"],
    networks: ["Impact"]
  },

  // ============================
  // 4. BROWSER EXTENSIONS (浏览器插件)
  // ============================
  {
    id: "coupert", publisher: "Coupert", name: "Coupert", group: "Coupert", groupKey: "coupert",
    category: "coupon_extension", publisherType: "Coupon Extension", trafficType: "Browser Extension / Coupon",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Coupon Extension", funnelRole: "Bottom Funnel / Coupon Extension",
    quality: 52, incrementalityRisk: "Very High", attributionRisk: "Extension coupon override risk",
    domains: ["coupert.com"], amazonTags: [], aliases: ["coupert"],
    networks: ["CJ Affiliate", "Impact", "Rakuten", "Partnerize"]
  },
  {
    id: "klarna_extension", publisher: "Klarna", name: "Klarna", group: "Klarna", groupKey: "klarna",
    category: "coupon_extension", publisherType: "Shopping Extension", trafficType: "Payment / Coupon Extension",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Payment Extension", funnelRole: "Bottom Funnel / Payment Extension",
    quality: 60, incrementalityRisk: "High", attributionRisk: "Payment extension attribution",
    domains: ["klarna.com"], amazonTags: [], aliases: ["klarna"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "karma_extension", publisher: "Karma", name: "Karma", group: "Karma", groupKey: "karma",
    category: "coupon_extension", publisherType: "Shopping Extension", trafficType: "Price Comparison Extension",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Price Check", funnelRole: "Bottom Funnel / Price Check",
    quality: 54, incrementalityRisk: "Very High", attributionRisk: "Extension last-click override risk",
    domains: ["karmanow.com"], amazonTags: [], aliases: ["karma", "karma now"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "cently", publisher: "Cently", name: "Cently", group: "CouponFollow", groupKey: "couponfollow",
    category: "coupon_extension", publisherType: "Coupon Extension", trafficType: "Browser Extension / Coupon",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Coupon Extension", funnelRole: "Bottom Funnel / Coupon Extension",
    quality: 52, incrementalityRisk: "Very High", attributionRisk: "Extension coupon injection risk",
    domains: ["cently.com"], amazonTags: [], aliases: ["cently"],
    networks: ["CJ Affiliate", "Impact", "Partnerize"]
  },
  {
    id: "pouch_uk", publisher: "Pouch", name: "Pouch", group: "Pouch", groupKey: "pouch",
    category: "coupon_extension", publisherType: "Coupon Extension", trafficType: "Browser Extension / Coupon (UK)",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Coupon Extension", funnelRole: "Bottom Funnel / Coupon Extension",
    quality: 52, incrementalityRisk: "Very High", attributionRisk: "Extension coupon override risk",
    domains: ["joinpouch.com"], amazonTags: [], aliases: ["pouch", "join pouch"],
    networks: ["Awin", "CJ Affiliate"]
  },
  {
    id: "priceblink", publisher: "PriceBlink", name: "PriceBlink", group: "PriceBlink", groupKey: "priceblink",
    category: "coupon_extension", publisherType: "Price Comparison Extension", trafficType: "Price Comparison / Coupon Extension",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Price Comparison", funnelRole: "Bottom Funnel / Price Comparison",
    quality: 50, incrementalityRisk: "Very High", attributionRisk: "Extension price comparison override",
    domains: ["priceblink.com"], amazonTags: [], aliases: ["priceblink", "price blink"],
    networks: ["CJ Affiliate", "Impact"]
  },
  {
    id: "camelcamelcamel", publisher: "CamelCamelCamel", name: "CamelCamelCamel", group: "CamelCamelCamel", groupKey: "camelcamelcamel",
    category: "smart_router", publisherType: "Price Tracker", trafficType: "Amazon Price Tracker",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Price Research", funnelRole: "Mid Funnel / Price Research",
    quality: 70, incrementalityRisk: "Medium", attributionRisk: "Price tracker attribution",
    domains: ["camelcamelcamel.com"], amazonTags: ["camelcamelcamel-20"], aliases: ["camelcamelcamel", "camel camel camel", "the camelizer"],
    networks: ["Amazon Associates"]
  },
  {
    id: "keepa", publisher: "Keepa", name: "Keepa", group: "Keepa", groupKey: "keepa",
    category: "smart_router", publisherType: "Price Tracker", trafficType: "Amazon Price Tracker",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Price Research", funnelRole: "Mid Funnel / Price Research",
    quality: 68, incrementalityRisk: "Medium", attributionRisk: "Price tracker attribution",
    domains: ["keepa.com"], amazonTags: ["keepa-20"], aliases: ["keepa"],
    networks: ["Amazon Associates"]
  },

  // ============================
  // 5. CREATOR / INFLUENCER PLATFORMS (创作者平台)
  // ============================
  {
    id: "amazon_influencer", publisher: "Amazon Influencer Program", name: "Amazon Influencer Program", group: "Amazon", groupKey: "amazon",
    category: "creator_commerce", publisherType: "Creator Commerce", trafficType: "Influencer / Creator Storefront",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Creator Assist", funnelRole: "Mid Funnel / Creator Assist",
    quality: 70, incrementalityRisk: "Medium", attributionRisk: "Creator storefront attribution",
    domains: ["amazon.com/shop"], amazonTags: [], aliases: ["amazon influencer", "amazon storefront", "amazon creator"],
    networks: ["Amazon Associates", "Amazon Creator Connections"]
  },
  {
    id: "shopstyle", publisher: "ShopStyle Collective", name: "ShopStyle Collective", group: "ShopStyle", groupKey: "shopstyle",
    category: "creator_commerce", publisherType: "Creator Commerce", trafficType: "Creator Commerce / Influencer",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Creator Assist", funnelRole: "Mid Funnel / Creator Assist",
    quality: 74, incrementalityRisk: "Medium", attributionRisk: "Creator commerce attribution",
    domains: ["shopstyle.com", "shopstylecollective.com"], amazonTags: [], aliases: ["shopstyle", "shopstyle collective", "shop style"],
    networks: ["Rakuten", "Impact", "CJ Affiliate"]
  },
  {
    id: "mavely", publisher: "Mavely", name: "Mavely", group: "Mavely", groupKey: "mavely",
    category: "creator_commerce", publisherType: "Creator Commerce", trafficType: "Creator / Influencer Platform",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Creator Assist", funnelRole: "Mid Funnel / Creator Assist",
    quality: 72, incrementalityRisk: "Medium", attributionRisk: "Creator platform attribution",
    domains: ["mavely.com", "mavely.link"], amazonTags: [], aliases: ["mavely"],
    networks: ["Impact", "CJ Affiliate", "Rakuten"]
  },
  {
    id: "howl", publisher: "Howl", name: "Howl", group: "Howl", groupKey: "howl",
    category: "creator_commerce", publisherType: "Creator Commerce", trafficType: "Creator / Influencer Platform",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Creator Assist", funnelRole: "Mid Funnel / Creator Assist",
    quality: 70, incrementalityRisk: "Medium", attributionRisk: "Creator platform attribution",
    domains: ["planethowl.com", "howl.link"], amazonTags: [], aliases: ["howl", "planethowl"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "tiktok_shop", publisher: "TikTok Shop", name: "TikTok Shop", group: "ByteDance", groupKey: "bytedance",
    category: "creator_commerce", publisherType: "Social Commerce", trafficType: "Social Commerce / Live Shopping",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Social Commerce", funnelRole: "Mid Funnel / Social Commerce",
    quality: 66, incrementalityRisk: "Medium", attributionRisk: "Social commerce attribution",
    domains: ["tiktok.com"], amazonTags: [], aliases: ["tiktok shop", "tiktokshopping"],
    networks: ["TikTok Shop"]
  },

  // ============================
  // 7. INTERNATIONAL — UK (英国)
  // ============================
  {
    id: "which_uk", publisher: "Which?", name: "Which?", group: "Consumers' Association", groupKey: "which",
    category: "seo_review_media", publisherType: "Review / Testing Media", trafficType: "Consumer Product Testing",
    intent: "Very High Research Intent", intentLevel: "Very High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 90, incrementalityRisk: "Low", attributionRisk: "Consumer testing attribution",
    domains: ["which.co.uk"], amazonTags: [], aliases: ["which?", "which.co.uk"],
    networks: ["Awin", "Impact"],
    region: "UK"
  },
  {
    id: "trusted_reviews_uk", publisher: "Trusted Reviews", name: "Trusted Reviews", group: "Trusted Reviews", groupKey: "trusted_reviews",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / SEO",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["trustedreviews.com"], amazonTags: [], aliases: ["trusted reviews", "trustedreviews"],
    networks: ["Awin", "CJ Affiliate", "Impact"],
    region: "UK"
  },
  {
    id: "expert_reviews_uk", publisher: "Expert Reviews", name: "Expert Reviews", group: "Expert Reviews", groupKey: "expert_reviews",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Product Review / SEO",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["expertreviews.co.uk"], amazonTags: [], aliases: ["expert reviews", "expertreviews"],
    networks: ["Awin", "CJ Affiliate"],
    region: "UK"
  },
  {
    id: "t3_uk", publisher: "T3", name: "T3", group: "Future plc", groupKey: "future",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech / Lifestyle Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["t3.com"], amazonTags: [], aliases: ["t3", "t3 magazine"],
    networks: ["Amazon Associates", "CJ Affiliate", "Awin", "Impact"],
    region: "UK"
  },
  {
    id: "what_hifi_uk", publisher: "What Hi-Fi?", name: "What Hi-Fi?", group: "Future plc", groupKey: "future",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Audio / Hi-Fi Review",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 84, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["whathifi.com"], amazonTags: [], aliases: ["what hi-fi", "whathifi", "what hifi"],
    networks: ["Amazon Associates", "CJ Affiliate", "Awin", "Impact"],
    region: "UK"
  },
  {
    id: "moneysavingexpert_uk", publisher: "MoneySavingExpert", name: "MoneySavingExpert", group: "MoneySupermarket", groupKey: "moneysupermarket",
    category: "finance_review", publisherType: "Finance / Consumer Advice", trafficType: "Personal Finance Advice",
    intent: "Very High Research Intent", intentLevel: "Very High Research Intent", role: "Upper-Mid Funnel / Advice", funnelRole: "Upper-Mid Funnel / Advice",
    quality: 88, incrementalityRisk: "Low", attributionRisk: "Consumer finance attribution",
    domains: ["moneysavingexpert.com"], amazonTags: [], aliases: ["moneysavingexpert", "mse", "money saving expert"],
    networks: ["Awin", "Impact"],
    region: "UK"
  },
  {
    id: "hotukdeals", publisher: "HotUKDeals", name: "HotUKDeals", group: "Pepper.com", groupKey: "pepper",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (UK)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 70, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["hotukdeals.com"], amazonTags: [], aliases: ["hotukdeals", "hot uk deals", "hukd"],
    networks: ["Awin", "CJ Affiliate", "Impact", "Rakuten"],
    region: "UK"
  },
  {
    id: "latestdeals_uk", publisher: "LatestDeals", name: "LatestDeals", group: "LatestDeals", groupKey: "latestdeals",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (UK)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 66, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["latestdeals.co.uk"], amazonTags: [], aliases: ["latestdeals", "latest deals"],
    networks: ["Awin", "CJ Affiliate", "Impact"],
    region: "UK"
  },
  {
    id: "vouchercodes_uk", publisher: "VoucherCodes", name: "VoucherCodes", group: "VoucherCodes", groupKey: "vouchercodes",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Coupon / Promo Code (UK)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Coupon Discovery", funnelRole: "Bottom Funnel / Coupon Discovery",
    quality: 64, incrementalityRisk: "High", attributionRisk: "Coupon last-click risk",
    domains: ["vouchercodes.co.uk"], amazonTags: [], aliases: ["vouchercodes", "voucher codes"],
    networks: ["Awin", "CJ Affiliate", "Rakuten"],
    region: "UK"
  },
  {
    id: "quidco_uk", publisher: "Quidco", name: "Quidco", group: "Quidco", groupKey: "quidco",
    category: "cashback_rewards", publisherType: "Cashback", trafficType: "Cashback (UK)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Cashback", funnelRole: "Bottom Funnel / Cashback",
    quality: 66, incrementalityRisk: "High", attributionRisk: "Cashback last-click risk",
    domains: ["quidco.com"], amazonTags: [], aliases: ["quidco"],
    networks: ["Awin", "CJ Affiliate", "Rakuten"],
    region: "UK"
  },

  // ============================
  // 8. INTERNATIONAL — EU (欧洲)
  // ============================
  // --- Germany ---
  {
    id: "mydealz_de", publisher: "MyDealz", name: "MyDealz", group: "Pepper.com", groupKey: "pepper",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (DE)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 70, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["mydealz.de"], amazonTags: [], aliases: ["mydealz", "my dealz"],
    networks: ["Awin", "CJ Affiliate", "Rakuten", "Impact"],
    region: "DE"
  },
  {
    id: "chip_de", publisher: "CHIP", name: "CHIP", group: "Burda", groupKey: "burda",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / SEO (DE)",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["chip.de"], amazonTags: [], aliases: ["chip", "chip.de"],
    networks: ["Awin", "CJ Affiliate", "Amazon Associates"],
    region: "DE"
  },
  {
    id: "computerbild_de", publisher: "Computer Bild", name: "Computer Bild", group: "Axel Springer", groupKey: "axel_springer",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / SEO (DE)",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 78, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["computerbild.de"], amazonTags: [], aliases: ["computerbild", "computer bild"],
    networks: ["Awin", "CJ Affiliate", "Amazon Associates"],
    region: "DE"
  },
  {
    id: "stiftung_warentest_de", publisher: "Stiftung Warentest", name: "Stiftung Warentest", group: "Stiftung Warentest", groupKey: "stiftung_warentest",
    category: "seo_review_media", publisherType: "Consumer Testing", trafficType: "Consumer Product Testing (DE)",
    intent: "Very High Research Intent", intentLevel: "Very High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 92, incrementalityRisk: "Low", attributionRisk: "Consumer testing attribution",
    domains: ["test.de"], amazonTags: [], aliases: ["stiftung warentest", "test.de"],
    networks: ["Awin"],
    region: "DE"
  },
  {
    id: "idealo_de", publisher: "idealo", name: "idealo", group: "Axel Springer", groupKey: "axel_springer",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (DE)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", funnelRole: "Bottom Funnel / Price Comparison",
    quality: 72, incrementalityRisk: "Medium", attributionRisk: "Price comparison attribution",
    domains: ["idealo.de"], amazonTags: [], aliases: ["idealo"],
    networks: ["Awin", "CJ Affiliate", "Rakuten"],
    region: "DE"
  },
  {
    id: "geizhals_de", publisher: "Geizhals", name: "Geizhals", group: "Geizhals", groupKey: "geizhals",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (DE/AT)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", funnelRole: "Bottom Funnel / Price Comparison",
    quality: 72, incrementalityRisk: "Medium", attributionRisk: "Price comparison attribution",
    domains: ["geizhals.de", "geizhals.at"], amazonTags: [], aliases: ["geizhals", "geizhals.eu"],
    networks: ["Awin", "CJ Affiliate"],
    region: "DE"
  },
  {
    id: "peperoni_de", publisher: "Peperoni", name: "Peperoni", group: "Pepper.com", groupKey: "pepper",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (DE)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 66, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["peperoni.de"], amazonTags: [], aliases: ["peperoni"],
    networks: ["Awin", "CJ Affiliate"],
    region: "DE"
  },

  // --- France ---
  {
    id: "dealabs_fr", publisher: "Dealabs", name: "Dealabs", group: "Pepper.com", groupKey: "pepper",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (FR)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 70, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["dealabs.com"], amazonTags: [], aliases: ["dealabs", "deal labs"],
    networks: ["Awin", "CJ Affiliate", "Rakuten", "Impact"],
    region: "FR"
  },
  {
    id: "quechoisir_fr", publisher: "Que Choisir", name: "Que Choisir", group: "UFC-Que Choisir", groupKey: "que_choisir",
    category: "seo_review_media", publisherType: "Consumer Testing", trafficType: "Consumer Product Testing (FR)",
    intent: "Very High Research Intent", intentLevel: "Very High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 88, incrementalityRisk: "Low", attributionRisk: "Consumer testing attribution",
    domains: ["quechoisir.org"], amazonTags: [], aliases: ["que choisir", "quechoisir", "ufc que choisir"],
    networks: ["Awin"],
    region: "FR"
  },
  {
    id: "lesnumeriques_fr", publisher: "Les Numériques", name: "Les Numériques", group: "Les Numériques", groupKey: "lesnumeriques",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / SEO (FR)",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["lesnumeriques.com"], amazonTags: [], aliases: ["les numeriques", "lesnumeriques"],
    networks: ["Awin", "CJ Affiliate", "Amazon Associates"],
    region: "FR"
  },
  {
    id: "01net_fr", publisher: "01net", name: "01net", group: "01net", groupKey: "01net",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / SEO (FR)",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 78, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["01net.com"], amazonTags: [], aliases: ["01net", "01 net"],
    networks: ["Awin", "CJ Affiliate"],
    region: "FR"
  },

  // --- Spain ---
  {
    id: "chollometro_es", publisher: "Chollometro", name: "Chollometro", group: "Pepper.com", groupKey: "pepper",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (ES)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 68, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["chollometro.com"], amazonTags: [], aliases: ["chollometro"],
    networks: ["Awin", "CJ Affiliate", "Rakuten"],
    region: "ES"
  },

  // --- Italy ---
  {
    id: "pepper_it", publisher: "Pepper.it", name: "Pepper.it", group: "Pepper.com", groupKey: "pepper",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (IT)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 66, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["pepper.it"], amazonTags: [], aliases: ["pepper.it", "pepper it"],
    networks: ["Awin", "CJ Affiliate", "Rakuten"],
    region: "IT"
  },

  // --- Netherlands ---
  {
    id: "pepper_nl", publisher: "Pepper.nl", name: "Pepper.nl", group: "Pepper.com", groupKey: "pepper",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (NL)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 66, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["pepper.nl"], amazonTags: [], aliases: ["pepper.nl", "pepper nl"],
    networks: ["Awin", "CJ Affiliate", "Rakuten"],
    region: "NL"
  },
  {
    id: "tweakers_nl", publisher: "Tweakers", name: "Tweakers", group: "DPG Media", groupKey: "dpg_media",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / Comparison (NL)",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "Tech review attribution",
    domains: ["tweakers.net"], amazonTags: [], aliases: ["tweakers"],
    networks: ["Awin", "CJ Affiliate"],
    region: "NL"
  },

  // ============================
  // 9. INTERNATIONAL — APAC (亚太)
  // ============================
  // --- Japan ---
  {
    id: "kakaku_jp", publisher: "Kakaku.com", name: "Kakaku.com", group: "Kakaku.com", groupKey: "kakaku",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison / Review (JP)",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Price Comparison", funnelRole: "Bottom Funnel / Price Comparison",
    quality: 78, incrementalityRisk: "Medium", attributionRisk: "Price comparison attribution",
    domains: ["kakaku.com"], amazonTags: [], aliases: ["kakaku", "kakaku.com"],
    networks: ["Rakuten", "Awin", "Amazon Associates"],
    region: "JP"
  },
  {
    id: "mybest_jp", publisher: "My Best", name: "My Best", group: "My Best", groupKey: "mybest",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Product Review / Ranking (JP)",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", funnelRole: "Upper-Mid Funnel / Review Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["my-best.com"], amazonTags: [], aliases: ["my best", "mybest"],
    networks: ["Amazon Associates", "Rakuten", "Awin"],
    region: "JP"
  },
  {
    id: "cosme_jp", publisher: "@Cosme", name: "@Cosme", group: "iStyle", groupKey: "istyle",
    category: "content_commerce", publisherType: "Beauty Review / Commerce", trafficType: "Beauty Product Review (JP)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Mid Funnel / Beauty Review", funnelRole: "Mid Funnel / Beauty Review",
    quality: 78, incrementalityRisk: "Medium", attributionRisk: "Beauty review attribution",
    domains: ["cosme.net"], amazonTags: [], aliases: ["@cosme", "cosme", "at cosme"],
    networks: ["Rakuten", "Amazon Associates"],
    region: "JP"
  },

  // --- Australia ---
  {
    id: "ozbargain_au", publisher: "OzBargain", name: "OzBargain", group: "OzBargain", groupKey: "ozbargain",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (AU)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", funnelRole: "Bottom Funnel / Deal Discovery",
    quality: 70, incrementalityRisk: "Medium to High", attributionRisk: "Deal-driven attribution",
    domains: ["ozbargain.com.au"], amazonTags: [], aliases: ["ozbargain", "oz bargain"],
    networks: ["CJ Affiliate", "Impact", "Awin", "Rakuten"],
    region: "AU"
  },
  {
    id: "finder_au", publisher: "Finder", name: "Finder", group: "Finder", groupKey: "finder",
    category: "finance_review", publisherType: "Finance Comparison", trafficType: "Financial Product Comparison (AU)",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Comparison", funnelRole: "Upper-Mid Funnel / Comparison",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "Financial comparison attribution",
    domains: ["finder.com.au", "finder.com"], amazonTags: [], aliases: ["finder", "finder.com.au"],
    networks: ["Impact", "CJ Affiliate", "Awin"],
    region: "AU"
  },

  // --- China (中文) ---
  {
    id: "smzdm_cn", publisher: "什么值得买", name: "什么值得买", group: "值得买科技", groupKey: "smzdm",
    category: "deal_coupon", publisherType: "Deal / Content Commerce", trafficType: "Deal / Product Discovery (CN)",
    intent: "High Purchase Intent", intentLevel: "High Purchase Intent", role: "Mid Funnel / Discovery + Deal", funnelRole: "Mid Funnel / Discovery + Deal",
    quality: 74, incrementalityRisk: "Medium to High", attributionRisk: "Content + deal attribution",
    domains: ["smzdm.com"], amazonTags: [], aliases: ["什么值得买", "smzdm", "色魔张大妈"],
    networks: ["CJ Affiliate", "Impact", "Rakuten", "Amazon Associates"],
    region: "CN"
  },
  {
    id: "xiaohongshu_cn", publisher: "小红书", name: "小红书", group: "小红书", groupKey: "xiaohongshu",
    category: "creator_commerce", publisherType: "Social Commerce", trafficType: "Social Commerce / Lifestyle (CN)",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Social Commerce", funnelRole: "Mid Funnel / Social Commerce",
    quality: 72, incrementalityRisk: "Medium", attributionRisk: "Social commerce attribution",
    domains: ["xiaohongshu.com"], amazonTags: [], aliases: ["小红书", "xiaohongshu", "red", "little red book"],
    networks: ["N/A"],
    region: "CN"
  },

  // ============================
  // 10. DTC / NICHE VERTICAL PUBLISHERS
  // ============================
  {
    id: "lendingtree", publisher: "LendingTree", name: "LendingTree", group: "LendingTree", groupKey: "lendingtree",
    category: "finance_review", publisherType: "Finance Marketplace", trafficType: "Loan / Finance Comparison",
    intent: "Very High Purchase Intent", intentLevel: "Very High Purchase Intent", role: "Bottom Funnel / Finance Match", funnelRole: "Bottom Funnel / Finance Match",
    quality: 80, incrementalityRisk: "Medium", attributionRisk: "Finance marketplace attribution",
    domains: ["lendingtree.com"], amazonTags: [], aliases: ["lendingtree", "lending tree"],
    networks: ["Impact", "CJ Affiliate"]
  },
  {
    id: "wine_enthusiast", publisher: "Wine Enthusiast", name: "Wine Enthusiast", group: "Wine Enthusiast", groupKey: "wine_enthusiast",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Wine / Lifestyle Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 78, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["wineenthusiast.com", "winemag.com"], amazonTags: [], aliases: ["wine enthusiast", "wineenthusiast", "wine enthusiast magazine"],
    networks: ["Amazon Associates", "Impact"]
  },
  {
    id: "simply_recipes", publisher: "Simply Recipes", name: "Simply Recipes", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Food / Kitchen Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 78, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["simplyrecipes.com"], amazonTags: [], aliases: ["simply recipes", "simplyrecipes"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "liquor_com", publisher: "Liquor.com", name: "Liquor.com", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Beverage Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 76, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["liquor.com"], amazonTags: [], aliases: ["liquor", "liquor.com"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },

  // --- More Amazon Tag entries ---
  {
    id: "theverge_tag", publisher: "The Verge", name: "The Verge", group: "Vox Media", groupKey: "vox_media",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Editorial / Commerce",
    intent: "Medium to High Research Intent", intentLevel: "Medium to High Research Intent", role: "Upper-Mid Funnel", funnelRole: "Upper-Mid Funnel",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["theverge.com"], amazonTags: ["theverge02-20"], aliases: ["the verge", "verge"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },

  // Additional publishers with known Amazon tags
  {
    id: "gear_patrol_tag", publisher: "Gear Patrol", name: "Gear Patrol", group: "Gear Patrol", groupKey: "gear_patrol",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Gear Review / Editorial Commerce",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 82, incrementalityRisk: "Low to Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["gearpatrol.com"], amazonTags: ["gearpatrol-20"], aliases: ["gear patrol", "gearpatrol"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn", "Impact"]
  },
  {
    id: "nymag_tag", publisher: "The Strategist", name: "The Strategist", group: "New York Magazine / Vox Media", groupKey: "vox_media",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Editorial Commerce / Buyer Guide",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel", funnelRole: "Upper-Mid Funnel",
    quality: 84, incrementalityRisk: "Low to Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["nymag.com"], amazonTags: ["strategist-20"], aliases: ["the strategist", "strategist", "nymag"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "bestreviews_tag", publisher: "BestReviews", name: "BestReviews", group: "Nexstar / BestReviews", groupKey: "bestreviews",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Product Review / SEO",
    intent: "High Research Intent", intentLevel: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 80, incrementalityRisk: "Low to Medium", attributionRisk: "SEO review attribution",
    domains: ["bestreviews.com"], amazonTags: ["bestreviews-20"], aliases: ["bestreviews", "best reviews"],
    networks: ["Amazon Associates", "CJ Affiliate", "Impact"]
  },
  {
    id: "bgr_tag", publisher: "BGR", name: "BGR", group: "BGR Media", groupKey: "bgr",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review / SEO",
    intent: "Medium to High Research Intent", intentLevel: "Medium to High Research Intent", role: "Upper-Mid Funnel / Content Assist", funnelRole: "Upper-Mid Funnel / Content Assist",
    quality: 76, incrementalityRisk: "Medium", attributionRisk: "SEO editorial attribution",
    domains: ["bgr.com"], amazonTags: ["bgr-20"], aliases: ["bgr", "boy genius report"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "dailydot_tag", publisher: "The Daily Dot", name: "The Daily Dot", group: "Daily Dot", groupKey: "dailydot",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Internet Culture / Commerce",
    intent: "Low to Medium Purchase Intent", intentLevel: "Low to Medium Purchase Intent", role: "Upper-Mid Funnel / Content", funnelRole: "Upper-Mid Funnel / Content",
    quality: 70, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["dailydot.com"], amazonTags: ["dailydot-20"], aliases: ["the daily dot", "daily dot", "dailydot"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "mensjournal_tag", publisher: "Men's Journal", name: "Men's Journal", group: "Men's Journal", groupKey: "mens_journal",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Men's Lifestyle Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 74, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["mensjournal.com"], amazonTags: ["mensjournal-20"], aliases: ["men's journal", "mens journal", "mensjournal"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "rd_tag", publisher: "Reader's Digest", name: "Reader's Digest", group: "Trusted Media Brands", groupKey: "trusted_media",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "General Interest Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 74, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["rd.com", "readersdigest.com"], amazonTags: ["rd-20"], aliases: ["reader's digest", "readers digest", "rd.com"],
    networks: ["Amazon Associates", "Skimlinks"]
  },
  {
    id: "prevention_tag", publisher: "Prevention", name: "Prevention", group: "Hearst", groupKey: "hearst",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Health / Wellness Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 74, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["prevention.com"], amazonTags: ["prevention-20"], aliases: ["prevention", "prevention magazine"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "cosmopolitan_tag", publisher: "Cosmopolitan", name: "Cosmopolitan", group: "Hearst", groupKey: "hearst",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Lifestyle / Beauty Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 74, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["cosmopolitan.com"], amazonTags: ["cosmopolitan-20"], aliases: ["cosmopolitan", "cosmo"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
  {
    id: "townandcountry_tag", publisher: "Town & Country", name: "Town & Country", group: "Hearst", groupKey: "hearst",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Luxury Lifestyle Commerce",
    intent: "Medium Purchase Intent", intentLevel: "Medium Purchase Intent", role: "Mid Funnel / Discovery", funnelRole: "Mid Funnel / Discovery",
    quality: 74, incrementalityRisk: "Medium", attributionRisk: "Editorial commerce attribution",
    domains: ["townandcountrymag.com"], amazonTags: ["townandcountry-20"], aliases: ["town and country", "townandcountry"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"]
  },
];
