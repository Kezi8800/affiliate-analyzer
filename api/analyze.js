const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

/**
 * =========================
 * Publisher Intelligence Rules
 * =========================
 */
const PUBLISHER_RULES = [
  {
    publisher: "Future Publishing",
    match: [
      /futurepublishing/i,
      /tomsguide\.com/i,
      /techradar\.com/i,
      /t3\.com/i,
      /homesandgardens\.com/i,
      /toms(?:hardware|guide)\.com/i
    ],
    subMap: {
      "tomsguide.com": "Tom's Guide",
      "tomshardware.com": "Tom's Hardware",
      "techradar.com": "TechRadar",
      "t3.com": "T3",
      "homesandgardens.com": "Homes & Gardens"
    },
    type: "Media Affiliate"
  },
  {
    publisher: "Red Ventures",
    match: [
      /cnet\.com/i,
      /zdnet\.com/i,
      /bankrate\.com/i,
      /thepointsguy\.com/i,
      /healthline\.com/i
    ],
    subMap: {
      "cnet.com": "CNET",
      "zdnet.com": "ZDNET",
      "bankrate.com": "Bankrate",
      "thepointsguy.com": "The Points Guy",
      "healthline.com": "Healthline"
    },
    type: "Media Affiliate"
  },
  {
    publisher: "Dotdash Meredith",
    match: [
      /investopedia\.com/i,
      /verywellfit\.com/i,
      /people\.com/i,
      /foodandwine\.com/i,
      /travelandleisure\.com/i
    ],
    subMap: {
      "investopedia.com": "Investopedia",
      "verywellfit.com": "Verywell Fit",
      "people.com": "People",
      "foodandwine.com": "Food & Wine",
      "travelandleisure.com": "Travel + Leisure"
    },
    type: "Media Affiliate"
  }
];

/**
 * =========================
 * Utility
 * =========================
 */
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseUrl(input) {
  const urlObj = new URL(input);
  const params = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = safeDecode(value);
  });
  return { urlObj, params };
}

function normalizeHostname(hostname = "") {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

function cleanText(value) {
  return value == null ? "" : String(value).trim();
}

/**
 * =========================
 * Redirect Chain Resolver (optional)
 * 说明：默认开关关掉，避免某些站点阻拦 HEAD/GET
 * 若你想开，改 ENABLE_REDIRECT_RESOLVE = true
 * =========================
 */
const ENABLE_REDIRECT_RESOLVE = false;

async function resolveRedirectChain(originalUrl) {
  if (!ENABLE_REDIRECT_RESOLVE) {
    return {
      original_url: originalUrl,
      final_url: originalUrl,
      redirect_chain: [],
      resolved: false
    };
  }

  try {
    const chain = [];
    let current = originalUrl;
    let finalUrl = originalUrl;

    const response = await axios.get(originalUrl, {
      maxRedirects: 8,
      validateStatus: () => true,
      timeout: 12000
    });

    finalUrl = response?.request?.res?.responseUrl || originalUrl;
    if (finalUrl && finalUrl !== originalUrl) {
      chain.push({
        from: originalUrl,
        to: finalUrl
      });
    }

    return {
      original_url: originalUrl,
      final_url: finalUrl,
      redirect_chain: chain,
      resolved: true
    };
  } catch (e) {
    return {
      original_url: originalUrl,
      final_url: originalUrl,
      redirect_chain: [],
      resolved: false,
      error: e.message
    };
  }
}

/**
 * =========================
 * Platform Detection
 * =========================
 */
function detectPlatform(urlObj, params) {
  const hostname = normalizeHostname(urlObj.hostname);
  const full = `${urlObj.toString()} ${JSON.stringify(params)}`.toLowerCase();

  const has = (k) => Object.prototype.hasOwnProperty.call(params, k);

  // Amazon priority logic
  if (/amazon\./i.test(hostname)) {
    const hasTag = has("tag");
    const hasMaas = has("maas") || has("aa_campaignid") || has("aa_adgroupid") || has("aa_creativeid") || /ref_=aa_maas/i.test(full);
    const hasAccStyle = (
      has("campaignId") ||
      has("linkId") ||
      (params.linkCode && /tr1/i.test(params.linkCode)) ||
      (has("creative") && has("camp")) ||
      has("ascsubtag")
    );

    if (hasMaas) {
      return {
        name: "Amazon Attribution",
        family: "Amazon",
        subtype: "Attribution"
      };
    }

    if (hasTag && hasAccStyle) {
      return {
        name: "Amazon Creator Connections",
        family: "Amazon",
        subtype: "Creator Connections"
      };
    }

    if (hasAccStyle && !hasTag) {
      return {
        name: "Amazon Creator Connections",
        family: "Amazon",
        subtype: "Creator Connections"
      };
    }

    if (hasTag) {
      return {
        name: "Amazon Associates",
        family: "Amazon",
        subtype: "Associates"
      };
    }

    return {
      name: "Amazon",
      family: "Amazon",
      subtype: "Unknown"
    };
  }

  // Awin
  if (has("awc") || has("clickref") || /^1011l/i.test(params.click_id || "") || /awin/i.test(full)) {
    return {
      name: "Awin",
      family: "Affiliate Network",
      subtype: "Affiliate"
    };
  }

  // Impact
  if (has("irclickid") || has("impactclickid") || /impact/i.test(full)) {
    return {
      name: "Impact",
      family: "Affiliate Network",
      subtype: "Affiliate"
    };
  }

  // CJ
  if (has("cjevent")) {
    return {
      name: "CJ Affiliate",
      family: "Affiliate Network",
      subtype: "Affiliate"
    };
  }

  // Rakuten
  if (has("ranMID") || has("ranEAID") || has("ranSiteID")) {
    return {
      name: "Rakuten Advertising",
      family: "Affiliate Network",
      subtype: "Affiliate"
    };
  }

  // ShareASale / Awin old merged environments sometimes still show SAS params
  if (has("afftrack") || has("sscid") || has("shareasale")) {
    return {
      name: "ShareASale",
      family: "Affiliate Network",
      subtype: "Affiliate"
    };
  }

  // PartnerStack
  if (has("ps_xid") || has("ps_partner_key")) {
    return {
      name: "PartnerStack",
      family: "Partner / SaaS Referral",
      subtype: "Affiliate"
    };
  }

  // Partnerize / Pepperjam
  if (has("pjID") || has("pjMID")) {
    return {
      name: "Partnerize / Pepperjam",
      family: "Affiliate Network",
      subtype: "Affiliate"
    };
  }

  // Google Ads direct
  if (has("gclid") || has("wbraid") || has("gbraid") || has("gad_campaignid")) {
    return {
      name: "Google Ads",
      family: "Paid Media",
      subtype: "Ads"
    };
  }

  // Meta Ads
  if (has("fbclid")) {
    return {
      name: "Meta Ads",
      family: "Paid Media",
      subtype: "Ads"
    };
  }

  // TikTok Ads
  if (has("ttclid")) {
    return {
      name: "TikTok Ads",
      family: "Paid Media",
      subtype: "Ads"
    };
  }

  // Microsoft Ads
  if (has("msclkid")) {
    return {
      name: "Microsoft Ads",
      family: "Paid Media",
      subtype: "Ads"
    };
  }

  return {
    name: "Unknown",
    family: "Unknown",
    subtype: "Unknown"
  };
}

/**
 * =========================
 * Traffic Layer Detection
 * =========================
 */
function detectTrackingLayers(params, platform) {
  const layers = [];
  const has = (k) => Object.prototype.hasOwnProperty.call(params, k);

  if (platform?.name && platform.name !== "Unknown") {
    layers.push(platform.name);
  }

  if (has("utm_medium") && /affiliate/i.test(params.utm_medium)) {
    layers.push("Affiliate Traffic");
  }

  if (has("utm_medium") && /cpc|paid|ppc/i.test(params.utm_medium)) {
    layers.push("Paid Traffic");
  }

  if (has("gclid") || has("wbraid") || has("gbraid")) {
    layers.push("Google Ads");
  }

  if (has("fbclid")) {
    layers.push("Meta Ads");
  }

  if (has("ttclid")) {
    layers.push("TikTok Ads");
  }

  if (has("msclkid")) {
    layers.push("Microsoft Ads");
  }

  if (has("maas") || has("aa_campaignid") || has("aa_adgroupid") || has("aa_creativeid")) {
    layers.push("Amazon Attribution");
  }

  if (has("tag")) {
    layers.push("Amazon Associates Signal");
  }

  if (
    has("campaignId") ||
    has("linkId") ||
    has("ascsubtag") ||
    (params.linkCode && /tr1|ur2/i.test(params.linkCode))
  ) {
    layers.push("Creator / Commerce Signal");
  }

  return [...new Set(layers)];
}

/**
 * =========================
 * Publisher Detection
 * =========================
 */
function detectPublisher(urlObj, params) {
  const full = `${urlObj.toString()} ${JSON.stringify(params)}`;
  const hostname = normalizeHostname(urlObj.hostname);

  for (const rule of PUBLISHER_RULES) {
    for (const pattern of rule.match) {
      if (pattern.test(full)) {
        let subSite = null;

        if (rule.subMap) {
          for (const domain in rule.subMap) {
            if (hostname.includes(domain) || full.toLowerCase().includes(domain.toLowerCase())) {
              subSite = rule.subMap[domain];
              break;
            }
          }
        }

        // fallback: utm_source 命中子站名
        if (!subSite && params.utm_source) {
          const source = params.utm_source.toLowerCase();
          for (const domain in (rule.subMap || {})) {
            const siteName = String(rule.subMap[domain]).toLowerCase().replace(/[^a-z0-9]/g, "");
            const srcNorm = source.replace(/[^a-z0-9]/g, "");
            if (srcNorm.includes(siteName) || siteName.includes(srcNorm)) {
              subSite = rule.subMap[domain];
              break;
            }
          }
        }

        return {
          publisher: rule.publisher,
          sub_site: subSite,
          type: rule.type,
          confidence: "high"
        };
      }
    }
  }

  // Special handling for futurepublishing source
  if (params.utm_source && /futurepublishing/i.test(params.utm_source)) {
    return {
      publisher: "Future Publishing",
      sub_site: null,
      type: "Media Affiliate",
      confidence: "high"
    };
  }

  // Generic affiliate publisher source
  if (params.utm_source && /affiliate|publisher|media|futurepublishing|tomsguide/i.test(params.utm_source)) {
    return {
      publisher: params.utm_source,
      sub_site: null,
      type: "Affiliate / Publisher",
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
 * =========================
 * Parameter Signals
 * =========================
 */
function buildParameterSignals(params) {
  const picked = {};
  const importantKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "click_id",
    "awc",
    "irclickid",
    "cjevent",
    "ranMID",
    "ranEAID",
    "ranSiteID",
    "tag",
    "maas",
    "aa_campaignid",
    "aa_adgroupid",
    "aa_creativeid",
    "campaignId",
    "linkId",
    "linkCode",
    "ascsubtag",
    "gclid",
    "wbraid",
    "gbraid",
    "fbclid",
    "ttclid",
    "msclkid",
    "ps_xid",
    "ps_partner_key"
  ];

  importantKeys.forEach(key => {
    if (params[key] != null) picked[key] = params[key];
  });

  return picked;
}

/**
 * =========================
 * Traffic Type
 * =========================
 */
function inferTrafficType(platform, publisher, params) {
  const has = (k) => Object.prototype.hasOwnProperty.call(params, k);

  if (platform.name === "Amazon Attribution") return "Marketplace Ads / Attribution";
  if (platform.name === "Amazon Creator Connections") return "Creator Commerce Affiliate";
  if (platform.name === "Amazon Associates") return "Affiliate";
  if (publisher?.type === "Media Affiliate") return "Media Affiliate";
  if (platform.family === "Affiliate Network") return "Affiliate";
  if (has("gclid") || has("fbclid") || has("ttclid") || has("msclkid")) return "Paid Media";
  return "Unknown";
}

/**
 * =========================
 * Commission Engine
 * =========================
 */
function buildCommissionEngine({ platform, publisher, params, trackingLayers }) {
  const has = (k) => Object.prototype.hasOwnProperty.call(params, k);

  let primary_claimer = "Unknown";
  const secondary_signals = [];
  let conflict_level = "Low";
  let reason = "Insufficient commission ownership signals.";
  let confidence = "low";

  // Amazon priority
  if (platform.name === "Amazon Attribution") {
    primary_claimer = "Amazon Attribution";
    confidence = "high";
    reason = "Detected Amazon Attribution parameters such as maas / aa_campaignid.";
  } else if (platform.name === "Amazon Creator Connections") {
    primary_claimer = "Amazon Creator Connections";
    confidence = "high";
    reason = "Detected Creator Connections style signals such as creative+camp / ascsubtag / linkCode.";
  } else if (platform.name === "Amazon Associates") {
    primary_claimer = "Amazon Associates";
    confidence = "high";
    reason = "Detected Amazon Associates tag parameter.";
  } else if (platform.family === "Affiliate Network") {
    if (publisher?.publisher) {
      primary_claimer = `${platform.name} (${publisher.publisher})`;
      confidence = "high";
      reason = `Detected ${platform.name} affiliate network parameters and matched publisher ownership signals.`;
    } else {
      primary_claimer = platform.name;
      confidence = "medium";
      reason = `Detected ${platform.name} affiliate network parameters.`;
    }
  } else if (has("gclid") || has("fbclid") || has("ttclid") || has("msclkid")) {
    primary_claimer = platform.name !== "Unknown" ? platform.name : "Paid Media";
    confidence = "medium";
    reason = "Detected paid media click identifiers.";
  }

  if (has("gclid")) secondary_signals.push("Google Ads");
  if (has("fbclid")) secondary_signals.push("Meta Ads");
  if (has("ttclid")) secondary_signals.push("TikTok Ads");
  if (has("msclkid")) secondary_signals.push("Microsoft Ads");
  if (has("utm_medium") && /affiliate/i.test(params.utm_medium) && platform.family !== "Affiliate Network") {
    secondary_signals.push("Affiliate UTM Signal");
  }
  if (publisher?.publisher && !secondary_signals.includes(publisher.publisher)) {
    secondary_signals.push(publisher.publisher);
  }

  const affiliatePresent =
    platform.family === "Affiliate Network" ||
    platform.name === "Amazon Associates" ||
    platform.name === "Amazon Attribution" ||
    platform.name === "Amazon Creator Connections";

  const adsPresent = has("gclid") || has("fbclid") || has("ttclid") || has("msclkid");

  if (affiliatePresent && adsPresent) {
    conflict_level = "High";
    reason += " Mixed affiliate and paid media signals detected in the same URL.";
  } else if ((affiliatePresent && secondary_signals.length > 1) || trackingLayers.length >= 3) {
    conflict_level = "Medium";
  }

  return {
    primary_claimer,
    secondary_signals: [...new Set(secondary_signals)],
    conflict_level,
    reason,
    confidence
  };
}

/**
 * =========================
 * Confidence
 * =========================
 */
function inferOverallConfidence(platform, publisher, params) {
  const signalCount = Object.keys(buildParameterSignals(params)).length;

  if (platform.name !== "Unknown" && publisher?.confidence === "high" && signalCount >= 2) return "high";
  if (platform.name !== "Unknown" && signalCount >= 1) return "medium";
  return "low";
}

/**
 * =========================
 * Human Summary
 * =========================
 */
function buildSummary({ platform, publisher, trafficType, commissionEngine }) {
  const pieces = [];

  if (platform?.name && platform.name !== "Unknown") {
    pieces.push(`Primary platform appears to be ${platform.name}.`);
  } else {
    pieces.push("No strong platform match was found.");
  }

  if (trafficType && trafficType !== "Unknown") {
    pieces.push(`Traffic type is likely ${trafficType}.`);
  }

  if (publisher?.publisher) {
    if (publisher.sub_site) {
      pieces.push(`Publisher ownership points to ${publisher.publisher}, with the traffic likely coming from ${publisher.sub_site}.`);
    } else {
      pieces.push(`Publisher ownership points to ${publisher.publisher}.`);
    }
  }

  if (commissionEngine?.primary_claimer && commissionEngine.primary_claimer !== "Unknown") {
    pieces.push(`The most likely commission claimant is ${commissionEngine.primary_claimer}.`);
  }

  if (commissionEngine?.conflict_level === "High") {
    pieces.push("There is a high conflict risk because affiliate and paid media signals are mixed in the same link.");
  }

  return pieces.join(" ");
}

/**
 * =========================
 * API
 * =========================
 */
app.post("/api/analyze", async (req, res) => {
  try {
    const inputUrl = cleanText(req.body?.url);

    if (!inputUrl) {
      return res.status(400).json({ error: "Missing url" });
    }

    let resolved = {
      original_url: inputUrl,
      final_url: inputUrl,
      redirect_chain: [],
      resolved: false
    };

    resolved = await resolveRedirectChain(inputUrl);

    const { urlObj, params } = parseUrl(resolved.final_url);

    const platform = detectPlatform(urlObj, params);
    const publisher = detectPublisher(urlObj, params);
    const tracking_layers = detectTrackingLayers(params, platform);
    const parameter_signals = buildParameterSignals(params);
    const traffic_type = inferTrafficType(platform, publisher, params);
    const commission_engine = buildCommissionEngine({
      platform,
      publisher,
      params,
      trackingLayers: tracking_layers
    });
    const confidence = inferOverallConfidence(platform, publisher, params);
    const summary = buildSummary({
      platform,
      publisher,
      trafficType: traffic_type,
      commissionEngine: commission_engine
    });

    return res.json({
      version: "v1.9",
      tool: "BrandShuo Attribution Checker",
      input_url: inputUrl,
      final_url: resolved.final_url,
      redirect_chain: resolved.redirect_chain,
      resolved_redirects: resolved.resolved,
      platform,
      traffic_type,
      tracking_layers,
      publisher,
      commission_engine,
      parameter_signals,
      confidence,
      summary,
      analyzed_at: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: "Analysis failed",
      message: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("BrandShuo Attribution Checker API is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
