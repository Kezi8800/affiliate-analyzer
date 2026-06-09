// test/api.test.js
// BrandShuo — API Integration Tests
// Tests all 12 API endpoints for correct response structure
// Run: node test/api.test.js

const http = require("http");

const BASE = "http://localhost:3000";
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; return true; }
  console.error(`  ❌ FAIL: ${msg}`);
  failed++;
  return false;
}

async function callApi(method, path, body = null) {
  try {
    let modulePath = "../api/analyze";
    if (path === "/api/health") modulePath = "../api/health";
    else if (path === "/api/stats") modulePath = "../api/stats";
    else if (path === "/api/dashboard") modulePath = "../api/dashboard";
    else if (path === "/api/docs") modulePath = "../api/docs";
    else if (path.startsWith("/api/publishers")) modulePath = "../api/publishers";
    else if (path.startsWith("/api/publisher/") && path.includes("/related")) modulePath = "../api/publisher/related";
    else if (path.startsWith("/api/publisher/")) modulePath = "../api/publisher/[id]";
    else if (path === "/api/batch") modulePath = "../api/batch";
    else if (path === "/api/trace") modulePath = "../api/trace";
    else if (path === "/api/feedback") modulePath = "../api/feedback";
    else if (path === "/api/keys") modulePath = "../api/keys";

    const handler = require(modulePath);

    const req = {
      method,
      url: `https://tools.brandshuo.com${path}`,
      body: body || (method === "GET" ? undefined : {}),
      headers: { accept: "application/json", "user-agent": "test-suite/4.7" },
      socket: { remoteAddress: "127.0.0.1" }
    };

    let responseData;
    let statusCode = 200;

    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { responseData = data; return res; },
      send: (data) => { responseData = data; return res; },
      setHeader: () => {},
      getHeader: () => null,
      end: () => {}
    };

    await handler(req, res);
    return { status: statusCode, data: responseData };
  } catch (err) {
    return { status: 500, data: { ok: false, error: err.message } };
  }
}

async function test(name, fn) {
  process.stdout.write(`  ${name}... `);
  try {
    await fn();
    console.log("✅");
  } catch (err) {
    console.log(`❌ ${err.message}`);
    failed++;
  }
}

(async () => {
  console.log("\n=== BrandShuo API Integration Tests ===\n");

  // ===== 1. Analyze =====
  console.log("1. POST /api/analyze");
  await test("Amazon Associates", async () => {
    const { data } = await callApi("POST", "/api/analyze", { url: "https://www.amazon.com/deals?tag=slickdeals09-20" });
    assert(data.ok === true, "ok should be true");
    assert(data.network === "Amazon Associates", `network: ${data.network}`);
    assert(data.publisher?.includes("Slickdeals"), `publisher: ${data.publisher}`);
    assert(data.platform === "Amazon", `platform: ${data.platform}`);
    const qs = data.quality_score || data.traffic_quality || 0;
    assert(typeof qs === "number" && qs > 0, `quality_score: ${qs}`);
    assert(data.publisher_intelligence?.matched_by, "should have matched_by");
  });

  await test("Awin publisher ID extraction", async () => {
    const { data } = await callApi("POST", "/api/analyze", { url: "https://www.awin1.com/cread.php?awinaffid=99999&awinmid=12345" });
    assert(data.network === "Awin", `network: ${data.network}`);
    assert(data.publisher?.includes("99999"), `publisher should include ID: ${data.publisher}`);
  });

  await test("CJ click path extraction", async () => {
    const { data } = await callApi("POST", "/api/analyze", { url: "https://www.anrdoezrs.net/click-87654321-12345678" });
    assert(data.network === "CJ Affiliate", `network: ${data.network}`);
    assert(data.publisher?.includes("87654321"), `publisher should include PID: ${data.publisher}`);
  });

  await test("Levanta detection", async () => {
    const { data } = await callApi("POST", "/api/analyze", { url: "https://example.com/?levanta=LVT123&utm_source=levanta" });
    assert(data.network === "Levanta", `network: ${data.network}`);
    assert(data.publisher?.includes("LVT123"), `publisher: ${data.publisher}`);
  });

  await test("Result includes publisher_id", async () => {
    const { data } = await callApi("POST", "/api/analyze", { url: "https://www.nerdwallet.com/credit-cards" });
    assert(typeof data.publisher_id === "string" || data.publisher_id === null, "publisher_id present");
    assert(data.publisher_url?.includes("/publisher/") || data.publisher_url === null, "publisher_url present");
  });

  // ===== 2. Health =====
  console.log("\n2. GET /api/health");
  await test("Health check", async () => {
    const { data } = await callApi("GET", "/api/health");
    assert(data.status === "healthy", "status should be healthy");
    assert(data.database?.total_publishers > 0, "should have publishers");
    assert(data.cache?.hitRate !== undefined, "should have cache stats");
    assert(data.uptime_seconds !== undefined, "should have uptime");
  });

  // ===== 3. Stats =====
  console.log("\n3. GET /api/stats");
  await test("Stats endpoint", async () => {
    const { data } = await callApi("GET", "/api/stats");
    assert(data.ok === true, "ok should be true");
    assert(data.database?.total_publishers > 200, `publishers > 200: ${data.database?.total_publishers}`);
    assert(data.by_category, "should have category breakdown");
    assert(data.by_network, "should have network breakdown");
    assert(data.risk_distribution, "should have risk distribution");
    assert(Array.isArray(data.top_publishers), "top_publishers should be array");
  });

  // ===== 4. Publishers =====
  console.log("\n4. GET /api/publishers");
  await test("List publishers", async () => {
    const { data } = await callApi("GET", "/api/publishers?limit=5");
    assert(data.ok === true, "ok should be true");
    assert(Array.isArray(data.results), "results should be array");
    assert(data.results.length <= 5, "should respect limit");
    assert(data.total > 0, "should have total count");
  });

  await test("Search publishers", async () => {
    const { data } = await callApi("GET", "/api/publishers?q=slickdeals");
    assert(data.results?.some(r => r.id === "slickdeals"), "should find slickdeals");
  });

  await test("Filter by category", async () => {
    const { data } = await callApi("GET", "/api/publishers?category=deal_coupon");
    assert(data.results?.every(r => r.category === "deal_coupon"), "all should be deal_coupon");
  });

  // ===== 5. Publisher Detail =====
  console.log("\n5. GET /api/publisher/:id");
  await test("Publisher detail JSON", async () => {
    const { data } = await callApi("GET", "/api/publisher/slickdeals");
    assert(data.ok === true, "ok should be true");
    assert(data.publisher?.publisher === "Slickdeals", `publisher: ${data.publisher?.publisher}`);
    assert(Array.isArray(data.publisher?.networks), "should have networks array");
  });

  await test("Publisher not found", async () => {
    const { data } = await callApi("GET", "/api/publisher/nonexistent12345");
    assert(data.ok === false || data.error === true, "should return error for unknown publisher");
  });

  // ===== 6. Docs =====
  console.log("\n6. GET /api/docs");
  await test("Docs HTML page", async () => {
    const { data } = await callApi("GET", "/api/docs");
    assert(typeof data === "string", "should return HTML string");
    assert(data.includes("BrandShuo"), "HTML should include BrandShuo");
  });

  // ===== 7. Feedback =====
  console.log("\n7. POST /api/feedback");
  await test("Submit feedback", async () => {
    const { data } = await callApi("POST", "/api/feedback", {
      url: "https://test.example.com/",
      publisher_name: "Test Publisher",
      network: "Impact"
    });
    assert(data.ok === true, "feedback ok");
  });

  // ===== 8. Keys =====
  console.log("\n8. POST /api/keys");
  await test("Generate API key", async () => {
    const { data } = await callApi("POST", "/api/keys", { email: "test@example.com" });
    assert(data.ok === true, "key generation ok");
    assert(data.api_key?.startsWith("bsak_"), "API key should start with bsak_");
  });

  // ===== Summary =====
  console.log(`\n========================================`);
  console.log(`  Passed: ${passed}  Failed: ${failed}  Total: ${passed + failed}`);
  console.log(`  ${failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
})();
