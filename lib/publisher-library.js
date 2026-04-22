// /lib/publisher-library.js

const PUBLISHER_LIBRARY_V1 = [
  // =========================
  // Deal / Coupon
  // =========================
  {
    slug: "slickdeals",
    name: "Slickdeals",
    type: "Deal / Coupon",
    aliases: ["slick deals", "sd"],
    domains: ["slickdeals.net"],
    keywords: ["slickdeals", "slickdeals09", "slickdeals-20", "sd"],
    impactIds: [],
    notes: "Major US deal forum / commerce publisher."
  },
  {
    slug: "dealnews",
    name: "DealNews",
    type: "Deal / Coupon",
    aliases: ["deal news"],
    domains: ["dealnews.com"],
    keywords: ["dealnews"],
    impactIds: [],
    notes: "Deal aggregation publisher."
  },
  {
    slug: "bradsdeals",
    name: "Brad's Deals",
    type: "Deal / Coupon",
    aliases: ["brads deals", "bradsdeals"],
    domains: ["bradsdeals.com"],
    keywords: ["bradsdeals", "brads deals"],
    impactIds: [],
    notes: "Coupon / deal publisher."
  },
  {
    slug: "offerscom",
    name: "Offers.com",
    type: "Deal / Coupon",
    aliases: ["offers"],
    domains: ["offers.com"],
    keywords: ["offers.com", "offerscom"],
    impactIds: [],
    notes: "Coupon / offers publisher."
  },
  {
    slug: "couponcabin",
    name: "CouponCabin",
    type: "Deal / Coupon",
    aliases: ["coupon cabin"],
    domains: ["couponcabin.com"],
    keywords: ["couponcabin", "coupon cabin"],
    impactIds: [],
    notes: "Coupon / cashback oriented."
  },
  {
    slug: "retailmenot",
    name: "RetailMeNot",
    type: "Deal / Coupon",
    aliases: ["retail me not"],
    domains: ["retailmenot.com"],
    keywords: ["retailmenot", "retail me not"],
    impactIds: [],
    notes: "Major coupon platform."
  },
  {
    slug: "couponfollow",
    name: "CouponFollow",
    type: "Deal / Coupon",
    aliases: ["coupon follow"],
    domains: ["couponfollow.com"],
    keywords: ["couponfollow"],
    impactIds: [],
    notes: "Coupon publisher."
  },
  {
    slug: "promocodescom",
    name: "PromoCodes.com",
    type: "Deal / Coupon",
    aliases: ["promocodes"],
    domains: ["promocodes.com"],
    keywords: ["promocodes", "promo codes"],
    impactIds: [],
    notes: "Coupon / promo codes site."
  },
  {
    slug: "hip2save",
    name: "Hip2Save",
    type: "Deal / Coupon",
    aliases: ["hip to save"],
    domains: ["hip2save.com"],
    keywords: ["hip2save"],
    impactIds: [],
    notes: "Deal / savings publisher."
  },
  {
    slug: "benbargains",
    name: "Ben's Bargains",
    type: "Deal / Coupon",
    aliases: ["bens bargains", "ben's bargains"],
    domains: ["bensbargains.com"],
    keywords: ["bensbargains", "ben's bargains"],
    impactIds: [],
    notes: "Deal forum / aggregator."
  },
  {
    slug: "thekrazycouponlady",
    name: "The Krazy Coupon Lady",
    type: "Deal / Coupon",
    aliases: ["krazy coupon lady", "kcl"],
    domains: ["thekrazycouponlady.com"],
    keywords: ["krazycouponlady", "thekrazycouponlady", "kcl"],
    impactIds: [],
    notes: "Coupon / household savings publisher."
  },
  {
    slug: "wethrift",
    name: "Wethrift",
    type: "Deal / Coupon",
    aliases: ["we thrift"],
    domains: ["wethrift.com"],
    keywords: ["wethrift"],
    impactIds: [],
    notes: "Coupon / discount publisher."
  },
  {
    slug: "dontpayfull",
    name: "DontPayFull",
    type: "Deal / Coupon",
    aliases: ["don't pay full", "dont pay full"],
    domains: ["dontpayfull.com"],
    keywords: ["dontpayfull"],
    impactIds: [],
    notes: "Coupon publisher."
  },
  {
    slug: "couponbirds",
    name: "CouponBirds",
    type: "Deal / Coupon",
    aliases: ["coupon birds"],
    domains: ["couponbirds.com"],
    keywords: ["couponbirds"],
    impactIds: [],
    notes: "Coupon publisher."
  },
  {
    slug: "couponcause",
    name: "CouponCause",
    type: "Deal / Coupon",
    aliases: ["coupon cause"],
    domains: ["couponcause.com"],
    keywords: ["couponcause"],
    impactIds: [],
    notes: "Coupon publisher."
  },
  {
    slug: "givingassistant",
    name: "Giving Assistant",
    type: "Deal / Coupon",
    aliases: ["givingassistant"],
    domains: ["givingassistant.org", "givingassistant.com"],
    keywords: ["givingassistant"],
    impactIds: [],
    notes: "Coupon / shopping rewards hybrid."
  },
  {
    slug: "rakuten-coupons",
    name: "Rakuten Coupons",
    type: "Deal / Coupon",
    aliases: ["rakuten deals"],
    domains: ["rakuten.com"],
    keywords: ["rakuten coupon", "rakuten deals"],
    impactIds: [],
    notes: "May overlap with cashback / loyalty."
  },
  {
    slug: "savingscom",
    name: "Savings.com",
    type: "Deal / Coupon",
    aliases: ["savings"],
    domains: ["savings.com"],
    keywords: ["savings.com"],
    impactIds: [],
    notes: "Coupon publisher."
  },
  {
    slug: "dealighted",
    name: "Dealiighted",
    type: "Deal / Coupon",
    aliases: ["dealighted"],
    domains: ["dealighted.com"],
    keywords: ["dealighted"],
    impactIds: [],
    notes: "Coupon / savings site."
  },
  {
    slug: "couponchief",
    name: "CouponChief",
    type: "Deal / Coupon",
    aliases: ["coupon chief"],
    domains: ["couponchief.com"],
    keywords: ["couponchief"],
    impactIds: [],
    notes: "Coupon publisher."
  },

  // =========================
  // Cashback / Loyalty / Rewards
  // =========================
  {
    slug: "topcashback",
    name: "TopCashback",
    type: "Cashback / Loyalty",
    aliases: ["top cashback"],
    domains: ["topcashback.com", "topcashback.co.uk"],
    keywords: ["topcashback", "top cashback"],
    impactIds: [],
    notes: "Major cashback publisher."
  },
  {
    slug: "rakuten-rewards",
    name: "Rakuten Rewards",
    type: "Cashback / Loyalty",
    aliases: ["ebates", "rakuten"],
    domains: ["rakuten.com"],
    keywords: ["rakuten rewards", "ebates"],
    impactIds: [],
    notes: "Cashback / loyalty."
  },
  {
    slug: "capital-one-shopping",
    name: "Capital One Shopping",
    type: "Cashback / Loyalty",
    aliases: ["wikibuy", "capitaloneshopping"],
    domains: ["capitaloneshopping.com"],
    keywords: ["capitaloneshopping", "capital one shopping", "wikibuy"],
    impactIds: [],
    notes: "Cashback / shopping rewards."
  },
  {
    slug: "honey",
    name: "Honey",
    type: "Cashback / Loyalty",
    aliases: ["paypal honey"],
    domains: ["joinhoney.com"],
    keywords: ["honey", "joinhoney"],
    impactIds: [],
    notes: "Coupon extension / rewards."
  },
  {
    slug: "retailmenot-rewards",
    name: "RetailMeNot Rewards",
    type: "Cashback / Loyalty",
    aliases: ["retailmenot cash back"],
    domains: ["retailmenot.com"],
    keywords: ["retailmenot cashback", "retailmenot rewards"],
    impactIds: [],
    notes: "Can overlap with coupon classification."
  },
  {
    slug: "befrugal",
    name: "BeFrugal",
    type: "Cashback / Loyalty",
    aliases: ["be frugal"],
    domains: ["befrugal.com"],
    keywords: ["befrugal"],
    impactIds: [],
    notes: "Cashback publisher."
  },
  {
    slug: "extrabux",
    name: "Extrabux",
    type: "Cashback / Loyalty",
    aliases: ["extra bux"],
    domains: ["extrabux.com"],
    keywords: ["extrabux"],
    impactIds: [],
    notes: "Cashback site."
  },
  {
    slug: "mrrebates",
    name: "Mr. Rebates",
    type: "Cashback / Loyalty",
    aliases: ["mr rebates", "mrrebates"],
    domains: ["mrrebates.com"],
    keywords: ["mrrebates"],
    impactIds: [],
    notes: "Cashback publisher."
  },
  {
    slug: "swagbucks",
    name: "Swagbucks",
    type: "Cashback / Loyalty",
    aliases: ["sb"],
    domains: ["swagbucks.com"],
    keywords: ["swagbucks"],
    impactIds: [],
    notes: "Rewards / cashback."
  },
  {
    slug: "mypoints",
    name: "MyPoints",
    type: "Cashback / Loyalty",
    aliases: ["mypoints"],
    domains: ["mypoints.com"],
    keywords: ["mypoints"],
    impactIds: [],
    notes: "Rewards / loyalty."
  },
  {
    slug: "shopathome",
    name: "ShopAtHome",
    type: "Cashback / Loyalty",
    aliases: ["shop at home"],
    domains: ["shopathome.com"],
    keywords: ["shopathome"],
    impactIds: [],
    notes: "Legacy cashback publisher."
  },
  {
    slug: "shopback",
    name: "ShopBack",
    type: "Cashback / Loyalty",
    aliases: ["shop back"],
    domains: ["shopback.com"],
    keywords: ["shopback"],
    impactIds: [],
    notes: "Cashback / APAC presence."
  },
  {
    slug: "quidco",
    name: "Quidco",
    type: "Cashback / Loyalty",
    aliases: ["quidco"],
    domains: ["quidco.com"],
    keywords: ["quidco"],
    impactIds: [],
    notes: "UK cashback publisher."
  },
  {
    slug: "upromise",
    name: "Upromise",
    type: "Cashback / Loyalty",
    aliases: ["upromise"],
    domains: ["upromise.com"],
    keywords: ["upromise"],
    impactIds: [],
    notes: "Rewards publisher."
  },
  {
    slug: "lolli",
    name: "Lolli",
    type: "Cashback / Loyalty",
    aliases: ["lolli rewards"],
    domains: ["lolli.com"],
    keywords: ["lolli"],
    impactIds: [],
    notes: "Bitcoin rewards / shopping."
  },

  // =========================
  // Review / Editorial / Commerce Content
  // =========================
  {
    slug: "cnet",
    name: "CNET",
    type: "Review / Editorial",
    aliases: ["c net"],
    domains: ["cnet.com"],
    keywords: ["cnet", "cnetcommerce"],
    impactIds: [],
    notes: "Major editorial commerce publisher."
  },
  {
    slug: "cnn-underscored",
    name: "CNN Underscored",
    type: "Review / Editorial",
    aliases: ["cnn underscored", "underscored"],
    domains: ["cnn.com"],
    keywords: ["underscored", "cnn underscored"],
    impactIds: [],
    notes: "Commerce editorial."
  },
  {
    slug: "business-insider",
    name: "Business Insider",
    type: "Review / Editorial",
    aliases: ["insider", "businessinsider"],
    domains: ["businessinsider.com", "insider.com"],
    keywords: ["businessinsider", "insider reviews", "business insider"],
    impactIds: [],
    notes: "Editorial / reviews / commerce content."
  },
  {
    slug: "forbes-vetted",
    name: "Forbes Vetted",
    type: "Review / Editorial",
    aliases: ["forbes", "vetted"],
    domains: ["forbes.com"],
    keywords: ["forbes vetted", "forbes"],
    impactIds: [],
    notes: "Commerce editorial."
  },
  {
    slug: "wirecutter",
    name: "Wirecutter",
    type: "Review / Editorial",
    aliases: ["nyt wirecutter", "new york times wirecutter"],
    domains: ["nytimes.com", "thewirecutter.com"],
    keywords: ["wirecutter"],
    impactIds: [],
    notes: "Commerce editorial."
  },
  {
    slug: "toms-guide",
    name: "Tom's Guide",
    type: "Review / Editorial",
    aliases: ["toms guide", "tomsguide"],
    domains: ["tomsguide.com"],
    keywords: ["tomsguide", "toms guide"],
    impactIds: [],
    notes: "Tech / home review site."
  },
  {
    slug: "techradar",
    name: "TechRadar",
    type: "Review / Editorial",
    aliases: ["tech radar"],
    domains: ["techradar.com"],
    keywords: ["techradar"],
    impactIds: [],
    notes: "Review / editorial."
  },
  {
    slug: "pcmag",
    name: "PCMag",
    type: "Review / Editorial",
    aliases: ["pc mag"],
    domains: ["pcmag.com"],
    keywords: ["pcmag"],
    impactIds: [],
    notes: "Editorial / reviews."
  },
  {
    slug: "good-housekeeping",
    name: "Good Housekeeping",
    type: "Review / Editorial",
    aliases: ["good housekeeping institute"],
    domains: ["goodhousekeeping.com"],
    keywords: ["goodhousekeeping", "good housekeeping"],
    impactIds: [],
    notes: "Home / lifestyle review publisher."
  },
  {
    slug: "the-spruce",
    name: "The Spruce",
    type: "Review / Editorial",
    aliases: ["spruce"],
    domains: ["thespruce.com"],
    keywords: ["thespruce", "the spruce"],
    impactIds: [],
    notes: "Home / lifestyle content."
  },
  {
    slug: "bob-vila",
    name: "Bob Vila",
    type: "Review / Editorial",
    aliases: ["bobvila"],
    domains: ["bobvila.com"],
    keywords: ["bobvila", "bob vila"],
    impactIds: [],
    notes: "Home / tools review content."
  },
  {
    slug: "sleep-foundation",
    name: "Sleep Foundation",
    type: "Review / Editorial",
    aliases: ["sleepfoundation"],
    domains: ["sleepfoundation.org"],
    keywords: ["sleepfoundation", "sleep foundation"],
    impactIds: [],
    notes: "Mattress / sleep review publisher."
  },
  {
    slug: "mattress-nerd",
    name: "Mattress Nerd",
    type: "Review / Editorial",
    aliases: ["mattressnerd"],
    domains: ["mattressnerd.com"],
    keywords: ["mattressnerd", "mattress nerd"],
    impactIds: [],
    notes: "Mattress review site."
  },
  {
    slug: "sleepopolis",
    name: "Sleepopolis",
    type: "Review / Editorial",
    aliases: ["sleep opolis"],
    domains: ["sleepopolis.com"],
    keywords: ["sleepopolis"],
    impactIds: [],
    notes: "Mattress / sleep reviews."
  },
  {
    slug: "tuck",
    name: "Tuck",
    type: "Review / Editorial",
    aliases: ["tuck sleep"],
    domains: ["tuck.com", "tucksleep.com"],
    keywords: ["tuck", "tuck sleep"],
    impactIds: [],
    notes: "Sleep review publisher."
  },
  {
    slug: "us-news-360-reviews",
    name: "U.S. News 360 Reviews",
    type: "Review / Editorial",
    aliases: ["us news reviews", "360 reviews"],
    domains: ["usnews.com"],
    keywords: ["360 reviews", "us news reviews"],
    impactIds: [],
    notes: "Editorial / reviews."
  },
  {
    slug: "consumer-reports",
    name: "Consumer Reports",
    type: "Review / Editorial",
    aliases: ["consumerreports"],
    domains: ["consumerreports.org"],
    keywords: ["consumerreports", "consumer reports"],
    impactIds: [],
    notes: "Testing / review brand."
  },
  {
    slug: "the-inventory",
    name: "The Inventory",
    type: "Review / Editorial",
    aliases: ["inventory"],
    domains: ["theinventory.com"],
    keywords: ["theinventory", "inventory deals"],
    impactIds: [],
    notes: "Commerce content / deal editorial."
  },
  {
    slug: "buzzfeed",
    name: "BuzzFeed",
    type: "Review / Editorial",
    aliases: ["buzz feed", "buzzfeed shopping"],
    domains: ["buzzfeed.com"],
    keywords: ["buzzfeed", "buzzfeed shopping"],
    impactIds: [],
    notes: "Editorial commerce content."
  },
  {
    slug: "nym-strategist",
    name: "The Strategist",
    type: "Review / Editorial",
    aliases: ["new york magazine strategist", "strategist"],
    domains: ["nymag.com"],
    keywords: ["strategist", "nym strategist"],
    impactIds: [],
    notes: "Commerce editorial."
  },
  {
    slug: "gizmodo",
    name: "Gizmodo",
    type: "Review / Editorial",
    aliases: ["giz modo"],
    domains: ["gizmodo.com"],
    keywords: ["gizmodo"],
    impactIds: [],
    notes: "Tech / commerce editorial."
  },
  {
    slug: "engadget",
    name: "Engadget",
    type: "Review / Editorial",
    aliases: ["engadget"],
    domains: ["engadget.com"],
    keywords: ["engadget"],
    impactIds: [],
    notes: "Tech editorial."
  },
  {
    slug: "android-authority",
    name: "Android Authority",
    type: "Review / Editorial",
    aliases: ["androidauthority"],
    domains: ["androidauthority.com"],
    keywords: ["androidauthority"],
    impactIds: [],
    notes: "Tech editorial."
  },
  {
    slug: "zdnet",
    name: "ZDNET",
    type: "Review / Editorial",
    aliases: ["zd net"],
    domains: ["zdnet.com"],
    keywords: ["zdnet"],
    impactIds: [],
    notes: "Tech editorial."
  },
  {
    slug: "reviewed",
    name: "Reviewed",
    type: "Review / Editorial",
    aliases: ["reviewed usa today"],
    domains: ["reviewed.com"],
    keywords: ["reviewed"],
    impactIds: [],
    notes: "Review / editorial."
  },

  // =========================
  // Creator / Influencer / Social Commerce
  // =========================
  {
    slug: "ltk",
    name: "LTK",
    type: "Influencer / Creator",
    aliases: ["rewardstyle", "like to know it", "liketoknowit"],
    domains: ["ltk.app", "shopltk.com"],
    keywords: ["ltk", "rewardstyle", "liketoknowit"],
    impactIds: [],
    notes: "Creator commerce platform."
  },
  {
    slug: "shopmy",
    name: "ShopMy",
    type: "Influencer / Creator",
    aliases: ["shop my"],
    domains: ["shopmy.us"],
    keywords: ["shopmy"],
    impactIds: [],
    notes: "Creator storefront platform."
  },
  {
    slug: "magiclinks",
    name: "MagicLinks",
    type: "Influencer / Creator",
    aliases: ["magic links"],
    domains: ["magiclinks.com"],
    keywords: ["magiclinks"],
    impactIds: [],
    notes: "Creator affiliate platform."
  },
  {
    slug: "howl",
    name: "Howl",
    type: "Influencer / Creator",
    aliases: ["howl links"],
    domains: ["planethowl.com"],
    keywords: ["howl", "planethowl"],
    impactIds: [],
    notes: "Creator link platform."
  },
  {
    slug: "shopstyle-collective",
    name: "ShopStyle Collective",
    type: "Influencer / Creator",
    aliases: ["shopstyle", "shop style collective"],
    domains: ["shopstyle.com"],
    keywords: ["shopstyle", "shopstyle collective"],
    impactIds: [],
    notes: "Fashion / creator commerce."
  },
  {
    slug: "collective-voice",
    name: "Collective Voice",
    type: "Influencer / Creator",
    aliases: ["rewardstyle legacy"],
    domains: ["collectivevoice.com"],
    keywords: ["collectivevoice", "collective voice"],
    impactIds: [],
    notes: "Creator monetization platform."
  },
  {
    slug: "mavely",
    name: "Mavely",
    type: "Influencer / Creator",
    aliases: ["mavely app"],
    domains: ["mavely.app", "mavely.co"],
    keywords: ["mavely"],
    impactIds: [],
    notes: "Creator / influencer commerce."
  },
  {
    slug: "shoplooks",
    name: "ShopLooks",
    type: "Influencer / Creator",
    aliases: ["shop looks"],
    domains: ["shoplooks.com"],
    keywords: ["shoplooks"],
    impactIds: [],
    notes: "Creator product curation."
  },
  {
    slug: "amazon-influencer",
    name: "Amazon Influencer",
    type: "Influencer / Creator",
    aliases: ["amazon storefront", "amazon influencer storefront"],
    domains: ["amazon.com"],
    keywords: ["amazon influencer", "storefront", "creator storefront"],
    impactIds: [],
    notes: "May overlap with Amazon Associates / ACC logic."
  },
  {
    slug: "youtube-creator",
    name: "YouTube Creator",
    type: "Influencer / Creator",
    aliases: ["youtube"],
    domains: ["youtube.com", "youtu.be"],
    keywords: ["youtube", "yt creator"],
    impactIds: [],
    notes: "Generic creator fingerprint bucket."
  },
  {
    slug: "instagram-creator",
    name: "Instagram Creator",
    type: "Influencer / Creator",
    aliases: ["instagram"],
    domains: ["instagram.com"],
    keywords: ["instagram", "ig creator"],
    impactIds: [],
    notes: "Generic creator fingerprint bucket."
  },
  {
    slug: "tiktok-creator",
    name: "TikTok Creator",
    type: "Influencer / Creator",
    aliases: ["tiktok"],
    domains: ["tiktok.com"],
    keywords: ["tiktok", "tt creator"],
    impactIds: [],
    notes: "Generic creator fingerprint bucket."
  },

  // =========================
  // Subnetwork / Commerce Routing / Link Monetization
  // =========================
  {
    slug: "skimlinks",
    name: "Skimlinks",
    type: "Subnetwork / Commerce Content",
    aliases: ["skim links"],
    domains: ["skimlinks.com", "go.skimresources.com"],
    keywords: ["skimlinks", "skimresources"],
    impactIds: [],
    notes: "Subnetwork / monetization layer."
  },
  {
    slug: "sovrn-viglink",
    name: "Sovrn / VigLink",
    type: "Subnetwork / Commerce Content",
    aliases: ["viglink", "sovrn commerce"],
    domains: ["viglink.com", "sovrn.com", "redirect.viglink.com"],
    keywords: ["viglink", "vglnk", "vgtid", "sovrn"],
    impactIds: [],
    notes: "Subnetwork / monetization layer."
  },
  {
    slug: "digidip",
    name: "digidip",
    type: "Subnetwork / Commerce Content",
    aliases: ["digi dip"],
    domains: ["digidip.net"],
    keywords: ["digidip"],
    impactIds: [],
    notes: "Link monetization layer."
  },
  {
    slug: "admitad",
    name: "Admitad",
    type: "Subnetwork / Commerce Content",
    aliases: ["admitad tracking"],
    domains: ["admitad.com"],
    keywords: ["admitad", "admitad_uid"],
    impactIds: [],
    notes: "Affiliate routing / platform layer."
  },
  {
    slug: "flexoffers",
    name: "FlexOffers",
    type: "Subnetwork / Commerce Content",
    aliases: ["flex offers"],
    domains: ["flexoffers.com"],
    keywords: ["flexoffers", "faid", "fobs"],
    impactIds: [],
    notes: "Network / subnetwork layer."
  },
  {
    slug: "pepperjam",
    name: "Pepperjam",
    type: "Subnetwork / Commerce Content",
    aliases: ["partnerize legacy pepperjam", "pj"],
    domains: ["pepperjamnetwork.com"],
    keywords: ["pepperjam", "pjid", "pjmid"],
    impactIds: [],
    notes: "Legacy performance marketing layer."
  },
  {
    slug: "partnerboost",
    name: "PartnerBoost",
    type: "Subnetwork / Commerce Content",
    aliases: ["partner boost"],
    domains: ["partnerboost.com"],
    keywords: ["partnerboost", "pb_clickid", "pb_source", "pb_id"],
    impactIds: [],
    notes: "Affiliate routing / creator commerce."
  },
  {
    slug: "everflow",
    name: "Everflow",
    type: "Subnetwork / Commerce Content",
    aliases: ["ever flow"],
    domains: ["everflow.io"],
    keywords: ["everflow", "eff_click_id"],
    impactIds: [],
    notes: "Tracking / performance routing layer."
  },
  {
    slug: "tune",
    name: "TUNE",
    type: "Subnetwork / Commerce Content",
    aliases: ["hasoffers", "tune hasoffers"],
    domains: ["tune.com"],
    keywords: ["tune", "hasoffers", "aff_sub"],
    impactIds: [],
    notes: "Tracking / network layer."
  },
  {
    slug: "refersion",
    name: "Refersion",
    type: "Subnetwork / Commerce Content",
    aliases: ["refersion tracking"],
    domains: ["refersion.com"],
    keywords: ["refersion"],
    impactIds: [],
    notes: "Affiliate SaaS layer."
  },
  {
    slug: "uppromote",
    name: "UpPromote",
    type: "Subnetwork / Commerce Content",
    aliases: ["secomapp"],
    domains: ["secomapp.com", "uppromote.com"],
    keywords: ["uppromote", "secomapp"],
    impactIds: [],
    notes: "Shopify affiliate layer."
  },
  {
    slug: "goaffpro",
    name: "GoAffPro",
    type: "Subnetwork / Commerce Content",
    aliases: ["go aff pro"],
    domains: ["goaffpro.com"],
    keywords: ["goaffpro"],
    impactIds: [],
    notes: "Affiliate SaaS layer."
  },
  {
    slug: "impact-radius",
    name: "Impact",
    type: "Subnetwork / Commerce Content",
    aliases: ["impact radius", "impactradius"],
    domains: ["impact.com"],
    keywords: ["impact", "impactradius", "irclickid", "irgwc"],
    impactIds: [],
    notes: "Network / tracking layer."
  },

  // =========================
  // Broad Media / Editorial / Shopping
  // =========================
  {
    slug: "hearst-media",
    name: "Hearst Media Commerce",
    type: "Review / Editorial",
    aliases: ["hearst"],
    domains: ["goodhousekeeping.com", "cosmopolitan.com", "bestproducts.com", "womansday.com", "prevention.com", "elle.com", "esquire.com"],
    keywords: ["hearst", "bestproducts", "goodhousekeeping"],
    impactIds: [],
    notes: "Publisher umbrella bucket."
  },
  {
    slug: "future-media",
    name: "Future Commerce",
    type: "Review / Editorial",
    aliases: ["future plc"],
    domains: ["tomsguide.com", "techradar.com", "laptopmag.com", "homesandgardens.com", "tomshardware.com"],
    keywords: ["future", "tomsguide", "techradar"],
    impactIds: [],
    notes: "Publisher umbrella bucket."
  },
  {
    slug: "vox-media",
    name: "Vox Media Commerce",
    type: "Review / Editorial",
    aliases: ["vox"],
    domains: ["theverge.com", "nymag.com", "eater.com", "vox.com", "polygon.com"],
    keywords: ["vox media", "the verge", "strategist"],
    impactIds: [],
    notes: "Publisher umbrella bucket."
  },
  {
    slug: "usa-today-network",
    name: "USA Today Network",
    type: "Review / Editorial",
    aliases: ["gannett"],
    domains: ["reviewed.com", "usatoday.com"],
    keywords: ["reviewed", "usa today"],
    impactIds: [],
    notes: "Editorial umbrella bucket."
  },

  // =========================
  // Niche / Home / Mattress / Commerce Adjacent
  // =========================
  {
    slug: "sleep-judge",
    name: "The Sleep Judge",
    type: "Review / Editorial",
    aliases: ["sleepjudge"],
    domains: ["thesleepjudge.com"],
    keywords: ["sleepjudge", "the sleep judge"],
    impactIds: [],
    notes: "Sleep / mattress reviews."
  },
  {
    slug: "mattress-clarity",
    name: "Mattress Clarity",
    type: "Review / Editorial",
    aliases: ["mattressclarity"],
    domains: ["mattressclarity.com"],
    keywords: ["mattressclarity"],
    impactIds: [],
    notes: "Mattress review site."
  },
  {
    slug: "sleep-advisor",
    name: "Sleep Advisor",
    type: "Review / Editorial",
    aliases: ["sleepadvisor"],
    domains: ["sleepadvisor.org"],
    keywords: ["sleepadvisor"],
    impactIds: [],
    notes: "Sleep / mattress review publisher."
  },
  {
    slug: "naplab",
    name: "NapLab",
    type: "Review / Editorial",
    aliases: ["nap lab"],
    domains: ["naplab.com"],
    keywords: ["naplab"],
    impactIds: [],
    notes: "Mattress / home review site."
  },
  {
    slug: "house-beautiful",
    name: "House Beautiful",
    type: "Review / Editorial",
    aliases: ["housebeautiful"],
    domains: ["housebeautiful.com"],
    keywords: ["housebeautiful"],
    impactIds: [],
    notes: "Home editorial."
  },
  {
    slug: "apartment-therapy",
    name: "Apartment Therapy",
    type: "Review / Editorial",
    aliases: ["apartmenttherapy"],
    domains: ["apartmenttherapy.com"],
    keywords: ["apartmenttherapy"],
    impactIds: [],
    notes: "Home / commerce editorial."
  },
  {
    slug: "bhg",
    name: "Better Homes & Gardens",
    type: "Review / Editorial",
    aliases: ["better homes and gardens", "bhg"],
    domains: ["bhg.com"],
    keywords: ["bhg", "better homes and gardens"],
    impactIds: [],
    notes: "Home editorial."
  },
  {
    slug: "people-shopping",
    name: "People Shopping",
    type: "Review / Editorial",
    aliases: ["people shopping"],
    domains: ["people.com"],
    keywords: ["people shopping", "people tested"],
    impactIds: [],
    notes: "Lifestyle commerce editorial."
  },
  {
    slug: "travel-leisure",
    name: "Travel + Leisure",
    type: "Review / Editorial",
    aliases: ["travel and leisure"],
    domains: ["travelandleisure.com"],
    keywords: ["travelandleisure", "travel + leisure"],
    impactIds: [],
    notes: "Travel editorial."
  },
  {
    slug: "food-wine",
    name: "Food & Wine",
    type: "Review / Editorial",
    aliases: ["food and wine"],
    domains: ["foodandwine.com"],
    keywords: ["foodandwine"],
    impactIds: [],
    notes: "Lifestyle / kitchen editorial."
  },

  // =========================
  // Shopping / Comparison / Marketplace Adjacents
  // =========================
  {
    slug: "google-shopping-content",
    name: "Google Shopping Content",
    type: "Comparison / Shopping",
    aliases: ["google shopping"],
    domains: ["google.com"],
    keywords: ["google shopping"],
    impactIds: [],
    notes: "Usually not affiliate publisher; used as classification fallback."
  },
  {
    slug: "pricegrabber",
    name: "PriceGrabber",
    type: "Comparison / Shopping",
    aliases: ["price grabber"],
    domains: ["pricegrabber.com"],
    keywords: ["pricegrabber"],
    impactIds: [],
    notes: "Comparison shopping."
  },
  {
    slug: "shopzilla",
    name: "Shopzilla",
    type: "Comparison / Shopping",
    aliases: ["shop zilla"],
    domains: ["shopzilla.com"],
    keywords: ["shopzilla"],
    impactIds: [],
    notes: "Comparison shopping."
  },
  {
    slug: "nextag",
    name: "Nextag",
    type: "Comparison / Shopping",
    aliases: ["next ag"],
    domains: ["nextag.com"],
    keywords: ["nextag"],
    impactIds: [],
    notes: "Legacy comparison shopping."
  },
  {
    slug: "bizrate",
    name: "Bizrate",
    type: "Comparison / Shopping",
    aliases: ["biz rate"],
    domains: ["bizrate.com"],
    keywords: ["bizrate"],
    impactIds: [],
    notes: "Comparison shopping."
  },

  // =========================
  // Placeholder publisher buckets
  // =========================
  {
    slug: "generic-deal-publisher",
    name: "Generic Deal Publisher",
    type: "Deal / Coupon",
    aliases: [],
    domains: [],
    keywords: ["coupon", "deal", "promo", "discount code", "voucher"],
    impactIds: [],
    notes: "Fallback keyword bucket."
  },
  {
    slug: "generic-review-publisher",
    name: "Generic Review Publisher",
    type: "Review / Editorial",
    aliases: [],
    domains: [],
    keywords: ["review", "best", "vs", "comparison", "tested"],
    impactIds: [],
    notes: "Fallback keyword bucket."
  },
  {
    slug: "generic-creator-publisher",
    name: "Generic Creator Publisher",
    type: "Influencer / Creator",
    aliases: [],
    domains: [],
    keywords: ["creator", "influencer", "storefront", "youtube", "instagram", "tiktok"],
    impactIds: [],
    notes: "Fallback creator bucket."
  },
  {
    slug: "generic-cashback-publisher",
    name: "Generic Cashback Publisher",
    type: "Cashback / Loyalty",
    aliases: [],
    domains: [],
    keywords: ["cashback", "cash back", "rewards", "rebates", "points"],
    impactIds: [],
    notes: "Fallback cashback bucket."
  }
];

function normalizeText(value = "") {
  return String(value).trim().toLowerCase();
}

function textIncludesAny(text = "", list = []) {
  const t = normalizeText(text);
  return list.some((item) => t.includes(normalizeText(item)));
}

function exactDomainMatch(domain = "", domains = []) {
  const d = normalizeText(domain).replace(/^www\./, "");
  return domains.some((x) => d === normalizeText(x).replace(/^www\./, ""));
}

function partialDomainMatch(domain = "", domains = []) {
  const d = normalizeText(domain).replace(/^www\./, "");
  return domains.some((x) => {
    const n = normalizeText(x).replace(/^www\./, "");
    return d === n || d.endsWith(`.${n}`) || n.endsWith(`.${d}`);
  });
}

function findPublisherByImpactId(id) {
  if (!id) return null;
  const hit = PUBLISHER_LIBRARY_V1.find((item) =>
    Array.isArray(item.impactIds) && item.impactIds.map(String).includes(String(id))
  );
  return hit || null;
}

function findPublisherByDomain(domain) {
  if (!domain) return null;

  // exact first
  let hit = PUBLISHER_LIBRARY_V1.find((item) => exactDomainMatch(domain, item.domains || []));
  if (hit) return hit;

  // partial second
  hit = PUBLISHER_LIBRARY_V1.find((item) => partialDomainMatch(domain, item.domains || []));
  return hit || null;
}

function findPublisherByTextFingerprint(text) {
  if (!text) return null;
  const t = normalizeText(text);

  const scored = [];

  for (const item of PUBLISHER_LIBRARY_V1) {
    let score = 0;

    if (textIncludesAny(t, item.keywords || [])) score += 3;
    if (textIncludesAny(t, item.aliases || [])) score += 2;
    if (textIncludesAny(t, item.domains || [])) score += 4;
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item || null;
}

module.exports = {
  PUBLISHER_LIBRARY_V1,
  findPublisherByImpactId,
  findPublisherByDomain,
  findPublisherByTextFingerprint
};
