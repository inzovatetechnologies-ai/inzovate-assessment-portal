const { getCollection } = require('../config/db');

async function listColleges(req, res) {
  try {
    const col = getCollection('colleges');
    const colleges = await col.find({});
    res.json({ success: true, colleges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createCollege(req, res) {
  try {
    const col = getCollection('colleges');
    const newCollege = await col.create(req.body);
    res.status(201).json({ success: true, college: newCollege });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listDrives(req, res) {
  try {
    const col = getCollection('recruitment_drives');
    const drives = await col.find({});
    res.json({ success: true, drives });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getDriveById(req, res) {
  try {
    const { id } = req.params;
    const col = getCollection('recruitment_drives');
    let drive = await col.findById(id);
    if (!drive) {
      drive = await col.findOne({ driveId: id });
    }
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Recruitment drive not found.' });
    }
    res.json({ success: true, drive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createDrive(req, res) {
  try {
    const col = getCollection('recruitment_drives');
    const newDrive = await col.create(req.body);
    res.status(201).json({ success: true, drive: newDrive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listColleges,
  createCollege,
  listDrives,
  getDriveById,
  createDrive
};
