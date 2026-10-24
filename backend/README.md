# AICTE NIVARAN · Backend API Service
## Central Technical Grievance Coordination Engine (SIH26264)

FastAPI REST microservice implementing the 7-module AICTE grievance coordination architecture.

---

### Features
- **Authentication & OTP Gateway:** Dispatches and validates 6-digit verification codes for citizen and official logins.
- **Citizen OTP Acknowledgment Engine:** Guarantees that institutions cannot close complaints unilaterally without citizen satisfaction verification.
- **Cryptographic Evidence Verification:** Records and verifies SHA-256 file hashes.
- **Related Case Cluster Finder:** Correlates multiple complaints against the same institution.
- **Official Audit Ledger:** Tracks timestamps, actors, and state transitions.

---

### Running the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Interactive OpenAPI Swagger Documentation: `http://localhost:8000/docs`
