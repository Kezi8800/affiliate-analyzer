// lib/publisher-database-expansion-v3.js
// BrandShuo — Phase 8: Publisher Expansion v3
// 40+ additional publishers: more Amazon tags, more verticals, Korea, Middle East

module.exports = [

  // ============================
  // KOREA
  // ============================
  {
    id: "danawa_kr", publisher: "Danawa", name: "Danawa", group: "Danawa", groupKey: "danawa",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (Korea)",
    intent: "Very High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 78, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["danawa.com"], amazonTags: [],
    aliases: ["danawa", "da nawa"], networks: ["CJ Affiliate", "Rakuten"], region: "KR"
  },
  {
    id: "enuri_kr", publisher: "Enuri", name: "Enuri", group: "Enuri", groupKey: "enuri",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (Korea)",
    intent: "Very High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["enuri.com"], amazonTags: [],
    aliases: ["enuri"], networks: ["CJ Affiliate"], region: "KR"
  },
  {
    id: "ppomppu_kr", publisher: "Ppomppu", name: "Ppomppu", group: "Ppomppu", groupKey: "ppomppu",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (Korea)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", quality: 68, incrementalityRisk: "Medium to High",
    attributionRisk: "Deal-driven attribution", domains: ["ppomppu.co.kr"], amazonTags: [],
    aliases: ["ppomppu", "뽐뿌"], networks: ["CJ Affiliate", "Rakuten"], region: "KR"
  },

  // ============================
  // MIDDLE EAST
  // ============================
  {
    id: "coupon_ae", publisher: "Cuponation AE", name: "Cuponation UAE", group: "Cuponation", groupKey: "cuponation",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Coupon / Promo Code (UAE)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Coupon Discovery", quality: 58, incrementalityRisk: "High",
    attributionRisk: "Coupon last-click risk", domains: ["cuponation.ae"], amazonTags: [],
    aliases: ["cuponation uae", "cuponation dubai"], networks: ["CJ Affiliate", "Rakuten"], region: "AE"
  },

  // ============================
  // CANADA
  // ============================
  {
    id: "redflagdeals_ca", publisher: "RedFlagDeals", name: "RedFlagDeals", group: "RedFlagDeals", groupKey: "redflagdeals",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (Canada)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", quality: 70, incrementalityRisk: "Medium to High",
    attributionRisk: "Deal-driven attribution", domains: ["redflagdeals.com"], amazonTags: [],
    aliases: ["redflagdeals", "red flag deals", "rfd"], networks: ["CJ Affiliate", "Impact", "Rakuten"], region: "CA"
  },
  {
    id: "rakuten_ca", publisher: "Rakuten Canada", name: "Rakuten Canada", group: "Rakuten", groupKey: "rakuten",
    category: "cashback_rewards", publisherType: "Cashback / Rewards", trafficType: "Cashback (Canada)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Cashback", quality: 66, incrementalityRisk: "High",
    attributionRisk: "Cashback last-click risk", domains: ["rakuten.ca"], amazonTags: [],
    aliases: ["rakuten canada", "ebates canada"], networks: ["Rakuten Advertising"], region: "CA"
  },
  {
    id: "greatcanadianrebates_ca", publisher: "Great Canadian Rebates", name: "Great Canadian Rebates", group: "GCR", groupKey: "gcr",
    category: "cashback_rewards", publisherType: "Cashback", trafficType: "Cashback (Canada)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Cashback", quality: 62, incrementalityRisk: "High",
    attributionRisk: "Cashback last-click risk", domains: ["greatcanadianrebates.ca"], amazonTags: [],
    aliases: ["great canadian rebates", "gcr", "gcr.ca"], networks: ["CJ Affiliate", "Impact"], region: "CA"
  },

  // ============================
  // MORE US NICHE VERTICALS
  // ============================
  // Travel
  {
    id: "lonelyplanet", publisher: "Lonely Planet", name: "Lonely Planet", group: "Lonely Planet", groupKey: "lonely_planet",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Travel Guide / Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Travel Inspiration", quality: 80, incrementalityRisk: "Medium",
    attributionRisk: "Travel content attribution", domains: ["lonelyplanet.com"], amazonTags: [],
    aliases: ["lonely planet", "lonelyplanet"], networks: ["Amazon Associates", "Skimlinks", "Impact"], region: "Global"
  },
  {
    id: "nomadicmatt", publisher: "Nomadic Matt", name: "Nomadic Matt", group: "Nomadic Matt", groupKey: "nomadic_matt",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Travel Blog / Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Travel Advice", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Travel blog attribution", domains: ["nomadicmatt.com"], amazonTags: [],
    aliases: ["nomadic matt", "nomadicmatt"], networks: ["Amazon Associates", "Impact"], region: "US"
  },

  // Gaming
  {
    id: "ign", publisher: "IGN", name: "IGN", group: "Ziff Davis", groupKey: "ziff_davis",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Gaming/Entertainment Review",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", quality: 82, incrementalityRisk: "Low to Medium",
    attributionRisk: "Gaming review attribution", domains: ["ign.com"], amazonTags: ["ign-20"],
    aliases: ["ign", "ign entertainment"], networks: ["Amazon Associates", "CJ Affiliate", "Impact"], region: "US"
  },
  {
    id: "gamespot", publisher: "GameSpot", name: "GameSpot", group: "Fandom", groupKey: "fandom",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Gaming Review/News",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", quality: 80, incrementalityRisk: "Low to Medium",
    attributionRisk: "Gaming editorial attribution", domains: ["gamespot.com"], amazonTags: [],
    aliases: ["gamespot", "game spot"], networks: ["Amazon Associates", "CJ Affiliate"], region: "US"
  },
  {
    id: "polygon", publisher: "Polygon", name: "Polygon", group: "Vox Media", groupKey: "vox_media",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Gaming/Entertainment Review",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", quality: 80, incrementalityRisk: "Low to Medium",
    attributionRisk: "Gaming editorial attribution", domains: ["polygon.com"], amazonTags: [],
    aliases: ["polygon"], networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },

  // Entertainment/Streaming
  {
    id: "rottentomatoes", publisher: "Rotten Tomatoes", name: "Rotten Tomatoes", group: "Fandom", groupKey: "fandom",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Entertainment Review/Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 78, incrementalityRisk: "Medium",
    attributionRisk: "Entertainment commerce attribution", domains: ["rottentomatoes.com"], amazonTags: [],
    aliases: ["rotten tomatoes", "rottentomatoes"], networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },

  // Home/Garden
  {
    id: "gardendesign", publisher: "Garden Design", name: "Garden Design", group: "Garden Design", groupKey: "garden_design",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Garden/Outdoor Commerce",
    intent: "Medium Research Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["gardendesign.com"], amazonTags: [],
    aliases: ["garden design", "gardendesign"], networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },

  // ============================
  // MORE AMAZON TAG ENTRIES
  // ============================
  {
    id: "nymag_tag2", publisher: "New York Magazine", name: "New York Magazine", group: "Vox Media", groupKey: "vox_media",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Lifestyle/Culture Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 78, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["nymag.com"],
    amazonTags: ["nymag-20"], aliases: ["new york magazine", "nymag", "ny mag"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "wsj_tag", publisher: "Wall Street Journal", name: "Wall Street Journal", group: "News Corp", groupKey: "news_corp",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Business/Lifestyle Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 80, incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["wsj.com"],
    amazonTags: ["wsj-20"], aliases: ["wall street journal", "wsj", "the wall street journal"],
    networks: ["Amazon Associates", "Skimlinks", "Impact"], region: "US"
  },
  {
    id: "bloomberg_tag", publisher: "Bloomberg", name: "Bloomberg", group: "Bloomberg", groupKey: "bloomberg",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Business/Lifestyle Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 80, incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["bloomberg.com"],
    amazonTags: ["bloomberg-20"], aliases: ["bloomberg"],
    networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },
  {
    id: "apartmenttherapy_tag", publisher: "Apartment Therapy", name: "Apartment Therapy", group: "Apartment Therapy Media", groupKey: "apartment_therapy",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home/Design Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 78, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["apartmenttherapy.com"],
    amazonTags: ["apartmenttherapy-20"], aliases: ["apartment therapy", "apartmenttherapy"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "myrecipes_tag", publisher: "MyRecipes", name: "MyRecipes", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Food/Kitchen Commerce",
    intent: "Medium Research Intent", role: "Mid Funnel / Discovery", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["myrecipes.com"],
    amazonTags: ["myrecipes-20"], aliases: ["myrecipes", "my recipes"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "realsimple_tag", publisher: "Real Simple", name: "Real Simple", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Lifestyle/Home Commerce",
    intent: "Medium to High Research Intent", role: "Upper-Mid Funnel / Content Assist", quality: 80, incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["realsimple.com"],
    amazonTags: ["realsimple-20"], aliases: ["real simple", "realsimple"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "southernliving_tag2", publisher: "Southern Living", name: "Southern Living", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home/Lifestyle Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["southernliving.com"],
    amazonTags: ["southernliving-20"], aliases: ["southern living", "southernliving"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "sunset_tag", publisher: "Sunset", name: "Sunset", group: "Sunset Publishing", groupKey: "sunset",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home/Garden/Travel Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["sunset.com"],
    amazonTags: ["sunset-20"], aliases: ["sunset", "sunset magazine"],
    networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },
  {
    id: "midwestliving_tag", publisher: "Midwest Living", name: "Midwest Living", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home/Lifestyle Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["midwestliving.com"],
    amazonTags: ["midwestliving-20"], aliases: ["midwest living", "midwestliving"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "coastalliving_tag", publisher: "Coastal Living", name: "Coastal Living", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home/Coastal Lifestyle Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["coastalliving.com"],
    amazonTags: ["coastalliving-20"], aliases: ["coastal living", "coastalliving"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "dwell_tag", publisher: "Dwell", name: "Dwell", group: "Dwell", groupKey: "dwell",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home/Design Commerce",
    intent: "Medium Research Intent", role: "Mid Funnel / Discovery", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["dwell.com"],
    amazonTags: ["dwell-20"], aliases: ["dwell", "dwell magazine"],
    networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },
];
