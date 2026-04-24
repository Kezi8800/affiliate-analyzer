function detectRetailMapping(urlObj) {
  const host = (urlObj.hostname || "").toLowerCase();
  const path = (urlObj.pathname || "").toLowerCase();
  const search = (urlObj.search || "").toLowerCase();

  let merchant = "Unknown";
  let merchant_type = "Unknown";
  let retail_mapping = "Unknown";
  let retail_path_type = "Unknown";

  // AMAZON
  if (host.includes("amazon.")) {
    merchant = "Amazon";
    merchant_type = "Marketplace";

    if (path.includes("/dp/") || path.includes("/gp/product/")) {
      retail_mapping = "Amazon PDP";
      retail_path_type = "Product Detail Page";
    } else if (path === "/s" || search.includes("k=")) {
      retail_mapping = "Amazon Search";
      retail_path_type = "Search Page";
    } else if (search.includes("node=")) {
      retail_mapping = "Amazon Category";
      retail_path_type = "Category Page";
    }
  }

  // WALMART
  else if (host.includes("walmart.")) {
    merchant = "Walmart";
    merchant_type = "Retailer";

    if (path.includes("/ip/")) {
      retail_mapping = "Walmart PDP";
      retail_path_type = "Product Detail Page";
    } else if (path.includes("/search")) {
      retail_mapping = "Walmart Search";
      retail_path_type = "Search Page";
    }
  }

  // TARGET
  else if (host.includes("target.")) {
    merchant = "Target";
    merchant_type = "Retailer";

    if (path.includes("/p/")) {
      retail_mapping = "Target PDP";
      retail_path_type = "Product Page";
    }
  }

  // BESTBUY
  else if (host.includes("bestbuy.")) {
    merchant = "BestBuy";
    merchant_type = "Retailer";

    if (path.includes("/site/")) {
      retail_mapping = "BestBuy PDP";
      retail_path_type = "Product Page";
    }
  }

  // SHOPIFY / BRAND SITE
  else {
    merchant = host.replace("www.", "");
    merchant_type = "Brand / DTC";

    if (path.includes("/products/")) {
      retail_mapping = "Shopify PDP";
      retail_path_type = "Product Page";
    } else if (path.includes("/collections/")) {
      retail_mapping = "Collection Page";
      retail_path_type = "Category Page";
    } else if (path.includes("/cart")) {
      retail_mapping = "Cart Page";
      retail_path_type = "Checkout Stage";
    }
  }

  return {
    merchant,
    merchant_type,
    retail_mapping,
    retail_path_type
  };
}

module.exports = {
  detectRetailMapping
};
