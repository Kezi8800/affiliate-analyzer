// api/dashboard.js
// BrandShuo — Analytics Dashboard
// GET /api/dashboard — Visual HTML dashboard for monitoring

const publisherDB = require("../lib/publisher-database");
const { analysisCache } = require("../lib/cache");
const storage = require("../lib/storage");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  const stats = publisherDB.getPublisherStats();
  const cacheStats = analysisCache.stats();
  const counters = storage.getCounters();
  const publishers = publisherDB.PUBLISHERS.filter(p => p.id && p.publisher);

  // Category distribution
  const byCategory = {};
  publishers.forEach(p => { const c = p.category || "unknown"; byCategory[c] = (byCategory[c] || 0) + 1; });
  const categoryData = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  // Network distribution (top 15)
  const byNetwork = {};
  publishers.forEach(p => { (p.networks || []).forEach(n => { byNetwork[n] = (byNetwork[n] || 0) + 1; }); });
  const networkData = Object.entries(byNetwork).sort((a, b) => b[1] - a[1]).slice(0, 15);

  // Risk distribution
  const byRisk = {};
  publishers.forEach(p => { const r = p.incrementalityRisk || "Unknown"; byRisk[r] = (byRisk[r] || 0) + 1; });

  // Region distribution
  const byRegion = {};
  publishers.forEach(p => { const r = p.region || "Global"; byRegion[r] = (byRegion[r] || 0) + 1; });

  // Top detected publishers
  const topPublishers = Object.entries(counters.publishers_detected || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Top detected networks
  const topNetworks = Object.entries(counters.networks_detected || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 10);

  const maxCat = Math.max(...categoryData.map(([, c]) => c), 1);
  const maxNet = Math.max(...networkData.map(([, c]) => c), 1);
  const maxDet = Math.max(...topPublishers.map(([, c]) => c), 1);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BrandShuo Attribution Intelligence — Dashboard</title>
<meta name="robots" content="noindex">
<style>
:root{--bg:#f8fafc;--card:#fff;--text:#0f172a;--muted:#64748b;--line:#e2e8f0;--brand:#2563eb;--green:#16a34a;--amber:#d97706;--red:#dc2626;--purple:#7c3aed}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.5;padding:20px}
.container{max-width:1280px;margin:0 auto}
h1{font-size:28px;letter-spacing:-0.03em;margin-bottom:4px}
.subtitle{color:var(--muted);margin-bottom:24px;font-size:13px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px}
.card h2{font-size:16px;letter-spacing:-0.02em;margin-bottom:16px}
.stat-row{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:20px}
.stat{display:flex;flex-direction:column}
.stat-value{font-size:28px;font-weight:900;letter-spacing:-0.03em}
.stat-label{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;letter-spacing:0.05em}
.bar-wrap{margin:8px 0}
.bar-label{display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px}
.bar{height:20px;border-radius:6px;background:var(--line);overflow:hidden}
.bar-fill{height:100%;border-radius:inherit;transition:width .5s}
.bar-fill-brand{background:linear-gradient(90deg,var(--brand),var(--purple))}
.bar-fill-green{background:var(--green)}
.bar-fill-amber{background:var(--amber)}
.bar-fill-red{background:var(--red)}
.metric{text-align:center;padding:12px}
.metric-value{font-size:32px;font-weight:900;letter-spacing:-0.03em}
.metric-label{font-size:11px;color:var(--muted);margin-top:4px}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700}
.tag-green{background:#dcfce7;color:#166534}
.tag-amber{background:#fef3c7;color:#92400e}
.tag-red{background:#fee2e2;color:#991b1b}
.tag-blue{background:#dbeafe;color:#1e40af}
table{width:100%;border-collapse:collapse;font-size:12px}
th{text-align:left;padding:8px 12px;border-bottom:2px solid var(--line);color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:0.05em}
td{padding:8px 12px;border-bottom:1px solid var(--line)}
td:last-child,th:last-child{text-align:right}
.footer{text-align:center;color:var(--muted);font-size:11px;margin-top:30px;padding:20px}
.refresh{text-align:right;font-size:11px;color:var(--muted);margin-bottom:12px}
</style>
</head>
<body>
<div class="container">
<h1>📊 BrandShuo Attribution Intelligence</h1>
<p class="subtitle">Dashboard v4.7 · ${new Date().toISOString().replace("T"," ").slice(0,19)}</p>

<div class="stat-row">
  <div class="stat"><span class="stat-value">${stats.totalPublishers}</span><span class="stat-label">Publishers</span></div>
  <div class="stat"><span class="stat-value">${stats.categories.length}</span><span class="stat-label">Categories</span></div>
  <div class="stat"><span class="stat-value">${stats.networks.length}</span><span class="stat-label">Networks</span></div>
  <div class="stat"><span class="stat-value">${counters.analyzed || 0}</span><span class="stat-label">API Calls</span></div>
  <div class="stat"><span class="stat-value" style="color:var(--brand)">${cacheStats.hitRate}</span><span class="stat-label">Cache Hit Rate</span></div>
</div>

<div class="grid2">
  <!-- Categories -->
  <div class="card">
    <h2>Publishers by Category</h2>
    ${categoryData.map(([cat, count]) => `
      <div class="bar-wrap">
        <div class="bar-label"><span>${cat.replace(/_/g," ")}</span><span>${count}</span></div>
        <div class="bar"><div class="bar-fill bar-fill-brand" style="width:${(count/maxCat*100).toFixed(0)}%"></div></div>
      </div>
    `).join("")}
  </div>

  <!-- Networks -->
  <div class="card">
    <h2>Publishers by Network</h2>
    ${networkData.map(([net, count]) => `
      <div class="bar-wrap">
        <div class="bar-label"><span>${net}</span><span>${count}</span></div>
        <div class="bar"><div class="bar-fill bar-fill-green" style="width:${(count/maxNet*100).toFixed(0)}%"></div></div>
      </div>
    `).join("")}
  </div>
</div>

<div class="grid2" style="margin-top:16px">
  <!-- Risk Distribution -->
  <div class="card">
    <h2>Risk Distribution</h2>
    <div class="stat-row">
      ${Object.entries(byRisk).map(([risk, count]) => `
        <div class="metric">
          <div class="metric-value" style="color:${risk.toLowerCase().includes("low")?"var(--green)":risk.toLowerCase().includes("high")||risk.toLowerCase().includes("very")?"var(--red)":"var(--amber)"}">${count}</div>
          <div class="metric-label">${risk}</div>
        </div>
      `).join("")}
    </div>
  </div>

  <!-- Regions -->
  <div class="card">
    <h2>Coverage by Region</h2>
    ${Object.entries(byRegion).sort((a,b) => b[1]-a[1]).slice(0,10).map(([reg, count]) => `
      <div class="bar-wrap">
        <div class="bar-label"><span>${reg}</span><span>${count}</span></div>
        <div class="bar"><div class="bar-fill bar-fill-amber" style="width:${(count/publishers.length*100).toFixed(0)}%"></div></div>
      </div>
    `).join("")}
  </div>
</div>

<div class="grid2" style="margin-top:16px">
  <!-- Top Detected Publishers -->
  <div class="card">
    <h2>Top Detected Publishers</h2>
    ${topPublishers.length ? `
    <table>
      <tr><th>Publisher</th><th>Detections</th></tr>
      ${topPublishers.map(([p, c]) => `<tr><td>${p}</td><td>${c}</td></tr>`).join("")}
    </table>
    ` : '<p style="color:var(--muted);font-size:12px">No detection data yet. Analyze some URLs to populate.</p>'}
  </div>

  <!-- Top Detected Networks -->
  <div class="card">
    <h2>Top Detected Networks</h2>
    ${topNetworks.length ? `
    <table>
      <tr><th>Network</th><th>Detections</th></tr>
      ${topNetworks.map(([n, c]) => `<tr><td>${n}</td><td>${c}</td></tr>`).join("")}
    </table>
    ` : '<p style="color:var(--muted);font-size:12px">No detection data yet.</p>'}
  </div>
</div>

<div class="grid" style="margin-top:16px">
  <!-- Cache -->
  <div class="card">
    <h2>Cache Stats</h2>
    <div class="stat-row">
      <div class="stat"><span class="stat-value">${cacheStats.size}</span><span class="stat-label">Entries</span></div>
      <div class="stat"><span class="stat-value">${cacheStats.hits}</span><span class="stat-label">Hits</span></div>
      <div class="stat"><span class="stat-value">${cacheStats.misses}</span><span class="stat-label">Misses</span></div>
      <div class="stat"><span class="stat-value">${cacheStats.hitRate}</span><span class="stat-label">Hit Rate</span></div>
      <div class="stat"><span class="stat-value">${cacheStats.evictions}</span><span class="stat-label">Evictions</span></div>
    </div>
  </div>

  <!-- System -->
  <div class="card">
    <h2>System</h2>
    <div class="stat-row">
      <div class="stat"><span class="stat-value">${process.version}</span><span class="stat-label">Node</span></div>
      <div class="stat"><span class="stat-value">${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB</span><span class="stat-label">Heap Used</span></div>
      <div class="stat"><span class="stat-value">${process.platform}</span><span class="stat-label">Platform</span></div>
    </div>
  </div>
</div>

<p class="refresh">Auto-refreshes on reload · <a href="/api/health" style="color:var(--brand)">/api/health</a> (JSON) · <a href="/api/docs" style="color:var(--brand)">/api/docs</a></p>

<div class="footer">BrandShuo Attribution Intelligence v4.7.0 · <a href="https://brandshuo.com" style="color:var(--brand)">brandshuo.com</a></div>
</div>
</body>
</html>`;

  return res.status(200).send(html);
};
