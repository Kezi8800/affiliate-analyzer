function tryDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractNestedUrl(rawUrl) {
  let current = rawUrl;
  let depth = 0;

  while (depth < 3) {
    try {
      const urlObj = new URL(current);
      const params = urlObj.searchParams;

      const keys = [
        "url",
        "u",
        "target",
        "redirect",
        "redirect_url",
        "destination",
        "dest",
        "r"
      ];

      let found = null;

      for (const key of keys) {
        const val = params.get(key);
        if (val && val.startsWith("http")) {
          found = tryDecode(val);
          break;
        }
      }

      if (!found) break;

      current = found;
      depth++;
    } catch {
      break;
    }
  }

  return current;
}

module.exports = {
  extractNestedUrl
};
