// BrandShuo Attribution Checker API v2.2

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

function normalizeInput(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw)) return "https://" + raw;

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

/* =========================
   Redirect Chain (1 hop)
========================= */

function fetchHead(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;

    const req = lib.request(
      url,
      { method: "HEAD", timeout: 2500 },
      (res) => {
        resolve({ location: res.headers.location || null });
      }
    );

    req.on("error", () => resolve({ location: null }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ location: null });
    });

    req.end();
  });
}

async function resolveChain(url) {
  const chain = [url];

  try {
    const { location } = await fetchHead(url);
    if (location) {
      const next = new URL(location, url).toString();
      if (next !== url) chain.push(next);
    }
  } catch {}

  return chain;
}

/* =========================
   Amazon Detection
========================= */

function buildAmazonRules(p) {
  return [
    p.tag ? "tag=true" : "tag=false",
    p.ascsubtag ? "ascsubtag=true" : "ascsubtag=false",
    p.campaignid ? "campaignId=true" : "campaignId=false",
    p.linkid ? "linkId=true" : "linkId=false",
    (p.linkcode || "").toLowerCase() === "tr1" ? "linkCode=tr1" : "linkCode!=tr1",
    p.creatorid ? "creatorId=true" : "creatorId=false",
    p.aa_campaignid ? "aa_campaignid=true" : "aa_campaignid=false",
    p.aa_adgroupid ? "aa_adgroupid=true" : "aa_adgroupid=false",
    p.aa_creativeid ? "aa_creativeid=true" : "aa_creativeid=false",
    p.maas ? "maas=true" : "maas=false"
  ];
}

function detectAmazon(urlObj, p) {
  if (!urlObj) return null;

  const host = urlObj.hostname.toLowerCase();
  if (!host.includes("amazon")) return null;

  const hasAA =
    p.aa_campaignid ||
    p.aa_adgroupid ||
    p.aa_creativeid ||
    p.maas ||
    String(p.ref_ || "").includes("aa_");

  if (hasAA) {
    return buildResult("Amazon Attribution", "Amazon", "Amazon Attribution",
      ["aa_*", "maas"],
      buildAmazonRules(p),
      "measurement_only",
      "Amazon Attribution"
    );
  }

  if (p.tag) {
    return buildResult("Amazon Associates", "Amazon", "Amazon Associates",
      ["tag"],
      buildAmazonRules(p),
      "affiliate_commission",
      "Amazon Associates",
      p.tag
    );
  }

  if (p.campaignid && p.linkid && (p.linkcode || "").toLowerCase() === "tr1") {
    return buildResult("Amazon Creator Connections", "Amazon",
      "Amazon Creator Connections",
      ["campaignId", "linkId", "tr1"],
      buildAmazonRules(p),
      "creator_bonus_or_campaign",
      "Amazon Creator Connections"
    );
  }

  return null;
}

/* =========================
   AvantLink
========================= */

function detectAvantLink(p) {
  if (p.avad || String(p.utm_medium || "").toUpperCase() === "AVLK") {
    return buildResult(
      "AvantLink Affiliate",
      "AvantLink",
      "Affiliate Tracking",
      ["avad", "rpi", "AVLK"],
      [],
      "affiliate_commission",
      "AvantLink",
      p.rpi
    );
  }
  return null;
}

/* =========================
   Paid Ads
========================= */

function detectAds(p) {
  if (p.utm_source === "criteo" || Object.keys(p).some(k => k.startsWith("cto_"))) {
    return buildResult("Criteo Ads", "Criteo", "Paid Ads", ["cto_*"], [], "paid_ads", "Criteo");
  }

  if (p.gclid || p.gbraid || p.wbraid) {
    return buildResult("Google Ads", "Google", "Paid Ads", ["gclid"], [], "paid_ads", "Google");
  }

  if (p.fbclid) {
    return buildResult("Meta Ads", "Meta", "Paid Ads", ["fbclid"], [], "paid_ads", "Meta");
  }

  if (p.ttclid) {
    return buildResult("TikTok Ads", "TikTok", "Paid Ads", ["ttclid"], [], "paid_ads", "TikTok");
  }

  if (p.msclkid) {
    return buildResult("Microsoft Ads", "Microsoft", "Paid Ads", ["msclkid"], [], "paid_ads", "Microsoft");
  }

  return null;
}

/* =========================
   Affiliate Networks
========================= */

function detectAffiliate(p) {
  if (p.irclickid) return buildResult("Impact", "Impact", "Affiliate", ["irclickid"], [], "affiliate_commission", "Impact");
  if (p.awc) return buildResult("Awin", "Awin", "Affiliate", ["awc"], [], "affiliate_commission", "Awin");
  if (p.cjevent) return buildResult("CJ", "CJ", "Affiliate", ["cjevent"], [], "affiliate_commission", "CJ");
  if (p.ranmid) return buildResult("Rakuten", "Rakuten", "Affiliate", ["ranmid"], [], "affiliate_commission", "Rakuten");
  if (p.skimlinks) return buildResult("Skimlinks", "Skimlinks", "Affiliate", ["skimlinks"], [], "affiliate_commission", "Skimlinks");

  return null;
}

/* =========================
   Result Builder
========================= */

function buildResult(title, platform, type, signals, amazonRules, payoutModel, owner, publisher = null) {
  return {
    classification: {
      title,
      platform,
      type,
      subtype: "",
      verdict: "Detected",
      confidenceScore: 90,
      explanation: "Detected based on known tracking parameters"
    },
    signals,
    amazon_rules: amazonRules,
    matched_layers: [platform],
    traffic_sources: [],
    commission_engine: {
      payout_model: payoutModel,
      commission_owner: owner,
      attribution_owner: owner,
      publisher_owner: publisher,
      network_owner: platform,
      assist_layers: [],
      override_risk: "low",
      override_reasons: [],
      payout_confidence: 90,
      summary: `${platform} tracking detected`
    }
  };
}

/* =========================
   API
========================= */

app.post("/api/analyze", async (req, res) => {
  try {
    const input = normalizeInput(req.body.url);
    const urlObj = safeUrl(input);
    const params = parseParams(urlObj);
    const chain = await resolveChain(input);

    const result =
      detectAmazon(urlObj, params) ||
      detectAvantLink(params) ||
      detectAds(params) ||
      detectAffiliate(params) ||
      buildResult("Unknown", "Unknown", "Unknown", [], [], "unknown", "Unknown");

    res.json({
      success: true,
      hostname: urlObj?.hostname || "",
      final_url: chain[chain.length - 1],
      redirect_chain: chain,
      params,
      ...result
    });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 BrandShuo API v2.2 running on port 3000");
});
