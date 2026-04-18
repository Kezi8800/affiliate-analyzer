const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PLATFORM_DOMAIN_RULES = [
  { name: "Impact", hosts: ["impact.com", "impactradius.com"] },
  { name: "CJ Affiliate", hosts: ["anrdoezrs.net", "jdoqocy.com", "kqzyfj.com", "dpbolvw.net", "tkqlhce.com", "emjcd.com", "cj.com"] },
  { name: "Awin", hosts: ["awin1.com", "awin.com"] },
  { name: "ShareASale", hosts: ["shareasale.com"] },
  { name: "Rakuten Advertising", hosts: ["click.linksynergy.com", "linksynergy.com"] },
  { name: "Partnerize / Pepperjam", hosts: ["partnerize.com", "pepperjamnetwork.com", "pntra.com"] },
  { name: "Levanta", hosts: ["levanta.io"] },
  { name: "Archer Affiliates", hosts: ["archeraffiliates.com"] },
  { name: "LinkConnector", hosts: ["linkconnector.com"] },
  { name: "Webgains", hosts: ["webgains.com", "track.webgains.com"] },
  { name: "TradeDoubler", hosts: ["tradedoubler.com", "clk.tradedoubler.com"] },
  { name: "Adtraction", hosts: ["adtraction.com", "adtr.co"] },
  { name: "TradeTracker", hosts: ["tradetracker.net", "tc.tradetracker.net"] },
  { name: "Amazon Associates", hosts: ["amazon.com", "amzn.to", "amazon.ca", "amazon.co.uk", "amazon.de", "amazon.fr", "amazon.it", "amazon.es", "amazon.co.jp"] },
  { name: "eBay Partner Network", hosts: ["rover.ebay.com", "ebay.com"] },
  { name: "Skimlinks", hosts: ["go.skimresources.com", "skimresources.com"] },
  { name: "Sovrn / VigLink", hosts: ["redirect.viglink.com", "viglink.com", "shop-links.co"] },
  { name: "FlexOffers", hosts: ["clk.omgt5.com", "flexlinkspro.com"] },
  { name: "AliExpress Portals", hosts: ["s.click.aliexpress.com", "portals.aliexpress.com", "aliexpress.com"] },
  { name: "Booking.com Affiliate", hosts: ["booking.com", "sp.booking.com"] },
  { name: "Shopify Affiliate", hosts: ["shopify.com", "partners.shopify.com"] },
  { name: "PartnerStack", hosts: ["partnerstack.com"] },
  { name: "Avangate / 2Checkout", hosts: ["2checkout.com", "avangate.com"] },
  { name: "ClickBank", hosts: ["hop.clickbank.net", "clickbank.net", "clickbank.com"] },
  { name: "JVZoo", hosts: ["jvzoo.com", "jvz8.com"] },
  { name: "Digistore24", hosts: ["digistore24.com"] },
  { name: "Rewardful", hosts: ["rewardful.com"] },
  { name: "Amazon Creator Connections", hosts: ["amazon.com"] },
  { name: "TikTok Affiliate", hosts: ["tiktok.com", "vt.tiktok.com"] },
  { name: "Shopify Collabs", hosts: ["shopify.com", "shop.app"] },
  { name: "LTK", hosts: ["shopltk.com", "liketk.it", "ltk.app"] },
  { name: "ShopMy", hosts: ["shopmy.us"] },
  { name: "One Walmart Affiliates", hosts: ["walmart.com"] },
  { name: "Walmart Affiliates", hosts: ["walmart.com"] }
];

function dedupe(arr) {
  return [...new Set(arr)];
}

function normalizeKeys(obj = {}) {
  const normalized = {};
  Object.keys(obj || {}).forEach((key) => {
    normalized[String(key).toLowerCase()] = obj[key];
  });
  return normalized;
}

function getUrlObject(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function extractParamsFromUrl(rawUrl) {
  const u = getUrlObject(rawUrl);
  if (!u) return {};

  const out = {};
  u.searchParams.forEach((value, key) => {
    out[String(key).toLowerCase()] = value;
  });

  return out;
}

function detectByDomain(urlObj, detected) {
  if (!urlObj) return detected;

  const host = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname.toLowerCase();
  const result = [...detected];

  PLATFORM_DOMAIN_RULES.forEach((rule) => {
    if (rule.hosts.some((h) => host.includes(h))) {
      if (!result.includes(rule.name)) result.push(rule.name);
    }
  });

  if (host.includes("amazon.") && pathname.includes("/gp/product/")) {
    if (!result.includes("Amazon Associates")) result.push("Amazon Associates");
  }

  if (host.includes("shopmy.us")) {
    if (!result.includes("ShopMy")) result.push("ShopMy");
  }

  if (host.includes("shopltk.com") || host.includes("liketk.it") || host.includes("ltk.app")) {
    if (!result.includes("LTK")) result.push("LTK");
  }

  if (host.includes("booking.com")) {
    if (!result.includes("Booking.com Affiliate")) result.push("Booking.com Affiliate");
  }

  if (host.includes("partners.shopify.com") || pathname.includes("/affiliate_tools/")) {
    if (!result.includes("Shopify Affiliate")) result.push("Shopify Affiliate");
  }

  if (host.includes("shop.app") || pathname.includes("/collabs")) {
    if (!result.includes("Shopify Collabs")) result.push("Shopify Collabs");
  }

  if (host.includes("tiktok.com") && (pathname.includes("/affiliate") || pathname.includes("/link"))) {
    if (!result.includes("TikTok Affiliate")) result.push("TikTok Affiliate");
  }

  return dedupe(result);
}

function enrichDetectedFromParams(detected, params, urlObj) {
  const result = [...detected];
  const utmMedium = (params.utm_medium || "").toLowerCase();
  const utmSource = (params.utm_source || "").toLowerCase();
  const utmCampaign = (params.utm_campaign || "").toLowerCase();
  const host = urlObj ? urlObj.hostname.toLowerCase() : "";

  const push = (name) => {
    if (!result.includes(name)) result.push(name);
  };

  if (params.campaignid || params.linkid || params.linkcode) push("Amazon Creator Connections");

  if (params.tag || params.ascsubtag) push("Amazon Associates");
  if (params.maas || params.aa_campaignid || params.aa_adgroupid || params.aa_creativeid || params.ref_) {
    push("Amazon Attribution");
  }

  if (params.irclickid || params.irgwc || params.cidimp || utmCampaign.includes("impact")) push("Impact");

  if (params.cjevent) push("CJ Affiliate");
  if (params.awc || params.clickref) push("Awin");
  if (params.afftrack) push("ShareASale");

  if (params.ranmid || params.raneaid || params.ransiteid) push("Rakuten Advertising");
  if (params.pjid || params.pjmid) push("Partnerize / Pepperjam");
  if (params.lc_sid || params.lc_mid || params.lc_cid || params.atid) push("LinkConnector");
  if (params.wgcampaignid || params.wgprogramid) push("Webgains");
  if (params.tduid || params.trafficsourceid) push("TradeDoubler");
  if (params.tt || params.ttid) push("TradeTracker");
  if (params.adtractionid || params.adt_id) push("Adtraction");

  if (params.campid || params.customid || params.mpre || params.pub) push("eBay Partner Network");

  if ((params.aid || params.label) && urlObj && urlObj.hostname.toLowerCase().includes("booking.com")) {
    push("Booking.com Affiliate");
  }

  if (params.aff && urlObj && urlObj.hostname.toLowerCase().includes("digistore24")) {
    push("Digistore24");
  }

  if (params.tid || params.vtid) push("ClickBank");
  if (params.referral) push("Rewardful");

  if (params.ps_xid || params.ps_partner_key) push("PartnerStack");

  if (params.pb || params.pb_id || params.pb_clickid || params.pb_source) push("PartnerBoost");
  if (params.faid || params.fobs) push("FlexOffers");

  if (params.skimlinks || params.skm || utmSource.includes("skimbit") || utmSource.includes("skimlinks")) {
    push("Skimlinks");
  }

  if (params.vglnk || params.vgtid) push("Sovrn / VigLink");

  if (params.gclid || params.gbraid || params.wbraid || params.gad_campaignid) push("Google Ads");
  if (params.fbclid) push("Meta Ads");
  if (params.ttclid) push("TikTok");
  if (params.msclkid) push("Microsoft Ads");

  if (
    host.includes("levanta.io") ||
    params.levanta_campaign ||
    params.levanta_creator ||
    (host.includes("levanta") &&
      (params.referral ||
        params.creator ||
        params.affiliate ||
        utmSource.includes("levanta") ||
        utmCampaign.includes("levanta")))
  ) {
    push("Levanta");
  }

  if (
    host.includes("archeraffiliates.com") ||
    params.archer_campaign ||
    params.archer_creator ||
    (host.includes("archer") &&
      (params.referral ||
        params.creator ||
        params.affiliate ||
        utmSource.includes("archer") ||
        utmCampaign.includes("archer")))
  ) {
    push("Archer Affiliates");
  }

  if (
    params.subid ||
    params.sub_id ||
    params.aff_id ||
    params.affiliate_id ||
    params.click_id ||
    params.clickid ||
    utmMedium.includes("aff") ||
    utmMedium.includes("affiliate")
  ) {
    push("Generic Affiliate Tracking");
  }

  if (params.utm_source || params.utm_medium || params.utm_campaign || params.utm_term || params.utm_content) {
    push("UTM Tracking");
  }

  return dedupe(result);
}

function inferRisks(detected, params) {
  const risks = [];

  if (detected.includes("Amazon Attribution") && detected.includes("Amazon Associates")) {
    risks.push("Possible duplicate attribution signal");
  }

  if ((params.gclid || params.gbraid || params.wbraid) && detected.includes("Amazon Attribution")) {
    risks.push("Paid traffic is being routed into attribution layer");
  }

  if ((params.irgwc || params.irclickid || params.cidimp) && (params.utm_source || params.utm_medium || params.utm_campaign)) {
    risks.push("Affiliate network + UTM layering detected");
  }

  if (detected.includes("Awin") && detected.includes("ShareASale")) {
    risks.push("Awin + ShareASale style markers both present");
  }

  if (Object.keys(params).length > 10) {
    risks.push("Link contains many tracking parameters");
  }

  if (!risks.length) {
    risks.push("No obvious structural risk detected");
  }

  return risks;
}

function renderDetectedPlatform(detected, params, urlObj) {
  const priority = [
    "Amazon Attribution",
    "Amazon Creator Connections",
    "Amazon Associates",
    "Impact",
    "CJ Affiliate",
    "Awin",
    "ShareASale",
    "Rakuten Advertising",
    "Partnerize / Pepperjam",
    "Levanta",
    "Archer Affiliates",
    "LinkConnector",
    "Webgains",
    "TradeDoubler",
    "Adtraction",
    "TradeTracker",
    "eBay Partner Network",
    "Booking.com Affiliate",
    "Skimlinks",
    "Sovrn / VigLink",
    "FlexOffers",
    "PartnerStack",
    "PartnerBoost",
    "AliExpress Portals",
    "Shopify Affiliate",
    "ClickBank",
    "JVZoo",
    "Digistore24",
    "Rewardful",
    "TikTok Affiliate",
    "Shopify Collabs",
    "LTK",
    "ShopMy"
  ];

  for (const name of priority) {
    if (detected.includes(name)) return name;
  }

  const utmMedium = (params.utm_medium || "").toLowerCase();
  const utmSource = (params.utm_source || "").toLowerCase();
  const utmCampaign = (params.utm_campaign || "").toLowerCase();

  if (params.irgwc || params.irclickid || params.cidimp || utmCampaign.includes("impact")) {
    return "Impact";
  }

  if (utmSource.includes("skimbit") || utmSource.includes("skimlinks")) {
    return "Skimlinks Publisher Link";
  }

  if (utmMedium.includes("aff") || utmMedium.includes("affiliate")) {
    return "Affiliate Tracking Link";
  }

  if (urlObj) {
    const host = urlObj.hostname.toLowerCase();
    if (host.includes("booking.com")) return "Booking.com Affiliate";
    if (host.includes("shopmy.us")) return "ShopMy";
    if (host.includes("shopltk.com") || host.includes("liketk.it") || host.includes("ltk.app")) return "LTK";
    if (host.includes("levanta.io")) return "Levanta";
    if (host.includes("archeraffiliates.com")) return "Archer Affiliates";
  }

  return "Unknown / Generic Tracking Link";
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/analyze", (req, res) => {
  try {
    const inputUrl = String(req.body?.url || "").trim();

    if (!inputUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing url"
      });
    }

    const urlObj = getUrlObject(inputUrl);

    if (!urlObj) {
      return res.status(400).json({
        success: false,
        error: "Invalid URL"
      });
    }

    const localParams = extractParamsFromUrl(inputUrl);
    const params = normalizeKeys(localParams);

    let detected = [];
    detected = enrichDetectedFromParams(detected, params, urlObj);
    detected = detectByDomain(urlObj, detected);

    const platform = renderDetectedPlatform(detected, params, urlObj);
    const risks = inferRisks(detected, params);

    return res.json({
      success: true,
      url: inputUrl,
      hostname: urlObj.hostname,
      detected,
      params,
      platform,
      risks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Affiliate checker API running on port ${PORT}`);
});
