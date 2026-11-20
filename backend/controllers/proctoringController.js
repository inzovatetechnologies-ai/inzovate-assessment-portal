const { getCollection } = require('../config/db');

async function getLiveProctoringSessions(req, res) {
  try {
    const sessionsCol = getCollection('assessment_sessions');
    const activeSessions = await sessionsCol.find({
      status: { $in: ['In Progress', 'Ready', 'Under Review'] }
    });

    const formatted = activeSessions.map(s => {
      const answers = s.savedAnswers || {};
      const answeredCount = Object.keys(answers).length;
      const totalQuestions = s.questionIds ? s.questionIds.length : 45;
      const remainingQuestions = Math.max(0, totalQuestions - answeredCount);
      const remainingSeconds = s.expiresAt
        ? Math.max(0, Math.floor((new Date(s.expiresAt).getTime() - Date.now()) / 1000))
        : 0;

      return {
        sessionId: s._id,
        candidateId: s.candidateId,
        candidateName: s.candidateName,
        collegeName: s.collegeName,
        jobRoleTitle: s.jobRoleTitle,
        domainName: s.domainName,
        status: s.status,
        currentSection: s.currentSection || 'section-1',
        answeredCount,
        remainingQuestions,
        totalQuestions,
        timeRemainingSeconds: remainingSeconds,
        cameraStatus: s.cameraStatus || 'Active',
        networkStatus: s.networkStatus || 'Online',
        violationsCount: s.violationsCount || 0,
        lastHeartbeatAt: s.lastHeartbeatAt || s.startedAt,
        startedAt: s.startedAt
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      sessions: formatted
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function resolveViolationIncident(req, res) {
  try {
    const { sessionId, resolution, notes } = req.body; // resolution: 'cleared' | 'confirmed'
    const sessionsCol = getCollection('assessment_sessions');
    const session = await sessionsCol.findById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const newStatus = resolution === 'cleared' ? 'In Progress' : 'Suspended';
    await sessionsCol.updateOne(
      { _id: sessionId },
      {
        status: newStatus,
        proctorNotes: notes || '',
        violationsResolvedAt: new Date().toISOString()
      }
    );

    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: req.user ? req.user.email : 'hr@inzovate.com',
      actorRole: req.user ? req.user.role : 'HR Manager',
      action: 'PROCTORING_INCIDENT_RESOLVED',
      target: sessionId,
      details: `Proctor resolution: ${resolution}. Status updated to ${newStatus}. Notes: ${notes || 'None'}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Proctoring flag resolved as '${resolution}'.`,
      newStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function uploadProctorSnapshot(req, res) {
  try {
    const { sessionId, snapshotBase64, eventType } = req.body;
    // In production with S3, this stores to private S3 bucket and records signed URL
    const proctorCol = getCollection('proctoring_events');
    const event = await proctorCol.create({
      sessionId,
      eventType: eventType || 'snapshot_check',
      snapshotUrl: snapshotBase64 ? 'data:image/jpeg;base64,...' : '',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Proctor snapshot logged.', eventId: event._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getLiveProctoringSessions,
  resolveViolationIncident,
  uploadProctorSnapshot
};
