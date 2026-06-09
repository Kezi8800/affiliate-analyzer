// api/index.js — BrandShuo Unified API Router
// All routes consolidated into a single Vercel serverless function
// Routes:
//   POST /api/analyze         POST /api/batch
//   POST /api/trace           POST /api/scan
//   POST /api/feedback        POST /api/keys
//   GET  /api/docs            GET  /api/publishers
//   GET  /api/publisher/:id   GET  /api/publisher/:id/related
//   GET  /api/stats           GET  /api/health
//   GET  /api/dashboard       GET  /api/admin
//   GET  /api/sitemap.xml     GET  /api/cron
//   GET  /api/robots          POST /api/v1/analyze

const { analyzeLink } = require("../lib/analyze");

// Lazy-load handlers
function loadHandler(name) {
  try { return require(`../lib/handlers/${name}`); } catch (e) {
    console.error(`Handler load error [${name}]:`, e.message);
    return null;
  }
}

// Simple router
const ROUTES = {
  // POST endpoints
  "POST /analyze": "analyze",
  "POST /batch": "batch",
  "POST /trace": "trace",
  "POST /scan": "scan",
  "POST /feedback": "feedback",
  "POST /keys": "keys",
  // GET endpoints
  "GET /docs": "docs",
  "GET /publishers": "publishers",
  "GET /stats": "stats",
  "GET /health": "health",
  "GET /dashboard": "dashboard",
  "GET /admin": "admin",
  "GET /sitemap.xml": "sitemap",
  "GET /cron": "cron",
  "GET /robots": "robots",
};

const handlerCache = {};

function getHandler(name) {
  if (!handlerCache[name]) {
    handlerCache[name] = loadHandler(name);
  }
  return handlerCache[name];
}

module.exports = async function handler(req, res) {
  // Parse path
  const url = new URL(req.url || "", "https://tools.brandshuo.com");
  let path = url.pathname.replace(/^\/api\/?/, "/").replace(/\/+$/, "") || "/";

  // Dynamic routes: /api/publisher/:id and /api/publisher/:id/related
  let handlerName;

  if (path.startsWith("/publisher/") && path.endsWith("/related")) {
    handlerName = "publisher/[id]"; // reuse id handler for related
    const h = getHandler("publisher/related");
    if (h) {
      req._routeParams = { id: path.replace("/publisher/", "").replace("/related", "") };
      return h(req, res);
    }
    return res.status(404).json({ ok: false, error: true, message: "Not found" });
  }

  if (path.startsWith("/publisher/")) {
    const h = getHandler("publisher/[id]");
    if (h) return h(req, res);
    return res.status(404).json({ ok: false, error: true, message: "Not found" });
  }

  if (path.startsWith("/v1/")) {
    const h = getHandler("v1/analyze");
    if (h) return h(req, res);
    return res.status(404).json({ ok: false, error: true, message: "Not found" });
  }

  // Static routes
  // Keep leading slash for route matching: "POST /analyze"
  const cleanPath = path === "/" ? "/" : "/" + path.replace(/^\//, "").replace(/\/$/, "");
  const routeKey = `${req.method} ${cleanPath}`;
  handlerName = ROUTES[routeKey];

  if (!handlerName) {
    return res.status(404).json({
      ok: false, error: true,
      message: `Endpoint not found: ${req.method} ${path}`,
      docs: "https://tools.brandshuo.com/api/docs"
    });
  }

  const h = getHandler(handlerName);
  if (!h) {
    return res.status(500).json({ ok: false, error: true, message: `Handler not available: ${handlerName}` });
  }

  return h(req, res);
};
