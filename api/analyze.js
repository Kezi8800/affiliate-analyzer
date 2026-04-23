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
        version: "v3-debug-amazon-fallback"
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

    const result = analyzeLink(url);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Analysis completed",
      version: result.version || "v3-debug-amazon-fallback",
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Internal server error"
    });
  }
};
