// background.js — BrandShuo Attribution Checker Service Worker

const API_URL = "https://tools.brandshuo.com/api/analyze";
const WEB_APP_URL = "https://brandshuo.com/attribution-checker/";

// Context menu: right-click a link → analyze it
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyze-link",
    title: "Analyze with BrandShuo Attribution Checker",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyze-link" && info.linkUrl) {
    analyzeAndNotify(info.linkUrl);
  }
});

async function analyzeAndNotify(url) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await res.json();

    if (data.ok) {
      const publisher = data.publisher_label || data.publisher || "Unknown";
      const network = data.network || "Unknown";
      const risk = data.incrementality_risk || data.risk || "Medium";

      // Open web app with result
      const encodedUrl = encodeURIComponent(data.analyzed_url || url);
      chrome.tabs.create({
        url: `${WEB_APP_URL}?url=${encodedUrl}`
      });
    } else {
      // Still open web app for manual analysis
      chrome.tabs.create({
        url: `${WEB_APP_URL}?url=${encodeURIComponent(url)}`
      });
    }
  } catch (err) {
    // Fallback: open web app
    chrome.tabs.create({
      url: `${WEB_APP_URL}?url=${encodeURIComponent(url)}`
    });
  }
}

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE_URL") {
    analyzeAndNotify(message.url);
    sendResponse({ ok: true });
  }
  return true;
});
