const { createApp } = require('../dist/lambda');

let handler;

module.exports = async (req, res) => {
  if (!handler) {
    handler = await createApp();
  }
  handler(req, res);
};
