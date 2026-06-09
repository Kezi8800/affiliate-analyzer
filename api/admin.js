// api/admin.js
// BrandShuo — Admin Panel
// GET /api/admin — HTML admin dashboard (basic auth)
// Query: ?action=export&format=csv — export feedback
// Header: X-Admin-Key for authentication

const storage = require("../lib/storage");
const publisherDB = require("../lib/publisher-database");
const { analysisCache } = require("../lib/cache");

const ADMIN_KEY = process.env.ADMIN_KEY || "brandshuo-admin";

function checkAuth(req) {
  const key = req.headers["x-admin-key"] || new URL(req.url || "", "https://tools.brandshuo.com").searchParams.get("key") || "";
  return key === ADMIN_KEY;
}

function renderAdminPage(feedback, stats, cacheStats, counters) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BrandShuo Admin — Attribution Intelligence v4.7</title>
<meta name="robots" content="noindex,nofollow">
<style>
:root{--bg:#f1f5f9;--card:#fff;--text:#0f172a;--muted:#64748b;--line:#e2e8f0;--brand:#2563eb;--green:#16a34a;--amber:#d97706;--red:#dc2626}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.5;padding:20px}
.container{max-width:1200px;margin:0 auto}
h1{font-size:24px;letter-spacing:-.03em;margin-bottom:4px}
nav{display:flex;gap:12px;margin:16px 0;flex-wrap:wrap}
nav a{padding:8px 16px;background:var(--card);border:1px solid var(--line);border-radius:8px;text-decoration:none;color:var(--text);font-size:13px;font-weight:600}
nav a:hover{background:#f8fafc;border-color:var(--brand)}
nav a.active{background:var(--brand);color:#fff;border-color:var(--brand)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:24px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px}
.stat-value{font-size:28px;font-weight:900;letter-spacing:-.03em}
.stat-label{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;letter-spacing:.05em;margin-top:4px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;margin-bottom:16px}
.card h2{font-size:16px;letter-spacing:-.02em;margin-bottom:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
table{width:100%;border-collapse:collapse;font-size:12px}
th{text-align:left;padding:8px 12px;border-bottom:2px solid var(--line);color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em}
td{padding:8px 12px;border-bottom:1px solid var(--line);word-break:break-word}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700}
.tag-new{background:#dcfce7;color:#166534}
.tag-pending{background:#fef3c7;color:#92400e}
.actions{display:flex;gap:8px;flex-wrap:wrap}
.btn{padding:8px 16px;border-radius:8px;border:0;font-size:12px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block}
.btn-primary{background:var(--brand);color:#fff}
.btn-secondary{background:#f1f5f9;color:var(--text);border:1px solid var(--line)}
.btn-danger{background:#fee2e2;color:var(--red)}
</style>
</head>
<body>
<div class="container">
<h1>⚙️ BrandShuo Admin</h1>
<p style="color:var(--muted);font-size:12px">Attribution Intelligence v4.7 · ${new Date().toISOString().slice(0,19)}</p>

<nav>
<a href="?tab=dashboard" class="${stats ? 'active' : ''}">Dashboard</a>
<a href="?tab=feedback" class="${feedback ? 'active' : ''}">Feedback (${feedback?.length || 0})</a>
<a href="?tab=publishers">Publishers (${publisherDB.PUBLISHERS.filter(p=>p.id).length})</a>
<a href="?tab=cache">Cache (${cacheStats.size})</a>
<a href="?action=export-feedback&format=jsonl" class="btn btn-secondary">Export Feedback</a>
<a href="?action=export-publishers&format=json" class="btn btn-secondary">Export Publishers</a>
</nav>

<div class="stats">
<div class="stat"><div class="stat-value">${publisherDB.PUBLISHERS.filter(p=>p.id).length}</div><div class="stat-label">Publishers</div></div>
<div class="stat"><div class="stat-value">${counters.analyzed||0}</div><div class="stat-label">API Calls</div></div>
<div class="stat"><div class="stat-value">${feedback?.length||0}</div><div class="stat-label">Pending Feedback</div></div>
<div class="stat"><div class="stat-value" style="color:var(--brand)">${cacheStats.hitRate}</div><div class="stat-label">Cache Hit Rate</div></div>
<div class="stat"><div class="stat-value">${counters.publishers_detected ? Object.keys(counters.publishers_detected).length : 0}</div><div class="stat-label">Unique Publishers Detected</div></div>
</div>

${feedback ? `
<div class="card">
<h2>📝 Recent Feedback (${feedback.length})</h2>
<table>
<tr><th>Date</th><th>URL</th><th>Publisher</th><th>Group</th><th>Network</th><th>Notes</th></tr>
${feedback.slice(0,30).map(f=>`
<tr>
<td style="white-space:nowrap">${(f.submitted_at||'').slice(0,10)}</td>
<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${f.url||''}">${(f.url||'').replace(/^https?:\/\//,'').slice(0,40)}</td>
<td><strong>${f.publisher_name||'--'}</strong></td>
<td>${f.publisher_group||'--'}</td>
<td><span class="tag tag-${f.network?'new':'pending'}">${f.network||'Unknown'}</span></td>
<td style="color:var(--muted);max-width:150px">${(f.notes||'').slice(0,50)}</td>
</tr>`).join('')}
</table>
</div>` : ''}

${cacheStats ? `
<div class="card">
<h2>📊 Cache Stats</h2>
<div class="grid">
<div class="stat"><div class="stat-value">${cacheStats.size}</div><div class="stat-label">Entries</div></div>
<div class="stat"><div class="stat-value">${cacheStats.hits}</div><div class="stat-label">Hits</div></div>
<div class="stat"><div class="stat-value">${cacheStats.misses}</div><div class="stat-label">Misses</div></div>
<div class="stat"><div class="stat-value">${cacheStats.evictions}</div><div class="stat-label">Evictions</div></div>
</div>
</div>` : ''}

<p style="text-align:center;color:var(--muted);font-size:11px;margin-top:32px">BrandShuo Admin v4.7 · <a href="/api/health" style="color:var(--brand)">Health</a> · <a href="/api/dashboard" style="color:var(--brand)">Dashboard</a></p>
</div></body></html>`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Key");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!checkAuth(req)) {
    res.setHeader("WWW-Authenticate", "Header X-Admin-Key required");
    return res.status(401).json({ ok: false, error: true, message: "Admin key required. Set X-Admin-Key header." });
  }

  try {
    const url = new URL(req.url || "", "https://tools.brandshuo.com");
    const action = url.searchParams.get("action") || "";
    const format = url.searchParams.get("format") || "json";

    // Export feedback
    if (action === "export-feedback") {
      const feedback = storage.getFeedback(1000);
      if (format === "jsonl") {
        res.setHeader("Content-Type", "application/x-jsonlines");
        res.setHeader("Content-Disposition", "attachment; filename=feedback.jsonl");
        return res.status(200).send(feedback.map(f => JSON.stringify(f)).join("\n"));
      }
      if (format === "csv") {
        const csv = ["url,publisher_name,publisher_group,network,submitted_at"];
        feedback.forEach(f => csv.push(`"${f.url||''}","${f.publisher_name||''}","${f.publisher_group||''}","${f.network||''}","${f.submitted_at||''}"`));
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=feedback.csv");
        return res.status(200).send(csv.join("\n"));
      }
      return res.status(200).json({ ok: true, count: feedback.length, feedback });
    }

    // Export publishers
    if (action === "export-publishers") {
      const pubs = publisherDB.PUBLISHERS.filter(p => p.id).map(p => ({
        id: p.id, publisher: p.publisher, group: p.group, category: p.category,
        quality: p.quality, region: p.region, domains: (p.domains||[]).slice(0,3),
        networks: p.networks, risk: p.incrementalityRisk
      }));
      if (format === "csv") {
        const csv = ["id,publisher,group,category,quality,region,networks"];
        pubs.forEach(p => csv.push(`${p.id},"${p.publisher}","${p.group}","${p.category}",${p.quality},"${p.region}","${(p.networks||[]).join(';')}"`));
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=publishers.csv");
        return res.status(200).send(csv.join("\n"));
      }
      return res.status(200).json({ ok: true, count: pubs.length, publishers: pubs });
    }

    // Default: render admin page
    const feedback = storage.getFeedback(30);
    const stats = null;
    const cacheStats = analysisCache.stats();
    const counters = storage.getCounters();

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(renderAdminPage(feedback, stats, cacheStats, counters));
  } catch (err) {
    return res.status(500).json({ ok: false, error: true, message: err.message });
  }
};
