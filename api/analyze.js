const { analyzeLink } = require("../lib/analyze");

module.exports = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "analyze loaded",
    type: typeof analyzeLink
  });
};
