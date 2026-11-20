# PROJECT ARCHITECTURE SPECIFICATION
**Application:** INZOVATE TALENT ASSESSMENT PORTAL — Enterprise CBT & Candidate Intelligence Platform  
**Entity:** INZOVATE TECHNOLOGIES PRIVATE LIMITED  
**CIN:** U62011TZ2025PTC036329  
**Assessment Domain:** `http://localhost:5000` (Production Gateway: `assessment.inzovate-technologies.com`)  
**Audit Date:** 2026-11-20  
**Audit Standard:** Elite Autonomous Software Audit V3.0  

---

## 1. Executive Summary & Purpose
The Inzovate Talent Assessment Portal is an enterprise Computer-Based Testing (CBT), automated skill evaluation, and real-time candidate proctoring system engineered for high-concurrency campus recruitment drives and off-campus institutional evaluation.

Key architectural pillars:
- **Strict Anti-Cheating & Integrity Guard:** Continuous live webcam proctoring, multi-face/no-face detection, window blur/tab-switch trap, fullscreen enforcement, and cryptographic QR verification.
- **Candidate Privacy Protection:** Candidate score and certificate generation masking (candidates receive attendance receipts, while recruiters/admins view full dossiers and score breakdowns).
- **Dual Persistence Architecture:** Resilient storage engine supporting MongoDB Atlas cloud clusters with seamless fallback to structured JSON collections.
- **Floating Pill Visual Identity:** Modern floating navigation bar with responsive drawer, dark glassmorphism, and branded company elements.

---

## 2. Technology Stack

### Frontend Architecture
- **Framework:** React 18.2.0 + TypeScript 5.2.2
- **Build Tool:** Vite 6.4.6 with Fast Refresh & ESM packaging
- **Styling:** Tailwind CSS 3.4.1 + PostCSS 8.4.35 + Autoprefixer
- **Iconography:** Lucide React (feather-style enterprise icons)
- **Real-Time Client:** Socket.IO Client 4.7.4 (bidirectional proctoring events)
- **Document & Media Generation:** `html2canvas` 1.4.1, `jspdf` 2.5.1, `qrcode` 1.5.3, `jsqr` 1.4.0
- **Syntax & Execution:** Monospace coding sandbox with interactive stdin/stdout simulation

### Backend Architecture
- **Runtime:** Node.js (v20+ LTS)
- **Web Framework:** Express 4.18.2
- **WebSocket Engine:** Socket.IO 4.7.4 (integrated HTTP/WS server)
- **Security & Crypto:** `bcryptjs` 2.4.3, `jsonwebtoken` 9.0.2 (HMAC SHA-256), `cors` 2.8.5
- **Communication & Notifications:** `nodemailer` 6.9.9 (TLS SMTP with Gmail `winoraproject@gmail.com`)
- **Document Rendering:** `pdfkit` 0.14.0 (vector PDF generation)
- **Unique Identifiers:** UUID v4 + Sequential Candidate / Drive identifiers

### Database Architecture
- **Dual-Engine Repository Pattern:**
  - Primary target: MongoDB Atlas (`mongodb+srv://...`)
  - Resilient local fallback: Lowdb-style structured JSON persistence (`backend/data/*.json`)
- **Collections:**
  1. `users`: System users (Super Admin, Admin, HR, Proctor, Candidate accounts)
  2. `candidates`: Full candidate dossiers, personal details, academic metrics, and recruitment stages
  3. `questions`: Master 45-question bank across Aptitude, Verbal Communication, and Technical Domains
  4. `assessment_sessions`: Active CBT sessions, state heartbeats, randomized section question lists
  5. `assessment_results`: Finalized examination evaluations, category scores, and anti-cheating audit trails
  6. `proctoring_events`: Real-time logged security infractions (tab switches, webcam lost, multi-face)
  7. `recruitment_drives`: Institutional campus drives with dates, locations, and quota
  8. `colleges`: 99+ accredited engineering and arts institutions across Tamil Nadu districts
  9. `domains`: 13 specialized engineering domains with role definitions
  10. `job_roles`: 20 specialized job roles mapped to technical competency matrices
  11. `system_configurations`: Enterprise CBT settings, violation thresholds, and exam durations
  12. `audit_logs`: Immutable chronological log of administrative and authentication events

---

## 3. Communication & Real-Time Flow
```
 Candidate Browser                     Express Server (Port 5000)               Socket.IO / DB
       |                                           |                                  |
       |--- 1. POST /api/candidates/register ----->|--- Create Candidate Dossier ---->|
       |                                           |                                  |
       |<-- 2. 201 Created (Candidate ID) ---------|                                  |
       |                                           |                                  |
       |--- 3. POST /api/auth/login -------------->|--- Verify Password / JWT ------->|
       |<-- 4. 200 OK + JWT Bearer Token ----------|                                  |
       |                                           |                                  |
       |--- 5. POST /api/exam/start -------------->|--- Generate 45 Questions -------->|
       |<-- 6. Sanitized Session (No Answers) -----|    (15 Aptitude, 15 Comm, 15 Dom) |
       |                                           |                                  |
       |--- 7. WS Connect ('exam:join') ---------->|--- Register Live Proctor Room -->|
       |--- 8. Proctor Snapshot / Heartbeat ------>|--- Stream to Admin Dashboard --->|
       |                                           |                                  |
       |--- 9. POST /api/exam/submit ------------->|--- Score Evaluation Engine ------>|
       |<-- 10. Receipt View (Score Masked) -------|--- Save Result & Audit Log ----->|
```

---

## 4. Directory Structure
```
inzovate-assessment-portal/
├── audit/                          # Formal Elite Audit Reports & Inventories
│   ├── PROJECT_ARCHITECTURE.md
│   ├── ROUTE_INVENTORY.md
│   ├── COMPONENT_INVENTORY.md
│   ├── API_INVENTORY.md
│   ├── DATABASE_INVENTORY.md
│   ├── SECURITY_INVENTORY.md
│   ├── TEST_EXECUTION_LOG.md
│   ├── BUG_TRACKER.md
│   └── FINAL_AUDIT_REPORT.md
├── backend/
│   ├── config/                     # Database and environment configurations
│   ├── controllers/                # 11 REST API controllers
│   ├── data/                       # 12 JSON persistent collections
│   ├── middleware/                 # JWT Auth & Role-Based Access Control
│   ├── routes/                     # API route declarations
│   ├── seed/                       # Master seeding scripts & 99 Tamil Nadu colleges
│   ├── utils/                      # Nodemailer SMTP mailer
│   └── server.js                   # Application server entry point (Express + Socket.IO)
└── frontend/
    ├── public/                     # Static assets (inzovate-logo.png, favicon)
    └── src/
        ├── components/             # Reusable UI modals, Header, Footer, WebcamFeed
        ├── pages/                  # 12 View pages (Landing, Registration, Exam, Dashboards)
        ├── services/               # Typed API client
        └── types/                  # TypeScript interface definitions
```
