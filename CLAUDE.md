# CLAUDE.md

AICTE NIVARAN — SIH 2026 prototype (SIH26264) for AICTE grievance coordination. React 19 + TS + Vite frontend in `frontend/`, FastAPI backend in `backend/`. They are not connected yet; the frontend runs on `frontend/src/data/mockData.ts`.

## Before working

Read `docs/CONTEXT.md` first. It holds the file map, key symbol locations, enums, demo values, and conventions, so you rarely need to search the codebase to orient. Open other files in `docs/` only when the task needs them (index: `docs/README.md`).

## Docs must stay in sync with code

Every change to code, config, dependencies, or data must update the affected docs in the same change. Use the table in `docs/README.md` ("Keeping these docs current") to find which files to touch. At minimum:

- `docs/CONTEXT.md` — file map, symbol locations/line numbers, demo values, enums
- `docs/05-file-reference.md` — any file added, removed, or whose role changed
- `docs/03-features.md` and the status table in `docs/01-project-overview.md` — feature behaviour or status changes (e.g. Simulated → Working)
- `docs/06-api-reference.md` / `docs/07-data-model.md` — endpoints, schemas, types
- `docs/11-known-gaps-and-roadmap.md` and the checkboxes in `docs/08-implementation-steps.md` — when a gap is fixed or found
- `docs/CHANGELOG.md` — add one line

Keep docs factual: only mark something Working once it is verified. Do not describe simulated features as real.

## Commands

- Frontend: `cd frontend && npm run dev` · `npm run build` · `npm run lint`
- Backend: `cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000`
- No test suite exists yet. Test the API with `curl` (the venv lacks `httpx`, so `TestClient` fails).

## Conventions

- Frontend camelCase, backend snake_case.
- All global state in `frontend/src/App.tsx`; navigation via `setActiveTab`; no router.
- Each component's CSS is in an inline `<style>` block at the end of its JSX; logic is at the top.
- Strings via `translations[lang]` from `frontend/src/locales/translations.ts`; add both `en` and `hi`.
