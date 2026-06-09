// api/health.js
// BrandShuo — Health Check & Monitoring Endpoint
// GET /api/health — system health, DB stats, cache stats, latency

const publisherDB = require("../lib/publisher-database");
const { analysisCache } = require("../lib/cache");
const { limiter } = require("../lib/rate-limiter");
const storage = require("../lib/storage");

const startTime = Date.now();

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: true, message: "Method not allowed" });

  try {
    const memUsage = process.memoryUsage();
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const cacheStats = analysisCache.stats();
    const counters = storage.getCounters();
    const publisherStats = publisherDB.getPublisherStats();
    const feedbackCount = storage.getFeedbackCount();

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime_seconds: uptime,
      version: "4.7.0",

      system: {
        node_version: process.version,
        platform: process.platform,
        memory_mb: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heap_used: Math.round(memUsage.heapUsed / 1024 / 1024),
          heap_total: Math.round(memUsage.heapTotal / 1024 / 1024)
        }
      },

      database: {
        total_publishers: publisherStats.totalPublishers,
        categories: publisherStats.categories.length,
        groups: publisherStats.groups.length,
        networks: publisherStats.networks.length
      },

      cache: cacheStats,

      usage: {
        total_analyzed: counters.analyzed || 0,
        batch_analyzed: counters.batch_analyzed || 0,
        feedback_submitted: feedbackCount,
        unique_publishers_detected: Object.keys(counters.publishers_detected || {}).length,
        unique_networks_detected: Object.keys(counters.networks_detected || {}).length
      },

      endpoints: {
        analyze: "/api/analyze",
        batch: "/api/batch",
        publishers: "/api/publishers",
        publisher_detail: "/api/publisher/:id",
        stats: "/api/stats",
        feedback: "/api/feedback",
        keys: "/api/keys",
        docs: "/api/docs",
        health: "/api/health",
        dashboard: "/api/dashboard"
      }
    };

    return res.status(200).json({ ok: true, ...health });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      status: "unhealthy",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};
