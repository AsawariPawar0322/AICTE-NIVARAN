# 03 · Features

Each feature lists where it lives, how it works, and its status (**Working** / **Simulated** / **Not done**). Paths are relative to `frontend/src/` unless they start with `backend/`.

---

## F1 · Government header and accessibility controls

- **Where:** `components/HeaderStrip.tsx`; state in `App.tsx`; CSS hooks in `tokens.css` and `index.css`.
- **What:** Government of India / Ministry of Education / AICTE banner, emergency helplines (Anti-Ragging 1800-180-5522, Women 1091, Cyber 1930), skip-to-content link, screen-reader button, high-contrast toggle, font size A- / A / A+ (0.9 / 1.0 / 1.15), EN / हिं language toggle, Complainant / AICTE Official role switch, sign-in / sign-out.
- **How:** `fontScale` is written to the CSS variable `--font-scale` on `<html>`; `html { font-size: calc(16px * var(--font-scale)) }` scales all rem-based sizes. `highContrast` sets `data-high-contrast="true"` on `<html>`, which `tokens.css` uses to override colours.
- **Role switch:** "AICTE Official" opens the Administration portal (`#admin`) for a signed-in official, otherwise the admin login (`#admin-login`); "Complainant" goes to `#home`. The role decides which unread badge the navbar shows. Clicking the logo returns home.
- **Status:** Working. The screen-reader button only shows an `alert`. The role switch is not access control: anyone can switch.

## F2 · Navigation bar

- **Where:** `components/Navbar.tsx` (also defines `type ActiveTab`).
- **What:** Logo/Home, **Citizen Portal** (with "N OTP" badge; opens a citizen sub-nav: My Grievances, File a Complaint, Track & OTP Closure), **Discord Community Hub**, **Officer Chat** (opens the floating chat, F11) and **Administration** (F17/F16). In complainant mode *Officer Chat* shows the complainant's unread count; in official mode *Administration* shows the officer's unread count.
- **How:** Buttons call `setActiveTab` (`App.handleTabChange`, which also sets the URL hash). *Administration* goes to `#admin-login` unless an official is signed in (`isOfficialSignedIn`), in which case it opens `#admin-inbox` when there are unread messages, else `#admin`.
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

- **Where:** `FileComplaintView.tsx` `handleFileUpload` (wizard); `lib/evidence.ts` (chat and document-request uploads); displayed in `TrackComplaintView.tsx` (Stored Proofs card), the chat thread, and the inbox case panel.
- **What:** Each proof file is listed with name, size, type, and a hash.
- **How now:** files uploaded through the case conversation are read in the browser and hashed with `crypto.subtle.digest('SHA-256', …)` (`sha256Hex`). The filing wizard still generates a random 64-character hex string. Files are not uploaded to any server.
- **Status:** Partly real. Switching the wizard to `toEvidenceFiles` from `lib/evidence.ts` finishes it (plan step 1.1 in [08-implementation-steps.md](08-implementation-steps.md)). Web Crypto needs https or localhost.

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
- **How:** expected OTP = `otpVerification.generatedOtp` or `849210`. A "use demo OTP" button fills it in. The view calls `App.handleUpdateComplaintStage(id, 'RESOLVED', feedback, event)`, which updates the stored complaint and appends the "Case Formally Disposed & Citizen OTP Verified" timeline event.
- **Status:** Working logic; OTP delivery simulated; the certificate "download" is an `alert`.

## F10 · Escalation to State Technical Ombudsman

- **Where:** `TrackComplaintView.tsx` `handleEscalateToOmbudsman` + modal; backend `POST /api/grievances/{case_id}/escalate`.
- **What:** If the complainant rejects the proposed resolution, they give a reason and the case moves to `ESCALATED` with a timeline entry.
- **Status:** Working. The escalation event is stored on the complaint in `App` (via the `event` argument of `handleUpdateComplaintStage`), so it persists across tabs.

## F11 · Complainant ↔ officer chat (complainant side)

- **Where:** `components/FloatingOfficialChat.tsx` (main entry: floating window opened from the navbar *Officer Chat* button, the dashboard and the tracker) and `views/UserAdminChatView.tsx` (full-page fallback at `#chat`); thread rendering in `components/chat/MessageThread.tsx`; messages in `App.conversations[complaintId]`.
- **What:** Officer header, case picker (floating) or case header (full page), an official-record notice, the case's own message thread, quick prompts, attachments (paperclip) and a composer. Document requests from the officer appear as cards with an **Upload requested documents** button.
- **How:** sending posts a `text` message (with attachments, if any) via `App.handleSendMessage`; attachments are hashed with real SHA-256 and added to the complaint's evidence and timeline. `handleUploadForRequest` hashes the chosen files and calls `App.handleFulfillDocumentRequest`, which marks the request *Submitted*, posts a `document_submission` message, adds the files to evidence, and logs a timeline event. Opening the chat marks the thread read for the complainant.
- **Status:** Working in memory. Replies come from an official in the Support Inbox (F16); there are no automatic replies.

## F12 · Discord-style community hub

- **Where:** `views/DiscordReplicaView.tsx`; data `mockDiscordServers`, `mockDiscordChannels`, `mockDiscordMessages`, `mockDiscordMembers`.
- **What:** Server rail (5 servers), channel list (5 text + 1 voice), message pane with embed cards, member list with roles, voice connect/mute UI.
- **Slash commands:** `/status` posts an embed with case 84920's status; `/helpline` posts helpline numbers. Other text posts as a normal message.
- **Status:** Simulated, local only. The server list is shown but channel data is not filtered by server.

## F13 · Login and demo personas

- **Where:** `views/CitizenLoginView.tsx` (`#citizen-login`, also `#login`) and `views/AdminLoginView.tsx` (`#admin-login`); backend `/api/auth/*`.
- **Citizen:** mobile/email + OTP (Student / Faculty / Parent), a one-click demo login (Aarav Sharma), a Guest case-tracking shortcut, and a link to the admin login.
- **Official:** ID + PIN form and two demo personas: Dr. Ramesh Chandra Verma (`AICTE Official`) and Prof. K. S. Rao (`Institute Nodal Officer`).
- **How:** both call `App.handleLoginSuccess`, which sets `currentUser` and sets `activeRole` to `official` when the role contains "Official" or "Nodal". Citizens land on `#dashboard`, officials on `#admin`. A signed-in official's name is used on messages sent from the Support Inbox.
- **Status:** Simulated. Any 6-character OTP is accepted; the official PIN is not checked; the guest case ID typed is not passed to the tracker.

## F14 · Bilingual interface (English / Hindi)

- **Where:** `locales/translations.ts`; consumed via `translations[lang]`.
- **Coverage:** header, navbar, landing page, common buttons, and some labels in other views. Large parts of the wizard, tracker, dashboard, chat and login text are hardcoded English.
- **Status:** Partially working.

## F15 · Backend REST API

- **Where:** `backend/main.py`, `backend/app/schemas.py`, `backend/app/database.py`.
- **What:** health/info root, send/verify OTP, login (with demo personas), list/filter/get/create grievances, verify closure OTP (issues certificate ref), escalate, institution search, **inbox summary, per-case messages, mark read, fulfil document request**.
- **Status:** Working against in-memory data; not called by the frontend. See [06-api-reference.md](06-api-reference.md).

## F16 · Admin Messages / Support Inbox (official side)

- **Where:** `views/AdminInboxView.tsx`; state and handlers in `App.tsx`; shared thread in `components/chat/MessageThread.tsx`; backend `/api/inbox` and message routes. Design and plan: [12-admin-support-inbox.md](12-admin-support-inbox.md).
- **Open it:** Administration → sign in (e.g. persona *Dr. Ramesh Chandra Verma*) → **Support Inbox** sub-tab; or `#admin-inbox`. The admin portal's *Launch Officer Chat* and per-case *Chat* buttons also open it on the selected case. It is rendered by `App` and passed to `AdministrationView` as `messagesPanel` (with `embedded`).
- **What:**
  - **Conversation list:** one row per complaint with complainant name, case number, stage chip, pending-request pill, last message preview and time, unread dot and count. Unread rows sort first, then rows awaiting the officer's reply. Filters: All · Unread · Awaiting reply · Docs pending (with counts). Search by case ID, complainant or institution.
  - **Thread:** the same `MessageThread` the complainant sees, from the officer's side, with "Seen / Delivered & Logged" receipts.
  - **Composer with three modes:** *Reply* (text + quick replies, Ctrl/Cmd+Enter sends), *Request documents* (six common document types + "other", due date defaulting to +3 days, optional note), *Clarification* (recorded as an Official Remark).
  - **Case summary panel:** case ID, title, stage, category, complainant, institution and Permanent ID, SLA, evidence list, pending requests, last three timeline events, **Open full case** (jumps to the tracker for that complaint).
- **Linked to the complaint:** every message carries `complaintId`. Document requests, clarifications, submissions and chat attachments each append a timeline event; uploaded files are added to `evidenceList`.
- **Read state:** opening a thread marks it read for the officer; the navbar badge counts unread messages across all threads.
- **Mobile (≤ 768 px):** list → thread with a *Back to inbox* button; the case panel shows below the thread. ≤ 1100 px the panel moves under the list/thread.
- **Status:** Working in memory (frontend). The backend routes exist but the frontend does not call them yet. All officials see all conversations (no bureau filter or access control).

## F17 · Enterprise Administration Portal (15 Modules)

- **Where:** `frontend/src/admin/App.tsx` (`#admin` / `#admin-inbox`); entry via `views/AdminLoginView.tsx`. Ported from `Krishnav1310/AICTE-ADMIN`.
- **Architecture:** Mounts inside `App.tsx` via `MemoryRouter` with code-split lazy routes. Features an e-Office statutory topbar with breadcrumbs, role selector, live clock, dynamic officer avatar, and a direct `← Citizen Portal` return button.
- **15 Modules:**
  1. **Dashboard** (`/`): Executive KPI metrics (Total, Assigned, Due in 3 Days, Overdue, Resolved), urgent action desk, and regional distributions.
  2. **All Cases** (`/cases`): Full registry table with instant search, multi-filter selectors, and CSV export.
  3. **Case Detail** (`/cases/:id`): Complete dossier with timeline, evidence SHA-256 digests, hearing scheduler, bureau transfer modal, and gazette notice generator.
  4. **Verification Queue** (`/verification`): Document authenticity checklist and bulk review for fee/certificate proofs.
  5. **Colleges Directory** (`/institutions`): Institutional directory with Permanent ID index, compliance ratings, and nodal contacts.
  6. **Map View / Origin Explorer** (`/origin-explorer`): Spatial state/district grievance density mapping.
  7. **Similar Cases Coordination** (`/coordination`): AI root-cause similarity clustering and joint hearing bundling.
  8. **Resolution Proof Review** (`/resolution-proofs`): Review desk for institution ATR compliance certificates, refund slips, and penalty orders.
  9. **Stage Tracking** (`/stage-tracking`): Visual statutory 6-stage SLA monitoring timeline.
  10. **Messages / Support Inbox** (`/messages`): Official-complainant messaging thread with document request cards and formal clarifications.
  11. **Complaint Pool Voting** (`/complaint-pool`): Syndicated student petition pool and collective voting.
  12. **Reports & Analytics** (`/reports`): Interactive Recharts charts for monthly grievance trends, category split, and aging analysis.
  13. **Admin Settings** (`/settings`): SLA threshold rules and bureau allotment parameters.
  14. **Audit Logs** (`/audit-logs`): Immutable chronological action ledger.
  15. **API Spec Viewer** (`/api-spec`): Interactive OpenAPI documentation interface.
- **Status:** Working in memory. Includes fallback mock data and synchronizes with local case `AICTE-2026-GRV-84920` and Delhi Technological University (`inst-1`).

## Not yet built

Real related-case semantic embeddings against PostgreSQL, SMS gateway integration for production OTP, real database persistence across restarts, and production authentication / JWT validation. See [11-known-gaps-and-roadmap.md](11-known-gaps-and-roadmap.md).
