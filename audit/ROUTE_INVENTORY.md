# ROUTE & VIEW INVENTORY
**Application:** INZOVATE TALENT ASSESSMENT PORTAL  
**Audit Standard:** Elite Autonomous Software Audit V3.0  
**Status Key:** PASS | FAIL | BLOCKED | NOT APPLICABLE | NOT TESTED  

---

## 1. Frontend Route / View Inventory

| View ID | Page Component | Access Requirement | Related Components | Data Dependencies | Direct Access / Trigger | Status |
|---|---|---|---|---|---|---|
| `home` | `LandingPage.tsx` | Public | `Header`, `Footer`, `RegistrationPage` | Domains, Drives, SystemConfig | Direct URL load (`/`), Nav 'Home' | PASS |
| `register` | `RegistrationPage.tsx` | Public | Multi-step Form, AutoSuggest | 99+ Colleges, Domains, Job Roles | Nav 'Registration', Hero CTA | PASS |
| `system-check` | `SystemCheckPage.tsx` | Public / Candidate | 6-Point Hardware Diagnostic | Browser MediaDevices API, Screen | Nav 'Diagnostic', Hero Diagnostic | PASS |
| `candidate-dash` | `CandidateProfilePage.tsx` | Authenticated (Candidate) | Profile Card, Test CTA, History | User Token, Session Status | Nav 'Portal', Login Success | PASS |
| `exam` | `ExamInterface.tsx` | Authenticated (Candidate) | 45-Q Question Panel, WebcamFeed | Active Exam Session, Question Bank | Candidate Dashboard 'Start Assessment' | PASS |
| `candidate-result` | `CandidateResultPage.tsx` | Authenticated (Candidate) | Assessment Receipt, Dossier | Finalized Session, Answer Count | Exam Complete, Candidate Nav | PASS |
| `admin-dash` | `AdminDashboard.tsx` | Authenticated (Admin) | Filter Chips, Metrics, Table | Candidates, Results, Drives | Nav 'Dashboard', Admin Login | PASS |
| `hr-dash` | `HRDashboard.tsx` | Authenticated (Admin / HR) | Pipeline, Stage Toggles | Candidates by Stage | Internal Nav / Route Guard | PASS |
| `live-proctoring` | `LiveProctoringPage.tsx` | Authenticated (Admin / Proctor) | WebRTC Grid, Violation Logs | Socket.IO Room, Active Sessions | Nav 'Proctoring' | PASS |
| `question-bank` | `QuestionBankPage.tsx` | Authenticated (Admin / Manager) | Question Table, Filter, AI Gen | Question Bank Collection | Nav 'Question Bank' | PASS |
| `coding-sandbox` | `CodingSandboxPage.tsx` | Authenticated (Candidate / Admin) | Code Editor, Stdin/Stdout | Coding Challenges API | Candidate Dashboard CTA | PASS |
| `verify-cert` | `CertificateVerifyPage.tsx` | Public | QR Code Scanner / Manual Input | Certificate Verification API | Nav 'Verify Certificate' | PASS |

---

## 2. Interactive Modal Inventory

| Modal ID | Component Name | Trigger Mechanism | Dependencies | Purpose | Status |
|---|---|---|---|---|---|
| `candidate-login` | `CandidateLoginModal.tsx` | Header 'Sign In', Hero CTA, Route Guard | `/api/auth/login` | Authenticates candidate via Email/ID + Password | PASS |
| `admin-login` | `AdminLoginModal.tsx` | Header Dropdown, `Alt + A` Keyboard Shortcut | `/api/auth/admin-login` | Authenticates Lead Administrator | PASS |
| `forgot-password` | `ForgotPasswordModal.tsx` | Candidate Login 'Forgot Password?' | `/api/auth/forgot-password`, `/api/auth/verify-reset-otp`, `/api/auth/reset-password` | 3-Step Email OTP Password Reset (from winoraproject@gmail.com) | PASS |
