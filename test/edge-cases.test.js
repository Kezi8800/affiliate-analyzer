// test/edge-cases.test.js
// BrandShuo — Edge Case Tests
// Tests: malformed URLs, encoding, special chars, performance
// Run: node test/edge-cases.test.js

const { analyzeLink } = require("../lib/analyze");
const { isShortener } = require("../lib/redirect-follower");
const { analysisCache } = require("../lib/cache");

let passed = 0, failed = 0;
function assert(condition, msg) { if (condition) passed++; else { console.error(`  ❌ ${msg}`); failed++; } }

console.log("\n=== Edge Case Tests ===\n");

// ===== URL Encoding =====
console.log("1. URL Encoding");
assert(analyzeLink("https://example.com/?q=hello%20world").ok === true, "encoded space");
assert(analyzeLink("https://example.com/?tag=测试%20tag").ok === true, "Chinese URL encoded");
assert(analyzeLink("https://example.com/path/with/spaces%20and%20stuff").ok === true, "encoded path");
passed += 0; // reset counter for display
failed += 0;

// ===== Special Characters =====
console.log("2. Special Characters");
(() => {
  const r = analyzeLink("https://example.com/?ref=user@domain.com&source=test");
  assert(r.ok === true, "email in param");
  assert(!r.error, "should not error on @");
})();
(() => {
  const r = analyzeLink("https://example.com/?param=value+with+plus");
  assert(r.ok === true, "plus in param");
})();
(() => {
  const r = analyzeLink("https://sub.domain.co.uk/path/to/page?param=value");
  assert(r.ok === true, "multi-level subdomain .co.uk");
})();

// ===== Long URLs =====
console.log("3. Long URLs");
(() => {
  const longParam = "x".repeat(500);
  const r = analyzeLink(`https://example.com/?tag=${longParam}`);
  assert(r.ok === true, "500-char param");
})();
(() => {
  const longPath = "/" + "a/".repeat(20);
  const r = analyzeLink(`https://example.com${longPath}?tag=test`);
  assert(r.ok === true, "long path");
})();

// ===== Shortener Detection =====
console.log("4. Shortener Detection");
assert(isShortener("https://bit.ly/abc123") === true, "bit.ly detected");
assert(isShortener("https://amzn.to/3test") === true, "amzn.to detected");
assert(isShortener("https://t.co/xyz") === true, "t.co detected");
assert(isShortener("https://geni.us/test") === true, "geni.us detected");
assert(isShortener("https://goto.walmart.com/test") === true, "goto.walmart detected");
assert(isShortener("https://amazon.com/dp/B0TEST") === false, "amazon.com NOT shortener");
assert(isShortener("https://example.com") === false, "example.com NOT shortener");

// ===== Network Edge Cases =====
console.log("5. Network Edge Cases");
(() => {
  // CJ with uppercase params
  const r = analyzeLink("https://www.anrdoezrs.net/click-99999-88888?CJEVENT=test&URL=example.com");
  assert(r.network === "CJ Affiliate", "CJ uppercase params");
})();
(() => {
  // Awin with numeric-only aff ID
  const r = analyzeLink("https://www.awin1.com/cread.php?awinaffid=1234567890");
  assert(r.publisher?.includes("1234567890"), "Awin numeric ID");
})();
(() => {
  // Impact with multiple subids
  const r = analyzeLink("https://example.com/?irclickid=abc&irgwc=1&sharedid=SHARED123&subid1=SUB1");
  assert(r.network === "Impact", "Impact multi-subid");
})();

// ===== Publisher Edge Cases =====
console.log("6. Publisher Edge Cases");
(() => {
  // Known domain with no params
  const r = analyzeLink("https://slickdeals.net/");
  assert(r.publisher?.toLowerCase().includes("slickdeals"), "slickdeals domain");
})();
(() => {
  // International domain
  const r = analyzeLink("https://www.mydealz.de/gutscheine");
  assert(r.publisher, "mydealz publisher not null");
})();

// ===== Cache =====
console.log("7. Cache Edge Cases");
(() => {
  const url = "https://test-cache.example.com/?tag=cachetest";
  const r1 = analysisCache.get(url);
  assert(r1 === null, "cache miss");
  analysisCache.set(url, { test: true });
  const r2 = analysisCache.get(url);
  assert(r2 !== null, "cache hit");
  // Same URL with different protocol should still hit (normalized)
  const r3 = analysisCache.get("http://test-cache.example.com/?tag=cachetest");
  assert(r3 !== null, "cache hit with different protocol");
})();

// ===== Null/Empty Safety =====
console.log("8. Null/Empty Safety");
(() => {
  const r = analyzeLink("");
  assert(r.ok === false || r.error, "empty string returns error");
})();

// ===== Unicode =====
console.log("9. Unicode URLs");
(() => {
  const r = analyzeLink("https://例子.测试/path?tag=中文标签");
  assert(r.ok !== false, "IDN/Unicode URL handled");
})();
(() => {
  const r = analyzeLink("https://amazon.co.jp/dp/B0TEST?tag=jp_tag-22&language=ja_JP");
  assert(r.network === "Amazon Associates", "Amazon JP tag detection");
})();

// ===== Summary =====
console.log(`\n========================================`);
console.log(`  Edge Cases: ${passed} passed, ${failed} failed`);
console.log(`  ${failed === 0 ? '✅ ALL EDGE CASES PASSED' : '❌ SOME FAILED'}`);
console.log(`========================================\n`);
process.exit(failed > 0 ? 1 : 0);
