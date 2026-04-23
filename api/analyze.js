const { analyzeLink } = require("../lib/analyze");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        message: "API alive"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed"
      });
    }

    const { url } = req.body || {};

    const result = analyzeLink(url);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
