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
        version: "safe-minimal"
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
      return res.status(200).json({
        success: true,
        error: false,
        message: "Analysis completed",
        version: "safe-minimal",
        data: {
          version: "safe-minimal",
          error: true,
          message: "Invalid URL"
        }
      });
    }

    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      return res.status(200).json({
        success: true,
        error: false,
        message: "Analysis completed",
        version: "safe-minimal",
        data: {
          version: "safe-minimal",
          error: true,
          message: "Invalid URL format"
        }
      });
    }

    const params = Object.fromEntries(urlObj.searchParams.entries());

    return res.status(200).json({
      success: true,
      error: false,
      message: "Analysis completed",
      version: "safe-minimal",
      data: {
        version: "safe-minimal",
        analyzed_url: urlObj.toString(),
        hostname: urlObj.hostname,
        network: urlObj.hostname.includes("amazon.")
          ? "Amazon"
          : params.irclickid || params.irgwc
          ? "Impact"
          : params.awc
          ? "Awin"
          : params.cjevent
          ? "CJ Affiliate"
          : params.clickref
          ? "Partnerize"
          : "Unknown",
        publisher_intelligence: {
          publisher: "Unknown",
          publisher_group: "",
          type: "Unknown",
          media_group: "Unknown",
          subtype: "Unknown",
          confidence: "Low",
          matched_by: "none"
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Internal server error"
    });
  }
};
