#import "@preview/touying:0.6.1": *
#import themes.metropolis: *

#show: metropolis-theme.with(
  aspect-ratio: "16-9",
  config-colors(
    primary: rgb("#1ea382"),         // App emerald green
    primary-light: rgb("#2dd4a8"),   // App vibrant mint accent
    secondary: rgb("#0f765e"),       // Deep forest green
    neutral-darkest: rgb("#0e1513"), // App deep dark background
    neutral-lightest: rgb("#f8faf9"),
  ),
  config-info(
    title: [University Library SPA],
    subtitle: [Modern Library Management & Catalog Single-Page Application],
    author: [Catriel Pereira Torrez],
    date: [October 2026],
    institution: [Jala University · Web Development (CSWB-366)],
  ),
)

#title-slide()

== Project Plan & Delivery Roadmap (7-Week Sprints)

#columns(2)[
  *Sprint Breakdown & Milestones:*
  - *Week 1 (Planning & SRS):* IEEE 29148 requirements, business rules, Open Library API spike.
  - *Week 2 (Architecture & Design):* C4 Structurizr modeling, ADRs (0001–0004), Prisma relational schema.
  - *Week 3 (Core Catalog):* React 19 SPA shell, debounced multi-field search, subject filter, server caching proxy.
  - *Week 4 (Auth & Loans):* JWT in `HttpOnly` cookies, book detail view, transactional 14-day borrowing.

  #colbreak()

  - *Week 5 (Renewals & Queues):* Renewal validation (+7 days, max 2), FIFO reservation queue, 48h hold window, reading tracker.
  - *Week 6 (Testing & QA):* 161 automated tests (Jest + RTL), race condition concurrency suites, strict TypeScript.
  - *Week 7 (Cloud Deployment & Polish):* AWS Terraform infra (S3, CloudFront, Lambda, RDS), Same-Origin proxy, Mobile-First UI.
]

== Requirements Engineering: SRS & Business Rules

=== IEEE 29148 Software Requirements Specification

#columns(2)[
  *Functional Scope (FR-01 to FR-39)*
  - Global catalog search with Open Library (30M+ titles).
  - Real-time campus copy availability pips.
  - Self-service borrowing and loan history.
  - User reading lists (`READING` / `COMPLETED`).

  #colbreak()

  *Core Business Rules (BR-01 to BR-12)*
  - *BR-01:* Maximum 5 active loans per student.
  - *BR-02:* 14-day loan period with auto-calculated due date.
  - *BR-08:* Max 2 renewals (+7 days each); blocked if overdue.
  - *BR-10:* FIFO reservation queue when available copies = 0.
  - *BR-11:* 48-hour exclusive hold window upon copy return.
]

== C4 Architecture: Level 1 — System Context

#align(center)[
  #image("figures/SystemContext-dark.png", width: 72%)
]

- *Student / Faculty User:* Interacts with the Single-Page Application via desktop or mobile web browsers.
- *University Library System:* Manages catalog browsing, authentication, loan states, and reservations.
- *Open Library REST API:* External provider for book metadata, subjects, authors, and cover image assets.

== C4 Architecture: Level 2 — Containers

#align(center)[
  #image("figures/Containers-dark.png", width: 92%)
]

- *Single-Page Application:* React 19, TypeScript, Vite, Tailwind CSS v4, delivered via Amazon CloudFront CDN.
- *API Application:* Express & Node.js 20.x, serverless AWS Lambda, Prisma ORM 7 with connection pooling.
- *Relational Database:* Amazon RDS PostgreSQL 16.3 (`db.t4g.micro`), SSL encrypted in transit.

== C4 Architecture: Level 3 — Backend API Components

#align(center)[
  #image("figures/ApiComponents-dark.png", height: 60%)
]

- *Modular Architecture:* Layered Separation of Concerns (Routes $arrow.r$ Controllers $arrow.r$ Services $arrow.r$ Repositories).
- *Services:* `AuthService` (JWT/bcrypt), `CatalogService` (Open Library proxy + cache), `LoanService` (concurrency transactions), `ReservationService` (FIFO queue & 48h holds).

== C4 Architecture: Level 3 — Frontend SPA Architecture

#align(center)[
  #image("figures/SpaComponents-dark.png", height: 58%)
]

- *State Management:* React Context (`AuthContext`, `ThemeContext`) + Custom React Hooks.
- *Domain Hooks:* `useCatalogSearch`, `useMyLoans`, `useReservations`, `useReadingStatus`.
- *Component Library:* Accessible UI primitives with Tailwind CSS, Lucide Icons, and Framer Motion transitions.

== Dynamic Interaction Flow: Borrowing (C4 Flow)

#align(center)[
  #image("figures/BorrowFlow-dark.png", width: 92%)
]

- Student requests borrow $arrow.r$ `AuthMiddleware` verifies `HttpOnly` JWT cookie.
- `LoanService` begins *database transaction*: checks active loan limit ($<= 5$), verifies availability $> 0$.
- Copies decremented atomically, loan record inserted (+14 days due date), commit transaction.

== Dynamic Interaction Flow: Reservation Queue & Hold Window

#align(center)[
  #image("figures/ReserveFlow-dark.png", width: 92%)
]

- *Join Queue:* When copies = 0, user joins FIFO reservation queue (position calculated dynamically).
- *Return Book:* When a copy is returned, the top reservation transitions to `HOLD` status.
- *Exclusive Window:* Copy is locked exclusively for 48 hours for user #1 before rolling over to user #2.

== Key Architectural Decision Records (ADRs)

#columns(2)[
  *ADR-0001: Client Token Storage* \
  - *Decision:* `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
  - *Rationale:* Eliminates XSS token theft vectors compared to `localStorage`.

  *ADR-0002: Book Availability Strategy* \
  - *Decision:* Maintained inventory counters in PostgreSQL.
  - *Rationale:* Eliminates costly table scans on high-traffic catalog search queries.

  #colbreak()

  *ADR-0003: Open Library Proxy & Cache* \
  - *Decision:* Backend proxy with in-memory TTL caching.
  - *Rationale:* Protects client privacy, avoids rate limits, and enriches search with campus inventory.

  *ADR-0004: JWT Lifecycle & Sessions* \
  - *Decision:* Stateless 7-day signed JWT tokens.
  - *Rationale:* Fits serverless Lambda architecture without requiring distributed Redis cache.
]

== Mobile-First UI/UX & Design Tokens

#columns(2)[
  === Built for Ergonomic Mobile Use
  - *Navigation Drawer:* Accessible slide-down menu with touch targets $>= 44"px"$ and user profile badge.
  - *Adaptive Catalog Grid:* 1 col (< 440px) $arrow.r$ 2 on mobile $arrow.r$ 3 on tablet $arrow.r$ 4 on desktop.
  - *Brand Color Palette:*
    - Accent: `#2dd4a8` (Mint Emerald)
    - Deep Surface: `#121c19` / Background: `#0e1513`
  - *Dark & Light Theme:* CSS variable engine with persistent storage.

  #colbreak()

  #align(center)[
    #image("figures/portada.png", width: 95%)
  ]
]

== Cloud-Native Deployment Architecture (AWS)

#align(center)[
  #image("figures/AWS_Deployment_Architecture_Mermaid.png", height: 62%)
]

- *Same-Origin Reverse Proxy:* CloudFront routes `/api/*` and `/health` to API Gateway, and `/*` to S3 (OAC SigV4).
- *Zero Cross-Site Cookie Blocking:* Single public domain `d1376jrski7xuw.cloudfront.net` enables seamless sessions.

== Infrastructure as Code (Terraform) & Free Tier

=== 100% Reproducible Cloud Infrastructure (`infra/*.tf`)

#columns(2)[
  *Terraform Modules:*
  - `versions.tf`: AWS provider $>= 5.40$ and random seeds.
  - `network.tf`: DB Subnet group and TLS Security Groups.
  - `rds.tf`: Managed PostgreSQL 16.3 (`db.t4g.micro`).
  - `lambda_api.tf`: Node.js 20.x bundle + API Gateway HTTP v2.
  - `s3_cloudfront.tf`: OAC S3 bucket + CloudFront CDN proxy.

  #colbreak()

  *Zero-Cost Guardrails:*
  - `allocated_storage = 20` (GB gp3)
  - `max_allocated_storage = 0` (No surprise auto-scaling bills)
  - `multi_az = false` (Single-AZ Free Tier)
  - `skip_final_snapshot = true`
  - CloudFront 1TB/mo free data transfer out.
]

== Software Quality, Testing & TypeScript

=== 161 Tests Passing Across 57 Test Suites

#columns(2)[
  *Frontend Testing (47 Suites / 130 Tests)*
  - Component lifecycle, skeletons, error states.
  - User journeys: Catalog search, filters, borrow, renew, return, holds.
  - Custom hooks with `@testing-library/react`.
  - Accessible mobile navigation drawer tests.

  #colbreak()

  *Backend & Concurrency (10 Suites / 31 Tests)*
  - Business rules validation in isolated service layers.
  - *Concurrency race condition tests:* Simultaneous borrow requests for the last physical copy.
  - Authentication middleware & bcrypt hashing.
  - *TypeScript:* 100% strict check with *0 `any`*.
]

== Live Demonstration Plan (6-Minute Workshop Flow)

+ *Catalog Search & Real-Time Availability (1 min):* Search "Tolkien", filter by "Fiction", show live availability badges (3/3).
+ *Mobile-First Viewport (1 min):* Toggle mobile DevTools (390px), open navigation drawer, swipe categories.
+ *Borrowing Flow (1 min):* Log in, click Borrow, verify atomic copy decrement and +14 days due date.
+ *Renewal Validation (1 min):* Open "My Loans", click Renew (+7 days extension, counter 1/2).
+ *Reservation Queue (1 min):* Locate book with 0 copies, click "Place Hold", verify position #1 in queue.
+ *Return & Reading Log (1 min):* Return book, review status in "My Books", showcase dark/light theme switch.

== Conclusions & Capstone Retrospective

=== Key Achievements
- Delivered an end-to-end production platform adhering to IEEE 29148 requirements.
- Modeled formal C4 architecture with Structurizr DSL and documented ADR trade-offs.
- Solved real-world production cookie blocking via CloudFront Reverse Proxy.
- Automated 161 unit & integration tests for continuous quality assurance.

#v(0.8em)
=== Thank You!
- *Live Application:* #link("https://d1376jrski7xuw.cloudfront.net")[d1376jrski7xuw.cloudfront.net]
- *GitHub Repository:* #link("https://github.com/Catriel42/university-library")[github.com/Catriel42/university-library]
- *Open for Questions & Feedback*
