const { GENERIC_PUBLISHER_RULES } = require("./publisher-rules");

function safeDecode(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toLower(value = "") {
  return String(value || "").toLowerCase();
}

function collectPublisherCandidates(params = {}, hostname = "") {
  return [
    safeDecode(params.utm_source || ""),
    safeDecode(params.utm_medium || ""),
    safeDecode(params.utm_campaign || ""),
    safeDecode(params.utm_content || ""),
    safeDecode(params.utm_sharedid || ""),
    safeDecode(params.sharedid || ""),
    safeDecode(params.subid || ""),
    safeDecode(params.subId1 || ""),
    safeDecode(params.subId2 || ""),
    safeDecode(params.subId3 || ""),
    safeDecode(params.clickref || ""),
    safeDecode(params.sourceid || ""),
    safeDecode(params.partner || ""),
    safeDecode(params.publisher || ""),
    hostname || ""
  ]
    .map(toLower)
    .filter(Boolean);
}

function detectPublisherFromGenericSignals(params = {}, hostname = "") {
  const candidates = collectPublisherCandidates(params, hostname);

  for (const rule of GENERIC_PUBLISHER_RULES) {
    for (const candidate of candidates) {
      for (const matcher of rule.matchers) {
        if (matcher.test(candidate)) {
          return {
            publisher: rule.publisher,
            publisher_group: rule.publisher_group,
            type: rule.type,
            media_group: rule.media_group,
            subtype: rule.subtype,
            traffic_type: rule.traffic_type,
            channel_role: rule.channel_role,
            incrementality_risk: rule.incrementality_risk,
            confidence: "High",
            matched_by: "generic_publisher_rule",
            evidence: candidate
          };
        }
      }
    }
  }

  return {
    publisher: "Unknown",
    publisher_group: "Unknown",
    type: "Unknown",
    media_group: "Unknown",
    subtype: "Unknown",
    traffic_type: "Unknown",
    channel_role: "Unknown",
    incrementality_risk: "Medium",
    confidence: "Low",
    matched_by: "none",
    evidence: null
  };
}

module.exports = { detectPublisherFromGenericSignals };
