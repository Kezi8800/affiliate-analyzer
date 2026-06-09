// api/stats.js
// BrandShuo Attribution Checker — Analytics & Stats API
// GET /api/stats — publisher database stats + detection summary
// Query: ?category — group by category
//         ?network — group by network
//         ?region — group by region
//         ?top=N — top publishers by quality

const publisherDB = require("../lib/publisher-database");
const fs = require("fs");
const path = require("path");

function getFeedbackStats() {
  const file = path.join(process.cwd(), "data", "feedback.jsonl");
  if (!fs.existsSync(file)) return { total_submissions: 0, recent: [] };

  const lines = fs.readFileSync(file, "utf8").trim().split("\n").filter(Boolean);
  const recent = lines.slice(-10).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).reverse();

  return { total_submissions: lines.length, recent };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: true, message: "Method not allowed" });

  try {
    const { searchParams } = new URL(req.url, "https://tools.brandshuo.com");
    const groupBy = searchParams.get("group") || "";
    const top = Math.min(parseInt(searchParams.get("top") || "20"), 100);

    const publishers = publisherDB.PUBLISHERS.filter(p => p.id && p.publisher);

    // Category breakdown
    const byCategory = {};
    publishers.forEach(p => {
      const cat = p.category || "unknown";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    // Network breakdown
    const byNetwork = {};
    publishers.forEach(p => {
      (p.networks || []).forEach(n => {
        byNetwork[n] = (byNetwork[n] || 0) + 1;
      });
    });

    // Region breakdown
    const byRegion = {};
    publishers.forEach(p => {
      const r = p.region || "Global";
      byRegion[r] = (byRegion[r] || 0) + 1;
    });

    // Top publishers by quality
    const topPublishers = [...publishers]
      .sort((a, b) => (b.quality || 0) - (a.quality || 0))
      .slice(0, top)
      .map(p => ({
        id: p.id,
        publisher: p.publisher || p.name,
        group: p.group,
        category: p.category,
        quality: p.quality,
        region: p.region || "Global",
        networks: (p.networks || []).slice(0, 3)
      }));

    // Risk distribution
    const riskDist = { Low: 0, "Low-Medium": 0, Medium: 0, "Medium-High": 0, High: 0, "Very High": 0, Unknown: 0 };
    publishers.forEach(p => {
      const risk = p.incrementalityRisk || "Unknown";
      riskDist[risk] = (riskDist[risk] || 0) + 1;
    });

    const feedback = getFeedbackStats();

    return res.status(200).json({
      ok: true,
      version: "v4.7.0",
      engine: "BrandShuo Attribution Intelligence Engine",
      database: {
        total_publishers: publishers.length,
        categories: Object.keys(byCategory).length,
        networks_covered: Object.keys(byNetwork).length,
        regions: Object.keys(byRegion).length
      },
      by_category: byCategory,
      by_network: byNetwork,
      by_region: byRegion,
      risk_distribution: riskDist,
      top_publishers: topPublishers,
      feedback
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: true, message: err.message });
  }
};
