// api/scan.js
// BrandShuo — Page Scanner / Competitor Link Discovery
// POST /api/scan
// Body: { url: "https://example.com/page", max_links?: 100 }
// Fetches a page, extracts all affiliate links, and analyzes each one

const { analyzeLink } = require("../analyze");
const { isShortener } = require("../redirect-follower");
const { withRateLimit } = require("../rate-limiter");

const https = require("https");
const http = require("http");
const { URL } = require("url");

const AFFILIATE_PARAMS = [
  "tag=", "ascsubtag", "linkcode=", "creative=", "camp=",
  "irclickid", "irgwc=", "sourceid=imp_", "sharedid", "subid1",
  "cjevent=", "cjdata=", "cj_publishercid", "dgc=cj",
  "awc=", "awinaffid", "awinmid", "awstrack",
  "raneaid=", "ranmid=", "ransiteid=", "rktevent",
  "clickref=", "click_ref=", "prf.hn", "pntra.com", "t.cfjump.com",
  "pb=", "pb_clickid", "partnerboost",
  "levanta=",
  "rfsn=", "sca_ref=", "gfp_ref",
  "sscid=", "afftrack=",
  "maas=", "aa_campaignid", "ref_=aa_maas", "tag=maas",
  "gclid=", "fbclid=", "ttclid=", "msclkid=", "ppclid=",
  "skimresources", "redirect.viglink.com", "shop-links.co",
  "pj_publisherid=", "pj_creativeid=", "publisherid=",
  "go.redirectingat.com", "geni.us",
  "rover.ebay.com", "goto.walmart.com",
  "admitad", "tradedoubler", "webgains",
  "/dp/", "/gp/product/", "/exec/obidos/",  // Amazon product links
];

function isAffiliateUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();

  // Exclude non-link URLs
  if (lower.startsWith("javascript:") || lower.startsWith("mailto:") || lower.startsWith("#")) return false;
  if (lower === "/" || lower === "") return false;

  return AFFILIATE_PARAMS.some(param => lower.includes(param.toLowerCase()));
}

function fetchPage(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === "https:" ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: {
        "User-Agent": "BrandShuo-Link-Scanner/4.7 (+https://brandshuo.com)",
        Accept: "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout
    };

    const req = client.request(options, (res) => {
      // Follow one redirect
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const location = res.headers.location;
        if (location) {
          try {
            const redirectUrl = new URL(location, url).href;
            return fetchPage(redirectUrl, timeout - 2000).then(resolve).catch(reject);
          } catch { return reject(new Error("Invalid redirect")); }
        }
      }

      const chunks = [];
      res.on("data", (chunk) => {
        chunks.push(chunk);
        if (chunks.reduce((s, c) => s + c.length, 0) > 500000) {
          res.destroy(); // 500KB limit
        }
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers["content-type"] || "",
          body: Buffer.concat(chunks).toString("utf8"),
          finalUrl: url
        });
      });

      res.on("error", reject);
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  // Match href attributes
  const hrefRegex = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    try {
      const absolute = new URL(href, baseUrl).href;
      links.add(absolute);
    } catch {}
  }

  // Match meta refresh URLs
  const metaRegex = /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["']?\d+;\s*url=([^"'\s>]+)/gi;
  while ((match = metaRegex.exec(html)) !== null) {
    try {
      const absolute = new URL(match[1], baseUrl).href;
      links.add(absolute);
    } catch {}
  }

  return [...links];
}

module.exports = withRateLimit(async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: true, message: "Method not allowed" });

  try {
    const { url, max_links = 100 } = req.body || {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: true, message: "Missing URL" });
    }

    const startTime = Date.now();
    const page = await fetchPage(url.trim());

    if (!page.body) {
      return res.status(200).json({
        ok: true,
        url,
        total_links: 0,
        affiliate_links: 0,
        results: [],
        message: "Page could not be fetched or is empty"
      });
    }

    const allLinks = extractLinks(page.body, url);
    const affiliateLinks = allLinks.filter(isAffiliateUrl).slice(0, max_links);

    // Analyze each affiliate link
    const results = affiliateLinks.map(link => {
      try {
        const analysis = analyzeLink(link);
        return {
          url: link,
          ok: true,
          platform: analysis.platform || "--",
          network: analysis.network || "--",
          publisher: analysis.publisher || "--",
          publisher_id: analysis.publisher_id || null,
          quality_score: analysis.quality_score || analysis.traffic_quality || 0,
          incrementality_risk: analysis.incrementality_risk || "--",
          is_shortened: isShortener(link)
        };
      } catch {
        return { url: link, ok: false, error: "analysis_failed" };
      }
    });

    // Breakdown
    const networks = [...new Set(results.filter(r => r.ok).map(r => r.network).filter(n => n && n !== "Unknown"))];
    const publishers = [...new Set(results.filter(r => r.ok).map(r => r.publisher).filter(p => p && p !== "Unknown Publisher"))];

    return res.status(200).json({
      ok: true,
      version: "v4.7.0",
      scanned_url: url,
      final_url: page.finalUrl,
      status_code: page.statusCode,
      total_links: allLinks.length,
      affiliate_links: results.length,
      networks_found: networks,
      publishers_found: publishers,
      duration_ms: Date.now() - startTime,
      results
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: true,
      message: err.message || "Scan failed"
    });
  }
});
