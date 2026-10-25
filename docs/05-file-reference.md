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
| `main.py` | ~296 | The whole FastAPI app: app metadata, permissive CORS, and all 9 routes (root info, 3 auth, 4 grievance, 1 institutions). Imports seed data and schemas from `app/`. Unused imports: `Depends`, `Query`, `List`, `Dict`, `Any`, `ChatMessageRequest`. |
| `app/database.py` | ~173 | In-memory "database": `mock_institutions` (5), `mock_grievances` (1 detailed case, `AICTE-2026-GRV-84920`), `mock_otp_sessions` (identifier → OTP). Mutated in place by routes. |
| `app/schemas.py` | ~63 | Pydantic v2 request models: `SendOtpRequest`, `VerifyOtpRequest`, `LoginRequest`, `EvidenceUploadItem`, `CreateGrievanceRequest`, `VerifyClosureOtpRequest`, `EscalateRequest`, `ChatMessageRequest` (unused). Imports `EmailStr` but does not use it. |
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
| `App.tsx` | ~363 | Root component. Owns all global state, accessibility side-effects, the cross-view handlers (`handleAddNewComplaint`, `handleSelectComplaintForTracking`, `handleOpenChatWithComplaint`, `handleUpdateComplaintStage`, `handleSendMessage`), tab → view switch, and the government footer (with its inline CSS). |
| `types/index.ts` | ~151 | All TypeScript types: `GrievanceCategory`, `StageKey`, `EvidenceFile`, `TimelineEvent`, `Complaint`, `Institution`, `UserAdminMessage`, and Discord types (`DiscordServer`, `DiscordChannel`, `DiscordMessage`, `DiscordMember`). |
| `data/mockData.ts` | ~527 | All frontend seed data: `mockInstitutions` (5), `initialComplaints` (3), `initialChatMessages` (5), `mockDiscordServers` (5), `mockDiscordChannels` (6), `mockDiscordMessages` (by channel), `mockDiscordMembers`. |
| `locales/translations.ts` | ~172 | `type Language = 'en' \| 'hi'` and `translations.en` / `translations.hi` dictionaries (~60 keys each). |

## `frontend/src/` — styles

| File | Lines | Role |
|---|---|---|
| `tokens.css` | ~118 | Design tokens on `:root` (brand, neutral, status colours; spacing; radius; `--font-scale`) and the `[data-high-contrast="true"]` override. |
| `index.css` | ~238 | Imports `tokens.css`. Base `html`/`body`, skip link, `.container`, buttons, status chips, cards, inputs, utility classes, mobile breakpoint. |
| `App.css` | ~184 | Vite template leftover (`.counter`, `.hero`, …). **Not imported anywhere.** Safe to delete. |

## `frontend/src/assets/`

| File | Role |
|---|---|
| `aicte-nivaran-logo.png` | Copy of the logo; not imported (code uses `/aicte-nivaran-logo.png` from `public/`). |
| `hero.png`, `react.svg`, `vite.svg` | Vite template leftovers, unused. |

## `frontend/src/components/`

| File | Lines | Role |
|---|---|---|
| `HeaderStrip.tsx` | ~517 | Top government header: GoI/MoE/AICTE identity, helplines, skip link, screen-reader button, contrast toggle, font size buttons, EN/HI toggle, Complainant/Official role pill, current user + login/logout. Props: `lang, setLang, fontScale, setFontScale, highContrast, setHighContrast, activeRole, setActiveRole, currentUser, onOpenLogin, onLogout`. |
| `Navbar.tsx` | ~240 | Primary tab bar. Exports `type ActiveTab`. Shows `pendingOtpCount` badge on Track. Props: `lang, activeTab, setActiveTab, pendingOtpCount`. |

## `frontend/src/views/`

Every view takes `lang` and `setActiveTab` plus the props listed. CSS sits in an inline `<style>` block after the JSX.

| File | Lines | Extra props | Role |
|---|---|---|---|
| `LandingPage.tsx` | ~841 | `institutions`, `onSelectInstitutionForComplaint` | Home page: directive banner, hero, institution search + simulated voice search, File/Track cards, 3-step explainer, 6 category desks, statistics strip. |
| `ComplainantDashboard.tsx` | ~590 | `complaints`, `onSelectComplaintForTracking`, `onOpenChatWithComplaint` | Complainant home: profile banner, action-required banner, metric/filter cards, complaint list with ATR preview and related-case pill. |
| `FileComplaintView.tsx` | ~1154 | `institutions`, `onAddNewComplaint`, `selectedInstitution` | 5-step filing wizard, simulated evidence hashing, related-case alert, success screen with case ID. |
| `TrackComplaintView.tsx` | ~961 | `complaints`, `selectedComplaint`, `onUpdateComplaintStage`, `onOpenChatWithComplaint` | Case lookup, 6-stage stepper, OTP closure gate, closure certificate, escalation modal, audit-trail timeline, officer/proofs/institution side cards. |
| `UserAdminChatView.tsx` | ~483 | `complaint`, `messages`, `onSendMessage` | Case chat with the assigned officer; quick prompts; simulated officer replies. |
| `DiscordReplicaView.tsx` | ~1042 | — | Discord-style hub: servers, channels, messages with embeds, members, voice UI, `/status` and `/helpline` bot commands. |
| `LoginView.tsx` | ~628 | `onLoginSuccess` | Citizen OTP login, official ID/PIN login, guest tracking shortcut, 3 one-click demo personas. |

## Not tracked (local only)

| Path | Note |
|---|---|
| `backend/.venv/` | Local Python virtualenv. Should be added to `.gitignore`. |
| `backend/__pycache__/`, `backend/app/__pycache__/` | Python bytecode. Should be added to `.gitignore`. |
| `frontend/node_modules/`, `frontend/dist/` | Ignored. |
