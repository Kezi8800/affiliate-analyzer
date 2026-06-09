// api/sitemap.js
// BrandShuo — Publisher Sitemap for SEO
// GET /api/sitemap.xml — XML sitemap of all publisher detail pages

const publisherDB = require("../publisher-database");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");

  const baseUrl = "https://brandshuo.com";
  const pubs = publisherDB.PUBLISHERS.filter(p => p.id && p.publisher);
  const now = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Static pages -->
  <url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/attribution-checker/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/api</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>

  <!-- Publisher detail pages -->
${pubs.map(p => `
  <url>
    <loc>${baseUrl}/publisher/${p.id}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${now}</lastmod>
  </url>`).join("")}

  <!-- Category pages -->
${[...new Set(pubs.map(p => p.category).filter(Boolean))].map(cat => `
  <url>
    <loc>${baseUrl}/publishers/${cat.replace(/_/g, "-")}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join("")}
</urlset>`;

  return res.status(200).send(xml);
};
