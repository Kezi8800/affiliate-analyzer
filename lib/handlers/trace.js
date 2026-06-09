// api/trace.js
// BrandShuo — Full Redirect Trace Endpoint
// POST /api/trace
// Body: { url: "https://bit.ly/xxx" }
// Follows the entire HTTP redirect chain and analyzes each hop

const { followRedirectChain, isShortener } = require("../redirect-follower");
const { analyzeLink } = require("../analyze");
const { withRateLimit } = require("../rate-limiter");

module.exports = withRateLimit(async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: true, message: "Method not allowed" });
  }

  try {
    const { url } = req.body || {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: true, message: "Missing URL" });
    }

    const startTime = Date.now();

    // Follow the full redirect chain
    const redirectChain = await followRedirectChain(url.trim());

    // Analyze the final URL
    const analysis = analyzeLink(redirectChain.final_url);

    // Analyze intermediate hops for known tracking domains
    const hopAnalyses = redirectChain.chain
      .filter(hop => hop.url !== redirectChain.final_url && hop.url !== url)
      .slice(0, 5)
      .map(hop => {
        try {
          const a = analyzeLink(hop.url);
          return {
            url: hop.url,
            status_code: hop.status_code,
            is_shortener: hop.is_shortener,
            network: a.network,
            publisher: a.publisher,
            platform: a.platform
          };
        } catch {
          return {
            url: hop.url,
            status_code: hop.status_code,
            is_shortener: hop.is_shortener,
            error: "analysis_failed"
          };
        }
      });

    return res.status(200).json({
      ok: true,
      version: "v4.7.0",
      engine: "BrandShuo Attribution Intelligence Engine + Redirect Tracer",

      original_url: redirectChain.original_url,
      final_url: redirectChain.final_url,
      total_hops: redirectChain.hops,
      followed: redirectChain.followed,
      truncated: redirectChain.truncated,
      is_shortened: isShortener(url),
      duration_ms: Date.now() - startTime,

      redirect_chain: redirectChain.chain.map(hop => ({
        url: hop.url,
        status_code: hop.status_code,
        redirect_to: hop.redirect_to,
        redirect_type: hop.redirect_type || "http",
        is_shortener: hop.is_shortener,
        error: hop.error || null
      })),

      hop_analyses: hopAnalyses.filter(h => h.network && h.network !== "Unknown"),

      final_analysis: {
        platform: analysis.platform,
        network: analysis.network,
        publisher: analysis.publisher,
        publisher_id: analysis.publisher_id,
        publisher_url: analysis.publisher_url,
        quality_score: analysis.quality_score || analysis.traffic_quality,
        incrementality_risk: analysis.incrementality_risk,
        channel_role: analysis.channel_role,
        confidence: analysis.confidence
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: true, message: err.message });
  }
});
