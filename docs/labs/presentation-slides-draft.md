---
marp: true
theme: default
paginate: true
header: "University Library SPA — Capstone Final Presentation"
footer: "Jala University · Web Development · Catriel Pereira Torrez"
backgroundColor: "#0B0F17"
color: "#F1F5F9"
style: |
  section {
    font-family: 'DM Sans', sans-serif;
    padding: 40px 60px;
  }
  h1, h2 {
    font-family: 'Fraunces', serif;
    color: #2DD4BF;
  }
  h3 {
    color: #38BDF8;
  }
  code {
    background-color: #1E293B;
    color: #F8FAFC;
  }
  a {
    color: #2DD4BF;
    text-decoration: none;
  }
  .highlight {
    color: #2DD4BF;
    font-weight: bold;
  }
  .tag {
    background: #1E293B;
    border: 1px solid #334155;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.85em;
  }
---

<!-- Slide 1 -->
# University Library SPA
## Modern Library Management & Catalog Single-Page Application

**Capstone Project Defense — Web Development (CSWB-366)**

- **Author:** Catriel Pereira Torrez
- **Institution:** Jala University
- **Date:** October 2026
- **Live Demo:** [https://d1376jrski7xuw.cloudfront.net](https://d1376jrski7xuw.cloudfront.net)

---

<!-- Slide 2 -->
# The Problem & Motivation

### Academic Library Challenges
- **Scattered Information:** Students struggle to find whether physical copies are available on campus or checked out.
- **Outdated UI/UX:** Legacy university library systems have poor mobile support and cumbersome workflows.
- **Queue Transparency:** Lack of visibility into waitlists when high-demand books are unavailable.

### The Opportunity
Create a **lightning-fast, mobile-first web application** that integrates public bibliographic databases with live campus physical copy inventory and smart lending rules.

---

<!-- Slide 3 -->
# The Solution: University Library SPA

### Key Value Propositions

1. **Global Search + Local Inventory:**
   Combines **Open Library's** 30M+ book catalog with a local **PostgreSQL** physical copy availability tracker.
2. **Automated Lending Lifecycle:**
   14-day loans, due-date calculation, renewal validation (+7 days), and overdue tracking.
3. **Fair FIFO Reservation Queue:**
   Automatic hold placement when 0 copies exist, with a 48-hour exclusive pickup window.
4. **Personal Bookshelf:**
   Track current reading (`READING`), celebrate finished books (`COMPLETED`), and view loan history.

---

<!-- Slide 4 -->
# Cloud-Native Architecture (AWS)

```
[Web Browser] ──(HTTPS / 1st-Party Cookies)──► [CloudFront CDN]
                                                     │
         ┌───────────────────────────────────────────┴───────────────────────┐
         ▼ (Route /*)                                                        ▼ (Route /api/*)
[Amazon S3: React SPA]                                              [Amazon API Gateway v2]
(OAC SigV4 Private Bucket)                                                   │
                                                                             ▼
                                                                  [AWS Lambda Function]
                                                                  (Express + Node 20.x)
                                                                    │                │
                                                                    ▼                ▼
                                                           [RDS PostgreSQL]   [Open Library]
                                                           (16.3 / SSL Mode)  (REST API)
```

- **Unified Domain:** `d1376jrski7xuw.cloudfront.net` (Zero cross-site cookie blocking).
- **Strict Free Tier:** `db.t4g.micro`, 20 GB gp3, Single-AZ ($0.00 infrastructure cost).

---

<!-- Slide 5 -->
# Core Business Logic & Concurrency

### Rigorous Lending Rules (BR-01 through BR-12)

- **BR-01 to BR-05 (Borrowing):** Max 5 active loans per user. Loan period: 14 days. Copies decremented atomically in database transactions.
- **BR-08 & BR-09 (Renewals):** Capped at 2 renewals (+7 days each). Denied if overdue or if another student is waiting in the reservation queue.
- **BR-10 (FIFO Queue):** When available copies = 0, users join an orderly queue.
- **BR-11 & BR-12 (48h Hold Window):** When a book is returned, it is held exclusively for user #1 for 48 hours.

---

<!-- Slide 6 -->
# Mobile-First Responsive Design

### Optimized for Every Screen Size

- **Accessible Navigation:**
  Slide-out mobile navigation drawer with touch targets $\ge 44\text{px}$.
- **Adaptive Catalog Grid:**
  1 column on small phones (< 440px) $\to$ 2 on phablets $\to$ 3 on tablets $\to$ 4 on desktop.
- **Ergonomic Controls:**
  Full-width segmented controls and horizontal swipeable category chips.
- **Dark & Light Modes:**
  Instant CSS variable toggling with persistent theme memory.

---

<!-- Slide 7 -->
# Software Quality & Testing

### Test Suite Summary: 161 Tests Passing (57 Suites)

- **Frontend (47 Suites / 130 Tests):**
  - Component rendering, loading skeletons, and error fallbacks.
  - User interaction flows (Search, Filter, Borrow, Return, Renew, Place Hold).
  - Custom hook tests (`useCatalogSearch`, `useMyLoans`, `useReservations`, `useReadingStatus`).
  - Mobile menu toggle accessibility tests.
- **Backend (10 Suites / 31 Tests):**
  - Business rules validation in isolated service layers.
  - Concurrency tests: race conditions on the last available physical copy.
  - Authentication middleware, JWT verification, and bcrypt hashing.
- **TypeScript:** 100% strict type checking with **zero `any`** in new code.

---

<!-- Slide 8 -->
# Infrastructure as Code (Terraform)

### Why IaC with Terraform?

- **100% Reproducible:** The entire AWS environment (S3, CloudFront, Lambda, API Gateway, RDS, Security Groups) is defined in `infra/*.tf`.
- **Zero Cost Surprise Protection:**
  Hardcoded Free Tier limits:
  - `instance_class = "db.t4g.micro"`
  - `allocated_storage = 20`
  - `max_allocated_storage = 0` (No storage autoscaling)
  - `multi_az = false`
- **Reverse Proxy Routing:**
  CloudFront handles both frontend assets and backend API proxying under a single certificate.

---

<!-- Slide 9 -->
# Live Demonstration Flow (6 Minutes)

1. **Catalog Search & Real-Time Availability:**
   Search for "Tolkien", filter by "Fiction", observe copy count pips (3/3).
2. **Mobile-First Experience:**
   Switch to mobile viewport: open drawer menu, browse categories with touch gestures.
3. **Borrowing a Book:**
   Authenticate, click Borrow, verify automatic due date calculation (+14 days).
4. **Renewal Validation:**
   Click Renew in "My Loans" (+7 days extension, counter increments to 1/2).
5. **FIFO Reservation Queue:**
   Find a book with 0 copies, click "Place Hold", observe queue position #1.
6. **Return & Reading Tracker:**
   Return borrowed book, move to "Reading Log", celebrate completed title.

---

<!-- Slide 10 -->
# Conclusions & Key Learnings

### What Was Achieved:
- Complete end-to-end fullstack platform meeting all IEEE 29148 SRS requirements.
- Modern serverless AWS architecture deployed through Terraform.
- Solved complex cross-site authentication cookie issues using CloudFront Reverse Proxy.
- Comprehensive test coverage with 161 automated tests.

### Thank You!
- **Live Application:** [https://d1376jrski7xuw.cloudfront.net](https://d1376jrski7xuw.cloudfront.net)
- **Repository:** [https://github.com/Catriel42/university-library](https://github.com/Catriel42/university-library)
- **Questions & Discussion**
