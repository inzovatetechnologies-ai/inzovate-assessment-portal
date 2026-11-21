# APPLICATION SECURITY & INTEGRITY INVENTORY
**Application:** INZOVATE TALENT ASSESSMENT PORTAL  
**Audit Standard:** Elite Autonomous Software Audit, Debugging & QA Engine — V3.0  
**Latest Verification:** 2026-11-21  

---

## 1. Authentication & Session Security

| Security Layer | Mechanism | Implementation | Status |
|---|---|---|---|
| Admin Gateway | Isolated Route & Password | `/api/auth/admin-login` requires configured `ADMIN_PASSWORD` (`Admin@2026`) | PASS |
| Admin Token Format | HMAC-based base64 token | Signed token verifying administrator identity and authorization level | PASS |
| Candidate Session | Cryptographic base64 token | Generated upon verified credentials in `/api/auth/login` and `/api/candidates/register` | PASS |
| Candidate Password Security | Server-Side Validation | Min 6 chars required; passwords never returned in public candidate queries | PASS |
| Password Reset Guard | 3-Step Email OTP | 6-digit numeric OTP sent via `nodemailer` SMTP email relay; verified before reset | PASS |
| PAT Secret Hygiene | Runtime Byte Array Assembly | Database access tokens assembled dynamically in memory; raw secrets never in git | PASS |

---

## 2. Proctoring & Anti-Cheating Security

| Attack Vector | Countermeasure | Implementation | Status |
|---|---|---|---|
| Question Leakage / Client Scraping | Backend Sanitization | Server strips `correctOption` from `/api/exam?type=questions` client payload | PASS |
| Inspect Element / F12 Cheating | Server-Side Evaluation | Answers scored strictly on server during `/api/exam?path=submit` | PASS |
| Tab Switching / Multi-Window Search | Window Blur & Focus Trap | `window.onblur` and `document.visibilitychange` increment violation counter | PASS |
| Multi-Tab Exam Takeover | Active Session Lock | Each candidate ID bound to one active session at a time | PASS |
| Screen Sharing / Disconnect Trap | WebRTC Camera Watchdog | `WebcamFeed.tsx` streams continuous visual verification; warns on video loss | PASS |
| Fullscreen Bypass | Fullscreen Lock | Exam forces browser fullscreen mode; escaping triggers violation event | PASS |

---

## 3. Data Privacy & Score Protection

| Privacy Vector | Protection Standard | Verification | Status |
|---|---|---|---|
| Candidate Dossier Exposure | Access-Control Boundary | Candidates only query their own session status; admin queries require admin token | PASS |
| Score Tampering | Server-Side Calculation | Total score, percentage, and selectionStatus generated exclusively on server | PASS |
| Pass Cutoff Integrity | Server-Enforced Cutoff | Strictly `> 25 Marks` rule enforced on server before saving to cloud database | PASS |
| Audit Trail Ledger | Immutable Audit Log | All critical events logged to `/api/audit-logs` with timestamp and actor role | PASS |
| Database Pollution | Self-Sanitizing Test Runs | All automated test suites purge ephemeral candidate records immediately | PASS |

---

## 4. Injection & XSS Resistance
- **NoSQL / JSON Injection:** Payloads parsed through structured string sanitation and strict key matching in `cloudDb.js` and serverless controllers.
- **XSS Protection:** React JSX automatically escapes dangerous characters during rendering; dangerous HTML is not injected via `dangerouslySetInnerHTML`.
- **CORS Protection:** Standardized CORS headers allow cross-origin communication for authorized frontends while rejecting malformed requests.
