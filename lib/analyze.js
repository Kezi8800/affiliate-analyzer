function analyzeLink(url) {
  try {
    if (!url || typeof url !== "string") {
      return {
        version: "v3-step2",
        error: true,
        message: "Invalid URL"
      };
    }

    const urlObj = new URL(url);

    return {
      version: "v3-step2",
      analyzed_url: urlObj.toString(),
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      network: "Unknown"
    };

  } catch (err) {
    return {
      version: "v3-step2",
      error: true,
      message: err.message
    };
  }
}

module.exports = { analyzeLink };
