workspace "University Library SPA" "C4 architecture model for the University Library Single-Page Application — catalog browsing and loan management system." {

    model {

        # ── People ──────────────────────────────────────────────────────────
        user    = person "Registered User" "A student or faculty member. Can borrow, reserve, renew, return books, and track reading status."
        visitor = person "Visitor" "An unauthenticated person. Can browse and search the catalog but cannot borrow or reserve."

        # ── External Systems ─────────────────────────────────────────────────
        openLibrary = softwareSystem "Open Library" "Public book catalog API by the Internet Archive. Provides bibliographic metadata, cover images, and search." {
            tags "External"
        }

        # ── University Library System ────────────────────────────────────────
        librarySystem = softwareSystem "University Library SPA" "Single-Page Application that allows users to browse the catalog, borrow and reserve books, and track their reading status." {

            # Level 2: Containers
            spa = container "React SPA" "Client-side single-page application. Handles routing, state management, and all user interactions." "React + TypeScript (Vite)" {
                tags "Browser"
            }

            api = container "Express REST API" "Serves the frontend, enforces all business rules (loans, reservations, holds), proxies and caches Open Library, and manages authentication." "Node.js + Express + TypeScript" {

                # Level 3: Components inside the API
                authController   = component "Auth Controller"        "Handles register, login, logout, and /me endpoints. Issues and validates JWTs via HttpOnly cookies."            "Express Router"
                bookController   = component "Book Controller"        "Proxies search and work-detail requests to Open Library, merges live availability data."                         "Express Router"
                loanController   = component "Loan Controller"        "Handles borrow, return, renew, and loan history endpoints."                                                       "Express Router"
                reservController = component "Reservation Controller" "Handles reserve, cancel, and my-reservations endpoints. Manages FIFO queue and hold conversion."                 "Express Router"
                readingController = component "Reading Status Controller" "Handles set, clear, and my-books endpoints for per-user reading status tracking."                            "Express Router"

                authService      = component "Auth Service"           "Registration, login with bcrypt password hashing, and JWT token signing."                                         "TypeScript service"
                bookService      = component "Book Service"           "Batched availability query (ADR-0002). Merges Open Library results with local copy counts."                       "TypeScript service"
                loanService      = component "Loan Service"           "Transactional borrow/return/renew logic. Enforces BR-01 to BR-09. Triggers hold conversion on return."           "TypeScript service"
                reservService    = component "Reservation Service"    "FIFO queue management. Hold creation (BR-11). Expired-hold release evaluated at read/write time (BR-12)."        "TypeScript service"
                readingService   = component "Reading Status Service" "Upsert and delete reading status per (user, work). Enforces one status per pair (NFR-15)."                       "TypeScript service"

                olService        = component "Open Library Service"   "HTTP client for Open Library. LRU cache: 10 min for search, 24 h for work details (ADR-0003). Zod response validation." "TypeScript service + lru-cache"
                authMiddleware   = component "Auth Middleware"        "Validates JWT from HttpOnly cookie on protected routes. Returns HTTP 401 on failure."                             "Express middleware"
                prismaClient     = component "Prisma Client"          "Type-safe ORM. All DB access goes through this layer."                                                             "Prisma 7"
            }

            db = container "PostgreSQL Database" "Stores users, loans, reservations, holds, reading status, and work copy counts." "PostgreSQL 16" {
                tags "Database"
            }

            cache = container "In-Process LRU Cache" "Server-side in-memory cache for Open Library API responses. TTL: 10 min search, 24 h work details. No external cache required." "lru-cache (Node.js)" {
                tags "Cache"
            }
        }

        # ── Relationships: People → System ───────────────────────────────────
        user    -> librarySystem "Browses catalog, borrows and reserves books, tracks reading status" "HTTPS"
        visitor -> librarySystem "Browses and searches the catalog" "HTTPS"
        librarySystem -> openLibrary "Fetches bibliographic metadata and cover images" "HTTPS / REST"

        # ── Relationships: People → Containers ──────────────────────────────
        user    -> spa "Interacts with" "HTTPS"
        visitor -> spa "Browses catalog via" "HTTPS"

        # ── Relationships: Container → Container ─────────────────────────────
        spa -> api        "Calls REST API" "HTTPS / JSON"
        api -> db         "Reads and writes all library state" "TCP / Prisma ORM"
        api -> cache      "Reads and writes cached OL responses" "In-process"
        cache -> openLibrary "Fetches on cache miss" "HTTPS / REST"

        # ── Relationships: Components (inside API) ───────────────────────────
        authController   -> authService
        bookController   -> bookService
        bookController   -> olService
        loanController   -> loanService
        reservController -> reservService
        readingController -> readingService

        authService      -> prismaClient  "Reads/writes User records"
        bookService      -> prismaClient  "Reads Work, Loan, Reservation for availability"
        bookService      -> olService     "Fetches search results"
        loanService      -> prismaClient  "Reads/writes Loan and Work records (transactions)"
        loanService      -> reservService "Notifies on return to trigger hold conversion"
        reservService    -> prismaClient  "Reads/writes Reservation records"
        readingService   -> prismaClient  "Reads/writes ReadingStatus records"
        olService        -> cache         "Cache-aside read/write"

        authController   -> authMiddleware "Uses on protected routes"
        loanController   -> authMiddleware "Uses on protected routes"
        reservController -> authMiddleware "Uses on protected routes"
        readingController -> authMiddleware "Uses on protected routes"

        prismaClient -> db "SQL over TCP"
    }

    views {

        # C4 Level 1 — System Context
        systemContext librarySystem "SystemContext" "C4 Level 1: System Context — how the University Library SPA fits into the wider environment." {
            include *
            autoLayout
        }

        # C4 Level 2 — Containers
        container librarySystem "Containers" "C4 Level 2: Container diagram — the major runnable/deployable units and their interactions." {
            include *
            autoLayout
        }

        # C4 Level 3 — Components (API internals)
        component api "ApiComponents" "C4 Level 3: Component diagram — controllers, services, and infrastructure inside the Express API." {
            include *
            autoLayout
        }

        # Dynamic view: Borrow a book (UC-02)
        dynamic librarySystem "BorrowFlow" "Key interaction sequence: a user borrows a book (UC-02 — happy path)." {
            user -> spa "Clicks 'Borrow' on a book"
            spa -> api "POST /api/loans  { workKey }"
            api -> db "BEGIN TRANSACTION — check copies, active loans, overdue"
            db -> api "Returns availability snapshot"
            api -> db "INSERT Loan, decrement available"
            db -> api "COMMIT — Loan created, dueDate = now + 14 days"
            api -> spa "201 Created — { loan, dueDate }"
            spa -> user "Shows confirmation with due date"
            autoLayout
        }

        styles {
            element "Person" {
                shape person
                background #0d7377
                color #ffffff
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "External" {
                background #6b7280
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Component" {
                background #85bbdd
                color #000000
            }
            element "Database" {
                shape cylinder
                background #336791
                color #ffffff
            }
            element "Cache" {
                shape cylinder
                background #dc382d
                color #ffffff
            }
            element "Browser" {
                shape webBrowser
            }
            relationship "Relationship" {
                dashed false
            }
        }
    }

}
