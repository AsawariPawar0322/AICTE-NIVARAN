# CONTEXT — quick-reference fact sheet

Dense, fixed facts about the codebase so that a developer (or an AI assistant) can orient without re-reading every file. Keep this file accurate: update it in the same change as the code. Last verified: 2026-10-25.

## 1. One-paragraph summary

AICTE NIVARAN is a hackathon prototype grievance portal. The **frontend** (React 19 + TypeScript + Vite, single page, no router) is fully self-contained: it runs on in-memory mock data from `frontend/src/data/mockData.ts` and never calls the backend. The **backend** (FastAPI, Python) exposes a working REST API over in-memory Python lists in `backend/app/database.py`. The two are **not connected yet**. Nothing persists across reloads/restarts. OTP, SHA-256 hashing, related-case matching, and officer chat replies are simulated.

## 2. Commands

| Task | Command | Verified |
|---|---|---|
| Frontend dev | `cd frontend && npm install && npm run dev` → http://localhost:5173 | yes |
| Frontend build | `cd frontend && npm run build` (`tsc -b && vite build`) | yes, passes, ~446 KB JS |
| Frontend lint | `cd frontend && npm run lint` (oxlint) | — |
| Backend venv | `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt` | yes |
| Backend run | `cd backend && uvicorn main:app --reload --port 8000` → Swagger at http://localhost:8000/docs | yes |
| Tests | none exist | — |

`fastapi.testclient` does not work in the current venv (needs `httpx`); test the API with `curl` against a running server.

## 3. File map (source only)

```
README.md                         Project pitch/overview (root)
backend/
  main.py              ~296 L     FastAPI app, CORS, all 9 routes
  app/database.py      ~173 L     Seed data: mock_institutions(5), mock_grievances(1), mock_otp_sessions
  app/schemas.py        ~63 L     Pydantic request models (7 + EvidenceUploadItem)
  requirements.txt                fastapi, uvicorn, pydantic, python-multipart
  README.md                       Backend run notes
frontend/
  index.html                      Shell, Google Fonts (Noto Sans / Devanagari / Mono), favicon = /aicte-nivaran-logo.png
  src/main.tsx                    Mounts <App/> in StrictMode, imports index.css
  src/App.tsx          ~363 L     ALL global state + tab switching + footer
  src/types/index.ts   ~151 L     All TS types
  src/data/mockData.ts ~527 L     All seed data for the UI
  src/locales/translations.ts ~172 L  EN/HI dictionary (`translations[lang].key`)
  src/tokens.css       ~118 L     Design tokens (:root vars), high-contrast override
  src/index.css        ~238 L     Global base + utility classes; imports tokens.css
  src/App.css                     UNUSED Vite template leftover (not imported)
  src/components/HeaderStrip.tsx ~517 L  Gov header: lang, font scale, contrast, role switch, login/logout
  src/components/Navbar.tsx      ~240 L  Tab bar; defines `ActiveTab` type; PENDING_OTP badge
  src/views/LandingPage.tsx          ~841 L  Home: institution search, voice search sim, categories, stats
  src/views/ComplainantDashboard.tsx ~590 L  Case list + filters
  src/views/FileComplaintView.tsx   ~1154 L  5-step complaint wizard
  src/views/TrackComplaintView.tsx   ~961 L  Case lookup, 6-stage tracker, OTP closure, escalation
  src/views/UserAdminChatView.tsx    ~483 L  Complainant ↔ officer chat (simulated replies)
  src/views/DiscordReplicaView.tsx  ~1042 L  Discord-style community hub with slash commands
  src/views/LoginView.tsx            ~628 L  Citizen OTP / official login / demo personas
```

Every component and view carries its own CSS in an inline `<style>{`...`}</style>` block at the bottom of its JSX (roughly the last 40–50% of each file). Logic is in the first ~120 lines of each view.

## 4. Key symbols and locations

| Symbol | Location |
|---|---|
| `App` (global state) | `frontend/src/App.tsx:20` |
| `handleAddNewComplaint` | `App.tsx:62` |
| `handleSelectComplaintForTracking` → tab `track` | `App.tsx:67` |
| `handleOpenChatWithComplaint` → tab `chat` | `App.tsx:72` |
| `handleUpdateComplaintStage(caseId, stage, feedback?)` | `App.tsx:77` |
| `handleSendMessage` | `App.tsx:97` |
| `pendingOtpCount` | `App.tsx:101` |
| `ActiveTab` type | `components/Navbar.tsx:14` |
| `categoryOptions` (7 categories with labels/icons) | `views/FileComplaintView.tsx:78` |
| `handleFileUpload` (fake SHA-256) | `views/FileComplaintView.tsx:90` |
| `handleSubmitFinal` (builds `Complaint`) | `views/FileComplaintView.tsx:117` |
| Step 5 related-case alert (hardcoded "2 similar cases") | `views/FileComplaintView.tsx:~648` |
| `handleLookup`, `handleVerifyOtp`, `handleEscalateToOmbudsman` | `views/TrackComplaintView.tsx:57, 68, 93` |
| `stagesList` (6 stage labels) | `views/TrackComplaintView.tsx:119` |
| `handleSearch`, `simulateVoiceSearch` | `views/LandingPage.tsx:43, 59` |
| `filteredComplaints` | `views/ComplainantDashboard.tsx:42` |
| `handleSend` + canned officer replies | `views/UserAdminChatView.tsx:37` |
| Discord `/status`, `/helpline` commands | `views/DiscordReplicaView.tsx:56, 86` |
| `handleSendOtp`, `handleVerifyOtp`, `handleOfficialLogin`, `loginDemoPersona` | `views/LoginView.tsx:53, 63, 79, 90` |
| Backend routes | `backend/main.py:37–289` |

## 5. Fixed demo data (do not need to search for these)

| Item | Value |
|---|---|
| Universal demo OTP | `849210` (login and case closure, both FE and BE) |
| FE login OTP rule | accepts `849210` **or any 6-character string** |
| BE deterministic OTP trigger | identifier containing `98712` or `aarav` |
| Default logged-in user | Aarav Sharma · Student · DTU · Roll `2024-CS-108` · `+91 98712 34567` · `aarav.sharma@example.com` |
| Demo official | Dr. Ramesh Chandra Verma · Director, PGRC · ID `PGRC-DIR-0842` |
| Demo nodal officer | Prof. K. S. Rao · Registrar, DTU · ID `DTU-NODAL-14` |
| Case ID format | `AICTE-2026-GRV-NNNNN` (random 5 digits) |
| Certificate ref format (BE) | `CERT-NIVARAN-2026-<last 5 of case id>` |
| New case defaults | stage `REGISTERED`, stageNumber 1, SLA 72 h, officer Verma, relatedCaseCount = 3 if linked else 0 |

Seed complaints (frontend `initialComplaints`):

| ID | Title (short) | Category | Institution | Complainant | Stage |
|---|---|---|---|---|---|
| `AICTE-2026-GRV-84920` | Caution money / fee non-refund | FEES_REFUND | DTU | Aarav Sharma | PENDING_OTP (5), SLA 18 h, related 3 |
| `AICTE-2026-GRV-79114` | Pragati scholarship delay | SCHOLARSHIP_AICTE | COEP Tech | Pooja Kulkarni | INVESTIGATION (3), related 1 |
| `AICTE-2026-GRV-65021` | Metallurgy lab equipment | FACULTY_INFRA | VJTI | Rohan Deshmukh | RESOLVED (6) |

Backend `mock_grievances` contains **only** `AICTE-2026-GRV-84920`.

Seed institutions (identical FE and BE):

| id | AICTE Permanent ID | Name | City, State | Open cases | Rating |
|---|---|---|---|---|---|
| inst-1 | 1-10928341 | Delhi Technological University (DTU) | New Delhi, Delhi | 4 | A+ (98.4%) |
| inst-2 | 1-29481903 | College of Engineering Pune (COEP Tech) | Pune, Maharashtra | 2 | A+ (99.1%) |
| inst-3 | 1-48201948 | Veermata Jijabai Technological Institute (VJTI) | Mumbai, Maharashtra | 3 | A (95.0%) |
| inst-4 | 1-85729104 | National Institute of Technology Trichy (NITT) | Tiruchirappalli, Tamil Nadu | 1 | A++ (99.7%) |
| inst-5 | 1-93810294 | RV College of Engineering | Bengaluru, Karnataka | 6 | A (94.2%) |

Discord servers: `srv-1` AICTE Central Grievance Hub, `srv-2` National Student Rights & Support, `srv-3` PGRC & Bureau Officer Chamber, `srv-4` Anti-Ragging Crisis Squad, `srv-5` ICC & Women Redressal Cell.
Discord channels: `ch-announcements`, `ch-rules` (rules-and-rights), `ch-fee-help` (fee-and-scholarships, **default selected**), `ch-peer-support`, `ch-anti-ragging`, `ch-voice-lounge` (voice: Grievance Advisory Lounge). Messages keyed by channel id in `mockDiscordMessages`.
Seed chat (`initialChatMessages`): 5 messages `msg-1`…`msg-5` between system, Dr. Verma (PGRC) and Aarav, all about case 84920.

## 6. Enums

- `StageKey`: `REGISTERED`(1) → `ALLOTTED`(2) → `INVESTIGATION`(3) → `RESOLUTION_PROPOSED`(4) → `PENDING_OTP`(5) → `RESOLVED`(6); side branch `ESCALATED`.
- `GrievanceCategory`: `FEES_REFUND`, `ANTI_RAGGING`, `SEXUAL_HARASSMENT`, `SCHOLARSHIP_AICTE`, `FACULTY_INFRA`, `ADMISSION_EXAM`, `OTHER_UNSURE`.
- `ActiveTab`: `home`, `dashboard`, `file-complaint`, `track`, `chat`, `discord`, `login` (default `dashboard`).
- `Language`: `en`, `hi`. Role view: `complainant` | `official`.

## 7. Conventions

- Frontend fields are **camelCase** (`currentStage`); backend JSON is **snake_case** (`current_stage`). A mapping layer is needed when connecting them (see `07-data-model.md`).
- Components are `React.FC<Props>` named exports; props interface declared just above.
- Navigation = `setActiveTab(tab)` passed down as a prop. No React Router.
- Text: `const t = translations[lang]` then `t.someKey`. Many strings in views are still hardcoded English.
- Icons: `lucide-react` only.
- Styling: CSS variables from `tokens.css`; utility classes (`flex`, `gap-3`, `grid-cols-2`, `btn btn-primary`, `card`, `status-chip chip-success`, `mono`) from `index.css`; component-specific CSS in inline `<style>` blocks.
- Accessibility hooks: `--font-scale` CSS var on `<html>`; `data-high-contrast="true"` attribute on `<html>`.
- User-facing "not implemented" actions use `alert(...)`.
- Timestamps in data are display strings ("Just now", "16 Aug 2026, 10:18 AM"), not ISO dates.

## 8. Where to change what

| Want to… | Edit |
|---|---|
| Add a tab/page | add to `ActiveTab` in `Navbar.tsx`, a nav button there, a render branch in `App.tsx` `<main>`, a new file in `views/` |
| Add a grievance category | `GrievanceCategory` in `types/index.ts`, `categoryOptions` in `FileComplaintView.tsx`, category cards in `LandingPage.tsx`, `translations.ts` |
| Add a lifecycle stage | `StageKey` in `types/index.ts`, `stagesList` in `TrackComplaintView.tsx`, dashboard filters, backend stage strings in `main.py` |
| Change seed data | `frontend/src/data/mockData.ts` and/or `backend/app/database.py` (keep them consistent) |
| Add an API route | `backend/main.py` + request model in `backend/app/schemas.py` |
| Add a translated string | both `en` and `hi` blocks in `locales/translations.ts` |
| Change brand colours | `tokens.css` |
