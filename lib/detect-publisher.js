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
    { field: "subid1", value: normalizeText(params.subid1) },
    { field: "subid2", value: normalizeText(params.subid2) },
    { field: "subid3", value: normalizeText(params.subid3) },
    { field: "subid4", value: normalizeText(params.subid4) },

    { field: "clickref", value: normalizeText(params.clickref) },
    { field: "sourceid", value: normalizeText(params.sourceid) },
    { field: "source", value: normalizeText(params.source) },
    { field: "publisher", value: normalizeText(params.publisher) },
    { field: "partner", value: normalizeText(params.partner) },

    { field: "ref", value: normalizeText(params.ref) },
    { field: "referrer", value: normalizeText(params.referrer) },
    { field: "ascsubtag", value: normalizeText(params.ascsubtag) },

    { field: "tag", value: normalizeText(params.tag) },

    { field: "aff_sub", value: normalizeText(params.aff_sub) },
    { field: "aff_sub2", value: normalizeText(params.aff_sub2) },
    { field: "aff_sub3", value: normalizeText(params.aff_sub3) },
    { field: "afftrack", value: normalizeText(params.afftrack) },

    { field: "sid", value: normalizeText(params.sid) },
    { field: "euid", value: normalizeText(params.euid) },

    { field: "hostname", value: normalizeText(hostname) }
  ].filter(item => item.value);
}

function inferConfidence(field = "") {
  const highConfidenceFields = [
    "tag",
    "utm_sharedid",
    "sharedid",
    "publisher",
    "sourceid",
    "clickref",
    "subid",
    "subid1",
    "hostname"
  ];

  const mediumConfidenceFields = [
    "utm_source",
    "utm_campaign",
    "utm_content",
    "source",
    "ref",
    "referrer",
    "ascsubtag"
  ];

  if (highConfidenceFields.includes(field)) return "High";
  if (mediumConfidenceFields.includes(field)) return "Medium";
  return "Low";
}

function buildDefaultResult() {
  return {
    publisher: "Unknown",
    publisher_group: "",
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

function getDerivedCandidates(value = "") {
  const normalized = normalizeText(value);
  const derived = new Set();

  if (!normalized) return [];

  derived.add(normalized);

  const dashSplit = normalized.split("-")[0]?.trim();
  const underscoreSplit = normalized.split("_")[0]?.trim();
  const spaceSplit = normalized.split(" ")[0]?.trim();

  if (dashSplit) derived.add(dashSplit);
  if (underscoreSplit) derived.add(underscoreSplit);
  if (spaceSplit) derived.add(spaceSplit);

  return [...derived].filter(Boolean);
}

function detectPublisherFromGenericSignals(params = {}, hostname = "") {
  try {
    const candidates = getCandidateMap(params, hostname);

    for (const rule of GENERIC_PUBLISHER_RULES) {
      for (const candidate of candidates) {
        const candidateVariants = getDerivedCandidates(candidate.value);

        for (const matcher of rule.matchers || []) {
          for (const variant of candidateVariants) {
            if (matcher.test(variant)) {
              return {
                publisher: rule.publisher || "Unknown",
                publisher_group: rule.publisher_group || "",
                type: rule.type || "Unknown",
                media_group: rule.media_group || "Unknown",
                subtype: rule.subtype || "Unknown",
                traffic_type: rule.traffic_type || "Unknown",
                channel_role: rule.channel_role || "Unknown",
                incrementality_risk: rule.incrementality_risk || "Medium",
                confidence: inferConfidence(candidate.field),
                matched_by: "generic_publisher_rule",
                evidence: {
                  field: candidate.field,
                  raw_value: candidate.value,
                  matched_value: variant,
                  matcher: matcher.toString()
                }
              };
            }
          }
        }
      }
    }

    return buildDefaultResult();
  } catch (err) {
    return {
      ...buildDefaultResult(),
      matched_by: "detect_publisher_error",
      evidence: {
        error: err.message
      }
    };
  }
}

module.exports = {
  detectPublisherFromGenericSignals
};
