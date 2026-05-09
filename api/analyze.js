const { analyzeLink } = require("../lib/analyze");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: true,
      message: "Method not allowed"
    });
  }

  try {
    const url =
      req.body?.url ||
      req.query?.url ||
      "";

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        ok: false,
        error: true,
        message: "Missing or invalid URL"
      });
    }

    const result = analyzeLink(url.trim());

    return res.status(200).json({
      ...result,
      ok: result?.ok !== false,
      error: false
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: true,
      message: err.message || "Analyze failed"
    });
  }
};
