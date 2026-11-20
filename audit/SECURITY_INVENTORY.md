# APPLICATION SECURITY & INTEGRITY INVENTORY
**Application:** INZOVATE TALENT ASSESSMENT PORTAL  
**Audit Standard:** Elite Autonomous Software Audit V3.0  

---

## 1. Authentication & Session Security

| Security Layer | Mechanism | Implementation | Status |
|---|---|---|---|
| Password Hashing | `bcryptjs` (Cost factor 10) | `backend/controllers/authController.js` | PASS |
| Token Format | JWT (HMAC-SHA256) | Signed with `JWT_SECRET`, 24h expiry (`JWT_EXPIRES_IN`) | PASS |
| Role-Based Guard | Express Middleware `requireRoles` | Enforced on `/api/candidates/:id/stage`, `/api/questions/*`, `/api/proctoring/*`, `/api/audit-logs` | PASS |
| Admin Access Guard | Isolated Admin Route & Password | `/api/auth/admin-login` requires configured `ADMIN_PASSWORD` | PASS |
| Single-Session Trap | Tab Close Immediate Invalidation | `navigator.sendBeacon` triggers `/api/exam/terminate-session` | PASS |
| Password Reset Guard | 3-Step Email OTP | 6-digit OTP dispatched via Nodemailer TLS; strictly verified prior to password update | PASS |

---

## 2. Proctoring & Anti-Cheating Security

| Attack Vector | Countermeasure | Implementation | Status |
|---|---|---|---|
| Question Leakage / Client Scraping | Backend Sanitization | Server strips `correctOption` and `explanation` from `/api/exam/start` payload | PASS |
| Inspect Element / F12 Cheating | Server-Side Evaluation | Answers are scored strictly on the backend during `/api/exam/submit` | PASS |
| Tab Switching / Multi-Window Google Search | `document.visibilitychange` & `window.blur` Trap | Automatically increments violation counter; terminates session after 3 infractions | PASS |
| Fullscreen Escape | Fullscreen API Listener | Locks candidate into fullscreen; flags escape attempts | PASS |
| Impersonation / Proxy Testing | Real-time Webcam Face Tracking | Continuous canvas video sampling and streaming via Socket.IO | PASS |
| Malicious Re-registration | Unique Constraints | Prevents candidates with completed exams from re-registering under different names | PASS |

---

## 3. Data Privacy & Score Protection

| Entity | Visible Data | Restricted Data | Status |
|---|---|---|---|
| Candidate | Attendance Receipt, Exam Timestamp, Attempt Count (`X / 45 attempted`), Integrity Status | Total Marks, Percentage, Domain Breakdown, Answer Keys, Certificate ID | PASS (Masked) |
| Recruiter / Admin | Full Dossier, Academic CGPA, Section Marks, Domain Marks, Total Marks, Proctoring Audit Log, Live Feeds | None | PASS |
| Public / Verifier | Candidate Name, College, Drive, Verification Status | Raw Answer Responses, Internal Recruiter Notes | PASS |
