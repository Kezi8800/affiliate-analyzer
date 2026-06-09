// lib/storage.js
// BrandShuo — Storage Adapter
// Abstract storage layer: file-based now, ready for Vercel KV / Redis / DB migration
//
// Usage:
//   const storage = require("./storage");
//   await storage.appendFeedback({ url, publisher_name });
//   await storage.incrementCounter("analyze");
//   const stats = await storage.getCounters();

const fs = require("fs");
const path = require("path");

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.jsonl");
const COUNTERS_FILE = path.join(DATA_DIR, "counters.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ===== Feedback Storage =====
function appendFeedback(entry) {
  ensureDir();
  const line = JSON.stringify({ ...entry, stored_at: new Date().toISOString() }) + "\n";
  fs.appendFileSync(FEEDBACK_FILE, line);
}

function getFeedback(limit = 50) {
  ensureDir();
  if (!fs.existsSync(FEEDBACK_FILE)) return [];
  const content = fs.readFileSync(FEEDBACK_FILE, "utf8");
  return content.trim().split("\n").filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean).slice(-limit).reverse();
}

function getFeedbackCount() {
  ensureDir();
  if (!fs.existsSync(FEEDBACK_FILE)) return 0;
  return fs.readFileSync(FEEDBACK_FILE, "utf8").trim().split("\n").filter(Boolean).length;
}

// ===== Counters =====
function loadCounters() {
  ensureDir();
  if (!fs.existsSync(COUNTERS_FILE)) {
    return { analyzed: 0, batch_analyzed: 0, feedback_submitted: 0, publishers_detected: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(COUNTERS_FILE, "utf8"));
  } catch {
    return { analyzed: 0, batch_analyzed: 0, feedback_submitted: 0, publishers_detected: {} };
  }
}

function saveCounters(counters) {
  ensureDir();
  fs.writeFileSync(COUNTERS_FILE, JSON.stringify(counters, null, 2));
}

function incrementCounter(key, subKey) {
  const counters = loadCounters();
  if (subKey) {
    counters[key] = counters[key] || {};
    counters[key][subKey] = (counters[key][subKey] || 0) + 1;
  } else {
    counters[key] = (counters[key] || 0) + 1;
  }
  saveCounters(counters);
}

function trackDetection(network, publisher) {
  const counters = loadCounters();
  counters.analyzed = (counters.analyzed || 0) + 1;

  if (network && network !== "Unknown") {
    counters.networks_detected = counters.networks_detected || {};
    counters.networks_detected[network] = (counters.networks_detected[network] || 0) + 1;
  }

  if (publisher && publisher !== "Unknown Publisher") {
    counters.publishers_detected = counters.publishers_detected || {};
    counters.publishers_detected[publisher] = (counters.publishers_detected[publisher] || 0) + 1;
  }

  saveCounters(counters);
}

function getCounters() {
  return loadCounters();
}

// ===== Publisher DB persistence =====
// When migrating to DB, replace these with DB queries
function getPublisherDB() {
  return require("./publisher-database");
}

// ===== KV-ready interface =====
// Future: replace with Vercel KV
// const kv = require("@vercel/kv");
// Then swap implementations below

const storage = {
  // Feedback
  appendFeedback,
  getFeedback,
  getFeedbackCount,

  // Counters / Analytics
  incrementCounter,
  trackDetection,
  getCounters,

  // Publisher DB (ready for migration)
  getPublisherDB
};

module.exports = storage;
