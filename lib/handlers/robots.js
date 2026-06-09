// api/robots.js
// BrandShuo — robots.txt
// GET /robots.txt (via Vercel rewrites) or GET /api/robots

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");

  const txt = `User-agent: *
Allow: /
Allow: /api/docs
Allow: /api/publishers
Allow: /api/publisher/
Allow: /api/stats
Allow: /api/health
Disallow: /api/admin
Disallow: /api/keys
Disallow: /api/cron
Disallow: /api/feedback

Sitemap: https://brandshuo.com/api/sitemap.xml

# BrandShuo Attribution Intelligence
# https://brandshuo.com
`;

  return res.status(200).send(txt);
};
