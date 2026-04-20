const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3000;

/* =========================
   基础工具函数
========================= */

function dedupe(arr) {
  return [...new Set(arr)];
}

function getUrl(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function getParams(url) {
  const obj = {};
  url.searchParams.forEach((v, k) => {
    obj[k.toLowerCase()] = v;
  });
  return obj;
}

/* =========================
   Redirect Chain
========================= */

const MAX_REDIRECTS = 5;

async function fetchRedirect(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
    });

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (loc) return new URL(loc, url).toString();
    }
  } catch {}
  return null;
}

async function resolveChain(input) {
  const chain = [input];
  let current = input;

  for (let i = 0; i < MAX_REDIRECTS; i++) {
    const next = await fetchRedirect(current);
    if (!next || chain.includes(next)) break;
    chain.push(next);
    current = next;
  }

  return chain;
}

/* =========================
   Amazon Detection
========================= */

function detectAmazon(url, params) {
  const host = url.hostname;

  if (!host.includes("amazon")) return null;

  // Attribution
  if (
    params.aa_campaignid ||
    params.aa_adgroupid ||
    params.aa_creativeid ||
    params.maas ||
    String(params.ref_ || "").includes("aa_")
  ) {
    return {
      platform: "Amazon",
      type: "Amazon Attribution",
      confidenceScore: 96,
      matchedLayers: ["Amazon Attribution"],
      signals: Object.keys(params).filter(k => k.includes("aa_") || k === "maas"),
      explanation: "Detected Amazon Attribution parameters"
    };
  }

  // Associates
  if (params.tag) {
    return {
      platform: "Amazon",
      type: "Amazon Associates",
      confidenceScore: 95,
      matchedLayers: ["Amazon Associates"],
      signals: ["tag", params.ascsubtag && "ascsubtag"].filter(Boolean),
      explanation: "Detected Amazon Associates tag"
    };
  }

  // Creator Connections (弱识别)
  if (params.campaignid || params.linkid || params.linkcode === "tr1") {
    return {
      platform: "Amazon",
      type: "Amazon Creator Connections",
      confidenceScore: 80,
      matchedLayers: ["Amazon Creator Connections"],
      signals: ["campaignId", "linkId", "linkCode"],
      explanation: "Detected creator-style parameters"
    };
  }

  return {
    platform: "Amazon",
    type: "Amazon Link",
    confidenceScore: 40,
    matchedLayers: ["Amazon"],
    signals: [],
    explanation: "Generic Amazon URL"
  };
}

/* =========================
   Walmart Detection
========================= */

function detectWalmart(url, params) {
  if (!url.hostname.includes("walmart")) return null;

  const isImpact =
    params.irgwc ||
    params.clickid ||
    String(params.sourceid || "").includes("imp_");

  const hasAffiliate =
    params.wmlspartner ||
    params.affiliates_ad_id ||
    params.campaign_id;

  if (isImpact && hasAffiliate) {
    return {
      platform: "Walmart",
      type: "Impact Affiliate",
      confidenceScore: 95,
      matchedLayers: ["Walmart", "Impact", "Affiliate Traffic"],
      signals: Object.keys(params),
      explanation: "Walmart affiliate via Impact detected"
    };
  }

  if (hasAffiliate) {
    return {
      platform: "Walmart",
      type: "Walmart Affiliate",
      confidenceScore: 88,
      matchedLayers: ["Walmart", "Affiliate"],
      signals: Object.keys(params),
      explanation: "Walmart affiliate detected"
    };
  }

  return {
    platform: "Walmart",
    type: "Walmart Link",
    confidenceScore: 40,
    matchedLayers: ["Walmart"],
    signals: [],
    explanation: "Plain Walmart URL"
  };
}

/* =========================
   Traffic Detection
========================= */

function detectTraffic(params) {
  const out = [];

  if (params.gclid) out.push("Google Ads");
  if (params.fbclid) out.push("Meta Ads");
  if (params.ttclid) out.push("TikTok Ads");
  if (params.msclkid) out.push("Microsoft Ads");

  return dedupe(out);
}

/* =========================
   主分析逻辑
========================= */

async function analyze(inputUrl) {
  const first = getUrl(inputUrl);
  if (!first) return null;

  const chain = await resolveChain(inputUrl);

  let finalUrl = getUrl(chain[chain.length - 1]);
  let params = getParams(finalUrl);

  // Walmart优先
  const walmart = detectWalmart(finalUrl, params);
  if (walmart && walmart.type !== "Walmart Link") {
    return buildResult(inputUrl, chain, finalUrl, params, walmart);
  }

  // Amazon
  const amazon = detectAmazon(finalUrl, params);
  if (amazon) {
    return buildResult(inputUrl, chain, finalUrl, params, amazon);
  }

  // fallback
  return buildResult(inputUrl, chain, finalUrl, params, {
    platform: "Unknown",
    type: "Unknown",
    confidenceScore: 20,
    matchedLayers: [],
    signals: [],
    explanation: "No pattern detected"
  });
}

/* =========================
   统一返回结构
========================= */

function buildResult(input, chain, finalUrl, params, classification) {
  return {
    success: true,
    version: "1.8.3",

    input_url: input,
    final_url: finalUrl.toString(),
    hostname: finalUrl.hostname,

    redirect_chain: chain,
    redirect_chain_length: chain.length,

    classification: {
      title: classification.type,
      platform: classification.platform,
      type: classification.type,
      subtype: "",
      verdict: classification.type,
      confidenceScore: classification.confidenceScore,
      explanation: classification.explanation,
      signals: classification.signals,
      matchedLayers: classification.matchedLayers,
      amazonRules: []
    },

    matched_layers: classification.matchedLayers,
    traffic_sources: detectTraffic(params),
    params,
    signals: classification.signals,

    notes: [],
    risks: []
  };
}

/* =========================
   API
========================= */

app.get("/health", (req, res) => {
  res.json({ ok: true, version: "1.8.3" });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const url = req.body.url;
    if (!url) {
      return res.status(400).json({ success: false, error: "Missing url" });
    }

    const result = await analyze(url);
    if (!result) {
      return res.status(400).json({ success: false, error: "Invalid URL" });
    }

    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Attribution API running on port", PORT);
});
