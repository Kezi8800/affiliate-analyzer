/**
 * BrandShuo Attribution Checker
 * lib/analyze.js
 * Final merged version with Amazon publisher engine
 */

const { detectAmazonPublisherFromUrl } = require("./amazon-publisher-rules");

function safeDecode(value = "") {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

function toLower(value = "") {
  return String(value || "").toLowerCase();
}

function normalizeAmazonTag(tag = "") {
  return String(tag || "")
    .trim()
    .toLowerCase()
    .replace(/%20/g, "")
    .replace(/\s+/g, "")
    .replace(/[^\w\-]/g, "");
}

function stripAmazonLocaleSuffix(tag = "") {
  return String(tag || "").replace(/-\d+$/, "");
}

function getBaseDomain(hostname = "") {
  const host = String(hostname || "").toLowerCase();
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  return parts.slice(-2).join(".");
}

function parseUrl(input) {
  try {
    return new URL(input);
  } catch (e) {
    return null;
  }
}

function paramsToObject(searchParams) {
  const obj = {};
  for (const [key, value] of searchParams.entries()) {
    obj[key] = value;
  }
  return obj;
}

function inferPublisherNameFromAmazonTag(tag = "") {
  const cleaned = stripAmazonLocaleSuffix(normalizeAmazonTag(tag));
  if (!cleaned) return "Unknown";

  let guess = cleaned
    .replace(/\d+/g, " ")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!guess) return "Unknown";

  return guess
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * 旧的 Amazon publisher 规则保留为 fallback
 * 只有在新引擎未命中时才会使用
 */
const AMAZON_PUBLISHER_RULES = [
  { pattern: /slickdeals/i, publisher: "Slickdeals", type: "Deal Community", media_group: "Coupons & Deals", subtype: "Forum Deal" },
  { pattern: /dealnews/i, publisher: "DealNews", type: "Deal Publisher", media_group: "Coupons & Deals", subtype: "Editorial Deal" },
  { pattern: /techbargains/i, publisher: "TechBargains", type: "Deal Publisher", media_group: "Coupons & Deals", subtype: "Tech Deals" },
  { pattern: /bradsdeals/i, publisher: "Brad's Deals", type: "Deal Publisher", media_group: "Coupons & Deals", subtype: "Editorial Deal" },
  { pattern: /offers\.com|offerscom/i, publisher: "Offers.com", type: "Deal Publisher", media_group: "Coupons & Deals", subtype: "Coupon/Deal" },
  { pattern: /couponfollow/i, publisher: "CouponFollow", type: "Coupon Publisher", media_group: "Coupons & Deals", subtype: "Coupon" },
  { pattern: /couponbirds/i, publisher: "CouponBirds", type: "Coupon Publisher", media_group: "Coupons & Deals", subtype: "Coupon" },
  { pattern: /retailmenot/i, publisher: "RetailMeNot", type: "Coupon Publisher", media_group: "Coupons & Deals", subtype: "Coupon" },
  { pattern: /rakuten/i, publisher: "Rakuten", type: "Cashback / Rewards", media_group: "Rewards", subtype: "Cashback" },
  { pattern: /topcashback/i, publisher: "TopCashback", type: "Cashback / Rewards", media_group: "Rewards", subtype: "Cashback" },
  { pattern: /befrugal/i, publisher: "BeFrugal", type: "Cashback / Rewards", media_group: "Rewards", subtype: "Cashback" },
  { pattern: /extrabux/i, publisher: "Extrabux", type: "Cashback / Rewards", media_group: "Rewards", subtype: "Cashback" },
  { pattern: /mrrebates/i, publisher: "Mr. Rebates", type: "Cashback / Rewards", media_group: "Rewards", subtype: "Cashback" },
  { pattern: /capitaloneshopping|wikibuy/i, publisher: "Capital One Shopping", type: "Cashback / Rewards", media_group: "Rewards", subtype: "Browser Commerce" },
  { pattern: /honey|joinhoney/i, publisher: "Honey", type: "Coupon / Browser Extension", media_group: "Coupons & Deals", subtype: "Browser Commerce" },
  { pattern: /couponcabin/i, publisher: "CouponCabin", type: "Coupon Publisher", media_group: "Coupons & Deals", subtype: "Coupon" },
  { pattern: /dontpayfull/i, publisher: "DontPayFull", type: "Coupon Publisher", media_group: "Coupons & Deals", subtype: "Coupon" },
  { pattern: /promocodes/i, publisher: "PromoCodes", type: "Coupon Publisher", media_group: "Coupons & Deals", subtype: "Coupon" },
  { pattern: /dealsea/i, publisher: "DealSea", type: "Deal Publisher", media_group: "Coupons & Deals", subtype: "Forum Deal" },
  { pattern: /ben?s?bargains|bensbargains/i, publisher: "Ben's Bargains", type: "Deal Publisher", media_group: "Coupons & Deals", subtype: "Editorial Deal" },
  { pattern: /wethrift/i, publisher: "Wethrift", type: "Coupon Publisher", media_group: "Coupons & Deals", subtype: "Coupon" },
  { pattern: /hip2save/i, publisher: "Hip2Save", type: "Deal Publisher", media_group: "Coupons & Deals", subtype: "Lifestyle Deal" },
  { pattern: /thekrazycouponlady/i, publisher: "The Krazy Coupon Lady", type: "Deal Publisher", media_group: "Coupons & Deals", subtype: "Coupon Content" },
  { pattern: /couponcause/i, publisher: "CouponCause", type: "Coupon Publisher", media_group: "Coupons & Deals", subtype: "Coupon" },
  { pattern: /dealspotr/i, publisher: "Dealspotr", type: "Deal Community", media_group: "Coupons & Deals", subtype: "UGC Deal" },
  { pattern: /goodsearch|goodshop/i, publisher: "Goodshop", type: "Coupon / Rewards", media_group: "Rewards", subtype: "Coupon/Charity" },

  { pattern: /wirecutter|nytimeswirecutter/i, publisher: "Wirecutter", type: "Review Media", media_group: "Commerce Editorial", subtype: "Product Reviews" },
  { pattern: /cnet/i, publisher: "CNET", type: "Review Media", media_group: "Commerce Editorial", subtype: "Tech Reviews" },
  { pattern: /cnnunderscored|underscored/i, publisher: "CNN Underscored", type: "Review Media", media_group: "Commerce Editorial", subtype: "Editorial Reviews" },
  { pattern: /forbes/i, publisher: "Forbes", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Editorial Commerce" },
  { pattern: /businessinsider|insiderreviews|insider/i, publisher: "Business Insider", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Editorial Reviews" },
  { pattern: /usatoday/i, publisher: "USA Today", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Editorial Reviews" },
  { pattern: /nypost/i, publisher: "New York Post", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Editorial Commerce" },
  { pattern: /tomsguide/i, publisher: "Tom's Guide", type: "Review Media", media_group: "Commerce Editorial", subtype: "Tech Reviews" },
  { pattern: /techradar/i, publisher: "TechRadar", type: "Review Media", media_group: "Commerce Editorial", subtype: "Tech Reviews" },
  { pattern: /pcmag/i, publisher: "PCMag", type: "Review Media", media_group: "Commerce Editorial", subtype: "Tech Reviews" },
  { pattern: /reviewed/i, publisher: "Reviewed", type: "Review Media", media_group: "Commerce Editorial", subtype: "Product Reviews" },
  { pattern: /consumersearch/i, publisher: "ConsumerSearch", type: "Review Media", media_group: "Commerce Editorial", subtype: "Product Reviews" },
  { pattern: /thespruce/i, publisher: "The Spruce", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Home Content" },
  { pattern: /verywell/i, publisher: "Verywell", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Health Content" },
  { pattern: /travelandleisure/i, publisher: "Travel + Leisure", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Travel Content" },
  { pattern: /foodandwine/i, publisher: "Food & Wine", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Lifestyle Content" },
  { pattern: /people/i, publisher: "People", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Lifestyle Content" },
  { pattern: /buzzfeed/i, publisher: "BuzzFeed", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Listicle Commerce" },

  { pattern: /sleepfoundation/i, publisher: "Sleep Foundation", type: "Niche Review Media", media_group: "Vertical Editorial", subtype: "Sleep Reviews" },
  { pattern: /mattressclarity/i, publisher: "Mattress Clarity", type: "Niche Review Media", media_group: "Vertical Editorial", subtype: "Mattress Reviews" },
  { pattern: /sleepopolis/i, publisher: "Sleepopolis", type: "Niche Review Media", media_group: "Vertical Editorial", subtype: "Mattress Reviews" },
  { pattern: /mattressnerd/i, publisher: "Mattress Nerd", type: "Niche Review Media", media_group: "Vertical Editorial", subtype: "Mattress Reviews" },
  { pattern: /naplab/i, publisher: "NapLab", type: "Niche Review Media", media_group: "Vertical Editorial", subtype: "Mattress Reviews" },
  { pattern: /slumberyard/i, publisher: "Slumber Yard", type: "Niche Review Media", media_group: "Vertical Editorial", subtype: "Mattress Reviews" },
  { pattern: /rtings/i, publisher: "RTINGS", type: "Review Media", media_group: "Vertical Editorial", subtype: "Lab Reviews" },

  { pattern: /youtube|yt|tube/i, publisher: "YouTube Creator", type: "Influencer / Creator", media_group: "Creator Economy", subtype: "YouTube" },
  { pattern: /tiktok|tt/i, publisher: "TikTok Creator", type: "Influencer / Creator", media_group: "Creator Economy", subtype: "TikTok" },
  { pattern: /instagram|ig/i, publisher: "Instagram Creator", type: "Influencer / Creator", media_group: "Creator Economy", subtype: "Instagram" },
  { pattern: /facebook|fb/i, publisher: "Facebook Creator/Page", type: "Influencer / Creator", media_group: "Creator Economy", subtype: "Facebook" },
  { pattern: /pinterest|pin/i, publisher: "Pinterest Creator", type: "Influencer / Creator", media_group: "Creator Economy", subtype: "Pinterest" },
  { pattern: /linkinbio|beacons|linktree|later/i, publisher: "Creator Link Hub", type: "Influencer / Creator", media_group: "Creator Economy", subtype: "Link Hub" },
  { pattern: /shopmy/i, publisher: "ShopMy Creator", type: "Influencer / Creator", media_group: "Creator Economy", subtype: "Creator Storefront" },
  { pattern: /ltk|liketoknowit/i, publisher: "LTK Creator", type: "Influencer / Creator", media_group: "Creator Economy", subtype: "Influencer Commerce" },

  { pattern: /reddit/i, publisher: "Reddit", type: "Community / Forum", media_group: "Community", subtype: "Forum" },
  { pattern: /quora/i, publisher: "Quora", type: "Community / Forum", media_group: "Community", subtype: "Q&A" },
  { pattern: /medium/i, publisher: "Medium", type: "Blog / UGC", media_group: "Community", subtype: "Article Platform" },
  { pattern: /substack/i, publisher: "Substack", type: "Newsletter / Creator", media_group: "Creator Economy", subtype: "Newsletter" },

  { pattern: /swagbucks/i, publisher: "Swagbucks", type: "Rewards Publisher", media_group: "Rewards", subtype: "Points/Cashback" },
  { pattern: /mypoints/i, publisher: "MyPoints", type: "Rewards Publisher", media_group: "Rewards", subtype: "Points/Cashback" },

  { pattern: /newsweek/i, publisher: "Newsweek", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Editorial Commerce" },
  { pattern: /time/i, publisher: "TIME", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Editorial Commerce" },
  { pattern: /fortune/i, publisher: "Fortune", type: "Editorial Commerce", media_group: "Commerce Editorial", subtype: "Editorial Commerce" },

  { pattern: /^amzn|^amazon|amazoncom/i, publisher: "Amazon Internal / Generic", type: "Unknown / Platform", media_group: "Platform", subtype: "Generic Tag" },
  { pattern: /amzndeals|amazondeals|amazondeal/i, publisher: "Amazon Deals / Generic", type: "Unknown / Platform", media_group: "Platform", subtype: "Generic Deals" }
];

function detectAmazonPublisherFallback(params = {}) {
  const rawTag = safeDecode(params.tag || "");
  const rawAscSubtag = safeDecode(params.ascsubtag || "");
  const rawRef = safeDecode(params.ref || params.ref_ || "");
  const rawSource = safeDecode(params.source || params.sourceid || "");
  const rawCamp = safeDecode(params.camp || "");
  const rawCreative = safeDecode(params.creative || "");
  const rawStore = safeDecode(params.store || "");

  const normalizedTag = normalizeAmazonTag(rawTag);
  const strippedTag = stripAmazonLocaleSuffix(normalizedTag);

  const candidates = [
    normalizedTag,
    strippedTag,
    toLower(rawAscSubtag),
    toLower(rawRef),
    toLower(rawSource),
    toLower(rawCamp),
    toLower(rawCreative),
    toLower(rawStore)
  ].filter(Boolean);

  for (const rule of AMAZON_PUBLISHER_RULES) {
    for (const candidate of candidates) {
      if (rule.pattern.test(candidate)) {
        return {
          publisher: rule.publisher,
          normalized_tag: rawTag || null,
          canonical_tag: strippedTag || null,
          type: rule.type,
          media_group: rule.media_group,
          subtype: rule.subtype,
          source_ownership: rawTag ? "Publisher-owned tag" : "Indirect/derived match",
          confidence: rawTag ? "High" : "Medium",
          matched_by: rawTag ? "amazon_tag_rule" : "amazon_auxiliary_rule"
        };
      }
    }
  }

  if (rawTag) {
    return {
      publisher: inferPublisherNameFromAmazonTag(rawTag),
      normalized_tag: rawTag,
      canonical_tag: strippedTag || null,
      type: "Unknown",
      media_group: "Unknown",
      subtype: "Unknown",
      source_ownership: "Publisher-owned tag",
      confidence: "Medium",
      matched_by: "amazon_tag_fallback"
    };
  }

  return {
    publisher: "Unknown",
    normalized_tag: null,
    canonical_tag: null,
    type: "Unknown",
    media_group: "Unknown",
    subtype: "Unknown",
    source_ownership: "Unknown",
    confidence: "Low",
    matched_by: "none"
  };
}

function classifyPublisherCommercialRole(publisherIntel = {}, params = {}) {
  const type = toLower(publisherIntel.type);
  const subtype = toLower(publisherIntel.subtype);
  const mediaGroup = toLower(publisherIntel.media_group);

  let traffic_type = "Unknown";
  let intent_level = "Medium";
  let channel_role = "Unknown";
  let incrementality_risk = "Medium";

  if (
    type.includes("deal") ||
    type.includes("coupon") ||
    type.includes("cashback") ||
    type.includes("rewards") ||
    mediaGroup.includes("coupons") ||
    mediaGroup.includes("rewards")
  ) {
    traffic_type = "Coupon / Deal";
    intent_level = "High";
    channel_role = "Closer";
    incrementality_risk = "High";
  } else if (
    type.includes("review") ||
    subtype.includes("reviews") ||
    subtype.includes("lab reviews") ||
    mediaGroup.includes("commerce editorial") ||
    mediaGroup.includes("vertical editorial")
  ) {
    traffic_type = "Review / Consideration";
    intent_level = "Medium-High";
    channel_role = "Mid-funnel Influencer";
    incrementality_risk = "Medium";
  } else if (
    type.includes("influencer") ||
    type.includes("creator") ||
    mediaGroup.includes("creator economy")
  ) {
    traffic_type = "Creator Recommendation";
    intent_level = "Medium";
    channel_role = "Influencer";
    incrementality_risk = "Medium";
  } else if (type.includes("community") || type.includes("forum")) {
    traffic_type = "Community / Word-of-Mouth";
    intent_level = "Medium";
    channel_role = "Assist";
    incrementality_risk = "Medium";
  } else if (subtype.includes("newsletter") || type.includes("blog")) {
    traffic_type = "Newsletter / Blog";
    intent_level = "Medium";
    channel_role = "Assist";
    incrementality_risk = "Medium-Low";
  }

  return {
    traffic_type,
    intent_level,
    channel_role,
    incrementality_risk
  };
}

function enrichAmazonPublisherSignals(params = {}, publisherIntel = {}) {
  const tag = toLower(params.tag || "");
  const ascsubtag = toLower(params.ascsubtag || "");
  const linkCode = toLower(params.linkCode || "");
  const camp = toLower(params.camp || "");
  const creative = toLower(params.creative || "");

  const notes = [];
  let amazon_link_mode = "standard";
  let probable_network = "Amazon Associates";

  if (tag) notes.push("Amazon Associates tag detected");
  if (ascsubtag) notes.push("Subtag/click-level identifier detected");
  if (linkCode) notes.push(`Amazon linkCode=${linkCode}`);

  if (ascsubtag && /int|subtag|creator|social|influencer/i.test(ascsubtag)) {
    notes.push("Possible creator/distribution subtag pattern");
  }

  if (["ur2", "ll1", "ll2", "sl1"].includes(linkCode)) {
    amazon_link_mode = "affiliate_deep_link";
  }

  if (camp === "1789" && creative === "9325") {
    notes.push("Common Amazon affiliate campaign/creative pair");
  }

  return {
    amazon_link_mode,
    probable_network,
    notes
  };
}

function detectNetwork(params = {}, hostname = "") {
  const h = toLower(hostname);

  if (h.includes("amazon.")) return "Amazon";
  if (h.includes("walmart.")) return "Walmart";
  if ("irclickid" in params || "impactradius" in h || h.includes("impact.com")) return "Impact";
  if ("awc" in params) return "Awin";
  if ("cjevent" in params) return "CJ Affiliate";
  if ("ranMID" in params || "ranEAID" in params || "ranSiteID" in params) return "Rakuten Advertising";
  if ("afftrack" in params || "shareasale" in h) return "ShareASale";
  if ("skimlinks" in params || "skm" in params || "sref" in params) return "Skimlinks";
  if ("vglnk" in params || "vgtid" in params) return "Sovrn / VigLink";
  if ("clickref" in params || toLower(params.utm_source).includes("partnerize")) return "Partnerize";
  if ("gclid" in params || "gbraid" in params || "wbraid" in params || "gad_campaignid" in params) return "Google Ads";
  if ("fbclid" in params) return "Meta Ads";
  if ("ttclid" in params) return "TikTok Ads";
  if ("msclkid" in params) return "Microsoft Ads";
  if ("maas" in params || "aa_campaignid" in params || "aa_adgroupid" in params || "aa_creativeid" in params) return "Amazon Attribution";
  if ("campaignId" in params && "linkId" in params && toLower(params.linkCode).includes("tr")) return "Amazon Creator Connections";
  if ("tag" in params) return "Amazon Associates";

  return "Unknown";
}

function detectPlatform(params = {}, hostname = "") {
  const h = toLower(hostname);
  if (h.includes("amazon.")) return "Amazon";
  if (h.includes("walmart.")) return "Walmart";
  if (h.includes("target.")) return "Target";
  if (h.includes("ebay.")) return "eBay";
  if (h.includes("shopify.")) return "Shopify";
  return getBaseDomain(h) || "Unknown";
}

function detectMerchantIntelligence(urlObj, params = {}) {
  const hostname = toLower(urlObj.hostname);
  const pathname = urlObj.pathname || "";

  let merchant = "Unknown";
  let merchant_type = "Unknown";
  let retail_mapping = "Unknown";

  if (hostname.includes("amazon.")) {
    merchant = "Amazon";
    merchant_type = "Marketplace";
    retail_mapping = pathname.startsWith("/dp/") || pathname.includes("/gp/") ? "ASIN/Product Page" : "Amazon Internal Page";
  } else if (hostname.includes("walmart.")) {
    merchant = "Walmart";
    merchant_type = "Retailer";
    retail_mapping = pathname.includes("/ip/") ? "Product Page" : "Retail Page";
  } else {
    merchant = getBaseDomain(hostname) || "Unknown";
    merchant_type = "DTC / Retail";
    retail_mapping = "Direct Merchant URL";
  }

  return {
    merchant,
    merchant_type,
    retail_mapping
  };
}

function buildDetectedSignals(params = {}) {
  const signals = [];

  for (const key of Object.keys(params)) {
    signals.push({
      param: key,
      value: params[key]
    });
  }

  return signals.slice(0, 50);
}

function scoreTrafficQuality(params = {}, network = "", publisherIntel = {}) {
  let score = 50;
  let tier = "Medium";
  const reasons = [];

  if (network === "Google Ads" || network === "Meta Ads" || network === "TikTok Ads" || network === "Microsoft Ads") {
    score += 10;
    reasons.push("Paid media click ID detected");
  }

  if (network === "Amazon Associates" || network === "Impact" || network === "Awin" || network === "CJ Affiliate") {
    score += 8;
    reasons.push("Affiliate network parameter detected");
  }

  if (publisherIntel.type && /deal|coupon|cashback/i.test(publisherIntel.type)) {
    score -= 8;
    reasons.push("Coupon/deal-driven traffic often skews closer-heavy");
  }

  if (publisherIntel.type && /review|editorial/i.test(publisherIntel.type)) {
    score += 6;
    reasons.push("Editorial/review traffic often has stronger consideration value");
  }

  if ("utm_source" in params || "utm_medium" in params || "utm_campaign" in params) {
    score += 3;
    reasons.push("UTM structure detected");
  }

  if ("fbclid" in params || "gclid" in params || "ttclid" in params || "msclkid" in params) {
    score += 5;
    reasons.push("Platform click identifier present");
  }

  if (score >= 75) tier = "High";
  else if (score >= 55) tier = "Medium";
  else tier = "Low";

  return {
    quality_score: Math.max(0, Math.min(100, score)),
    quality_tier: tier,
    reasons
  };
}

function buildCommercialIntent(params = {}, network = "", publisherIntel = {}) {
  const publisherRole = classifyPublisherCommercialRole(publisherIntel, params);

  let commercial_intent_score = 50;
  const reasons = [];

  if (
    publisherRole.traffic_type === "Coupon / Deal" ||
    publisherRole.channel_role === "Closer"
  ) {
    commercial_intent_score += 30;
    reasons.push("Coupon/deal style publisher indicates strong bottom-funnel intent");
  }

  if (
    publisherRole.traffic_type === "Review / Consideration" ||
    publisherRole.channel_role === "Mid-funnel Influencer"
  ) {
    commercial_intent_score += 15;
    reasons.push("Review/editorial path indicates active product consideration");
  }

  if (network === "Google Ads" && ("gclid" in params || "gad_campaignid" in params)) {
    commercial_intent_score += 10;
    reasons.push("Paid search signal detected");
  }

  if (network === "Meta Ads" || network === "TikTok Ads") {
    commercial_intent_score += 5;
    reasons.push("Paid social click signal detected");
  }

  if ("tag" in params || "irclickid" in params || "awc" in params || "cjevent" in params) {
    commercial_intent_score += 10;
    reasons.push("Affiliate conversion intent signal detected");
  }

  commercial_intent_score = Math.max(0, Math.min(100, commercial_intent_score));

  let intent_band = "Medium";
  if (commercial_intent_score >= 80) intent_band = "Very High";
  else if (commercial_intent_score >= 65) intent_band = "High";
  else if (commercial_intent_score < 45) intent_band = "Low";

  return {
    traffic_type: publisherRole.traffic_type,
    intent_level: publisherRole.intent_level,
    channel_role: publisherRole.channel_role,
    incrementality_risk: publisherRole.incrementality_risk,
    commercial_intent_score,
    intent_band,
    reasons
  };
}

function buildAttributionConflict(params = {}) {
  const layers = [];
  let risk_score = 10;

  if ("gclid" in params || "gbraid" in params || "wbraid" in params) {
    layers.push("Google Ads");
    risk_score += 15;
  }

  if ("fbclid" in params) {
    layers.push("Meta Ads");
    risk_score += 15;
  }

  if ("ttclid" in params) {
    layers.push("TikTok Ads");
    risk_score += 15;
  }

  if ("msclkid" in params) {
    layers.push("Microsoft Ads");
    risk_score += 15;
  }

  if ("irclickid" in params) {
    layers.push("Impact");
    risk_score += 20;
  }

  if ("awc" in params) {
    layers.push("Awin");
    risk_score += 20;
  }

  if ("cjevent" in params) {
    layers.push("CJ Affiliate");
    risk_score += 20;
  }

  if ("ranMID" in params || "ranEAID" in params || "ranSiteID" in params) {
    layers.push("Rakuten Advertising");
    risk_score += 20;
  }

  if ("maas" in params || "aa_campaignid" in params || "aa_adgroupid" in params || "aa_creativeid" in params) {
    layers.push("Amazon Attribution");
    risk_score += 20;
  }

  if ("tag" in params) {
    layers.push("Amazon Associates");
    risk_score += 20;
  }

  if ("campaignId" in params && "linkId" in params && toLower(params.linkCode).includes("tr")) {
    layers.push("Amazon Creator Connections");
    risk_score += 20;
  }

  const uniqueLayers = [...new Set(layers)];
  risk_score = Math.max(0, Math.min(100, risk_score));

  let risk_level = "Low";
  if (risk_score >= 70) risk_level = "High";
  else if (risk_score >= 40) risk_level = "Medium";

  return {
    conflict_layers: uniqueLayers,
    conflict_count: uniqueLayers.length,
    conflict_risk_score: risk_score,
    conflict_risk_level: risk_level
  };
}

function buildFinalVerdict(network = "", commercialIntent = {}, attributionConflict = {}, publisherIntel = {}) {
  let primary_claimer = network || "Unknown";
  let likely_closer = commercialIntent.channel_role === "Closer"
    ? (publisherIntel.publisher || network || "Unknown")
    : (network || "Unknown");
  let true_influence_leader = "Unknown";
  let path_archetype = "Single-layer path";
  let confidence = "Medium";

  if (attributionConflict.conflict_count >= 2) {
    path_archetype = "Multi-layer path";
    confidence = "Medium";
  }

  if (attributionConflict.conflict_count >= 4) {
    path_archetype = "Conflict-heavy path";
    confidence = "Low";
  }

  if (network === "Amazon Associates" && publisherIntel.publisher && publisherIntel.publisher !== "Unknown") {
    likely_closer = publisherIntel.publisher;
    confidence = publisherIntel.confidence || confidence;
  }

  if (
    commercialIntent.channel_role === "Mid-funnel Influencer" ||
    commercialIntent.channel_role === "Influencer" ||
    commercialIntent.channel_role === "Assist"
  ) {
    true_influence_leader = publisherIntel.publisher || "Unknown";
  }

  if (commercialIntent.channel_role === "Closer") {
    true_influence_leader = "Unknown";
  }

  return {
    primary_claimer,
    likely_closer,
    true_influence_leader,
    path_archetype,
    confidence
  };
}

function mapAmazonEngineToPublisherIntel(amazonEngineResult = {}, params = {}) {
  if (!amazonEngineResult) return null;

  const fallbackType = amazonEngineResult.publisherType || "Unknown";
  let mediaGroup = "Unknown";
  let subtype = "Unknown";
  let confidence = "Medium";

  if (/deal|coupon/i.test(fallbackType)) {
    mediaGroup = "Coupons & Deals";
    subtype = "Coupon / Deal Publisher";
    confidence = "Very High";
  } else if (/review|editorial/i.test(fallbackType)) {
    mediaGroup = "Commerce Editorial";
    subtype = "Amazon Associate Publisher";
    confidence = "Very High";
  } else if (/cashback|loyalty/i.test(fallbackType)) {
    mediaGroup = "Rewards";
    subtype = "Cashback / Loyalty Publisher";
    confidence = "Very High";
  } else if (/creator|influencer/i.test(fallbackType)) {
    mediaGroup = "Creator Economy";
    subtype = "Influencer / Creator";
    confidence = "High";
  } else if (/subnetwork/i.test(fallbackType)) {
    mediaGroup = "Subnetwork";
    subtype = "Commerce Routing";
    confidence = "High";
  }

  if (amazonEngineResult.confidence >= 0.99) confidence = "Very High";
  else if (amazonEngineResult.confidence >= 0.9) confidence = "High";
  else if (amazonEngineResult.confidence >= 0.75) confidence = "Medium";
  else confidence = "Low";

  return {
    publisher: amazonEngineResult.publisherName || inferPublisherNameFromAmazonTag(params.tag || ""),
    normalized_tag: params.tag || amazonEngineResult.publisherToken || null,
    canonical_tag: stripAmazonLocaleSuffix(normalizeAmazonTag(params.tag || amazonEngineResult.publisherToken || "")) || null,
    type: fallbackType,
    media_group: mediaGroup,
    subtype,
    source_ownership: params.tag ? "Publisher-owned tag" : "Derived match",
    confidence,
    matched_by: amazonEngineResult.matchMethod || "amazon_engine"
  };
}

function analyzeAmazonLink(urlObj) {
  const params = paramsToObject(urlObj.searchParams);

  // 新引擎优先
  const amazonEngineResult = detectAmazonPublisherFromUrl(urlObj.toString());

  let publisherIntel;
  if (amazonEngineResult && amazonEngineResult.publisherName) {
    publisherIntel = mapAmazonEngineToPublisherIntel(amazonEngineResult, params);
  } else {
    publisherIntel = detectAmazonPublisherFallback(params);
  }

  const commercialIntel = buildCommercialIntent(params, "Amazon Associates", publisherIntel);
  const amazonEnrichment = enrichAmazonPublisherSignals(params, publisherIntel);
  const trafficQuality = scoreTrafficQuality(params, "Amazon Associates", publisherIntel);
  const attributionConflict = buildAttributionConflict(params);
  const merchantIntel = detectMerchantIntelligence(urlObj, params);
  const finalVerdict = buildFinalVerdict("Amazon Associates", commercialIntel, attributionConflict, publisherIntel);

  return {
    version: "v2.2",
    analyzed_url: urlObj.toString(),
    hostname: urlObj.hostname,
    platform: "Amazon",
    network: "Amazon Associates",
    detected_params: Object.keys(params),

    final_verdict: finalVerdict,

    publisher_intelligence: {
      publisher: publisherIntel.publisher,
      normalized_tag: publisherIntel.normalized_tag,
      canonical_tag: publisherIntel.canonical_tag,
      type: publisherIntel.type,
      media_group: publisherIntel.media_group,
      subtype: publisherIntel.subtype,
      source_ownership: publisherIntel.source_ownership,
      confidence: publisherIntel.confidence,
      matched_by: publisherIntel.matched_by
    },

    traffic_quality_intelligence: trafficQuality,
    commercial_intelligence: commercialIntel,
    attribution_conflict_intelligence: attributionConflict,
    merchant_intelligence: merchantIntel,

    amazon_intelligence: {
      amazon_link_mode: amazonEnrichment.amazon_link_mode,
      probable_network: amazonEnrichment.probable_network,
      notes: amazonEnrichment.notes,
      engine_status: amazonEngineResult?.status || "fallback",
      engine_match_method: amazonEngineResult?.matchMethod || null,
      engine_publisher_type: amazonEngineResult?.publisherType || null
    },

    raw_signals: buildDetectedSignals(params)
  };
}

function analyzeGenericLink(urlObj) {
  const params = paramsToObject(urlObj.searchParams);
  const hostname = urlObj.hostname;
  const network = detectNetwork(params, hostname);
  const platform = detectPlatform(params, hostname);

  const emptyPublisherIntel = {
    publisher: "Unknown",
    normalized_tag: null,
    canonical_tag: null,
    type: "Unknown",
    media_group: "Unknown",
    subtype: "Unknown",
    source_ownership: "Unknown",
    confidence: "Low",
    matched_by: "none"
  };

  const trafficQuality = scoreTrafficQuality(params, network, emptyPublisherIntel);
  const commercialIntel = buildCommercialIntent(params, network, emptyPublisherIntel);
  const attributionConflict = buildAttributionConflict(params);
  const merchantIntel = detectMerchantIntelligence(urlObj, params);
  const finalVerdict = buildFinalVerdict(network, commercialIntel, attributionConflict, emptyPublisherIntel);

  return {
    version: "v2.2",
    analyzed_url: urlObj.toString(),
    hostname,
    platform,
    network,
    detected_params: Object.keys(params),

    final_verdict: finalVerdict,

    publisher_intelligence: {
      publisher: "Unknown",
      normalized_tag: null,
      canonical_tag: null,
      type: "Unknown",
      media_group: "Unknown",
      subtype: "Unknown",
      source_ownership: "Unknown",
      confidence: "Low",
      matched_by: "none"
    },

    traffic_quality_intelligence: trafficQuality,
    commercial_intelligence: commercialIntel,
    attribution_conflict_intelligence: attributionConflict,
    merchant_intelligence: merchantIntel,
    raw_signals: buildDetectedSignals(params)
  };
}

function analyzeLink(inputUrl) {
  const urlObj = parseUrl(inputUrl);

  if (!urlObj) {
    return {
      version: "v2.2",
      error: true,
      message: "Invalid URL"
    };
  }

  const hostname = toLower(urlObj.hostname);

  if (hostname.includes("amazon.")) {
    return analyzeAmazonLink(urlObj);
  }

  return analyzeGenericLink(urlObj);
}

module.exports = { analyzeLink };
