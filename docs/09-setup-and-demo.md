# 09 · Setup and demo

## Prerequisites

- Node.js 20+ and npm (needed for Vite 8)
- Python 3.10+ (for the backend)
- Git

## Run the frontend (this is the demo)

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Production build: `npm run build` (output in `frontend/dist/`), preview with `npm run preview`.

The frontend does not need the backend running.

## Run the backend (optional)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open http://localhost:8000/docs for Swagger UI. Run uvicorn from inside `backend/` so `from app.database import …` resolves.

## Demo credentials

| What | Value |
|---|---|
| Login OTP | `849210` (the UI accepts any 6 characters) |
| Case-closure OTP | `849210` (there is also a "use demo OTP" button) |
| Student | Aarav Sharma · `+91 98712 34567` · DTU · `2024-CS-108` |
| AICTE Official | Dr. Ramesh Chandra Verma · `PGRC-DIR-0842` |
| Nodal Officer | Prof. K. S. Rao · `DTU-NODAL-14` |
| Case awaiting OTP | `AICTE-2026-GRV-84920` |
| Case under investigation | `AICTE-2026-GRV-79114` |
| Resolved case | `AICTE-2026-GRV-65021` |
| Conversation with 2 unread messages + a pending document request | `AICTE-2026-GRV-79114` (Pooja Kulkarni) |

Citizen login (`#citizen-login`) has a one-click demo login for Aarav Sharma; the admin login (`#admin-login`, via the navbar **Administration** button) has one-click personas for Dr. Verma and Prof. Rao. The site opens on `#home`.

Data resets on page reload, so you can repeat the demo.

## Demo script (about 7 minutes)

| Time | Screen | Do | Say |
|---|---|---|---|
| 0:00 | Home | Show the header: switch EN → हिं and back, press A+, toggle contrast | "Built to government portal standards: bilingual, adjustable text, high contrast." |
| 0:40 | Home | Type `pune` or `1-10928341` in the institution search; or press the mic | "Every complaint is anchored to the institution's AICTE Permanent ID." |
| 1:00 | Home | Click DTU in the results | Opens the wizard with the institution preselected. |
| 1:10 | File, steps 1–4 | Click through: Student → Fee Refund → DTU → upload any file | "Each proof gets a SHA-256 digest so tampering is detectable." |
| 2:00 | File, step 5 | Point at the Related Case Finder; keep "Link my complaint" ticked; submit | **Signature feature:** "Instead of starting from zero, the student joins existing complaints against the same college. Officials see one cluster, not scattered cases." |
| 2:40 | Success | Copy the case ID, click Track | Shows stage 1, 72 h SLA, timeline. |
| 3:00 | Dashboard | Show filters and the orange "Action Required" banner; note the related-cases pill | "Complainant sees exactly who holds the case and what is next." |
| 3:30 | Track `…84920` | Show the 6-stage stepper and the institute's ATR (₹44,000 refund, UTR) | "The college says it is resolved. But it cannot close the case itself." |
| 4:00 | Track | Enter `849210` → certificate | **Critical feature:** "Only the complainant's OTP closes the case." |
| 4:30 | Track (reload, then `…84920` again) | Instead click "Reject & Escalate to Ombudsman", enter a reason, confirm | "Rejection goes straight to the State Technical Ombudsman, on the record." |
| 5:00 | Navbar → **Administration** → persona *Dr. Ramesh Chandra Verma* | Opens the 15-module Enterprise Admin Portal (`#admin`). Show executive dashboard: urgent triage items, KPI cards, regional split | "Official e-Office dashboard: active escalations, 72h statutory SLA monitoring, and bureau allocation." |
| 5:30 | Sidebar → **All Cases** & **Review Queue** | Filter cases by status, search DTU, open Verification Queue to review fee receipts with authenticity checklists | "Centralized registry with CSV export and statutory verification checklists." |
| 5:50 | Sidebar → **Map View** & **Similar Cases** | Origin Explorer (spatial district/state heatmap) → Similar Cases (AI root-cause clustering) | "Spatial distribution analysis identifies localized grievance spikes; similarity clustering bundles joint hearings." |
| 6:15 | Sidebar → **Messages** & **Reports** | Support inbox with document requests; Reports & Analytics with interactive Recharts | "Officers communicate with students directly on the record, backed by aging and category analytics." |
| 6:40 | TopBar → **← Citizen Portal** | Click the orange exit button to return to `#home` | "Seamless switching between public complainant services and official e-Office workspaces." |

This runs about 7 minutes; for a 5-minute slot, drop the escalation step (4:30) and Discord.

## Before presenting

- Run `npm run build` once to confirm the build passes.
- Open the deployed Vercel URL and the local dev server as a backup.
- Reload the page right before starting so the seed data is fresh.
- Know which features are simulated; see the status table in [01-project-overview.md](01-project-overview.md).

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm run dev` fails on Node version | Use Node 20 or newer |
| `ModuleNotFoundError: app` when starting backend | Run `uvicorn` from inside `backend/` |
| `fastapi.testclient` raises a missing `httpx` error | `pip install httpx`, or test with `curl` |
| `#chat` shows nothing | A complaint must be selected; use the navbar **Officer Chat** button instead |
| Administration keeps asking to sign in | Expected until you sign in as an official persona; after that the button opens the portal directly |
| Admin sub-tabs | The **Support Inbox** tab is the last one in the admin sub-nav (it wraps to a second line on narrow screens) |
| Upload fails with "secure context" | Web Crypto needs https or `localhost`; don't open the dev server via a LAN IP |
| Officer replies don't appear by themselves | Expected: there are no automatic replies; answer from the Support Inbox |
