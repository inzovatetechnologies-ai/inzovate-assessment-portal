# DATABASE & DATA INTEGRITY INVENTORY
**Application:** INZOVATE TALENT ASSESSMENT PORTAL  
**Engine:** Dual Storage Engine (MongoDB Atlas + Structured JSON Local Persistence)  
**Storage Location:** `backend/data/*.json`  
**Audit Standard:** Elite Autonomous Software Audit V3.0  

---

## 1. Storage Collections Overview

| Collection Name | File Path | Record Count | Primary Key | Description |
|---|---|---|---|---|
| `users` | `backend/data/users.json` | 6+ | `_id` / `email` | System users: Admins, HR Managers, Proctors, Candidates with bcrypt password hashes. |
| `candidates` | `backend/data/candidates.json` | 4+ | `_id` / `candidateId` | Master candidate dossiers with academic profiles, college IDs, stages, and total scores. |
| `questions` | `backend/data/questions.json` | 45+ | `_id` / `questionId` | Master question bank covering Aptitude, Communication, and Domain specializations. |
| `assessment_sessions` | `backend/data/assessment_sessions.json` | Dynamic | `_id` / `sessionId` | Active CBT examination sessions, question orders, timer state, and heartbeat responses. |
| `assessment_results` | `backend/data/assessment_results.json` | Dynamic | `_id` / `certificateId` | Finalized exam evaluations, section scores, timestamps, and integrity status. |
| `proctoring_events` | `backend/data/proctoring_events.json` | Dynamic | `_id` / `eventId` | Proctoring infraction logs (tab switches, webcam drops, multiple faces). |
| `recruitment_drives` | `backend/data/recruitment_drives.json` | 3+ | `_id` / `driveId` | Institutional campus drives, dates, venues, and registered candidate counts. |
| `colleges` | `backend/data/colleges.json` | 99+ | `_id` / `code` | Tamil Nadu engineering and technology institutions across all major districts. |
| `domains` | `backend/data/domains.json` | 13 | `_id` / `domainId` | Engineering domains (Full Stack, Data Science, AI/ML, Cloud, DevOps, Cyber, etc.). |
| `job_roles` | `backend/data/job_roles.json` | 20 | `_id` / `roleId` | Standard technical job roles with domain mappings and required skills. |
| `system_configurations` | `backend/data/system_configurations.json` | 1 | `_id` | Global portal configurations, exam durations, proctoring thresholds. |
| `audit_logs` | `backend/data/audit_logs.json` | Dynamic | `_id` | Immutable security audit trail recording logins, stage changes, password resets. |

---

## 2. Key Schemas & Relationships

### `candidates` Collection
```json
{
  "_id": "cand-00001",
  "candidateId": "INZ-CAND-2026-00001",
  "fullName": "Kavitha Sundaram",
  "email": "candidate@inzovate.com",
  "mobileNumber": "9876543210",
  "domainId": "domain-01",
  "jobRoleId": "role-01",
  "collegeId": "coll-01",
  "collegeName": "Anna University, CEG Campus",
  "degree": "B.E.",
  "department": "Computer Science and Engineering",
  "graduationYear": 2026,
  "cgpa": 8.9,
  "arrearStatus": "No Active Backlogs",
  "fatherName": "Sundaram R",
  "fatherMobile": "9842100000",
  "recruitmentStage": "Assessment Completed",
  "assessmentStatus": "Completed",
  "totalScore": 38,
  "percentage": 84.4,
  "certificateId": "INZ-CERT-2026-00001",
  "registeredAt": "2026-11-18T05:41:48.480Z"
}
```

### Relational Integrity Constraints
1. **Candidate to User**: Every registered candidate automatically generates a corresponding credentials record in `users` with matching `email` and hashed `password`.
2. **Duplicate Prevention**: Registration controller enforces unique constraints on both `email` (case-insensitive) and `mobileNumber`. Attempts to re-register return HTTP 409 Conflict.
3. **Session to Question Bank**: Examination engine dynamically draws exactly 15 Section 1 (Aptitude), 15 Section 2 (Verbal Communication), and 15 Section 3 (Domain Technical) questions, sanitizing out `correctOption` and `explanation` before delivery to the client.
4. **Session Finalization**: When submitted or auto-submitted, answers are graded against the database question bank, and a record is created in `assessment_results` while updating `candidates.assessmentStatus` to `Completed`.
