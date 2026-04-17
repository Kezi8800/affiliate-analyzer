export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { url } = req.body;

  try {
    const u = new URL(url);
    const params = Object.fromEntries(u.searchParams.entries());

    let detected = [];

    if (params.maas || params.aa_campaignid) {
      detected.push("Amazon Attribution");
    }

    if (params.tag) {
      detected.push("Amazon Associates");
    }

    if (params.gclid || params.gbraid) {
      detected.push("Google Ads");
    }

    if (params.irclickid) {
      detected.push("Impact");
    }

    res.status(200).json({
      success: true,
      detected,
      params
    });

  } catch (e) {
    res.status(200).json({
      success: false,
      error: "Invalid URL"
    });
  }
}
