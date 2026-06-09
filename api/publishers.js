// api/publishers.js
// BrandShuo Attribution Checker — Publisher Directory API
// GET /api/publishers — list/search publishers
// Query params: ?q=search&category=deal_coupon&network=CJ&region=US&limit=20

const publisherDB = require("../lib/publisher-database");

const VALID_CATEGORIES = [
  "deal_coupon", "content_commerce", "seo_review_media", "coupon_extension",
  "cashback_rewards", "home_lifestyle_media", "subnetwork_router", "smart_router",
  "creator_commerce", "affiliate_network", "finance_review"
];

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: true, message: "Method not allowed" });
  }

  try {
    const { searchParams } = new URL(req.url, "https://tools.brandshuo.com");
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const category = (searchParams.get("category") || "").toLowerCase().trim();
    const network = (searchParams.get("network") || "").toLowerCase().trim();
    const region = (searchParams.get("region") || "").toUpperCase().trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");

    let publishers = publisherDB.PUBLISHERS.filter(p => p.publisher && p.id);

    // Search
    if (q) {
      publishers = publishers.filter(p => {
        const haystack = [
          p.publisher, p.name, p.group,
          ...(p.aliases || []), ...(p.domains || []), ...(p.amazonTags || [])
        ].join(" ").toLowerCase();
        return haystack.includes(q);
      });
    }

    // Category filter
    if (category && VALID_CATEGORIES.includes(category)) {
      publishers = publishers.filter(p => p.category === category);
    }

    // Network filter
    if (network) {
      publishers = publishers.filter(p =>
        (p.networks || []).some(n => n.toLowerCase().includes(network))
      );
    }

    // Region filter
    if (region) {
      publishers = publishers.filter(p => (p.region || "").toUpperCase() === region);
    }

    const total = publishers.length;
    const page = publishers.slice(offset, offset + limit);

    // Summary format for list view
    const results = page.map(p => ({
      id: p.id,
      publisher: p.publisher || p.name,
      group: p.group,
      category: p.category,
      publisher_type: p.publisherType || p.category,
      quality: p.quality,
      region: p.region || "US",
      domains: (p.domains || []).slice(0, 3),
      networks: p.networks || [],
      incrementality_risk: p.incrementalityRisk
    }));

    return res.status(200).json({
      ok: true,
      total,
      offset,
      limit,
      categories: VALID_CATEGORIES,
      filters_applied: { q: q || null, category: category || null, network: network || null, region: region || null },
      results
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: true, message: err.message });
  }
};
