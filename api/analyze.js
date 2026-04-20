const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

/**
 * ---------------------------------------------------------
 * Config
 * ---------------------------------------------------------
 */
const PORT = process.env.PORT || 3000;

/**
 * ---------------------------------------------------------
 * Publisher Intelligence Rules
 * ---------------------------------------------------------
 */
const PUBLISHER_RULES = [
  {
    name: "Future Publishing",
    match: [
      /futurepublishing/i,
      /tomsguide\.com/i,
      /techradar\.com/i,
      /t3\.com/i,
      /homesandgardens\.com/i,
      /marieclaire\.co\.uk/i,
      /idealhome\.co\.uk/i
    ],
    subMap: {
      "tomsguide.com": "Tom's Guide",
      "techradar.com": "TechRadar",
      "t3.com": "T3",
      "homesandgardens.com": "Homes & Gardens",
      "marieclaire.co.uk": "Marie Claire UK",
      "idealhome.co.uk": "Ideal Home"
    },
    type: "Media Affiliate"
  },
  {
    name: "Red Ventures",
    match: [
      /cnet\.com/i,
      /zdnet\.com/i,
      /bankrate\.com/i,
      /thepointsguy\.com/i,
      /creditcards\.com/i,
      /healthline\.com/i
    ],
    subMap: {
      "cnet.com": "CNET",
      "zdnet.com": "ZDNET",
      "bankrate.com": "Bankrate",
      "thepointsguy.com": "The Points Guy",
      "creditcards.com": "CreditCards.com",
      "healthline.com": "Healthline"
    },
    type: "Media Affiliate"
  },
  {
    name: "Dotdash Meredith",
    match: [
      /investopedia\.com/i,
      /verywellfit\.com/i,
      /people\.com/i,
      /betterhomesandgardens\.com/i,
      /foodandwine\.com/i
    ],
    subMap: {
      "investopedia.com": "Investopedia",
      "verywellfit.com": "Verywell Fit",
      "people.com": "People",
      "betterhomesandgardens.com": "Better Homes & Gardens",
      "foodandwine.com": "Food & Wine"
    },
    type: "Media Affiliate"
  },
  {
    name: "BuzzFeed Group",
    match: [
      /buzzfeed\.com/i,
      /huffpost\.com/i,
      /tasty\.co/i
    ],
    subMap: {
      "buzzfeed.com": "BuzzFeed",
      "huffpost.com": "HuffPost",
      "tasty.co": "Tasty"
    },
    type: "Media Affiliate"
  }
];

/**
 * ---------------------------------------------------------
 * Param dictionaries
 * ---------------------------------------------------------
 */
const PARAM_DICTIONARY = {
  // Amazon Attribution
  aa_campaignid: "Amazon Attribution Campaign ID",
  aa_adgroupid: "Amazon Attribution Ad Group ID",
  aa_creativeid: "Amazon Attribution Creative ID",
  maas: "Amazon Attribution Maas",
  ref_: "Amazon Ref",

  // Amazon Associates / ACC
  tag: "Amazon Associates Tag",
  ascsubtag: "Amazon Sub Tag",
  campaignid: "Campaign ID",
  linkid: "Link ID",
  linkcode: "Link Code",

  // Impact
  irclickid: "Impact Click ID",

  // Awin
  awc: "Awin Click ID",
  click_id: "Click ID",

  // CJ
  cjevent: "CJ Event ID",

  // Rakuten
  ranMID: "Rakuten MID",
  ranEAID: "Rakuten EAID",
  ranSiteID: "Rakuten Site ID",

  // ShareASale / Awin legacy
  afftrack: "Affiliate Tracking",
  u1: "Publisher Sub ID",

  // Ads
  gclid: "Google Ads Click ID",
  gbraid: "Google Ads GBRAID",
  wbraid: "Google Ads WBRAID",
  gad_campaignid: "Google Ads Campaign ID",
  fbclid: "Meta Ads Click ID",
  ttclid: "TikTok Ads Click ID",
  msclkid: "Microsoft Ads Click ID",

  // Generic
  utm_source: "UTM Source",
  utm_medium: "UTM Medium",
  utm_campaign: "UTM Campaign",
  coupon: "Coupon Code"
};

/**
 * ---------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------
 */
function safeUrl(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function parseQueryParams(urlObj) {
  const params = {};
  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

function pickKeyParams(params) {
  const result = {};
  Object.keys(params).forEach((key) => {
    if (PARAM_DICTIONARY[key] || isMeaningfulTrackingKey(key)) {
      result[key] = params[key];
    }
  });
  return result;
}

function isMeaningfulTrackingKey(key) {
  return /utm_|click|clid|campaign|creative|aff|sub|tag|coupon|maas
