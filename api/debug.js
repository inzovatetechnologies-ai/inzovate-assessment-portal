module.exports = (req, res) => {
  let indexRequireError = null;
  let appType = null;
  let appDefaultType = null;

  try {
    const app = require('./index.js');
    appType = typeof app;
    appDefaultType = typeof (app && app.default);
  } catch (err) {
    indexRequireError = {
      message: err.message,
      stack: err.stack,
      code: err.code
    };
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'DEBUG_OK',
    nodeVersion: process.version,
    platform: process.platform,
    appType,
    appDefaultType,
    indexRequireError
  }, null, 2));
};
