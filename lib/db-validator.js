// lib/db-validator.js
// BrandShuo — Publisher DB Validation Tool
// Run: node lib/db-validator.js
// Checks: duplicates, missing fields, data quality, coverage gaps

const publisherDB = require("./publisher-database");

const VALID_CATEGORIES = [
  "deal_coupon", "content_commerce", "seo_review_media", "coupon_extension",
  "cashback_rewards", "home_lifestyle_media", "subnetwork_router", "smart_router",
  "creator_commerce", "affiliate_network", "finance_review"
];

function validate() {
  const issues = [];
  const warnings = [];
  const pubs = publisherDB.PUBLISHERS.filter(p => p.id);
  const total = pubs.length;

  // 1. Check for duplicate IDs
  const ids = {};
  pubs.forEach(p => {
    if (!ids[p.id]) ids[p.id] = [];
    ids[p.id].push(p.publisher);
  });
  Object.entries(ids).filter(([, names]) => names.length > 1).forEach(([id, names]) => {
    issues.push({ type: "duplicate_id", id, names, message: `Duplicate ID "${id}": ${names.join(", ")}` });
  });

  // 2. Check for missing required fields
  pubs.forEach(p => {
    if (!p.publisher || !p.name) issues.push({ type: "missing_name", id: p.id, message: `Publisher ${p.id} missing name` });
    if (!p.group) warnings.push({ type: "missing_group", id: p.id, publisher: p.publisher, message: `Missing group` });
    if (!p.domains || p.domains.length === 0) warnings.push({ type: "no_domains", id: p.id, publisher: p.publisher, message: `No domains listed` });
    if (!p.networks || p.networks.length === 0) warnings.push({ type: "no_networks", id: p.id, publisher: p.publisher, message: `No networks listed` });
    if (!p.quality || p.quality < 40 || p.quality > 95) warnings.push({ type: "quality_range", id: p.id, publisher: p.publisher, quality: p.quality, message: `Quality out of range: ${p.quality}` });
    if (!p.region) warnings.push({ type: "no_region", id: p.id, publisher: p.publisher, message: `No region` });
    if (!VALID_CATEGORIES.includes(p.category)) warnings.push({ type: "invalid_category", id: p.id, publisher: p.publisher, category: p.category, message: `Invalid category: ${p.category}` });
    if (!p.incrementalityRisk) warnings.push({ type: "no_risk", id: p.id, publisher: p.publisher, message: `No incrementality risk` });
  });

  // 3. Check for duplicate domains across publishers
  const domains = {};
  pubs.filter(p => p.domains).forEach(p => {
    (p.domains || []).forEach(d => {
      if (!domains[d]) domains[d] = [];
      domains[d].push(p.id);
    });
  });
  Object.entries(domains).filter(([, ids]) => ids.length > 1).forEach(([domain, ids]) => {
    warnings.push({ type: "shared_domain", domain, ids, message: `Domain "${domain}" shared by: ${ids.join(", ")}` });
  });

  // 4. Category distribution
  const byCategory = {};
  pubs.forEach(p => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });

  // 5. Region coverage
  const byRegion = {};
  pubs.filter(p => p.region).forEach(p => { byRegion[p.region] = (byRegion[p.region] || 0) + 1; });

  // 6. Publishers without Amazon tags but with Amazon network
  const amazonNoTag = pubs.filter(p =>
    (p.networks || []).some(n => n.includes("Amazon")) && (!p.amazonTags || p.amazonTags.length === 0)
  );

  return {
    total,
    issues: issues.length,
    warnings: warnings.length,
    issues,
    warnings: warnings.slice(0, 30), // Limit output
    by_category: byCategory,
    by_region: byRegion,
    amazon_without_tags: amazonNoTag.length,
    data_completeness: {
      with_domains: pubs.filter(p => (p.domains || []).length > 0).length,
      with_networks: pubs.filter(p => (p.networks || []).length > 0).length,
      with_tags: pubs.filter(p => (p.amazonTags || []).length > 0).length,
      with_region: pubs.filter(p => p.region).length,
      percent_complete: Math.round(pubs.filter(p => (p.domains || []).length > 0 && p.region).length / total * 100)
    }
  };
}

// Run if called directly
if (require.main === module) {
  const result = validate();
  console.log(`\n=== Publisher DB Validation ===`);
  console.log(`Total: ${result.total} publishers`);
  console.log(`Issues: ${result.issues} | Warnings: ${result.warnings}`);
  console.log(`\nData Completeness:`);
  console.log(`  With domains: ${result.data_completeness.with_domains}/${result.total}`);
  console.log(`  With networks: ${result.data_completeness.with_networks}/${result.total}`);
  console.log(`  With Amazon tags: ${result.data_completeness.with_tags}/${result.total}`);
  console.log(`  With region: ${result.data_completeness.with_region}/${result.total}`);
  console.log(`  Overall: ${result.data_completeness.percent_complete}%`);
  console.log(`\nCategory Distribution:`);
  Object.entries(result.by_category).sort((a,b) => b[1]-a[1]).forEach(([c,n]) => console.log(`  ${c}: ${n}`));
  console.log(`\nAmazon network without tags: ${result.amazon_without_tags}`);
  if (result.issues > 0) {
    console.log(`\n⚠️  Issues:`);
    result.issues.forEach(i => console.log(`  [${i.type}] ${i.message}`));
  }
  if (result.warnings > 0) {
    console.log(`\n📝 Sample Warnings (${result.warnings} total):`);
    result.warnings.slice(0, 10).forEach(w => console.log(`  [${w.type}] ${w.message}`));
  }
  console.log();
}

module.exports = { validate };
