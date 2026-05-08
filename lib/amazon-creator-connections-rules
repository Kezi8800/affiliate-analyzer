"use strict";

/**
 * Amazon Creator Connections signal resolver
 * Purpose:
 * - Detect likely Amazon Creator Connections links
 * - Avoid misclassifying ACC links as normal Amazon Associates
 */

function safeString(value) {
  return String(value || "").trim();
}

function lower(value) {
  return safeString(value).toLowerCase();
}

function getParam(params, key) {
  if (!params || !key) return "";

  if (typeof params.get === "function") {
    return params.get(key) || params.get(key.toLowerCase()) || params.get(key.toUpperCase()) || "";
  }

  return params[key] || params[key.toLowerCase()] || params[key.toUpperCase()] || "";
}

function hasParam(params, key) {
  return !!getParam(params, key);
}

function resolveAmazonCreatorConnections(params = {}, urlObj = null) {
  const host = lower(urlObj?.hostname);
  const path = lower(urlObj?.pathname);
  const search = lower(urlObj?.search);

  const linkCode = lower(getParam(params, "linkCode"));
  const campaignId = getParam(params, "campaignId");
  const linkId = getParam(params, "linkId");
  const creative = getParam(params, "creative");
  const camp = getParam(params, "camp");
  const ascsubtag = lower(getParam(params, "ascsubtag"));
  const btnRef = lower(getParam(params, "btn_ref"));
  const ref = lower(getParam(params, "ref"));
  const refUnderscore = lower(getParam(params, "ref_"));

  let score = 0;
  const signals = [];

  if (campaignId) {
    score += 45;
    signals.push("campaignId");
  }

  if (linkId) {
    score += 35;
    signals.push("linkId");
  }

  if (linkCode === "tr1") {
    score += 35;
    signals.push("linkCode=tr1");
  }

  if (btnRef) {
    score += 12;
    signals.push("btn_ref");
  }

  if (ascsubtag.includes("creator") || ascsubtag.includes("influencer")) {
    score += 20;
    signals.push("ascsubtag_creator_signal");
  }

  if (
    path.includes("shop") ||
    path.includes("storefront") ||
    path.includes("creator") ||
    path.includes("influencer")
  ) {
    score += 16;
    signals.push("creator_path_signal");
  }

  if (
    search.includes("creator") ||
    search.includes("influencer") ||
    search.includes("campaignid") ||
    search.includes("linkid")
  ) {
    score += 16;
    signals.push("creator_query_signal");
  }

  if (ref.includes("creator") || refUnderscore.includes("creator")) {
    score += 12;
    signals.push("creator_ref_signal");
  }

  /**
   * ACC often still carries classic Associates-looking params:
   * creative=9325 & camp=1789 & linkCode=ur2
   * So those should not force Associates if ACC signals are present.
   */
  const hasAssociatesStyleParams = !!(creative || camp || linkCode === "ur2" || linkCode === "ll2" || linkCode === "ll1");

  const isCreatorConnections =
    score >= 45 ||
    (!!campaignId && !!linkId) ||
    (!!campaignId && hasAssociatesStyleParams) ||
    (!!linkId && linkCode === "tr1");

  return {
    is_creator_connections: isCreatorConnections,
    attribution_system: isCreatorConnections ? "Amazon Creator Connections" : null,
    network: isCreatorConnections ? "Amazon Creator Connections" : null,
    score,
    confidence: score >= 75 ? "High" : score >= 45 ? "Medium" : "Low",
    signals,
    evidence: {
      host: host || null,
      path: path || null,
      campaignId: campaignId || null,
      linkId: linkId || null,
      linkCode: linkCode || null,
      creative: creative || null,
      camp: camp || null,
      ascsubtag: ascsubtag || null,
      btn_ref: btnRef || null
    }
  };
}

module.exports = {
  resolveAmazonCreatorConnections
};
