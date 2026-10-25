# 05 · File reference

The role of every tracked file. Line counts are approximate.

## Repository root

| File | Role |
|---|---|
| `README.md` | Public project pitch: vision, challenge, capabilities, signature innovation, diagrams, stack, run instructions, privacy notes, roadmap, disclaimer. |
| `.gitignore` | Ignores `node_modules`, `dist`, logs, editor files. Does **not** ignore `backend/.venv/` or `__pycache__/`, which is why those show as untracked. |
| `CLAUDE.md` | Instructions for AI assistants working in this repo (read `docs/CONTEXT.md` first, keep docs updated). |
| `docs/` | This documentation set. See [README.md](README.md). |

## `backend/`

| File | Lines | Role |
|---|---|---|
| `main.py` | ~487 | The whole FastAPI app: app metadata, permissive CORS, and all 14 routes (root info, 3 auth, 4 grievance, 1 institutions, 5 inbox/messages). Helpers `_find_grievance`, `_new_id`, `_add_timeline_event`. `create_grievance` also opens a conversation. Unused imports: `Depends`, `Query`, `List`. |
| `app/database.py` | ~234 | In-memory "database": `mock_institutions` (5), `mock_grievances` (1 detailed case, `AICTE-2026-GRV-84920`), `mock_otp_sessions` (identifier → OTP), `mock_messages` (grievance id → message list; seeded with the 84920 thread). Mutated in place by routes. |
| `app/schemas.py` | ~76 | Pydantic v2 request models: `SendOtpRequest`, `VerifyOtpRequest`, `LoginRequest`, `EvidenceUploadItem`, `CreateGrievanceRequest`, `VerifyClosureOtpRequest`, `EscalateRequest`, `DocumentRequestIn`, `ChatMessageRequest`, `MarkReadRequest`, `FulfillDocumentRequest`. Imports `EmailStr` but does not use it. |
| `requirements.txt` | 4 | `fastapi`, `uvicorn`, `pydantic`, `python-multipart`. |
| `README.md` | 25 | Backend run instructions; lists intended modules (OTP gateway, citizen OTP closure, SHA-256 evidence, related-case finder, audit ledger). |
| `app/` has no `__init__.py` | — | Works as a namespace package when run from `backend/`. |

## `frontend/` — configuration

| File | Role |
|---|---|
| `package.json` | Package `sih`; scripts `dev`, `build` (`tsc -b && vite build`), `lint` (oxlint), `preview`; deps React 19, lucide-react. |
| `package-lock.json` | npm lockfile. |
| `vite.config.ts` | Vite with the React plugin; no proxy or aliases. |
| `tsconfig.json` | Project references to `tsconfig.app.json` and `tsconfig.node.json`. |
| `tsconfig.app.json` | App compile settings: ES2023, bundler resolution, `jsx: react-jsx`, `noEmit`, unused-locals checks **off**. |
| `tsconfig.node.json` | Settings for `vite.config.ts` only. |
| `.oxlintrc.json` | Lint rules: `react/rules-of-hooks` error, `react/only-export-components` warn. |
| `index.html` | HTML shell: title, meta description, favicon `/aicte-nivaran-logo.png`, Google Fonts (Noto Sans, Noto Sans Devanagari, Noto Sans Mono), `#root`, loads `/src/main.tsx`. |

## `frontend/public/` (served as-is at `/`)

| File | Role |
|---|---|
| `aicte-nivaran-logo.png` | Project logo; used as favicon and in footer and login. |
| `favicon.svg` | Vite template leftover, unused. |
| `icons.svg` | Vite template leftover, unused. |

## `frontend/src/` — entry, types, data

| File | Lines | Role |
|---|---|---|
| `main.tsx` | 10 | Entry point: imports `index.css`, renders `<App />` in `StrictMode`. |
| `App.tsx` | ~571 | Root component. Owns all global state (`complaints`, `selectedComplaintId`, `conversations`, role, language, …), accessibility side-effects, every cross-view handler (complaints, stage updates with timeline events, messages, mark-read, document requests and fulfilment, clarifications, role switch, open case from inbox), unread counts, the tab → view switch, and the government footer (with its inline CSS). Module helpers `makeId`, `withTimelineEvent`. |
| `types/index.ts` | ~184 | All TypeScript types: `GrievanceCategory`, `StageKey`, `EvidenceFile`, `TimelineEvent`, `NewTimelineEvent`, `Complaint`, `Institution`, `MessageKind`, `DocumentRequest`, `UserAdminMessage`, `ConversationMap`, `ConversationReader`, and Discord types. |
| `data/mockData.ts` | ~638 | All frontend seed data: `mockInstitutions` (5), `initialComplaints` (3), `initialConversations` (3 threads keyed by complaint id), `mockDiscordServers` (5), `mockDiscordChannels` (6), `mockDiscordMessages` (by channel), `mockDiscordMembers`. |
| `lib/evidence.ts` | ~32 | `sha256Hex(file)` (Web Crypto; throws outside https/localhost), `toEvidenceFiles(files)` → `EvidenceFile[]`, `formatFileSize(bytes)`. Used by the chat for attachments and document-request uploads. |
| `locales/translations.ts` | ~252 | `type Language = 'en' \| 'hi'` and `translations.en` / `translations.hi` dictionaries (~100 keys each, incl. the Support Inbox / conversation keys). |

## `frontend/src/` — styles

| File | Lines | Role |
|---|---|---|
| `tokens.css` | ~118 | Design tokens on `:root` (brand, neutral, status colours; spacing; radius; `--font-scale`) and the `[data-high-contrast="true"]` override. |
| `index.css` | ~248 | Imports `tokens.css`. Base `html`/`body`, skip link, `.mono`, `.visually-hidden-input` (hidden file inputs), `.container`, buttons, status chips, cards, inputs (`textarea.input-control` min-height 100px), utility classes, mobile breakpoint. |
| `App.css` | ~184 | Vite template leftover (`.counter`, `.hero`, …). **Not imported anywhere.** Safe to delete. |

## `frontend/src/assets/`

| File | Role |
|---|---|
| `aicte-nivaran-logo.png` | Copy of the logo; not imported (code uses `/aicte-nivaran-logo.png` from `public/`). |
| `hero.png`, `react.svg`, `vite.svg` | Vite template leftovers, unused. |

## `frontend/src/components/`

| File | Lines | Role |
|---|---|---|
| `HeaderStrip.tsx` | ~520 | Top government header: GoI/MoE/AICTE identity, helplines, skip link, screen-reader button, contrast toggle, font size buttons, EN/HI toggle, Complainant/Official role pill, current user + login/logout. Props: `lang, setLang, fontScale, setFontScale, highContrast, setHighContrast, activeRole, setActiveRole, currentUser, onOpenLogin, onLogout` (`App` passes `handleSwitchRole` as `setActiveRole`). |
| `Navbar.tsx` | ~349 | Exports `type ActiveTab`. Logo/Home, Citizen Portal (OTP badge, citizen sub-nav), Discord, Officer Chat (complainant unread badge), Administration (officer unread badge; skips login for a signed-in official). Props: `lang, activeTab, setActiveTab, pendingOtpCount, onOpenFloatingChat?, isLoggedIn?, activeRole?, isOfficialSignedIn?, officerUnreadCount?, complainantUnreadCount?`. |
| `Icon.tsx` | ~127 | `<Icon e="🔍" />`: maps emoji keys to Phosphor icons; unknown keys fall back to `Info`. |
| `FloatingOfficialChat.tsx` | ~708 | Complainant's floating Officer Chat (on every page): case picker, per-case `MessageThread`, quick chips, attachments (real SHA-256), document-request uploads; marks the thread read when open. Props: `lang, complaints, selectedComplaint, onSelectComplaint, conversations, unreadCount, onSendMessage, onFulfillDocumentRequest, onMarkThreadRead, isOpen, setIsOpen`. |
| `chat/MessageThread.tsx` | ~362 | Shared conversation renderer for both sides. Props: `lang, messages, viewer ('officer' \| 'complainant'), onUploadForRequest?, uploadingRequestId?, emptyText?`. Renders system notices, own/other bubbles with "(You)", Official Remark tag, attachments with hash, document-request cards (upload button for the complainant), read receipts; auto-scrolls; `aria-live="polite"`. |

## `frontend/src/views/`

Every view takes `lang` and (except `AdminInboxView`) `setActiveTab`, plus the props listed. `LoginView.tsx` was removed on main (replaced by `CitizenLoginView` and `AdminLoginView`). CSS sits in an inline `<style>` block after the JSX.

| File | Lines | Extra props | Role |
|---|---|---|---|
| `LandingPage.tsx` | ~1485 | `institutions`, `onSelectInstitutionForComplaint` | Home: mandate ticker, hero, institution search + simulated voice search, case-ID quick track, citizen/admin portal gateways, statistics. |
| `CitizenLoginView.tsx` | ~691 | `onLoginSuccess` | Citizen OTP login (Student/Faculty/Parent), demo login, guest tracking, link to admin login. |
| `AdminLoginView.tsx` | ~530 | `onLoginSuccess` | Official ID/PIN login and two demo personas (Verma, Rao). |
| `ComplainantDashboard.tsx` | ~857 | `complaints`, `onSelectComplaintForTracking`, `onOpenChatWithComplaint` | Complainant home: profile banner, action-required banner, metric/filter cards, complaint list with ATR preview and related-case pill. |
| `FileComplaintView.tsx` | ~1280 | `institutions`, `onAddNewComplaint`, `selectedInstitution` | 5-step filing wizard, simulated evidence hashing, related-case alert, success screen with case ID. |
| `TrackComplaintView.tsx` | ~1112 | `complaints`, `selectedComplaint`, `onUpdateComplaintStage`, `onOpenChatWithComplaint` | Case lookup, 6-stage stepper, OTP closure gate, closure certificate, escalation modal, audit-trail timeline, officer/proofs/institution side cards. Keeps only `activeCaseId` locally and reads the case from `complaints`. |
| `UserAdminChatView.tsx` | ~395 | `complaint`, `messages`, `onSendMessage`, `onFulfillDocumentRequest`, `onMarkThreadRead` | Full-page complainant chat at `#chat` (fallback to the floating chat): thread, quick prompts, attachments (staged chips, real SHA-256), document-request uploads; marks the thread read on open. |
| `AdminInboxView.tsx` | ~1025 | `complaints`, `conversations`, `selectedComplaintId`, `officialName`, `onSelectComplaint`, `onOpenFullCase`, `onSendMessage`, `onRequestDocuments`, `onAddClarification`, `onMarkThreadRead` (no `setActiveTab`) | Support Inbox: conversation list (filters, search, unread-first sort), thread, three-mode composer, case summary panel, responsive list/thread on mobile. `embedded` drops the page container; App renders it embedded inside `AdministrationView`. |
| `AdministrationView.tsx` | ~1303 | `complaints`, `institutions`, `onSelectComplaintForTracking`, `onOpenOfficialChat`, `onUpdateComplaintStage`, `messagesPanel?`, `officerUnreadCount?`, `initialAdminTab?` | Admin portal (`#admin`): sub-tabs Bureau Grievance Ledger (filters, action desk, notices, stage buttons), Intelligent Case Linker (hard-coded clusters), Institutional Compliance, 72h SLA & Escalation Radar, **Support Inbox** (`messagesPanel`). |
| `DiscordReplicaView.tsx` | ~1164 | — | Discord-style hub: servers, channels, messages with embeds, members, voice UI, `/status` and `/helpline` bot commands. |

## Not tracked (local only)

| Path | Note |
|---|---|
| `backend/.venv/` | Local Python virtualenv. Should be added to `.gitignore`. |
| `backend/__pycache__/`, `backend/app/__pycache__/` | Python bytecode. Three `*.cpython-310.pyc` files were **committed on main** (`ee6cebb`); they should be removed from git and added to `.gitignore`. |
| `frontend/node_modules/`, `frontend/dist/` | Ignored. |
