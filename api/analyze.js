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
  return /utm_|click|clid|campaign|creative|aff|sub|tag|coupon|maas|ran|awc|ir/i.test(key);
}

function getHostname(urlString) {
  const u = safeUrl(urlString);
  return u ? u.hostname.toLowerCase() : "";
}

function normalizeParamKeys(params) {
  const normalized = {};
  for (const [k, v] of Object.entries(params)) {
    normalized[k.toLowerCase()] = v;
  }
  return normalized;
}

/**
 * ---------------------------------------------------------
 * Platform Detection
 * ---------------------------------------------------------
 */
function detectPlatform(finalUrl, params) {
  const host = getHostname(finalUrl);
  const p = normalizeParamKeys(params);

  // Amazon Attribution
  if (p.maas || p.aa_campaignid || p.aa_adgroupid || p.aa_creativeid || /aa_maas/i.test(p.ref_ || "")) {
    return {
      name: "Amazon Attribution",
      confidence: "high",
      reason: "Detected maas / aa_* attribution parameters"
    };
  }

  // Amazon Creator Connections / Associates
  if (/amazon\./i.test(host)) {
    if (
      (p.campaignid || p.linkid || p.linkcode === "tr1") &&
      (p.tag || p.ascsubtag)
    ) {
      return {
        name: "Amazon Creator Connections",
        confidence: "medium",
        reason: "Amazon link with campaign-style params and affiliate tagging"
      };
    }

    if (p.tag) {
      return {
        name: "Amazon Associates",
        confidence: "high",
        reason: "Detected Amazon affiliate tag parameter"
      };
    }
  }

  // Impact
  if (p.irclickid) {
    return {
      name: "Impact",
      confidence: "high",
      reason: "Detected irclickid parameter"
    };
  }

  // Awin
  if (p.awc) {
    return {
      name: "Awin",
      confidence: "high",
      reason: "Detected awc parameter"
    };
  }

  if (p.click_id && /^1011[a-z0-9]+/i.test(p.click_id)) {
    return {
      name: "Awin",
      confidence: "medium",
      reason: "click_id pattern resembles Awin publisher click format"
    };
  }

  // CJ
  if (p.cjevent) {
    return {
      name: "CJ Affiliate",
      confidence: "high",
      reason: "Detected cjevent parameter"
    };
  }

  // Rakuten
  if (p.ranmid || p.raneaid || p.ransiteid) {
    return {
      name: "Rakuten Advertising",
      confidence: "high",
      reason: "Detected Rakuten tracking parameters"
    };
  }

  // PartnerStack
  if (p.ps_xid || p.ps_partner_key) {
    return {
      name: "PartnerStack",
      confidence: "high",
      reason: "Detected PartnerStack parameters"
    };
  }

  // ShareASale / affiliate generic
  if (p.afftrack) {
    return {
      name: "Affiliate Network",
      confidence: "medium",
      reason: "Detected generic afftrack parameter"
    };
  }

  return {
    name: "Unknown / Direct",
    confidence: "low",
    reason: "No strong affiliate platform signature detected"
  };
}

/**
 * ---------------------------------------------------------
 * Traffic Type Detection
 * ---------------------------------------------------------
 */
function detectTrafficType(finalUrl, params, platform) {
  const p = normalizeParamKeys(params);

  if (p.gclid || p.gbraid || p.wbraid || p.gad_campaignid) {
    return {
      traffic_type: "Paid Search / Google Ads",
      traffic_note: "Google Ads click identifiers detected"
    };
  }

  if (p.fbclid) {
    return {
      traffic_type: "Paid Social / Meta Ads",
      traffic_note: "Meta click identifier detected"
    };
  }

  if (p.ttclid) {
    return {
      traffic_type: "Paid Social / TikTok Ads",
      traffic_note: "TikTok click identifier detected"
    };
  }

  if (p.msclkid) {
    return {
      traffic_type: "Paid Search / Microsoft Ads",
      traffic_note: "Microsoft Ads click identifier detected"
    };
  }

  if (/affiliate/i.test(p.utm_medium || "")) {
    return {
      traffic_type: "Affiliate",
      traffic_note: "utm_medium=affiliate"
    };
  }

  if (/Amazon Attribution/i.test(platform.name)) {
    return {
      traffic_type: "Attribution / Offsite Ads",
      traffic_note: "Amazon Attribution parameter pattern detected"
    };
  }

  if (/Associates|Awin|Impact|CJ|Rakuten|PartnerStack|Affiliate/i.test(platform.name)) {
    return {
      traffic_type: "Affiliate",
      traffic_note: "Affiliate platform signature detected"
    };
  }

  return {
    traffic_type: "Unknown / Mixed",
    traffic_note: "No dominant traffic signature detected"
  };
}

/**
 * ---------------------------------------------------------
 * Tracking Layers
 * ---------------------------------------------------------
 */
function detectTrackingLayers(params, platform, publisher) {
  const p = normalizeParamKeys(params);
  const layers = [];

  if (platform?.name && platform.name !== "Unknown / Direct") {
    layers.push(platform.name);
  }

  if (publisher?.publisher) {
    layers.push("Publisher Ownership");
  }

  if (p.gclid || p.gbraid || p.wbraid || p.gad_campaignid) {
    layers.push("Google Ads");
  }

  if (p.fbclid) {
    layers.push("Meta Ads");
  }

  if (p.ttclid) {
    layers.push("TikTok Ads");
  }

  if (p.msclkid) {
    layers.push("Microsoft Ads");
  }

  if (p.tag) {
    layers.push("Affiliate Tag");
  }

  if (p.coupon) {
    layers.push("Coupon Signal");
  }

  return [...new Set(layers)];
}

/**
 * ---------------------------------------------------------
 * Publisher Intelligence
 * ---------------------------------------------------------
 */
function detectPublisher(finalUrl, params) {
  const host = getHostname(finalUrl);
  const allText = `${finalUrl} ${JSON.stringify(params)}`.toLowerCase();
  const p = normalizeParamKeys(params);

  for (const rule of PUBLISHER_RULES) {
    for (const pattern of rule.match) {
      if (pattern.test(allText)) {
        let subSite = null;

        if (rule.subMap) {
          for (const domain of Object.keys(rule.subMap)) {
            if (host.includes(domain) || allText.includes(domain)) {
              subSite = rule.subMap[domain];
              break;
            }
          }
        }

        return {
          publisher: rule.name,
          sub_site: subSite,
          type: rule.type,
          confidence: "high"
        };
      }
    }
  }

  if (p.utm_source) {
    const source = String(p.utm_source).trim();

    if (/futurepublishing/i.test(source)) {
      return {
        publisher: "Future Publishing",
        sub_site: null,
        type: "Media Affiliate",
        confidence: "high"
      };
    }

    return {
      publisher: source,
      sub_site: null,
      type: "Unknown Affiliate / Publisher",
      confidence: "medium"
    };
  }

  return {
    publisher: null,
    sub_site: null,
    type: null,
    confidence: "low"
  };
}

/**
 * ---------------------------------------------------------
 * Commission Engine
 * ---------------------------------------------------------
 */
function detectCommissionEngine(platform, params, publisher) {
  const p = normalizeParamKeys(params);

  let primaryClaimer = "Unknown";
  let conflictLevel = "Low";
  const secondarySignals = [];
  let note = "No strong commission conflict detected";

  if (/Amazon Attribution/i.test(platform.name)) {
    primaryClaimer = "Amazon Attribution";
  } else if (/Amazon Creator Connections/i.test(platform.name)) {
    primaryClaimer = publisher?.publisher
      ? `${platform.name} (${publisher.publisher})`
      : "Amazon Creator Connections";
  } else if (/Amazon Associates/i.test(platform.name)) {
    primaryClaimer = publisher?.publisher
      ? `Amazon Associates (${publisher.publisher})`
      : "Amazon Associates";
  } else if (/Awin|Impact|CJ Affiliate|Rakuten Advertising|PartnerStack|Affiliate/i.test(platform.name)) {
    primaryClaimer = publisher?.publisher
      ? `${platform.name} (${publisher.publisher})`
      : platform.name;
  } else if (publisher?.publisher) {
    primaryClaimer = `Publisher / Media (${publisher.publisher})`;
  }

  if (p.gclid || p.gbraid || p.wbraid || p.gad_campaignid) {
    secondarySignals.push("Google Ads");
  }
  if (p.fbclid) {
    secondarySignals.push("Meta Ads");
  }
  if (p.ttclid) {
    secondarySignals.push("TikTok Ads");
  }
  if (p.msclkid) {
    secondarySignals.push("Microsoft Ads");
  }
  if (p.coupon) {
    secondarySignals.push("Coupon");
  }

  if (
    /Awin|Impact|CJ Affiliate|Rakuten Advertising|Amazon Associates|Amazon Creator Connections|Affiliate/i.test(platform.name) &&
    secondarySignals.some((x) => /Ads/.test(x))
  ) {
    conflictLevel = "High";
    note = "Affiliate platform detected together with paid media click signals";
  } else if (
    /Amazon Attribution/i.test(platform.name) &&
    (p.tag || p.ascsubtag)
  ) {
    conflictLevel = "Medium";
    note = "Attribution and affiliate-style tag signals appear together";
  }

  return {
    primary_claimer: primaryClaimer,
    conflict_level: conflictLevel,
    secondary_signals: secondarySignals,
    note
  };
}

/**
 * ---------------------------------------------------------
 * Redirect Chain
 * ---------------------------------------------------------
 * 当前先保留基础版。后续你要接真实跳转抓取时，再加 fetch/manual redirect。
 */
function buildRedirectChain(originalUrl, finalUrl) {
  if (originalUrl === finalUrl) {
    return [{ url: originalUrl }];
  }

  return [{ url: originalUrl }, { url: finalUrl }];
}

/**
 * ---------------------------------------------------------
 * Main Analyzer
 * ---------------------------------------------------------
 */
function analyzeUrl(inputUrl) {
  const urlObj = safeUrl(inputUrl);
  if (!urlObj) {
    throw new Error("Invalid URL");
  }

  const finalUrl = urlObj.toString();
  const params = parseQueryParams(urlObj);

  const platform = detectPlatform(finalUrl, params);
  const publisher = detectPublisher(finalUrl, params);
  const traffic = detectTrafficType(finalUrl, params, platform);
  const commission = detectCommissionEngine(platform, params, publisher);
  const trackingLayers = detectTrackingLayers(params, platform, publisher);
  const keyParams = pickKeyParams(params);
  const redirectChain = buildRedirectChain(inputUrl, finalUrl);

  return {
    original_url: inputUrl,
    final_url: finalUrl,
    platform,
    traffic_type: traffic.traffic_type,
    traffic_note: traffic.traffic_note,
    publisher,
    commission_engine: commission,
    tracking_layers: trackingLayers,
    key_params: keyParams,
    redirect_chain: redirectChain
  };
}

/**
 * ---------------------------------------------------------
 * Routes
 * ---------------------------------------------------------
 */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "BrandShuo Attribution Checker API",
    version: "v1.9"
  });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { url } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        error: "Missing required field: url"
      });
    }

    const data = analyzeUrl(url);

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Unexpected server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`BrandShuo Attribution Checker API running on port ${PORT}`);
});
