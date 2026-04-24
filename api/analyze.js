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

    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: true,
        message: "Method not allowed"
      });
    }

    let url = "";

    if (req.method === "GET") {
      url = typeof req.query.url === "string" ? req.query.url.trim() : "";

      if (!url) {
        return res.status(200).json({
          success: true,
          error: false,
          message: "Analyze API is running. Add ?url=YOUR_URL to analyze a link.",
          version: "v2.2"
        });
      }
    }

    if (req.method === "POST") {
      const body = req.body || {};
      url = typeof body.url === "string" ? body.url.trim() : "";
    }

    if (!url) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Missing url"
      });
    }

    const result = analyzeLink(url);

    const merchant =
      result.merchant ||
      result.attribution_layer?.merchant ||
      result.data?.merchant ||
      "Unknown";

    const merchantType =
      result.merchant_type ||
      result.attribution_layer?.merchant_type ||
      result.retail_intent_gmv?.merchant_type ||
      result.data?.merchant_type ||
      "Unknown";

    const retailMapping =
      result.retail_mapping ||
      result.retail_intent_gmv?.retail_mapping ||
      result.quality_and_intent?.retail_mapping ||
      result.data?.retail_mapping ||
      "Unknown";

    const response = {
      success: true,
      error: false,
      message: "Analysis completed",
      version: result.version || "v2.2",

      merchant,
      merchant_type: merchantType,
      retail_mapping: retailMapping,

      data: result
    };

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Internal server error"
    });
  }
};
