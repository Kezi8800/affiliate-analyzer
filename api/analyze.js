export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing url" });
    }

    const parsed = new URL(url);
    const params = Object.fromEntries(parsed.searchParams.entries());

    // ===== 平台识别 =====
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

    // ===== Publisher =====
    let publisher = null;

    if (/futurepublishing/i.test(JSON.stringify(params))) {
      publisher = "Future Publishing";
    }

    // ===== 输出 =====
    return res.status(200).json({
      platform,
      publisher,
      traffic_type: "Affiliate",
      params,
      message: "OK"
    });

  } catch (err) {
    console.error("API ERROR:", err);

    return res.status(500).json({
      error: "Internal Server Error",
      detail: err.message
    });
  }
}
