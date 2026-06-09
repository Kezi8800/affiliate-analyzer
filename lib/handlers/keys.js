// api/keys.js
// BrandShuo Attribution Checker — API Key Generation
// POST /api/keys — generate a new API key (self-serve)
// GET /api/keys — get key info

const { generateKey, getKeyInfo } = require("../api-keys");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — check key info
  if (req.method === "GET") {
    const apiKey = req.headers["x-api-key"] || "";
    if (!apiKey) {
      return res.status(200).json({
        ok: true,
        message: "No API key provided. POST to generate one.",
        tiers: { free: "100 req/mo", pro: "1000 req/mo", enterprise: "10000 req/mo" }
      });
    }

    const info = getKeyInfo(apiKey);
    if (!info) {
      return res.status(401).json({ ok: false, error: true, message: "Invalid API key" });
    }

    return res.status(200).json({ ok: true, info });
  }

  // POST — generate new key
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: true, message: "Method not allowed" });
  }

  try {
    const { email, tier = "free" } = req.body || {};

    const validTiers = ["free", "pro", "enterprise"];
    const selectedTier = validTiers.includes(tier) ? tier : "free";

    // Pro/Enterprise would require payment in production
    if (selectedTier !== "free") {
      return res.status(200).json({
        ok: true,
        message: `For ${selectedTier} tier, please contact us at hello@brandshuo.com`,
        requested_tier: selectedTier
      });
    }

    const key = generateKey("free");

    return res.status(200).json({
      ok: true,
      message: "API key generated! Save it — you won't see the full key again.",
      api_key: key.full_key,
      key_id: key.id,
      tier: key.tier,
      limit: "100 requests/month",
      usage: "Send in header: X-API-Key: " + key.full_key,
      docs: "https://brandshuo.com/api"
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: true, message: err.message });
  }
};
