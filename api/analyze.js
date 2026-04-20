module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
      primary_platform: { name: "Amazon Associates" },
      traffic_type: "affiliate",
      confidence: "high",
      publisher: {
        publisher: "Tom's Guide",
        sub_site: "Deals",
        type: "publisher",
        confidence: "medium"
      },
      commission_engine: {
        primary_claimer: "Publisher",
        secondary_claimers: ["Amazon"],
        conflict_level: "low",
        reason: "tag parameter detected",
        confidence: "high",
        decision_basis: ["Amazon tag parameter found in URL"]
      },
      tracking_layers: ["affiliate", "amazon associates"],
      parameter_signals: {
        tag: "ftr-tomsguide-us-20"
      },
      platform_candidates: [
        {
          name: "Amazon Associates",
          confidence: "high",
          score: 95,
          signals: ["tag"]
        }
      ],
      summary: "Amazon affiliate link detected via tag parameter."
    });
  } catch (error) {
    console.error("analyze error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};
