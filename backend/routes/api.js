const express = require('express');
const router = express.Router();
const { authenticateToken, requireRoles } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const candidateController = require('../controllers/candidateController');
const collegeController = require('../controllers/collegeController');
const domainController = require('../controllers/domainController');
const questionController = require('../controllers/questionController');
const examController = require('../controllers/examSessionController');
const proctoringController = require('../controllers/proctoringController');
const codingController = require('../controllers/codingController');
const interviewController = require('../controllers/interviewController');
const reportController = require('../controllers/reportController');
const auditLogController = require('../controllers/auditLogController');

// 1. Auth & Password Reset
router.post('/auth/login', authController.login);
router.post('/auth/admin-login', authController.adminLogin);
router.post('/auth/forgot-password', authController.requestPasswordReset);
router.post('/auth/verify-reset-otp', authController.verifyResetOtp);
router.post('/auth/reset-password', authController.resetPasswordWithOtp);
router.post('/auth/send-otp', authController.sendOtp);
router.post('/auth/verify-otp', authController.verifyOtp);
router.get('/auth/me', authenticateToken, authController.getMe);

// 2. Candidates
router.post('/candidates/register', candidateController.registerCandidate);
router.get('/candidates', authenticateToken, candidateController.listCandidates);
router.get('/candidates/:id', authenticateToken, candidateController.getCandidateById);
router.patch('/candidates/:id/stage', authenticateToken, requireRoles('Admin', 'Super Admin'), candidateController.updateRecruitmentStage);

// 3. Colleges & Recruitment Drives
router.get('/colleges', collegeController.listColleges);
router.post('/colleges', authenticateToken, requireRoles('Admin', 'Super Admin'), collegeController.createCollege);
router.get('/drives', collegeController.listDrives);
router.get('/drives/:id', collegeController.getDriveById);
router.post('/drives', authenticateToken, requireRoles('Admin', 'Super Admin'), collegeController.createDrive);

// 4. Domains & Job Roles
router.get('/domains', domainController.listDomains);
router.get('/job-roles', domainController.listJobRoles);
router.post('/job-roles', authenticateToken, requireRoles('Admin', 'Super Admin'), domainController.createJobRole);
router.put('/job-roles/:id', authenticateToken, requireRoles('Admin', 'Super Admin'), domainController.updateJobRole);

// 5. Question Bank Management & AI Drafts
router.get('/questions', questionController.listQuestions);
router.post('/questions', authenticateToken, requireRoles('Admin', 'Super Admin', 'Question Bank Manager'), questionController.createQuestion);
router.put('/questions/:id', authenticateToken, requireRoles('Admin', 'Super Admin'), questionController.updateQuestion);
router.delete('/questions/:id', authenticateToken, requireRoles('Admin', 'Super Admin'), questionController.deleteQuestion);
router.post('/questions/ai-generate', authenticateToken, requireRoles('Admin', 'Super Admin'), questionController.generateAiDraftQuestions);
router.patch('/questions/:id/approve', authenticateToken, requireRoles('Admin', 'Super Admin'), questionController.approveQuestion);

// 6. Online Assessment Exam Engine
router.post('/exam/start', authenticateToken, examController.startOrResumeSession);
router.post('/exam/reset-attempt', examController.resetAssessmentSession);
router.post('/exam/save-answer', authenticateToken, examController.saveAnswerHeartbeat);
router.post('/exam/violation', authenticateToken, examController.logProctoringViolation);
router.post('/exam/terminate-session', examController.terminateSessionOnTabClose);
router.post('/exam/submit', authenticateToken, examController.submitAssessment);
router.get('/exam/results/:candidateId', authenticateToken, examController.getCandidateResult);

// 7. Live Proctoring & Violation Resolution
router.get('/proctoring/live-sessions', authenticateToken, requireRoles('Admin', 'Super Admin'), proctoringController.getLiveProctoringSessions);
router.post('/proctoring/resolve', authenticateToken, requireRoles('Admin', 'Super Admin'), proctoringController.resolveViolationIncident);
router.post('/proctoring/snapshot', authenticateToken, proctoringController.uploadProctorSnapshot);

// 8. Coding Assessment Sandbox
router.get('/coding/challenges', authenticateToken, codingController.getCodingChallenges);
router.post('/coding/execute', authenticateToken, codingController.executeCodeSandbox);

// 9. Interviews
router.get('/interviews', authenticateToken, interviewController.listInterviews);
router.post('/interviews/schedule', authenticateToken, requireRoles('Admin', 'Super Admin'), interviewController.scheduleInterview);

// 10. Analytics & Certificate Verification
router.get('/reports/analytics', authenticateToken, reportController.getAnalyticsSummary);
router.get('/certificates/verify/:certificateId', reportController.verifyCertificate);

// 11. Audit Logs
router.get('/audit-logs', authenticateToken, requireRoles('Admin', 'Super Admin'), auditLogController.listAuditLogs);

module.exports = router;
