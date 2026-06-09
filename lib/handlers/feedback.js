// api/feedback.js
// BrandShuo Attribution Checker — Publisher Feedback Endpoint
// POST /api/feedback
// Uses shared storage layer (ready for DB migration)

const storage = require("../lib/storage");
const webhooks = require("../lib/webhooks");

function getRecentFeedback(limit = 50) {
  return storage.getFeedback(limit);
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — return recent feedback (admin)
  if (req.method === "GET") {
    const feedback = getRecentFeedback(50);
    return res.status(200).json({
      ok: true,
      count: feedback.length,
      feedback
    });
  }

  // POST — submit feedback
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: true, message: "Method not allowed" });
  }

  try {
    const { url, publisher_name, publisher_group, category, network, notes } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        ok: false,
        error: true,
        message: "Missing 'url' field. Send: { url, publisher_name?, publisher_group?, category?, network?, notes? }"
      });
    }

    const entry = {
      url: url.trim(),
      publisher_name: (publisher_name || "").trim(),
      publisher_group: (publisher_group || "").trim(),
      category: (category || "").trim(),
      network: (network || "").trim(),
      notes: (notes || "").trim(),
      submitted_at: new Date().toISOString(),
      ip_hash: req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown"
    };

    // Basic validation
    if (!entry.publisher_name && !entry.network) {
      return res.status(400).json({
        ok: false,
        error: true,
        message: "Please provide at least 'publisher_name' or 'network' to help us identify."
      });
    }

    storage.appendFeedback(entry);
    storage.incrementCounter("feedback_submitted");

    // Fire webhook notification (async, don't block response)
    webhooks.onFeedback(entry).catch(() => {});

    return res.status(200).json({
      ok: true,
      message: "Thank you! Your feedback helps improve the publisher database.",
      entry
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: true,
      message: err.message || "Failed to save feedback"
    });
  }
};
