// api/cron.js
// BrandShuo — Scheduled Maintenance
// GET /api/cron?key=xxx — Run health checks, cache cleanup, stats snapshot
// Designed for Vercel Cron Jobs or external scheduler (cron-job.org, GitHub Actions)

const publisherDB = require("../lib/publisher-database");
const { analysisCache } = require("../lib/cache");
const storage = require("../lib/storage");
const webhooks = require("../lib/webhooks");

const CRON_KEY = process.env.CRON_KEY || "brandshuo-cron";

function checkAuth(req) {
  const key = new URL(req.url || "", "https://tools.brandshuo.com").searchParams.get("key") || "";
  return key === CRON_KEY;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!checkAuth(req)) {
    return res.status(401).json({ ok: false, error: true, message: "Cron key required" });
  }

  try {
    const results = {
      timestamp: new Date().toISOString(),
      tasks: {}
    };

    // 1. Cache cleanup
    const cacheBefore = analysisCache.stats().size;
    analysisCache.cleanup();
    const cacheAfter = analysisCache.stats().size;
    results.tasks.cache_cleanup = {
      ok: true,
      before: cacheBefore,
      after: cacheAfter,
      removed: cacheBefore - cacheAfter
    };

    // 2. Publisher DB health check
    const pubs = publisherDB.PUBLISHERS.filter(p => p.id);
    const totalPubs = pubs.length;
    const pubsWithDomains = pubs.filter(p => (p.domains || []).length > 0).length;
    const pubsWithNetworks = pubs.filter(p => (p.networks || []).length > 0).length;
    const pubsWithTags = pubs.filter(p => (p.amazonTags || []).length > 0).length;
    const avgQuality = Math.round(pubs.reduce((s, p) => s + (p.quality || 0), 0) / totalPubs);

    results.tasks.publisher_health = {
      ok: true,
      total: totalPubs,
      with_domains: pubsWithDomains,
      with_networks: pubsWithNetworks,
      with_amazon_tags: pubsWithTags,
      avg_quality: avgQuality,
      data_completeness: Math.round((pubsWithDomains / totalPubs) * 100) + "%"
    };

    // 3. Counters snapshot
    const counters = storage.getCounters();
    results.tasks.counters_snapshot = {
      ok: true,
      analyzed: counters.analyzed || 0,
      batch: counters.batch_analyzed || 0,
      feedback: (counters.feedback_submitted || 0),
      unique_publishers: Object.keys(counters.publishers_detected || {}).length,
      unique_networks: Object.keys(counters.networks_detected || {}).length
    };

    // 4. Feedback stats
    const feedbackCount = storage.getFeedbackCount();
    results.tasks.feedback_stats = {
      ok: true,
      pending: feedbackCount
    };

    // 5. Save snapshot
    storage.incrementCounter("cron_runs");
    try {
      const fs = require("fs");
      const path = require("path");
      const snapDir = path.join(process.cwd(), "data", "snapshots");
      if (!fs.existsSync(snapDir)) fs.mkdirSync(snapDir, { recursive: true });
      const snapFile = path.join(snapDir, `snapshot-${new Date().toISOString().split("T")[0]}.json`);
      if (!fs.existsSync(snapFile)) {
        fs.writeFileSync(snapFile, JSON.stringify(results.tasks, null, 2));
      }
    } catch {}

    // 6. Alert if issues
    if (totalPubs < 100) {
      webhooks.onError({ message: `Publisher DB critically low: ${totalPubs} entries` }).catch(() => {});
    }

    return res.status(200).json({
      ok: true,
      cron_run: results
    });
  } catch (err) {
    webhooks.onError({ message: "Cron job failed", error: err.message }).catch(() => {});
    return res.status(500).json({ ok: false, error: true, message: err.message });
  }
};
