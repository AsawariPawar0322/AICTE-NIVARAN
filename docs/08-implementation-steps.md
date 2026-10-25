# 08 · Implementation steps

Part A records how the current prototype was built, so the team can explain it. Part B is the ordered plan to turn it into a working system. Tick items off here as they are completed.

## Part A · How the prototype was built

1. **Problem analysis.** Studied SIH26264: fragmented complaints across AICTE Bureaus/Cells, unclear ownership, missed deadlines, need for institution-wise and department-wise reporting.
2. **Domain modelling.** Chose the AICTE Permanent ID as the institution key; defined 7 grievance categories mapped to AICTE cells (PGRC, Anti-Ragging, ICC, Scholarship, etc.); defined the 6-stage lifecycle plus escalation (`types/index.ts`).
3. **Design system.** AICTE brand colours checked for WCAG AA contrast, spacing/radius tokens, Noto fonts for English and Devanagari, high-contrast and font-scale hooks (`tokens.css`, `index.css`).
4. **Project scaffold.** Vite + React + TypeScript template (`npm create vite`), oxlint, lucide-react icons.
5. **Shell.** `App.tsx` with central state and tab switching; `HeaderStrip` (government header + accessibility) and `Navbar`; footer.
6. **Seed data.** Realistic synthetic institutions, three complaints at different stages, chat history, and Discord data (`data/mockData.ts`).
7. **Complainant journey screens**, in this order: Landing (search) → Filing wizard → Dashboard → Tracker with OTP closure and escalation → Chat → Login with demo personas.
8. **Community hub.** Discord-style replica with slash commands.
9. **Bilingual text.** EN/HI dictionary for header, navigation, and landing page (`locales/translations.ts`).
10. **Backend.** FastAPI service mirroring the domain: Pydantic request models, in-memory seed data, auth/OTP, grievance CRUD, closure OTP, escalation, institution search.
11. **Docs and README.**
12. **Admin Support Inbox** ([12-admin-support-inbox.md](12-admin-support-inbox.md)): messages linked to complaints, shared `MessageThread`, complainant uploads with real SHA-256, `AdminInboxView`, role-aware navbar, backend inbox/message routes. Selection moved to an id in `App` so all views see live complaint data.

## Part B · Plan for the remaining work

Ordered by value for the evaluation and by dependency. Each step lists the files to touch.

### Phase 1 · Make the claims true (highest priority)

- [ ] **1.1 Real SHA-256 hashing in the wizard.** `lib/evidence.ts` already provides `toEvidenceFiles(files)` (used by the chat). In `FileComplaintView.handleFileUpload`, make it `async` and replace the random string with `const [ev] = await toEvidenceFiles([file]);`.
- [ ] **1.2 Real related-case matching (rule-based first).** Add `findRelatedCases(draft, complaints)` in a new `frontend/src/lib/relatedCases.ts`: same `aictePermanentId`, not `RESOLVED`; score +3 same category, +1 per shared keyword in title/details (lower-cased, stop-words removed); return top matches with reasons. Render the real count and reasons in step 5. Store matched IDs (add `relatedCaseIds?: string[]` to `Complaint`).
- [ ] **1.3 Fix state bugs** listed in [11-known-gaps-and-roadmap.md](11-known-gaps-and-roadmap.md). Done: escalation/OTP timeline lost (B1), stale tracker case (B2), global chat list (B7). Remaining: dashboard ignores `currentUser` (B3), guest case ID ignored (B4), and others.
- [ ] **1.4 Soften unverified claims** in the UI (footer "WCAG 2.1 AA & GIGW 3.0 Compliant" badge → "designed for", "semantic matching engine" → "related case finder").

### Phase 2 · Connect frontend and backend

- [ ] **2.1 API client.** `frontend/src/lib/api.ts` with `const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'` and typed functions per endpoint, including camel↔snake conversion.
- [ ] **2.2 Load data from the API.** In `App.tsx`, fetch institutions and grievances in a `useEffect`; keep `mockData.ts` as an offline fallback so the demo still works without the server.
- [ ] **2.3 Mutations through the API.** Submit (`POST /api/grievances`), OTP closure, escalation, and login call the backend and replace local state with the returned record.
- [ ] **2.4 Backend fixes.** Align seed data with the frontend (3 grievances); validate stage (`PENDING_OTP` required for closure/escalation); validate `category` against an enum; remove unused imports; add `.venv/` and `__pycache__/` to `.gitignore`.
- [ ] **2.5 Move related-case logic to the backend** (`GET /api/grievances/{id}/related`) once 1.2 is proven in the UI.

### Phase 3 · Official side (needed for "coordination and monitoring")

- [x] **3.0 Admin Messages / Support Inbox** — [12-admin-support-inbox.md](12-admin-support-inbox.md). Steps 1–6 and 8 done; step 7 (frontend calling the backend routes) waits for Phase 2.
- [ ] **3.1 Official dashboard view** (`views/OfficialDashboard.tsx`, new `ActiveTab` value): queue of cases by bureau, overdue/near-deadline highlighting, institution-wise counts.
- [ ] **3.2 Officer actions:** allot, serve notice, transfer between bureaus, add remark — each appends a timeline event and moves the stage (new endpoints `POST /api/grievances/{id}/actions`).
- [ ] **3.3 Nodal officer ATR submission** → stage `RESOLUTION_PROPOSED` → system issues OTP → `PENDING_OTP`.
- [ ] **3.4 Related-case review:** official confirms or rejects suggested links (`case_links.status`).
- [ ] **3.5 Make the role switch real:** show official views when `activeRole === 'official'`; hide complainant-only actions. *Started:* the navbar now switches tabs by role (Support Inbox vs File a Complaint / Chatbox). Still needed: role-specific dashboard and real access control (Phase 4).

### Phase 4 · Persistence and security

- [ ] **4.1 PostgreSQL** with SQLAlchemy/SQLModel using the schema in [07-data-model.md](07-data-model.md); Alembic migrations.
- [ ] **4.2 Real auth:** hashed OTPs with expiry and rate limiting; signed JWTs; role checks on every route.
- [ ] **4.3 Evidence storage:** upload files (multipart, already supported by `python-multipart`) to private object storage; verify the hash server-side.
- [ ] **4.4 SLA engine:** store `sla_due_at`; background job flags overdue cases and escalates per policy.
- [ ] **4.5 Tighten CORS** to the deployed frontend origin.

### Phase 5 · Reporting, quality, polish

- [ ] **5.1 Reports:** bureau-wise, region-wise, institution-wise counts and average resolution time; CSV export.
- [ ] **5.2 Complete Hindi translations** for all views.
- [ ] **5.3 Tests:** pytest + httpx for every endpoint; Vitest + Testing Library for the wizard, OTP closure, and related-case finder; measure related-case precision/recall on a labelled set.
- [ ] **5.4 Accessibility audit** (axe / Lighthouse, keyboard-only pass, screen reader pass).
- [ ] **5.5 URL routing** (React Router) so tabs have deep links and the back button works.
- [ ] **5.6 Clean-up:** delete `App.css` and unused template assets; consider moving inline `<style>` blocks to CSS modules; define `flex-wrap`, `items-end`, `btn-sm` globally in `index.css` (check each existing page after doing so).
