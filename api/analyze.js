function buildConsumerReportsResult(inputUrl, urlObj, params) {
  const hostname = cleanHostname(urlObj.hostname || "");
  const merchant = detectMerchant(hostname);

  const publisher = "Consumer Reports";
  const network = "Partnerize";
  const platform = "Partnerize";

  const pathClassification = {
    path_label: `${publisher} → ${network} → ${merchant}`,
    path_nodes: [publisher, network, merchant],
    publisher_label: publisher,
    publisher,
    media_group: "Future",
    channel_role: "Editorial Commerce Publisher"
  };

  return {
    ok: true,
    error: false,
    version: "BrandShuo Analyze v4.5 Consumer Reports Future Group",
    engine: "BrandShuo Attribution Intelligence Engine",

    analyzed_url: inputUrl,
    input: inputUrl,
    normalizedUrl: urlObj.href,
    final_url: urlObj.href,
    domain: hostname,
    hostname,

    platform,
    merchant,
    merchant_type: "Retail / DTC",

    network,
    detection_result: network,
    attribution_system: network,
    attribution_layer: "Partnerize Affiliate Tracking",
    likely_type: "Editorial Affiliate",

    publisher,
    publisher_label: publisher,
    publisher_name: publisher,
    publisher_raw_name: publisher,

    publisher_group: "Future",
    media_group: "Future",

    publisher_type: "editorial_commerce",
    publisher_category: "commerce_media",

    primary_claimer: publisher,

    traffic_type: "Editorial Affiliate",
    commercial_intent: "Product Research Intent",
    channel_role: "Editorial Commerce Publisher",

    traffic_quality: 86,
    quality_score: 86,
    quality_label: "Strong",

    incrementality_risk: "Low-Medium",
    risk: "Low-Medium",
    conflict_risk: "Low-Medium",

    confidence: "high",

    publisher_intelligence: {
      publisher,
      publisher_label: publisher,

      type: "commerce_media",
      subtype: "Editorial Commerce",

      media_group: "Future",
      parent_media_group: "Future",

      confidence: "high",

      matched_by: "utm_campaign_consumerreports",

      matched_pattern:
        "utm_campaign=consumerreports",

      network,
      network_type: "Affiliate Network",
      network_confidence: "high"
    },

    intelligence: {
      pathLabel: pathClassification.path_label,

      trafficType: "Editorial Affiliate",

      commercialIntent: "Product Research Intent",

      channelRole: "Editorial Commerce Publisher",

      qualityScore: 86,
      qualityLabel: "Strong",

      incrementalityRisk: "Low-Medium",

      confidence: "high"
    },

    path_classification: pathClassification,

    path: pathClassification.path_nodes,

    tracking_layer: {
      platform,
      merchant,
      network,

      publisher,
      publisher_label: publisher,

      publisher_group: "Future",

      amazon_layer: "--",

      domain: hostname
    },

    attribution_layer_detail: {
      merchant,

      platform,

      network,

      attribution_system: network,

      attribution_layer:
        "Partnerize Affiliate Tracking",

      publisher,
      publisher_label: publisher,

      publisher_group: "Future",

      media_group: "Future",

      publisher_type: "editorial_commerce",

      traffic_type: "Editorial Affiliate",

      commercial_intent:
        "Product Research Intent",

      traffic_quality: 86,

      incrementality_risk: "Low-Medium",

      channel_role:
        "Editorial Commerce Publisher",

      confidence: "high",

      path_classification: pathClassification,

      publisher_intelligence: {
        publisher,
        publisher_label: publisher,

        type: "commerce_media",

        subtype: "Editorial Commerce",

        media_group: "Future",

        parent_media_group: "Future",

        confidence: "high",

        matched_by:
          "utm_campaign_consumerreports",

        network
      }
    },

    signals: {
      hasAffiliateTag: true,

      hasAmazonTag: false,

      hasPaidClickId: false,

      hasSubId: Boolean(
        getParam(params, "clickref") ||
        getParam(params, "click_ref")
      ),

      hasCouponOrDealPublisher: false,

      hasEditorialPublisher: true,

      hasPartnerizePublisherId: false
    },

    evidence: {
      params,

      clickref:
        getParam(params, "clickref") || null,

      click_ref:
        getParam(params, "click_ref") || null,

      utm_source:
        getParam(params, "utm_source") || null,

      utm_medium:
        getParam(params, "utm_medium") || null,

      utm_campaign:
        getParam(params, "utm_campaign") || null,

      utm_term:
        getParam(params, "utm_term") || null,

      utm_content:
        getParam(params, "utm_content") || null
    },

    params,

    raw: {
      forced_consumer_reports: true,

      publisher,

      network,

      merchant,

      media_group: "Future"
    }
  };
}
