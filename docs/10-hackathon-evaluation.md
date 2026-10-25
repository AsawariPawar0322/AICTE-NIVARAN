# 10 · Hackathon evaluation guide

Material for presenting AICTE NIVARAN to SIH evaluators: how the project answers the problem statement, how it maps to typical judging criteria, and how to answer the hard questions.

## Problem-statement coverage (SIH26264)

| Requirement in the problem statement | How NIVARAN addresses it | State |
|---|---|---|
| Centralised institution-related complaint monitoring | Complaints keyed to AICTE Permanent ID; institution search; per-institution open-case counts | Prototype (UI + API) |
| Detect potential overlap between complaints | Related Case Finder at filing time; "link to existing complaint" | UI flow done; matching logic simulated |
| Responsibility tracking | Assigned officer card, actor and role on every timeline event | Done (display) |
| Coordinated action across Bureaus/Cells | Joint hearing queue via case linking; category → cell routing | Concept + UI; no official workflow yet |
| Deadline visibility | SLA hours on each case; 72 h on registration | Static value; no live deadline engine |
| Institution-wise and department-wise reporting | Planned official dashboard and reports | Not built |
| Accountable closure | Citizen OTP gate; escalation to Ombudsman | Done (logic), OTP simulated |

## Mapping to common SIH judging criteria

### Novelty / innovation
- **Link to existing complaint**: converts many isolated complaints against one institution into one coordinated case cluster, while each complainant's identity stays separate.
- **Citizen-owned closure**: an institution's resolution only counts after the complainant's OTP; rejection escalates automatically.
- **Evidence integrity**: hash shown for every proof file.

### Feasibility / technical approach
- Standard, low-cost stack: React + TypeScript + Vite, FastAPI + Pydantic. Matching can start with PostgreSQL full-text search and trigram similarity before any ML.
- Backend endpoints for the full complainant lifecycle already exist and respond correctly.
- Clear integration and persistence path ([08-implementation-steps.md](08-implementation-steps.md)).

### Impact
- Complainants: one place to file, a visible next step, no silent closure.
- AICTE: patterns across institutions become visible; fewer duplicate investigations; accountability per officer.
- Institutions: a single ATR channel instead of responding separately to each bureau.
- Expected benefits must be measured (time to resolution, duplicate rate, reopen rate). Do not present them as achieved figures.

### Scalability
- Stateless API → horizontal scaling; PostgreSQL indexes on `permanent_id`, `current_stage`, `sla_due_at`.
- Matching runs only within one institution's open cases, so the search space stays small even with 12,000+ institutions.

### User experience and accessibility
- Government visual language, bilingual EN/HI, font scaling, high contrast, skip link, emergency helplines always visible.
- One-click evaluator logins and prefilled forms make the demo fast.

### Completeness of the prototype
- Complainant journey is complete end to end in the UI.
- Official side, persistence, and real matching are the main missing pieces. Say so openly.

## Pitch structure (3 minutes)

1. **Problem (30 s):** one college, five complaints, three bureaus, nobody sees the pattern; colleges close cases themselves.
2. **Solution (30 s):** one platform; complaints linked by AICTE Permanent ID; complainant-verified closure.
3. **Live demo (90 s):** file → related cases → link → track → OTP close (see [09-setup-and-demo.md](09-setup-and-demo.md)).
4. **Architecture and roadmap (20 s):** React/FastAPI today; Postgres, matching, official dashboards next.
5. **Close (10 s):** "From scattered complaints to connected accountability."

## Likely judge questions

| Question | Honest answer |
|---|---|
| How does related-case matching work? | Today the UI flow is in place and the result is mocked. The planned approach: candidates = open cases with the same AICTE Permanent ID; score by category, text similarity (Postgres FTS + trigram), and date proximity; show reasons; an authorised official confirms each link. We will measure precision/recall on labelled examples before adding semantic models. |
| Is the frontend connected to the backend? | Not yet. The backend API works on its own (Swagger at `/docs`); the demo runs on frontend mock data so it is reliable offline. Wiring is the next step and the endpoints map one-to-one. |
| Is the SHA-256 real? | Currently a placeholder value. Real hashing with the browser's Web Crypto API is a few lines and is first on our list. |
| How is OTP sent? | Simulated with a fixed demo code. Production would use an SMS gateway with hashed, expiring, rate-limited OTPs. |
| What stops an official from closing a case? | Closure requires the complainant's OTP; dissatisfaction escalates to the Ombudsman, and every step is recorded on the timeline. |
| What about anonymous complaints? | Supported: the name is masked. The OTP closure would then go to a contact the complainant chooses to keep private. |
| Privacy when linking cases? | Links connect cases, not people. Officials see a cluster; complainants never see each other's identity or details. |
| Where does institution data come from? | Synthetic sample now. Real data would come from AICTE's approved-institution records under authorisation. |
| Is it WCAG / GIGW compliant? | It is designed for those standards (contrast-checked tokens, font scaling, high contrast, skip link, bilingual). It has not been formally audited yet. |
| What is the Discord hub for? | Peer support and announcements for students; bot commands for status and helplines. It is a UI replica, not linked to Discord. |
| How will you scale to 12,000+ institutions? | Stateless API, indexed Postgres, matching scoped per institution, async jobs for SLA checks. |

## Things not to claim

Unless the corresponding item in [11-known-gaps-and-roadmap.md](11-known-gaps-and-roadmap.md) has been fixed, do not say:
- that hashing is real SHA-256,
- that a "semantic matching engine" detects cases,
- that the system is WCAG 2.1 AA / GIGW 3.0 compliant (the footer badge says so; it is a goal),
- that OTPs are sent by SMS,
- that the frontend uses the backend,
- that the portal statistics (14,890+ resolved, 96.2% satisfaction, …) are real.

The root README already follows this rule ("should only be claimed as implemented after successful testing").

## Evaluation checklist

- [ ] Deployed frontend URL works
- [ ] `npm run build` passes
- [ ] Backend starts and `/docs` loads
- [ ] Demo script rehearsed within 6 minutes
- [ ] Everyone on the team can answer the questions above
- [ ] Status table in [01-project-overview.md](01-project-overview.md) matches the code
