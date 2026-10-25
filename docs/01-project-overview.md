# 01 · Project overview

## Problem statement

**SIH26264 — AICTE Grievance Coordination and Monitoring.** AICTE receives complaints about thousands of approved technical institutions through several Bureaus and Cells (PGRC, Anti-Ragging, ICC, Scholarship, Approvals). Complaints about the same institution often sit in different departments, so:

| Pain point | Effect |
|---|---|
| Fragmented records | Related complaints against one institution are never seen together. |
| Unclear ownership | It is hard to tell who holds a case and what the next action is. |
| Delayed follow-up | Deadlines and pending actions slip without anyone noticing. |
| Unilateral closure | An institution can mark a case "resolved" without the complainant agreeing. |

## Our solution

**AICTE NIVARAN** (एआईसीटीई निवारण, "redressal") is a single portal where complainants file and track grievances and officials coordinate them. The core ideas:

1. **Institution-centred records.** Every complaint is tied to the institution's **AICTE Permanent ID**, so cases can be grouped per institution, state, and region.
2. **Link to existing complaint (signature feature).** While filing, the system shows potentially related unresolved complaints against the same institution and lets the complainant join them to a joint hearing queue instead of starting from zero.
3. **Six-stage transparent lifecycle** with an SLA countdown and a chronological, actor-attributed timeline.
4. **Citizen OTP closure.** A case cannot move to `RESOLVED` until the complainant enters a one-time code confirming satisfaction. If they are not satisfied, they escalate to the State Technical Ombudsman.
5. **Evidence integrity.** Each uploaded proof file is shown with a SHA-256 digest so tampering can be detected.
6. **Accessible, bilingual UI.** English/Hindi toggle, font scaling, high-contrast mode, government-portal visual language.
7. **Communication channels.** A per-case chat with the assigned officer, and a Discord-style community hub for peer support and announcements.

## Users and personas

| Persona | Demo identity | What they do |
|---|---|---|
| Complainant (Student / Faculty / Parent / Anonymous) | Aarav Sharma, Student, DTU | File, track, chat, verify closure with OTP, escalate |
| AICTE Official | Dr. Ramesh Chandra Verma, Director PGRC | Receives allotted cases, serves notices, reviews ATRs |
| Institute Nodal Officer | Prof. K. S. Rao, Registrar DTU | Submits Action Taken Reports (ATR) for their institution |
| Guest | — | Tracks a case by ID without signing in |

Only the complainant experience has dedicated screens today. Officials can sign in, but there is no separate official dashboard yet (see [11-known-gaps-and-roadmap.md](11-known-gaps-and-roadmap.md)).

## Implementation status

Be precise about this in presentations; judges will probe it.

| Capability | Status | Notes |
|---|---|---|
| Landing page, institution search by name / Permanent ID / city / state | **Working** (frontend) | Filters the 5 seed institutions |
| 5-step complaint filing wizard | **Working** (frontend) | Creates a complaint in in-memory state |
| Complainant dashboard with filters | **Working** (frontend) | All / Action required / Active / Resolved |
| 6-stage tracker + timeline + evidence list | **Working** (frontend) | |
| OTP-based closure and Ombudsman escalation | **Working** (frontend logic), demo OTP `849210` | No real SMS |
| Bilingual EN/HI, font scale, high contrast | **Working**, partial coverage | Header, nav and landing are translated; many view strings are English-only |
| Backend REST API (auth, grievances, closure, escalation, institutions) | **Working** (backend) | In-memory data, verified with curl |
| Frontend ↔ backend integration | **Not done** | Frontend uses its own mock data |
| Persistence (database) | **Not done** | Data resets on reload/restart |
| SHA-256 evidence hashing | **Simulated** | Frontend generates a random 64-hex string, not a real hash |
| Related-case finder | **Simulated** | Step 5 always shows "2 similar cases"; linking sets `relatedCaseCount = 3` |
| OTP delivery / authentication / JWT | **Simulated** | Static demo OTP; tokens are placeholder strings |
| Officer chat replies | **Simulated** | Random canned reply after 1.8 s |
| Voice search | **Simulated** | Fills "Delhi Technological University" after 1.2 s |
| Discord hub | **Simulated** | Local UI replica, not connected to Discord |
| Official / nodal dashboards, role-based access | **Not done** | Role switch is visual only |
| Reports (bureau / region / institution-wise) | **Not done** | |
| WCAG 2.1 AA / GIGW 3.0 compliance | **Design goal, not audited** | The footer badge states compliance; that claim has not been tested |

## Scope of this repository

- `frontend/` — the clickable prototype that is demoed (deployed on Vercel per the root README).
- `backend/` — a FastAPI service modelling the same domain, ready to be wired to the frontend.
- No tests, CI, database, or infrastructure code exist yet.

## Disclaimer

Student prototype for SIH26264. Not an official AICTE service. All people, cases, OTPs and hashes in the data are synthetic.
