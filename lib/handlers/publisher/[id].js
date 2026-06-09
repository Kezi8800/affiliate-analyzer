// api/publisher/[id].js
// BrandShuo — Publisher Detail Page
// GET /api/publisher/:id — returns JSON + HTML publisher detail
// SEO-friendly: renders HTML when Accept header includes text/html

const publisherDB = require("../../publisher-database");

function renderHtmlPage(publisher) {
  const p = publisher;
  const networks = (p.networks || []).join(", ");
  const domains = (p.domains || []).join(", ");
  const aliases = (p.aliases || []).join(", ");
  const tags = (p.amazonTags || []).join(", ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.publisher} — Publisher Profile | BrandShuo Attribution Intelligence</title>
  <meta name="description" content="${p.publisher} is a ${p.publisherType || p.category} publisher. Group: ${p.group}. Networks: ${networks}. Quality score: ${p.quality}/100. Risk: ${p.incrementalityRisk}.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://brandshuo.com/publisher/${p.id}/">
  <style>
    :root{--bg:#f8fafc;--card:#fff;--text:#0f172a;--muted:#64748b;--line:#e2e8f0;--brand:#2563eb;--green:#16a34a;--amber:#d97706;--red:#dc2626}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;padding:40px 20px}
    .container{max-width:800px;margin:0 auto}
    .header{margin-bottom:32px}
    .breadcrumb{font-size:12px;color:var(--muted);margin-bottom:12px}
    .breadcrumb a{color:var(--brand);text-decoration:none}
    h1{font-size:36px;letter-spacing:-0.03em;margin-bottom:4px}
    .group{color:var(--muted);font-size:16px}
    .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px;margin-bottom:20px}
    .card h2{font-size:18px;letter-spacing:-0.02em;margin-bottom:16px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .stat{padding:12px;background:var(--bg);border-radius:10px}
    .stat-label{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;letter-spacing:0.05em}
    .stat-value{font-size:18px;font-weight:800;margin-top:4px}
    .score-bar{height:8px;border-radius:999px;background:#e2e8f0;margin-top:8px;overflow:hidden}
    .score-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--brand),var(--green))}
    .tag{display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;margin:2px}
    .tag-network{background:#dbeafe;color:#1e40af}
    .tag-category{background:#dcfce7;color:#166534}
    .badge{display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700}
    .badge-low{background:#dcfce7;color:#166534}
    .badge-medium{background:#fef3c7;color:#92400e}
    .badge-high{background:#fee2e2;color:#991b1b}
    .cta{text-align:center;padding:20px;background:linear-gradient(135deg,var(--brand),#7c3aed);border-radius:16px;color:#fff;margin-top:20px}
    .cta h3{margin-bottom:8px}
    .cta a{color:#fff;font-weight:700}
    .footer{text-align:center;color:var(--muted);font-size:12px;margin-top:40px}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="breadcrumb">
        <a href="https://brandshuo.com/">Home</a> ›
        <a href="https://brandshuo.com/attribution-checker/">Attribution Checker</a> ›
        ${p.publisher}
      </div>
      <h1>${p.publisher}</h1>
      <p class="group">${p.group || "Independent"}</p>
    </div>

    <div class="card">
      <h2>Overview</h2>
      <div class="grid2">
        <div class="stat">
          <span class="stat-label">Quality Score</span>
          <span class="stat-value">${p.quality || "--"}/100</span>
          <div class="score-bar"><div class="score-fill" style="width:${p.quality || 0}%"></div></div>
        </div>
        <div class="stat">
          <span class="stat-label">Incrementality Risk</span>
          <span class="stat-value"><span class="badge badge-${(p.incrementalityRisk||"").toLowerCase().includes("low")?"low":(p.incrementalityRisk||"").toLowerCase().includes("high")?"high":"medium"}">${p.incrementalityRisk || "Medium"}</span></span>
        </div>
        <div class="stat">
          <span class="stat-label">Publisher Type</span>
          <span class="stat-value" style="font-size:16px">${p.publisherType || p.category || "--"}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Traffic Type</span>
          <span class="stat-value" style="font-size:16px">${p.trafficType || "--"}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Classification</h2>
      <div class="grid2">
        <div class="stat"><span class="stat-label">Commercial Intent</span><span class="stat-value" style="font-size:14px">${p.intent || p.intentLevel || "--"}</span></div>
        <div class="stat"><span class="stat-label">Channel Role</span><span class="stat-value" style="font-size:14px">${p.role || p.funnelRole || "--"}</span></div>
        <div class="stat"><span class="stat-label">Attribution Risk</span><span class="stat-value" style="font-size:14px">${p.attributionRisk || "--"}</span></div>
        <div class="stat"><span class="stat-label">Region</span><span class="stat-value" style="font-size:14px">${p.region || "Global"}</span></div>
      </div>
    </div>

    <div class="card">
      <h2>Networks & Identifiers</h2>
      <div style="margin-bottom:12px">
        <strong style="font-size:13px">Affiliate Networks:</strong><br>
        ${(p.networks || []).map(n => '<span class="tag tag-network">' + n + '</span>').join(" ") || '<span class="tag">None listed</span>'}
      </div>
      ${p.domains && p.domains.length ? '<div style="margin-bottom:12px"><strong style="font-size:13px">Domains:</strong><br>' + domains + '</div>' : ''}
      ${p.amazonTags && p.amazonTags.length ? '<div style="margin-bottom:12px"><strong style="font-size:13px">Amazon Tags:</strong><br><code style="font-size:12px">' + tags + '</code></div>' : ''}
      ${p.aliases && p.aliases.length ? '<div><strong style="font-size:13px">Aliases:</strong><br>' + aliases + '</div>' : ''}
    </div>

    <div class="cta">
      <h3>Analyze a link from ${p.publisher}</h3>
      <p style="margin-bottom:8px">Paste any affiliate link to see its full attribution path.</p>
      <a href="https://brandshuo.com/attribution-checker/">→ Open Attribution Checker</a>
    </div>

    <div class="footer">
      <p>BrandShuo Attribution Intelligence · <a href="https://brandshuo.com">brandshuo.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: true, message: "Method not allowed" });
  }

  try {
    const url = new URL(req.url, "https://tools.brandshuo.com");
    const pathParts = url.pathname.replace(/^\/api\/publisher\//, "").split("/");
    const slug = pathParts[0] || "";

    if (!slug) {
      return res.status(400).json({ ok: false, error: true, message: "Publisher slug required: /api/publisher/:id" });
    }

    const publisher = publisherDB.getPublisherById(slug) ||
      publisherDB.PUBLISHERS.find(p =>
        p.id === slug ||
        (p.domains || []).some(d => d.includes(slug)) ||
        (p.aliases || []).some(a => a.toLowerCase() === slug.toLowerCase())
      );

    if (!publisher) {
      const accept = req.headers.accept || "";
      if (accept.includes("text/html")) {
        return res.status(404).send(`<!doctype html><html><head><title>Publisher Not Found</title></head><body><h1>Publisher not found</h1><p>Try <a href="https://brandshuo.com/attribution-checker/">analyzing the link directly</a>.</p></body></html>`);
      }
      return res.status(404).json({ ok: false, error: true, message: "Publisher not found" });
    }

    const accept = req.headers.accept || "";

    // Return HTML for browsers (SEO)
    if (accept.includes("text/html")) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(renderHtmlPage(publisher));
    }

    // Return JSON for API clients
    return res.status(200).json({
      ok: true,
      publisher: {
        id: publisher.id,
        publisher: publisher.publisher || publisher.name,
        name: publisher.name || publisher.publisher,
        group: publisher.group,
        group_key: publisher.groupKey,
        category: publisher.category,
        publisher_type: publisher.publisherType || publisher.category,
        traffic_type: publisher.trafficType,
        intent: publisher.intent || publisher.intentLevel,
        role: publisher.role || publisher.funnelRole,
        funnel_role: publisher.funnelRole || publisher.role,
        quality: publisher.quality,
        incrementality_risk: publisher.incrementalityRisk,
        attribution_risk: publisher.attributionRisk,
        region: publisher.region || "Global",
        domains: publisher.domains || [],
        amazon_tags: publisher.amazonTags || [],
        aliases: publisher.aliases || [],
        networks: publisher.networks || []
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: true, message: err.message });
  }
};
