/**
 * lib/detect-publisher.js
 * Generic publisher detection engine
 * v1.0
 */

const { GENERIC_PUBLISHER_RULES } = require("./publisher-rules");

function safeDecode(value = "") {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

function toLower(value = "") {
  return String(value || "").toLowerCase();
}

function normalizeText(value = "") {
  return toLower(safeDecode(value))
    .replace(/\+/g, " ")
    .replace(/%20/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectPublisherCandidates(params = {}, hostname = "") {
  const candidates = [
    params.utm_source,
    params.utm_medium,
    params.utm_campaign,
    params.utm_content,
    params.utm_term,
    params.utm_sharedid,
    params.sharedid,
    params.subid,
    params.subId,
    params.subId1,
    params.subId2,
    params.subId3,
    params.subId4,
    params.clickref,
    params.sourceid,
    params.source,
    params.publisher,
    params.partner,
    params.ref,
    params.referrer,
    params.ascsubtag,
    params.aff_sub,
    params.aff_sub2,
    params.aff_sub3,
    params.afftrack,
    params.sid,
    params.euid,
    hostname
  ]
    .map(normalizeText)
    .filter(Boolean);

  return [...new Set(candidates)];
}

function inferConfidence(matchedField = "") {
  const strongFields = [
    "utm_sharedid",
    "sharedid",
    "publisher",
    "sourceid",
    "clickref",
    "subid",
    "subId1",
    "hostname"
  ];

  if (strongFields.includes(matchedField)) return "High";
  return "Medium";
}

function getCandidateMap(params = {}, hostname = "") {
  return [
    { field: "utm_source", value: normalizeText(params.utm_source) },
    { field: "utm_medium", value: normalizeText(params.utm_medium) },
    { field: "utm_campaign", value: normalizeText(params.utm_campaign) },
    { field: "utm_content", value: normalizeText(params.utm_content) },
    { field: "utm_term", value: normalizeText(params.utm_term) },
    { field: "utm_sharedid", value: normalizeText(params.utm_sharedid) },
    { field: "sharedid", value: normalizeText(params.sharedid) },
    { field: "subid", value: normalizeText(params.subid) },
    { field: "subId", value: normalizeText(params.subId) },
    { field: "subId1", value: normalizeText(params.subId1) },
    { field: "subId2", value: normalizeText(params.subId2) },
    { field: "subId3", value: normalizeText(params.subId3) },
    { field: "subId4", value: normalizeText(params.subId4) },
    { field: "clickref", value: normalizeText(params.clickref) },
    { field: "sourceid", value: normalizeText(params.sourceid) },
    { field: "source", value: normalizeText(params.source) },
    { field: "publisher", value: normalizeText(params.publisher) },
    { field: "partner", value: normalizeText(params.partner) },
    { field: "ref", value: normalizeText(params.ref) },
    { field: "referrer", value: normalizeText(params.referrer) },
    { field: "ascsubtag", value: normalizeText(params.ascsubtag) },
    { field: "aff_sub", value: normalizeText(params.aff_sub) },
    { field: "aff_sub2", value: normalizeText(params.aff_sub2) },
    { field: "aff_sub3", value: normalizeText(params.aff_sub3) },
    { field: "afftrack", value: normalizeText(params.afftrack) },
    { field: "sid", value: normalizeText(params.sid) },
    { field: "euid", value: normalizeText(params.euid) },
    { field: "hostname", value: normalizeText(hostname) }
  ].filter((item) => item.value);
}

function detectPublisherFromGenericSignals(params = {}, hostname = "") {
  const candidates = getCandidateMap(params, hostname);

  for (const rule of GENERIC_PUBLISHER_RULES) {
    for (const candidate of candidates) {
      for (const matcher of rule.matchers) {
        if (matcher.test(candidate.value)) {
          return {
            publisher: rule.publisher,
            publisher_group: rule.publisher_group,
            type: rule.type,
            media_group: rule.media_group,
            subtype: rule.subtype,
            traffic_type: rule.traffic_type,
            channel_role: rule.channel_role,
            incrementality_risk: rule.incrementality_risk,
            confidence: inferConfidence(candidate.field),
            matched_by: "generic_publisher_rule",
            evidence: {
              field: candidate.field,
              value: candidate.value,
              matcher: matcher.toString()
            }
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

module.exports = {
  collectPublisherCandidates,
  detectPublisherFromGenericSignals
};
