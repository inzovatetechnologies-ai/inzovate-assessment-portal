const { getCollection } = require('../config/db');

async function listAuditLogs(req, res) {
  try {
    const col = getCollection('audit_logs');
    const logs = await col.find({});
    // Newest first
    logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listAuditLogs
};
