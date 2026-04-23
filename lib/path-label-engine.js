function buildPathLabel({
  network,
  attribution_system,
  likely_type,
  merchant,
  publisher_type
}) {
  const net = String(network || "").trim();
  const attr = String(attribution_system || "").trim();
  const type = String(likely_type || "").trim();
  const m = String(merchant || "").trim();

  // Amazon 系
  if (attr === "Amazon Creator Connections") {
    return {
      path_label: "Amazon Creator Connections - Orders",
      path_group: "Amazon Order Path"
    };
  }

  if (attr === "Amazon Associates") {
    return {
      path_label: "Amazon Associates - Orders",
      path_group: "Amazon Order Path"
    };
  }

  if (attr === "Amazon Attribution") {
    return {
      path_label: "Amazon Attribution - Orders",
      path_group: "Amazon Order Path"
    };
  }

  if (m === "Amazon" && net === "Amazon") {
    return {
      path_label: "Amazon - Orders",
      path_group: "Amazon Order Path"
    };
  }

  // Affiliate 网络
  if (net === "Impact") {
    return {
      path_label: "Impact Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  if (net === "CJ Affiliate") {
    return {
      path_label: "CJ Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  if (net === "Awin") {
    return {
      path_label: "Awin Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  if (net === "Rakuten") {
    return {
      path_label: "Rakuten Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  if (net === "Partnerize") {
    return {
      path_label: "Partnerize Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  if (net === "ShareASale") {
    return {
      path_label: "ShareASale Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  if (net === "FlexOffers") {
    return {
      path_label: "FlexOffers Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  if (net === "Webgains") {
    return {
      path_label: "Webgains Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  if (net === "TradeDoubler") {
    return {
      path_label: "TradeDoubler Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  // Paid Media
  if (net === "Google Ads") {
    return {
      path_label: "Google Ads - Orders",
      path_group: "Paid Media Order Path"
    };
  }

  if (net === "Meta Ads") {
    return {
      path_label: "Meta Ads - Orders",
      path_group: "Paid Media Order Path"
    };
  }

  if (net === "TikTok Ads") {
    return {
      path_label: "TikTok Ads - Orders",
      path_group: "Paid Media Order Path"
    };
  }

  if (net === "Microsoft Ads") {
    return {
      path_label: "Microsoft Ads - Orders",
      path_group: "Paid Media Order Path"
    };
  }

  if (type === "Affiliate") {
    return {
      path_label: "Affiliate - Orders",
      path_group: "Affiliate Order Path"
    };
  }

  if (type === "Paid Media") {
    return {
      path_label: "Paid Media - Orders",
      path_group: "Paid Media Order Path"
    };
  }

  return {
    path_label: "Unknown Path - Orders",
    path_group: "Unknown Order Path"
  };
}

module.exports = {
  buildPathLabel
};
