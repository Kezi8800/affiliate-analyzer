// api/publisher/related.js
// BrandShuo — Related Publishers
// GET /api/publisher/:id/related — find similar publishers by group, category, or network

const publisherDB = require("../publisher-database");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: true, message: "Method not allowed" });

  try {
    const url = new URL(req.url, "https://tools.brandshuo.com");
    const pathParts = url.pathname.replace(/^\/api\/publisher\//, "").replace(/\/related$/, "").split("/");
    const slug = pathParts[0] || "";

    const publisher = publisherDB.getPublisherById(slug) ||
      publisherDB.PUBLISHERS.find(p =>
        (p.domains || []).some(d => d.includes(slug)) ||
        (p.aliases || []).some(a => a.toLowerCase() === slug.toLowerCase())
      );

    if (!publisher) {
      return res.status(404).json({ ok: false, error: true, message: "Publisher not found" });
    }

    const allPublishers = publisherDB.PUBLISHERS.filter(p => p.id && p.publisher && p.id !== publisher.id);

    // Same media group
    const sameGroup = allPublishers.filter(p => p.group === publisher.group);

    // Same category
    const sameCategory = allPublishers
      .filter(p => p.category === publisher.category && p.group !== publisher.group)
      .sort((a, b) => (b.quality || 0) - (a.quality || 0));

    // Same networks
    const sameNetworks = allPublishers
      .filter(p => (p.networks || []).some(n => (publisher.networks || []).includes(n)) && p.group !== publisher.group && p.category !== publisher.category)
      .sort((a, b) => (b.quality || 0) - (a.quality || 0));

    // Similar quality tier
    const qualityTier = Math.floor((publisher.quality || 60) / 10) * 10;
    const sameQuality = allPublishers
      .filter(p => p.quality >= qualityTier && p.quality < qualityTier + 10 && p.group !== publisher.group && p.category !== publisher.category)
      .sort((a, b) => (b.quality || 0) - (a.quality || 0))
      .slice(0, 5);

    const format = (p) => ({
      id: p.id,
      publisher: p.publisher || p.name,
      group: p.group,
      category: p.category,
      quality: p.quality,
      region: p.region || "Global",
      networks: (p.networks || []).slice(0, 3),
      incrementality_risk: p.incrementalityRisk
    });

    return res.status(200).json({
      ok: true,
      publisher: {
        id: publisher.id,
        publisher: publisher.publisher || publisher.name,
        group: publisher.group,
        category: publisher.category,
        networks: publisher.networks || []
      },
      related: {
        same_group: {
          title: `Also from ${publisher.group}`,
          count: sameGroup.length,
          publishers: sameGroup.slice(0, 10).map(format)
        },
        same_category: {
          title: `More ${(publisher.category || "").replace(/_/g, " ")} publishers`,
          count: sameCategory.length,
          publishers: sameCategory.slice(0, 10).map(format)
        },
        same_networks: {
          title: `Publishers using similar networks`,
          count: sameNetworks.length,
          publishers: sameNetworks.slice(0, 10).map(format)
        },
        similar_quality: {
          title: `Similar quality tier (${qualityTier}-${qualityTier + 9})`,
          count: sameQuality.length,
          publishers: sameQuality.map(format)
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: true, message: err.message });
  }
};
