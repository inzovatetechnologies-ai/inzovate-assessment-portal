# API ENDPOINT INVENTORY
**Application:** INZOVATE TALENT ASSESSMENT PORTAL  
**Production Gateway:** `https://assessment.inzovate-technologies.com/api`  
**Audit Standard:** Elite Autonomous Software Audit, Debugging & QA Engine — V3.0  
**Latest Verification:** 2026-11-21  
**Total Serverless Endpoints:** 12 Endpoints (Strictly compliant with Vercel Limits)  

---

## 1. Modular Serverless Function Inventory (12 Endpoints)

| # | Endpoint File | HTTP Method(s) | Query Route / Actions | Auth Required | Purpose & Capabilities | Live Test Status |
|---|---|---|---|---|---|---|
| 1 | `api/health.js` | `GET`, `OPTIONS` | `/api/health` | None (Public) | System health check, organization info, deployment runtime mode | PASS (200 OK) |
| 2 | `api/colleges.js` | `GET`, `OPTIONS` | `/api/colleges` | None (Public) | 99+ Tamil Nadu Engineering Colleges directory, search filter | PASS (200 OK, 99 colleges) |
| 3 | `api/drives.js` | `GET`, `OPTIONS` | `/api/drives` | None (Public) | Active campus and off-campus recruitment drive schedules & rules | PASS (200 OK, 3 drives) |
| 4 | `api/job-roles.js` | `GET`, `OPTIONS` | `/api/job-roles`, `/api/domains` (`?type=domains`) | None (Public) | 13 Engineering Domains and 20 specialized Job Roles with passing criteria | PASS (200 OK, 20 roles, 13 domains) |
| 5 | `api/auth/login.js` | `POST`, `OPTIONS` | `/api/auth/login` | None (Public) | Unified candidate & admin gateway authentication, session token issuance | PASS (200 OK & 401 on bad pass) |
| 6 | `api/auth/admin-login.js` | `POST`, `OPTIONS` | `/api/auth/admin-login` | None (Public) | Dedicated Administrator Gateway with signed Admin JWT generation | PASS (200 OK & 401 on bad pass) |
| 7 | `api/auth/forgot-password.js` | `POST`, `GET`, `OPTIONS` | `/api/auth/forgot-password` (`request-otp`, `verify-otp`, `reset-password`) | None (Public) | 3-step OTP password recovery via `nodemailer` SMTP email relay | PASS (200 OK) |
| 8 | `api/candidates/register.js` | `POST`, `OPTIONS` | `/api/candidates/register` | None (Public) | Candidate registration, duplicate check, unique ID (`INZ-CAND-2026-XXXXX`), auto-login session | PASS (201 Created & 400 validation) |
| 9 | `api/candidates/index.js` | `GET`, `POST`, `DELETE`, `OPTIONS` | `/api/candidates`, `?id=:id`, `?id=:id&action=update_stage`, `?action=delete`, `?action=permanent_delete` | Admin Token | List candidates, single candidate dossier, recruitment stage updater, soft/hard delete | PASS (200 OK) |
| 10 | `api/exam.js` | `GET`, `POST`, `OPTIONS` | `?type=questions`, `?path=submit`, `?path=results/:id`, `?path=save-answer`, `?path=violation` | Candidate Token | 330-question bank provider, exam submission grading, pass cutoff (>25 marks) enforcement | PASS (200 OK, 330 questions, accurate cutoff) |
| 11 | `api/audit-logs.js` | `GET`, `OPTIONS` | `/api/audit-logs` | Admin Token | Enterprise audit ledger tracking login attempts, violations, and stage changes | PASS (200 OK, 3 audit events) |
| 12 | `api/reports/analytics.js` | `GET`, `OPTIONS` | `/api/reports/analytics` | Admin Token | Live recruitment analytics, candidate funnel stats, and score distributions | PASS (200 OK) |

---

## 2. API Contract & Payload Specifications

### A. Candidate Registration (`POST /api/candidates/register`)
- **Request Body:**
  ```json
  {
    "fullName": "Candidate Name",
    "email": "candidate@example.com",
    "mobileNumber": "9876543210",
    "password": "Password@2026",
    "collegeName": "College Name",
    "degree": "B.E. Computer Science",
    "branch": "CSE",
    "yearOfPassing": "2026",
    "cgpa": "8.5",
    "jobRoleId": "role-soft-dev",
    "jobRoleTitle": "Software Developer",
    "domainId": "dom-01",
    "domainName": "Software Development"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Candidate successfully registered...",
    "candidateId": "INZ-CAND-2026-00020",
    "token": "inz_session_...",
    "user": { ... }
  }
  ```

### B. Exam Submission (`POST /api/exam?path=submit`)
- **Request Body:**
  ```json
  {
    "candidateId": "INZ-CAND-2026-00020",
    "answers": {
      "q-apt-01": "B",
      "q-comm-01": "C",
      "q-tech-01": "A"
    }
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "result": {
      "candidateId": "INZ-CAND-2026-00020",
      "totalScore": 30,
      "maxScore": 45,
      "totalAttempted": 45,
      "percentage": 67,
      "isPassed": true,
      "selectionStatus": "Selected for Next Round",
      "performanceCategory": "Proficient (Commendable)",
      "status": "Completed"
    }
  }
  ```

### C. Admin Stage Mutation (`POST /api/candidates?id=INZ-CAND-2026-00020&action=update_stage`)
- **Request Body:**
  ```json
  {
    "stage": "Final Selected",
    "notes": "Cleared technical interview with high marks."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Candidate INZ-CAND-2026-00020 stage updated to Final Selected",
    "candidates": [ ... ]
  }
  ```

---

## 3. High-Concurrency & Error Resilience
1. **Universal CORS Headers:** Every serverless function returns:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization`
   - Immediate `200 OK` on `OPTIONS` preflight requests.
2. **Defensive Body Streaming:** Safe JSON streaming parser handles both buffered strings and parsed objects.
3. **HTTP 405 Method Guards:** Non-supported HTTP verbs cleanly reject with HTTP 405 and descriptive JSON.
