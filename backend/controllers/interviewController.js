const { getCollection } = require('../config/db');

async function listInterviews(req, res) {
  try {
    const col = getCollection('interview_schedules');
    const { candidateId, status } = req.query;
    let interviews = await col.find({});

    if (candidateId) interviews = interviews.filter(i => i.candidateId === candidateId);
    if (status) interviews = interviews.filter(i => i.status === status);

    res.json({ success: true, count: interviews.length, interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function scheduleInterview(req, res) {
  try {
    const payload = req.body;
    const col = getCollection('interview_schedules');

    const newInterview = await col.create({
      candidateId: payload.candidateId,
      candidateName: payload.candidateName,
      candidateEmail: payload.candidateEmail,
      jobRoleTitle: payload.jobRoleTitle,
      roundName: payload.roundName || 'Technical Round 1',
      interviewerName: payload.interviewerName || 'Senior Technical Architect',
      interviewerEmail: payload.interviewerEmail || 'architect@inzovate.com',
      scheduledDate: payload.scheduledDate,
      scheduledTime: payload.scheduledTime,
      meetingLink: payload.meetingLink || 'https://meet.inzovate-technologies.com/interview-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Scheduled',
      feedback: '',
      rating: null,
      scheduledBy: req.user ? req.user.email : 'hr@inzovate.com'
    });

    // Update candidate status to Interview Scheduled
    const candidatesCol = getCollection('candidates');
    await candidatesCol.updateOne(
      { $or: [{ candidateId: payload.candidateId }, { _id: payload.candidateId }] },
      { recruitmentStage: 'Interview Scheduled' }
    );

    // Audit log
    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: req.user ? req.user.email : 'hr@inzovate.com',
      actorRole: req.user ? req.user.role : 'HR Manager',
      action: 'INTERVIEW_SCHEDULED',
      target: payload.candidateId,
      details: `Scheduled ${payload.roundName} with ${payload.interviewerName} on ${payload.scheduledDate}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled and candidate notification queued.',
      interview: newInterview
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listInterviews,
  scheduleInterview
};
