# SIH26264 · AICTE Grievance Coordination System

## 1. Design goals

- **One front door.** A student, faculty member or parent reaches "File a complaint" in one click from anywhere.
- **Plain language** for complainants; dense, scannable screens for officials.
- **Always know the status.** Every case shows where it is, who owns it, what happens next and by when.
- **Find the source fast.** Officials locate the institution, region and related cases within two interactions.
- **Government-grade accessibility.** WCAG 2.1 AA minimum, aligned with GIGW 3.0, bilingual from day one, usable on a low-end phone.
- **Quiet visual design.** Flat surfaces, restrained colour, real spacing. No gradients, glass effects, glow or decorative illustrations; those are what make an interface feel machine-generated.
- **Code-first.** The design system is built directly in code (Storybook), with no Figma step in between.

## 2. Pain points in the existing ecosystem

Items marked *validate* are hypotheses to confirm with a heuristic audit and about five user interviews.

| # | Pain point | Evidence | Design response |
| --- | --- | --- | --- |
| 1 | **Fragmented channels:** institute portals, Google Forms, AICTE's Centralized Support System (CSS) and CPGRAMS. | AICTE guidelines say weak institute redressal pushes people to CPGRAMS. | One portal, one complaint ID, one tracker. |
| 2 | **Inconsistent outcomes.** AICTE's chairman has said some grievances are addressed, some delayed and some not. | HT interview, 2017. | Visible SLA clock, reminders, escalation ladder. |
| 3 | **Little visibility after submission.** CSS promises a reply within 72 working hours, but that is a promise, not a visible timeline. *Validate.* | Institute notices citing CSS. | Timeline with owner, last action, next step, due date. |
| 4 | **Related complaints are invisible** across bureaus. | Your architecture (Related Case Finder). | Related-cases panel, link and merge actions. |
| 5 | **Manual monthly reporting** of received, disposed and pending counts. | AICTE guidelines. | Auto-generated institution and bureau dashboards. |
| 6 | **Category confusion.** Ragging, harassment, fees and scholarships have different handlers and urgency. | Separate cells in most institutes. | Guided category cards with examples; urgent categories show helplines. |
| 7 | **Evidence friction.** *Validate:* upload limits, no mobile camera, no drafts. | Hypothesis. | Draft autosave, camera upload, limits shown before upload. |
| 8 | **Language and device.** *Validate:* English-only, desktop-first forms. | Hypothesis. | Mobile-first, English + Hindi at launch. |
| 9 | **Visual issues on the AICTE Internships page:** about 2.5:1 contrast on white-on-coral buttons, an oversized logo overlapping the header, an auto-rotating promo banner above the main task, low-contrast carousel arrows. | Your screenshot. | Darker action colour, fixed logo lockup, no carousel on core screens. |

## 3. What to take from your reference images

| Reference | Keep | Adapt for |
| --- | --- | --- |
| **Flowchart** (complainant and official paths) | Role selection first, two separate journeys, loop for "additional information requested". | Landing page with two role cards, then role-specific shells. |
| **System architecture** | Seven modules, plus notifications and evidence storage as shared services. | Information architecture of the official side. |
| **Datadog Trust Center** (card grid) | Search, grid/list toggle, filter dropdown, Export, card with name + one-line description + region chip. | Institution and bureau directories, complaint category cards. |
| **CareMap service locations** (list + map) | Left list with search and filter, right map, selected row matched to its pin. | **Origin explorer** for officials, with pins by pending-case count. |
| **AICTE Internships portal** | Orange + blue identity, two-button role switch (Find / Hire), large search bar with voice icon, logo lockup row, Login/Register top right. | Complainant / Official switch, voice-enabled institution search, header strip. |

Copy the patterns only. Other products' branding, colours and icons must not appear in ours. Avoid portraits of public figures; a grievance tool should look neutral.

## 4. Foundations

### 4.1 Colour tokens (calibrated to AICTE)

Body text pairs meet WCAG AA (4.5:1). The AICTE coral stays as the brand colour but is never used for small text or under white text.

| Token | Hex | Use |
| --- | --- | --- |
| `brand-orange-500` | #F2895E | AICTE signature orange: bars, icons, large shapes, focus accents only |
| `action-600` | #C2570C | Filled primary buttons with white text (about 4.6:1), orange text links |
| `action-700` | #9A4509 | Hover and pressed |
| `brand-blue-600` | #1F5FBF | Feature banners, selected tabs, links on white |
| `brand-blue-100` | #E6EEF9 | Selected rows, info panels |
| `navy-900` | #0B2A5B | Headings, header strip |
| `neutral-900` / `600` / `300` / `100` | #1A1F2B / #4B5565 / #CBD2DC / #F3F5F8 | Text, secondary text, borders, page background |
| `success` | #166534 on #DCFCE7 | Resolved |
| `warning` | #92400E on #FEF3C7 | Due soon |
| `danger` | #B91C1C on #FEE2E2 | Overdue, errors |
| `info` | #1D4ED8 on #DBEAFE | In progress |
| `focus` | #1D4ED8, 3px outline, 2px offset | Keyboard focus on everything |

Colour never carries meaning alone: every status pairs colour with an icon and a text label.

### 4.2 Typography

- **Noto Sans** (Latin and Devanagari). Stack: `"Noto Sans", "Noto Sans Devanagari", "Segoe UI", Arial, sans-serif`. Replace with AICTE's live font if DevTools shows a different one.
- **Noto Sans Mono** for complaint IDs only.

| Style | Size / line | Weight | Use |
| --- | --- | --- | --- |
| Display | 32 / 40 | 700 | Landing hero only |
| H1 | 28 / 36 | 700 | Page title |
| H2 | 22 / 30 | 600 | Section |
| H3 | 18 / 26 | 600 | Card title |
| Body | 16 / 24 | 400 | Default; never smaller on complainant screens |
| Small | 14 / 20 | 400 | Helper text, official tables |
| Caption | 12 / 16 | 500 | Chips and metadata |

Text scales to 200% without loss. Use sentence case.

### 4.3 Spacing, shape, elevation

- Spacing scale (4px base): 4, 8, 12, 16, 24, 32, 48, 64.
- Grid: 12 columns desktop (max 1200), 8 tablet, 4 mobile.
- Radius: 4px inputs and chips, 8px cards and modals; pills only for status chips and the role switch.
- Borders instead of shadows; one soft shadow only for dropdowns and modals.
- Touch targets at least 44×44px with 8px gaps.

### 4.4 Icons and imagery

One outline icon set (Lucide or Material Symbols), 24px, always paired with labels in navigation. Use the AICTE, Ministry and emblem logos as supplied, in a fixed-height lockup (40–48px). No stock illustrations; if imagery is needed, use real campus photos with alt text.

## 5. Components

Build each with default, hover, focus, disabled, error and loading states.

- **Header strip:** emblem and AICTE name in English and Hindi, language switcher, text-size controls, "Skip to main content" as the first focusable element.
- **Navigation:** complainant top nav (Home, File a complaint, Track a complaint, Help); official sidebar (Dashboard, My cases, All cases, Institutions, Map, Reports); breadcrumbs beyond two levels.
- **Role switch:** two-button control as on the Internships page, with the active role filled in `action-600`.
- **Inputs:** text, text area with counter, select, radio and checkbox groups, date picker, file uploader (drag area plus visible button, thumbnails, progress, remove). Labels always above fields; errors say what to fix, with icon and text.
- **Institution picker:** searchable combobox by name, city or AICTE permanent ID, with voice input.
- **Buttons:** primary, secondary (outlined), tertiary (text), danger (with confirmation). One primary per view.
- **Feedback:** inline alerts, toasts (not auto-dismissed under 6 seconds, announced to screen readers), modals for destructive confirmation only.
- **Status chip:** icon + label (Registered, Under review, Info requested, Escalated, Resolved, Rejected). Overdue adds a red clock and "Overdue by 3 days".
- **Case card, data table** (sortable, sticky header, selection, density toggle, column chooser, CSV export, pagination), **timeline**, **stepper**, **directory card grid**, **map + list split view**.

## 6. Key patterns and screens

### 6.1 Complainant journey

1. **Landing:** role switch, search bar, two big cards (File, Track), a three-step explainer, helplines for urgent categories. No carousel.
2. **Sign in:** mobile or email with OTP; guest tracking by complaint ID + mobile.
3. **File a complaint, 5 autosaved steps:** who you are; what happened (category cards with examples, plus "I'm not sure"); where (institution search); details and evidence; review and submit.
4. **Confirmation:** large complaint ID with copy and SMS/email, expected first response date, Track button.
5. **Track:** timeline, current owner (role, not a personal number), next step, due date, "Add information" when requested.
6. **Related-case prompt:** show similar open cases for the institution and let the user link theirs.

### 6.2 Official journey

- **Dashboard:** tiles for New, Assigned to me, Due in 3 days, Overdue (each a pre-filtered link), a needs-action table, institution and bureau filters.
- **Case detail:** header with ID, status, owner and SLA; tabs for Overview, Evidence, History, Related cases, Notes; action rail for Request information, Update progress, Transfer, Escalate, Record decision.
- **Allotment:** triage queue with suggested bureau, one-click and bulk assign, visible workload per officer.
- **Origin explorer:** searchable institution list beside a map; selecting a row highlights its pin and opens a profile (permanent ID, case counts, oldest pending case, trend, bureaus involved).
- **Reports:** pending and overdue by institution, bureau and category; CSV/PDF export; scheduled monthly summary.

Every list has a written empty state with a next action; tables use skeleton rows; errors give a plain explanation, a retry and a reference code.

## 7. Accessibility checklist

- Contrast 4.5:1 for text, 3:1 for large text and UI components.
- Full keyboard use, visible focus, logical order, no traps.
- Semantic headings, landmarks and labels; ARIA only where native HTML cannot do it.
- Tested with NVDA and TalkBack; status changes announced through live regions.
- Map always has a list alternative (default on mobile); charts have a data-table alternative.
- Respect `prefers-reduced-motion`; no autoplay or auto-refresh.
- Error summary at the top linked to fields; session time-outs warn and allow extension.
- OTP instead of image CAPTCHAs.
- Hindi layouts tested (text runs about 20–30% longer).

## 8. Content and tone

Short sentences, active voice, no exclamation marks. Buttons are verbs (File a complaint, Add information, Assign case). Say what happens next on every confirmation. Use "complaint", not "ticket" or "grievance redressal", on complainant screens. Sensitive categories get a calm tone, an immediate helpline and only confidentiality promises that your legal or AICTE mentor has confirmed.

## 9. Design system as code (no Figma)

Storybook replaces the Figma library: every component is documented, interactive and tested in one place, and the same code ships to production.

**Stack**

- React + TypeScript + Vite. Public pages are prerendered to static HTML; authenticated pages are a client-side app.
- Tailwind CSS or CSS modules, driven only by tokens.
- Radix UI or React Aria for accessible dialogs, menus, comboboxes and tabs.
- Storybook with the a11y addon; Playwright and axe in CI.

**`tokens.css`:** components reference these variables, never raw hex.

```css
:root {
  --color-action: #C2570C;
  --color-action-hover: #9A4509;
  --color-brand-orange: #F2895E;
  --color-brand-blue: #1F5FBF;
  --color-navy: #0B2A5B;
  --color-text: #1A1F2B;
  --color-text-muted: #4B5565;
  --color-border: #CBD2DC;
  --color-bg: #F3F5F8;
  --color-surface: #FFFFFF;
  --color-focus: #1D4ED8;
  --font-sans: "Noto Sans", "Noto Sans Devanagari", "Segoe UI", Arial, sans-serif;
  --font-mono: "Noto Sans Mono", ui-monospace, monospace;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px;
  --radius-sm: 4px; --radius-md: 8px;
}
:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```

**Folder structure**

```
src/
  design-system/   tokens.css, Button, Input, Select, StatusChip, Timeline, DataTable, Stepper
  features/        complaint/, tracking/, official/, explorer/
  lib/             api client, i18n, analytics, formatters
  routes/          route-level lazy entries
  locales/         en/, hi/, ... one JSON per language per feature
```

## 10. Frontend system design for India-scale traffic

Assume heavy peak load from mid-range Android phones on patchy 4G. The site must stay fast on the worst realistic device and network.

### 10.1 Performance budget (enforced with Lighthouse CI)

| Metric | Target |
| --- | --- |
| Largest Contentful Paint (4G, mid-range phone) | under 2.5 s |
| Interaction to Next Paint | under 200 ms |
| Cumulative Layout Shift | under 0.1 |
| JavaScript on first load of landing / complaint path | under 170 KB gzipped |
| Any route chunk | under 100 KB gzipped |
| Landing page weight | under 500 KB |

### 10.2 Rendering and caching

- Landing, help, FAQ and category pages are static, CDN-served and prerendered per language; they carry most of the traffic.
- Sign-in, complaint, tracking and official screens run as a client app shell.
- Hashed assets cached for a year (`immutable`), short-lived HTML, Brotli, HTTP/2 or 3.

### 10.3 Lazy loading and code splitting

- **Route-level splitting** with `React.lazy` and `Suspense` and skeleton fallbacks. The official bundle is a separate entry behind login.
- **On-demand widgets:** the map library, charts, rich text and CSV/PDF export load by dynamic `import()` only when opened.
- **Images:** `loading="lazy"`, explicit width and height, AVIF/WebP, `srcset`.
- **Prefetch on intent:** hover, focus, or completion of the previous form step.
- **Fonts:** self-hosted, subset by script with `unicode-range`, `font-display: swap`; preload only Latin regular and bold; Indic scripts load only for users who pick those languages.

### 10.4 State management: each kind of state in its own place

| State type | Tool | Examples |
| --- | --- | --- |
| Server state | TanStack Query | Cases, institutions, notifications: caching, de-duplication, retries, pagination |
| Form state | React Hook Form + Zod | Complaint steps, validation |
| Local UI state | `useState` / `useReducer` | Menus, tabs |
| Small global state | Zustand or Context | Language, text size, user, sidebar |
| URL state | Router search params | Filters, sort, page, selected institution (shareable, back button works) |
| Draft persistence | IndexedDB | Autosaved complaint draft survives refresh and network loss |

Do not copy server data into global stores, keep global state tiny, derive instead of storing, and use selectors so components re-render only for their slice.

### 10.5 Large lists and tables

Server-side cursor pagination (never fetch all cases); virtualise anything over about 100 rows; debounce search (300 ms) and cancel stale requests with `AbortController`; memoise heavy rows after profiling; on the map, cluster pins, render the viewport only, use vector tiles, and default to the list on mobile.

### 10.6 Network resilience

- Autosave drafts locally; sync when online.
- Resumable, chunked uploads with client-side compression (about 1 MB per photo) and limits shown up front.
- Retry with exponential backoff and jitter; offline banner.
- Service worker (PWA) caches the app shell and static pages; tracking opens offline with the last known data.
- Complainants: refresh on focus plus SMS or email; officials: Server-Sent Events or short polling with backoff. No persistent sockets for the public.
- Skeletons instead of spinners; optimistic updates only for safe actions.

### 10.7 Multilingual (i18n)

- react-i18next or FormatJS, with locale JSON split per language and per feature, loaded on demand.
- English and Hindi at launch; Marathi and other regional languages next. The switcher sits in the header strip and the choice persists.
- Set `lang` on `<html>` and on mixed-language fragments; `hreflang` on public pages.
- Use `Intl` for dates, plurals and Indian number grouping (`en-IN`, for example 12,34,567).
- No text in images; allow 30–40% expansion; test every screen in Hindi.
- Keep complaint categories as stable IDs and translate only the labels, so reports stay consistent across languages.

### 10.8 Resilience, security, observability

- Error boundaries per route and widget, with a retry and a reference code.
- Strict Content Security Policy; session tokens in `httpOnly`, `Secure`, `SameSite` cookies (not `localStorage`); file type and size validated on client and server; OTP rate limits on the backend.
- Real-user Core Web Vitals, error tracking, and funnel analytics on the complaint steps (where do people drop off?), with no complaint content collected.
- Feature flags for gradual rollouts.

### 10.9 What the frontend relies on from the backend

CDN in front of everything; compressed, paginated APIs; cacheable read endpoints for institutions and categories; idempotent submit endpoints so a retry cannot create duplicate complaints; a queue behind complaint registration so spikes do not slow the page.

## 11. Validation plan (strengthens your SIH presentation)

- **Heuristic audit** of css.aicte-india.org and one institute portal against Nielsen's 10 heuristics; screenshot 5–8 issues as your "before".
- **Usability test** with 5 users on the complaint form (goal: under 4 minutes unaided) and 3 officials or proxies on allotment.
- **Metrics:** time to file, steps to find a case's institution, task success rate, SUS score, Lighthouse scores.
- Present a before/after for two pain points.

## 12. Build order

1. Repo setup (Vite, React, TypeScript), Storybook, `tokens.css`, ESLint, Playwright and axe checks.
2. Core components: Button, Input, Select, Checkbox/Radio, StatusChip, Alert, Stepper, Card, DataTable, Timeline.
3. Public shell: header strip with language switcher, landing page with role switch and search, footer.
4. Complaint flow end to end with draft autosave and uploads (mock the API with MSW).
5. Tracking, then the official dashboard, then the origin explorer (map loaded lazily).
6. Run Lighthouse and axe, fix budget misses, and record before/after metrics for the presentation.

Next deliverable on request: the runnable project scaffold (tokens, core components, landing page).
