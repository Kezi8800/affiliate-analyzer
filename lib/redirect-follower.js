// lib/redirect-follower.js
// BrandShuo — Redirect Chain Follower
// Follows HTTP redirects hop-by-hop to trace the full attribution path
// Identifies tracking domains, extracts params at each hop, records the chain

const http = require("http");
const https = require("https");

const MAX_REDIRECTS = 10;
const TIMEOUT = 8000; // 8s per hop
const USER_AGENT = "BrandShuo-Attribution-Checker/4.7 (+https://brandshuo.com)";

const SHORTENER_DOMAINS = [
  "bit.ly", "j.mp", "tinyurl.com", "ow.ly", "buff.ly", "t.co",
  "amzn.to", "amzn.com", "a.co", "goo.gl", "short.link",
  "shrtco.de", "rb.gy", "cutt.ly", "is.gd", "v.gd",
  "lnkd.in", "trib.al", "ift.tt", "db.tt", "s.id",
  "geni.us", "prf.hn", "pntra.com", "shop-links.co",
  "goto.walmart.com", "goto.target.com", "rover.ebay.com",
  "go.skimresources.com", "redirect.viglink.com",
  "t.cfjump.com", "pjatr.com", "pjtra.com"
];

function isShortener(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return SHORTENER_DOMAINS.some(d => host === d || host.endsWith("." + d));
  } catch {
    return false;
  }
}

function fetchWithRedirect(url, method = "HEAD", timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === "https:" ? https : http;

    const options = {
      method,
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout,
      rejectUnauthorized: false // allow self-signed certs in redirect chains
    };

    const req = client.request(options, (res) => {
      // Read a bit of body in case it's a meta-refresh
      const chunks = [];
      res.on("data", (chunk) => {
        chunks.push(chunk);
        if (chunks.reduce((s, c) => s + c.length, 0) > 5000) {
          res.destroy(); // enough data
        }
      });

      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8").slice(0, 5000);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          url: url
        });
      });

      res.on("error", reject);
    });

    req.on("error", (err) => {
      // Network errors are OK in redirect chains — return what we have
      resolve({
        statusCode: 0,
        headers: {},
        body: "",
        url,
        error: err.message
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        statusCode: 0,
        headers: {},
        body: "",
        url,
        error: "timeout"
      });
    });

    req.end();
  });
}

function extractMetaRefresh(body) {
  if (!body) return null;
  const match = body.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["']?\d+;\s*url=([^"'\s>]+)/i);
  if (match) return match[1];
  return null;
}

async function followRedirectChain(url, options = {}) {
  const maxRedirects = options.maxRedirects || MAX_REDIRECTS;
  const chain = [];
  let currentUrl = url;
  let followed = 0;

  while (followed < maxRedirects) {
    const hop = {
      url: currentUrl,
      status_code: null,
      redirect_to: null,
      is_shortener: isShortener(currentUrl),
      error: null
    };

    try {
      const result = await fetchWithRedirect(currentUrl);
      hop.status_code = result.statusCode;

      if (result.error) {
        hop.error = result.error;
        chain.push(hop);
        break;
      }

      // Check for HTTP redirect (301, 302, 303, 307, 308)
      const location = result.headers.location || result.headers.Location;
      if ([301, 302, 303, 307, 308].includes(result.statusCode) && location) {
        hop.redirect_to = location;
        // Resolve relative URLs
        try {
          currentUrl = new URL(location, currentUrl).href;
        } catch {
          currentUrl = location;
        }
        chain.push(hop);
        followed++;
        continue;
      }

      // Check for meta refresh redirect
      const metaUrl = extractMetaRefresh(result.body);
      if (metaUrl && followed < maxRedirects) {
        hop.redirect_to = metaUrl;
        hop.redirect_type = "meta_refresh";
        try {
          currentUrl = new URL(metaUrl, currentUrl).href;
        } catch {
          currentUrl = metaUrl;
        }
        chain.push(hop);
        followed++;
        continue;
      }

      // No redirect — reached destination
      chain.push(hop);
      break;

    } catch (err) {
      hop.error = err.message;
      chain.push(hop);
      break;
    }
  }

  return {
    original_url: url,
    final_url: chain[chain.length - 1]?.url || url,
    hops: chain.length,
    followed,
    truncated: followed >= maxRedirects,
    chain
  };
}

// Quick unroll: just get the final URL without full chain
async function unrollUrl(url, timeout = TIMEOUT) {
  const chain = await followRedirectChain(url, { maxRedirects: 5 });
  return chain.final_url;
}

module.exports = {
  followRedirectChain,
  unrollUrl,
  isShortener,
  SHORTENER_DOMAINS,
  MAX_REDIRECTS
};
