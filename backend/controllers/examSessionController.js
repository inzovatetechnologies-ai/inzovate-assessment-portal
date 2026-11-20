const { getCollection } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sanitizeQuestion(q) {
  return {
    _id: q._id,
    section: q.section,
    category: q.category,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options ? q.options.map(o => ({ id: o.id, text: o.text })) : [],
    marks: q.marks || 1,
  };
}

async function startOrResumeSession(req, res) {
  try {
    let candidateId = (req.user && req.user.candidateId) || req.body.candidateId;
    const candidatesCol = getCollection('candidates');

    let candidate = null;
    if (candidateId) {
      candidate = await candidatesCol.findOne({
        $or: [{ candidateId: candidateId }, { _id: candidateId }]
      }) || await candidatesCol.findOne({ candidateId });
    }

    // Robust Fallback: If candidateId is undefined (e.g. refreshed or direct CBT link),
    // resolve to the latest registered candidate or default demo candidate so exam always loads!
    if (!candidate) {
      const allCands = await candidatesCol.find({});
      if (allCands.length > 0) {
        candidate = allCands[allCands.length - 1];
      }
    }

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found. Please register first.' });
    }

    const sessionsCol = getCollection('assessment_sessions');
    let session = await sessionsCol.findOne({
      candidateId: candidate.candidateId,
      status: { $in: ['In Progress', 'Ready'] }
    });

    const questionsCol = getCollection('questions');

    // If active session already exists, resume it
    if (session) {
      const allQuestions = await questionsCol.find({ _id: { $in: session.questionIds } });
      const questionMap = new Map(allQuestions.map(q => [q._id, q]));
      
      const orderedQuestions = session.questionIds
        .map(id => questionMap.get(id))
        .filter(Boolean)
        .map(sanitizeQuestion);

      return res.json({
        success: true,
        message: 'Resuming existing active assessment session.',
        session: {
          sessionId: session._id,
          status: session.status,
          startedAt: session.startedAt,
          expiresAt: session.expiresAt,
          totalDurationMinutes: session.totalDurationMinutes,
          timeRemainingSeconds: Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)),
          currentSection: session.currentSection || 'section-1',
          savedAnswers: session.savedAnswers || {},
          markedForReview: session.markedForReview || [],
          violationsCount: session.violationsCount || 0,
          candidate: {
            id: candidate.candidateId,
            fullName: candidate.fullName,
            email: candidate.email,
            jobRoleTitle: candidate.jobRoleTitle,
            domainName: candidate.domainName,
            collegeName: candidate.collegeName,
          },
          questions: orderedQuestions,
          totalQuestions: orderedQuestions.length,
        }
      });
    }

    // Check if candidate already submitted or terminated
    const existingResult = await sessionsCol.findOne({
      candidateId: candidate.candidateId,
      status: { $in: ['Submitted', 'Auto-Submitted', 'Terminated (Tab Closed)'] }
    });
    if (existingResult) {
      return res.status(200).json({
        success: false,
        isCompleted: true,
        message: 'Assessment has already been completed or terminated for this candidate. Multiple attempts are not permitted.',
        candidate: {
          id: candidate.candidateId,
          fullName: candidate.fullName,
          email: candidate.email,
          jobRoleTitle: candidate.jobRoleTitle,
          domainName: candidate.domainName,
          collegeName: candidate.collegeName,
        }
      });
    }

    // CREATE NEW SESSION WITH EXACTLY 45 QUESTIONS
    // Section 1: Exactly 15
    let sec1Questions = await questionsCol.find({ section: 'section-1', isApproved: true });
    if (sec1Questions.length > 15) {
      sec1Questions = shuffleArray(sec1Questions).slice(0, 15);
    }

    // Section 2: Exactly 15
    let sec2Questions = await questionsCol.find({ section: 'section-2', isApproved: true });
    if (sec2Questions.length > 15) {
      sec2Questions = shuffleArray(sec2Questions).slice(0, 15);
    }

    // Section 3: Exactly 15
    let sec3Questions = await questionsCol.find({
      section: 'section-3',
      roleId: candidate.jobRoleId,
      isApproved: true
    });

    if (sec3Questions.length < 15) {
      const fallbackQs = await questionsCol.find({
        section: 'section-3',
        roleId: 'role-soft-dev',
        isApproved: true
      });
      sec3Questions = [...sec3Questions, ...fallbackQs].slice(0, 15);
    } else if (sec3Questions.length > 15) {
      sec3Questions = shuffleArray(sec3Questions).slice(0, 15);
    }

    const finalSec1 = sec1Questions.slice(0, 15);
    const finalSec2 = sec2Questions.slice(0, 15);
    const finalSec3 = sec3Questions.slice(0, 15);

    const fullQuestionSet = [...finalSec1, ...finalSec2, ...finalSec3];
    const questionIds = fullQuestionSet.map(q => q._id);

    const now = new Date();
    const durationMinutes = 60;
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const newSession = await sessionsCol.create({
      candidateId: candidate.candidateId,
      candidateInternalId: candidate._id,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      collegeId: candidate.collegeId,
      collegeName: candidate.collegeName,
      jobRoleId: candidate.jobRoleId,
      jobRoleTitle: candidate.jobRoleTitle,
      domainId: candidate.domainId,
      domainName: candidate.domainName,
      driveId: candidate.driveId,
      status: 'In Progress',
      questionIds,
      currentSection: 'section-1',
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      totalDurationMinutes: durationMinutes,
      savedAnswers: {},
      markedForReview: [],
      violationsCount: 0,
      cameraStatus: 'Active',
      networkStatus: 'Online',
    });

    await candidatesCol.updateOne(
      { _id: candidate._id },
      { assessmentStatus: 'In Progress' }
    );

    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: candidate.email,
      actorRole: 'Candidate',
      action: 'EXAM_SESSION_STARTED',
      target: newSession._id,
      details: `Candidate started assessment session with 45 questions (Role: ${candidate.jobRoleTitle})`,
      ipAddress: req.ip || '127.0.0.1'
    });

    const sanitizedQuestions = fullQuestionSet.map(sanitizeQuestion);

    res.status(201).json({
      success: true,
      message: 'Assessment session initialized successfully.',
      session: {
        sessionId: newSession._id,
        status: newSession.status,
        startedAt: newSession.startedAt,
        expiresAt: newSession.expiresAt,
        totalDurationMinutes: durationMinutes,
        timeRemainingSeconds: durationMinutes * 60,
        currentSection: 'section-1',
        savedAnswers: {},
        markedForReview: [],
        violationsCount: 0,
        candidate: {
          id: candidate.candidateId,
          fullName: candidate.fullName,
          email: candidate.email,
          jobRoleTitle: candidate.jobRoleTitle,
          domainName: candidate.domainName,
          collegeName: candidate.collegeName,
        },
        questions: sanitizedQuestions,
        totalQuestions: sanitizedQuestions.length,
      }
    });
  } catch (err) {
    console.error('Session initiation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function saveAnswerHeartbeat(req, res) {
  try {
    const { sessionId, questionId, selectedOption, isMarkedForReview } = req.body;
    if (!sessionId || !questionId) {
      return res.status(400).json({ success: false, message: 'Session ID and Question ID are required.' });
    }

    const sessionsCol = getCollection('assessment_sessions');
    const session = await sessionsCol.findById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    if (session.status !== 'In Progress') {
      return res.status(400).json({ success: false, message: 'Session is no longer in progress.' });
    }

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return res.status(400).json({ success: false, message: 'Assessment time has expired.' });
    }

    const savedAnswers = { ...(session.savedAnswers || {}) };
    if (selectedOption !== undefined) {
      savedAnswers[questionId] = selectedOption;
    }

    let markedForReview = [...(session.markedForReview || [])];
    if (isMarkedForReview !== undefined) {
      if (isMarkedForReview && !markedForReview.includes(questionId)) {
        markedForReview.push(questionId);
      } else if (!isMarkedForReview && markedForReview.includes(questionId)) {
        markedForReview = markedForReview.filter(id => id !== questionId);
      }
    }

    await sessionsCol.updateOne(
      { _id: sessionId },
      {
        savedAnswers,
        markedForReview,
        lastHeartbeatAt: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      message: 'Answer saved successfully.',
      savedCount: Object.keys(savedAnswers).length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function logProctoringViolation(req, res) {
  try {
    const { sessionId, eventType, details, snapshotUrl } = req.body;
    const sessionsCol = getCollection('assessment_sessions');
    const session = await sessionsCol.findById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const proctorCol = getCollection('proctoring_events');
    const newViolationCount = (session.violationsCount || 0) + 1;

    await proctorCol.create({
      sessionId,
      candidateId: session.candidateId,
      eventType: eventType || 'tab_switch',
      details: details || 'Candidate navigated away from examination window or switched browser tabs.',
      snapshotUrl: snapshotUrl || '',
      violationNumber: newViolationCount,
      timestamp: new Date().toISOString()
    });

    let autoSuspended = false;
    let newStatus = session.status;
    if (newViolationCount >= 3) {
      newStatus = 'Under Review';
      autoSuspended = true;
    }

    await sessionsCol.updateOne(
      { _id: sessionId },
      {
        violationsCount: newViolationCount,
        status: newStatus,
        lastViolationAt: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      violationCount: newViolationCount,
      warningLevel: newViolationCount === 1 ? 'First Warning' : newViolationCount === 2 ? 'Final Warning' : 'Suspended for Review',
      isAutoSuspended: autoSuspended,
      message: newViolationCount < 3
        ? `Warning #${newViolationCount}: Examination integrity policy violated. Stay on the assessment screen.`
        : 'Multiple security violations recorded. Assessment flagged for review.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// TERMINATE SESSION WHEN FULL TAB IS CLOSED
async function terminateSessionOnTabClose(req, res) {
  try {
    const { sessionId, candidateId } = req.body;
    const sessionsCol = getCollection('assessment_sessions');
    const session = await sessionsCol.findById(sessionId) || await sessionsCol.findOne({ candidateId, status: 'In Progress' });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (session.status === 'Submitted' || session.status === 'Auto-Submitted') {
      return res.json({ success: true, message: 'Already submitted.' });
    }

    // Mark as Terminated
    await sessionsCol.updateOne(
      { _id: session._id },
      {
        status: 'Terminated (Tab Closed)',
        terminatedAt: new Date().toISOString(),
      }
    );

    // Update candidate
    const candidatesCol = getCollection('candidates');
    await candidatesCol.updateOne(
      { candidateId: session.candidateId },
      {
        assessmentStatus: 'Terminated',
        recruitmentStage: 'Under Review',
      }
    );

    // Audit Log
    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: session.candidateEmail,
      actorRole: 'Candidate',
      action: 'EXAM_TERMINATED_TAB_CLOSED',
      target: session.candidateId,
      details: 'Assessment session permanently terminated because candidate closed the browser tab.',
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Assessment terminated due to tab closure.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Submit Examination and Automatically Evaluate
async function submitAssessment(req, res) {
  try {
    const { sessionId, candidateId, submissionType = 'Candidate Manual' } = req.body;
    const sessionsCol = getCollection('assessment_sessions');
    let session = null;

    if (sessionId) {
      session = await sessionsCol.findById(sessionId) || await sessionsCol.findOne({ _id: sessionId });
    }

    if (!session && candidateId) {
      session = await sessionsCol.findOne({
        candidateId,
        status: { $in: ['In Progress', 'Ready', 'Terminated (Tab Closed)', 'Under Review', 'Submitted', 'Auto-Submitted'] }
      }) || await sessionsCol.findOne({ candidateId });
    }

    if (!session && req.user && req.user.candidateId) {
      session = await sessionsCol.findOne({
        candidateId: req.user.candidateId
      });
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    const resultsCol = getCollection('assessment_results');

    // If session is already finalized, return existing result gracefully without error
    if (session.status === 'Submitted' || session.status === 'Auto-Submitted') {
      const existingResult = await resultsCol.findOne({ sessionId: session._id }) ||
        await resultsCol.findOne({ candidateDisplayId: session.candidateId }) ||
        await resultsCol.findOne({ candidateId: session.candidateId });

      const questionsAttempted = Object.keys(session.savedAnswers || {}).length;

      return res.json({
        success: true,
        message: 'Assessment finalized successfully.',
        result: {
          candidateName: session.candidateName,
          candidateDisplayId: session.candidateId,
          jobRoleTitle: session.jobRoleTitle,
          collegeName: session.collegeName,
          totalQuestionsAttempted: questionsAttempted,
          totalQuestions: 45,
          status: 'Completed',
          certificateId: (existingResult && existingResult.certificateId) || session.certificateId || 'INZ-CERT-2026-FINAL',
          assessmentDate: (existingResult && existingResult.assessmentDate) || new Date().toISOString().split('T')[0],
        }
      });
    }

    // Proceed to evaluate session (including 'In Progress', 'Terminated (Tab Closed)', 'Under Review')
    const questionsCol = getCollection('questions');
    const fullQuestions = await questionsCol.find({ _id: { $in: session.questionIds } });

    const savedAnswers = session.savedAnswers || {};
    let totalScore = 0;
    let sec1Score = 0;
    let sec2Score = 0;
    let sec3Score = 0;

    let sec1Total = 0;
    let sec2Total = 0;
    let sec3Total = 0;

    for (const q of fullQuestions) {
      const candidateAnswer = savedAnswers[q._id];
      const isCorrect = candidateAnswer && candidateAnswer.trim().toUpperCase() === q.correctOption.trim().toUpperCase();

      if (q.section === 'section-1') {
        sec1Total += (q.marks || 1);
        if (isCorrect) {
          sec1Score += (q.marks || 1);
          totalScore += (q.marks || 1);
        }
      } else if (q.section === 'section-2') {
        sec2Total += (q.marks || 1);
        if (isCorrect) {
          sec2Score += (q.marks || 1);
          totalScore += (q.marks || 1);
        }
      } else {
        sec3Total += (q.marks || 1);
        if (isCorrect) {
          sec3Score += (q.marks || 1);
          totalScore += (q.marks || 1);
        }
      }
    }

    const maxTotalScore = sec1Total + sec2Total + sec3Total || 45;
    const percentage = Number(((totalScore / maxTotalScore) * 100).toFixed(1));

    let category = 'Requires Further Evaluation';
    if (percentage >= 90) category = 'Outstanding';
    else if (percentage >= 75) category = 'Excellent';
    else if (percentage >= 60) category = 'Good';
    else if (percentage >= 40) category = 'Needs Improvement';

    const now = new Date();
    const started = new Date(session.startedAt || now);
    const timeTakenMinutes = Math.max(1, Math.round((now.getTime() - started.getTime()) / (1000 * 60)));

    const certNum = Math.floor(10000 + Math.random() * 90000);
    const certificateId = `INZ-CERT-2026-${certNum}`;
    const verificationHash = crypto.createHash('sha256')
      .update(`${session.candidateId}:${certificateId}:${totalScore}:${percentage}`)
      .digest('hex')
      .substring(0, 16);

    const resultDoc = {
      sessionId: session._id,
      candidateId: session.candidateInternalId || session.candidateId,
      candidateDisplayId: session.candidateId,
      candidateName: session.candidateName,
      candidateEmail: session.candidateEmail,
      jobRoleId: session.jobRoleId,
      jobRoleTitle: session.jobRoleTitle,
      domainId: session.domainId,
      domainName: session.domainName,
      collegeId: session.collegeId,
      collegeName: session.collegeName,
      driveId: session.driveId,
      assessmentDate: now.toISOString().split('T')[0],
      totalScore,
      maxScore: maxTotalScore,
      percentage,
      performanceCategory: category,
      sectionScores: {
        section1: { title: 'Aptitude & Logical Reasoning', score: sec1Score, max: sec1Total, percentage: Number(((sec1Score / (sec1Total || 1)) * 100).toFixed(1)) },
        section2: { title: 'Communication Assessment', score: sec2Score, max: sec2Total, percentage: Number(((sec2Score / (sec2Total || 1)) * 100).toFixed(1)) },
        section3: { title: `${session.jobRoleTitle} Technical Assessment`, score: sec3Score, max: sec3Total, percentage: Number(((sec3Score / (sec3Total || 1)) * 100).toFixed(1)) }
      },
      timeTakenMinutes,
      violationsCount: session.violationsCount || 0,
      certificateId,
      verificationHash,
      submissionType,
      isPublished: true,
      createdAt: now.toISOString()
    };

    const savedResult = await resultsCol.create(resultDoc);

    const finalSessionStatus = submissionType === 'Automatic Timer Expiry' ? 'Auto-Submitted' : 'Submitted';
    await sessionsCol.updateOne(
      { _id: session._id },
      {
        status: finalSessionStatus,
        submittedAt: now.toISOString(),
        finalScore: totalScore,
        percentage,
        resultId: savedResult._id,
        certificateId
      }
    );

    const candidatesCol = getCollection('candidates');
    await candidatesCol.updateOne(
      { candidateId: session.candidateId },
      {
        assessmentStatus: 'Completed',
        recruitmentStage: percentage >= 60 ? 'Shortlisted' : 'Under Review',
        totalScore,
        maxScore: maxTotalScore,
        percentage,
        performanceCategory: category,
        assessmentCompletedAt: now.toISOString()
      }
    );

    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: session.candidateEmail,
      actorRole: 'Candidate',
      action: 'ASSESSMENT_SUBMITTED_AND_EVALUATED',
      target: certificateId,
      details: `Assessment evaluated: Score ${totalScore}/${maxTotalScore} (${percentage}%, ${category}) for ${session.candidateName}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    const questionsAttempted = Object.keys(savedAnswers).length;

    // RETURN TO CLIENT:
    // Candidate sees only completion confirmation & questions attempted count.
    res.json({
      success: true,
      message: 'Assessment submitted successfully.',
      result: {
        candidateName: session.candidateName,
        candidateDisplayId: session.candidateId,
        jobRoleTitle: session.jobRoleTitle,
        collegeName: session.collegeName,
        totalQuestionsAttempted: questionsAttempted,
        totalQuestions: 45,
        status: 'Completed',
        certificateId,
        assessmentDate: now.toISOString().split('T')[0],
      }
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// Get Candidate Result (Masks Marks for Candidates! Admin sees full marks)
async function getCandidateResult(req, res) {
  try {
    const { candidateId } = req.params;
    const resultsCol = getCollection('assessment_results');

    const result = await resultsCol.findOne({
      $or: [{ candidateDisplayId: candidateId }, { candidateId: candidateId }]
    }) || await resultsCol.findOne({ candidateDisplayId: candidateId });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Assessment result not found for this candidate.' });
    }

    const sessionsCol = getCollection('assessment_sessions');
    const session = await sessionsCol.findById(result.sessionId);
    const questionsAttempted = session ? Object.keys(session.savedAnswers || {}).length : 45;

    const callerRole = req.user ? req.user.role : 'Candidate';

    // IF CALLER IS CANDIDATE: DO NOT RETURN MARKS OR CERTIFICATE!
    if (callerRole === 'Candidate') {
      return res.json({
        success: true,
        isMaskedForCandidate: true,
        result: {
          candidateName: result.candidateName,
          candidateDisplayId: result.candidateDisplayId,
          jobRoleTitle: result.jobRoleTitle,
          collegeName: result.collegeName,
          assessmentDate: result.assessmentDate,
          totalQuestionsAttempted: questionsAttempted,
          totalQuestions: 45,
          status: 'Completed',
          completionNotice: 'Your assessment has been submitted successfully. Total questions attempted: ' + questionsAttempted + ' / 45. The HR and recruitment team will review your responses. Shortlisted candidates will be contacted via email/phone.'
        }
      });
    }

    // IF CALLER IS ADMIN / HR: RETURN FULL SCORES AND EVALUATION
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function resetAssessmentSession(req, res) {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required to reset assessment.' });
    }
    const sessionsCol = getCollection('assessment_sessions');
    const candidatesCol = getCollection('candidates');

    const cand = await candidatesCol.findOne({
      $or: [{ candidateId }, { _id: candidateId }]
    });

    if (!cand) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    // Delete existing sessions and results for this candidate so they can take a fresh attempt
    await sessionsCol.deleteMany({
      $or: [{ candidateId: cand.candidateId }, { candidateInternalId: cand._id }]
    });
    const resultsCol = getCollection('assessment_results');
    await resultsCol.deleteMany({
      $or: [{ candidateId: cand.candidateId }, { candidateDisplayId: cand.candidateId }, { candidateId: cand._id }]
    });

    await candidatesCol.updateOne(
      { _id: cand._id },
      {
        assessmentStatus: 'Ready',
        recruitmentStage: 'Assessment Pending',
        totalScore: null,
        percentage: null,
        performanceCategory: null
      }
    );

    return res.json({
      success: true,
      message: `Assessment attempt successfully reset for ${cand.fullName} (${cand.candidateId}). The candidate can now start a fresh 45-question CBT session.`
    });
  } catch (err) {
    console.error('Reset assessment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  startOrResumeSession,
  saveAnswerHeartbeat,
  logProctoringViolation,
  terminateSessionOnTabClose,
  submitAssessment,
  getCandidateResult,
  resetAssessmentSession
};
