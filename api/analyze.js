module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { url } = body;

    if (!url) {
      return res.status(400).json({ error: "Missing url" });
    }

    const parsed = new URL(url);
    const params = Object.fromEntries(parsed.searchParams.entries());

    let platform = "Unknown";

    if (params.click_id?.startsWith("1011l")) {
      platform = "Awin";
    } else if (params.irclickid) {
      platform = "Impact";
    } else if (params.cjevent) {
      platform = "CJ Affiliate";
    } else if (params.tag) {
      platform = "Amazon Associates";
    }

    let publisher = null;
    if (/futurepublishing/i.test(JSON.stringify(params))) {
      publisher = "Future Publishing";
    }

    return res.status(200).json({
      platform: { name: platform },
      publisher: publisher
        ? {
            publisher,
            sub_site: null,
            type: "Media Affiliate",
            confidence: "high"
          }
        : {
            publisher: null,
            sub_site: null,
            type: null,
            confidence: "low"
          },
      traffic_type: "Affiliate",
      tracking_layers: platform !== "Unknown" ? [platform, "Affiliate Traffic"] : ["Affiliate Traffic"],
      commission_engine: {
        primary_claimer: publisher ? `${platform} (${publisher})` : platform,
        secondary_signals: publisher ? [publisher] : [],
        conflict_level: "Low",
        reason: "Basic affiliate link detection matched.",
        confidence: platform !== "Unknown" ? "high" : "low"
      },
      parameter_signals: params,
      confidence: platform !== "Unknown" ? "high" : "medium",
      summary: publisher
        ? `Primary platform appears to be ${platform}. Publisher ownership points to ${publisher}.`
        : `Primary platform appears to be ${platform}.`
    });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      detail: err.message
    });
  }
};
