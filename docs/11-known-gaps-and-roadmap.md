# 11 · Known gaps and roadmap

Found while reviewing the code on 2026-10-25. Remove an entry once it is fixed and note it in [CHANGELOG.md](CHANGELOG.md). Fixed so far: B1 (stage-change timeline events lost), B2 (stale tracker case), B7 (one global chat list) — all with the Support Inbox work.

## Bugs

| # | Where | Problem | Fix |
|---|---|---|---|
| B3 | `ComplainantDashboard` | Profile banner and "1 Grievance Awaiting" text are hardcoded (Aarav Sharma, DTU, "1"). | Pass `currentUser` as a prop; use `pendingOtpCases.length`. |
| B4 | `LoginView` guest tracking | The typed case ID is not passed on; it only switches to the tracker. | Lift it to `App` (e.g. set `selectedComplaint` by ID) before switching tabs. |
| B5 | `LoginView.handleVerifyOtp` | Any 6-character input is accepted as OTP. | Accept only the expected OTP (or call `/api/auth/verify-otp`). |
| B6 | `App.tsx` chat tab | Choosing Chat with no `selectedComplaint` renders an empty page. | Show a "pick a case" prompt. |
| B8 | `DiscordReplicaView` | Selecting a server does not change the channel list. | Filter channels by `serverId`. |
| B9 | Backend `verify-closure-otp` / `escalate` | No check that the case is in `PENDING_OTP`. | Return 409 otherwise. |
| B10 | Backend `send-otp` | `expires_in_seconds` is reported but never enforced; OTP is returned in the response. | Store expiry; remove the hint outside demo mode. |
| B11 | `AdminInboxView` | Officials cannot attach files to their own messages (only complainants can). | Reuse the chat's attachment input in the inbox composer. |
| B12 | `AdminInboxView` / backend `/api/inbox` | Every official sees every conversation; no bureau filter, no ICC confidentiality. | Filter by assigned bureau once roles exist (Phase 4). |
| B13 | `ComplainantDashboard` | Case cards don't show per-case unread message counts (only the navbar total). | Pass `conversations` and show a badge on the Chat button. |

## Simulated features (must become real before being claimed)

| Feature | Current behaviour | Plan step |
|---|---|---|
| SHA-256 evidence hash (filing wizard only) | Random hex; chat uploads are already real | [08 · 1.1](08-implementation-steps.md#phase-1--make-the-claims-true-highest-priority) |
| Related Case Finder | Fixed "2 similar cases", count = 3 | 08 · 1.2, 2.5, 3.4 |
| OTP delivery | Fixed `849210` | 08 · 4.2 |
| Auth tokens | Placeholder strings, never verified | 08 · 4.2 |
| Voice search | Fills fixed text | Web Speech API |
| Statistics strip | Static numbers | 08 · 5.1 |
| Certificate download | `alert` | Generate PDF |
| Accessibility compliance badge | Claimed, not audited | 08 · 5.4 |

## Missing features

- Official / bureau triage dashboard and nodal-officer ATR screen
- Officer actions: allot, transfer, remark, serve notice
- Bureau / region / institution-wise reports
- Live SLA deadlines and automatic escalation
- Persistence (database) and file storage
- Role-based access control
- URL routing / deep links
- Full Hindi coverage

## Tech debt

| Item | Note |
|---|---|
| Frontend ↔ backend not connected | Duplicate seed data; field naming differs (camelCase vs snake_case) |
| No tests | Neither frontend nor backend |
| Inline `<style>` blocks | 40–50% of each view file is CSS; hard to share styles |
| Unused files | `src/App.css`, `src/assets/{hero.png,react.svg,vite.svg,aicte-nivaran-logo.png}`, `public/{favicon.svg,icons.svg}` |
| Unused backend imports | `Depends`, `Query`, `List` in `main.py`; `EmailStr`, `Dict`, `Any` in `schemas.py` |
| Undefined utility classes | `flex-wrap`, `items-end`, `btn-sm` are used in markup across views but not defined in `index.css` (they only work where a mounted view defines them). New inbox/chat code defines scoped versions. |
| Unused CSS | `.nav-badge-online` in `Navbar.tsx` (the "Live" chip was replaced by unread counts) |
| Message timestamps | Display strings ("Just now"), so the inbox cannot sort by recency; it sorts unread → awaiting reply → seed order |
| `.gitignore` | Missing `backend/.venv/`, `__pycache__/` |
| Hardcoded demo values | Prefilled form fields and default logged-in user in `App.tsx` |
| CORS | `allow_origins=["*"]` with credentials |
| Package name | `frontend/package.json` name is `sih` |

## Roadmap

Ordered phases are in [08-implementation-steps.md](08-implementation-steps.md#part-b--plan-for-the-remaining-work):

1. Make the claims true (real hashing, rule-based matching, state bugs)
2. Connect frontend and backend
3. Official side (dashboard, actions, ATR, link review)
4. Persistence and security
5. Reporting, tests, accessibility audit, polish
