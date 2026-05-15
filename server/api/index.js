let handler;
let initError;

async function init() {
  try {
    const { createApp } = require('../dist/lambda');
    handler = await createApp();
  } catch (e) {
    initError = e;
    console.error('NestJS init failed:', e.message, e.stack);
  }
}

const initPromise = init();

module.exports = async (req, res) => {
  await initPromise;
  if (initError) {
    res.status(500).json({ error: initError.message, stack: initError.stack });
    return;
  }
  handler(req, res);
};
