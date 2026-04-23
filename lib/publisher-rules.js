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
    keywords: ["dealnews"],
    aliases: ["dealnews", "dealnewscom"]
  },
  {
    name: "Slickdeals",
    media_group: "Community Commerce Media",
    type: "Deal Community",
    subtype: "Forum + Deal Aggregator",
    amazon_tags: ["slickdeals09-20"],
    hostnames: ["slickdeals.net"],
    keywords: ["slickdeals"],
    aliases: ["slickdeals", "slickdeals09-20", "slickdeals09"]
  },
  {
    name: "CNET",
    media_group: "Ziff Davis",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: ["cnetcommerce"],
    hostnames: ["cnet.com"],
    keywords: ["cnet", "cnetcommerce"],
    aliases: ["cnet", "cnetcommerce", "cnet commerce"]
  },
  {
    name: "Mattress Nerd",
    media_group: "Resident / Nectar Commerce Content",
    type: "Editorial Review",
    subtype: "SEO Review Site",
    amazon_tags: ["mattressnrd"],
    hostnames: ["mattressnerd.com"],
    keywords: ["mattressnerd", "mattressnrd"],
    aliases: ["mattressnerd", "mattress nrd", "mattressnrd"]
  },
  {
    name: "Amazon Deal Clubs",
    media_group: "Affiliate Publisher",
    type: "Deal Site",
    subtype: "Amazon Deal Curator",
    amazon_tags: ["amazondealclubs-20"],
    hostnames: [],
    keywords: ["amazondealclubs"],
    aliases: ["amazondealclubs", "amazon deal clubs"]
  },
  {
    name: "Tom's Guide",
    media_group: "Future",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["tomsguide.com"],
    keywords: ["tomsguide"],
    aliases: ["tomsguide", "tom's guide", "toms guide"]
  },
  {
    name: "TechRadar",
    media_group: "Future",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["techradar.com"],
    keywords: ["techradar"],
    aliases: ["techradar", "tech radar"]
  },
  {
    name: "PC Gamer",
    media_group: "Future",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["pcgamer.com"],
    keywords: ["pcgamer"],
    aliases: ["pcgamer", "pc gamer"]
  },
  {
    name: "Wirecutter",
    media_group: "The New York Times",
    type: "Editorial Review",
    subtype: "Product Recommendation",
    amazon_tags: [],
    hostnames: ["wirecutter.com", "nytimes.com"],
    keywords: ["wirecutter"],
    aliases: ["wirecutter", "the wirecutter"]
  },
  {
    name: "Business Insider",
    media_group: "Business Insider",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["businessinsider.com", "insider.com"],
    keywords: ["businessinsider", "insider"],
    aliases: ["businessinsider", "business insider", "insider"]
  },
  {
    name: "Forbes Vetted",
    media_group: "Forbes",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["forbes.com"],
    keywords: ["forbes vetted", "forbes"],
    aliases: ["forbes vetted", "forbes", "forbesvetted"]
  },
  {
    name: "CNN Underscored",
    media_group: "CNN",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["cnn.com"],
    keywords: ["underscored", "cnn underscored"],
    aliases: ["cnn underscored", "underscored", "cnnunderscored"]
  },
  {
    name: "RetailMeNot",
    media_group: "Ziff Davis",
    type: "Coupon Site",
    subtype: "Coupon / Cashback",
    amazon_tags: [],
    hostnames: ["retailmenot.com"],
    keywords: ["retailmenot"],
    aliases: ["retailmenot", "retail me not"]
  },
  {
    name: "CouponCabin",
    media_group: "CouponCabin",
    type: "Coupon Site",
    subtype: "Coupon / Cashback",
    amazon_tags: [],
    hostnames: ["couponcabin.com"],
    keywords: ["couponcabin"],
    aliases: ["couponcabin", "coupon cabin"]
  },
  {
    name: "Brad's Deals",
    media_group: "Brad's Deals",
    type: "Deal Site",
    subtype: "Deal Aggregator",
    amazon_tags: [],
    hostnames: ["bradsdeals.com"],
    keywords: ["bradsdeals"],
    aliases: ["bradsdeals", "brad's deals", "brads deals"]
  },
  {
    name: "Kinja Deals",
    media_group: "G/O Media",
    type: "Deal Site",
    subtype: "Commerce Editorial Deals",
    amazon_tags: [],
    hostnames: ["kinjadeals.com"],
    keywords: ["kinjadeals"],
    aliases: ["kinjadeals", "kinja deals"]
  },
  {
    name: "Reviewed",
    media_group: "Gannett / USA TODAY",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["reviewed.usatoday.com", "reviewed.com"],
    keywords: ["reviewed"],
    aliases: ["reviewed", "usa today reviewed"]
  },
  {
    name: "PCMag",
    media_group: "Ziff Davis",
    type: "Editorial Review",
    subtype: "Commerce Editorial",
    amazon_tags: [],
    hostnames: ["pcmag.com"],
    keywords: ["pcmag"],
    aliases: ["pcmag", "pc mag"]
  },
  {
    name: "TRDPRO",
    media_group: "Affiliate Publisher",
    type: "Affiliate Publisher",
    subtype: "General Affiliate",
    amazon_tags: [],
    hostnames: [],
    keywords: ["trdpro-us", "trdpro"],
    aliases: ["trdpro-us", "trdpro"]
  }
];

function getPublisherRules() {
  return PUBLISHER_RULES;
}

function findPublisherRuleByAlias(value) {
  const needle = normalizeText(value);
  if (!needle) return null;

  return PUBLISHER_RULES.find((rule) => {
    const aliases = (rule.aliases || []).map(normalizeText);
    const keywords = (rule.keywords || []).map(normalizeText);
    const hostnames = (rule.hostnames || []).map(normalizeText);
    const amazonTags = (rule.amazon_tags || []).map(normalizeText);

    return (
      aliases.includes(needle) ||
      keywords.includes(needle) ||
      hostnames.includes(needle) ||
      amazonTags.includes(needle)
    );
  }) || null;
}

module.exports = {
  getPublisherRules,
  normalizeText,
  findPublisherRuleByAlias
};
