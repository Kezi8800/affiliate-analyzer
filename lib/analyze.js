function analyzeLink(url) {
  return {
    version: "safe-minimal-lib",
    analyzed_url: url,
    network: "Unknown"
  };
}

module.exports = { analyzeLink };
