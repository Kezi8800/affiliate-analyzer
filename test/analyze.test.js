// test/analyze.test.js
// BrandShuo — Core Detection Tests
// Run: npm test

const { analyzeLink } = require("../lib/analyze");

// Helper
function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function assertNetwork(result, expected) {
  assert(result.network === expected, `Network: expected "${expected}", got "${result.network}"`);
}

function assertPublisher(result, contains) {
  assert(
    String(result.publisher || "").toLowerCase().includes(contains.toLowerCase()),
    `Publisher: expected to contain "${contains}", got "${result.publisher}"`
  );
}

function assertNotUnknown(result, field) {
  const val = result[field];
  assert(val && !String(val).toLowerCase().includes("unknown"), `${field}: got "${val}", expected not Unknown`);
}

// ===== Network Detection Tests =====
console.log("\n=== Network Detection ===");

(function testAmazonAssociates() {
  const r = analyzeLink("https://www.amazon.com/deals?tag=slickdeals09-20&ascsubtag=test");
  assertNetwork(r, "Amazon Associates");
  assertPublisher(r, "Slickdeals");
  assert(r.platform === "Amazon", "Platform should be Amazon");
  console.log("✅ Amazon Associates / Slickdeals");
})();

(function testAmazonAssociatesDealSeek() {
  const r = analyzeLink("https://www.amazon.com/dp/B09FLJTNVS?lv=shuf&smid=A1KWJVS57NX03I&psc=1&th=1&tag=dealseekweb-20&m=A1KWJVS57NX03I&channelId=1&plpRedirect=mhFallback");
  assertNetwork(r, "Amazon Associates");
  assertPublisher(r, "DealSeek");
  assert(r.platform === "Amazon", "Platform should be Amazon");
  console.log("PASS Amazon Associates / DealSeek");
})();

(function testAwin() {
  const r = analyzeLink("https://www.awin1.com/cread.php?awinaffid=67890&awinmid=12345");
  assertNetwork(r, "Awin");
  assertPublisher(r, "67890");
  console.log("✅ Awin / Publisher ID extraction");
})();

(function testCJ() {
  const r = analyzeLink("https://www.anrdoezrs.net/click-12345678-09876543?url=https://example.com");
  assertNetwork(r, "CJ Affiliate");
  assertPublisher(r, "12345678");
  console.log("✅ CJ Affiliate / Click path extraction");
})();

(function testCJ_dpbolvw() {
  const r = analyzeLink("https://www.dpbolvw.net/click-11111111-22222222");
  assertNetwork(r, "CJ Affiliate");
  assertPublisher(r, "11111111");
  console.log("✅ CJ (dpbolvw) / Publisher extraction");
})();

(function testShareASale() {
  const r = analyzeLink("https://www.shareasale.com/r.cfm?b=12345&u=67890&m=54321");
  assertNetwork(r, "ShareASale");
  assertPublisher(r, "67890");
  console.log("✅ ShareASale / NOT misidentified as Sovrn");
})();

(function testPartnerBoost() {
  const r = analyzeLink("https://example.com/?utm_source=partnerboost&pb=PB12345");
  assertNetwork(r, "PartnerBoost");
  assertPublisher(r, "PB12345");
  console.log("✅ PartnerBoost / NOT misidentified as Amazon Attribution");
})();

(function testLevanta() {
  const r = analyzeLink("https://example.com/?levanta=LVT999&utm_source=levanta");
  assertNetwork(r, "Levanta");
  assertPublisher(r, "LVT999");
  console.log("✅ Levanta / NOT misidentified as Refersion");
})();

(function testImpact() {
  const r = analyzeLink("https://www.walmart.com/ip/11966170?irgwc=1&sourceid=imp_test123");
  assertNetwork(r, "Impact");
  assertPublisher(r, "test123");
  console.log("✅ Impact (Walmart) / Publisher extraction");
})();

(function testRefersion() {
  const r = analyzeLink("https://example.com/?rfsn=RF12345");
  assertNetwork(r, "Refersion");
  assertPublisher(r, "RF12345");
  console.log("✅ Refersion / Publisher extraction");
})();

// ===== Publisher Database Tests =====
console.log("\n=== Publisher Database ===");

(function testPublisherDB_domain() {
  const r = analyzeLink("https://www.nerdwallet.com/credit-cards");
  assertNotUnknown(r, "publisher");
  assert(r.network !== "Unknown", "Network should not be Unknown for known publisher");
  console.log("✅ Domain match → " + r.publisher + " (" + r.network + ")");
})();

(function testPublisherDB_international_UK() {
  const r = analyzeLink("https://www.hotukdeals.com/deals/test");
  assertNotUnknown(r, "publisher");
  assert(r.network !== "Unknown", "Network should not be Unknown");
  console.log("✅ UK publisher → " + r.publisher + " (" + r.network + ")");
})();

(function testPublisherDB_international_DE() {
  const r = analyzeLink("https://www.mydealz.de/test");
  assertNotUnknown(r, "publisher");
  assert(r.network !== "Unknown", "Network should not be Unknown");
  console.log("✅ DE publisher → " + r.publisher + " (" + r.network + ")");
})();

(function testPublisherDB_international_JP() {
  const r = analyzeLink("https://www.smzdm.com/test");
  assertNotUnknown(r, "publisher");
  assert(r.network !== "Unknown", "Network should not be Unknown");
  console.log("✅ CN publisher → " + r.publisher + " (" + r.network + ")");
})();

(function testPublisherDB_camelcamelcamel() {
  const r = analyzeLink("https://www.camelcamelcamel.com/product/test");
  assertNotUnknown(r, "publisher");
  assert(r.network !== "Unknown", "Network should not be Unknown");
  console.log("✅ Price tracker → " + r.publisher + " (" + r.network + ")");
})();

// ===== Edge Cases =====
console.log("\n=== Edge Cases ===");

(function testEmptyParams() {
  const r = analyzeLink("https://example.com/some-page");
  assert(r.ok !== false, "Should return result, not error");
  console.log("✅ Bare URL handled gracefully");
})();

(function testInvalidInput() {
  const r = analyzeLink("not-a-url");
  // analyzeLink tries to fix invalid URLs by prepending https://
  // so "not-a-url" becomes "https://not-a-url" which is valid
  assert(r.ok !== false, "Should handle malformed input gracefully");
  console.log("✅ Invalid input handled gracefully → " + (r.hostname || r.publisher || "ok"));
})();

(function testEmptyInput() {
  const r = analyzeLink("");
  assert(r.ok === false || r.error === true, "Should return error for empty input");
  console.log("✅ Empty input returns error");
})();

// ===== Publisher URL =====
console.log("\n=== Publisher URLs ===");

(function testPublisherUrl() {
  const r = analyzeLink("https://www.nerdwallet.com/credit-cards");
  assert(r.publisher_id === "nerdwallet", `publisher_id should be nerdwallet, got ${r.publisher_id}`);
  assert(r.publisher_url?.includes("/publisher/nerdwallet/"), "publisher_url should contain /publisher/nerdwallet/");
  console.log("✅ publisher_id + publisher_url present");
})();

(function testPublisherUrl_unknown() {
  const r = analyzeLink("https://random-unknown-site-12345.com/");
  assert(r.publisher_id === null || r.publisher_url === null, "Unknown publisher should have null id/url");
  console.log("✅ Unknown publisher → null id/url");
})();

// ===== Summary =====
console.log("\n========================================");
console.log("ALL TESTS PASSED ✅");
console.log("========================================\n");
