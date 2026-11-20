# INZOVATE TALENT ASSESSMENT PORTAL – DATABASE ARCHITECTURE

Organization: **INZOVATE TECHNOLOGIES PRIVATE LIMITED**  
Engine: MongoDB Atlas (with file-persisted atomic JSON adapter for standalone resilience)

---

## Complete Entity Schemas (27 Collections)

| Collection | Description | Key Indexes |
|------------|-------------|-------------|
| `Users` | System users (Super Admin, Admin, HR, Coordinators, Candidates) | `email (unique)`, `role` |
| `Candidates` | Candidate personal, parent, academic, and recruitment info | `candidateId (unique)`, `email (unique)`, `collegeId`, `jobRoleId`, `recruitmentStage` |
| `Colleges` | Affiliated universities, placement officers, contact details | `code (unique)`, `name` |
| `RecruitmentDrives` | Campus drives, schedules, deadlines, eligible branches | `driveId (unique)`, `collegeId`, `status` |
| `Domains` | 12 technical and business domains | `code (unique)`, `name` |
| `JobRoles` | 35+ professional roles with passing marks and skill matrix | `code (unique)`, `domainId` |
| `QuestionBanks` | Grouped question banks by domain and role | `domainId`, `roleId` |
| `Questions` | Master question pool (45-question distribution) | `section`, `roleId`, `isApproved`, `category` |
| `QuestionVersions` | Version history and question modification logs | `questionId`, `version` |
| `Assessments` | Exam templates, durations, cutoff thresholds | `code (unique)`, `status` |
| `AssessmentVersions` | Revisions of assessment configurations | `assessmentId`, `version` |
| `AssessmentSessions` | Active/completed exam sessions with randomized question IDs | `candidateId`, `status`, `expiresAt` |
| `CandidateAnswers` | Question-level candidate responses and timestamps | `sessionId`, `questionId` |
| `AssessmentResults` | Final scores, section percentages, and ratings | `candidateId`, `certificateId (unique)`, `percentage` |
| `ProctoringEvents` | Incident audit trail (tab switch, blur, audio spikes) | `sessionId`, `candidateId`, `eventType` |
| `ConsentRecords` | Explicit candidate recording, webcam, and privacy consents | `candidateId`, `consentedAt` |
| `RecordingMetadata` | Private S3 object storage video snapshot keys | `sessionId`, `storageKey` |
| `CodingSubmissions` | Sandbox programming submissions, test outputs, execution times | `candidateId`, `challengeId`, `status` |
| `EvaluationRecords` | Subjective evaluator notes and AI suggestions | `candidateId`, `evaluatorId` |
| `Notifications` | Dispatched emails, SMS, and in-app alerts | `recipientId`, `channel`, `status` |
| `InterviewSchedules` | Technical, HR, and Managerial interview appointments | `candidateId`, `scheduledDate`, `status` |
| `RecruitmentPipeline` | Stage transition timestamps and audit history | `candidateId`, `stage` |
| `OTPVerifications` | 6-digit verification codes and expiration timestamps | `recipient`, `channel`, `expiresAt` |
| `AuditLogs` | Tamper-resistant administrative and security ledger | `actorEmail`, `action`, `timestamp` |
| `SystemConfigurations` | Enterprise operational settings and hardware policies | `_id` |
| `FileMetadata` | Resumes, certificates, and proctoring attachments | `fileId`, `uploadedBy` |
| `CollegeAssignments` | Access control mappings for College Coordinators | `coordinatorId`, `collegeId` |

---

## Data Integrity Guarantees

1. **Answer Key Protection**: Answer keys (`correctOption`, `explanation`) are never sent in frontend question payloads.
2. **Server-Authoritative Evaluation**: Objective evaluation is computed exclusively on the backend against protected database answer keys.
3. **Session Snapshots**: Assessment sessions preserve randomized 45-question ordering across browser refreshes.
4. **Desktop Compliance**: Minimum 1024x600 resolution and browser checks prevent illicit mobile access.
