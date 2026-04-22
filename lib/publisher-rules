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
    clickId: params.clickid || null,
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

  // Impact token map resolve
  if (result.network === "Impact" && result.publisherId) {
    const mapped = resolveImpactPublisherByMap(result.publisherId);
    if (mapped) {
      result = { ...result, ...mapped };
    }
  }

  const evidence = [];
  pushEvidence(evidence, "hostname", hostname);
  pushEvidence(evidence, "merchant", result.merchant);
  pushEvidence(evidence, "network", result.network);
  pushEvidence(evidence, "channel", result.channel);
  pushEvidence(evidence, "publisherToken", result.publisherToken);
  pushEvidence(evidence, "publisherId", result.publisherId);
  pushEvidence(evidence, "clickid", params.clickid);
  pushEvidence(evidence, "sourceid", params.sourceid);
  pushEvidence(evidence, "sharedid", params.sharedid);

  result.evidence = evidence;

  return result;
}
