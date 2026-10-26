# 04 · How the features relate

Feature IDs (F1–F15) refer to [03-features.md](03-features.md).

## 1. The complaint is the central object

Almost every feature reads or changes a `Complaint`:

```mermaid
flowchart TB
    INST["Institution<br/>(AICTE Permanent ID)"]
    C(("Complaint"))
    INST -->|"selected in F3 / F4 step 3"| C
    F4["F4 Filing wizard"] -->|creates| C
    F5["F5 Evidence vault"] -->|evidenceList| C
    F6["F6 Related Case Finder"] -->|relatedCaseCount| C
    C -->|listed in| F7["F7 Dashboard"]
    C -->|shown in| F8["F8 Tracker + timeline"]
    F9["F9 OTP closure"] -->|"stage → RESOLVED"| C
    F10["F10 Escalation"] -->|"stage → ESCALATED"| C
    C <-->|"conversation[complaintId]"| F11["F11 Complainant chat"]
    C <-->|"conversation[complaintId]"| F16["F16 Support Inbox"]
    F16 -->|"doc request / clarification → timeline"| C
    F11 -->|"uploads → evidenceList + timeline"| C
    C -->|"PENDING_OTP count, unread counts"| F2["F2 Navbar badges"]
    C -.->|"/status embed (hardcoded)"| F12["F12 Discord hub"]
```

## 2. Complaint lifecycle (state machine)

```mermaid
stateDiagram-v2
    [*] --> REGISTERED: F4 submit (72h SLA starts)
    REGISTERED --> ALLOTTED: bureau allotment
    ALLOTTED --> INVESTIGATION: notice served to institution
    INVESTIGATION --> RESOLUTION_PROPOSED: institute submits ATR
    RESOLUTION_PROPOSED --> PENDING_OTP: OTP sent to complainant
    PENDING_OTP --> RESOLVED: F9 complainant enters valid OTP
    PENDING_OTP --> ESCALATED: F10 complainant rejects with reason
    RESOLVED --> [*]
    ESCALATED --> [*]: Ombudsman inquiry (outside system)
```

| Transition | Who triggers it | Implemented where |
|---|---|---|
| → REGISTERED | Complainant | FE `handleSubmitFinal`; BE `POST /api/grievances` |
| REGISTERED → … → PENDING_OTP | Officials / institute | **Not implemented**; exists only in seed data timelines |
| PENDING_OTP → RESOLVED | Complainant (OTP) | FE `TrackComplaintView.handleVerifyOtp`; BE `verify-closure-otp` |
| PENDING_OTP → ESCALATED | Complainant (reason) | FE `handleEscalateToOmbudsman`; BE `escalate` |

Every transition should append a `TimelineEvent` (actor, role, timestamp, stage). That timeline is the accountability record the problem statement asks for. OTP closure and escalation now do this through `handleUpdateComplaintStage(…, event)`. Conversation actions also add events without changing the stage:

| Action | Timeline event title | From |
|---|---|---|
| Officer requests documents | Documents Requested from Complainant | F16 |
| Officer issues clarification | Clarification Issued to Complainant | F16 |
| Complainant fulfils a request | Requested Documents Submitted by Complainant | F11 |
| Either side attaches files to a message | Supplementary Evidence Shared via Case Conversation | F11 (F16 has no attach button yet) |

Note that neither FE nor BE currently prevents OTP closure or escalation from a stage other than `PENDING_OTP` at the API level; the FE only shows those controls at stage 5.

## 3. Navigation graph

Arrows are `setActiveTab(...)` calls (`App.handleTabChange`, which also sets the URL hash).

```mermaid
flowchart LR
    Home["#home<br/>LandingPage"]
    CLogin["#citizen-login<br/>CitizenLoginView"]
    ALogin["#admin-login<br/>AdminLoginView"]
    Dash["#dashboard<br/>ComplainantDashboard"]
    File["#file-complaint<br/>FileComplaintView"]
    Track["#track<br/>TrackComplaintView"]
    Admin["#admin / #admin-inbox<br/>AdministrationView<br/>(+ Support Inbox sub-tab)"]
    Float(["FloatingOfficialChat<br/>(overlay, any page)"])
    Chat["#chat<br/>UserAdminChatView"]
    Disc["#discord<br/>DiscordReplicaView"]

    Home -->|"File / pick institution"| File
    Home -->|Track| Track
    Home -->|Citizen gateway| CLogin
    CLogin -->|"citizen login"| Dash
    CLogin -->|guest tracking| Track
    CLogin -->|"official? sign in here"| ALogin
    ALogin -->|"officer / nodal login"| Admin
    Dash -->|"Track (selects case)"| Track
    Dash -->|"Chat (selects case)"| Float
    Track -->|Chat| Float
    Admin -->|"Message / Launch Officer Chat → Support Inbox"| Admin
    Admin -->|"Open full case (selects case)"| Track
    Admin -->|Bureau Discord Hub| Disc
```

The navbar reaches Home, Citizen Portal (sub-nav: My Grievances / File / Track), Discord, the floating Officer Chat, and Administration (login screen unless an official is signed in). The header role pill goes to `#admin` / `#admin-login` (official) or `#home` (complainant); the logo goes home.

## 4. Shared state and who touches it

| `App.tsx` state | Written by | Read by |
|---|---|---|
| `complaints` | F4 (add), F9/F10 via `handleUpdateComplaintStage`, F11/F16 (timeline events, evidence) | F7, F8, F16, F2 badge |
| `selectedComplaintId` | F4 (new case), F7 (Track/Chat buttons), F16 (row click, Open full case) | F8 (initial case), F11, F16 |
| `selectedInstForComplaint` | F3 (pick search result) | F4 (preselect step 3) |
| `conversations` | F11 (messages, uploads, mark read), F16 (reply, request, clarification, mark read), F4 (opens thread) | F11, F16, F2 badges |
| `currentUser` | F13 login, F1 logout | F1, F16 (sender name) |
| `activeRole` | F1 switch, F13 login | F1, F2 (which tabs) |
| `lang` | F1 | all components (F14) |
| `fontScale`, `highContrast` | F1 | whole document via CSS |
| `institutions` | nobody (constant) | F3, F4 |

## 5. Feature dependency summary

| Feature | Depends on | Enables |
|---|---|---|
| F3 Institution search | `institutions` data | F4 with preselected institution |
| F4 Filing wizard | institutions, categories, F5, F6 | F7, F8, F11 |
| F5 Evidence | F4 step 4 | F8 proofs card, integrity claim |
| F6 Related cases | institution + category of F4 | dashboard pill, joint hearing (future official review) |
| F7 Dashboard | complaints | F8, F11 |
| F8 Tracker | complaints, selection | F9, F10 |
| F9 OTP closure | stage = PENDING_OTP, ATR data | stage RESOLVED, certificate |
| F10 Escalation | stage = PENDING_OTP | stage ESCALATED, Ombudsman |
| F11 Chat | selectedComplaint, conversation, assigned officer | answers F16 requests; evidence for F8 |
| F16 Support Inbox | complaints, conversations, currentUser | F11 (messages to complainant), F8 (timeline), case selection for F8 |
| F12 Discord | own mock data | — (only links back) |
| F13 Login | — | currentUser, activeRole |
| F14 i18n | `lang` | every screen |
| F15 Backend | schemas, database | will replace FE mock data once integrated |

## 6. Frontend ↔ backend correspondence

| Frontend action | Backend endpoint that should replace it |
|---|---|
| `mockInstitutions` + `LandingPage.handleSearch` | `GET /api/institutions?search=` |
| `initialComplaints` | `GET /api/grievances` |
| `TrackComplaintView.handleLookup` | `GET /api/grievances/{case_id}` |
| `FileComplaintView.handleSubmitFinal` | `POST /api/grievances` |
| `TrackComplaintView.handleVerifyOtp` | `POST /api/grievances/{id}/verify-closure-otp` |
| `TrackComplaintView.handleEscalateToOmbudsman` | `POST /api/grievances/{id}/escalate` |
| `CitizenLoginView.handleSendOtp` / `handleVerifyOtp` | `POST /api/auth/send-otp`, `/api/auth/verify-otp` |
| `AdminLoginView.handleDemoPersona` / `handleLogin`, `CitizenLoginView.handleDemoLogin` | `POST /api/auth/login` (`is_demo: true`) |
| `FloatingOfficialChat.sendMessage`, `UserAdminChatView.handleSend`, `AdminInboxView.handleSendReply` / `handleSendClarification` / `handleSendRequest` | `POST /api/grievances/{id}/messages` |
| `AdminInboxView` list (`summaries`, filters, search) | `GET /api/inbox?filter=&search=` |
| thread contents | `GET /api/grievances/{id}/messages` |
| `App.handleMarkThreadRead` | `POST /api/grievances/{id}/messages/read` |
| `App.handleFulfillDocumentRequest` | `POST /api/grievances/{id}/document-requests/{request_id}/fulfill` |
