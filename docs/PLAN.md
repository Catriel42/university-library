# Project Plan and Delivery Roadmap

## University Library SPA

- **Document Version:** 1.0
- **Status:** Active
- **Related Requirements:** [SRS.md](./SRS.md) v1.1

---

## 1. Overview

This document defines the 7-week development plan, sprint structure, and milestones for the University Library Single-Page Application (SPA). Each week corresponds to an iterative development cycle (Sprint) delivering verifiable artifacts aligned with the Software Requirements Specification ([SRS.md](./SRS.md)).

---

## 2. Sprint Schedule Summary

| Sprint / Week | Focus Area | SRS Coverage | Status |
| --- | --- | --- | --- |
| **Week 1** | Planning, Requirements Analysis, and API Spike | Section 1, 2, 4, 5, SPIKE-01 | Completed |
| **Week 2** | Architecture, Data Modeling, ADRs, and UI Design | CON-03, NFR-14, NFR-15, NFR-16, OPEN-02, OPEN-03 | In Progress |
| **Week 3** | Core Catalog: Browsing, Search, Filter, Sort | FR-08 to FR-17, NFR-04, NFR-05 | Pending |
| **Week 4** | Authentication, Book Detail, and Core Loan System | FR-01 to FR-07, FR-18 to FR-28, BR-01 to BR-07 | Pending |
| **Week 5** | Renewals, Reservations Queue, and Reading Tracker | FR-29 to FR-39, BR-08 to BR-14 | Pending |
| **Week 6** | Testing (Unit & Integration), QA, Performance & Accessibility | NFR-01, NFR-02, NFR-03, NFR-07, NFR-17 | Pending |
| **Week 7** | Production Deployment, Security Verification, and Final Delivery | NFR-10 to NFR-13, NFR-18, NFR-19 | Pending |

---

## 3. Detailed Weekly Sprints and Deliverables

### Week 1: Planning and Requirements Analysis

- **Objectives:**
  - Define project scope, constraints, and business rules.
  - Specify all functional and non-functional requirements in IEEE 29148 format.
  - Research and select public book catalog API (Open Library).
  - Verify live API endpoints, sorting capabilities, and category filters.
  - Finalize core technology stack (React, TypeScript, Express, PostgreSQL, Prisma).
- **Deliverables:**
  - `docs/SRS.md` (v1.1)
  - `docs/spikes/SPIKE-01-openlibrary.md`
  - `docs/spikes/openlibrary-spike.js`
- **Status:** Completed

### Week 2: Design and Architecture

- **Objectives:**
  - Define system architecture diagrams (frontend SPA, backend caching proxy, PostgreSQL database).
  - Design relational data model for users, loans, reservations, holds, and reading status (Prisma schema).
  - Draft and resolve Architectural Decision Records (ADRs):
    - Client token storage strategy (OPEN-02).
    - Book availability calculation strategy: on-read vs. maintained counters (OPEN-03).
    - Open Library client traffic and caching policy (OPEN-04).
    - JWT expiration and session handling (OPEN-05).
  - Design UI/UX mockups and navigation flows for primary views (Catalog, Book Detail, My Loans, Reading Tracker).
- **Deliverables:**
  - Architecture documentation and data model schemas (`docs/architecture/`).
  - Architecture Decision Records (`docs/adr/`).
  - Wireframes and UI navigation flow specifications.
- **Status:** In Progress

### Week 3: Implementation - Core Catalog and Browsing

- **Objectives:**
  - Configure frontend application shell (React + TypeScript + Vite) and client-side routing.
  - Build backend proxy service for Open Library with server-side caching (NFR-04).
  - Implement catalog grid with availability badges, loading states, and error handling (FR-08, FR-09, FR-10).
  - Implement multi-field search (title, author, keyword) and curated subject filtering (FR-11, FR-12).
  - Implement sorting options including popularity, publication date, and backend-managed author sort (FR-13, ASM-05).
  - Implement server-side pagination with URL synchronization and debounced inputs (FR-14, FR-15, FR-17).
- **Deliverables:**
  - Functional catalog browsing, search, and filtering views.
  - Open Library proxy service with TTL cache.
- **Status:** Pending

### Week 4: Implementation - User Accounts, Details, and Core Loans

- **Objectives:**
  - Implement user authentication: registration, password hashing (bcrypt), login, and JWT issuance (FR-01 to FR-07).
  - Build dedicated, routable Book Detail view displaying bibliographic metadata, live availability, and return forecasts (FR-18 to FR-22).
  - Build core lending engine in backend: borrow action, due date computation (14 days), transactional copy consumption (FR-23, FR-24, BR-01 to BR-04).
  - Enforce lending business limits: maximum 5 active loans, overdue blocking, single active copy per work (BR-05 to BR-07, FR-25).
  - Implement "My Loans" dashboard and loan return workflow (FR-26, FR-27, FR-28).
  - Conduct mid-project review and demonstration.
- **Deliverables:**
  - Working authentication system with protected routes.
  - Functional book detail and borrow/return lifecycle.
  - Mid-project demo milestone.
- **Status:** Pending

### Week 5: Advanced Lending Features, Reservations, and Reading Tracker

- **Objectives:**
  - Implement loan renewal service with validation against overdue status and pending reservations (FR-29, BR-08, BR-09).
  - Implement reservations FIFO queue for unavailable titles (FR-32, FR-33, FR-34, BR-10).
  - Implement hold creation upon book return with 48-hour exclusive pickup window and expiration handling (FR-35, FR-36, BR-11, BR-12).
  - Implement personal reading status tracker (`READING`, `COMPLETED`) and "My Books" view (FR-37, FR-38, FR-39).
  - Persist and display historical loans log (FR-30).
  - Optional feature evaluation: evaluate wishlist implementation as a stretch goal if core requirements remain ahead of schedule.
- **Deliverables:**
  - Complete reservation queue and hold lifecycle.
  - Reading status tracker and history dashboard.
- **Status:** Pending

### Week 6: Testing, Quality Assurance, and Optimization

- **Objectives:**
  - Write comprehensive unit tests for lending business rules (BR-01 through BR-14) in isolated service modules (NFR-16, NFR-17).
  - Write integration tests for API endpoints, testing concurrent borrow of the last available copy (NFR-14, NFR-17).
  - Write frontend component and flow tests for search, detail, and authentication forms (NFR-17).
  - Execute performance optimization: route-level code splitting, lazy-loaded images, bundle analysis (NFR-02).
  - Execute accessibility audit to verify WCAG 2.1 AA compliance, keyboard navigation, and focus indicators (NFR-07).
  - Benchmark search and detail page load against NFR-01 (<= 2 s) and Lighthouse targets (>= 90) (NFR-03).
- **Deliverables:**
  - Automated test suites (unit and integration) with pass reports.
  - Accessibility and performance audit report.
- **Status:** Pending

### Week 7: Deployment, Documentation, and Final Delivery

- **Objectives:**
  - Perform final security audit: sanitized inputs, Helmet headers, CORS policies, rate limiting (NFR-10 to NFR-13).
  - Configure production environment variables for frontend and backend (NFR-18).
  - Deploy frontend to a static/serverless platform (Vercel, Netlify, or Amplify) (NFR-19).
  - Deploy backend API and PostgreSQL database to cloud PaaS (NFR-19).
  - Finalize user and developer documentation, including setup and deployment guides.
  - Final project evaluation, presentation, and delivery.
- **Deliverables:**
  - Live production application URLs (frontend and backend).
  - Completed repository documentation and deployment verification.
  - Final project sign-off.
- **Status:** Pending
