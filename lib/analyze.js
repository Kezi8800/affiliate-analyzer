function inferPublisherFromAmazonTag(tag) {
  if (!tag) return null;

  const t = String(tag).toLowerCase();

  // Slickdeals
  if (
    t.includes("slickdeals") ||
    t.includes("slickdeals09") ||
    t.includes("slick") ||
    t.includes("sd-")
  ) {
    return {
      publisher: "Slickdeals",
      type: "Deal Community",
      subtype: "Deal / Coupon",
      media_group: "Slickdeals",
      matched_by: "amazon_tag_pattern",
      confidence: "High",
      evidence: tag
    };
  }

  // BuzzFeed
  if (
    t.includes("bf") ||
    t.includes("buzzfeed") ||
    t.includes("buzz") ||
    t.includes("buzz0f")
  ) {
    return {
      publisher: "BuzzFeed",
      type: "Editorial Commerce",
      subtype: "Content Commerce",
      media_group: "BuzzFeed",
      matched_by: "amazon_tag_pattern",
      confidence: "High",
      evidence: tag
    };
  }

  // CNET
  if (t.includes("cnet")) {
    return {
      publisher: "CNET",
      type: "Editorial Review",
      subtype: "Commerce Review",
      media_group: "Ziff Davis / Red Ventures",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  // Future plc
  if (
    t.includes("future") ||
    t.includes("tomsguide") ||
    t.includes("techradar") ||
    t.includes("toms") ||
    t.includes("tomshardware") ||
    t.includes("pcgamer")
  ) {
    return {
      publisher: "Future Publishing",
      type: "Editorial Review",
      subtype: "Commerce Content",
      media_group: "Future plc",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  // PCMag / Ziff Davis
  if (
    t.includes("pcmag") ||
    t.includes("p00935")
  ) {
    return {
      publisher: "PCMag",
      type: "Editorial Review",
      subtype: "Commerce Review",
      media_group: "Ziff Davis",
      matched_by: "amazon_tag_pattern",
      confidence: "High",
      evidence: tag
    };
  }

  // Wirecutter / NYT
  if (
    t.includes("wirecutter") ||
    t.includes("thewire") ||
    t.includes("nytimes")
  ) {
    return {
      publisher: "Wirecutter",
      type: "Editorial Review",
      subtype: "Product Review",
      media_group: "The New York Times",
      matched_by: "amazon_tag_pattern",
      confidence: "High",
      evidence: tag
    };
  }

  // Forbes
  if (
    t.includes("forbes") ||
    t.includes("forbesvetted")
  ) {
    return {
      publisher: "Forbes Vetted",
      type: "Editorial Commerce",
      subtype: "Commerce Review",
      media_group: "Forbes",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  // CNN Underscored
  if (
    t.includes("cnn") ||
    t.includes("underscor")
  ) {
    return {
      publisher: "CNN Underscored",
      type: "Editorial Commerce",
      subtype: "Commerce Content",
      media_group: "CNN",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  // Dotdash Meredith / Home
  if (
    t.includes("thespruce") ||
    t.includes("bhg") ||
    t.includes("peoplemag") ||
    t.includes("travelandleisure")
  ) {
    return {
      publisher: "Dotdash Meredith Publisher",
      type: "Editorial Commerce",
      subtype: "Lifestyle / Home Commerce",
      media_group: "Dotdash Meredith",
      matched_by: "amazon_tag_pattern",
      confidence: "Medium",
      evidence: tag
    };
  }

  // Generic editorial fallback
  if (
    t.includes("zdnet") ||
    t.includes("ign") ||
    t.includes("verge") ||
    t.includes("wired") ||
    t.includes("engadget")
  ) {
    return {
      publisher: "Editorial Publisher",
      type: "Editorial Commerce",
      subtype: "Commerce Content",
      media_group: "Unknown Media Group",
      matched_by: "amazon_tag_pattern",
      confidence: "Low",
      evidence: tag
    };
  }

  return null;
}
