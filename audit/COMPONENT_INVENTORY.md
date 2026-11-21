# COMPONENT & INTERACTION INVENTORY
**Application:** INZOVATE TALENT ASSESSMENT PORTAL  
**Audit Standard:** Elite Autonomous Software Audit, Debugging & QA Engine — V3.0  
**Latest Verification:** 2026-11-21  

---

## 1. Global Shell & Navigation Components

### `Header.tsx` (Floating Pill Navigation Bar)
- **Container Structure**: Centered, floating pill (`rounded-full`), `#121214` dark glassmorphic background, `backdrop-blur-2xl`, deep drop shadow (`shadow-[0_16px_40px_rgba(0,0,0,0.35)]`), top offset `top-0 pt-4 sm:pt-6 pb-2`.
- **Left Branding**: Circular container with Inzovate brand logo + `INZOVATE` brand typography.
- **Center Nav Links**: `Home`, `Registration`, `Diagnostic`, `Verify`, `Sign In` (Candidate/Admin role adaptive).
- **Right Corporate Email Pill**: High-contrast pill button displaying `hr@inzovate-technologies.com` or active candidate email with pulse status indicator.
- **Email Dropdown Menu**:
  - 1-Click Copy with visual feedback checkmark.
  - Send Direct Email `mailto:` link.
  - Candidate Sign In modal trigger.
  - Administrator Portal (`Alt + A`) trigger.
  - Registered CIN display: `U62011TZ2025PTC036329`.
- **Mobile Menu**: Responsive hamburger toggle revealing floating dark drawer with all routes and auth triggers.
- **Status:** PASS (Verified via browser automation across mobile and desktop).

### `Footer.tsx` (Enterprise Trust & Corporate Desk)
- **Compliance Banner**: Govt. of India MCA Registered CIN: `U62011TZ2025PTC036329`, AI Proctoring Badge, High-Concurrency Engine Badge, Cloud Service Status.
- **Corporate Desk Information**: Office addresses, official grievance email, recruitment drive notice.
- **Quick Links**: Direct links to all routes, Terms of Assessment, Anti-Cheating Policy, and Administrator Gateway.
- **Status:** PASS.

---

## 2. Interactive Modals

### `CandidateLoginModal.tsx`
- **Fields**: Email or Candidate ID, Password, Show/Hide Password toggle.
- **Actions**: Sign In, Forgot Password trigger, Switch to Registration tab, Close modal.
- **Validation**: Rejects blank fields, validates password presence, displays server error banners.
- **Status:** PASS (Verified with session token generation).

### `AdminLoginModal.tsx`
- **Trigger**: Alt + A shortcut, Header dropdown, Footer link.
- **Fields**: Admin Username/Email, Admin Security Password, Biometric visual scanner animation.
- **Actions**: Unlock Admin Command Center, Cancel.
- **Security**: Rejects invalid passwords with HTTP 401; issues signed Admin JWT upon valid credentials (`Admin@2026`).
- **Status:** PASS.

### `ForgotPasswordModal.tsx`
- **Workflow**: 3-step secure password recovery:
  1. *Identifier Step*: Input Candidate ID or registered email.
  2. *OTP Step*: 6-digit numeric OTP sent via `nodemailer` SMTP email relay with countdown timer and resend capability.
  3. *New Password Step*: Enter new password (min 6 chars), confirm password, commit update.
- **Status:** PASS (Verified fallback email handling and session storage).

---

## 3. Core Page Components & Forms

### `RegistrationPage.tsx` (3-Step Enterprise Candidate Registration)
- **Step 1 — Personal & Contact Details**: Full Name, Email, Mobile Number, Alt Mobile, Date of Birth, Gender, Address, District, Pin Code.
- **Step 2 — Academic Credentials**: College Search AutoSuggest (99+ Tamil Nadu Engineering Colleges), Degree, Branch, Year of Passing, CGPA, SSLC%, HSC%, Standing Arrears.
- **Step 3 — Role Selection & Authentication**: Domain Picker (13 Domains), Job Role Picker (20 Job Roles), Preferred Location, Password & Confirm Password.
- **Defensive Engineering**: Accepts both `mobileNumber` and `mobile` fields; checks duplicate active email and phone number; creates collision-proof candidate ID (`INZ-CAND-2026-XXXXX`).
- **Status:** PASS (Verified live 201 Created and auto-login).

### `SystemCheckPage.tsx` (6-Point Hardware Diagnostic)
- **Checks**:
  1. Operating System & Browser Compatibility.
  2. Network Latency & Bandwidth Quality.
  3. Live Webcam Stream & Resolution Check.
  4. Microphone Input Audio Level Meter.
  5. Fullscreen Mode Permission.
  6. Single Display / Multi-Monitor Detection.
- **Actions**: Re-test All, Proceed to Assessment CTA.
- **Status:** PASS.

### `ExamInterface.tsx` (CBT Examination Engine)
- **Sections**:
  - Section 1: Quantitative Aptitude & Logical Reasoning (15 Qs).
  - Section 2: Verbal Ability & Business Communication (15 Qs).
  - Section 3: Technical Domain Core Engineering (15 Qs).
- **Total Questions**: 45 Questions (from 330 Question Pool).
- **Timer**: Strictly 45 minutes (2700s) with live MM:SS countdown and low-time warning.
- **Security & Proctoring**: Real-time camera feed (`WebcamFeed.tsx`), full screen lock, tab-switch violation counter (auto-submit on repeated violations), answer auto-save heartbeat.
- **Status:** PASS.

### `CandidateResultPage.tsx` (Score & Decision Card)
- **Pass/Fail Criteria**: Strictly calibrated to **> 25 Marks out of 45**.
  - Total Score > 25: Green celebratory badge, `PASS`, Selection Status: `Selected for Next Round`, Confetti trigger.
  - Total Score <= 25: Amber/Red alert badge, `FAIL`, Selection Status: `Rejected`.
- **Breakdown**: Section 1, Section 2, Section 3 scores, accuracy percentage, time taken.
- **Candidate Report Card PDF Download**: High-definition client-side printable PDF receipt featuring corporate seal and recruitment decision.
- **Status:** PASS.

### `AdminDashboard.tsx` (Enterprise Command Center)
- **Candidate Table**: Search by Name/Email/ID, Filter by College, Filter by Job Role, Filter by Selection Decision (`All Attended`, `Selected for Next Round`, `Rejected`, `Final Selected`).
- **Recruitment Actions**:
  - Update Candidate Stage (`Registered`, `Screening`, `Shortlisted`, `Selected for Next Round`, `Final Selected`, `Rejected`, `Archived`).
  - View full score breakdown.
  - Soft-delete candidate.
  - Permanent delete candidate.
- **Export Capabilities**:
  - **Excel (.CSV) Export**: Full recruitment ledger with Candidate ID, Full Name, Email, Mobile, College, Degree, CGPA, Attempted Qs, Total Score, Result (PASS/FAIL), Selection Status, and Recruitment Stage.
  - **Printable MCA-Compliant PDF**: Branded recruitment dossier with CIN `U62011TZ2025PTC036329`, summary metric cards, candidate roster, and color-coded selection status badges.
- **Status:** PASS.
