# 11 · Known gaps and roadmap

Found while reviewing the code on 2026-10-25. Remove an entry once it is fixed and note it in [CHANGELOG.md](CHANGELOG.md). Fixed so far: B1 (stage-change timeline events lost), B2 (stale tracker case), B7 (one global chat list) — all with the Support Inbox work.

## Bugs

| # | Where | Problem | Fix |
|---|---|---|---|
| B3 | `ComplainantDashboard` | Profile banner is hardcoded (Aarav Sharma). (The OTP count is now computed.) | Pass `currentUser` as a prop. |
| B4 | `CitizenLoginView` guest tracking | The typed case ID is not passed on; it only switches to the tracker. | Lift it to `App` (e.g. set `selectedComplaint` by ID) before switching tabs. |
| B5 | `CitizenLoginView.handleVerifyOtp` | Any 6-character input is accepted as OTP. | Accept only the expected OTP (or call `/api/auth/verify-otp`). |
| B6 | `App.tsx` chat tab | Choosing Chat with no `selectedComplaint` renders an empty page. | Show a "pick a case" prompt. |
| B8 | `DiscordReplicaView` | Selecting a server does not change the channel list. | Filter channels by `serverId`. |
| B9 | Backend `verify-closure-otp` / `escalate` | No check that the case is in `PENDING_OTP`. | Return 409 otherwise. |
| B10 | Backend `send-otp` | `expires_in_seconds` is reported but never enforced; OTP is returned in the response. | Store expiry; remove the hint outside demo mode. |
| B11 | `AdminInboxView` | Officials cannot attach files to their own messages (only complainants can). | Reuse the chat's attachment input in the inbox composer. |
| B12 | `AdminInboxView` / backend `/api/inbox` | Every official sees every conversation; no bureau filter, no ICC confidentiality. | Filter by assigned bureau once roles exist (Phase 4). |
| B13 | `ComplainantDashboard` | Case cards don't show per-case unread message counts (only the navbar total). | Pass `conversations` and show a badge on the Chat button. |
| B14 | `AdministrationView` stage buttons | **"Confirm Resolved" lets an official close a case without the citizen OTP**, contradicting the core no-unilateral-closure rule (F9). "Mark Investigating", "Dispatch Citizen OTP" and "Dispatch Notice" also change the stage without a timeline event. | Remove/disable direct RESOLVED (or require the OTP flow); pass a `NewTimelineEvent` to `onUpdateComplaintStage` for every admin action. |
| B15 | `AdministrationView` case linker | Clusters and the linked case `AICTE-2026-GRV-84931` are hard-coded; 84931 does not exist in the data, and confirmed links live only in the view's local state. | Compute from `complaints`; store links in `App` (see 08 · 1.2, 3.4). |
| B16 | `FloatingOfficialChat` | Several icons use keys like `e="??"` (looks like lost emoji encoding) and render a generic Info icon; the header always says "Director, PGRC · AICTE Head Office" even for other officers. | Use real keys from `Icon.tsx`; show `assignedOfficer.designation`. |
| B17 | `AdministrationView` header | "Officer on Duty: Dr. Ramesh Chandra Verma" is hardcoded even when Prof. Rao signs in. | Pass `currentUser`. |

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

- Live SMS gateway for real OTP delivery
- Live PostgreSQL database and S3/MinIO file storage
- Production JWT auth & refresh token rotation
- Full Hindi locale coverage across all 15 administrative sub-modules

## Tech debt

| Item | Note |
|---|---|
| Frontend ↔ backend not connected | Duplicate seed data; field naming differs (camelCase vs snake_case) |
| No tests | Neither frontend nor backend |
| Inline `<style>` blocks | Citizen views use inline `<style>` tags; admin modules use Tailwind utilities |
| Unused files | `src/App.css`, `src/assets/{hero.png,react.svg,vite.svg,aicte-nivaran-logo.png}`, `public/{favicon.svg,icons.svg}` |
| Unused backend imports | `Depends`, `Query`, `List` in `main.py`; `EmailStr`, `Dict`, `Any` in `schemas.py` |
| `.gitignore` | Fixed: `backend/.venv/`, `__pycache__/`, `*.pyc`, and temporary `admin-portal/` are now properly ignored |
| Hardcoded demo values | Prefilled form fields and default logged-in user in `App.tsx` |
| CORS | `allow_origins=["*"]` with credentials |

## Roadmap

Ordered phases are in [08-implementation-steps.md](08-implementation-steps.md#part-b--plan-for-the-remaining-work):

1. Make the claims true (real hashing, rule-based matching, state bugs)
2. Connect frontend and backend
3. Official side (dashboard, actions, ATR, link review)
4. Persistence and security
5. Reporting, tests, accessibility audit, polish
