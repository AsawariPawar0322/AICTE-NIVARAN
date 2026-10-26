# 13 · Enterprise Administration Portal

Deep-dive documentation for the 15-module e-Office administration console integrated into AICTE NIVARAN (ported from the sister repository [`Krishnav1310/AICTE-ADMIN`](https://github.com/Krishnav1310/AICTE-ADMIN)).

---

## 1. Overview & Purpose

While the Citizen Portal caters to students, faculty, and institutions for filing and tracking grievances, the **Enterprise Administration Portal** equips AICTE Central Bureau officials, State Ombudspersons, and Regional Nodal Officers with a statutory e-Office environment.

It operates inside the unified single-page application under the `#admin` and `#admin-inbox` hash routes.

---

## 2. Coexistence & Architecture

### Dual-Routing Model
- **Citizen Portal:** Uses lightweight, zero-dependency URL hash routing (`#home`, `#dashboard`, `#track`, `#file-complaint`).
- **Admin Console:** Mounts an isolated `MemoryRouter` scoped within `<AdminPortal />` (`frontend/src/admin/App.tsx`). This allows the admin console to provide rich React Router navigation (`/cases`, `/cases/:id`, `/verification`, `/reports`, etc.) with code-split lazy loading without interfering with citizen browser history or hash routes.

### Seamless Portal Switching
- **Admin Entry:** Complainants and officials navigate to `#admin-login` (via the navbar "Administration" button or header role switcher). Logging in as an official persona (e.g. *Dr. Ramesh Chandra Verma* or *Prof. K. S. Rao*) activates the admin portal view.
- **TopBar Exit Button:** An orange **`← Citizen Portal`** button in the TopBar invokes `onExitAdmin()`, switching the active tab cleanly back to `#home` and restoring the citizen view.
- **Distraction-Free Layout:** When in `#admin` mode, the citizen header strip, navbar, floating chat drawer, and footer are unmounted, giving the administrative shell complete viewport control.

### CSS & Tailwind Coexistence
- Tailwind CSS v3.4.15 is configured in `frontend/tailwind.config.js` with:
  ```js
  corePlugins: {
    preflight: false
  }
  ```
- This prevents Tailwind's base reset from modifying any existing citizen styles, buttons, or typography in `frontend/src/index.css`, while supplying full utility classes to all 15 admin pages.
- Standard government brand tokens are shared:
  - AICTE Navy: `#0B2A5B`
  - Bureau Action Saffron: `#C2570C`
  - Portal Orange: `#F2895E`
  - Deep Blue: `#1F5FBF`

---

## 3. The 15 Administrative Modules

| # | Route | Component | Key Capabilities |
|---|---|---|---|
| **1** | `/` | `Dashboard.tsx` | Executive KPI cards (total, pending, SLA risk, resolved), urgency distribution, regional case split, quick triage queue. |
| **2** | `/cases` | `AllCases.tsx` | Master case ledger, full-text search, multi-filter dropdowns (status, priority, bureau), tabular display, and CSV export. |
| **3** | `/cases/:id` | `CaseDetail.tsx` | Comprehensive case file: 6-stage lifecycle, complainant identity, institution Permanent ID, evidence SHA-256 hashes, bureau transfer modal, hearing scheduler, and gazette notice generator. |
| **4** | `/verification` | `VerificationQueue.tsx` | Document verification desk: fee receipts, admission letters, authenticity checklists, one-click bulk verification. |
| **5** | `/institutions` | `InstitutionDirectory.tsx` | Directory of 12,000+ approved technical colleges (DTU, COEP, SPCE, etc.), Permanent ID indexing, compliance scores, and nodal officer contacts. |
| **6** | `/origin-explorer` | `OriginExplorer.tsx` | Spatial geographic explorer mapping grievance density by state and district with hotspot visualization. |
| **7** | `/coordination` | `RelatedCasesCoordination.tsx` | Intelligent case bundling: detects repeated issues against institutions, clusters identical fee/ragging grievances, and coordinates joint hearings. |
| **8** | `/resolution-proofs` | `ResolutionProofReview.tsx` | Action Taken Report (ATR) proof review desk: compliance certificates, bank UTR refund slips, and penalty sanction orders. |
| **9** | `/stage-tracking` | `StageTracking.tsx` | SLA stage monitoring: visual statutory timeline with 72-hour regulatory milestones. |
| **10** | `/messages` | `Messages.tsx` | Unified support inbox: official-complainant message threads, document request cards, and formal clarifications. |
| **11** | `/complaint-pool` | `ComplaintPoolVoting.tsx` | Syndicated grievance portal: allows class-action petition upvoting and collective representation. |
| **12** | `/reports` | `ReportsAnalytics.tsx` | Interactive Recharts analytics: monthly resolution volume, category breakdowns, aging analysis, and downloadable audit reports. |
| **13** | `/settings` | `AdminSettings.tsx` | Portal configuration: SLA thresholds, auto-escalation rules, and bureau officer allotments. |
| **14** | `/audit-logs` | `AuditLogs.tsx` | Tamper-evident ledger: chronologically records all official actions, document views, and stage transitions. |
| **15** | `/api-spec` | `ApiSpecViewer.tsx` | Interactive OpenAPI / Swagger interface documenting backend integration contracts. |

---

## 4. Key Component Structure

```
frontend/src/admin/
├── App.tsx                     # AdminPortal root with MemoryRouter and lazy routes
├── assets/                     # Official logos and imagery
├── components/                 # Core administrative shell
│   ├── AdminShell.tsx          # Master shell layout with Sidebar, TopBar, and Toast container
│   ├── Sidebar.tsx             # Collapsible navigation sidebar (15 module links)
│   ├── TopBar.tsx              # Breadcrumbs, global search, NIC session pill, "Citizen Portal" button
│   ├── HeaderStrip.tsx         # Government accessibility header strip
│   ├── GovFooter.tsx           # NIC & AICTE official footer
│   └── GovLogos.tsx            # Official emblems
├── context/
│   └── AppContext.tsx          # Official session state (activeOfficer, toasts, language, contrast)
├── design-system/              # Shared UI primitives (Button, Modal, FormControls, StatusChip, ToastContainer)
├── mock/
│   └── data.ts                 # Seed cases (including AICTE-2026-GRV-84920 and DTU inst-1)
├── pages/                      # 15 lazy-loaded module views
├── services/
│   └── api.ts                  # Administrative API layer with localStorage caching
├── types/
│   └── index.ts                # TypeScript interfaces for cases, officers, and audit logs
└── utils/
    └── documentDownloader.ts   # Synthetic PDF and notice generation utility
```

---

## 5. Verification & Testing

- **Local URL:** [http://localhost:5173/#admin-login](http://localhost:5173/#admin-login)
- **Production Build:** Verified with `npm run build` in `frontend/` (all 15 routes split into separate lazy-loaded chunks).
- **Type Checking:** Verified with `npx tsc --noEmit` (0 errors).
