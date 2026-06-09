// lib/publisher-database-expansion-v2.js
// BrandShuo — Phase 6: Global Publisher Expansion v2
// 100+ additional publishers: Nordics, LATAM, SE Asia, India, more verticals & Amazon tags

module.exports = [

  // ============================
  // NORDICS (SE/NO/DK/FI)
  // ============================
  {
    id: "prisjakt_se", publisher: "Prisjakt", name: "Prisjakt", group: "Prisjakt", groupKey: "prisjakt",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (Nordics)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["prisjakt.nu", "prisjakt.se"], amazonTags: [],
    aliases: ["prisjakt", "prisjakt.nu"], networks: ["Awin", "CJ Affiliate", "TradeDoubler"], region: "SE"
  },
  {
    id: "pricerunner_se", publisher: "PriceRunner", name: "PriceRunner", group: "Klarna", groupKey: "klarna",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (Nordics/UK)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["pricerunner.com", "pricerunner.se", "pricerunner.dk"],
    amazonTags: [], aliases: ["pricerunner", "price runner"], networks: ["Awin", "CJ Affiliate", "TradeDoubler"], region: "SE"
  },
  {
    id: "prisguiden_se", publisher: "Prisguiden", name: "Prisguiden", group: "Prisguiden", groupKey: "prisguiden",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (Nordics)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 72, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["prisguiden.no", "prisguiden.se"], amazonTags: [],
    aliases: ["prisguiden"], networks: ["Awin", "TradeDoubler"], region: "NO"
  },
  {
    id: "tek_se", publisher: "Tek.no", name: "Tek.no", group: "Tek.no", groupKey: "tek",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review (Nordics)",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", quality: 78, incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO review attribution", domains: ["tek.no"], amazonTags: [], aliases: ["tek.no", "tek"],
    networks: ["Awin", "TradeDoubler", "Adtraction"], region: "NO"
  },
  {
    id: "m3_se", publisher: "M3", name: "M3", group: "M3", groupKey: "m3",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech/Gadget Review (Nordics)",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", quality: 76, incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO review attribution", domains: ["m3.se"], amazonTags: [], aliases: ["m3.se", "m3"],
    networks: ["Awin", "TradeDoubler"], region: "SE"
  },
  {
    id: "vertaa_fi", publisher: "Vertaa.fi", name: "Vertaa.fi", group: "Vertaa", groupKey: "vertaa",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (Finland)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 72, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["vertaa.fi"], amazonTags: [], aliases: ["vertaa.fi", "vertaa"],
    networks: ["Awin", "TradeDoubler"], region: "FI"
  },
  {
    id: "hintaopas_fi", publisher: "Hintaopas", name: "Hintaopas", group: "Hintaopas", groupKey: "hintaopas",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (Finland)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 72, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["hintaopas.fi"], amazonTags: [], aliases: ["hintaopas"],
    networks: ["Awin", "TradeDoubler"], region: "FI"
  },

  // ============================
  // LATAM (MX/BR/AR)
  // ============================
  {
    id: "promodescuentos_mx", publisher: "PromoDescuentos", name: "PromoDescuentos", group: "Pepper.com", groupKey: "pepper",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (MX/LATAM)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", quality: 66, incrementalityRisk: "Medium to High",
    attributionRisk: "Deal-driven attribution", domains: ["promodescuentos.com"], amazonTags: [],
    aliases: ["promodescuentos", "promo descuentos"], networks: ["Awin", "CJ Affiliate", "Rakuten"], region: "MX"
  },
  {
    id: "pelando_br", publisher: "Pelando", name: "Pelando", group: "Pepper.com", groupKey: "pepper",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (Brazil)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", quality: 66, incrementalityRisk: "Medium to High",
    attributionRisk: "Deal-driven attribution", domains: ["pelando.com.br"], amazonTags: [],
    aliases: ["pelando", "pelando.com.br"], networks: ["Awin", "CJ Affiliate", "Rakuten"], region: "BR"
  },
  {
    id: "buscape_br", publisher: "Buscapé", name: "Buscapé", group: "Buscapé", groupKey: "buscape",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (Brazil)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 72, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["buscape.com.br"], amazonTags: [],
    aliases: ["buscapé", "busca pé", "buscape"], networks: ["CJ Affiliate", "Rakuten", "Awin"], region: "BR"
  },
  {
    id: "zoom_br", publisher: "Zoom", name: "Zoom", group: "Zoom", groupKey: "zoom_br",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Price Comparison (Brazil)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 70, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["zoom.com.br"], amazonTags: [],
    aliases: ["zoom", "zoom.com.br"], networks: ["CJ Affiliate", "Rakuten"], region: "BR"
  },
  {
    id: "cuponation_br", publisher: "Cuponation", name: "Cuponation", group: "Cuponation", groupKey: "cuponation",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Coupon / Promo Code (Global)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Coupon Discovery", quality: 58, incrementalityRisk: "High",
    attributionRisk: "Coupon last-click risk", domains: ["cuponation.com", "cuponation.com.br", "cuponation.de"],
    amazonTags: [], aliases: ["cuponation", "cupo nation"], networks: ["CJ Affiliate", "Awin", "Rakuten"], region: "Global"
  },
  {
    id: "canaltech_br", publisher: "Canaltech", name: "Canaltech", group: "Canaltech", groupKey: "canaltech",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review (Brazil)",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", quality: 76, incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO review attribution", domains: ["canaltech.com.br"], amazonTags: [],
    aliases: ["canaltech", "canal tech"], networks: ["CJ Affiliate", "Rakuten", "Awin"], region: "BR"
  },
  {
    id: "tecmundo_br", publisher: "TecMundo", name: "TecMundo", group: "TecMundo", groupKey: "tecmundo",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Tech Review (Brazil)",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Content Assist", quality: 76, incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO review attribution", domains: ["tecmundo.com.br"], amazonTags: [],
    aliases: ["tecmundo", "tec mundo"], networks: ["CJ Affiliate", "Rakuten"], region: "BR"
  },

  // ============================
  // SOUTHEAST ASIA (SG/MY/TH/ID/PH/VN)
  // ============================
  {
    id: "iprice_my", publisher: "iPrice", name: "iPrice", group: "iPrice Group", groupKey: "iprice",
    category: "smart_router", publisherType: "Price Comparison / Aggregator", trafficType: "Price Comparison (SE Asia)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Price Comparison", quality: 70, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["iprice.my", "iprice.co.id", "iprice.ph", "iprice.sg", "iprice.vn", "iprice.co.th"],
    amazonTags: [], aliases: ["iprice", "i price"], networks: ["CJ Affiliate", "Impact", "Rakuten"], region: "MY"
  },
  {
    id: "shopback_sg", publisher: "ShopBack", name: "ShopBack", group: "ShopBack", groupKey: "shopback",
    category: "cashback_rewards", publisherType: "Cashback", trafficType: "Cashback (SE Asia/APAC)",
    intent: "Very High Purchase Intent", role: "Bottom Funnel / Cashback", quality: 66, incrementalityRisk: "Medium to High",
    attributionRisk: "Cashback last-click risk", domains: ["shopback.sg", "shopback.my", "shopback.co.id", "shopback.ph", "shopback.co.th"],
    amazonTags: [], aliases: ["shopback", "shop back"], networks: ["CJ Affiliate", "Impact", "Rakuten"], region: "SG"
  },
  {
    id: "cuponation_sg", publisher: "Cuponation SG", name: "Cuponation Singapore", group: "Cuponation", groupKey: "cuponation",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Coupon / Promo Code (SE Asia)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Coupon Discovery", quality: 58, incrementalityRisk: "High",
    attributionRisk: "Coupon last-click risk", domains: ["cuponation.sg", "cuponation.com.sg"], amazonTags: [],
    aliases: ["cuponation singapore"], networks: ["CJ Affiliate", "Impact"], region: "SG"
  },
  {
    id: "singsaver_sg", publisher: "SingSaver", name: "SingSaver", group: "SingSaver", groupKey: "singsaver",
    category: "finance_review", publisherType: "Finance Comparison", trafficType: "Financial Product Comparison (SG)",
    intent: "Very High Purchase Intent", role: "Bottom Funnel / Finance Match", quality: 78, incrementalityRisk: "Medium",
    attributionRisk: "Financial comparison attribution", domains: ["singsaver.com.sg"], amazonTags: [],
    aliases: ["singsaver", "sing saver"], networks: ["Impact", "CJ Affiliate"], region: "SG"
  },
  {
    id: "moneysmart_sg", publisher: "MoneySmart", name: "MoneySmart", group: "MoneySmart Group", groupKey: "moneysmart",
    category: "finance_review", publisherType: "Finance Comparison", trafficType: "Financial Product Comparison (SG)",
    intent: "Very High Purchase Intent", role: "Bottom Funnel / Finance Match", quality: 78, incrementalityRisk: "Medium",
    attributionRisk: "Financial comparison attribution", domains: ["moneysmart.sg"], amazonTags: [],
    aliases: ["moneysmart", "money smart"], networks: ["Impact", "CJ Affiliate"], region: "SG"
  },
  {
    id: "thairath_th", publisher: "Thairath", name: "Thairath", group: "Thairath", groupKey: "thairath",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "News / Lifestyle Commerce (TH)",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 68, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["thairath.co.th"], amazonTags: [],
    aliases: ["thairath", "thai rath"], networks: ["CJ Affiliate"], region: "TH"
  },

  // ============================
  // INDIA
  // ============================
  {
    id: "cashkaro_in", publisher: "CashKaro", name: "CashKaro", group: "CashKaro", groupKey: "cashkaro",
    category: "cashback_rewards", publisherType: "Cashback / Coupon", trafficType: "Cashback / Coupon (India)",
    intent: "Very High Purchase Intent", role: "Bottom Funnel / Cashback", quality: 64, incrementalityRisk: "Medium to High",
    attributionRisk: "Cashback last-click risk", domains: ["cashkaro.com"], amazonTags: [],
    aliases: ["cashkaro", "cash karo"], networks: ["CJ Affiliate", "Impact", "Rakuten"], region: "IN"
  },
  {
    id: "coupondunia_in", publisher: "CouponDunia", name: "CouponDunia", group: "CouponDunia", groupKey: "coupondunia",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Coupon / Promo Code (India)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Coupon Discovery", quality: 60, incrementalityRisk: "High",
    attributionRisk: "Coupon last-click risk", domains: ["coupondunia.in"], amazonTags: [],
    aliases: ["coupondunia", "coupon dunia"], networks: ["CJ Affiliate", "Impact"], region: "IN"
  },
  {
    id: "grabon_in", publisher: "GrabOn", name: "GrabOn", group: "GrabOn", groupKey: "grabon",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Coupon / Promo Code (India)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Coupon Discovery", quality: 60, incrementalityRisk: "High",
    attributionRisk: "Coupon last-click risk", domains: ["grabon.in"], amazonTags: [],
    aliases: ["grabon", "grab on"], networks: ["CJ Affiliate", "Impact"], region: "IN"
  },
  {
    id: "desidime_in", publisher: "DesiDime", name: "DesiDime", group: "DesiDime", groupKey: "desidime",
    category: "deal_coupon", publisherType: "Deal / Coupon", trafficType: "Deal Community (India)",
    intent: "High Purchase Intent", role: "Bottom Funnel / Deal Discovery", quality: 66, incrementalityRisk: "Medium to High",
    attributionRisk: "Deal-driven attribution", domains: ["desidime.com"], amazonTags: [],
    aliases: ["desidime", "desi dime"], networks: ["CJ Affiliate", "Impact"], region: "IN"
  },
  {
    id: "91mobiles_in", publisher: "91mobiles", name: "91mobiles", group: "91mobiles", groupKey: "91mobiles",
    category: "seo_review_media", publisherType: "Review / SEO Media", trafficType: "Mobile Review / Comparison (India)",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", quality: 74, incrementalityRisk: "Low to Medium",
    attributionRisk: "SEO review attribution", domains: ["91mobiles.com"], amazonTags: [],
    aliases: ["91mobiles", "91 mobiles"], networks: ["CJ Affiliate", "Impact", "Rakuten"], region: "IN"
  },
  {
    id: "smartprix_in", publisher: "Smartprix", name: "Smartprix", group: "Smartprix", groupKey: "smartprix",
    category: "smart_router", publisherType: "Price Comparison", trafficType: "Mobile/Tech Comparison (India)",
    intent: "High Research Intent", role: "Mid Funnel / Comparison", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Price comparison attribution", domains: ["smartprix.com"], amazonTags: [],
    aliases: ["smartprix", "smart prix"], networks: ["CJ Affiliate", "Impact"], region: "IN"
  },

  // ============================
  // MORE US/UK VERTICAL PUBLISHERS
  // ============================
  // Fashion/Beauty
  {
    id: "whowhatwear", publisher: "Who What Wear", name: "Who What Wear", group: "Future plc", groupKey: "future",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Fashion Editorial Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["whowhatwear.com", "whowhatwear.co.uk"],
    amazonTags: [], aliases: ["who what wear", "whowhatwear"], networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "thezoereport", publisher: "The Zoe Report", name: "The Zoe Report", group: "The Zoe Report", groupKey: "thezoereport",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Beauty/Fashion Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["thezoereport.com"], amazonTags: [],
    aliases: ["the zoe report", "zoe report"], networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },
  {
    id: "popsugar", publisher: "POPSUGAR", name: "POPSUGAR", group: "POPSUGAR", groupKey: "popsugar",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Lifestyle/Fashion Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["popsugar.com"], amazonTags: ["popsugar-20"],
    aliases: ["popsugar", "pop sugar"], networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  // Baby/Parenting
  {
    id: "babylist", publisher: "Babylist", name: "Babylist", group: "Babylist", groupKey: "babylist",
    category: "content_commerce", publisherType: "Content Commerce / Registry", trafficType: "Baby Registry / Commerce",
    intent: "Very High Purchase Intent", role: "Bottom Funnel / Registry", quality: 78, incrementalityRisk: "Low to Medium",
    attributionRisk: "Registry commerce attribution", domains: ["babylist.com"], amazonTags: [],
    aliases: ["babylist", "baby list"], networks: ["Amazon Associates", "Impact", "CJ Affiliate"], region: "US"
  },
  {
    id: "thebump", publisher: "The Bump", name: "The Bump", group: "The Knot Worldwide", groupKey: "knot_worldwide",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Baby/Parenting Commerce",
    intent: "Medium to High Purchase Intent", role: "Mid Funnel / Discovery", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["thebump.com"], amazonTags: [],
    aliases: ["the bump", "bump"], networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },
  {
    id: "whattoexpect", publisher: "What to Expect", name: "What to Expect", group: "Everyday Health", groupKey: "everyday_health",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Baby/Parenting Commerce",
    intent: "Medium to High Purchase Intent", role: "Mid Funnel / Discovery", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["whattoexpect.com"], amazonTags: [],
    aliases: ["what to expect", "whattoexpect"], networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  // Pet
  {
    id: "thedodo", publisher: "The Dodo", name: "The Dodo", group: "Vox Media", groupKey: "vox_media",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Pet Lifestyle Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["thedodo.com"], amazonTags: [],
    aliases: ["the dodo", "dodo"], networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },
  {
    id: "dogster", publisher: "Dogster", name: "Dogster", group: "Dogster", groupKey: "dogster",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Pet/Dog Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 70, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["dogster.com"], amazonTags: [],
    aliases: ["dogster"], networks: ["Amazon Associates", "Skimlinks"], region: "US"
  },
  // Fitness/Sports
  {
    id: "bodybuilding_com", publisher: "Bodybuilding.com", name: "Bodybuilding.com", group: "Bodybuilding.com", groupKey: "bodybuilding",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Fitness/Supplement Commerce",
    intent: "High Purchase Intent", role: "Mid Funnel / Fitness Commerce", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Fitness commerce attribution", domains: ["bodybuilding.com"], amazonTags: [],
    aliases: ["bodybuilding.com", "bodybuilding", "bbcom"], networks: ["Impact", "CJ Affiliate", "Amazon Associates"], region: "US"
  },
  {
    id: "runnersworld", publisher: "Runner's World", name: "Runner's World", group: "Hearst", groupKey: "hearst",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Running/Fitness Commerce",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", quality: 78, incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["runnersworld.com"], amazonTags: [],
    aliases: ["runner's world", "runners world", "runnersworld"], networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "bicycling", publisher: "Bicycling", name: "Bicycling", group: "Hearst", groupKey: "hearst",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Cycling/Fitness Commerce",
    intent: "High Research Intent", role: "Upper-Mid Funnel / Review Assist", quality: 78, incrementalityRisk: "Low to Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["bicycling.com"], amazonTags: [],
    aliases: ["bicycling", "bicycling magazine"], networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },

  // ============================
  // MORE COUPON/DEAL NETWORKS
  // ============================
  {
    id: "joinhoney_tag", publisher: "Honey", name: "Honey", group: "PayPal Honey", groupKey: "honey",
    category: "coupon_extension", publisherType: "Coupon Extension", trafficType: "Browser Extension / Coupon",
    intent: "Very High Purchase Intent", role: "Bottom Funnel / Last-click Risk", quality: 55, incrementalityRisk: "Very High",
    attributionRisk: "Extension-based attribution overwrite risk", domains: ["joinhoney.com"],
    amazonTags: ["joinhoney-20"], aliases: ["honey", "paypal honey", "join honey"],
    networks: ["Impact", "CJ Affiliate", "Partnerize"], region: "US"
  },
  {
    id: "rakuten_tag", publisher: "Rakuten Rewards", name: "Rakuten Rewards", group: "Rakuten", groupKey: "rakuten_rewards",
    category: "cashback_rewards", publisherType: "Cashback / Rewards", trafficType: "Cashback / Rewards",
    intent: "High Purchase Intent", role: "Bottom Funnel / Loyalty", quality: 66, incrementalityRisk: "High",
    attributionRisk: "Cashback last-click risk", domains: ["rakuten.com", "ebates.com"],
    amazonTags: ["rakuten-20"], aliases: ["rakuten", "ebates", "rakuten rewards"],
    networks: ["Rakuten Advertising"], region: "US"
  },

  // ============================
  // MORE GLOBAL RETAILERS/PLATFORMS
  // ============================
  {
    id: "shopify_collabs", publisher: "Shopify Collabs", name: "Shopify Collabs", group: "Shopify", groupKey: "shopify",
    category: "creator_commerce", publisherType: "Creator Commerce", trafficType: "Creator / DTC Affiliate",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Creator Assist", quality: 66, incrementalityRisk: "Medium",
    attributionRisk: "DTC creator attribution", domains: ["shopify.com", "collabs.shopify.com"], amazonTags: [],
    aliases: ["shopify collabs", "shopify"], networks: ["Shopify Collabs", "Impact", "CJ Affiliate"], region: "Global"
  },
  {
    id: "target_affiliates", publisher: "Target", name: "Target", group: "Target", groupKey: "target",
    category: "affiliate_network", publisherType: "Retail Affiliate", trafficType: "Retail Affiliate Program",
    intent: "High Purchase Intent", role: "Bottom Funnel / Retail Affiliate", quality: 72, incrementalityRisk: "Medium",
    attributionRisk: "Retail affiliate attribution", domains: ["target.com"], amazonTags: [],
    aliases: ["target affiliates", "target partner"], networks: ["Impact", "CJ Affiliate", "Rakuten"], region: "US"
  },
  {
    id: "bestbuy_affiliates", publisher: "Best Buy Affiliates", name: "Best Buy Affiliates", group: "Best Buy", groupKey: "bestbuy",
    category: "affiliate_network", publisherType: "Retail Affiliate", trafficType: "Retail Affiliate Program",
    intent: "High Purchase Intent", role: "Bottom Funnel / Retail Affiliate", quality: 72, incrementalityRisk: "Medium",
    attributionRisk: "Retail affiliate attribution", domains: ["bestbuy.com"], amazonTags: [],
    aliases: ["best buy affiliates", "bestbuy partners"], networks: ["Impact", "CJ Affiliate"], region: "US"
  },

  // ============================
  // ADDITIONAL AMAZON TAG ENTRIES
  // ============================
  {
    id: "newyorker_tag", publisher: "The New Yorker", name: "The New Yorker", group: "Condé Nast", groupKey: "conde_nast",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Literary/Lifestyle Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 76, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["newyorker.com"],
    amazonTags: ["thenewyorker-20"], aliases: ["the new yorker", "new yorker"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "vanityfair_tag", publisher: "Vanity Fair", name: "Vanity Fair", group: "Condé Nast", groupKey: "conde_nast",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Lifestyle/Fashion Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["vanityfair.com"],
    amazonTags: ["vanityfair-20"], aliases: ["vanity fair", "vanityfair"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "glamour_tag", publisher: "Glamour", name: "Glamour", group: "Condé Nast", groupKey: "conde_nast",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Beauty/Fashion Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["glamour.com"],
    amazonTags: ["glamour-20"], aliases: ["glamour", "glamour magazine"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "self_tag", publisher: "SELF", name: "SELF", group: "Condé Nast", groupKey: "conde_nast",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Health/Fitness Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["self.com"],
    amazonTags: ["self-20"], aliases: ["self", "self magazine"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "elle_tag", publisher: "ELLE", name: "ELLE", group: "Hearst", groupKey: "hearst",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Fashion/Beauty Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["elle.com"],
    amazonTags: ["elle-20"], aliases: ["elle", "elle magazine"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "harpersbazaar_tag", publisher: "Harper's BAZAAR", name: "Harper's BAZAAR", group: "Hearst", groupKey: "hearst",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Luxury Fashion Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["harpersbazaar.com"],
    amazonTags: ["harpersbazaar-20"], aliases: ["harper's bazaar", "harpers bazaar", "harpersbazaar"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "marieclaire_tag", publisher: "Marie Claire", name: "Marie Claire", group: "Future plc", groupKey: "future",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Fashion/Beauty Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["marieclaire.com"],
    amazonTags: ["marieclaire-20"], aliases: ["marie claire", "marieclaire"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "delish_tag", publisher: "Delish", name: "Delish", group: "Hearst", groupKey: "hearst",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Food/Kitchen Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["delish.com"],
    amazonTags: ["delish-20"], aliases: ["delish"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "countryliving_tag", publisher: "Country Living", name: "Country Living", group: "Hearst", groupKey: "hearst",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home/Lifestyle Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["countryliving.com"],
    amazonTags: ["countryliving-20"], aliases: ["country living", "countryliving"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "veranda_tag", publisher: "Veranda", name: "Veranda", group: "Hearst", groupKey: "hearst",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home/Design Commerce",
    intent: "Medium Research Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["veranda.com"],
    amazonTags: ["veranda-20"], aliases: ["veranda", "veranda magazine"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "southernliving_tag", publisher: "Southern Living", name: "Southern Living", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "home_lifestyle_media", publisherType: "Home / Lifestyle Media", trafficType: "Home/Lifestyle Commerce",
    intent: "Medium Purchase Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["southernliving.com"],
    amazonTags: ["southernliving-20"], aliases: ["southern living", "southernliving"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
  {
    id: "eatingwell_tag", publisher: "EatingWell", name: "EatingWell", group: "Dotdash Meredith", groupKey: "dotdash_meredith",
    category: "content_commerce", publisherType: "Content Commerce", trafficType: "Food/Kitchen Commerce",
    intent: "Medium Research Intent", role: "Mid Funnel / Discovery", quality: 74, incrementalityRisk: "Medium",
    attributionRisk: "Editorial commerce attribution", domains: ["eatingwell.com"],
    amazonTags: ["eatingwell-20"], aliases: ["eatingwell", "eating well"],
    networks: ["Amazon Associates", "Skimlinks", "Sovrn"], region: "US"
  },
];
