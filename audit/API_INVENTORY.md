# API ENDPOINT INVENTORY
**Application:** INZOVATE TALENT ASSESSMENT PORTAL  
**Base URL:** `http://localhost:5000/api`  
**Audit Standard:** Elite Autonomous Software Audit V3.0  

---

## 1. Authentication & Account Recovery (`/api/auth`)

| Method | Endpoint | Controller Method | Auth | Role | Request Payload | Response Schema | DB Dependency |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/auth/login` | `authController.login` | None | Public | `{ identifier, password }` | `{ success, token, user }` | `users`, `candidates` |
| `POST` | `/api/auth/admin-login` | `authController.adminLogin` | None | Public | `{ identifier, password }` | `{ success, token, user }` | `users`, `audit_logs` |
| `POST` | `/api/auth/forgot-password` | `authController.requestPasswordReset` | None | Public | `{ identifier }` | `{ success, message, candidateEmail }` | `candidates`, `users` |
| `POST` | `/api/auth/verify-reset-otp` | `authController.verifyResetOtp` | None | Public | `{ identifier, otp }` | `{ success, message, candidateEmail }` | In-memory store |
| `POST` | `/api/auth/reset-password` | `authController.resetPasswordWithOtp` | None | Public | `{ identifier, otp, newPassword }` | `{ success, message }` | `users`, `audit_logs` |
| `POST` | `/api/auth/send-otp` | `authController.sendOtp` | None | Public | `{ email, type }` | `{ success, message }` | Mailer / Memory |
| `POST` | `/api/auth/verify-otp` | `authController.verifyOtp` | None | Public | `{ email, otp }` | `{ success, verified }` | In-memory store |
| `GET` | `/api/auth/me` | `authController.getMe` | Bearer JWT | Any | None | `{ success, user }` | `users`, `candidates` |

---

## 2. Candidate Management (`/api/candidates`)

| Method | Endpoint | Controller Method | Auth | Role | Request Payload | Response Schema | DB Dependency |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/candidates/register` | `candidateController.registerCandidate` | None | Public | Full registration JSON (dossier) | `{ success, candidateId, token }` | `candidates`, `users`, `colleges` |
| `GET` | `/api/candidates` | `candidateController.listCandidates` | Bearer JWT | Admin / Super Admin | Query params (`search`, `stage`, `collegeId`) | `{ success, candidates, total }` | `candidates`, `assessment_results` |
| `GET` | `/api/candidates/:id` | `candidateController.getCandidateById` | Bearer JWT | Candidate / Admin | URL Param `:id` | `{ success, candidate }` | `candidates` |
| `PATCH` | `/api/candidates/:id/stage` | `candidateController.updateRecruitmentStage` | Bearer JWT | Admin / Super Admin | `{ stage, remarks }` | `{ success, candidate }` | `candidates`, `audit_logs` |

---

## 3. Colleges & Recruitment Drives (`/api/colleges`, `/api/drives`)

| Method | Endpoint | Controller Method | Auth | Role | Request Payload | Response Schema | DB Dependency |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/colleges` | `collegeController.listColleges` | None | Public | Query params (`district`, `search`) | `{ success, colleges }` | `colleges` |
| `POST` | `/api/colleges` | `collegeController.createCollege` | Bearer JWT | Admin / Super Admin | `{ name, code, district, city }` | `{ success, college }` | `colleges` |
| `GET` | `/api/drives` | `collegeController.listDrives` | None | Public | Query params (`status`) | `{ success, drives }` | `recruitment_drives` |
| `GET` | `/api/drives/:id` | `collegeController.getDriveById` | None | Public | URL Param `:id` | `{ success, drive }` | `recruitment_drives` |
| `POST` | `/api/drives` | `collegeController.createDrive` | Bearer JWT | Admin / Super Admin | Drive payload JSON | `{ success, drive }` | `recruitment_drives` |

---

## 4. Domains & Job Roles (`/api/domains`, `/api/job-roles`)

| Method | Endpoint | Controller Method | Auth | Role | Request Payload | Response Schema | DB Dependency |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/domains` | `domainController.listDomains` | None | Public | None | `{ success, domains }` | `domains` |
| `GET` | `/api/job-roles` | `domainController.listJobRoles` | None | Public | Query param (`domainId`) | `{ success, jobRoles }` | `job_roles` |
| `POST` | `/api/job-roles` | `domainController.createJobRole` | Bearer JWT | Admin / Super Admin | Job role JSON | `{ success, jobRole }` | `job_roles` |
| `PUT` | `/api/job-roles/:id` | `domainController.updateJobRole` | Bearer JWT | Admin / Super Admin | Job role update JSON | `{ success, jobRole }` | `job_roles` |

---

## 5. Question Bank Management (`/api/questions`)

| Method | Endpoint | Controller Method | Auth | Role | Request Payload | Response Schema | DB Dependency |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/questions` | `questionController.listQuestions` | None | Public / Admin | Query params (`section`, `domainId`) | `{ success, questions }` | `questions` |
| `POST` | `/api/questions` | `questionController.createQuestion` | Bearer JWT | Admin / Super Admin | Question payload JSON | `{ success, question }` | `questions` |
| `PUT` | `/api/questions/:id` | `questionController.updateQuestion` | Bearer JWT | Admin / Super Admin | Question update JSON | `{ success, question }` | `questions` |
| `DELETE` | `/api/questions/:id` | `questionController.deleteQuestion` | Bearer JWT | Admin / Super Admin | URL Param `:id` | `{ success, message }` | `questions` |
| `POST` | `/api/questions/ai-generate` | `questionController.generateAiDraftQuestions` | Bearer JWT | Admin / Super Admin | `{ domainId, section, count }` | `{ success, draftQuestions }` | `questions` |
| `PATCH` | `/api/questions/:id/approve` | `questionController.approveQuestion` | Bearer JWT | Admin / Super Admin | URL Param `:id` | `{ success, question }` | `questions` |

---

## 6. Exam Engine & Assessment Sessions (`/api/exam`)

| Method | Endpoint | Controller Method | Auth | Role | Request Payload | Response Schema | DB Dependency |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/exam/start` | `examController.startOrResumeSession` | Bearer JWT | Candidate | `{ candidateId }` | `{ success, session (sanitized) }` | `assessment_sessions`, `questions` |
| `POST` | `/api/exam/reset-attempt` | `examController.resetAssessmentSession` | None | Public / Admin | `{ candidateId }` | `{ success, message }` | `assessment_sessions` |
| `POST` | `/api/exam/save-answer` | `examController.saveAnswerHeartbeat` | Bearer JWT | Candidate | `{ sessionId, questionId, selectedOption }` | `{ success }` | `assessment_sessions` |
| `POST` | `/api/exam/violation` | `examController.logProctoringViolation` | Bearer JWT | Candidate | `{ sessionId, violationType, details }` | `{ success, totalWarnings }` | `proctoring_events`, `assessment_sessions` |
| `POST` | `/api/exam/terminate-session` | `examController.terminateSessionOnTabClose` | None | Public / SendBeacon | `{ sessionId, candidateId, reason }` | `{ success, message }` | `assessment_sessions`, `proctoring_events` |
| `POST` | `/api/exam/submit` | `examController.submitAssessment` | Bearer JWT | Candidate | `{ sessionId }` | `{ success, result (masked for candidate) }` | `assessment_results`, `assessment_sessions`, `candidates` |
| `GET` | `/api/exam/results/:candidateId` | `examController.getCandidateResult` | Bearer JWT | Candidate / Admin | URL Param `:candidateId` | `{ success, result }` | `assessment_results` |

---

## 7. Live Proctoring, Coding, Interviews & Verification (`/api/*`)

| Method | Endpoint | Controller Method | Auth | Role | Request Payload | Response Schema | DB Dependency |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/proctoring/live-sessions` | `proctoringController.getLiveProctoringSessions` | Bearer JWT | Admin / Super Admin | None | `{ success, sessions }` | `assessment_sessions` |
| `POST` | `/api/proctoring/resolve` | `proctoringController.resolveViolationIncident` | Bearer JWT | Admin / Super Admin | `{ incidentId, resolution }` | `{ success, message }` | `proctoring_events` |
| `POST` | `/api/proctoring/snapshot` | `proctoringController.uploadProctorSnapshot` | Bearer JWT | Candidate | `{ sessionId, snapshotBase64 }` | `{ success }` | `proctoring_events` |
| `GET` | `/api/coding/challenges` | `codingController.getCodingChallenges` | Bearer JWT | Any | Query param (`domainId`) | `{ success, challenges }` | In-memory challenges |
| `POST` | `/api/coding/execute` | `codingController.executeCodeSandbox` | Bearer JWT | Any | `{ language, sourceCode, stdin }` | `{ success, stdout, executionTime }` | Node VM sandbox |
| `GET` | `/api/interviews` | `interviewController.listInterviews` | Bearer JWT | Any | None | `{ success, interviews }` | In-memory / DB |
| `POST` | `/api/interviews/schedule` | `interviewController.scheduleInterview` | Bearer JWT | Admin / Super Admin | Interview JSON | `{ success, interview }` | In-memory / DB |
| `GET` | `/api/reports/analytics` | `reportController.getAnalyticsSummary` | Bearer JWT | Any | None | `{ success, metrics, domainDistribution }` | `assessment_results`, `candidates` |
| `GET` | `/api/certificates/verify/:id` | `reportController.verifyCertificate` | None | Public | URL Param `:id` | `{ success, verified, certificate }` | `assessment_results` |
| `GET` | `/api/audit-logs` | `auditLogController.listAuditLogs` | Bearer JWT | Admin / Super Admin | None | `{ success, logs }` | `audit_logs` |
| `GET` | `/api/health` | `server.js` inline | None | Public | None | `{ status: "ONLINE", organization, ... }` | Memory |
