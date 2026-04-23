const { analyzeLink } = require("../lib/analyze");

module.exports = async (req, res) => {
  try {
    const testUrl = "https://test.com";
    const result = analyzeLink(testUrl);

    return res.status(200).json({
      success: true,
      message: "execution ok",
      result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "execution crashed",
      error: err.message,
      stack: err.stack
    });
  }
};
