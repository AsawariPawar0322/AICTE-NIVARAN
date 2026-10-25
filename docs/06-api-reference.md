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

Behaviour: ID `AICTE-2026-GRV-<random 10000–99999>`; stage `REGISTERED` / 1; SLA 72; assigned to Dr. Verma; one timeline event; `complainant_name` replaced by "Anonymous Whistleblower" when anonymous; `related_case_count` = 3 if `link_to_related` else 0. Inserted at the front of `mock_grievances`. `category` is a free string (not validated against the enum).

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

## Quick test with curl

```bash
curl -s localhost:8000/
curl -s "localhost:8000/api/grievances?status=PENDING_OTP"
curl -s "localhost:8000/api/institutions?search=pune"
curl -s -X POST localhost:8000/api/auth/send-otp -H 'content-type: application/json' -d '{"identifier":"aarav"}'
curl -s -X POST localhost:8000/api/grievances/AICTE-2026-GRV-84920/verify-closure-otp \
     -H 'content-type: application/json' -d '{"case_id":"AICTE-2026-GRV-84920","otp":"849210"}'
```

All of these were run successfully against the current code on 2026-10-25.
