function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

const PUBLISHER_RULES = [
  {
    name: "DealNews",
    media_group: "Independent Commerce Media",
    type: "Deal Site",
    subtype: "Deal Aggregator",
    amazon_tags: ["dealnewscom"],
    hostnames: ["dealnews.com"],
    keywords: ["dealnews"]
  },
  {
    name: "Slickdeals",
    media_group: "Community Commerce Media",
    type: "Deal Community",
    subtype: "Forum + Deal Aggregator",
    amazon_tags: ["slickdeals09-20"],
    hostnames: ["slickdeals.net"],
    keywords: ["slickdeals"]
  },
  {
    name: "CNET",
    media_group: "Ziff Davis",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: ["cnetcommerce"],
    hostnames: ["cnet.com"],
    keywords: ["cnetcommerce", "cnet"]
  },
  {
    name: "Mattress Nerd",
    media_group: "Resident / Nectar Commerce Content",
    type: "Editorial Review",
    subtype: "SEO Review Site",
    amazon_tags: ["mattressnrd"],
    hostnames: ["mattressnerd.com"],
    keywords: ["mattressnerd", "mattressnrd"]
  },
  {
    name: "Amazon Deal Clubs",
    media_group: "Affiliate Publisher",
    type: "Deal Site",
    subtype: "Amazon Deal Curator",
    amazon_tags: ["amazondealclubs-20"],
    hostnames: [],
    keywords: ["amazondealclubs"]
  },
  {
    name: "Tom's Guide",
    media_group: "Future",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["tomsguide.com"],
    keywords: ["tomsguide"]
  },
  {
    name: "TechRadar",
    media_group: "Future",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["techradar.com"],
    keywords: ["techradar"]
  },
  {
    name: "PC Gamer",
    media_group: "Future",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["pcgamer.com"],
    keywords: ["pcgamer"]
  },
  {
    name: "Wirecutter",
    media_group: "The New York Times",
    type: "Editorial Review",
    subtype: "Product Recommendation",
    amazon_tags: [],
    hostnames: ["wirecutter.com", "nytimes.com"],
    keywords: ["wirecutter"]
  },
  {
    name: "Business Insider",
    media_group: "Business Insider",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["businessinsider.com", "insider.com"],
    keywords: ["businessinsider", "insider"]
  },
  {
    name: "Forbes Vetted",
    media_group: "Forbes",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["forbes.com"],
    keywords: ["forbes vetted", "forbes"]
  },
  {
    name: "CNN Underscored",
    media_group: "CNN",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["cnn.com"],
    keywords: ["underscored", "cnn"]
  },
  {
    name: "RetailMeNot",
    media_group: "Ziff Davis",
    type: "Coupon Site",
    subtype: "Coupon / Cashback",
    amazon_tags: [],
    hostnames: ["retailmenot.com"],
    keywords: ["retailmenot"]
  },
  {
    name: "CouponCabin",
    media_group: "CouponCabin",
    type: "Coupon Site",
    subtype: "Coupon / Cashback",
    amazon_tags: [],
    hostnames: ["couponcabin.com"],
    keywords: ["couponcabin"]
  },
  {
    name: "Brad's Deals",
    media_group: "Brad's Deals",
    type: "Deal Site",
    subtype: "Deal Aggregator",
    amazon_tags: [],
    hostnames: ["bradsdeals.com"],
    keywords: ["bradsdeals"]
  },
  {
    name: "Kinja Deals",
    media_group: "G/O Media",
    type: "Deal Site",
    subtype: "Commerce Editorial Deals",
    amazon_tags: [],
    hostnames: ["kinjadeals.com"],
    keywords: ["kinjadeals"]
  }
];

function getPublisherRules() {
  return PUBLISHER_RULES;
}

module.exports = {
  getPublisherRules,
  normalizeText
};
