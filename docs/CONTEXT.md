# CONTEXT — quick-reference fact sheet

Dense, fixed facts about the codebase so that a developer (or an AI assistant) can orient without re-reading every file. Keep this file accurate: update it in the same change as the code. Last verified: 2026-10-25 (after merging main's UI rework, commit `ee6cebb`, into the Support Inbox branch).

## 1. One-paragraph summary

AICTE NIVARAN is a hackathon prototype grievance portal. The **frontend** (React 19 + TypeScript + Vite, single page) routes with **URL hashes** (`#home`, `#admin`, …) and is fully self-contained: it runs on in-memory mock data from `frontend/src/data/mockData.ts` and never calls the backend. The **backend** (FastAPI, Python) exposes a working REST API over in-memory Python lists/dicts in `backend/app/database.py`. The two are **not connected yet**. Nothing persists across reloads/restarts. The UI has two areas: the **Citizen Portal** (dashboard, filing wizard, tracker, floating *Officer Chat*) and the **Administration portal** (ledger, case linker, compliance, SLA radar, **Support Inbox**). Complainant ↔ officer messaging is real within one browser session and linked per complaint; chat uploads use real SHA-256. OTP, related-case matching, wizard evidence hashing and the admin "case clusters" are simulated.

## 2. Commands

| Task | Command | Verified |
|---|---|---|
| Frontend dev | `cd frontend && npm install && npm run dev` → http://localhost:5173 | yes |
| Frontend build | `cd frontend && npm run build` (`tsc -b && vite build`) | yes, passes after the merge |
| Frontend lint | `cd frontend && npm run lint` (oxlint) | runs; only warnings (mostly pre-existing unused imports) |
| Backend venv | `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt` | yes |
| Backend run | `cd backend && uvicorn main:app --reload --port 8000` → Swagger at http://localhost:8000/docs | yes |
| Tests | none in the repo | — |

`fastapi.testclient` does not work in the current venv (needs `httpx`); test the API with `curl` against a running server. The Support Inbox flow was verified with a headless-Chromium script (puppeteer-core, kept outside the repo): 41 checks before the merge with main, 36 checks on the merged UI.

## 3. File map (source only)

```
README.md                         Project pitch/overview (root)
CLAUDE.md                         AI-assistant instructions (read this file first, keep docs in sync)
backend/
  main.py              ~487 L     FastAPI app, CORS, 14 routes (9 original + 5 inbox/message), helpers _find_grievance/_new_id/_add_timeline_event
  app/database.py      ~234 L     Seed: mock_institutions(5), mock_grievances(1), mock_otp_sessions, mock_messages (thread for 84920)
  app/schemas.py        ~76 L     Pydantic request models incl. ChatMessageRequest, DocumentRequestIn, MarkReadRequest, FulfillDocumentRequest
  __pycache__/*.pyc               Committed on main by mistake (bytecode) — see 11-known-gaps
  requirements.txt                fastapi, uvicorn, pydantic, python-multipart
frontend/
  package.json                    deps: react 19, recharts, react-router-dom, tailwindcss, postcss, autoprefixer, lucide-react, @phosphor-icons/react
  tailwind.config.js              Tailwind v3 config with preflight: false
  postcss.config.js               PostCSS plugins for Tailwind
  index.html                      Shell, Google Fonts (Noto Sans / Devanagari / Mono), favicon = /aicte-nivaran-logo.png
  src/main.tsx                    Mounts <App/> in StrictMode, imports index.css
  src/App.tsx          ~674 L     ALL global state + handlers + hash routing + mounts <AdminPortal /> on #admin + footer
  src/types/index.ts   ~184 L     All TS types (incl. MessageKind, DocumentRequest, ConversationMap, NewTimelineEvent)
  src/data/mockData.ts ~638 L     All seed data incl. initialConversations (3 threads)
  src/lib/evidence.ts   ~32 L     sha256Hex (Web Crypto), toEvidenceFiles, formatFileSize
  src/locales/translations.ts ~252 L  EN/HI dictionary (`translations[lang].key`)
  src/tokens.css, src/index.css   Design tokens; base + utilities + tailwind directives
  src/App.css                     UNUSED Vite template leftover (not imported)
  src/components/HeaderStrip.tsx ~520 L  Gov header: lang, font scale, contrast, role switch, login/logout, logo → home
  src/components/Navbar.tsx      ~349 L  Defines `ActiveTab`; Home / Citizen Portal / Discord + Officer Chat / Administration buttons; citizen sub-nav; OTP + unread badges
  src/components/Icon.tsx        ~127 L  <Icon e="🔍"/> → Phosphor icon by emoji key (unknown keys fall back to Info)
  src/components/FloatingOfficialChat.tsx ~708 L  Complainant's floating Officer Chat: case picker, per-case thread, attachments, doc-request uploads
  src/components/chat/MessageThread.tsx ~362 L  Shared message list: bubbles, official remarks, doc-request cards (+upload), attachments, read receipts
  src/views/LandingPage.tsx         ~1485 L  Home: hero, institution search + voice sim, portal gateways, stats
  src/views/CitizenLoginView.tsx     ~691 L  Citizen OTP login, demo login, guest tracking, link to admin login
  src/views/AdminLoginView.tsx       ~530 L  Official ID/PIN login + 2 demo personas (Verma, Rao)
  src/views/ComplainantDashboard.tsx ~857 L  "My Grievances" list + metric filters
  src/views/FileComplaintView.tsx   ~1280 L  5-step complaint wizard
  src/views/TrackComplaintView.tsx  ~1112 L  Case lookup, 6-stage tracker, OTP closure, escalation, audit trail, evidence
  src/views/UserAdminChatView.tsx    ~395 L  Full-page complainant chat (#chat fallback); same thread as the floating chat
  src/views/DiscordReplicaView.tsx  ~1164 L  Discord-style community hub with slash commands
  src/admin/
    App.tsx                       AdminPortal entry with MemoryRouter, code-split Suspense, and 15 routes
    components/                   AdminShell, Sidebar, TopBar (with "Citizen Portal" return button), GovFooter, GovLogos
    context/AppContext.tsx        Official session context (activeOfficer, toasts, language, contrast)
    design-system/                Reusable admin primitives (Button, Modal, FormControls, StatusChip, ToastContainer)
    mock/data.ts                  Admin seed cases (synced with DTU inst-1 and AICTE-2026-GRV-84920)
    services/api.ts               Administrative client service with localStorage caching
    pages/                        15 lazy-loaded admin modules (Dashboard, AllCases, CaseDetail, VerificationQueue,
                                  InstitutionDirectory, OriginExplorer, RelatedCasesCoordination, ResolutionProofReview,
                                  StageTracking, Messages, ComplaintPoolVoting, ReportsAnalytics, AdminSettings,
                                  AuditLogs, ApiSpecViewer)
```

Every component and view carries its own CSS in an inline `<style>{`...`}</style>` block at the bottom of its JSX. Logic is in the first ~100–220 lines of each view.

## 4. Key symbols and locations

| Symbol | Location |
|---|---|
| `VALID_TABS` (hash routes), `makeId`, `withTimelineEvent` | `frontend/src/App.tsx:34, 39, 41` |
| Hash routing: `hashchange` listener, `handleTabChange(tab)` (sets hash + scrolls top) | `App.tsx:65, 73` |
| `selectedComplaint` derived from `selectedComplaintId` | `App.tsx:102` |
| `updateComplaint`, `appendMessage` (internal) | `App.tsx:118, 122` |
| `handleAddNewComplaint` (also opens a conversation) | `App.tsx:126` |
| `handleUpdateComplaintStage(caseId, stage, feedback?, event?)` | `App.tsx:142` |
| `handleSendMessage(complaintId, msg)` (attachments → evidence + timeline) | `App.tsx:166` |
| `handleRequestDocuments`, `handleAddClarification` | `App.tsx:182, 208` |
| `handleMarkThreadRead(complaintId, 'officer' \| 'complainant')` | `App.tsx:229` |
| `handleFulfillDocumentRequest` | `App.tsx:238` |
| `handleOpenChatWithComplaint` (select + open floating chat), `handleOpenCaseFromInbox` (select + `#track`) | `App.tsx:291, 296` |
| `handleLoginSuccess` (Official/Nodal → role `official`) | `App.tsx:301` |
| `pendingOtpCount`, `officerUnreadCount`, `complainantUnreadCount`, `officialName` | `App.tsx:310–316` |
| `ActiveTab` type | `components/Navbar.tsx` |
| `FloatingOfficialChat` (`sendMessage`, `handleAttach`, `handleUploadForRequest`) | `components/FloatingOfficialChat.tsx:23, 53, 76, 88` |
| `MessageThread` | `components/chat/MessageThread.tsx:97` |
| `sha256Hex`, `toEvidenceFiles` | `lib/evidence.ts:8, 16` |
| `AdminTab` type, `openMessagesFor`, `handleConfirmLink`, `handleIssueNotice` | `views/AdministrationView.tsx:41, 87, 92, 101` |
| Inbox `handleSendReply`, `handleSendClarification`, `handleSendRequest` | `views/AdminInboxView.tsx:176, 193, 202` |
| Tracker `activeCaseId` + derived `activeCase`; `handleLookup`, `handleVerifyOtp`, `handleEscalate` | `views/TrackComplaintView.tsx:~35, 45, 57, 73` |
| `handleSendOtp`, `handleVerifyOtp`, `handleDemoLogin` (citizen) | `views/CitizenLoginView.tsx:53, 60, 76` |
| `handleLogin`, `handleDemoPersona` (admin) | `views/AdminLoginView.tsx:53, 70` |
| `handleFileUpload` (fake SHA-256 in wizard), `handleSubmitFinal` | `views/FileComplaintView.tsx` |
| Backend original routes / inbox-message routes | `backend/main.py:39–301` / `335–448` |

## 5. Fixed demo data (do not need to search for these)

| Item | Value |
|---|---|
| Universal demo OTP | `849210` (login and case closure, both FE and BE) |
| FE login OTP rule | `CitizenLoginView` accepts `849210` **or any 6-character string** |
| BE deterministic OTP trigger | identifier containing `98712` or `aarav` |
| Default logged-in user | Aarav Sharma · Student · DTU · Roll `2024-CS-108` · `+91 98712 34567` · `aarav.sharma@example.com` |
| Demo official | Dr. Ramesh Chandra Verma · role `AICTE Official` · Director, PGRC · ID `PGRC-DIR-0842` (AdminLoginView persona) |
| Demo nodal officer | Prof. K. S. Rao · role `Institute Nodal Officer` · Registrar, DTU · ID `DTU-NODAL-14` (AdminLoginView persona) |
| Case ID format | `AICTE-2026-GRV-NNNNN` (random 5 digits) |
| Certificate ref format (BE) | `CERT-NIVARAN-2026-<last 5 of case id>` |
| New case defaults | stage `REGISTERED`, stageNumber 1, SLA 72 h, officer Verma, relatedCaseCount = 3 if linked else 0, conversation opened with one system message |
| Officer name on inbox messages | signed-in user's name if `currentUser.role` contains "Official" or "Nodal", else the case's `assignedOfficer.name` |
| Default tab | `#home` (no hash → `#home`) |
| Inbox entry | Administration → admin login (persona *Dr. Ramesh Chandra Verma*) → **Support Inbox** sub-tab; or `#admin-inbox` (opens Administration on that sub-tab). Signed-in officials skip the login screen. |
| Complainant chat entry | Navbar **Officer Chat** button (floating window), dashboard/tracker chat buttons, or `#chat` (full page) |

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
- `ActiveTab` (= `VALID_TABS`): `home`, `citizen`, `admin`, `dashboard`, `file-complaint`, `track`, `chat`, `discord`, `login`, `citizen-login`, `admin-login`, `admin-inbox` (default `home`). `citizen` = `dashboard`; `login` = `citizen-login`; `admin-inbox` = `admin` opened on the Support Inbox sub-tab.
- `AdminTab` (Administration sub-tabs): `ledger`, `clusters`, `institutions`, `escalations`, `messages`.
- `MessageKind`: `text`, `clarification`, `document_request`, `document_submission`, `system`.
- `DocumentRequest.status`: `pending` | `fulfilled`. `ConversationReader`: `officer` | `complainant`.
- `Language`: `en`, `hi`. Role view: `complainant` | `official`.

## 7. Conventions

- Frontend fields are **camelCase** (`currentStage`); backend JSON is **snake_case** (`current_stage`). A mapping layer is needed when connecting them (see `07-data-model.md`).
- Components are `React.FC<Props>` named exports; props interface declared just above.
- Navigation = `setActiveTab(tab)` passed down as a prop; in `App` it is `handleTabChange`, which also writes `location.hash`. Back/forward and deep links work through `hashchange`. No React Router.
- Selected complaint is stored **by id** in `App`; views look the complaint up in `complaints` so they always see the latest timeline/evidence.
- Every state change that matters for accountability appends a `TimelineEvent` through `withTimelineEvent` (pass a `NewTimelineEvent`; `App` fills id/timestamp/stage).
- Messages carry `complaintId`; conversations live in `App.conversations[complaintId]`. Read state is two booleans per message (`readByOfficer`, `readByComplainant`); the sender's own flag starts `true`.
- Own messages are labelled "(You)" by `MessageThread`; store plain sender names in data.
- Text: `const t = translations[lang]` then `t.someKey`. Add both `en` and `hi`. Many older view strings are still hardcoded English.
- Icons: `<Icon e="emoji" />` from `components/Icon.tsx` (Phosphor) in main's newer code, `@phosphor-icons/react` directly, and `lucide-react` in older/inbox code. Unknown `e` keys render a generic Info icon.
- Styling: CSS variables from `tokens.css`; utility classes (`flex`, `gap-3`, `grid-cols-2`, `btn btn-primary`, `card`, `status-chip chip-success`, `mono`) from `index.css`; component-specific CSS in inline `<style>` blocks. **`flex-wrap`, `items-end`, `btn-sm` are NOT global utilities** (used in markup but undefined unless a mounted view defines them); define them locally if needed. `textarea.input-control` has `min-height: 100px` globally.
- Accessibility hooks: `--font-scale` CSS var on `<html>`; `data-high-contrast="true"` attribute on `<html>`.
- User-facing "not implemented" actions use `alert(...)`.
- Timestamps in data are display strings ("Just now", "16 Aug 2026, 10:18 AM"), not ISO dates.

## 8. Where to change what

| Want to… | Edit |
|---|---|
| Add a tab/page | add to `ActiveTab` in `Navbar.tsx` **and** `VALID_TABS` in `App.tsx` (else the hash is ignored), a nav button, a render branch in `App.tsx` `<main>`, a new file in `views/` |
| Add an Administration sub-tab | `AdminTab` + sub-nav button + render branch in `views/AdministrationView.tsx` |
| Add a grievance category | `GrievanceCategory` in `types/index.ts`, `categoryOptions` in `FileComplaintView.tsx`, category cards in `LandingPage.tsx`, `translations.ts` |
| Add a lifecycle stage | `StageKey` in `types/index.ts`, `STAGES` in `TrackComplaintView.tsx`, `STAGE_LABELS` in `AdminInboxView.tsx`, dashboard filters, backend stage strings in `main.py` |
| Add a message type | `MessageKind` in `types/index.ts`, rendering in `MessageThread.tsx`, a handler in `App.tsx`, `ChatMessageRequest.kind` in `backend/app/schemas.py` |
| Add a requestable document type | `DOCUMENT_TYPES` in `AdminInboxView.tsx` |
| Change seed data | `frontend/src/data/mockData.ts` and/or `backend/app/database.py` (keep them consistent) |
| Add an API route | `backend/main.py` + request model in `backend/app/schemas.py` |
| Add a translated string | both `en` and `hi` blocks in `locales/translations.ts` |
| Change brand colours | `tokens.css` |
