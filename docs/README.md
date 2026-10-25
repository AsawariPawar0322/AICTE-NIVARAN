# AICTE NIVARAN · Documentation

Documentation for the AICTE NIVARAN prototype (Smart India Hackathon 2026, problem statement **SIH26264 — AICTE Grievance Coordination and Monitoring**).

## Start here

| If you are… | Read |
|---|---|
| A hackathon evaluator | [10-hackathon-evaluation.md](10-hackathon-evaluation.md), then [09-setup-and-demo.md](09-setup-and-demo.md) |
| New to the project | [01-project-overview.md](01-project-overview.md) → [02-architecture.md](02-architecture.md) → [03-features.md](03-features.md) |
| Changing code | [CONTEXT.md](CONTEXT.md) and [05-file-reference.md](05-file-reference.md) |
| Wiring frontend to backend | [06-api-reference.md](06-api-reference.md) and [07-data-model.md](07-data-model.md) |
| Planning next work | [08-implementation-steps.md](08-implementation-steps.md) and [11-known-gaps-and-roadmap.md](11-known-gaps-and-roadmap.md) |

## Contents

| # | Document | What it covers |
|---|---|---|
| — | [CONTEXT.md](CONTEXT.md) | Quick-reference fact sheet: file map, key symbols, constants, demo values, conventions. Read this before searching the code. |
| 01 | [project-overview](01-project-overview.md) | Problem, solution, users, scope, and an honest table of what is implemented vs simulated |
| 02 | [architecture](02-architecture.md) | Tech stack, system diagram, frontend state model, routing, styling system |
| 03 | [features](03-features.md) | Each feature: purpose, where it lives, how it works, status |
| 04 | [feature-relationships](04-feature-relationships.md) | How features connect: navigation graph, complaint lifecycle, shared state, data dependencies |
| 05 | [file-reference](05-file-reference.md) | The role of every file in the repository |
| 06 | [api-reference](06-api-reference.md) | Backend FastAPI endpoints with request/response shapes |
| 07 | [data-model](07-data-model.md) | Types, enums, seed data, frontend ↔ backend field mapping |
| 08 | [implementation-steps](08-implementation-steps.md) | How the prototype was built, and step-by-step plan for the remaining work |
| 09 | [setup-and-demo](09-setup-and-demo.md) | Run locally, demo credentials, a timed demo script for judges |
| 10 | [hackathon-evaluation](10-hackathon-evaluation.md) | Mapping to evaluation criteria, pitch points, likely judge questions and answers |
| 11 | [known-gaps-and-roadmap](11-known-gaps-and-roadmap.md) | Known bugs, tech debt, unused files, roadmap |
| 12 | [admin-support-inbox](12-admin-support-inbox.md) | Plan: admin Messages / Support Inbox linked to complaints (planned) |
| — | [CHANGELOG.md](CHANGELOG.md) | Log of documentation updates tied to code changes |

## Keeping these docs current

These docs describe the code as it is. Whenever code changes, update the affected docs in the same change:

| Change | Update |
|---|---|
| Add/remove/rename a file | [05-file-reference.md](05-file-reference.md), [CONTEXT.md](CONTEXT.md) file map |
| Add/change an endpoint or schema | [06-api-reference.md](06-api-reference.md), [07-data-model.md](07-data-model.md) |
| Add/change a type, enum, or seed record | [07-data-model.md](07-data-model.md), [CONTEXT.md](CONTEXT.md) |
| Add/change a feature or view | [03-features.md](03-features.md), [04-feature-relationships.md](04-feature-relationships.md), status table in [01-project-overview.md](01-project-overview.md) |
| Fix a known gap | [11-known-gaps-and-roadmap.md](11-known-gaps-and-roadmap.md), [10-hackathon-evaluation.md](10-hackathon-evaluation.md) if it changes what can be claimed |
| Change setup/run commands or demo values | [09-setup-and-demo.md](09-setup-and-demo.md), [CONTEXT.md](CONTEXT.md) |

Then add a line to [CHANGELOG.md](CHANGELOG.md).

Line numbers quoted in these docs are accurate as of the last changelog entry; they drift as files change, so confirm with a quick search before relying on one.
