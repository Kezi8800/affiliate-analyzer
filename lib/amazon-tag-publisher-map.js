// lib/amazon-tag-publisher-map.js
// BrandShuo Attribution Checker
// Amazon Tag → Publisher Mapping v1.0

const AMAZON_TAG_PUBLISHER_MAP = [
  {
    tagPatterns: ["slickdeals", "slickdeal"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["mattressnerd", "mattress-nerd"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["sleepopolis"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["wirecutter", "thewirecutter"],
    publisher: "Wirecutter",
    domain: "wirecutter.com",
    group: "The New York Times Company",
    groupKey: "nyt",
    category: "commerce_media",
    region: "US",
    trafficType: "SEO / Editorial Commerce",
    commercialIntent: "Editorial Commerce Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 88,
    incrementalityRisk: "Low-Medium",
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["cnet"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["tomsguide", "toms-guide", "tomshardware"],
    publisher: "Tom's Guide / Tom's Hardware",
    domain: "tomsguide.com",
    group: "Future plc",
    groupKey: "future",
    category: "commerce_media",
    region: "US / Global",
    trafficType: "SEO / Editorial Commerce",
    commercialIntent: "Editorial Commerce Intent",
    channelRole: "Editorial Discovery / Consideration",
    quality: 84,
    incrementalityRisk: "Low-Medium",
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["pcmag"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["reviewed", "usatoday"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["bestreviews"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["rtings"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["amazondealclubs", "amazondealclub"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["dealmoon"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["dealnews"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["bensbargains"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["bradsdeals"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["retailmenot"],
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
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["honey", "joinhoney", "paypalhoney"],
    publisher: "Honey / PayPal Honey",
    domain: "joinhoney.com",
    group: "Coupon / Cashback Publisher",
    groupKey: "coupon_cashback",
    category: "price_tool",
    region: "US / Global",
    trafficType: "Price Tracking / Extension",
    commercialIntent: "Coupon / Checkout Intent",
    channelRole: "Last-click / Browser Extension",
    quality: 50,
    incrementalityRisk: "High",
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["rakuten"],
    publisher: "Rakuten Rewards",
    domain: "rakuten.com",
    group: "Coupon / Cashback Publisher",
    groupKey: "coupon_cashback",
    category: "cashback",
    region: "US / Global",
    trafficType: "Cashback / Loyalty",
    commercialIntent: "Cashback / Reward Intent",
    channelRole: "Last Click / Loyalty",
    quality: 55,
    incrementalityRisk: "High",
    confidence: "tag_pattern"
  },
  {
    tagPatterns: ["topcashback"],
    publisher: "TopCashback",
    domain: "topcashback.com",
    group: "Coupon / Cashback Publisher",
    groupKey: "coupon_cashback",
    category: "cashback",
    region: "US / UK",
    trafficType: "Cashback / Loyalty",
    commercialIntent: "Cashback / Reward Intent",
    channelRole: "Last Click / Loyalty",
    quality: 55,
    incrementalityRisk: "High",
    confidence: "tag_pattern"
  }
];

function normalizeAmazonTag(tag) {
  return String(tag || "")
    .toLowerCase()
    .trim()
    .replace(/-20$/, "")
    .replace(/-21$/, "")
    .replace(/-22$/, "");
}

function detectPublisherByAmazonTag(tag) {
  const cleanTag = normalizeAmazonTag(tag);

  if (!cleanTag) return null;

  const matched = AMAZON_TAG_PUBLISHER_MAP.find((item) => {
    return item.tagPatterns.some((pattern) => cleanTag.includes(pattern));
  });

  if (!matched) return null;

  return {
    matched: true,
    matchType: "amazon_tag",
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
    confidence: matched.confidence,
    source: "amazon_tag",
    tag
  };
}

module.exports = {
  AMAZON_TAG_PUBLISHER_MAP,
  detectPublisherByAmazonTag
};
