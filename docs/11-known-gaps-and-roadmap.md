# 11 · Known gaps and roadmap

Found while reviewing the code on 2026-10-25. Remove an entry once it is fixed and note it in [CHANGELOG.md](CHANGELOG.md).

## Bugs

| # | Where | Problem | Fix |
|---|---|---|---|
| B1 | `TrackComplaintView.handleEscalateToOmbudsman` + `App.handleUpdateComplaintStage` | The escalation timeline event is added only to the view's local `activeCase`. `App.complaints` gets the new stage but not the event, so it disappears after leaving the tab. Same for the OTP-closure event, which is never added to the timeline at all. | Let `handleUpdateComplaintStage` accept a `TimelineEvent` and append it to the stored complaint. |
| B2 | `TrackComplaintView` | `activeCase` is initialised from props once; if `complaints` changes while the view is open it can go stale. | Store only the selected ID and derive the case from `complaints`. |
| B3 | `ComplainantDashboard` | Profile banner and "1 Grievance Awaiting" text are hardcoded (Aarav Sharma, DTU, "1"). | Pass `currentUser` as a prop; use `pendingOtpCases.length`. |
| B4 | `LoginView` guest tracking | The typed case ID is not passed on; it only switches to the tracker. | Lift it to `App` (e.g. set `selectedComplaint` by ID) before switching tabs. |
| B5 | `LoginView.handleVerifyOtp` | Any 6-character input is accepted as OTP. | Accept only the expected OTP (or call `/api/auth/verify-otp`). |
| B6 | `App.tsx` chat tab | Choosing Chat with no `selectedComplaint` renders an empty page. | Show a "pick a case" prompt. |
| B7 | `UserAdminChatView` | Chat messages are one global list for all cases. | Key messages by complaint ID. |
| B8 | `DiscordReplicaView` | Selecting a server does not change the channel list. | Filter channels by `serverId`. |
| B9 | Backend `verify-closure-otp` / `escalate` | No check that the case is in `PENDING_OTP`. | Return 409 otherwise. |
| B10 | Backend `send-otp` | `expires_in_seconds` is reported but never enforced; OTP is returned in the response. | Store expiry; remove the hint outside demo mode. |

## Simulated features (must become real before being claimed)

| Feature | Current behaviour | Plan step |
|---|---|---|
| SHA-256 evidence hash | Random hex | [08 · 1.1](08-implementation-steps.md#phase-1--make-the-claims-true-highest-priority) |
| Related Case Finder | Fixed "2 similar cases", count = 3 | 08 · 1.2, 2.5, 3.4 |
| OTP delivery | Fixed `849210` | 08 · 4.2 |
| Auth tokens | Placeholder strings, never verified | 08 · 4.2 |
| Officer chat | Random canned reply | 08 · 3.2 |
| Voice search | Fills fixed text | Web Speech API |
| Statistics strip | Static numbers | 08 · 5.1 |
| Certificate download | `alert` | Generate PDF |
| Accessibility compliance badge | Claimed, not audited | 08 · 5.4 |

## Missing features

- Admin Messages / Support Inbox linked to complaints (planned: [12-admin-support-inbox.md](12-admin-support-inbox.md); also fixes B7)
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
| Unused backend imports | `Depends`, `Query`, `List`, `Dict`, `Any`, `ChatMessageRequest` in `main.py`; `EmailStr`, `Dict`, `Any` in `schemas.py` |
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
