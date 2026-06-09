// api/batch.js
// BrandShuo Attribution Checker — Batch Analysis Endpoint
// POST /api/batch
// Body: { urls: ["url1", "url2", ...] }
// Max: 100 URLs per request

const { analyzeLink } = require("../analyze");

function safeUrl(input) {
  try {
    if (!input || typeof input !== "string") return null;
    let url = input.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    return new URL(url);
  } catch {
    return null;
  }
}

async function analyzeBatch(urls, concurrency = 5) {
  const results = [];
  const queue = [...urls];
  const total = queue.length;

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;

      const urlObj = safeUrl(url);
      if (!urlObj) {
        results.push({
          url,
          ok: false,
          error: "Invalid URL",
          platform: "--",
          network: "--",
          publisher: "--",
          confidence: "--"
        });
        continue;
      }

      try {
        const analysis = analyzeLink(url);
        results.push({
          url,
          ok: true,
          platform: analysis.platform || "--",
          network: analysis.network || "--",
          publisher: analysis.publisher || "--",
          publisher_group: analysis.publisher_group || "--",
          publisher_type: analysis.publisher_type || "--",
          traffic_type: analysis.traffic_type || "--",
          quality_score: analysis.quality_score || analysis.traffic_quality || 0,
          incrementality_risk: analysis.incrementality_risk || "--",
          channel_role: analysis.channel_role || "--",
          confidence: analysis.confidence || "--",
          hostname: analysis.hostname || ""
        });
      } catch (err) {
        results.push({
          url,
          ok: false,
          error: err.message || "Analysis failed",
          platform: "--",
          network: "--",
          publisher: "--",
          confidence: "--"
        });
      }
    }
  }

  // Run workers in parallel
  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);

  return results;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: true,
      message: "Method not allowed. Use POST with JSON body: { urls: [...] }"
    });
  }

  try {
    const { urls } = req.body || {};

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        ok: false,
        error: true,
        message: "Missing or empty 'urls' array. Send: { urls: ['url1', 'url2', ...] }"
      });
    }

    if (urls.length > 100) {
      return res.status(400).json({
        ok: false,
        error: true,
        message: `Maximum 100 URLs per request. Received ${urls.length}.`
      });
    }

    const startTime = Date.now();
    const results = await analyzeBatch(urls, 8);

    // Summary stats
    const stats = {
      total: results.length,
      success: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      networks: [...new Set(results.filter(r => r.ok).map(r => r.network).filter(Boolean))],
      publishers: [...new Set(results.filter(r => r.ok).map(r => r.publisher).filter(p => p && p !== "Unknown Publisher"))],
      duration_ms: Date.now() - startTime
    };

    return res.status(200).json({
      ok: true,
      version: "v4.7.0-batch",
      engine: "BrandShuo Attribution Intelligence Engine",
      stats,
      results
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: true,
      message: err.message || "Batch analysis failed"
    });
  }
};
