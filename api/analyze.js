// server.js — BrandShuo Attribution Checker API (v2.1)

const express = require("express");
const cors = require("cors");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* =========================
   Utils
========================= */

function normalizePossiblyPartialUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw)) return "https://" + raw;

  // param-only → default Amazon container (for parsing)
  if (raw.includes("=")) {
    return "https://www.amazon.com/?" + raw.replace(/^\?/, "");
  }

  return raw;
}

function safeUrl(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function parseParams(urlObj) {
  const p = {};
  if (!urlObj) return p;
  urlObj.searchParams.forEach((v, k) => {
    p[String(k).toLowerCase()] = v;
  });
  return p;
}

function pick(arr) {
  return arr.filter(Boolean);
}

function hostIncludes(hostname, list) {
  return list.some((d) => hostname.includes(d));
}

/* =========================
   Redirect (single hop, safe)
========================= */

function fetchHead(url, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(
      url,
      { method: "HEAD", timeout: timeoutMs, headers: { "User-Agent": "BS-Checker/2.1" } },
      (res) => {
        const loc = res.headers.location || null;
        resolve({ location: loc });
      }
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ location: null });
    });
    req.on("error", () => resolve({ location: null }));
    req.end();
  });
}

async function resolveChain(initialUrl) {
  const chain = [initialUrl];
  try {
    const { location } = await fetchHead(initialUrl);
    if (location) {
      const next = new URL(location, initialUrl).toString();
      if (next !== initialUrl) chain.push(next);
    }
  } catch {}
  return chain;
}

/* =========================
   Amazon Detection
   Priority: Attribution > ASS > ACC
========================= */

function buildAmazonRules(params) {
  const has = (k) => Object.prototype.hasOwnProperty.call(params, k);

  return [
    has("tag") ? "tag=true" : "tag=false",
    has("ascsubtag") ? "ascsubtag=true" : "ascsubtag=false",
    has("campaignid") ? "campaignId=true" : "campaignId=false",
    has("linkid") ? "linkId=true" : "linkId=false",
    String(params.linkcode || "").toLowerCase() === "tr1" ? "linkCode=tr1" : "linkCode!=tr1",
    has("creatorid") ? "creatorId=true" : "creatorId=false",
    has("aa_campaignid") ? "aa_campaignid=true" : "aa_campaignid=false",
    has("aa_adgroupid") ? "aa_adgroupid=true" : "aa_adgroupid=false",
    has("aa_creativeid") ? "aa_creativeid=true" : "aa_creativeid=false",
    has("maas") ? "maas=true" : "maas=false"
  ];
}

function detectAmazon(urlObj, params) {
  if (!urlObj) return null;
  const hostname = urlObj.hostname.toLowerCase();

  if (!hostIncludes(hostname, ["amazon.", "amzn.to"])) return null;

  const hasTag = !!params.tag;
  const hasAsc = !!params.ascsubtag;

  const hasAA =
    !!params.aa_campaignid ||
    !!params.aa_adgroupid ||
    !!params.aa_creativeid ||
    !!params.maas ||
    String(params.ref_ || "").toLowerCase().includes("aa_");

  const hasCampaignId = !!params.campaignid;
  const hasLinkId = !!params.linkid;
  const hasCreatorId = !!params.creatorid;
  const hasTr1 = String(params.linkcode || "").toLowerCase() === "tr1";

  // 1) Attribution
  if (hasAA) {
    const signals = pick([
      params.aa_campaignid && "param:aa_campaignid",
      params.aa_adgroupid && "param:aa_adgroupid",
      params.aa_creativeid && "param:aa_creativeid",
      params.maas && "param:maas",
      String(params.ref_ || "").toLowerCase().includes("aa_") && "ref_:aa_*"
    ]);

    return {
      classification: {
        title: "Amazon Attribution",
        platform: "Amazon",
        type: "Amazon Attribution",
        subtype: "Off-Amazon measurement / attribution",
        verdict: "High-confidence Amazon Attribution link",
        confidenceScore: 96,
        explanation:
          "Contains Amazon Ads measurement signals such as aa_campaignid / aa_adgroupid / aa_creativeid / maas or aa_* ref_."
      },
      signals,
      amazon_rules: buildAmazonRules(params),
      matched_layers: ["Amazon Attribution"],
      traffic_sources: [],
      commission_engine: {
        payout_model: "measurement_only",
        commission_owner: "No direct affiliate commission visible",
        attribution_owner: "Amazon Attribution",
        publisher_owner: null,
        network_owner: null,
        assist_layers: [],
        override_risk: "low",
        override_reasons: [],
        payout_confidence: 88,
        summary:
          "This link most likely supports attribution measurement rather than direct affiliate payout."
      }
    };
  }

  // 2) ASS (tag has priority)
  if (hasTag) {
    const signals = pick([
      "param:tag",
      hasAsc && "param:ascsubtag",
      params.linkcode && `linkCode:${params.linkcode}`,
      params.camp && "param:camp",
      params.creative && "param:creative"
    ]);

    return {
      classification: {
        title: "Amazon Associates",
        platform: "Amazon",
        type: "Amazon Associates",
        subtype: hasAsc ? "Associates + subtag tracking" : "Special Link / tracking ID",
        verdict: "High-confidence Amazon Associates link",
        confidenceScore: 95,
        explanation:
          "Contains the tag parameter, which is the strongest public signal for Amazon Associates."
      },
      signals,
      amazon_rules: buildAmazonRules(params),
      matched_layers: ["Amazon Associates", ...(hasAsc ? ["Amazon Subtag Tracking"] : [])],
      traffic_sources: [],
      commission_engine: {
        payout_model: "affiliate_commission",
        commission_owner: "Amazon Associates publisher",
        attribution_owner: "Amazon Associates",
        publisher_owner: params.tag || null,
        network_owner: null,
        assist_layers: hasAsc ? ["Subtag Tracking"] : [],
        override_risk: "low",
        override_reasons: [],
        payout_confidence: 94,
        summary: hasAsc
          ? "Likely Amazon Associates commission to the publisher tied to the tag parameter, with additional subtag tracking."
          : "Likely Amazon Associates commission to the publisher tied to the tag parameter."
      }
    };
  }

  // 3) ACC strong
  if (hasCampaignId && hasLinkId && hasTr1) {
    return {
      classification: {
        title: "Amazon Creator Connections",
        platform: "Amazon",
        type: "Amazon Creator Connections",
        subtype: "High-confidence creator campaign link",
        verdict: "Likely ACC link (high confidence)",
        confidenceScore: 90,
        explanation:
          "Shows campaignId + linkId + linkCode=tr1 without tag parameter."
      },
      signals: ["param:campaignId", "param:linkId", "linkCode:tr1", ...(hasCreatorId ? ["param:creatorId"] : [])],
      amazon_rules: buildAmazonRules(params),
      matched_layers: ["Amazon Creator Connections"],
      traffic_sources: [],
      commission_engine: {
        payout_model: "creator_bonus_or_campaign",
        commission_owner: "Creator campaign participant",
        attribution_owner: "Amazon Creator Connections",
        publisher_owner: null,
        network_owner: null,
        assist_layers: [],
        override_risk: "low",
        override_reasons: [],
        payout_confidence: 82,
        summary:
          "This link most likely belongs to a creator campaign or bonus-commission style flow."
      }
    };
  }

  // fallback Amazon
  return {
    classification: {
      title: "Amazon Link",
      platform: "Amazon",
      type: "Amazon Link",
      subtype: "Unknown",
      verdict: "Amazon URL detected, but no clear affiliate / attribution pattern",
      confidenceScore: 40,
      explanation:
        "Amazon URL without strong signals for Associates, Attribution, or Creator Connections."
    },
    signals: [],
    amazon_rules: buildAmazonRules(params),
    matched_layers: ["Amazon"],
    traffic_sources: [],
    commission_engine: {
      payout_model: "unknown",
      commission_owner: "Unknown",
      attribution_owner: "Unknown",
      publisher_owner: null,
      network_owner: null,
      assist_layers: [],
      override_risk: "low",
      override_reasons: [],
      payout_confidence: 40,
      summary: "No clear commission model detected."
    }
  };
}

/* =========================
   Paid Ads Detection
========================= */

function detectPaidAds(urlObj, params) {
  if (!urlObj) return null;
  const hostname = urlObj.hostname.toLowerCase();
  const utmSource = String(params.utm_source || "").toLowerCase();

  // Criteo
  const ctoKeys = Object.keys(params).filter((k) => k.startsWith("cto_"));
  if (utmSource === "criteo" || ctoKeys.length > 0) {
    return {
      classification: {
        title: "Criteo Ads Tracking",
        platform: "Criteo",
        type: "Display Ads Tracking",
        subtype: "Paid Traffic Attribution",
        verdict: "Paid ads tracking link detected",
        confidenceScore: 95,
        explanation:
          "Detected via utm_source=criteo and/or Criteo-specific cto_* parameters."
      },
      signals: pick([
        utmSource === "criteo" && "param:utm_source=criteo",
        ...ctoKeys.map((k) => `param:${k}`)
      ]),
      amazon_rules: [],
      matched_layers: ["Criteo", "Paid Ads"],
      traffic_sources: ["Criteo Ads"],
      commission_engine: {
        payout_model: "paid_ads",
        commission_owner: "No affiliate commission",
        attribution_owner: "Criteo Ads",
        publisher_owner: null,
        network_owner: "Criteo",
        assist_layers: ["Display Ads"],
        override_risk: "low",
        override_reasons: [],
        payout_confidence: 95,
        summary:
          "This looks like paid advertising traffic from Criteo, not an affiliate payout link."
      }
    };
  }

  // Google Ads
  if (params.gclid || params.gbraid || params.wbraid || params.gad_campaignid) {
    return {
      classification: {
        title: "Google Ads Tracking",
        platform: "Google Ads",
        type: "Paid Traffic Tracking",
        subtype: "Ad Click Identifier",
        verdict: "Paid ads tracking link detected",
        confidenceScore: 94,
        explanation:
          "Detected via gclid / gbraid / wbraid / gad_campaignid."
      },
      signals: pick([
        params.gclid && "param:gclid",
        params.gbraid && "param:gbraid",
        params.wbraid && "param:wbraid",
        params.gad_campaignid && "param:gad_campaignid"
      ]),
      amazon_rules: [],
      matched_layers: ["Google Ads", "Paid Ads"],
      traffic_sources: ["Google Ads"],
      commission_engine: {
        payout_model: "paid_ads",
        commission_owner: "No affiliate commission",
        attribution_owner: "Google Ads",
        publisher_owner: null,
        network_owner: "Google Ads",
        assist_layers: ["Paid Search / Ads"],
        override_risk: "low",
        override_reasons: [],
        payout_confidence: 94,
        summary:
          "This looks like paid traffic tracking from Google Ads, not an affiliate commission link."
      }
    };
  }

  // Meta Ads
  if (params.fbclid) {
    return {
      classification: {
        title: "Meta Ads Tracking",
        platform: "Meta Ads",
        type: "Paid Traffic Tracking",
        subtype: "Ad Click Identifier",
        verdict: "Paid ads tracking link detected",
        confidenceScore: 93,
        explanation: "Detected via fbclid."
      },
      signals: ["param:fbclid"],
      amazon_rules: [],
      matched_layers: ["Meta Ads", "Paid Ads"],
      traffic_sources: ["Meta Ads"],
      commission_engine: {
        payout_model: "paid_ads",
        commission_owner: "No affiliate commission",
        attribution_owner: "Meta Ads",
        publisher_owner: null,
        network_owner: "Meta Ads",
        assist_layers: ["Paid Social"],
        override_risk: "low",
        override_reasons: [],
        payout_confidence: 93,
        summary:
          "This looks like paid traffic tracking from Meta Ads, not an affiliate commission link."
      }
    };
  }

  // TikTok Ads
  if (params.ttclid) {
    return {
      classification: {
        title: "TikTok Ads Tracking",
        platform: "TikTok Ads",
        type: "Paid Traffic Tracking",
        subtype: "Ad Click Identifier",
        verdict: "Paid ads tracking link detected",
        confidenceScore: 93,
        explanation: "Detected via ttclid."
      },
      signals: ["param:ttclid"],
      amazon_rules: [],
      matched_layers: ["TikTok Ads", "Paid Ads"],
      traffic_sources: ["TikTok Ads"],
      commission_engine: {
        payout_model: "paid_ads",
        commission_owner: "No affiliate commission",
        attribution_owner: "TikTok Ads",
        publisher_owner: null,
        network_owner: "TikTok Ads",
        assist_layers: ["Paid Social"],
        override_risk: "low",
        override_reasons: [],
        payout_confidence: 93,
        summary:
          "This looks like paid traffic tracking from TikTok Ads, not an affiliate commission link."
      }
    };
  }

  // Microsoft Ads
  if (params.msclkid) {
    return {
      classification: {
        title: "Microsoft Ads Tracking",
        platform: "Microsoft Ads",
        type: "Paid Traffic Tracking",
        subtype: "Ad Click Identifier",
        verdict: "Paid ads tracking link detected",
        confidenceScore: 92,
        explanation: "Detected via msclkid."
      },
      signals: ["param:msclkid"],
      amazon_rules: [],
      matched_layers: ["Microsoft Ads", "Paid Ads"],
      traffic_sources: ["Microsoft Ads"],
      commission_engine: {
        payout_model: "paid_ads",
        commission_owner: "No affiliate commission",
        attribution_owner: "Microsoft Ads",
        publisher_owner: null,
        network_owner: "Microsoft Ads",
        assist_layers: ["Paid Search / Ads"],
        override_risk: "low",
        override_reasons: [],
        payout_confidence: 92,
        summary:
          "This looks like paid traffic tracking from Microsoft Ads, not an affiliate commission link."
      }
    };
  }

  return null;
}

/* =========================
   Basic Affiliate Networks (non-Amazon)
========================= */

function detectAffiliateNetworks(urlObj, params) {
  if (!urlObj) return null;
  const host = urlObj.hostname.toLowerCase();

  // Impact
  if (params.irclickid || host.includes("impact")) {
    return baseNetwork("Impact", "Affiliate Tracking", ["param:irclickid"], ["Impact"]);
  }

  // Awin / ShareASale
  if (params.awc || host.includes("awin") || host.includes("shareasale")) {
    return baseNetwork("Awin / ShareASale", "Affiliate Tracking", ["param:awc"], ["Awin", "ShareASale"]);
  }

  // CJ
  if (params.cjevent || host.includes("cj")) {
    return baseNetwork("CJ Affiliate", "Affiliate Tracking", ["param:cjevent"], ["CJ Affiliate"]);
  }

  // Rakuten
  if (params.ranmid || params.raneaID || params.ransiteid || host.includes("rakuten")) {
    return baseNetwork("Rakuten Advertising", "Affiliate Tracking", ["param:ran*"], ["Rakuten"]);
  }

  // Skimlinks / Sovrn
  if (params.skimlinks || host.includes("skimlinks")) {
    return baseNetwork("Skimlinks", "Affiliate Aggregator", ["param:skimlinks"], ["Skimlinks"]);
  }
  if (params.vglnk || params.vgtid || host.includes("viglink") || host.includes("sovrn")) {
    return baseNetwork("Sovrn Commerce", "Affiliate Aggregator", ["param:vglnk/vgtid"], ["Sovrn"]);
  }

  return null;
}

function baseNetwork(platform, subtype, signals, layers) {
  return {
    classification: {
      title: platform,
      platform,
      type: "Affiliate Tracking",
      subtype,
      verdict: "Affiliate tracking link detected",
      confidenceScore: 88,
      explanation: `Detected via ${signals.join(", ")}.`
    },
    signals,
    amazon_rules: [],
    matched_layers: layers,
    traffic_sources: [],
    commission_engine: {
      payout_model: "affiliate_commission",
      commission_owner: `${platform} publisher`,
      attribution_owner: platform,
      publisher_owner: null,
      network_owner: platform,
      assist_layers: [],
      override_risk: "low",
      override_reasons: [],
      payout_confidence: 86,
      summary: `Likely affiliate commission via ${platform}.`
    }
  };
}

/* =========================
   Compose Result
========================= */

function composeResult({ urlObj, params, chain, detection }) {
  const finalUrl = chain[chain.length - 1];
  const hostname = urlObj?.hostname || new URL(finalUrl).hostname;

  return {
    success: true,
    hostname,
    final_url: finalUrl,
    redirect_chain: chain,
    params,
    signals: detection.signals || [],
    amazon_rules: detection.amazon_rules || [],
    matched_layers: detection.matched_layers || [],
    traffic_sources: detection.traffic_sources || [],
    risks: detection.risks || [],
    notes: detection.notes || [],
    classification: detection.classification || {},
    commission_engine: detection.commission_engine || {}
  };
}

/* =========================
   Main API
========================= */

app.post("/api/analyze", async (req, res) => {
  try {
    const input = normalizePossiblyPartialUrl(req.body?.url || "");
    const urlObj = safeUrl(input);
    const params = parseParams(urlObj);

    const chain = await resolveChain(input);

    // Order:
    // 1. Amazon
    const amazon = detectAmazon(urlObj, params);
    if (amazon) {
      return res.json(composeResult({ urlObj, params, chain, detection: amazon }));
    }

    // 2. Paid Ads
    const ads = detectPaidAds(urlObj, params);
    if (ads) {
      return res.json(composeResult({ urlObj, params, chain, detection: ads }));
    }

    // 3. Affiliate Networks
    const aff = detectAffiliateNetworks(urlObj, params);
    if (aff) {
      return res.json(composeResult({ urlObj, params, chain, detection: aff }));
    }

    // 4. Fallback
    return res.json(
      composeResult({
        urlObj,
        params,
        chain,
        detection: {
          classification: {
            title: "Generic Link",
            platform: "Unknown",
            type: "Unknown",
            subtype: "Unclassified",
            verdict: "No clear affiliate / attribution / ads signals detected",
            confidenceScore: 30,
            explanation:
              "No known parameters for affiliate tracking, paid ads, or Amazon attribution were found."
          },
          signals: [],
          amazon_rules: [],
          matched_layers: [],
          traffic_sources: [],
          commission_engine: {
            payout_model: "unknown",
            commission_owner: "Unknown",
            attribution_owner: "Unknown",
            publisher_owner: null,
            network_owner: null,
            assist_layers: [],
            override_risk: "low",
            override_reasons: [],
            payout_confidence: 30,
            summary: "No identifiable monetization or attribution model."
          }
        }
      })
    );
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message || "Server error"
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "BrandShuo Attribution Checker API v2.1" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
