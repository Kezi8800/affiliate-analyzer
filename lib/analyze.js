const { resolveAmazonAssociateTag } = require("./amazon-publisher-rules");

function detectAmazonPublisher(params = {}) {
  const rawTag = safeDecode(params.tag || "");
  const rawAscSubtag = safeDecode(params.ascsubtag || "");
  const rawRef = safeDecode(params.ref || params.ref_ || "");
  const rawSource = safeDecode(params.source || params.sourceid || "");
  const rawCamp = safeDecode(params.camp || "");
  const rawCreative = safeDecode(params.creative || "");

  const normalizedTag = normalizeAmazonTag(rawTag);
  const strippedTag = stripAmazonLocaleSuffix(normalizedTag);

  // =========================
  // ⭐ 1. 优先用规则库（核心升级）
  // =========================
  if (rawTag) {
    const resolved = resolveAmazonAssociateTag(rawTag);

    if (resolved) {
      return {
        publisher: resolved.publisherName,
        normalized_tag: rawTag,
        canonical_tag: strippedTag || null,
        type: resolved.publisherType || "Unknown",
        media_group: resolved.publisherType || "Unknown",
        subtype: "Amazon Associate Publisher",
        source_ownership: "Publisher-owned tag",
        confidence: "Very High",
        matched_by: "amazon_tag_map"
      };
    }
  }

  // =========================
  // 2. fallback → 原有 pattern 规则
  // =========================
  const candidates = [
    normalizedTag,
    strippedTag,
    toLower(rawAscSubtag),
    toLower(rawRef),
    toLower(rawSource),
    toLower(rawCamp),
    toLower(rawCreative)
  ].filter(Boolean);

  for (const rule of AMAZON_PUBLISHER_RULES) {
    for (const candidate of candidates) {
      if (rule.pattern.test(candidate)) {
        return {
          publisher: rule.publisher,
          normalized_tag: rawTag || null,
          canonical_tag: strippedTag || null,
          type: rule.type,
          media_group: rule.media_group,
          subtype: rule.subtype,
          source_ownership: rawTag ? "Publisher-owned tag" : "Indirect match",
          confidence: rawTag ? "High" : "Medium",
          matched_by: rawTag ? "amazon_tag_rule" : "amazon_aux_rule"
        };
      }
    }
  }

  // =========================
  // 3. fallback → 猜 tag
  // =========================
  if (rawTag) {
    return {
      publisher: inferPublisherNameFromAmazonTag(rawTag),
      normalized_tag: rawTag,
      canonical_tag: strippedTag || null,
      type: "Unknown",
      media_group: "Unknown",
      subtype: "Unknown",
      source_ownership: "Publisher-owned tag",
      confidence: "Low",
      matched_by: "tag_guess_fallback"
    };
  }

  return {
    publisher: "Unknown",
    normalized_tag: null,
    canonical_tag: null,
    type: "Unknown",
    media_group: "Unknown",
    subtype: "Unknown",
    source_ownership: "Unknown",
    confidence: "Low",
    matched_by: "none"
  };
}
