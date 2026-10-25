# 03 · Features

Each feature lists where it lives, how it works, and its status (**Working** / **Simulated** / **Not done**). Paths are relative to `frontend/src/` unless they start with `backend/`.

---

## F1 · Government header and accessibility controls

- **Where:** `components/HeaderStrip.tsx`; state in `App.tsx`; CSS hooks in `tokens.css` and `index.css`.
- **What:** Government of India / Ministry of Education / AICTE banner, emergency helplines (Anti-Ragging 1800-180-5522, Women 1091, Cyber 1930), skip-to-content link, screen-reader button, high-contrast toggle, font size A- / A / A+ (0.9 / 1.0 / 1.15), EN / हिं language toggle, Complainant / AICTE Official role switch, sign-in / sign-out.
- **How:** `fontScale` is written to the CSS variable `--font-scale` on `<html>`; `html { font-size: calc(16px * var(--font-scale)) }` scales all rem-based sizes. `highContrast` sets `data-high-contrast="true"` on `<html>`, which `tokens.css` uses to override colours.
- **Status:** Working. The screen-reader button and the "AICTE Official" role switch only show an `alert`; the role switch does not change which screens are shown.

## F2 · Navigation bar

- **Where:** `components/Navbar.tsx` (also defines `type ActiveTab`).
- **What:** Tabs for Home, Dashboard, File Complaint, Track, Chat, Discord, Login. The Track tab shows a red badge with the count of `PENDING_OTP` complaints.
- **How:** Each button calls `setActiveTab`. `pendingOtpCount` is computed in `App.tsx`.
- **Status:** Working.

## F3 · Landing page and institution search

- **Where:** `views/LandingPage.tsx`.
- **What:** Directive banner, hero, institution search with live results, voice-search button, two "front door" cards (File / Track), a 3-step "how it works" explainer, six category desks, and a national statistics strip (14,890+ resolved, 48.4 h avg SLA, 12,450+ institutes, 96.2% satisfaction — display figures, not computed).
- **How:** `handleSearch` filters `institutions` by name, Permanent ID, city, or state (case-insensitive substring). Picking a result calls `onSelectInstitutionForComplaint`, which stores it in `App.selectedInstForComplaint` and switches to the filing wizard with that institution preselected. `simulateVoiceSearch` waits 1.2 s then searches "Delhi Technological University".
- **Status:** Search working; voice search simulated; statistics are static.

## F4 · Complaint filing wizard (5 steps)

- **Where:** `views/FileComplaintView.tsx`.
- **Steps:**
  1. **Who is filing** — role (Student / Faculty / Parent / Anonymous), name, roll number, mobile, email, anonymous toggle.
  2. **Category** — one of 7 (`categoryOptions`): Fee Refund, Anti-Ragging, AICTE Scholarships (Pragati / Saksham / PMSSS), ICC (sexual harassment, confidential routing), Faculty & Lab Infrastructure, Admissions / Marks / Certificates, Other / Not sure.
  3. **Institution** — search and select an AICTE-approved institution (prefilled from F3 if chosen there).
  4. **Narrative and evidence** — title, details, file upload (drag-and-drop styling); each file gets a SHA-256-style digest.
  5. **Review and submit** — summary, plus the **Related Case Finder** alert (F6) with a "link my complaint" checkbox.
- **How:** `handleSubmitFinal` builds a full `Complaint` (ID `AICTE-2026-GRV-<5 random digits>`, stage `REGISTERED`, 72 h SLA, assigned to Dr. Verma, one timeline event) and passes it to `App.handleAddNewComplaint`, which prepends it to `complaints` and selects it. A success screen shows the case ID with copy-to-clipboard and buttons to Track or Chat.
- **Anonymous filing:** the name is replaced with "Confidential Complainant" and role with "Anonymous".
- **Status:** Working in memory. Form fields are prefilled with demo values. No field validation.

## F5 · Evidence vault (SHA-256 digests)

- **Where:** `FileComplaintView.tsx` `handleFileUpload`; displayed in `TrackComplaintView.tsx` (Stored Proofs card).
- **What:** Each proof file is listed with name, size, type, and a hash.
- **How now:** a random 64-character hex string is generated. The file contents are not read and not uploaded.
- **Status:** Simulated. Real hashing is a small change: `crypto.subtle.digest('SHA-256', await file.arrayBuffer())`. See [08-implementation-steps.md](08-implementation-steps.md).

## F6 · Related Case Finder / Link to existing complaint (signature feature)

- **Where:** Step 5 of `FileComplaintView.tsx`; `relatedCaseCount` badge in `ComplainantDashboard.tsx`; backend `create_grievance` sets the same field.
- **What:** Warns that similar unresolved complaints exist against the same institution and lets the complainant link to an "Institutional Joint Hearing Queue" for higher priority and collective scrutiny.
- **How now:** the alert text is fixed ("2 Similar Cases Detected"), and checking the box sets `relatedCaseCount = 3`. No matching is computed.
- **Intended logic:** candidate cases = same `aictePermanentId` and not `RESOLVED`; rank by category match, text similarity of title/details, and incident date proximity; show the reasons; an authorised official confirms the link before it takes effect. The complainant's identity stays separate from the other cases.
- **Status:** Simulated (UI and data field only).

## F7 · Complainant dashboard

- **Where:** `views/ComplainantDashboard.tsx`.
- **What:** Profile banner, "Citizen Action Required" banner for OTP-pending cases, metric cards (total / action required / active / resolved) that double as filters, the complaint list with stage chips, related-case pill, ATR preview for OTP-pending cases, and per-case buttons to Track or Chat.
- **How:** Filters on `currentStage`. Clicking Track calls `App.handleSelectComplaintForTracking` (select + switch to `track`); Chat calls `App.handleOpenChatWithComplaint`.
- **Status:** Working. The profile banner is hardcoded to Aarav Sharma and does not reflect `currentUser`.

## F8 · Multi-stage tracker and audit trail

- **Where:** `views/TrackComplaintView.tsx`.
- **What:** Case-ID lookup, case header, 6-step progress stepper, the full timeline ("Complete Case Audit Trail & Event Ledger") with actor, role, timestamp, and stage per event, assigned-officer card with SLA hours remaining, stored proofs with hash preview, institution info, and a Discord shortcut.
- **Stages (`stagesList`):** 1 Registered & Hashed → 2 Bureau Allotment → 3 Inquiry & Evidence → 4 ATR Resolution → 5 Citizen OTP Verify → 6 Formally Disposed. `ESCALATED` is shown as a red banner.
- **How:** `handleLookup` finds a case by ID (case-insensitive) in the current session's `complaints`.
- **Status:** Working.

## F9 · Citizen OTP closure (critical feature)

- **Where:** `TrackComplaintView.tsx` `handleVerifyOtp`; backend `POST /api/grievances/{case_id}/verify-closure-otp`.
- **What:** When a case is at stage 5 (`PENDING_OTP`), the institution's proposed resolution (ATR summary, remedy, refund amount, order reference) is shown and the complainant must enter the 6-digit OTP to accept it. On success the case becomes `RESOLVED` (stage 6) and a Resolution & Closure Certificate panel appears.
- **Why it matters:** institutions cannot close complaints unilaterally; closure requires the complainant's explicit confirmation.
- **How:** expected OTP = `otpVerification.generatedOtp` or `849210`. A "use demo OTP" button fills it in. The view updates its local copy and calls `App.handleUpdateComplaintStage(id, 'RESOLVED', feedback)`.
- **Status:** Working logic; OTP delivery simulated; the certificate "download" is an `alert`.

## F10 · Escalation to State Technical Ombudsman

- **Where:** `TrackComplaintView.tsx` `handleEscalateToOmbudsman` + modal; backend `POST /api/grievances/{case_id}/escalate`.
- **What:** If the complainant rejects the proposed resolution, they give a reason and the case moves to `ESCALATED` with a timeline entry.
- **Status:** Working. The new timeline entry is only kept in the view's local state, not in `App.complaints` (see [11-known-gaps-and-roadmap.md](11-known-gaps-and-roadmap.md)).

## F11 · Complainant ↔ officer chat

- **Where:** `views/UserAdminChatView.tsx`; messages in `App.chatMessages`.
- **What:** Officer header with case context, an official-notice banner, the message thread (system / officer / complainant styles), quick prompts, and a composer.
- **How:** `handleSend` appends the complainant's message, shows "typing…", then after 1.8 s appends one of three canned officer replies.
- **Status:** Simulated. Messages are one global list, not per case. The attachment button is an `alert`.

## F12 · Discord-style community hub

- **Where:** `views/DiscordReplicaView.tsx`; data `mockDiscordServers`, `mockDiscordChannels`, `mockDiscordMessages`, `mockDiscordMembers`.
- **What:** Server rail (5 servers), channel list (5 text + 1 voice), message pane with embed cards, member list with roles, voice connect/mute UI.
- **Slash commands:** `/status` posts an embed with case 84920's status; `/helpline` posts helpline numbers. Other text posts as a normal message.
- **Status:** Simulated, local only. The server list is shown but channel data is not filtered by server.

## F13 · Login and demo personas

- **Where:** `views/LoginView.tsx`; backend `/api/auth/*`.
- **Tracks:** Citizen (mobile/email + OTP, type Student / Faculty / Parent), Official (ID + PIN), and a Guest case-tracking shortcut.
- **One-click evaluator logins:** Student (Aarav Sharma), AICTE Officer (Dr. Verma), Nodal Officer (Prof. K. S. Rao).
- **How:** success calls `App.onLoginSuccess`, which sets `currentUser` and sets `activeRole` to `official` if the role contains "Official"; then navigates to the dashboard.
- **Status:** Simulated. Any 6-character OTP is accepted; the official PIN is not checked; the guest case ID typed is not passed to the tracker.

## F14 · Bilingual interface (English / Hindi)

- **Where:** `locales/translations.ts`; consumed via `translations[lang]`.
- **Coverage:** header, navbar, landing page, common buttons, and some labels in other views. Large parts of the wizard, tracker, dashboard, chat and login text are hardcoded English.
- **Status:** Partially working.

## F15 · Backend REST API

- **Where:** `backend/main.py`, `backend/app/schemas.py`, `backend/app/database.py`.
- **What:** health/info root, send/verify OTP, login (with demo personas), list/filter/get/create grievances, verify closure OTP (issues certificate ref), escalate, institution search.
- **Status:** Working against in-memory data; not called by the frontend. See [06-api-reference.md](06-api-reference.md).

## Not yet built

Admin Messages / Support Inbox (plan: [12-admin-support-inbox.md](12-admin-support-inbox.md)), official triage dashboard, nodal-officer ATR submission screen, bureau / region / institution-wise reports, real related-case matching, deadline alerts and auto-escalation, persistent storage, real authentication, role-based access control. See [11-known-gaps-and-roadmap.md](11-known-gaps-and-roadmap.md).
