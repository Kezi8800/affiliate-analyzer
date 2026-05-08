"use strict";

/**
 * Category Publisher Rules
 * Purpose:
 * Detect vertical/category focus of publisher or URL.
 */

const CATEGORY_PUBLISHER_RULES = [
  {
    vertical: "Mattress / Sleep",
    category: "Home / Sleep",
    intent: "Sleep Product Research",
    patterns: [
      "sleepfoundation",
      "sleep foundation",
      "mattressclarity",
      "mattress clarity",
      "sleepopolis",
      "mattressnerd",
      "mattress nerd",
      "naplab",
      "sleepadvisor",
      "sleep advisor",
      "slumber yard",
      "oursleepguide",
      "mattress",
      "bed-in-a-box",
      "best mattress",
      "side sleepers",
      "back sleepers",
      "memory foam"
    ],
    publisher_type: "Editorial Commerce",
    subtype: "Mattress / Sleep Review",
    confidence: "High"
  },
  {
    vertical: "Pet",
    category: "Pet Supplies",
    intent: "Pet Product Research",
    patterns: [
      "rover",
      "thesprucepets",
      "spruce pets",
      "petmd",
      "cats.com",
      "dogster",
      "catster",
      "daily paws",
      "petkeen",
      "litter box",
      "self-cleaning litter box",
      "cat litter",
      "dog food",
      "cat food",
      "pet supplies"
    ],
    publisher_type: "Editorial Commerce",
    subtype: "Pet Review / Buying Guide",
    confidence: "High"
  },
  {
    vertical: "Home",
    category: "Home / Living",
    intent: "Home Product Research",
    patterns: [
      "thespruce",
      "the spruce",
      "goodhousekeeping",
      "good housekeeping",
      "homesandgardens",
      "homes & gardens",
      "bobvila",
      "bob vila",
      "realsimple",
      "real simple",
      "apartmenttherapy",
      "apartment therapy",
      "housebeautiful",
      "house beautiful",
      "home depot",
      "wayfair",
      "furniture",
      "vacuum",
      "air purifier",
      "coffee maker",
      "cookware",
      "home goods"
    ],
    publisher_type: "Editorial Commerce",
    subtype: "Home Review / Buying Guide",
    confidence: "High"
  },
  {
    vertical: "Tech",
    category: "Consumer Electronics",
    intent: "Tech Product Research",
    patterns: [
      "techradar",
      "tomsguide",
      "tom's guide",
      "pcmag",
      "cnet",
      "theverge",
      "the verge",
      "wired",
      "zdnet",
      "laptopmag",
      "laptop mag",
      "androidcentral",
      "windowscentral",
      "digitaltrends",
      "digital trends",
      "engadget",
      "gizmodo",
      "monitor",
      "laptop",
      "headphones",
      "earbuds",
      "smartphone",
      "tablet",
      "camera",
      "ssd",
      "gaming"
    ],
    publisher_type: "Editorial Commerce",
    subtype: "Tech Review / Buying Guide",
    confidence: "High"
  },
  {
    vertical: "Fashion / Beauty",
    category: "Fashion / Beauty",
    intent: "Style / Beauty Shopping Intent",
    patterns: [
      "whowhatwear",
      "who what wear",
      "byrdie",
      "instyle",
      "allure",
      "glamour",
      "elle",
      "cosmopolitan",
      "vogue",
      "refinery29",
      "fashion",
      "beauty",
      "skincare",
      "makeup",
      "dress",
      "swimsuit",
      "bikini",
      "shoes",
      "handbag"
    ],
    publisher_type: "Editorial Commerce",
    subtype: "Fashion / Beauty Commerce",
    confidence: "High"
  },
  {
    vertical: "Deal / Coupon",
    category: "Deals / Coupons",
    intent: "Deal / Promo Intent",
    patterns: [
      "slickdeals",
      "redflagdeals",
      "hotukdeals",
      "dealabs",
      "mydealz",
      "chollometro",
      "retailmenot",
      "couponfollow",
      "simplycodes",
      "honey",
      "joinhoney",
      "dealspotr",
      "coupon",
      "promo code",
      "discount code",
      "deals",
      "sale",
      "cashback"
    ],
    publisher_type: "Deal / Coupon",
    subtype: "Coupon / Deal Publisher",
    confidence: "High"
  },
  {
    vertical: "Cashback / Loyalty",
    category: "Cashback / Rewards",
    intent: "Cashback / Loyalty Intent",
    patterns: [
      "rakuten",
      "ebates",
      "topcashback",
      "quidco",
      "befrugal",
      "swagbucks",
      "ibotta",
      "capitaloneshopping",
      "capital one shopping",
      "cashback",
      "rewards",
      "loyalty"
    ],
    publisher_type: "Cashback / Loyalty",
    subtype: "Cashback Publisher",
    confidence: "High"
  },
  {
    vertical: "Creator / Influencer",
    category: "Creator Commerce",
    intent: "Creator Recommendation Intent",
    patterns: [
      "youtube",
      "youtu.be",
      "tiktok",
      "instagram",
      "creator",
      "influencer",
      "storefront",
      "linkin.bio",
      "beacons",
      "linktree",
      "amazon creator",
      "creator connections"
    ],
    publisher_type: "Creator / Influencer",
    subtype: "Creator Commerce",
    confidence: "Medium"
  },
  {
    vertical: "Outdoor / Sports",
    category: "Outdoor / Fitness",
    intent: "Outdoor / Fitness Product Research",
    patterns: [
      "outdoorgearlab",
      "outdoor gear lab",
      "switchbacktravel",
      "switchback travel",
      "rei",
      "bikeradar",
      "cyclingnews",
      "runner's world",
      "runnersworld",
      "verywellfit",
      "fitness",
      "running",
      "cycling",
      "camping",
      "hiking",
      "tent",
      "backpack",
      "treadmill"
    ],
    publisher_type: "Editorial Commerce",
    subtype: "Outdoor / Fitness Review",
    confidence: "Medium"
  },
  {
    vertical: "Baby / Parenting",
    category: "Baby / Parenting",
    intent: "Parenting Product Research",
    patterns: [
      "babycenter",
      "whattoexpect",
      "what to expect",
      "parents",
      "verywellfamily",
      "momjunction",
      "babylist",
      "stroller",
      "crib",
      "car seat",
      "baby monitor",
      "diaper"
    ],
    publisher_type: "Editorial Commerce",
    subtype: "Parenting Review / Buying Guide",
    confidence: "Medium"
  },
  {
    vertical: "Travel",
    category: "Travel",
    intent: "Travel Booking / Gear Intent",
    patterns: [
      "thepointsguy",
      "the points guy",
      "lonelyplanet",
      "travelandleisure",
      "travel + leisure",
      "cntraveler",
      "conde nast traveler",
      "skyscanner",
      "booking.com",
      "expedia",
      "tripadvisor",
      "luggage",
      "carry-on",
      "travel gear"
    ],
    publisher_type: "Editorial Commerce",
    subtype: "Travel Commerce",
    confidence: "Medium"
  },
  {
    vertical: "Finance",
    category: "Finance",
    intent: "Financial Product Research",
    patterns: [
      "nerdwallet",
      "bankrate",
      "investopedia",
      "creditkarma",
      "thepointsguy",
      "money",
      "credit card",
      "insurance",
      "loan",
      "mortgage",
      "banking"
    ],
    publisher_type: "Editorial Commerce",
    subtype: "Finance Comparison",
    confidence: "Medium"
  }
];

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function matchCategoryPublisher(input = "") {
  const haystack = normalize(input);
  if (!haystack) return null;

  let best = null;

  for (const rule of CATEGORY_PUBLISHER_RULES) {
    let score = 0;
    const matched = [];

    for (const pattern of rule.patterns) {
      const p = normalize(pattern);
      if (haystack.includes(p)) {
        score += p.length > 10 ? 22 : 14;
        matched.push(pattern);
      }
    }

    if (score > 0 && (!best || score > best.score)) {
      best = {
        vertical: rule.vertical,
        category: rule.category,
        intent: rule.intent,
        publisher_type: rule.publisher_type,
        subtype: rule.subtype,
        confidence: score >= 30 ? "High" : rule.confidence || "Medium",
        matched_by: "category_publisher_rules",
        matched_patterns: matched,
        score
      };
    }
  }

  return best;
}

function matchCategoryPublisherFromUrl(urlObj, params = {}) {
  const paramText = Object.keys(params || {})
    .map(key => `${key}=${params[key]}`)
    .join("&");

  const input = [
    urlObj?.hostname,
    urlObj?.pathname,
    urlObj?.search,
    paramText
  ].filter(Boolean).join(" ");

  return matchCategoryPublisher(input);
}

function enrichPublisherWithCategory(publisherIntel = {}, extraText = "") {
  const input = [
    publisherIntel.publisher,
    publisherIntel.type,
    publisherIntel.subtype,
    publisherIntel.media_group,
    publisherIntel.category,
    publisherIntel.intent,
    extraText
  ].filter(Boolean).join(" ");

  const category = matchCategoryPublisher(input);

  if (!category) return publisherIntel;

  return {
    ...publisherIntel,
    vertical: publisherIntel.vertical || category.vertical,
    category: publisherIntel.category || category.category,
    commercial_intent: publisherIntel.commercial_intent || category.intent,
    type: publisherIntel.type || category.publisher_type,
    subtype: publisherIntel.subtype || category.subtype,
    category_match: category
  };
}

module.exports = {
  CATEGORY_PUBLISHER_RULES,
  matchCategoryPublisher,
  matchCategoryPublisherFromUrl,
  enrichPublisherWithCategory
};
