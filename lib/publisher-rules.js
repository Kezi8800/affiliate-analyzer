function detectPublisherFromUrl(url) {
  const hostname = getHostname(url);
  const params = getQueryParams(url);
  const merchant = detectMerchant(hostname, params);
  const channel = detectChannel(params);

  // 1) Amazon 优先
  const amazonResult = detectAmazonPublisherFromUrl(url);
  if (amazonResult) {
    return {
      merchant: amazonResult.merchant,
      network: amazonResult.network,
      channel: amazonResult.channel,
      program: amazonResult.program || null,

      publisherToken: amazonResult.publisherToken,
      publisherId: amazonResult.publisherId,
      publisherName: amazonResult.publisherName,
      publisherType: amazonResult.publisherType,
      publisherSlug: amazonResult.publisherSlug || null,

      clickId: null,
      sharedId: null,
      sourceId: null,
      campaignId: amazonResult.tracking?.camp || null,
      adId: amazonResult.tracking?.creative || null,

      subtag: amazonResult.tracking?.ascsubtag || null,
      linkCode: amazonResult.tracking?.linkCode || null,
      creative: amazonResult.tracking?.creative || null,
      creativeASIN: amazonResult.tracking?.creativeASIN || null,

      confidence: amazonResult.confidence,
      resolutionStatus: amazonResult.status || "unresolved",
      matchedRules: amazonResult.matchedRules || [],
      evidence: amazonResult.evidence || [],
      note: amazonResult.note || null,
      matchMethod: amazonResult.matchMethod || null,
      pageType: amazonResult.pageType || null
    };
  }

  // 2) 非 Amazon 走原有逻辑
  let result = {
    merchant,
    network: null,
    channel,
    publisherToken: null,
    publisherId: null,
    publisherName: null,
    publisherType: null,
    clickId: params.clickid || params.irclickid || null,
    sharedId: params.sharedid || null,
    sourceId: params.sourceid || null,
    campaignId: params.campaign_id || null,
    adId: params.affiliates_ad_id || null,
    confidence: 0,
    resolutionStatus: "unresolved",
    matchedRules: [],
    evidence: [],
    note: null
  };

  for (const rule of PUBLISHER_RULES) {
    if (rule.match({ url, hostname, params })) {
      const resolved = rule.resolve({ url, hostname, params }) || {};
      result = {
        ...result,
        ...resolved,
        matchedRules: [...result.matchedRules, rule.id]
      };
    }
  }

  // 3) Walmart + Impact 强化
  if (
    merchant === "Walmart" &&
    (
      /^imp_\d+$/i.test(params.wmlspartner || "") ||
      /^imp_/i.test(params.sourceid || "") ||
      params.irgwc === "1"
    )
  ) {
    result.network = result.network || "Impact";
    result.channel = result.channel || "Affiliate";
    result.publisherToken = result.publisherToken || params.wmlspartner || null;
    result.publisherId = result.publisherId || extractNumericId(params.wmlspartner || "");
    result.confidence = Math.max(result.confidence || 0, 0.96);

    if (result.publisherId) {
      result.resolutionStatus = "partial";
      result.note = result.note || "Walmart Impact partner ID detected, but exact publisher name requires mapping.";
    }
  }

  // 4) Impact token map resolve
  if (result.network === "Impact" && result.publisherId) {
    const mapped = resolveImpactPublisherByMap(result.publisherId);
    if (mapped) {
      result = { ...result, ...mapped };
    }
  }

  // 5) 自动补 resolutionStatus
  if (!result.resolutionStatus || result.resolutionStatus === "unresolved") {
    if (result.publisherName || result.publisherId || result.publisherToken) {
      result.resolutionStatus = result.publisherName ? "resolved" : "partial";
    }
  }

  // 6) evidence
  const evidence = [];
  pushEvidence(evidence, "hostname", hostname);
  pushEvidence(evidence, "merchant", result.merchant);
  pushEvidence(evidence, "network", result.network);
  pushEvidence(evidence, "channel", result.channel);
  pushEvidence(evidence, "publisherToken", result.publisherToken);
  pushEvidence(evidence, "publisherId", result.publisherId);
  pushEvidence(evidence, "clickid", params.clickid);
  pushEvidence(evidence, "irclickid", params.irclickid);
  pushEvidence(evidence, "sourceid", params.sourceid);
  pushEvidence(evidence, "sharedid", params.sharedid);
  pushEvidence(evidence, "campaign_id", params.campaign_id);
  pushEvidence(evidence, "affiliates_ad_id", params.affiliates_ad_id);
  pushEvidence(evidence, "wmlspartner", params.wmlspartner);
  pushEvidence(evidence, "awc", params.awc);
  pushEvidence(evidence, "cjevent", params.cjevent);
  pushEvidence(evidence, "clickref", params.clickref);
  pushEvidence(evidence, "ranMID", params.ranMID);
  pushEvidence(evidence, "ranEAID", params.ranEAID);
  pushEvidence(evidence, "ranSiteID", params.ranSiteID);
  pushEvidence(evidence, "afftrack", params.afftrack);
  pushEvidence(evidence, "sscid", params.sscid);

  result.evidence = evidence;

  return result;
}
