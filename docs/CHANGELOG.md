# Docs changelog

One line per change that touched the docs. Newest first. Format: `YYYY-MM-DD · what changed in code → which docs were updated`.

- 2026-10-25 · Merged main (`ee6cebb`, UI rework: hash routing, Citizen/Admin login views, AdministrationView, FloatingOfficialChat, Icon) into the inbox branch; Support Inbox moved into the admin portal as a sub-tab, floating chat ported to per-case threads → updated CONTEXT, 02, 03, 04, 05, 07, 08, 09, 11 (B14–B17 found in main's code), 12.
- 2026-10-25 · Implemented the admin Support Inbox: per-complaint conversations, `AdminInboxView`, shared `MessageThread`, real SHA-256 for chat uploads (`lib/evidence.ts`), role-aware navbar, selection stored by id (fixes B1, B2, B7), backend inbox/message routes → updated CONTEXT, 01, 02, 03 (F16), 04, 05, 06, 07, 08, 09, 10, 11, 12.
- 2026-10-25 · No code change. Added implementation plan for the admin Messages / Support Inbox → new `12-admin-support-inbox.md`; linked from README, 03, 08 (item 3.0), 11.
- 2026-10-25 · Initial documentation set created from a full review of the codebase (commit `af7ff18`). Frontend build and backend endpoints verified working.
