# University Library SPA — Capstone Project

[![Live Demo](https://img.shields.io/badge/Demo-CloudFront%20CDN-2563eb?style=for-the-badge&logo=amazon-aws)](https://d1376jrski7xuw.cloudfront.net)
[![Backend API](https://img.shields.io/badge/API-API%20Gateway%20%2B%20Lambda-059669?style=for-the-badge&logo=aws-lambda)](https://b9fknpj872.execute-api.us-east-1.amazonaws.com/health)
[![PostgreSQL](https://img.shields.io/badge/Database-Amazon%20RDS%20Postgres-336791?style=for-the-badge&logo=postgresql)](https://aws.amazon.com/rds/)
[![Tests](https://img.shields.io/badge/Tests-161%20Passed-10b981?style=for-the-badge&logo=jest)](tests)

A modern, production-grade Single-Page Application (SPA) for university library catalog browsing, loan management, reservation queues, and personal reading trackers. Developed as the final Capstone Project for Web Development at Jala University by **Catriel Pereira Torrez**.

---

## Live Deployments

- **Frontend Application (Global CDN):** [https://d1376jrski7xuw.cloudfront.net](https://d1376jrski7xuw.cloudfront.net)
- **Backend API (API Gateway + AWS Lambda):** [https://b9fknpj872.execute-api.us-east-1.amazonaws.com](https://b9fknpj872.execute-api.us-east-1.amazonaws.com)
  - Health check: [`/health`](https://d1376jrski7xuw.cloudfront.net/health)
  - Book search sample: [`/api/books?q=tolkien`](https://d1376jrski7xuw.cloudfront.net/api/books?q=tolkien)
- **Database:** Amazon RDS PostgreSQL 16.3 (`db.t4g.micro`, 20 GB gp3, Single-AZ Free Tier)

---

## Core Features

1. **Live Catalog & Search:**
   - Full-text search integrated with Open Library public API.
   - Filter by subjects (Science, Fiction, Philosophy, etc.) and search scope (All, Title, Author).
   - Real-time physical copy availability pips (available vs total copies).
2. **Borrowing & Lending Rules (BR-01 to BR-09):**
   - 14-day loan period with automatic due date computation.
   - Concurrency-safe transactions (serializable copy decrementing).
   - Loan renewals (+7 days) capped at 2 renewals per loan, validated against overdue status and pending reservations.
3. **Reservation Queue & 48-Hour Hold Window (BR-10 to BR-12):**
   - First-In, First-Out (FIFO) reservation queue when 0 copies are available.
   - Automatic hold activation when a copy is returned, reserving it exclusively for the top user in queue for 48 hours.
4. **Personal Reading Status Tracker:**
   - Bookshelf tracker for `READING` and `COMPLETED` titles.
   - Permanent borrow history log.
5. **Mobile-First Responsive Design:**
   - Accessible slide-out drawer navigation on mobile viewports.
   - Touch-optimized buttons and controls ($\ge 44\text{px}$).
   - Adaptive grid layouts from single-column mobile to 4-column wide screens.
6. **Dark & Light Theme:**
   - Instant CSS-variable theme switcher with local storage persistence.

---

## System Architecture

The application is deployed across AWS in `us-east-1` using **Infrastructure as Code (Terraform)**:

```mermaid
flowchart TD
    classDef client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1;
    classDef edge fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#5b21b6;
    classDef storage fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#15803d;
    classDef compute fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#b45309;
    classDef db fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#c2410c;
    classDef ext fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#334155;

    Client["Client Web Browser<br/>(Mobile & Desktop SPA)"]:::client

    subgraph AWS["Amazon Web Services (AWS Cloud · Region: us-east-1)"]
        CF["Amazon CloudFront CDN<br/><b>d1376jrski7xuw.cloudfront.net</b><br/>(Global Edge · Same-Origin Reverse Proxy)"]:::edge

        subgraph S3Tier["Static Asset Hosting"]
            S3["Amazon S3 Bucket<br/><b>university-library-prod-frontend</b><br/>(React 19 + Vite · OAC SigV4)"]:::storage
        end

        subgraph ApiTier["Serverless Backend Tier"]
            APIGW["Amazon API Gateway HTTP API v2<br/><b>b9fknpj872.execute-api.us-east-1.amazonaws.com</b>"]:::edge
            Lambda["AWS Lambda Function<br/><b>university-library-prod-api</b><br/>(Node.js 20.x · Express · Prisma ORM)"]:::compute
        end

        subgraph DbTier["Managed Database Tier"]
            RDS[("Amazon RDS PostgreSQL 16.3<br/><b>university-library-prod-db</b><br/>(db.t4g.micro · SSL Encrypted)")]:::db
        end
    end

    ExtAPI["Open Library REST API<br/><b>openlibrary.org</b><br/>(Book Catalog & Covers)"]:::ext

    Client -->|"HTTPS (Port 443)<br/>Cookie: token (1st-Party)"| CF
    CF -->|"Route: /* (SPA Fallback 200)"| S3
    CF -->|"Route: /api/* & /health"| APIGW
    APIGW -->|"Lambda Proxy Integration"| Lambda
    Lambda -->|"PostgreSQL Protocol (Port 5432 / SSL)"| RDS
    Lambda -.->|"HTTP GET (Search & Metadata)"| ExtAPI
```

For high-resolution diagrams and architectural documentation:
- **Mermaid Source Diagram:** [docs/architecture/diagrams/deployment-aws.mmd](docs/architecture/diagrams/deployment-aws.mmd)
- **Deployment Diagram (SVG):** [docs/architecture/diagrams/AWS_Deployment_Architecture_Mermaid.svg](docs/architecture/diagrams/AWS_Deployment_Architecture_Mermaid.svg)
- **Deployment Diagram (PNG):** [docs/architecture/diagrams/AWS_Deployment_Architecture_Mermaid.png](docs/architecture/diagrams/AWS_Deployment_Architecture_Mermaid.png)
- **C4 Architecture Model & ADRs:** [docs/architecture/](docs/architecture/)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, Tailwind CSS v4, Lucide Icons, Framer Motion |
| **Backend** | Node.js 20.x, Express, TypeScript, `@codegenie/serverless-express`, Zod, bcryptjs, JWT |
| **Database** | PostgreSQL 16.3, Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| **Testing** | Jest, React Testing Library, Supertest, ts-jest (161 tests, 57 suites) |
| **Cloud Infra (IaC)** | Terraform, AWS S3, CloudFront, API Gateway, Lambda, RDS PostgreSQL |

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm (`corepack enable pnpm` or `npm install -g pnpm`)
- PostgreSQL (or access to Amazon RDS instance)

### Installation

```bash
# Clone the repository
git clone git@github.com:Catriel42/university-library.git
cd university-library

# Install monorepo dependencies
pnpm install
```

### Environment Configuration

Create a `.env` file in `backend/`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/university_library"
JWT_SECRET="development-secret-key-min-32-chars-long"
FRONTEND_URL="http://localhost:5173"
DEFAULT_COPIES=3
MAX_ACTIVE_LOANS=5
LOAN_PERIOD_DAYS=14
MAX_RENEWALS=2
RENEWAL_EXTENSION_DAYS=7
HOLD_WINDOW_HOURS=48
```

Generate Prisma Client and push schema:

```bash
pnpm --filter @university-library/backend exec prisma generate
pnpm --filter @university-library/backend exec prisma db push
```

### Running Locally

```bash
# Run both frontend and backend concurrently
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

---

## Testing & Quality Assurance

```bash
# Run all 161 tests across the monorepo
pnpm test

# Type-check all packages
pnpm typecheck
```

---

## Infrastructure Deployment (Terraform)

```bash
cd infra

# Initialize Terraform providers
terraform init

# Review execution plan
terraform plan

# Provision AWS resources
terraform apply -auto-approve
```

---

## Project Documentation

- **IEEE 29148 SRS:** [docs/SRS.md](docs/SRS.md)
- **Database Design:** [docs/database-design.md](docs/database-design.md)
- **Sprint Schedule & Delivery Plan:** [docs/PLAN.md](docs/PLAN.md)
- **Laboratory 7 Report:** [docs/labs/lab07-webDevelpment-catrielPereiraTorrez.md](docs/labs/lab07-webDevelpment-catrielPereiraTorrez.md)

---

## Author

- **Student:** Catriel Pereira Torrez
- **Program:** Software Engineering / Web Development — Jala University
