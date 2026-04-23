function analyzeLink(url) {
  if (!url || typeof url !== "string") {
    return {
      version: "v3-step1",
      error: true,
      message: "Invalid URL"
    };
  }

  return {
    version: "v3-step1",
    analyzed_url: url,
    network: "Unknown"
  };
}

module.exports = { analyzeLink };
