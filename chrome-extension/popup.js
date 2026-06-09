// popup.js — BrandShuo Attribution Checker Chrome Extension

const API_URL = "https://tools.brandshuo.com/api/analyze";
const WEB_APP_URL = "https://brandshuo.com/attribution-checker/";
const MAX_HISTORY = 20;

// Elements
const input = document.getElementById("url-input");
const analyzeBtn = document.getElementById("analyze-btn");
const clearBtn = document.getElementById("clear-btn");
const currentPageBtn = document.getElementById("current-page-btn");
const loading = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");
const emptyEl = document.getElementById("empty");
const historyEl = document.getElementById("history");
const historyList = document.getElementById("history-list");

// State
let history = [];

function init() {
  loadHistory();
  renderHistory();

  analyzeBtn.addEventListener("click", () => analyze(input.value.trim()));
  clearBtn.addEventListener("click", clearAll);
  currentPageBtn.addEventListener("click", analyzeCurrentPage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") analyze(input.value.trim());
  });

  // Restore last input
  chrome.storage?.local?.get(["lastInput"], (data) => {
    if (data?.lastInput) input.value = data.lastInput;
  });
}

async function analyze(url) {
  if (!url) {
    input.focus();
    return;
  }

  showLoading();
  chrome.storage?.local?.set({ lastInput: url });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.message || "Analysis failed");
    }

    renderResult(data);
    addToHistory(url, data);
    renderHistory();
    hideLoading();
  } catch (err) {
    showError(err.message || "Network error — please try again");
  }
}

function showLoading() {
  loading.classList.remove("hidden");
  resultEl.classList.add("hidden");
  emptyEl.classList.add("hidden");
  errorEl.classList.add("hidden");
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
}

function hideLoading() {
  loading.classList.add("hidden");
  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze";
}

function showError(message) {
  hideLoading();
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  resultEl.classList.add("hidden");
  emptyEl.classList.add("hidden");
}

function clearAll() {
  input.value = "";
  resultEl.classList.add("hidden");
  errorEl.classList.add("hidden");
  emptyEl.classList.remove("hidden");
  input.focus();
}

function renderResult(data) {
  resultEl.classList.remove("hidden");
  emptyEl.classList.add("hidden");

  // Path label
  const pathLabel = data.path_classification?.path_label || `${data.publisher} → ${data.network} → ${data.merchant || data.hostname}`;
  document.getElementById("path-label").textContent = pathLabel;

  // Meta
  document.getElementById("meta-platform").textContent = `Platform: ${data.platform || "--"}`;
  document.getElementById("meta-network").textContent = `Network: ${data.network || "--"}`;
  document.getElementById("meta-publisher").textContent = `Publisher: ${data.publisher_label || data.publisher || "--"}`;

  // Risk
  const risk = data.incrementality_risk || data.risk || "--";
  const riskEl = document.getElementById("risk-value");
  riskEl.textContent = risk;
  riskEl.className = "score-value " + riskClass(risk);

  // Quality
  const quality = data.quality_score || data.traffic_quality || 0;
  const qualityEl = document.getElementById("quality-value");
  qualityEl.textContent = quality ? `${quality}/100` : "--";
  qualityEl.className = "score-value " + qualityClass(quality);

  // Confidence
  document.getElementById("confidence-value").textContent = data.confidence || "--";

  // Details
  document.getElementById("detail-publisher").textContent = data.publisher_label || data.publisher || "--";
  document.getElementById("detail-group").textContent = data.publisher_group || data.media_group || "--";
  document.getElementById("detail-category").textContent = data.publisher_type || data.publisher_category || "--";
  document.getElementById("detail-traffic").textContent = data.traffic_type || "--";
  document.getElementById("detail-role").textContent = data.channel_role || "--";
  document.getElementById("detail-domain").textContent = data.hostname || "--";

  // Full report link
  const encodedUrl = encodeURIComponent(data.analyzed_url || data.input || "");
  document.getElementById("full-report-link").href = `${WEB_APP_URL}?url=${encodedUrl}`;
}

function riskClass(risk) {
  const r = String(risk || "").toLowerCase();
  if (r.includes("low")) return "risk-low";
  if (r.includes("medium")) return "risk-medium";
  if (r.includes("high") || r.includes("very")) return "risk-high";
  return "";
}

function qualityClass(score) {
  if (score >= 80) return "quality-strong";
  if (score >= 65) return "quality-good";
  if (score >= 50) return "quality-moderate";
  if (score > 0) return "quality-weak";
  return "";
}

function addToHistory(url, data) {
  // Remove duplicate
  history = history.filter((h) => h.url !== url);

  history.unshift({
    url,
    publisher: data.publisher_label || data.publisher || "--",
    network: data.network || "--",
    risk: data.incrementality_risk || data.risk || "Medium",
    timestamp: Date.now()
  });

  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }

  saveHistory();
}

function saveHistory() {
  chrome.storage?.local?.set({ history });
}

function loadHistory() {
  chrome.storage?.local?.get(["history"], (data) => {
    if (data?.history) {
      history = data.history;
      renderHistory();
    }
  });
}

function renderHistory() {
  if (history.length === 0) {
    historyEl.classList.add("hidden");
    return;
  }

  historyEl.classList.remove("hidden");
  historyList.innerHTML = history
    .map(
      (h) => `
    <div class="history-item" data-url="${escapeHtml(h.url)}">
      <span class="url-text">${truncateUrl(h.url, 40)}</span>
      <span class="badge-sm ${riskBadgeClass(h.risk)}">${h.network}</span>
    </div>
  `
    )
    .join("");

  // Click handler
  historyList.querySelectorAll(".history-item").forEach((el) => {
    el.addEventListener("click", () => {
      const url = el.getAttribute("data-url");
      input.value = url;
      analyze(url);
    });
  });
}

function truncateUrl(url, max) {
  const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (clean.length <= max) return clean;
  return clean.slice(0, max) + "...";
}

function riskBadgeClass(risk) {
  const r = String(risk || "").toLowerCase();
  if (r.includes("low")) return "badge-green";
  if (r.includes("medium")) return "badge-amber";
  if (r.includes("high") || r.includes("very")) return "badge-red";
  return "badge-gray";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function analyzeCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    input.value = tab.url;
    analyze(tab.url);
  }
}

init();
