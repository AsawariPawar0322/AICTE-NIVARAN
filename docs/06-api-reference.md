# 06 · Backend API reference

FastAPI app in `backend/main.py`. Base URL in development: `http://localhost:8000`. Interactive docs: `/docs` (Swagger) and `/redoc`.

- All request bodies are JSON validated by models in `backend/app/schemas.py`.
- Responses are plain JSON objects in **snake_case**.
- Errors use FastAPI's format: `{"detail": "<message>"}`.
- CORS allows all origins, methods, and headers.
- State is in memory (`backend/app/database.py`) and resets on restart.
- There is no authentication on any route; returned tokens are placeholders and never checked.

## Summary

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Service info and counts |
| POST | `/api/auth/send-otp` | Generate and "send" a login OTP |
| POST | `/api/auth/verify-otp` | Verify login OTP, return session profile |
| POST | `/api/auth/login` | Login, with built-in demo personas |
| GET | `/api/grievances` | List grievances, optional filters |
| GET | `/api/grievances/{case_id}` | Get one grievance |
| POST | `/api/grievances` | Create a grievance |
| POST | `/api/grievances/{case_id}/verify-closure-otp` | Complainant confirms resolution with OTP |
| POST | `/api/grievances/{case_id}/escalate` | Complainant rejects resolution, escalates to Ombudsman |
| GET | `/api/institutions` | List/search institutions |
| GET | `/api/inbox` | Support Inbox: one summary per grievance conversation |
| GET | `/api/grievances/{case_id}/messages` | Full conversation for a grievance |
| POST | `/api/grievances/{case_id}/messages` | Send a message, clarification or document request |
| POST | `/api/grievances/{case_id}/messages/read` | Mark a thread read for officer or complainant |
| POST | `/api/grievances/{case_id}/document-requests/{request_id}/fulfill` | Complainant submits files for a document request |

---

## GET `/`

Response:
```json
{
  "portal": "AICTE NIVARAN (एआईसीटीई निवारण)",
  "council": "All India Council For Technical Education",
  "motto": "योगः कर्मसु कौशलम्",
  "status": "online",
  "timestamp": "2026-10-25T14:43:06.113984",
  "registered_institutions": 5,
  "active_cases": 1
}
```

## POST `/api/auth/send-otp`

Body (`SendOtpRequest`): `{ "identifier": "+91 98712 34567", "role": "Student" }` (`role` optional, default `"Student"`).

Behaviour: if `identifier` contains `98712` or `aarav`, the OTP is `849210`; otherwise a random 6-digit number. Stored in `mock_otp_sessions[identifier]`.

Response:
```json
{ "success": true, "message": "6-Digit OTP dispatched to +91 98712 34567",
  "demo_hint_otp": "849210", "expires_in_seconds": 300 }
```
The OTP is returned in the response for demo purposes; expiry is not enforced.

## POST `/api/auth/verify-otp`

Body (`VerifyOtpRequest`): `{ "identifier": "...", "otp": "849210", "role": "Student" }`.

Expected OTP = stored session OTP, or `849210` if none stored. Wrong OTP → **400** `"Invalid OTP code. Please enter the valid 6-digit code."`

Response:
```json
{ "success": true, "token": "jwt_nivaran_<unix-ts>",
  "user": { "name": "Aarav Sharma", "role": "Student", "identifier": "...",
            "institution": "Delhi Technological University (DTU)",
            "roll_or_id": "2024-CS-108", "is_authenticated": true } }
```
Name is "Aarav Sharma" for the demo identifiers, otherwise "Verified Citizen".

## POST `/api/auth/login`

Body (`LoginRequest`): `{ "identifier": "...", "role": "AICTE_OFFICER", "password_or_pin": null, "is_demo": true }`.

With `is_demo: true`:

| `role` | Returned user |
|---|---|
| `AICTE_OFFICER` | Dr. Ramesh Chandra Verma, AICTE Official, Director PGRC, token `jwt_officer_verma_pgrc` |
| `COLLEGE_NODAL` | Prof. K. S. Rao, Institute Nodal Officer, Registrar DTU, token `jwt_nodal_dtu_registrar` |
| anything else | Aarav Sharma, Student, DTU, token `jwt_student_aarav_sharma` |

With `is_demo: false`: always succeeds; name is derived from the email local part (title-cased) or "Verified User". The password is not checked.

## GET `/api/grievances`

Query params (all optional): `status` (matches `current_stage`, case-insensitive), `category` (case-insensitive), `institution` (substring of `institution_name`).

Response: array of grievance objects (see [07-data-model.md](07-data-model.md#backend-grievance-object)).

## GET `/api/grievances/{case_id}`

Case-insensitive ID match. Not found → **404** `"Grievance not found"`.

## POST `/api/grievances`

Body (`CreateGrievanceRequest`):
```json
{
  "title": "...", "category": "FEES_REFUND", "category_label": "Fee Refund & Excess Charges",
  "institution_name": "Delhi Technological University (DTU)", "aicte_permanent_id": "1-10928341",
  "city": "New Delhi", "state": "Delhi",
  "complainant_name": "Aarav Sharma", "complainant_role": "Student",
  "contact_mobile": "+91 98712 34567", "contact_email": "aarav.sharma@example.com",
  "is_anonymous": false, "details": "...",
  "evidence_list": [ { "id": "ev-1", "name": "receipt.pdf", "size": 1024,
                       "type": "application/pdf", "sha256_hash": "<64 hex>",
                       "upload_date": "Just now" } ],
  "link_to_related": true
}
```

Behaviour: ID `AICTE-2026-GRV-<random 10000–99999>`; stage `REGISTERED` / 1; SLA 72; assigned to Dr. Verma; one timeline event; `complainant_name` replaced by "Anonymous Whistleblower" when anonymous; `related_case_count` = 3 if `link_to_related` else 0. Inserted at the front of `mock_grievances`. A conversation is opened in `mock_messages` with one system message. `category` is a free string (not validated against the enum).

Response: `{ "success": true, "case_id": "AICTE-2026-GRV-12345", "grievance": { ... } }`.

## POST `/api/grievances/{case_id}/verify-closure-otp`

Body (`VerifyClosureOtpRequest`): `{ "case_id": "...", "otp": "849210", "citizen_feedback": "...", "satisfaction_rating": 5 }` (`citizen_feedback` and `satisfaction_rating` optional). The path `case_id` is used; the body `case_id` is required but ignored.

Errors: **404** `"Case not found"`; **400** wrong OTP.
Expected OTP = `otp_verification.generated_otp` or `849210`.

Effect: `current_stage = "RESOLVED"`, `stage_number = 6`, `sla_hours_remaining = 0`, `otp_verification` filled (`is_verified`, `verified_at`, feedback, rating), timeline event appended.

Response:
```json
{ "success": true, "message": "Citizen OTP successfully authenticated. Grievance marked RESOLVED.",
  "certificate_ref": "CERT-NIVARAN-2026-84920", "case": { ... } }
```

Does not check that the case is in `PENDING_OTP` first.

## POST `/api/grievances/{case_id}/escalate`

Body (`EscalateRequest`): `{ "case_id": "...", "dissatisfied_reason": "Refund amount incorrect" }`.

Errors: **404** `"Case not found"`.
Effect: `current_stage = "ESCALATED"` and a timeline event quoting the reason.
Response: `{ "success": true, "message": "Case escalated to State Technical Ombudsman.", "case": { ... } }`.

## GET `/api/institutions`

Query: `search` (optional) — case-insensitive substring of `name`, `permanent_id`, or `city`. (The frontend search also matches `state`; the backend does not.)

Response: array of institution objects.

---

## Support Inbox and case conversations

Messages are stored per grievance in `mock_messages[case_id]`. Message object:

```json
{
  "id": "msg-1792921236173-138", "complaint_id": "AICTE-2026-GRV-84920",
  "kind": "text | clarification | document_request | document_submission | system",
  "sender_role": "complainant | officer | system", "sender_name": "Aarav Sharma",
  "content": "...", "timestamp": "Just now",
  "attachments": [ /* EvidenceUploadItem */ ],
  "document_request": { "id": "docreq-…", "items": ["Bank statement"], "note": null,
                        "due_date": "28 Oct 2026", "status": "pending | fulfilled",
                        "fulfilled_at": "Just now", "fulfilled_file_ids": ["ev-9"] },
  "reply_to_request_id": "docreq-…",
  "is_official_note": false,
  "read_by_officer": true, "read_by_complainant": false
}
```
`document_request` appears only on `document_request` messages; `reply_to_request_id` only on `document_submission` messages. The sender's own read flag starts `true`.

All routes below return **404** `"Case not found"` for an unknown `case_id`.

### GET `/api/inbox`

Query: `filter` = `all` (default) \| `unread` \| `awaiting` \| `docs_pending` (anything else → **422**); `search` (optional, substring of case ID, complainant name, or institution).

Response: array sorted unread first, then awaiting reply:
```json
[{ "case_id": "AICTE-2026-GRV-84920", "title": "...", "complainant_name": "Aarav Sharma",
   "institution_name": "Delhi Technological University (DTU)", "current_stage": "PENDING_OTP",
   "sla_hours_remaining": 18, "last_message": "...", "last_message_at": "Today at 11:32 AM",
   "unread_for_officer": 0, "awaiting_reply": false, "pending_requests": 0 }]
```
`awaiting_reply` is true when the last non-system message came from the complainant.

### GET `/api/grievances/{case_id}/messages`

Response: the message array for that grievance (empty if none).

### POST `/api/grievances/{case_id}/messages`

Body (`ChatMessageRequest`):
```json
{ "sender_role": "officer", "sender_name": "Dr. Ramesh Chandra Verma",
  "content": "Please upload the documents listed below.",
  "kind": "document_request",
  "document_request": { "items": ["Bank statement"], "note": "PDF is fine", "due_date": "28 Oct 2026" },
  "attachments": [] }
```
- `sender_role`: `complainant` \| `officer`. `kind`: `text` (default) \| `clarification` \| `document_request`.
- `clarification` and `document_request` from a complainant → **403**.
- `document_request` without `document_request.items` → **400**.
- Side effects on the grievance: `document_request` → timeline "Documents Requested from Complainant"; `clarification` → timeline "Clarification Issued to Complainant" (`is_official_note: true`); any `attachments` → appended to `evidence_list` + timeline "Supplementary Evidence Shared via Case Conversation".

Response: `{ "success": true, "message": { ... } }`.

### POST `/api/grievances/{case_id}/messages/read`

Body (`MarkReadRequest`): `{ "reader_role": "officer" }` (or `"complainant"`).
Response: `{ "success": true, "marked_read": 1 }`.

### POST `/api/grievances/{case_id}/document-requests/{request_id}/fulfill`

Body (`FulfillDocumentRequest`):
```json
{ "sender_name": "Aarav Sharma",
  "attachments": [{ "id": "ev-9", "name": "statement.pdf", "size": 1000,
                    "type": "application/pdf", "sha256_hash": "<64 hex>" }] }
```
Errors: **404** unknown request; **409** already fulfilled; **400** no attachments.
Effect: request → `fulfilled` (with `fulfilled_at`, `fulfilled_file_ids`); a `document_submission` message is added (unread for the officer); files appended to `evidence_list`; timeline "Requested Documents Submitted by Complainant".
Response: `{ "success": true, "message": { ... }, "document_request": { ... } }`.

## Quick test with curl

```bash
curl -s localhost:8000/
curl -s "localhost:8000/api/grievances?status=PENDING_OTP"
curl -s "localhost:8000/api/institutions?search=pune"
curl -s -X POST localhost:8000/api/auth/send-otp -H 'content-type: application/json' -d '{"identifier":"aarav"}'
curl -s -X POST localhost:8000/api/grievances/AICTE-2026-GRV-84920/verify-closure-otp \
     -H 'content-type: application/json' -d '{"case_id":"AICTE-2026-GRV-84920","otp":"849210"}'

# Support Inbox
curl -s "localhost:8000/api/inbox?filter=unread"
curl -s localhost:8000/api/grievances/AICTE-2026-GRV-84920/messages
curl -s -X POST localhost:8000/api/grievances/AICTE-2026-GRV-84920/messages -H 'content-type: application/json' \
     -d '{"sender_role":"officer","sender_name":"Dr. Verma","content":"Please upload","kind":"document_request","document_request":{"items":["Bank statement"]}}'
curl -s -X POST localhost:8000/api/grievances/AICTE-2026-GRV-84920/messages/read -H 'content-type: application/json' -d '{"reader_role":"officer"}'
curl -s -X POST localhost:8000/api/grievances/AICTE-2026-GRV-84920/document-requests/<request_id>/fulfill -H 'content-type: application/json' \
     -d '{"sender_name":"Aarav Sharma","attachments":[{"id":"ev-9","name":"statement.pdf","size":1000,"type":"application/pdf","sha256_hash":"ab12"}]}'
```

All of these were run successfully against the current code on 2026-10-25, including the 400/403/404/409/422 error cases.
