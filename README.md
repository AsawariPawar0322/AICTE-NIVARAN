# AICTE NIVARAN (एआईसीटीई निवारण)
## Unified Technical Grievance Coordination System · SIH26264

<p align="center">
  <img src="public/aicte-nivaran-logo.png" alt="AICTE NIVARAN Official Emblem" width="180" />
</p>

<p align="center">
  <strong>All India Council For Technical Education · Ministry of Education, Government of India</strong><br>
  <em>"योगः कर्मसु कौशलम्" (Excellence in Action)</em>
</p>

---

### 1. Overview

**AICTE NIVARAN** is a centralized, tamper-evident grievance coordination platform designed for over 12,000+ AICTE-approved institutions across India. Built to fulfill Problem Statement **SIH26264**, the platform bridges students, faculty, parents, and administrative cells (Regional Bureaus, PGRC, ICC, and State Technical Ombudsmen).

---

### 2. Core Modules & Key Innovations

1. **One Front Door:** Single-click filing across all approved technical universities with AICTE Permanent ID resolution and voice search.
2. **Citizen-Controlled Closure via OTP:** Institutions cannot close cases unilaterally. Closure requires a 6-digit confirmation OTP entered by the citizen, or automatically triggers escalation to the State Technical Ombudsman.
3. **Cryptographic SHA-256 Proof Vault:** Uploaded evidence (receipts, challans, letters, audio) is stamped with immutable SHA-256 digests on the client side to prevent document tampering during hearings.
4. **Related Case Cluster Finder:** AICTE semantic engine detects multiple complaints against the same college (e.g. batch caution money withholding) and prompts joint hearing linkage.
5. **Direct User-Admin Chatbox:** In-app real-time messaging between complainant and assigned AICTE/Institute Nodal Officer with official audit stamps.
6. **Discord Replica Coordination Hub:** A complete Discord-style multi-channel collaboration hub for peer support, bureau coordination, anti-ragging crisis squads, voice advisory lounge, and `/status` bot commands.
7. **Government-Grade Accessibility (WCAG 2.1 AA & GIGW 3.0):** Bilingual (English + Hindi), high-contrast toggle, font size adjusters (`A-`, `A`, `A+`), and 44px touch targets.

---

### 3. Quick Start & Running Locally

```bash
# Install dependencies
npm install

# Run development server (Vite)
npm run dev

# Build production bundle
npm run build
```

Open `http://localhost:5173/` in your browser.

