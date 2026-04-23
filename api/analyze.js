const { analyzeLink } = require("../lib/analyze");

module.exports = async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        error: false,
        message: "Analyze API is running",
        version: "v3.0"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: true,
        message: "Method not allowed"
      });
    }

    const body = req.body || {};
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (!url) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Missing or invalid url"
      });
    }

    const result = await analyzeLink(url);

    if (!result || typeof result !== "object") {
      return res.status(500).json({
        success: false,
        error: true,
        message: "Analyzer returned invalid response"
      });
    }

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: true,
        message: result.message || "Analysis failed",
        version: result.version || "v3.0",
        data: result
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Analysis completed",
      version: result.version || "v3.0",
      data: result
    });
  } catch (err) {
    console.error("Vercel /api/analyze error:", err);

    return res.status(500).json({
      success: false,
      error: true,
      message: err?.message || "Internal server error"
    });
  }
};
