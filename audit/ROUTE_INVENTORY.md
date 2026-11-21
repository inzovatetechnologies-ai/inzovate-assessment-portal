# ROUTE & VIEW INVENTORY
**Application:** INZOVATE TALENT ASSESSMENT PORTAL  
**Audit Standard:** Elite Autonomous Software Audit, Debugging & QA Engine — V3.0  
**Latest Verification:** 2026-11-21  
**Status Key:** PASS | FAIL | BLOCKED | NOT APPLICABLE | NOT TESTED  

---

## 1. Frontend Route / View Inventory (SPA State Navigation)

| View ID | Page Component | Access Requirement | Related Components | Data Dependencies | Direct Access / Trigger | Scroll-To-Top Status | Audit Status |
|---|---|---|---|---|---|---|---|
| `home` | `LandingPage.tsx` | Public | `Header`, `Footer`, Stats Counter, Workflow Timeline | Drives metadata, System Health | Direct URL load (`/`), Nav 'Home' | PASS (`scrollY: 0`) | PASS |
| `register` | `RegistrationPage.tsx` | Public | 3-Step Form, College AutoSuggest, Role Selector | 99+ Colleges, 13 Domains, 20 Job Roles | Nav 'Registration', Hero CTA | PASS (`scrollY: 0`) | PASS |
| `system-check` | `SystemCheckPage.tsx` | Public / Candidate | 6-Point Hardware Diagnostic, Audio Meter, WebRTC Test | Browser MediaDevices API, Screen | Nav 'Diagnostic', Registration redirect | PASS (`scrollY: 0`) | PASS |
| `candidate-dash` | `CandidateProfilePage.tsx` | Candidate Auth | Profile Card, Test CTA, Drive Info | User Session Token, Candidate ID | Candidate Login Success | PASS (`scrollY: 0`) | PASS |
| `exam` | `ExamInterface.tsx` | Candidate Auth | 45-Q Nav Grid, Section Switcher, WebcamFeed, 45-min Timer | Active Session, 330 Question Bank | Candidate Dash 'Start Assessment' | PASS (`scrollY: 0`) | PASS |
| `candidate-result` | `CandidateResultPage.tsx` | Candidate Auth | Assessment Score Card, Pass/Fail Status, PDF Download | Exam Submission Payload, Answers | Auto-redirect post submission | PASS (`scrollY: 0`) | PASS |
| `admin-dash` | `AdminDashboard.tsx` | Admin Auth | Candidate Table, Stage Updater, Excel (.CSV) & PDF Export | `/api/candidates`, Cloud Database | Admin Gateway Unlock | PASS (`scrollY: 0`) | PASS |
| `live-proctoring` | `LiveProctoringPage.tsx` | Admin Auth | Multi-Feed Grid, AI Proctor Event Stream | `/api/exam?type=proctoring` | Admin Dash 'Live Proctor' tab | PASS (`scrollY: 0`) | PASS |
| `question-bank` | `QuestionBankPage.tsx` | Admin Auth | Question Explorer, Section Filter, Options | `/api/exam?type=questions` (330 Qs) | Admin Dash 'Question Bank' tab | PASS (`scrollY: 0`) | PASS |
| `coding-sandbox` | `CodingSandboxPage.tsx` | Candidate / Admin | Monaco-style Code Editor, Output Terminal | Local JS Evaluator | Admin Dash 'Sandbox' tab | PASS (`scrollY: 0`) | PASS |
| `verify-cert` | `CertificateVerifyPage.tsx` | Public | QR Code Scanner, Certificate Cryptographic Verifier | Certificate ID Query Parameter | Direct URL (`?action=verify-cert`), Footer link | PASS (`scrollY: 0`) | PASS |

---

## 2. Interactive Modal Inventory

| Modal ID | Component | Trigger Mechanism | Form Inputs & Controls | API Endpoint | Verification Evidence | Status |
|---|---|---|---|---|---|---|
| `CandidateLoginModal` | `CandidateLoginModal.tsx` | Header 'Candidate Login' button | Email / Candidate ID, Password, Show Password, Submit | `/api/auth/login` | Session token issued, profile loaded | PASS |
| `AdminLoginModal` | `AdminLoginModal.tsx` | Alt + A shortcut, Footer Admin link | Username/Email, Password, Biometric visual, Unlock | `/api/auth/admin-login` | Admin JWT issued, Command Center loaded | PASS |
| `ForgotPasswordModal` | `ForgotPasswordModal.tsx` | Candidate Login 'Forgot Password?' | Email / Candidate ID, 6-digit OTP, New Password | `/api/auth/forgot-password` | OTP emailed, password reset verified | PASS |
| `CertificateModal` | `CertificateView.tsx` | Candidate Result 'Download Certificate' | Certificate View, Print Button, Download PDF | Local Canvas / Print engine | High-res MCA-compliant PDF rendered | PASS |

---

## 3. Route Guard & Direct URL Verification
1. **Manual Scroll Restoration:** Configured in `index.html` and `App.tsx` (`history.scrollRestoration = 'manual'`).
2. **Instant Scroll Reset:** Every tab transition and page mount invokes `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` and CSS `scroll-behavior: auto !important`.
3. **Session Guards:**
   - Accessing `admin-dash` without an active admin token displays the secure Administrator Gateway.
   - Accessing `exam` without a valid candidate session redirects to candidate login modal.
4. **Direct Browser Refresh:** Tested across all tabs; verified by browser subagents that the view stays at `scrollY: 0` without starting at the footer or jumping.
