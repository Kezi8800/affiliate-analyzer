// widget/i18n.js — BrandShuo i18n
// Language: zh-CN (中文简体), en (English)
// Usage: I18N[key] or I18N.translate(key, lang)

const I18N = {
  en: {
    title: "BrandShuo Attribution Checker",
    subtitle: "Decode affiliate, Amazon, ad, and publisher URLs. Single or batch mode.",
    singleMode: "Single URL",
    batchMode: "Batch (up to 50)",
    placeholder: "Paste an affiliate, Amazon, ad, or publisher URL...",
    batchPlaceholder: "Paste multiple URLs, one per line...",
    analyze: "Analyze",
    analyzeAll: "Analyze All",
    analyzing: "Analyzing...",
    clear: "Clear",
    urls: "URLs",
    currentPage: "🔗 Analyze Current Page",
    detectionResult: "Detection Result",
    platform: "Platform",
    network: "Network",
    publisher: "Publisher",
    category: "Category",
    risk: "Risk",
    confidence: "Confidence",
    qualityScore: "Quality Score",
    channelRole: "Channel Role",
    trafficType: "Traffic Type",
    publisherDetails: "Publisher Details",
    trackingLayer: "Tracking Layer",
    signalFlags: "Signal Flags",
    knowPublisher: "Know this publisher?",
    knowPublisherDesc: "Help grow the database — submit the correct publisher info.",
    publisherName: "Publisher name (e.g. NerdWallet)",
    mediaGroup: "Media group (e.g. Red Ventures)",
    affiliateNetwork: "Affiliate network (e.g. Impact)",
    submit: "Submit Publisher Info",
    thanks: "Thanks! Your submission helps everyone.",
    exportCSV: "Export CSV",
    batchResults: "Batch Results",
    detected: "detected",
    ms: "ms",
    errorAnalysis: "Analysis failed",
    errorNetwork: "Network error — please try again",
    emptyTitle: "Paste a link to reveal the attribution path",
    emptyDesc: "Supports Amazon, Walmart, eBay, Impact, CJ, Awin, Rakuten, PartnerBoost, Levanta, Partnerize, ShareASale, and 25+ more networks.",
    recent: "Recent",
    openFullReport: "Open Full Report on BrandShuo →",
    examples: "Examples",
    unknownLink: "Unknown Link Path",
    riskUnknown: "Unknown",
    strong: "Strong",
    good: "Good",
    moderate: "Moderate",
    weak: "Weak",
  },

  "zh-CN": {
    title: "BrandShuo 归因检测器",
    subtitle: "解码联盟链接、亚马逊链接、广告链接和媒体链接。支持单条和批量模式。",
    singleMode: "单链接",
    batchMode: "批量（最多50条）",
    placeholder: "粘贴联盟、亚马逊、广告或媒体链接...",
    batchPlaceholder: "粘贴多个链接，每行一个...",
    analyze: "检测",
    analyzeAll: "批量检测",
    analyzing: "检测中...",
    clear: "清除",
    urls: "条链接",
    currentPage: "🔗 检测当前页面",
    detectionResult: "检测结果",
    platform: "平台",
    network: "联盟网络",
    publisher: "发布商",
    category: "类别",
    risk: "风险",
    confidence: "置信度",
    qualityScore: "质量分",
    channelRole: "渠道角色",
    trafficType: "流量类型",
    publisherDetails: "发布商详情",
    trackingLayer: "追踪层级",
    signalFlags: "信号标记",
    knowPublisher: "你认识这个发布商吗？",
    knowPublisherDesc: "帮助我们完善数据库 — 提交正确的发布商信息。",
    publisherName: "发布商名称（如 NerdWallet）",
    mediaGroup: "媒体集团（如 Red Ventures）",
    affiliateNetwork: "联盟网络（如 Impact）",
    submit: "提交发布商信息",
    thanks: "✅ 感谢！你的提交将帮助所有人。",
    exportCSV: "导出 CSV",
    batchResults: "批量检测结果",
    detected: "已识别",
    ms: "毫秒",
    errorAnalysis: "检测失败",
    errorNetwork: "网络错误 — 请重试",
    emptyTitle: "粘贴链接即可查看完整归因路径",
    emptyDesc: "支持 Amazon、Walmart、eBay、Impact、CJ、Awin、Rakuten、PartnerBoost、Levanta、Partnerize、ShareASale 等 25+ 网络。",
    recent: "最近",
    openFullReport: "在 BrandShuo 查看完整报告 →",
    examples: "示例",
    unknownLink: "未知链接路径",
    riskUnknown: "未知",
    strong: "优质",
    good: "良好",
    moderate: "一般",
    weak: "较差",
  }
};

function translate(key, lang = "en") {
  const strings = I18N[lang] || I18N.en;
  return strings[key] || I18N.en[key] || key;
}

// Detect browser language
function detectLang() {
  try {
    const lang = (navigator.language || "en").toLowerCase();
    if (lang.startsWith("zh")) return "zh-CN";
    return "en";
  } catch { return "en"; }
}

if (typeof module !== "undefined") {
  module.exports = { I18N, translate, detectLang };
}
