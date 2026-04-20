module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const url = body?.url;

    if (!url) {
      return res.status(400).json({ error: "Missing url" });
    }

    return res.status(200).json({
      primary_platform: { name: "Test Platform" },
      traffic_type: "test",
      confidence: "high",
      publisher: {
        publisher: "Test Publisher",
        sub_site: "Test Subsite",
        type: "media",
        confidence: "high"
      },
      commission_engine: {
        primary_claimer: "Test Claimer",
        secondary_claimers: ["A", "B"],
        conflict_level: "low",
        reason: "This is a test response",
        confidence: "high",
        decision_basis: ["API is working"]
      },
      tracking_layers: ["test-layer"],
      parameter_signals: { sample: "ok" },
      platform_candidates: [
        { name: "Test Platform", confidence: "high", score: 100, signals: ["test"] }
      ],
      summary: "API test successful"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};
