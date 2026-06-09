// api/docs.js
// BrandShuo Attribution Checker — API Documentation
// GET /api/docs — returns HTML docs page

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrandShuo Attribution Intelligence API v4.7</title>
  <style>
    :root { --bg:#f8fafc; --card:#fff; --text:#0f172a; --muted:#64748b; --border:#e2e8f0; --brand:#2563ed; --green:#16a34a; --amber:#d97706; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Inter,system-ui,-apple-system,sans-serif; background:var(--bg); color:var(--text); line-height:1.6; padding:40px 20px; }
    .container { max-width:900px; margin:0 auto; }
    h1 { font-size:32px; letter-spacing:-0.03em; margin-bottom:8px; background:linear-gradient(135deg,var(--brand),#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .subtitle { color:var(--muted); margin-bottom:32px; }
    .card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:24px; margin-bottom:20px; }
    h2 { font-size:20px; letter-spacing:-0.02em; margin-bottom:12px; }
    h3 { font-size:16px; margin:16px 0 8px; }
    .endpoint { display:inline-block; padding:4px 10px; border-radius:6px; font-weight:700; font-size:13px; margin-right:8px; }
    .post { background:#dcfce7; color:#166534; }
    .get { background:#dbeafe; color:#1e40af; }
    code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px; }
    pre { background:#1e293b; color:#e2e8f0; padding:16px; border-radius:12px; overflow-x:auto; font-size:12px; line-height:1.5; margin:12px 0; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th, td { text-align:left; padding:8px 12px; border-bottom:1px solid var(--border); }
    th { color:var(--muted); font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; }
    .tier { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:700; }
    .tier-free { background:#dcfce7; color:#166534; }
    .tier-pro { background:#dbeafe; color:#1e40af; }
    .tier-enterprise { background:#f3e8ff; color:#6b21a8; }
    a { color:var(--brand); }
    .footer { text-align:center; color:var(--muted); font-size:12px; margin-top:40px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>BrandShuo Attribution Intelligence API</h1>
    <p class="subtitle">v4.7.0 — Decode affiliate attribution for any link. Identify network, publisher, risk, and incrementality.</p>

    <div class="card">
      <h2>Quick Start</h2>
      <pre>curl -X POST https://tools.brandshuo.com/api/analyze \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"url":"https://www.amazon.com/deals?tag=slickdeals09-20"}'</pre>
      <p>Get your free API key: <code>POST /api/keys</code></p>
    </div>

    <div class="card">
      <h2>Endpoints</h2>

      <h3><span class="endpoint post">POST</span> /api/analyze</h3>
      <p>Analyze a single affiliate link.</p>
      <pre>{
  "url": "https://www.amazon.com/deals?tag=slickdeals09-20"
}</pre>
      <p><strong>Response:</strong> Full attribution analysis — platform, network, publisher, quality score, risk level, channel role, signal flags, publisher intelligence, path classification.</p>

      <h3><span class="endpoint post">POST</span> /api/batch</h3>
      <p>Analyze up to 100 URLs in one request.</p>
      <pre>{
  "urls": [
    "https://www.amazon.com/deals?tag=slickdeals09-20",
    "https://www.awin1.com/cread.php?awinaffid=67890&awinmid=12345"
  ]
}</pre>
      <p><strong>Response:</strong> <code>{ stats, results: [{url, platform, network, publisher, ...}] }</code></p>

      <h3><span class="endpoint post">POST</span> /api/keys</h3>
      <p>Generate a free API key.</p>
      <pre>{"email": "you@example.com"}</pre>

      <h3><span class="endpoint get">GET</span> /api/keys</h3>
      <p>Check your API key usage and limits.</p>

      <h3><span class="endpoint post">POST</span> /api/feedback</h3>
      <p>Submit unknown publisher info to help grow the database.</p>
      <pre>{
  "url": "...",
  "publisher_name": "Example Publisher",
  "publisher_group": "Example Media Group",
  "category": "editorial_commerce",
  "network": "Amazon Associates",
  "notes": "Found this on product review page"
}</pre>
    </div>

    <div class="card">
      <h2>Pricing</h2>
      <table>
        <tr><th>Tier</th><th>Requests/Month</th><th>Price</th><th></th></tr>
        <tr><td>Free</td><td>100</td><td>Free</td><td><span class="tier tier-free">Get Started</span></td></tr>
        <tr><td>Pro</td><td>1,000</td><td>Contact us</td><td><span class="tier tier-pro">Agencies</span></td></tr>
        <tr><td>Enterprise</td><td>10,000+</td><td>Contact us</td><td><span class="tier tier-enterprise">Brands & Platforms</span></td></tr>
      </table>
      <p style="margin-top:12px;font-size:12px;color:var(--muted)">Pro and Enterprise tiers: <a href="mailto:hello@brandshuo.com">hello@brandshuo.com</a></p>
    </div>

    <div class="card">
      <h2>Supported Networks</h2>
      <p>Amazon Associates · Amazon Attribution · CJ Affiliate · Awin · Impact · Rakuten Advertising · ShareASale · Partnerize/Pepperjam · PartnerBoost · Levanta · Refersion · GoAffPro · UpPromote · Skimlinks · Sovrn Commerce · FlexOffers · Admitad · TradeDoubler · TradeTracker · Webgains · eBay Partner Network · Walmart/Impact · LinkConnector · Everflow · TUNE/HasOffers</p>
    </div>

    <div class="footer">
      <p>BrandShuo Attribution Intelligence Engine v4.7.0 · <a href="https://brandshuo.com">brandshuo.com</a></p>
    </div>
  </div>
</body>
</html>`;

  return res.status(200).send(html);
};
