// /lib/url-utils.js

function safeDecode(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getHostname(input = "") {
  try {
    return new URL(input).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function normalizeHostname(host = "") {
  return String(host).replace(/^www\./, "").toLowerCase();
}

function getQueryParams(input = "") {
  try {
    const u = new URL(input);
    const params = {};
    for (const [k, v] of u.searchParams.entries()) {
      params[k] = v;
    }
    return params;
  } catch {
    return {};
  }
}

function extractNumericId(value = "") {
  const m = String(value).match(/(\d{2,})/);
  return m ? m[1] : null;
}

function pushEvidence(arr, label, value) {
  if (value !== undefined && value !== null && value !== "") {
    arr.push({ label, value });
  }
}

module.exports = {
  safeDecode,
  getHostname,
  normalizeHostname,
  getQueryParams,
  extractNumericId,
  pushEvidence
};
