/**
 * lib/publisher-rules.js
 * Generic publisher rules for Impact / CJ / Awin / Partnerize / Rakuten / etc.
 * v1.0
 */

const GENERIC_PUBLISHER_RULES = [
  // =========================
  // FUTURE PUBLISHING
  // =========================
  {
    publisher: "Tom's Guide",
    publisher_group: "Future Publishing",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Tech Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/tomsguide/i, /tom's guide/i, /future publishing/i]
  },
  {
    publisher: "TechRadar",
    publisher_group: "Future Publishing",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Tech Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/techradar/i, /future publishing/i]
  },
  {
    publisher: "Tom's Hardware",
    publisher_group: "Future Publishing",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Hardware Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/tomshardware/i, /tom's hardware/i, /future publishing/i]
  },
  {
    publisher: "Marie Claire",
    publisher_group: "Future Publishing",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/marieclaire/i, /future publishing/i]
  },
  {
    publisher: "Woman & Home",
    publisher_group: "Future Publishing",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/womanandhome/i, /woman & home/i, /future publishing/i]
  },
  {
    publisher: "GamesRadar",
    publisher_group: "Future Publishing",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Gaming Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/gamesradar/i, /future publishing/i]
  },

  // =========================
  // HEARST
  // =========================
  {
    publisher: "Best Products",
    publisher_group: "Hearst",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Product Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/bestproducts/i, /best products/i, /hearst/i]
  },
  {
    publisher: "Good Housekeeping",
    publisher_group: "Hearst",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Home / Lifestyle Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/goodhousekeeping/i, /good housekeeping/i, /hearst/i]
  },
  {
    publisher: "Esquire",
    publisher_group: "Hearst",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/esquire/i, /hearst/i]
  },
  {
    publisher: "Cosmopolitan",
    publisher_group: "Hearst",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/cosmopolitan/i, /hearst/i]
  },
  {
    publisher: "Women's Health",
    publisher_group: "Hearst",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Health / Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/womenshealth/i, /women's health/i, /hearst/i]
  },
  {
    publisher: "Men's Health",
    publisher_group: "Hearst",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Health / Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/menshealth/i, /men's health/i, /hearst/i]
  },
  {
    publisher: "Delish",
    publisher_group: "Hearst",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Food / Kitchen Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/delish/i, /hearst/i]
  },
  {
    publisher: "Country Living",
    publisher_group: "Hearst",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Home / Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/countryliving/i, /country living/i, /hearst/i]
  },

  // =========================
  // DOTDASH MEREDITH
  // =========================
  {
    publisher: "People",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Content",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/people/i, /dotdash/i, /meredith/i]
  },
  {
    publisher: "The Spruce",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Home Content",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/thespruce/i, /the spruce/i, /dotdash/i, /meredith/i]
  },
  {
    publisher: "Verywell",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Health Content",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/verywell/i, /dotdash/i, /meredith/i]
  },
  {
    publisher: "Travel + Leisure",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Travel Content",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/travelandleisure/i, /travel \+ leisure/i, /dotdash/i, /meredith/i]
  },
  {
    publisher: "Food & Wine",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Content",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/foodandwine/i, /food & wine/i, /dotdash/i, /meredith/i]
  },
  {
    publisher: "Real Simple",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Content",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/realsimple/i, /real simple/i, /dotdash/i, /meredith/i]
  },
  {
    publisher: "Better Homes & Gardens",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Home Content",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/betterhomesandgardens/i, /better homes & gardens/i, /dotdash/i, /meredith/i]
  },
  {
    publisher: "InStyle",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Style / Fashion Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/instyle/i, /dotdash/i, /meredith/i]
  },
  {
    publisher: "Southern Living",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle / Home Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/southernliving/i, /southern living/i, /dotdash/i, /meredith/i]
  },
  {
    publisher: "Parents",
    publisher_group: "Dotdash Meredith",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Family / Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/parents/i, /dotdash/i, /meredith/i]
  },

  // =========================
  // VOX MEDIA
  // =========================
  {
    publisher: "The Strategist",
    publisher_group: "Vox Media",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/thestrategist/i, /the strategist/i, /nymag/i, /new york magazine/i]
  },
  {
    publisher: "The Verge",
    publisher_group: "Vox Media",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Tech Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/theverge/i, /the verge/i, /vox/i]
  },
  {
    publisher: "Eater",
    publisher_group: "Vox Media",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Food / Kitchen Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/eater/i, /vox/i]
  },
  {
    publisher: "New York Magazine",
    publisher_group: "Vox Media",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/nymag/i, /new york magazine/i, /vox/i]
  },
  {
    publisher: "Polygon",
    publisher_group: "Vox Media",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Gaming Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/polygon/i, /vox/i]
  },

  // =========================
  // ZIFF DAVIS / RED VENTURES / RELATED
  // =========================
  {
    publisher: "CNET",
    publisher_group: "Ziff Davis / Red Ventures",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Tech Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/cnet/i]
  },
  {
    publisher: "PCMag",
    publisher_group: "Ziff Davis",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Tech Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/pcmag/i, /ziff davis/i]
  },
  {
    publisher: "Mashable",
    publisher_group: "Ziff Davis",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Tech / Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/mashable/i, /ziff davis/i]
  },
  {
    publisher: "Lifehacker",
    publisher_group: "Ziff Davis",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Utility / Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/lifehacker/i, /ziff davis/i]
  },
  {
    publisher: "IGN",
    publisher_group: "Ziff Davis",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Gaming Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/ign/i, /ziff davis/i]
  },
  {
    publisher: "Healthline",
    publisher_group: "Red Ventures",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Health Content",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/healthline/i, /red ventures/i]
  },
  {
    publisher: "Bankrate",
    publisher_group: "Red Ventures",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Finance Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium-Low",
    matchers: [/bankrate/i, /red ventures/i]
  },
  {
    publisher: "The Points Guy",
    publisher_group: "Red Ventures",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Travel / Finance Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium-Low",
    matchers: [/thepointsguy/i, /the points guy/i, /red ventures/i]
  },
  {
    publisher: "CreditCards.com",
    publisher_group: "Red Ventures",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Finance Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium-Low",
    matchers: [/creditcards\.com/i, /creditcardscom/i, /red ventures/i]
  },

  // =========================
  // NEWS / EDITORIAL COMMERCE
  // =========================
  {
    publisher: "CNN Underscored",
    publisher_group: "CNN",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Editorial Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/cnnunderscored/i, /underscored/i]
  },
  {
    publisher: "Forbes",
    publisher_group: "Forbes",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Editorial Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium-Low",
    matchers: [/forbes/i]
  },
  {
    publisher: "Business Insider",
    publisher_group: "Insider",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Editorial Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/businessinsider/i, /insiderreviews/i, /insider/i]
  },
  {
    publisher: "USA Today",
    publisher_group: "Gannett",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Editorial Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/usatoday/i, /usa today/i, /gannett/i]
  },
  {
    publisher: "Newsweek",
    publisher_group: "Newsweek",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Editorial Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium-Low",
    matchers: [/newsweek/i]
  },
  {
    publisher: "TIME",
    publisher_group: "TIME",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Editorial Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium-Low",
    matchers: [/time/i]
  },
  {
    publisher: "Fortune",
    publisher_group: "Fortune",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Editorial Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium-Low",
    matchers: [/fortune/i]
  },
  {
    publisher: "The New York Post",
    publisher_group: "New York Post",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Editorial Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/nypost/i, /new york post/i]
  },
  {
    publisher: "BuzzFeed",
    publisher_group: "BuzzFeed",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Listicle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Assist",
    incrementality_risk: "Medium",
    matchers: [/buzzfeed/i]
  },
  {
    publisher: "Reviewed",
    publisher_group: "Reviewed / Gannett",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Product Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/reviewed/i]
  },
  {
    publisher: "Wirecutter",
    publisher_group: "The New York Times",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Product Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/wirecutter/i, /nytimeswirecutter/i]
  },

  // =========================
  // VERTICAL REVIEW / SLEEP
  // =========================
  {
    publisher: "Sleep Foundation",
    publisher_group: "Sleep Foundation",
    type: "Niche Review Media",
    media_group: "Vertical Editorial",
    subtype: "Sleep Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/sleepfoundation/i, /sleep foundation/i]
  },
  {
    publisher: "Mattress Clarity",
    publisher_group: "Mattress Clarity",
    type: "Niche Review Media",
    media_group: "Vertical Editorial",
    subtype: "Mattress Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/mattressclarity/i, /mattress clarity/i]
  },
  {
    publisher: "Sleepopolis",
    publisher_group: "Sleepopolis",
    type: "Niche Review Media",
    media_group: "Vertical Editorial",
    subtype: "Mattress Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/sleepopolis/i]
  },
  {
    publisher: "Mattress Nerd",
    publisher_group: "Mattress Nerd",
    type: "Niche Review Media",
    media_group: "Vertical Editorial",
    subtype: "Mattress Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/mattressnerd/i, /mattress nerd/i]
  },
  {
    publisher: "NapLab",
    publisher_group: "NapLab",
    type: "Niche Review Media",
    media_group: "Vertical Editorial",
    subtype: "Mattress Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/naplab/i]
  },
  {
    publisher: "Slumber Yard",
    publisher_group: "Slumber Yard",
    type: "Niche Review Media",
    media_group: "Vertical Editorial",
    subtype: "Mattress Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/slumberyard/i, /slumber yard/i]
  },
  {
    publisher: "RTINGS",
    publisher_group: "RTINGS",
    type: "Review Media",
    media_group: "Vertical Editorial",
    subtype: "Lab Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/rtings/i]
  },

  // =========================
  // DEAL / COUPON / CASHBACK
  // =========================
  {
    publisher: "Slickdeals",
    publisher_group: "Slickdeals",
    type: "Deal Community",
    media_group: "Coupons & Deals",
    subtype: "Forum Deal",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/slickdeals/i]
  },
  {
    publisher: "DealNews",
    publisher_group: "DealNews",
    type: "Deal Publisher",
    media_group: "Coupons & Deals",
    subtype: "Editorial Deal",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/dealnews/i]
  },
  {
    publisher: "TechBargains",
    publisher_group: "TechBargains",
    type: "Deal Publisher",
    media_group: "Coupons & Deals",
    subtype: "Tech Deals",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/techbargains/i]
  },
  {
    publisher: "Brad's Deals",
    publisher_group: "Brad's Deals",
    type: "Deal Publisher",
    media_group: "Coupons & Deals",
    subtype: "Editorial Deal",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/bradsdeals/i, /brad's deals/i]
  },
  {
    publisher: "Offers.com",
    publisher_group: "Offers.com",
    type: "Deal Publisher",
    media_group: "Coupons & Deals",
    subtype: "Coupon / Deal",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/offers\.com/i, /offerscom/i]
  },
  {
    publisher: "CouponFollow",
    publisher_group: "CouponFollow",
    type: "Coupon Publisher",
    media_group: "Coupons & Deals",
    subtype: "Coupon",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/couponfollow/i]
  },
  {
    publisher: "CouponBirds",
    publisher_group: "CouponBirds",
    type: "Coupon Publisher",
    media_group: "Coupons & Deals",
    subtype: "Coupon",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/couponbirds/i]
  },
  {
    publisher: "RetailMeNot",
    publisher_group: "RetailMeNot",
    type: "Coupon Publisher",
    media_group: "Coupons & Deals",
    subtype: "Coupon",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/retailmenot/i]
  },
  {
    publisher: "TopCashback",
    publisher_group: "TopCashback",
    type: "Cashback / Rewards",
    media_group: "Rewards",
    subtype: "Cashback",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/topcashback/i]
  },
  {
    publisher: "BeFrugal",
    publisher_group: "BeFrugal",
    type: "Cashback / Rewards",
    media_group: "Rewards",
    subtype: "Cashback",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/befrugal/i]
  },
  {
    publisher: "Extrabux",
    publisher_group: "Extrabux",
    type: "Cashback / Rewards",
    media_group: "Rewards",
    subtype: "Cashback",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/extrabux/i]
  },
  {
    publisher: "Mr. Rebates",
    publisher_group: "Mr. Rebates",
    type: "Cashback / Rewards",
    media_group: "Rewards",
    subtype: "Cashback",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/mrrebates/i]
  },
  {
    publisher: "Rakuten",
    publisher_group: "Rakuten",
    type: "Cashback / Rewards",
    media_group: "Rewards",
    subtype: "Cashback",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/rakuten/i]
  },
  {
    publisher: "Capital One Shopping",
    publisher_group: "Capital One Shopping",
    type: "Coupon / Browser Extension",
    media_group: "Coupons & Deals",
    subtype: "Browser Commerce",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/capitaloneshopping/i, /wikibuy/i]
  },
  {
    publisher: "Honey",
    publisher_group: "PayPal Honey",
    type: "Coupon / Browser Extension",
    media_group: "Coupons & Deals",
    subtype: "Browser Commerce",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/honey/i, /joinhoney/i]
  },
  {
    publisher: "CouponCabin",
    publisher_group: "CouponCabin",
    type: "Coupon Publisher",
    media_group: "Coupons & Deals",
    subtype: "Coupon",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/couponcabin/i]
  },
  {
    publisher: "DontPayFull",
    publisher_group: "DontPayFull",
    type: "Coupon Publisher",
    media_group: "Coupons & Deals",
    subtype: "Coupon",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/dontpayfull/i]
  },
  {
    publisher: "PromoCodes",
    publisher_group: "PromoCodes",
    type: "Coupon Publisher",
    media_group: "Coupons & Deals",
    subtype: "Coupon",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/promocodes/i]
  },
  {
    publisher: "DealSea",
    publisher_group: "DealSea",
    type: "Deal Publisher",
    media_group: "Coupons & Deals",
    subtype: "Forum Deal",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/dealsea/i]
  },
  {
    publisher: "Ben's Bargains",
    publisher_group: "Ben's Bargains",
    type: "Deal Publisher",
    media_group: "Coupons & Deals",
    subtype: "Editorial Deal",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/bensbargains/i, /ben's bargains/i]
  },
  {
    publisher: "Wethrift",
    publisher_group: "Wethrift",
    type: "Coupon Publisher",
    media_group: "Coupons & Deals",
    subtype: "Coupon",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/wethrift/i]
  },
  {
    publisher: "Hip2Save",
    publisher_group: "Hip2Save",
    type: "Deal Publisher",
    media_group: "Coupons & Deals",
    subtype: "Lifestyle Deal",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/hip2save/i]
  },
  {
    publisher: "The Krazy Coupon Lady",
    publisher_group: "The Krazy Coupon Lady",
    type: "Deal Publisher",
    media_group: "Coupons & Deals",
    subtype: "Coupon Content",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/thekrazycouponlady/i, /krazy coupon lady/i]
  },
  {
    publisher: "Dealspotr",
    publisher_group: "Dealspotr",
    type: "Deal Community",
    media_group: "Coupons & Deals",
    subtype: "UGC Deal",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/dealspotr/i]
  },
  {
    publisher: "Goodshop",
    publisher_group: "Goodshop",
    type: "Coupon / Rewards",
    media_group: "Rewards",
    subtype: "Coupon / Charity",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/goodsearch/i, /goodshop/i]
  },
  {
    publisher: "Swagbucks",
    publisher_group: "Prodege",
    type: "Rewards Publisher",
    media_group: "Rewards",
    subtype: "Points / Cashback",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/swagbucks/i]
  },
  {
    publisher: "MyPoints",
    publisher_group: "Prodege",
    type: "Rewards Publisher",
    media_group: "Rewards",
    subtype: "Points / Cashback",
    traffic_type: "Coupon / Deal",
    channel_role: "Closer",
    incrementality_risk: "High",
    matchers: [/mypoints/i]
  },

  // =========================
  // CREATOR / SOCIAL / INFLUENCER
  // =========================
  {
    publisher: "YouTube Creator",
    publisher_group: "YouTube",
    type: "Influencer / Creator",
    media_group: "Creator Economy",
    subtype: "YouTube",
    traffic_type: "Creator Recommendation",
    channel_role: "Influencer",
    incrementality_risk: "Medium",
    matchers: [/youtube/i, /\byt\b/i]
  },
  {
    publisher: "TikTok Creator",
    publisher_group: "TikTok",
    type: "Influencer / Creator",
    media_group: "Creator Economy",
    subtype: "TikTok",
    traffic_type: "Creator Recommendation",
    channel_role: "Influencer",
    incrementality_risk: "Medium",
    matchers: [/tiktok/i, /\btt\b/i]
  },
  {
    publisher: "Instagram Creator",
    publisher_group: "Instagram",
    type: "Influencer / Creator",
    media_group: "Creator Economy",
    subtype: "Instagram",
    traffic_type: "Creator Recommendation",
    channel_role: "Influencer",
    incrementality_risk: "Medium",
    matchers: [/instagram/i, /\big\b/i]
  },
  {
    publisher: "Facebook Creator / Page",
    publisher_group: "Facebook",
    type: "Influencer / Creator",
    media_group: "Creator Economy",
    subtype: "Facebook",
    traffic_type: "Creator Recommendation",
    channel_role: "Influencer",
    incrementality_risk: "Medium",
    matchers: [/facebook/i, /\bfb\b/i]
  },
  {
    publisher: "Pinterest Creator",
    publisher_group: "Pinterest",
    type: "Influencer / Creator",
    media_group: "Creator Economy",
    subtype: "Pinterest",
    traffic_type: "Creator Recommendation",
    channel_role: "Influencer",
    incrementality_risk: "Medium",
    matchers: [/pinterest/i, /\bpin\b/i]
  },
  {
    publisher: "Creator Link Hub",
    publisher_group: "Link Hub",
    type: "Influencer / Creator",
    media_group: "Creator Economy",
    subtype: "Link Hub",
    traffic_type: "Creator Recommendation",
    channel_role: "Influencer",
    incrementality_risk: "Medium",
    matchers: [/linkinbio/i, /beacons/i, /linktree/i, /later/i]
  },
  {
    publisher: "ShopMy Creator",
    publisher_group: "ShopMy",
    type: "Influencer / Creator",
    media_group: "Creator Economy",
    subtype: "Creator Storefront",
    traffic_type: "Creator Recommendation",
    channel_role: "Influencer",
    incrementality_risk: "Medium",
    matchers: [/shopmy/i]
  },
  {
    publisher: "LTK Creator",
    publisher_group: "LTK",
    type: "Influencer / Creator",
    media_group: "Creator Economy",
    subtype: "Influencer Commerce",
    traffic_type: "Creator Recommendation",
    channel_role: "Influencer",
    incrementality_risk: "Medium",
    matchers: [/\bltk\b/i, /liketoknowit/i]
  },

  // =========================
  // COMMUNITY / BLOG / NEWSLETTER
  // =========================
  {
    publisher: "Reddit",
    publisher_group: "Reddit",
    type: "Community / Forum",
    media_group: "Community",
    subtype: "Forum",
    traffic_type: "Community / Word-of-Mouth",
    channel_role: "Assist",
    incrementality_risk: "Medium",
    matchers: [/reddit/i]
  },
  {
    publisher: "Quora",
    publisher_group: "Quora",
    type: "Community / Forum",
    media_group: "Community",
    subtype: "Q&A",
    traffic_type: "Community / Word-of-Mouth",
    channel_role: "Assist",
    incrementality_risk: "Medium",
    matchers: [/quora/i]
  },
  {
    publisher: "Medium",
    publisher_group: "Medium",
    type: "Blog / UGC",
    media_group: "Community",
    subtype: "Article Platform",
    traffic_type: "Newsletter / Blog",
    channel_role: "Assist",
    incrementality_risk: "Medium-Low",
    matchers: [/medium/i]
  },
  {
    publisher: "Substack",
    publisher_group: "Substack",
    type: "Newsletter / Creator",
    media_group: "Creator Economy",
    subtype: "Newsletter",
    traffic_type: "Newsletter / Blog",
    channel_role: "Assist",
    incrementality_risk: "Medium-Low",
    matchers: [/substack/i]
  },

  // =========================
  // SUBNETWORK / ROUTING / TECH
  // =========================
  {
    publisher: "Skimlinks",
    publisher_group: "Skimlinks",
    type: "Subnetwork / Commerce Routing",
    media_group: "Subnetwork",
    subtype: "Commerce Routing",
    traffic_type: "Routing / Monetization Layer",
    channel_role: "Routing Layer",
    incrementality_risk: "Medium-High",
    matchers: [/skimlinks/i, /\bskm\b/i]
  },
  {
    publisher: "Sovrn / VigLink",
    publisher_group: "Sovrn",
    type: "Subnetwork / Commerce Routing",
    media_group: "Subnetwork",
    subtype: "Commerce Routing",
    traffic_type: "Routing / Monetization Layer",
    channel_role: "Routing Layer",
    incrementality_risk: "Medium-High",
    matchers: [/vglnk/i, /vgtid/i, /viglink/i, /sovrn/i]
  },
  {
    publisher: "FlexOffers",
    publisher_group: "FlexOffers",
    type: "Subnetwork / Affiliate Platform",
    media_group: "Subnetwork",
    subtype: "Affiliate Routing",
    traffic_type: "Routing / Monetization Layer",
    channel_role: "Routing Layer",
    incrementality_risk: "Medium-High",
    matchers: [/flexoffers/i, /\bfaid\b/i, /\bfobs\b/i]
  },
  {
    publisher: "Everflow",
    publisher_group: "Everflow",
    type: "Tracking / Partner Platform",
    media_group: "Tracking Infrastructure",
    subtype: "Partner Tracking",
    traffic_type: "Routing / Tracking Layer",
    channel_role: "Tracking Layer",
    incrementality_risk: "Medium",
    matchers: [/everflow/i]
  },
  {
    publisher: "TUNE",
    publisher_group: "TUNE",
    type: "Tracking / Partner Platform",
    media_group: "Tracking Infrastructure",
    subtype: "Partner Tracking",
    traffic_type: "Routing / Tracking Layer",
    channel_role: "Tracking Layer",
    incrementality_risk: "Medium",
    matchers: [/tune/i, /hasoffers/i]
  },
  {
    publisher: "PartnerBoost",
    publisher_group: "PartnerBoost",
    type: "Affiliate Platform / Creator Network",
    media_group: "Subnetwork",
    subtype: "Affiliate Routing",
    traffic_type: "Routing / Monetization Layer",
    channel_role: "Routing Layer",
    incrementality_risk: "Medium-High",
    matchers: [/partnerboost/i, /\bpb_id\b/i, /\bpb_clickid\b/i, /\bpb_source\b/i]
  },

  // =========================
  // LARGE NETWORK-ADJACENT PUBLISHERS / OTHERS
  // =========================
  {
    publisher: "AOL",
    publisher_group: "Yahoo",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle / News Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Assist",
    incrementality_risk: "Medium-Low",
    matchers: [/aol/i, /yahoo/i]
  },
  {
    publisher: "NerdWallet",
    publisher_group: "NerdWallet",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Finance Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium-Low",
    matchers: [/nerdwallet/i]
  },
  {
    publisher: "Buy Side from WSJ",
    publisher_group: "The Wall Street Journal",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Commerce Editorial",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium-Low",
    matchers: [/buyside/i, /wsj/i, /wall street journal/i]
  },
  {
    publisher: "ConsumerSearch",
    publisher_group: "ConsumerSearch",
    type: "Review Media",
    media_group: "Commerce Editorial",
    subtype: "Product Reviews",
    traffic_type: "Review / Consideration",
    channel_role: "Mid-funnel Influencer",
    incrementality_risk: "Medium",
    matchers: [/consumersearch/i]
  },
  {
    publisher: "Apartment Therapy",
    publisher_group: "Apartment Therapy Media",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Home Content",
    traffic_type: "Review / Consideration",
    channel_role: "Assist",
    incrementality_risk: "Medium-Low",
    matchers: [/apartmenttherapy/i, /apartment therapy/i]
  },
  {
    publisher: "Kitchn",
    publisher_group: "Apartment Therapy Media",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Food / Kitchen Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Assist",
    incrementality_risk: "Medium-Low",
    matchers: [/thekitchn/i, /\bkitchn\b/i]
  },
  {
    publisher: "House Beautiful",
    publisher_group: "Hearst",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Home Content",
    traffic_type: "Review / Consideration",
    channel_role: "Assist",
    incrementality_risk: "Medium-Low",
    matchers: [/housebeautiful/i, /house beautiful/i, /hearst/i]
  },
  {
    publisher: "PureWow",
    publisher_group: "Gallery Media Group",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Assist",
    incrementality_risk: "Medium-Low",
    matchers: [/purewow/i]
  },
  {
    publisher: "Scary Mommy",
    publisher_group: "BDG",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Family / Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Assist",
    incrementality_risk: "Medium-Low",
    matchers: [/scarymommy/i, /scary mommy/i]
  },
  {
    publisher: "Bustle",
    publisher_group: "BDG",
    type: "Editorial Commerce",
    media_group: "Commerce Editorial",
    subtype: "Lifestyle Commerce",
    traffic_type: "Review / Consideration",
    channel_role: "Assist",
    incrementality_risk: "Medium-Low",
    matchers: [/bustle/i]
  }
];

module.exports = { GENERIC_PUBLISHER_RULES };
