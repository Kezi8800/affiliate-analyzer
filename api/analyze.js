export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { url } = body;

    if (!url) {
      return res.status(400).json({ error: "Missing url" });
    }

    const parsed = new URL(url);
    const params = Object.fromEntries(parsed.searchParams.entries());

    // ===== 平台识别 =====
    let platformName = "Unknown";

    if (params.click_id?.startsWith("1011l")) {
      platformName = "Awin";
    } else if (params.irclickid) {
      platformName = "Impact";
    } else if (params.cjevent) {
      platformName = "CJ Affiliate";
    } else if (params.tag) {
      platformName = "Amazon Associates";
    }

    // ===== Publisher =====
    let publisherName = null;

    if (/futurepublishing/i.test(JSON.stringify(params))) {
      publisherName = "Future Publishing";
    }

    // ===== 输出（关键：结构匹配前端）=====
    return res.status(200).json({
      platform: {
        name: platformName
      },

      traffic_type: "Affiliate",

      tracking_layers: platformName !== "Unknown"
        ? [platformName, "Affiliate Traffic"]
        : ["Affiliate Traffic"],

      publisher: {
        publisher: publisherName,
        sub_site: null,
        type: publisherName ? "Media Affiliate" : null,
        confidence: publisherName ? "high" : "low"
      },

      commission_engine: {
        primary_claimer: publisherName
          ? `${platformName} (${publisherName})`
          : platformName,
        secondary_signals: publisherName ? [publisherName] : [],
        conflict_level: "Low",
        reason: "Affiliate link detected based on parameters.",
        confidence: platformName !== "Unknown" ? "high" : "medium"
      },

      parameter_signals: params,

      confidence: platformName !== "Unknown" ? "high" : "medium",

      summary: publisherName
        ? `This link is identified as ${platformName} affiliate traffic, driven by ${publisherName}.`
        : `This link is identified as ${platformName} affiliate traffic.`

    });

  } catch (err) {
    console.error("API ERROR:", err);

    return res.status(500).json({
      error: "Internal Server Error",
      detail: err.message
    });
  }
}
