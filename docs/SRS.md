# Software Requirements Specification (SRS)

## University Library SPA: Catalog Browsing and Loan Management

**Document Version:** 1.2
**Status:** Draft, first delivery
**Standard Reference:** Structured per IEEE 29148 conventions, adapted for project scale.

---

## Revision History

| Version | Date | Description |
| --- | --- | --- |
| 1.0 | 2026-09-27 | Initial version, aligned with the capstone definition and the Open Library API spike (SPIKE-01). |
| 1.1 | 2026-09-30 | Live verification of Open Library API completed (SPIKE-01); ASM-02 and ASM-05 validated, OPEN-01 closed. |
| 1.2 | 2026-09-30 | OPEN-02 resolved via ADR-0001: adopted HttpOnly, Secure, SameSite cookies for JWT storage. |
| 1.3 | 2026-10-07 | OPEN-03, OPEN-04, and OPEN-05 resolved via ADR-0002, ADR-0003, and ADR-0004 respectively. |

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements of a **University Library Single-Page Application**. It is the single source of truth for scope, behavior, and constraints during design, implementation, and testing. Every requirement has a unique ID (`FR-xx`, `NFR-xx`, `BR-xx`) for traceability to design artifacts, code, and tests.

### 1.2 Scope

The system is a Single-Page Application (SPA) backed by a custom REST API. It allows registered users to:

- Browse and search the full Open Library book catalog.
- View a dedicated detail page for each book.
- Filter by category and sort by publication date, author, or popularity.
- Borrow books, renew them, return them, and track due dates.
- Reserve books whose copies are all currently borrowed.
- Track personal reading status per book (Reading, Completed).

The backend is the system of record for users, loans, reservations, and reading status, and enforces lending rules transactionally. Open Library is the source of bibliographic metadata only; it has no knowledge of the library's loans.

**Out of scope for this version:** wishlist and availability notifications (the capstone's optional advanced feature), late fines/payments, email/SMS/push notifications, administrator or librarian roles, physical barcode/RFID integration, ILS protocols (SIP2/NCIP), inter-library loans.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
| --- | --- |
| SRS | Software Requirements Specification |
| SPA | Single-Page Application |
| User | A registered person (student or faculty). The only role in the system. |
| Visitor | An unauthenticated person; can browse but not borrow. |
| Work | An abstract book in Open Library, independent of edition (key such as `OL27448W`). |
| Copies | The number of physical-equivalent copies the library "owns" for a Work. Implicit: defaults to `DEFAULT_COPIES` until stored. |
| Loan | A record that a User has borrowed one copy of a Work, with a due date. |
| Reservation | A place in a FIFO queue for a Work whose copies are all unavailable. |
| Hold | A copy set aside for the first User in a Reservation queue for a limited pickup window. |
| Reading Status | A single per-user, per-Work status: `READING` or `COMPLETED`. |
| Overdue | An unreturned Loan whose due date has passed. |
| MoSCoW | Priority scheme: Must, Should, Could. |

### 1.4 References

- Capstone project definition, "Desarrollo Web: Proyecto Final" (Jala University, 2026).
- Open Library Search API: <https://openlibrary.org/dev/docs/api/search>
- Open Library Covers API: <https://openlibrary.org/dev/docs/api/covers>
- IEEE 29148:2018, Requirements engineering
- C4 Model: <https://c4model.com>

### 1.5 Document Overview

Section 2 gives the product overview. Section 3 defines business rules. Section 4 lists functional requirements. Section 5 lists non-functional requirements. Section 6 covers external interfaces. Section 7 gives use cases with acceptance criteria. Section 8 is the traceability matrix to the capstone. Section 9 lists assumptions and open issues.

---

## 2. Overall Description

### 2.1 Product Perspective

Three logical parts:

1. **Frontend:** React + TypeScript SPA (mobile-first). Presentation, client-side routing, state management, calls to the backend API only.
2. **Backend:** Node.js + Express + TypeScript REST API with PostgreSQL. Owns authentication and all library state. Also acts as a caching proxy in front of Open Library.
3. **External Catalog:** Open Library public API. Read-only source of metadata (search, details, covers).

**Design principle (two sources of truth, cleanly split):**

| Data | Source of truth |
| --- | --- |
| Bibliographic data (title, authors, description, subjects, publish year, cover) | Open Library |
| Library state (users, loans, reservations, holds, reading status) | Project backend / PostgreSQL |

The backend never mirrors the Open Library catalog. Its records reference a book by Open Library work key (e.g. `OL27448W`). A minimal metadata snapshot (title, first author, cover id) is stored with each loan, reservation, and reading status record so that personal lists render even if Open Library is unavailable.

**Implicit copies model.** Every Work in Open Library is borrowable. A Work has `DEFAULT_COPIES` copies (default 3) unless the backend has a stored record for it. The backend creates that record lazily on the first borrow or reservation of the Work. There is no administrator or librarian role.

### 2.2 Product Functions (Summary)

- Registration, login, logout.
- Catalog search, category filtering, sorting, pagination with availability shown per result.
- Book detail page with live availability, borrow/reserve actions, and reading-status control.
- "My Loans": active loans, due dates, overdue status, renew, return, history.
- Reservations queue with hold-and-pickup window.
- Reading status tracker (Reading, Completed).

### 2.3 User Classes

| Class | Description |
| --- | --- |
| User | Student or faculty. Borrows, reserves, renews, returns. Sees only their own data. |
| Visitor | Unauthenticated. Can browse, search, and view details. Prompted to log in to act. |

### 2.4 Constraints

- `CON-01`: Catalog metadata comes from Open Library, a third-party, keyless, rate-limited service whose Search API is documented as under active development.
- `CON-02`: Language and framework: TypeScript and React (capstone stack). Routing with React Router DOM. State via React Context API or Redux Toolkit. Data fetching via Fetch API or Axios.
- `CON-03`: Backend: Node.js, Express, TypeScript, PostgreSQL (Prisma ORM).
- `CON-04`: Authentication is built by the project (bcrypt + JWT), with no external identity provider.
- `CON-05`: Frontend is deployed to a static/serverless host (Vercel, Netlify, or AWS Amplify). Backend and database are deployed to a PaaS with managed PostgreSQL.
- `CON-06`: TypeScript strict mode on frontend and backend.
- `CON-07`: Delivery follows the capstone's 7-week schedule.

### 2.5 Assumptions and Dependencies

- `ASM-01`: Open Library endpoints (`search.json`, `/works/{key}.json`, `covers.openlibrary.org`) stay available without an API key.
- `ASM-02`: **Category filtering** uses the Open Library `subject` search parameter. Confirmed via SPIKE-01 live verification (`docs/spikes/SPIKE-01-openlibrary.md`).
- `ASM-03`: **Popularity sorting** uses Open Library sorts confirmed in source: `readinglog` (default), `want_to_read`, `currently_reading`, `already_read`, and `rating` (asc/desc).
- `ASM-04`: **Publication-date sorting** uses `new` and `old`. With `old`, works without a publication year are placed last.
- `ASM-05`: **Author sorting is not natively supported** by Open Library (passing `sort=author` returns HTTP 500 upstream, verified live in SPIKE-01). The backend sorts by first author name: exactly when total matches are 100 or fewer (one request with `limit=100`), otherwise within the current page, and the UI labels it accordingly.
- `ASM-06`: All timestamps are stored in UTC.

---

## 3. Lending Business Rules

Enforced exclusively by the backend; the client is never trusted for these decisions. All numeric values are configuration, not constants in code (BR-14).

| ID | Rule | Default |
| --- | --- | --- |
| BR-01 | Each Work has `DEFAULT_COPIES` copies unless a stored record says otherwise. | 3 |
| BR-02 | A Loan consumes one copy. A Work with no available copy cannot be borrowed. | n/a |
| BR-03 | **Available copies** = total copies, minus active loans, minus active (unexpired) holds. It is never negative. | n/a |
| BR-04 | The loan period is 14 days from the borrow timestamp. | 14 days |
| BR-05 | A User may have at most 5 active loans. | 5 |
| BR-06 | A User may not have two active loans, or a loan and a reservation, for the same Work. | n/a |
| BR-07 | A User with at least one overdue loan cannot borrow or reserve until it is returned. | enabled |
| BR-08 | A Loan may be renewed at most 2 times, each extending the due date by 7 days from the current due date. | 2 x 7 days |
| BR-09 | A Loan cannot be renewed if it is overdue, or if another User has an active reservation on that Work. | n/a |
| BR-10 | If a Work has no available copy, a User may reserve it. Reservations form a FIFO queue per Work. | n/a |
| BR-11 | When a copy is returned and the queue is not empty, the first Reservation becomes a Hold for a pickup window. During the window only that User can borrow the copy. | 48 hours |
| BR-12 | If the pickup window expires without a borrow, the Hold is released to the next Reservation in the queue, or back to general availability if the queue is empty. Expiry is evaluated at read/write time; no background job is required. | n/a |
| BR-13 | Borrow, return, renew, reserve, and hold transitions are atomic; availability invariants hold under concurrent requests. | n/a |
| BR-14 | Loan period, max loans, renewals, renewal length, default copies, and hold window are configurable through environment variables. | n/a |

---

## 4. Functional Requirements

Priority uses MoSCoW: **M** Must, **S** Should, **C** Could.

### 4.1 Authentication

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-01 | The system shall allow a visitor to register with name, email, and password. Email shall be unique. | M |
| FR-02 | The system shall hash passwords with bcrypt before persisting; plaintext passwords shall never be stored or logged. | M |
| FR-03 | The system shall authenticate a user by email and password and return a signed, expiring JWT. | M |
| FR-04 | The system shall reject requests to protected endpoints lacking a valid JWT with HTTP 401. | M |
| FR-05 | The system shall allow a user to log out, discarding the session on the client. | M |
| FR-06 | Login and registration forms shall validate input client-side (format, required fields, password minimum length) with accessible inline error messages. | M |
| FR-07 | The server shall re-validate and sanitize all input regardless of client-side validation. | M |

### 4.2 Catalog Browsing

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-08 | The system shall display books from the Open Library catalog in a paginated grid. | M |
| FR-09 | Each result shall show cover (or placeholder), title, author(s), first publish year, and an availability badge (available / all copies out). | M |
| FR-10 | The system shall show a loading state, an empty state for zero results, and an error state when Open Library fails. | M |

### 4.3 Search, Filter, Sort

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-11 | The system shall let users search by title, author, or free-text keywords. | M |
| FR-12 | The system shall let users filter by category (e.g. fiction, science, history) using Open Library subjects. | M |
| FR-13 | The system shall let users sort by relevance (default), publication date (newest/oldest), popularity, title, and author. Author sort follows ASM-05: exact when total matches are 100 or fewer, page-scoped otherwise, and the UI shall state which applies. | M |
| FR-14 | The system shall use server-side pagination and never load the full result set, to handle very large datasets efficiently. | M |
| FR-15 | The system shall debounce search input and cancel superseded in-flight requests. | S |
| FR-16 | The system shall let users hide titles whose copies are all out. This filter is applied per page and the UI shall not present the total count as exact when it is active. | C |
| FR-17 | Search, filter, sort, and page shall be reflected in the URL so results are shareable and survive reload. | S |

### 4.4 Book Detail and Reading Status

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-18 | The system shall provide a dedicated, routable detail page per Work. | M |
| FR-19 | The detail page shall show cover, title, authors, description, subjects (genres), first publish year, and availability status. | M |
| FR-20 | Availability shall show total copies, available copies, queue length, and, if none available, the expected earliest return date. | M |
| FR-21 | The detail page shall offer Borrow (if available), Reserve (if not), and a reading-status control (`READING`, `COMPLETED`, or none) to authenticated users, and a login prompt to visitors. | M |
| FR-22 | Open Library descriptions may contain markup; the system shall render them as sanitized text and never inject raw HTML. | M |

### 4.5 Loans

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-23 | The system shall let a User borrow a Work, subject to BR-02 through BR-07 and BR-11. | M |
| FR-24 | The system shall compute and persist the due date on borrow and return it to the client. | M |
| FR-25 | Rejected operations shall return HTTP 409/422 with a machine-readable code (`NO_COPIES`, `LOAN_LIMIT`, `ALREADY_BORROWED`, `HAS_OVERDUE`, `HOLD_FOR_OTHER`, `RENEWAL_LIMIT`, `RENEWAL_BLOCKED`). | M |
| FR-26 | "My Loans" shall list active loans with cover, title, borrow date, due date, and days remaining. | M |
| FR-27 | Overdue loans shall be visually flagged with days overdue (not by color alone). | M |
| FR-28 | The system shall let a User return a loan. | M |
| FR-29 | The system shall let a User renew a loan under BR-08 and BR-09. | S |
| FR-30 | The system shall persist and display the User's full loan history (returned loans). | M |
| FR-31 | A User shall only access their own loans; access to another user's loan shall return HTTP 403/404. | M |

### 4.6 Reservations and Holds

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-32 | The system shall let a User reserve a Work with no available copy (BR-10). | M |
| FR-33 | The system shall show the User their queue position for each reservation. | S |
| FR-34 | The system shall let a User cancel a reservation. | M |
| FR-35 | On return, the system shall convert the first Reservation into a Hold with a pickup deadline (BR-11), visible to that User in "My Reservations". | M |
| FR-36 | Expired Holds shall be released per BR-12. | M |

### 4.7 Reading Status Tracker

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-37 | The system shall let a User set, change, or clear the Reading Status of a Work (`READING`, `COMPLETED`, or none). | M |
| FR-38 | The system shall show a "My Books" view grouped by Reading Status (Reading, Completed). | M |
| FR-39 | Setting a status on a Work that already has one shall update it, never duplicate it. | M |

---

## 5. Non-Functional Requirements

| ID | Category | Requirement | Pri |
| --- | --- | --- | --- |
| NFR-01 | Performance | Search results render within 2 s under normal conditions, excluding third-party latency beyond project control. | S |
| NFR-02 | Performance | Route-level code splitting (lazy routes) and lazy-loaded images with explicit dimensions to avoid layout shift. | M |
| NFR-03 | Performance | Target Lighthouse (mobile) Performance and Accessibility scores of at least 90 on the search and detail pages. | S |
| NFR-04 | Performance | Backend caches Open Library search and work responses with TTLs (suggested: 10 min search, 24 h work details) and applies timeouts and limited retries. | M |
| NFR-05 | Performance | Availability for a result page is fetched with a single batched database query, not one per book. | M |
| NFR-06 | Responsive | Mobile-first design, fully usable from 360 px to 1920 px widths. | M |
| NFR-07 | Accessibility | Full keyboard navigation, visible focus, semantic HTML, appropriate ARIA roles/labels, alt text on covers, WCAG 2.1 AA contrast. | M |
| NFR-08 | Usability | Visually clean, consistent, intuitive UI with clear feedback for every async action. | M |
| NFR-09 | Reliability | If Open Library is unavailable, personal views (My Loans, My Reservations, My Books) still render from stored snapshots. | S |
| NFR-10 | Security | bcrypt cost factor >= 10; JWT with expiry; HTTPS in production. | M |
| NFR-11 | Security | XSS prevention: escape output by default, sanitize any user- or API-supplied rich text, set security headers (e.g. Helmet, CSP). | M |
| NFR-12 | Security | Rate limiting on auth endpoints; parameterized queries via ORM; CORS restricted to the frontend origin. | M |
| NFR-13 | Security | Every mutating endpoint verifies authentication and resource ownership. | M |
| NFR-14 | Data Integrity | Borrow, return, renew, reserve, and hold transitions run in database transactions with locking or equivalent, so BR-03 and BR-13 hold under concurrency. | M |
| NFR-15 | Data Integrity | Database constraints: unique email; at most one active loan per (user, work); at most one open reservation per (user, work); one reading status per (user, work). | M |
| NFR-16 | Maintainability | Business rules live in service modules independent of Express controllers, so they are unit-testable without HTTP. Layered backend: routes, controllers, services, repositories. | M |
| NFR-17 | Testability | Unit tests for every business rule (BR-xx). Integration tests for loan/reservation endpoints, including concurrent borrow of the last copy. Frontend component tests for search and detail flows. | M |
| NFR-18 | Portability | Environment files for development and production on both frontend and backend; no secrets committed to the repository. | M |
| NFR-19 | Deployability | Frontend on Vercel/Netlify/Amplify; backend and PostgreSQL on a PaaS; documented deployment steps. | M |
| NFR-20 | Compatibility | Current and previous major versions of Chrome, Firefox, Edge, Safari. | M |
| NFR-21 | Observability | Structured backend logs for requests and errors, without secrets or passwords. | S |

---

## 6. External Interface Requirements

### 6.1 User Interfaces

Catalog/search page, book detail page, login/register pages, My Loans (active + history), My Reservations, My Books (grouped by reading status: Reading / Completed).

### 6.2 Internal REST API (initial outline)

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | None | Register |
| POST | `/api/auth/login` | None | Obtain JWT |
| GET | `/api/books` | Optional | Search/filter/sort/paginate (proxied), enriched with availability |
| GET | `/api/books/:workKey` | Optional | Detail with availability and queue length |
| POST | `/api/loans` | User | Borrow (`{ workKey }`) |
| GET | `/api/loans/me` | User | Active loans; history via query |
| POST | `/api/loans/:id/return` | User | Return |
| POST | `/api/loans/:id/renew` | User | Renew |
| POST | `/api/reservations` | User | Reserve (`{ workKey }`) |
| GET | `/api/reservations/me` | User | My reservations with queue position |
| DELETE | `/api/reservations/:id` | User | Cancel reservation |
| PUT | `/api/reading-status/:workKey` | User | Set status (`READING`, `COMPLETED`) |
| DELETE | `/api/reading-status/:workKey` | User | Clear status |
| GET | `/api/reading-status/me` | User | My books grouped by status |

### 6.3 External API Interfaces

| Interface | Provider | Purpose |
| --- | --- | --- |
| `GET /search.json` (`q`, `title`, `author`, `subject`, `sort`, `page`, `limit`, `fields`) | Open Library | Search, filter, sort, pagination |
| `GET /works/{key}.json` | Open Library | Work details |
| `GET covers.openlibrary.org/b/{key}/{value}-{size}.jpg` | Open Library | Covers |

### 6.4 Communications

All traffic over HTTPS, JSON payloads. Errors follow one shape: `{ "error": { "code": string, "message": string } }`.

---

## 7. Use Cases and Acceptance Criteria

### UC-01: Search, filter, and sort

- **Actor:** Visitor or User
- **Acceptance:**
  - Given keyword "history" and category "Science", results match both.
  - Given sort = popularity, order follows the mapped Open Library popularity sort.
  - Given sort = newest, results are ordered by publication date descending.
  - Given sort = author and 100 or fewer total matches, all results are ordered alphabetically by first author. Given more than 100 matches, only the current page is ordered by first author and the UI says the sort is page-scoped.
  - Given zero matches, an empty state is shown; given an Open Library failure, an error state with retry is shown.
  - Given a reload, the same query, filters, sort, and page are restored from the URL.

### UC-02: Borrow a book

- **Actor:** User
- **Acceptance:**
  - Given available copies, a Loan is created and the due date is borrow time + 14 days.
  - Given no copies, the API returns `NO_COPIES` and the UI offers Reserve.
  - Given 5 active loans, `LOAN_LIMIT`. Given the same Work already borrowed or reserved, `ALREADY_BORROWED`. Given an overdue loan, `HAS_OVERDUE`.
  - Given a Hold reserved for another User, `HOLD_FOR_OTHER`.
  - Given two Users borrow the last copy simultaneously, exactly one succeeds.

### UC-03: Track loans and due dates

- **Actor:** User
- **Acceptance:** My Loans lists only the User's loans with due dates and days remaining; overdue loans are distinguishable without relying on color.

### UC-04: Return and renew

- **Acceptance:**
  - Given an active loan, return closes it, records the timestamp, and frees the copy (or converts it to a Hold if a queue exists).
  - Given a non-overdue loan with fewer than 2 renewals and no other User reserving, renewal extends the due date by 7 days.
  - Given an overdue loan, 2 prior renewals, or another User reserving, renewal is rejected with a reason code.

### UC-05: Reserve and collect

- **Acceptance:**
  - Given no available copies, reserving places the User in the queue and shows their position.
  - Given a copy is returned, the first User in the queue gets a Hold shown in their reservations, and only they can borrow it within 48 hours.
  - Given the Hold expires, it passes to the next User in the queue.

### UC-06: Track reading status

- **Acceptance:**
  - Given a Work, the User can set READING or COMPLETED; changing it replaces the previous status.

---

## 8. Traceability to the Capstone Definition

| Capstone requirement | Covered by |
| --- | --- |
| 1. Book browsing | FR-08 to FR-10, FR-18 to FR-20 |
| 2. Search and filtering | FR-11 to FR-17, NFR-04, NFR-05 |
| 3. Loan system (loans, reservations, persistent history) | FR-23 to FR-36, BR-01 to BR-14 |
| 4. Book detail page and reading tracker | FR-18 to FR-22, FR-37 to FR-39 |
| 5. Wishlist (optional advanced feature) | Not in scope for this version — see Section 1.2 |
| 6. Responsive design (mobile-first) | NFR-06 |
| 7. UI and accessibility | NFR-07, NFR-08 |
| 8. Performance optimization | NFR-01 to NFR-05 |
| 9. Security | FR-02, FR-06, FR-07, FR-22, NFR-10 to NFR-13 |
| 10. Build and deployment | NFR-18, NFR-19 |
| Tech stack | CON-02, CON-03 |

---

*End of document.*
