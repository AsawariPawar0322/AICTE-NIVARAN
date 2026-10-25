# CONTEXT — quick-reference fact sheet

Dense, fixed facts about the codebase so that a developer (or an AI assistant) can orient without re-reading every file. Keep this file accurate: update it in the same change as the code. Last verified: 2026-10-25 (after the Support Inbox work).

## 1. One-paragraph summary

AICTE NIVARAN is a hackathon prototype grievance portal. The **frontend** (React 19 + TypeScript + Vite, single page, no router) is fully self-contained: it runs on in-memory mock data from `frontend/src/data/mockData.ts` and never calls the backend. The **backend** (FastAPI, Python) exposes a working REST API over in-memory Python lists/dicts in `backend/app/database.py`. The two are **not connected yet**. Nothing persists across reloads/restarts. OTP, related-case matching and wizard evidence hashing are simulated. Complainant ↔ officer messaging is real within one browser session: officials use the **Support Inbox**, complainants the **Official Chatbox**, and both read the same per-complaint conversation; chat uploads use real SHA-256.

## 2. Commands

| Task | Command | Verified |
|---|---|---|
| Frontend dev | `cd frontend && npm install && npm run dev` → http://localhost:5173 | yes |
| Frontend build | `cd frontend && npm run build` (`tsc -b && vite build`) | yes, passes, ~463 KB JS |
| Frontend lint | `cd frontend && npm run lint` (oxlint) | runs; only warnings (mostly pre-existing unused imports) |
| Backend venv | `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt` | yes |
| Backend run | `cd backend && uvicorn main:app --reload --port 8000` → Swagger at http://localhost:8000/docs | yes |
| Tests | none in the repo | — |

`fastapi.testclient` does not work in the current venv (needs `httpx`); test the API with `curl` against a running server. The Support Inbox flow was verified with a headless-Chromium script (puppeteer-core, kept outside the repo): 41 checks passed.

## 3. File map (source only)

```
README.md                         Project pitch/overview (root)
CLAUDE.md                         AI-assistant instructions (read this file first, keep docs in sync)
backend/
  main.py              ~487 L     FastAPI app, CORS, 14 routes (9 original + 5 inbox/message), helpers _find_grievance/_new_id/_add_timeline_event
  app/database.py      ~234 L     Seed: mock_institutions(5), mock_grievances(1), mock_otp_sessions, mock_messages (thread for 84920)
  app/schemas.py        ~76 L     Pydantic request models incl. ChatMessageRequest, DocumentRequestIn, MarkReadRequest, FulfillDocumentRequest
  requirements.txt                fastapi, uvicorn, pydantic, python-multipart
  README.md                       Backend run notes
frontend/
  index.html                      Shell, Google Fonts (Noto Sans / Devanagari / Mono), favicon = /aicte-nivaran-logo.png
  src/main.tsx                    Mounts <App/> in StrictMode, imports index.css
  src/App.tsx          ~571 L     ALL global state + handlers + tab switching + footer
  src/types/index.ts   ~184 L     All TS types (incl. MessageKind, DocumentRequest, ConversationMap, NewTimelineEvent)
  src/data/mockData.ts ~638 L     All seed data incl. initialConversations (3 threads)
  src/lib/evidence.ts   ~32 L     sha256Hex (Web Crypto), toEvidenceFiles, formatFileSize
  src/locales/translations.ts ~252 L  EN/HI dictionary (`translations[lang].key`)
  src/tokens.css       ~118 L     Design tokens (:root vars), high-contrast override
  src/index.css        ~248 L     Global base + utility classes + .visually-hidden-input; imports tokens.css
  src/App.css                     UNUSED Vite template leftover (not imported)
  src/components/HeaderStrip.tsx ~514 L  Gov header: lang, font scale, contrast, role switch, login/logout
  src/components/Navbar.tsx      ~280 L  Tab bar; defines `ActiveTab`; role-aware tabs; OTP + unread badges
  src/components/chat/MessageThread.tsx ~362 L  Shared message list: bubbles, official remarks, doc-request cards (+upload), attachments, read receipts
  src/views/LandingPage.tsx          ~841 L  Home: institution search, voice search sim, categories, stats
  src/views/ComplainantDashboard.tsx ~590 L  Case list + filters
  src/views/FileComplaintView.tsx   ~1154 L  5-step complaint wizard
  src/views/TrackComplaintView.tsx   ~946 L  Case lookup, 6-stage tracker, OTP closure, escalation
  src/views/UserAdminChatView.tsx    ~401 L  Complainant side of the case conversation; attachments; answers doc requests
  src/views/AdminInboxView.tsx      ~1019 L  Official Support Inbox: list/filters/search, thread, composer (reply/request/clarify), case panel
  src/views/DiscordReplicaView.tsx  ~1042 L  Discord-style community hub with slash commands
  src/views/LoginView.tsx            ~628 L  Citizen OTP / official login / demo personas
```

Every component and view carries its own CSS in an inline `<style>{`...`}</style>` block at the bottom of its JSX (roughly the last 40–50% of each file). Logic is in the first ~120–220 lines of each view.

## 4. Key symbols and locations

| Symbol | Location |
|---|---|
| `makeId`, `withTimelineEvent` (module helpers) | `frontend/src/App.tsx:31, 33` |
| `App` (global state) | `App.tsx` |
| `selectedComplaint` derived from `selectedComplaintId` | `App.tsx:71` |
| `updateComplaint`, `appendMessage` (internal) | `App.tsx:86, 90` |
| `handleAddNewComplaint` (also opens a conversation) | `App.tsx:94` |
| `handleSelectComplaintForTracking` → `track`; `handleOpenChatWithComplaint` → `chat` | `App.tsx:110, 115` |
| `handleUpdateComplaintStage(caseId, stage, feedback?, event?)` | `App.tsx:120` |
| `handleSendMessage(complaintId, msg)` (attachments → evidence + timeline) | `App.tsx:144` |
| `handleOpenCaseFromInbox`, `handleSwitchRole` | `App.tsx:160, 166` |
| `handleRequestDocuments`, `handleAddClarification` | `App.tsx:175, 201` |
| `handleMarkThreadRead(complaintId, 'officer' \| 'complainant')` | `App.tsx:222` |
| `handleFulfillDocumentRequest` | `App.tsx:231` |
| `pendingOtpCount`, `officerUnreadCount`, `complainantUnreadCount`, `officialName` | `App.tsx:284–288` |
| `ActiveTab` type | `components/Navbar.tsx` |
| `MessageThread` | `components/chat/MessageThread.tsx:97` |
| `sha256Hex`, `toEvidenceFiles` | `lib/evidence.ts:8, 16` |
| Inbox `STAGE_LABELS`, `DOCUMENT_TYPES`, `QUICK_REPLIES` | `views/AdminInboxView.tsx:49–79` |
| Inbox `summaries` / `visible` (filter + sort) | `views/AdminInboxView.tsx:117, 138` |
| Inbox mark-read effect, `handleSendReply`, `handleSendClarification`, `handleSendRequest` | `views/AdminInboxView.tsx:163, 173, 190, 199` |
| Chat `handleSend`, `handleAttachFiles`, `handleUploadForRequest` | `views/UserAdminChatView.tsx:49, 70, 82` |
| `categoryOptions` (7 categories with labels/icons) | `views/FileComplaintView.tsx:78` |
| `handleFileUpload` (fake SHA-256 in wizard) | `views/FileComplaintView.tsx:90` |
| `handleSubmitFinal` (builds `Complaint`) | `views/FileComplaintView.tsx:117` |
| Step 5 related-case alert (hardcoded "2 similar cases") | `views/FileComplaintView.tsx:~648` |
| Tracker `activeCaseId` + derived `activeCase`; `handleLookup`, `handleVerifyOtp`, `handleEscalateToOmbudsman` | `views/TrackComplaintView.tsx:~45, 59, 70, 89` |
| `handleSearch`, `simulateVoiceSearch` | `views/LandingPage.tsx:43, 59` |
| `filteredComplaints` | `views/ComplainantDashboard.tsx:42` |
| Discord `/status`, `/helpline` commands | `views/DiscordReplicaView.tsx:56, 86` |
| `handleSendOtp`, `handleVerifyOtp`, `handleOfficialLogin`, `loginDemoPersona` | `views/LoginView.tsx:53, 63, 79, 90` |
| Backend original routes | `backend/main.py:39–301` |
| Backend inbox/message routes | `backend/main.py:335–448` |

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
| New case defaults | stage `REGISTERED`, stageNumber 1, SLA 72 h, officer Verma, relatedCaseCount = 3 if linked else 0, conversation opened with one system message |
| Officer name on inbox messages | logged-in official's name if `currentUser.role` contains "Official", else the case's `assignedOfficer.name` |
| Inbox entry | header role pill → "AICTE Official", or officer login / quick-login (lands on `admin-inbox`) |

Seed complaints (frontend `initialComplaints`):

| ID | Title (short) | Category | Institution | Complainant | Assigned officer | Stage |
|---|---|---|---|---|---|---|
| `AICTE-2026-GRV-84920` | Caution money / fee non-refund | FEES_REFUND | DTU | Aarav Sharma | Dr. Ramesh Chandra Verma | PENDING_OTP (5), SLA 18 h, related 3 |
| `AICTE-2026-GRV-79114` | Pragati scholarship delay | SCHOLARSHIP_AICTE | COEP Tech | Pooja Kulkarni | Mrs. S. Meenakshi | INVESTIGATION (3), SLA 34 h, related 1 |
| `AICTE-2026-GRV-65021` | Metallurgy lab equipment | FACULTY_INFRA | VJTI | Rohan Deshmukh | Prof. Anil Sahasrabudhe | RESOLVED (6) |

Seed conversations (`initialConversations`):

| Case | Messages | State at load |
|---|---|---|
| 84920 | `msg-1`…`msg-5` (system, 2 clarifications, 1 complainant, system ATR notice) | all read |
| 79114 | `msg-21` system, `msg-22` document request `docreq-79114-1` (PFMS Aadhaar-seeding confirmation, Bank passbook first page; due 28 Oct 2026; **pending**), `msg-23`, `msg-24` from Pooja | **2 unread for officer**, awaiting reply, docs pending |
| 65021 | `msg-31` complainant, `msg-32` officer, `msg-33` system closure note | all read |

Backend `mock_grievances` contains **only** `AICTE-2026-GRV-84920`; `mock_messages` contains only its 5-message thread.

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

## 6. Enums

- `StageKey`: `REGISTERED`(1) → `ALLOTTED`(2) → `INVESTIGATION`(3) → `RESOLUTION_PROPOSED`(4) → `PENDING_OTP`(5) → `RESOLVED`(6); side branch `ESCALATED`.
- `GrievanceCategory`: `FEES_REFUND`, `ANTI_RAGGING`, `SEXUAL_HARASSMENT`, `SCHOLARSHIP_AICTE`, `FACULTY_INFRA`, `ADMISSION_EXAM`, `OTHER_UNSURE`.
- `ActiveTab`: `home`, `dashboard`, `file-complaint`, `track`, `chat`, `discord`, `login`, `admin-inbox` (default `dashboard`).
- `MessageKind`: `text`, `clarification`, `document_request`, `document_submission`, `system`.
- `DocumentRequest.status`: `pending` | `fulfilled`. `ConversationReader`: `officer` | `complainant`.
- `Language`: `en`, `hi`. Role view: `complainant` | `official`.

## 7. Conventions

- Frontend fields are **camelCase** (`currentStage`); backend JSON is **snake_case** (`current_stage`). A mapping layer is needed when connecting them (see `07-data-model.md`).
- Components are `React.FC<Props>` named exports; props interface declared just above.
- Navigation = `setActiveTab(tab)` passed down as a prop. No React Router.
- Selected complaint is stored **by id** in `App`; views look the complaint up in `complaints` so they always see the latest timeline/evidence.
- Every state change that matters for accountability appends a `TimelineEvent` through `withTimelineEvent` (pass a `NewTimelineEvent`; `App` fills id/timestamp/stage).
- Messages carry `complaintId`; conversations live in `App.conversations[complaintId]`. Read state is two booleans per message (`readByOfficer`, `readByComplainant`); the sender's own flag starts `true`.
- Own messages are labelled "(You)" by `MessageThread`; store plain sender names in data.
- Text: `const t = translations[lang]` then `t.someKey`. Add both `en` and `hi`. Many older view strings are still hardcoded English.
- Icons: `lucide-react` only.
- Styling: CSS variables from `tokens.css`; utility classes (`flex`, `gap-3`, `grid-cols-2`, `btn btn-primary`, `card`, `status-chip chip-success`, `mono`) from `index.css`; component-specific CSS in inline `<style>` blocks. **`flex-wrap`, `items-end`, `btn-sm` are NOT global utilities** (used in markup but undefined unless a mounted view defines them); define them locally if needed. `textarea.input-control` has `min-height: 100px` globally.
- Accessibility hooks: `--font-scale` CSS var on `<html>`; `data-high-contrast="true"` attribute on `<html>`.
- User-facing "not implemented" actions use `alert(...)`.
- Timestamps in data are display strings ("Just now", "16 Aug 2026, 10:18 AM"), not ISO dates.

## 8. Where to change what

| Want to… | Edit |
|---|---|
| Add a tab/page | add to `ActiveTab` in `Navbar.tsx`, a nav button there (respect `isOfficial`), a render branch in `App.tsx` `<main>`, a new file in `views/` |
| Add a grievance category | `GrievanceCategory` in `types/index.ts`, `categoryOptions` in `FileComplaintView.tsx`, category cards in `LandingPage.tsx`, `translations.ts` |
| Add a lifecycle stage | `StageKey` in `types/index.ts`, `stagesList` in `TrackComplaintView.tsx`, `STAGE_LABELS` in `AdminInboxView.tsx`, dashboard filters, backend stage strings in `main.py` |
| Add a message type | `MessageKind` in `types/index.ts`, rendering in `MessageThread.tsx`, a handler in `App.tsx`, `ChatMessageRequest.kind` in `backend/app/schemas.py` |
| Add a requestable document type | `DOCUMENT_TYPES` in `AdminInboxView.tsx` |
| Change seed data | `frontend/src/data/mockData.ts` and/or `backend/app/database.py` (keep them consistent) |
| Add an API route | `backend/main.py` + request model in `backend/app/schemas.py` |
| Add a translated string | both `en` and `hi` blocks in `locales/translations.ts` |
| Change brand colours | `tokens.css` |
