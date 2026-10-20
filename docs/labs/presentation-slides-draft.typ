#import "@preview/touying:0.6.1": *
#import themes.metropolis: *

#show: metropolis-theme.with(
  aspect-ratio: "16-9",
  config-colors(
    primary: rgb("#0D9488"),         // Library Teal
    primary-light: rgb("#14B8A6"),   // Lighter accent
    secondary: rgb("#0284C7"),       // Deep Cyan
    neutral-darkest: rgb("#0F172A"), // Slate Dark
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

== Problem & Motivation

#columns(2)[
  === Academic Library Challenges
  - *Scattered Information:* Students struggle to check physical copy status on campus in real time.
  - *Outdated UI/UX:* Legacy university library systems lack mobile ergonomics and clean search workflows.
  - *Queue Transparency:* Zero visibility into waitlists when high-demand books are checked out.

  #colbreak()

  === The Opportunity
  - Create a *lightning-fast, mobile-first web application*.
  - Integrate global bibliographic data (*Open Library*) with real-time physical inventory (*PostgreSQL*).
  - Enforce automated lending rules, concurrency safety, and fair reservation waitlists.
]

== The Solution: University Library SPA

#columns(2)[
  *1. Global Search + Local Inventory* \
  Combines Open Library's 30M+ book catalog with local PostgreSQL copy availability tracking.

  *2. Automated Lending Lifecycle* \
  14-day loans, automatic due dates, renewal validation (+7 days), and overdue status.

  #colbreak()

  *3. Fair FIFO Reservation Queue* \
  Automatic hold queue when 0 copies exist, backed by a 48-hour exclusive pickup window.

  *4. Personal Bookshelf Tracker* \
  Live tracking for `READING` and `COMPLETED` titles, plus comprehensive borrowing history.
]

#v(1em)
#align(center)[
  #text(fill: rgb("#0D9488"), weight: "bold")[Live URL:] #link("https://d1376jrski7xuw.cloudfront.net")[d1376jrski7xuw.cloudfront.net]
]

== Cloud-Native Architecture (AWS)

#align(center)[
  #image("figures/AWS_Deployment_Architecture_Mermaid.png", width: 80%)
]

- *Unified Same-Origin Domain:* CloudFront acts as Reverse Proxy for `/api/*` and `/health`, avoiding 3rd-party cookie blocking.
- *Strict Free Tier Compliance:* `db.t4g.micro`, 20 GB gp3, Single-AZ (\$0.00 infrastructure cost).

== Core Business Logic & Concurrency

=== Rigorous Lending Rules (BR-01 through BR-12)

#columns(2)[
  *Borrowing (BR-01 - BR-05)*
  - Maximum *5 active loans* per student.
  - Standard loan period: *14 calendar days*.
  - Copy decrements executed in atomic database transactions to avoid race conditions.

  *Renewals (BR-08 - BR-09)*
  - Capped at *2 renewals* (+7 days each).
  - Automatically rejected if overdue or if pending reservations exist.

  #colbreak()

  *FIFO Queue (BR-10)*
  - Triggered when available copies reach 0.
  - Preserves exact arrival timestamp order.

  *48h Hold Window (BR-11 - BR-12)*
  - Book return activates exclusive hold for user #1.
  - Released to user #2 if unclaimed after 48 hours.
]

== Mobile-First Responsive Design

#columns(2)[
  === Optimized for Every Viewport
  - *Accessible Navigation Drawer:* Slide-out mobile menu with touch targets $>= 44"px"$ and ARIA attributes.
  - *Adaptive Catalog Grid:* 1 col (< 440px) $arrow.r$ 2 on phablets $arrow.r$ 3 on tablets $arrow.r$ 4 on desktop.
  - *Ergonomic Controls:* Full-width segmented buttons and swipeable category pills.
  - *Dark & Light Modes:* Instant CSS variable switching with persistent theme memory.

  #colbreak()

  #align(center)[
    #image("figures/portada.png", width: 95%)
  ]
]

== Software Quality & Testing

=== 161 Tests Passing Across 57 Test Suites

#columns(2)[
  *Frontend (47 Suites / 130 Tests)*
  - Component rendering, loading skeletons, and error fallbacks.
  - Interaction flows: Search, Filter, Borrow, Return, Renew, Place Hold.
  - Custom hooks: `useCatalogSearch`, `useMyLoans`, `useReservations`, `useReadingStatus`.
  - Mobile menu drawer toggle accessibility.

  #colbreak()

  *Backend (10 Suites / 31 Tests)*
  - Business rules validation in isolated service layers.
  - Concurrency tests: race conditions on the last available physical copy.
  - Authentication middleware, JWT verification, and bcrypt hashing.
  - *TypeScript:* 100% strict check with *zero `any`*.
]

== Infrastructure as Code (Terraform)

=== Fully Reproducible Cloud Deployment

- *100% Declarative IaC:* The entire AWS infrastructure (S3, CloudFront, Lambda, API Gateway, RDS, Security Groups) is provisioned via `infra/*.tf`.
- *Zero-Cost Guardrails:*
  - `instance_class = "db.t4g.micro"`
  - `allocated_storage = 20`
  - `max_allocated_storage = 0` (No storage autoscaling surprise bills)
  - `multi_az = false`
- *Single TLS Certificate & Reverse Proxy:*
  CloudFront handles SPA asset delivery and proxies `/api/*` requests to API Gateway seamlessly.

== Live Demonstration Flow (6 Minutes)

+ *Catalog Search & Availability (1 min):* Search for "Tolkien", filter by "Fiction", show live availability badges (3/3).
+ *Mobile-First Viewport (1 min):* Toggle mobile DevTools (390px), open drawer menu, swipe categories.
+ *Borrowing Flow (1 min):* Log in, click Borrow, verify atomic copy decrement and +14 days due date.
+ *Renewal Validation (1 min):* Open "My Loans", click Renew (+7 days extension, counter 1/2).
+ *Reservation Queue (1 min):* Locate book with 0 copies, click "Place Hold", verify position #1 in queue.
+ *Return & Reading Log (1 min):* Return book, review status in "My Books", showcase dark/light theme switch.

== Conclusions & Key Learnings

=== What Was Achieved:
- Complete end-to-end fullstack platform satisfying all IEEE 29148 SRS requirements.
- Production AWS deployment via Terraform adhering strictly to AWS Free Tier boundaries.
- Solved real-world Same-Origin cookie handling through CloudFront reverse proxy architecture.
- High software confidence backed by 161 automated unit and integration tests.

#v(1em)
=== Thank You!
- *Live Application:* #link("https://d1376jrski7xuw.cloudfront.net")[d1376jrski7xuw.cloudfront.net]
- *GitHub Repository:* #link("https://github.com/Catriel42/university-library")[github.com/Catriel42/university-library]
- *Questions & Discussion*
