const logger = require('../config/logger');

// Logs non-sensitive request info for debugging auth issues.
// Does NOT log full field values (avoids passwords/tokens), only keys and lengths.
function requestLogger(req, res, next) {
  try {
    const keys = Object.keys(req.body || {});
    const summary = keys.reduce((acc, k) => {
      const v = req.body[k];
      const len = v == null ? 0 : (typeof v === 'string' ? v.length : Array.isArray(v) ? v.length : (typeof v === 'object' ? JSON.stringify(Object.keys(v)).length : 1));
      acc.push(`${k}(${len})`);
      return acc;
    }, []);
    logger.info(`REQ ${req.method} ${req.originalUrl} bodyKeys: ${summary.join(', ')}`);
  } catch (e) {
    logger.error('RequestLogger failed to summarize body', { error: e.message });
  }
  next();
}

module.exports = requestLogger;
