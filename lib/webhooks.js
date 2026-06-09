// lib/webhooks.js
// BrandShuo — Webhook Notifications
// Send alerts to Slack, Discord, or custom webhooks on key events
// Configure: WEBHOOK_URL env var (Slack/Discord compatible)

const https = require("https");
const http = require("http");
const { URL } = require("url");

const WEBHOOK_URL = process.env.WEBHOOK_URL || "";

function isSlack(webhookUrl) {
  return webhookUrl.includes("hooks.slack.com");
}

function isDiscord(webhookUrl) {
  return webhookUrl.includes("discord.com/api/webhooks");
}

function buildPayload(event, data) {
  if (isSlack(WEBHOOK_URL)) {
    return buildSlackPayload(event, data);
  }
  if (isDiscord(WEBHOOK_URL)) {
    return buildDiscordPayload(event, data);
  }
  // Generic JSON webhook
  return JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    source: "BrandShuo Attribution Intelligence v4.7",
    data
  });
}

function buildSlackPayload(event, data) {
  const colorMap = {
    "feedback.new": "#36a64f",
    "error": "#dc2626",
    "health.warning": "#d97706",
    "usage.milestone": "#2563eb"
  };

  const color = colorMap[event] || "#64748b";

  const textMap = {
    "feedback.new": `📝 New publisher feedback: *${data.publisher_name || "Unknown"}*`,
    "error": `❌ Error: ${data.message || "Unknown error"}`,
    "health.warning": `⚠️ Health warning: ${data.message || ""}`,
    "usage.milestone": `📊 Usage milestone: ${data.count} analyses served`
  };

  const text = textMap[event] || `Event: ${event}`;

  const fields = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null)
    .slice(0, 8)
    .map(([k, v]) => ({ title: k, value: String(v).slice(0, 200), short: true }));

  return JSON.stringify({
    attachments: [{
      color,
      fallback: text,
      title: text,
      fields,
      footer: "BrandShuo Attribution Intelligence",
      ts: Math.floor(Date.now() / 1000)
    }]
  });
}

function buildDiscordPayload(event, data) {
  const colorMap = {
    "feedback.new": 0x36a64f,
    "error": 0xdc2626,
    "health.warning": 0xd97706,
    "usage.milestone": 0x2563eb
  };

  return JSON.stringify({
    embeds: [{
      title: `🔄 ${event}`,
      color: colorMap[event] || 0x64748b,
      fields: Object.entries(data)
        .filter(([, v]) => v !== undefined && v !== null)
        .slice(0, 10)
        .map(([k, v]) => ({ name: k, value: String(v).slice(0, 200), inline: true })),
      timestamp: new Date().toISOString(),
      footer: { text: "BrandShuo Attribution Intelligence v4.7" }
    }]
  });
}

async function sendWebhook(event, data) {
  if (!WEBHOOK_URL) return false;

  try {
    const payload = buildPayload(event, data);
    const parsed = new URL(WEBHOOK_URL);

    const options = {
      method: "POST",
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      },
      timeout: 5000
    };

    return new Promise((resolve) => {
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.request(options, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });
      req.on("error", () => resolve(false));
      req.on("timeout", () => { req.destroy(); resolve(false); });
      req.write(payload);
      req.end();
    });
  } catch {
    return false;
  }
}

// Convenience methods
function onFeedback(data) {
  return sendWebhook("feedback.new", data);
}

function onError(data) {
  return sendWebhook("error", data);
}

function onMilestone(count) {
  return sendWebhook("usage.milestone", { count });
}

module.exports = { sendWebhook, onFeedback, onError, onMilestone };
