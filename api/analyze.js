const { analyzeLink } = require("../lib/analyze");

module.exports = async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "Analyze API is running"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        error: true,
        message: "Method not allowed"
      });
    }

    const { url } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        error: true,
        message: "Missing or invalid url"
      });
    }

    const result = analyzeLink(url);

    if (result?.error) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Vercel /api/analyze error:", err);

    return res.status(500).json({
      error: true,
      message: err.message || "Internal server error"
    });
  }
};
