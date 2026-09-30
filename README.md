# University Library SPA

A Single-Page Application (SPA) for university library catalog browsing and loan management, developed as the Capstone Project for Web Development at Jala University.

The system connects to the Open Library public catalog for bibliographic metadata and provides a custom REST backend for managing user accounts, copy availability, loans, reservations, and reading status tracking.

---

## Documentation

Project requirements, architecture specifications, and delivery roadmaps are maintained under the `docs/` directory:

- **Requirements Specification:** [docs/SRS.md](docs/SRS.md) - Complete functional (FR), non-functional (NFR), and lending business rules (BR) per IEEE 29148.
- **Sprint and Project Plan:** [docs/PLAN.md](docs/PLAN.md) - 7-week development schedule, sprint milestones, and deliverables.
- **API Spike Report:** [docs/spikes/SPIKE-01-openlibrary.md](docs/spikes/SPIKE-01-openlibrary.md) - Technical analysis and live verification results for Open Library API integration.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, React Router DOM
- **Backend:** Node.js, Express, TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM
- **External Catalog:** Open Library API
- **Testing:** Vitest / Jest, Testing Library

---

## Getting Started

### Prerequisites

- Node.js 18 or higher (Node 24 recommended)
- pnpm (or npm / yarn)

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run local development server
pnpm dev
```

### Build

```bash
# Type check and build production bundle
pnpm build
```

---

## Project Schedule

The project follows a 7-week iterative development cycle. For full sprint tracking and deliverables, refer to [docs/PLAN.md](docs/PLAN.md).
