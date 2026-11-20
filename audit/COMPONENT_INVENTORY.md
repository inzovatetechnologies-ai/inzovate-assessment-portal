# COMPONENT & INTERACTION INVENTORY
**Application:** INZOVATE TALENT ASSESSMENT PORTAL  
**Audit Standard:** Elite Autonomous Software Audit V3.0  

---

## 1. Global Shell & Navigation Components

### `Header.tsx` (Floating Pill Navigation Bar)
- **Container**: Centered, floating pill (`rounded-full`), `#121214` dark background, `backdrop-blur-2xl`, deep drop shadow (`shadow-[0_16px_40px_rgba(0,0,0,0.35)]`), top offset `top-0 pt-4 sm:pt-6 pb-2`.
- **Left Branding**: Circular white container with 3D Blue Triangle logo (`/inzovate-logo.png`) + `INZOVATE` brand text.
- **Center Nav Links**: `Home`, `Registration`, `Diagnostic`, `Verify`, `Sign In` (Candidate/Admin role adaptive).
- **Right Email Pill**: White high-contrast pill button displaying `hr@inzovate-technologies.com` or active candidate email with pulse status indicator.
- **Email Pill Dropdown Menu**:
  - 1-Click Copy with visual feedback checkmark.
  - Send Direct Email `mailto:` link.
  - Candidate Sign In modal trigger.
  - Administrator Portal (`Alt + A`) trigger.
  - CIN display: `U62011TZ2025PTC036329`.
- **Mobile Menu**: Responsive hamburger toggle revealing floating dark drawer with all routes and auth triggers.

### `Footer.tsx` (Enterprise Trust & Corporate Desk)
- **Compliance Banner**: Govt. of India MCA Registered CIN: `U62011TZ2025PTC036329`, AI Proctoring Badge, AES-256 Storage Badge, High-Concurrency Engine Badge, Cloud Service Status.
- **Corporate Identity**: Inzovate Technologies Private Limited description, RoC Coimbatore.
- **CBT Assessment Structure**: Section 1 Aptitude, Section 2 Communication, Section 3 Technical Specialization, Diagnostic info.
- **Compliance & Security**: Code of conduct, Webcam privacy, Anti-cheating rules, ISO 27001 alignment.
- **Corporate Desk**:
  - Registered Office: `Bhavani, Coimbatore and Salem, Tamil Nadu, India.`
  - Corporate Email: `hr@inzovate-technologies.com`
  - Support Email: `support@inzovate-technologies.com`
  - Admin Email: `admin@inzovate-technologies.com`
  - Phone: `+91 93420 08797` (Click-to-call)

---

## 2. Interactive Modals

### `CandidateLoginModal.tsx`
- **Fields**: Identifier (Email or Candidate ID), Password.
- **Actions**: Sign In, Forgot Password trigger, Register trigger, Close modal.
- **Validation**: Empty check, format check, error banner rendering.

### `AdminLoginModal.tsx`
- **Fields**: Admin Username/Email, Admin Secure Password.
- **Shortcut**: Global `Alt + A` listener.
- **Actions**: Authenticate Admin, Close modal.
- **Security**: Validates against configured `ADMIN_PASSWORD` or database admin user.

### `ForgotPasswordModal.tsx`
- **Step 1 (Request OTP)**: Candidate ID or Email input -> sends 6-digit OTP from `winoraproject@gmail.com`.
- **Step 2 (Verify OTP)**: 6-digit code entry -> calls `/api/auth/verify-reset-otp`.
- **Step 3 (New Password)**: New password + confirm password (minimum 6 chars, equality check) -> calls `/api/auth/reset-password`.

---

## 3. Page Level Components & Interactions

### `LandingPage.tsx`
- **Hero Section**: Brand logo, 2026 recruitment headline, call-to-actions ("Register for Assessment", "Pre-Assessment System Check", "Candidate Login").
- **Metrics Bar**: 45 Questions, 15/15/15 balanced sections, 13 Domains, 100% Proctored.
- **Active Drives Carousel / Filter**: Search bar filtering campus drives across Tamil Nadu institutions.
- **Domain Specialization Grid**: 13 technical engineering domain cards with badges and role counters.

### `RegistrationPage.tsx`
- **Multi-Step Stepper**:
  - Step 1: Personal Profile (Full Name, Email, Mobile, Password, Confirm Password).
  - Step 2: Domain & Job Role (Domain selector, Role selector).
  - Step 3: Academic Dossier (College auto-suggest from 99 Tamil Nadu colleges, Degree, Department, CGPA, Arrear status, Father Name & Mobile).
  - Step 4: System Requirements & Confirmation.
- **Validation**: Strict duplicate email prevention (HTTP 409), phone format validation, CGPA bounds checking.

### `SystemCheckPage.tsx`
- **Hardware Diagnostics**:
  1. Operating System & Browser Check (Desktop Chrome/Edge/Firefox verified).
  2. Screen Resolution Check (Minimum 1280x720 verified).
  3. Network Bandwidth & Latency Ping Check.
  4. Webcam Hardware Permission & Video Stream Check.
  5. Microphone Audio Input Level Check.
  6. Fullscreen API Capability Check.
- **Pass/Fail Threshold**: Proceed button enabled only when all mandatory checks pass.

### `ExamInterface.tsx` (Online CBT Exam Engine)
- **Top Header**: Candidate name, Candidate ID, Section badges, 60-Minute Countdown Timer, Remaining questions count.
- **Section Switcher**:
  - Section 1: Quantitative Aptitude & Logical Reasoning (15 Qs).
  - Section 2: Verbal & Professional Communication (15 Qs).
  - Section 3: Technical Domain Specialization (15 Qs).
- **Question Matrix Grid**: 1 to 45 question status palette (Answered, Flagged for Review, Not Visited).
- **Active Question Panel**: Question text, code snippets (if domain technical), 4 radio options, Clear Selection button, Mark for Review button, Next / Previous navigation.
- **Webcam Feed**: Real-time canvas proctoring, face tracking bounding box, status badge ("Webcam Secure").
- **Proctoring Traps**:
  - Tab Switch / Window Blur Trap: Logs violation, shows warning modal (Max 3 warnings before auto-submission).
  - Fullscreen Exit Trap: Intercepts fullscreen exit, forces prompt to re-enter fullscreen.
  - Timer Expiry: Automatically finalizes assessment and submits answers when timer reaches 00:00.

### `CandidateResultPage.tsx`
- **Privacy Enforcement**: Score and percentage are strictly masked for candidates.
- **Attendance Receipt**: Candidate details, Assessment ID, Submission timestamp, Attempted Questions summary (`X / 45 attempted`), Proctoring compliance status ("Clean / Verified").
- **Action**: Print / Download Attendance Receipt.

### `AdminDashboard.tsx`
- **Top District Filter Chips**: All Tamil Nadu, Coimbatore, Chennai, Madurai, Erode, Dindigul, Trichy, Salem, Tiruppur, Namakkal, etc.
- **College Chips Bar**: Dynamic pinned top colleges with live student count badges, instant Enter key addition, unpinning (`✕`).
- **Recruitment Metrics Cards**: Total Registered Candidates, Completed Exams, Average Score, High Performers (>75%).
- **Candidate Dossier Table**: Candidate ID, Name, College, Department, CGPA, Exam Status, Total Score (/45), Percentage, Stage badge, Actions (View Details, Update Stage, Export CSV/Excel).
- **Proctoring Incident Feed**: Real-time flagged violations with timestamps and candidate IDs.

### `LiveProctoringPage.tsx`
- **Candidate Video Tiles Grid**: Active exam sessions with live webcam feeds, candidate name, active section, violation count, audio meter.
- **Incident Action Panel**: Send Real-Time Warning (`proctor:warning`), Request Camera Realignment, Terminate Session for Malpractice.

### `QuestionBankPage.tsx`
- **Question Filter Bar**: By Section (Aptitude, Communication, Technical), by Domain, by Difficulty (Easy, Medium, Hard), Search keywords.
- **Question Editor Modal**: Create and edit question text, options A/B/C/D, correct answer key, explanation.
- **AI Question Generation Draft Tool**: Generates new syllabus-aligned questions for review and approval.
