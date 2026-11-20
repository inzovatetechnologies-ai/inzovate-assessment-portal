const { getCollection } = require('../config/db');

async function listDomains(req, res) {
  try {
    const col = getCollection('domains');
    const domains = await col.find({});
    res.json({ success: true, domains });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listJobRoles(req, res) {
  try {
    const { domainId } = req.query;
    const col = getCollection('job_roles');
    let roles = await col.find({});
    if (domainId) {
      roles = roles.filter(r => r.domainId === domainId);
    }
    res.json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createJobRole(req, res) {
  try {
    const col = getCollection('job_roles');
    const newRole = await col.create(req.body);
    res.status(201).json({ success: true, role: newRole });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateJobRole(req, res) {
  try {
    const { id } = req.params;
    const col = getCollection('job_roles');
    const updated = await col.findByIdAndUpdate(id, req.body);
    res.json({ success: true, role: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listDomains,
  listJobRoles,
  createJobRole,
  updateJobRole
};
