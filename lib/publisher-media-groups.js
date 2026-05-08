"use strict";

/**
 * Publisher Media Groups
 * Purpose:
 * Map publisher names / URL signals to parent media group.
 */

const PUBLISHER_MEDIA_GROUPS = [
  {
    media_group: "Future",
    region: "Global",
    type: "Media Group",
    publishers: [
      "TechRadar",
      "Tom's Guide",
      "T3",
      "Laptop Mag",
      "What Hi-Fi",
      "Marie Claire",
      "Homes & Gardens",
      "Ideal Home",
      "Livingetc",
      "Who What Wear",
      "GamesRadar",
      "PC Gamer",
      "Creative Bloq",
      "Digital Camera World",
      "Android Central",
      "iMore",
      "Windows Central",
      "Cyclingnews",
      "Fit&Well",
      "Space.com"
    ],
    patterns: [
      "techradar",
      "tomsguide",
      "tom's guide",
      "t3.com",
      "laptopmag",
      "what hi-fi",
      "marieclaire",
      "homesandgardens",
      "idealhome",
      "livingetc",
      "whowhatwear",
      "gamesradar",
      "pcgamer",
      "creativebloq",
      "digitalcameraworld",
      "androidcentral",
      "imore",
      "windowscentral",
      "cyclingnews",
      "fitandwell",
      "space.com",
      "future__",
      "future plc"
    ]
  },
  {
    media_group: "Ziff Davis",
    region: "US",
    type: "Media Group",
    publishers: [
      "PCMag",
      "Mashable",
      "Lifehacker",
      "IGN",
      "RetailMeNot",
      "Offers.com",
      "Everyday Health",
      "BabyCenter",
      "Spiceworks",
      "ExtremeTech"
    ],
    patterns: [
      "pcmag",
      "mashable",
      "lifehacker",
      "ign",
      "retailmenot",
      "offers.com",
      "everydayhealth",
      "babycenter",
      "spiceworks",
      "extremetech",
      "ziffdavis",
      "ziff davis",
      "p00935"
    ]
  },
  {
    media_group: "Dotdash Meredith",
    region: "US",
    type: "Media Group",
    publishers: [
      "People",
      "Food & Wine",
      "Travel + Leisure",
      "Better Homes & Gardens",
      "The Spruce",
      "The Spruce Pets",
      "The Spruce Eats",
      "Verywell",
      "Investopedia",
      "Byrdie",
      "InStyle",
      "Real Simple",
      "Southern Living",
      "Martha Stewart",
      "Parents",
      "Shape",
      "Allrecipes"
    ],
    patterns: [
      "people",
      "foodandwine",
      "food & wine",
      "travelandleisure",
      "travel + leisure",
      "bhg",
      "betterhomes",
      "better homes",
      "thespruce",
      "sprucepets",
      "spruceeats",
      "verywell",
      "investopedia",
      "byrdie",
      "instyle",
      "realsimple",
      "southernliving",
      "marthastewart",
      "parents",
      "shape",
      "allrecipes",
      "dotdash",
      "meredith"
    ]
  },
  {
    media_group: "Hearst",
    region: "Global",
    type: "Media Group",
    publishers: [
      "Good Housekeeping",
      "Esquire",
      "Elle",
      "Cosmopolitan",
      "Popular Mechanics",
      "Runner's World",
      "Men's Health",
      "Women's Health",
      "House Beautiful",
      "Country Living",
      "Delish",
      "Best Products",
      "Car and Driver",
      "Road & Track"
    ],
    patterns: [
      "goodhousekeeping",
      "good housekeeping",
      "esquire",
      "elle",
      "cosmopolitan",
      "popularmechanics",
      "popular mechanics",
      "runnersworld",
      "runner's world",
      "menshealth",
      "men's health",
      "womenshealth",
      "women's health",
      "housebeautiful",
      "countryliving",
      "delish",
      "bestproducts",
      "caranddriver",
      "roadandtrack",
      "hearst"
    ]
  },
  {
    media_group: "Vox Media",
    region: "US",
    type: "Media Group",
    publishers: [
      "The Verge",
      "New York Magazine",
      "The Strategist",
      "Eater",
      "Polygon",
      "Vox",
      "Curbed"
    ],
    patterns: [
      "theverge",
      "verge",
      "nymag",
      "new york magazine",
      "strategist",
      "the strategist",
      "eater",
      "polygon",
      "vox.com",
      "curbed",
      "voxmedia",
      "vox media"
    ]
  },
  {
    media_group: "Red Ventures",
    region: "US",
    type: "Media Group",
    publishers: [
      "CNET",
      "Bankrate",
      "The Points Guy",
      "Healthline",
      "ZDNET",
      "Reviews.com",
      "NextAdvisor",
      "Lonely Planet"
    ],
    patterns: [
      "cnet",
      "cnetcommerce",
      "bankrate",
      "thepointsguy",
      "the points guy",
      "healthline",
      "zdnet",
      "reviews.com",
      "nextadvisor",
      "lonelyplanet",
      "red ventures",
      "redventures"
    ]
  },
  {
    media_group: "NYTimes",
    region: "US",
    type: "Media Group",
    publishers: [
      "Wirecutter",
      "The New York Times",
      "NYTimes"
    ],
    patterns: [
      "wirecutter",
      "thewirecutter",
      "nytimes",
      "new york times",
      "the new york times"
    ]
  },
  {
    media_group: "BuzzFeed",
    region: "US",
    type: "Media Group",
    publishers: [
      "BuzzFeed",
      "BuzzFeed Shopping",
      "HuffPost"
    ],
    patterns: [
      "buzzfeed",
      "buzz0f",
      "bf-shp",
      "huffpost"
    ]
  },
  {
    media_group: "Pepper",
    region: "Global",
    type: "Deal Community Group",
    publishers: [
      "Mydealz",
      "Dealabs",
      "HotUKDeals",
      "Chollometro",
      "Pepper",
      "Preisjaeger",
      "Pelando"
    ],
    patterns: [
      "mydealz",
      "dealabs",
      "hotukdeals",
      "chollometro",
      "pepper.com",
      "preisjaeger",
      "pelando"
    ]
  },
  {
    media_group: "VerticalScope",
    region: "North America",
    type: "Media / Community Group",
    publishers: [
      "RedFlagDeals",
      "RFD",
      "TheGearPage",
      "AVS Forum"
    ],
    patterns: [
      "redflagdeals",
      "rfd",
      "thegearpage",
      "avsforum",
      "verticalscope"
    ]
  },
  {
    media_group: "Rakuten",
    region: "Global",
    type: "Cashback / Loyalty Group",
    publishers: [
      "Rakuten Rewards",
      "Ebates"
    ],
    patterns: [
      "rakuten",
      "ebates"
    ]
  },
  {
    media_group: "PayPal Honey",
    region: "Global",
    type: "Coupon / Browser Extension",
    publishers: [
      "Honey",
      "PayPal Honey"
    ],
    patterns: [
      "joinhoney",
      "honey",
      "paypal honey"
    ]
  },
  {
    media_group: "Slickdeals",
    region: "US",
    type: "Deal Community",
    publishers: [
      "Slickdeals"
    ],
    patterns: [
      "slickdeals",
      "slickdeals09",
      "slickdeals.net"
    ]
  }
];

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function matchPublisherMediaGroup(input = "") {
  const haystack = normalize(input);
  if (!haystack) return null;

  for (const group of PUBLISHER_MEDIA_GROUPS) {
    const publisherHit = group.publishers.find(pub => haystack.includes(normalize(pub)));
    const patternHit = group.patterns.find(pattern => haystack.includes(normalize(pattern)));

    if (publisherHit || patternHit) {
      return {
        media_group: group.media_group,
        region: group.region,
        group_type: group.type,
        matched_by: "publisher_media_groups",
        matched_publisher: publisherHit || null,
        matched_pattern: patternHit || null,
        confidence: "High"
      };
    }
  }

  return null;
}

function enrichPublisherWithMediaGroup(publisherIntel = {}) {
  const input = [
    publisherIntel.publisher,
    publisherIntel.media_group,
    publisherIntel.type,
    publisherIntel.subtype,
    publisherIntel.matched_pattern
  ].filter(Boolean).join(" ");

  const group = matchPublisherMediaGroup(input);

  if (!group) return publisherIntel;

  return {
    ...publisherIntel,
    media_group: publisherIntel.media_group || group.media_group,
    parent_media_group: group.media_group,
    media_group_region: group.region,
    media_group_type: group.group_type,
    media_group_match: group
  };
}

module.exports = {
  PUBLISHER_MEDIA_GROUPS,
  matchPublisherMediaGroup,
  enrichPublisherWithMediaGroup
};
