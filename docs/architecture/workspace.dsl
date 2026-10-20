workspace "University Library SPA" "C4 architecture model for the University Library Single-Page Application — catalog browsing, loan management, reservations queue, and reading status tracker." {

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
            spa = container "React SPA" "Client-side single-page application. Handles routing, state management, and all user interactions." "React 19 + TypeScript (Vite)" {
                tags "Browser"

                # ─── Contexts (global state) ───
                authContext  = component "AuthContext"  "Provides authentication state (user, token) and login/logout/register actions to the entire component tree." "React Context + Provider"
                themeContext = component "ThemeContext" "Provides dark/light theme state with localStorage persistence and toggleTheme action." "React Context + Provider"

                # ─── Layout ───
                appLayout   = component "AppLayout"     "Root layout shell: navbar with navigation links (Catalog, My Loans, Reservations, My Books), user badge, theme toggle, and footer." "React Component"
                themeToggle = component "ThemeToggle"    "Animated sun/moon icon button that toggles between dark and light mode via ThemeContext." "React Component"

                # ─── Router ───
                appRouter = component "Router" "Declares all application routes and wraps protected pages in ProtectedRoute." "React Router"
                protectedRoute = component "ProtectedRoute" "Route guard that redirects unauthenticated users to /login." "React Component"

                # ─── Hooks (data-fetching / state logic) ───
                useCatalogSearch = component "useCatalogSearch" "Manages catalog search state, pagination, filters, sorting, and debounced API calls to /api/books." "Custom Hook"
                useBookDetail    = component "useBookDetail"    "Fetches single work details and availability from /api/books/:key." "Custom Hook"
                useMyLoans       = component "useMyLoans"       "Fetches active and returned loans, handles borrow, return, and renew actions via /api/loans." "Custom Hook"
                useReservations  = component "useReservations"  "Fetches user reservations, handles reserve/cancel/borrow-from-hold via /api/reservations." "Custom Hook"
                useReadingStatus = component "useReadingStatus" "Fetches and manages reading status (READING/COMPLETED) per work via /api/reading-status." "Custom Hook"

                # ─── Pages ───
                catalogPage       = component "CatalogPage"        "Main catalog view: search form, category filter bar, toolbar, results grid with BookCards, pagination, empty/error states." "React Page"
                bookDetailPage    = component "BookDetailPage"     "Single-work view: BookHero, BookMeta, availability panel, action card (borrow/reserve), reading status selector, description." "React Page"
                authPage          = component "AuthPage"           "Login and registration form with mode switcher, validation errors, and card layout." "React Page"
                myLoansPage       = component "MyLoansPage"        "Active loans dashboard with LoanCards (return/renew actions), loan history table, and empty/loading states." "React Page"
                myReservationsPage = component "MyReservationsPage" "Reservations queue view showing ReservationCards with queue position, hold countdown, borrow/cancel actions." "React Page"
                myBooksPage       = component "MyBooksPage"        "Reading tracker dashboard: grouped by READING and COMPLETED status with ReadingBookCards." "React Page"

                # ─── Catalog domain components ───
                catalogSearchForm  = component "CatalogSearchForm"  "Search input with submit button. Emits search query to CatalogPage." "React Component"
                categoryFilterBar  = component "CategoryFilterBar"  "Horizontal scrollable bar of subject category pills for filtering catalog results." "React Component"
                catalogToolbar     = component "CatalogToolbar"     "Displays result count, sort dropdown, and hide-unavailable toggle." "React Component"
                catalogResultsGrid = component "CatalogResultsGrid" "Responsive grid of BookCards with skeleton loading state." "React Component"
                bookCard           = component "BookCard"           "Catalog item card: cover image, title, author, availability pips, and borrow button." "React Component"
                catalogPagination  = component "CatalogPagination"  "Page number navigation with prev/next buttons." "React Component"
                catalogEmptyState  = component "CatalogEmptyState"  "Empty state illustration when no catalog results match the query." "React Component"
                catalogErrorState  = component "CatalogErrorState"  "Error state with retry button when catalog fetch fails." "React Component"

                # ─── Book Detail domain components ───
                bookHero             = component "BookHero"              "Large cover image with title overlay for the detail page header." "React Component"
                bookMeta             = component "BookMeta"              "Displays author, publish year, subjects, and edition count." "React Component"
                bookAvailabilityPanel = component "BookAvailabilityPanel" "Shows available/total copies with CopyPips visualization and return forecast." "React Component"
                bookActionCard       = component "BookActionCard"        "Primary action card: borrow, return, or reserve button depending on availability and loan state. Embeds ReadingStatusSelector." "React Component"
                bookDescription      = component "BookDescription"      "Expandable/collapsible book synopsis section." "React Component"
                readingStatusSelector = component "ReadingStatusSelector" "Dropdown to set a work as READING, COMPLETED, or clear status. Appears in BookActionCard." "React Component"

                # ─── Loan domain components ───
                loanCard         = component "LoanCard"         "Active loan card: cover, title, due date, overdue badge, return and renew buttons with renewal counter (0/2)." "React Component"
                loanEmptyState   = component "LoanEmptyState"   "Empty state when user has no active loans." "React Component"
                loanHistoryTable = component "LoanHistoryTable" "Table of returned loans with cover thumbnail, title, borrow/return dates." "React Component"
                loanOverdueBadge = component "LoanOverdueBadge" "Red badge shown on overdue loans with days-overdue count." "React Component"

                # ─── Reservation domain components ───
                reservationCard       = component "ReservationCard"       "Reservation queue card: cover, title, queue position (#N), hold countdown banner, borrow/cancel buttons." "React Component"
                reservationEmptyState = component "ReservationEmptyState" "Empty state when user has no active reservations." "React Component"

                # ─── Reading Status domain components ───
                readingBookCard    = component "ReadingBookCard"    "Card displaying a book's reading status with cover, title, and date-set info." "React Component"
                readingEmptyState  = component "ReadingEmptyState"  "Empty state when user has no books in their reading tracker." "React Component"

                # ─── Shared UI primitives ───
                buttonUI      = component "Button"         "Polymorphic button with 6 variants (default, outline, secondary, ghost, destructive, link) and 6 sizes. Built on Base UI." "UI Primitive" "UIComponent"
                cardUI        = component "Card"           "Compound card component with Header, Title, Description, Action, Content, and Footer slots." "UI Primitive" "UIComponent"
                inputUI       = component "Input"          "Styled text input built on Base UI primitives." "UI Primitive" "UIComponent"
                badgeUI       = component "Badge"          "Inline status badge with variant support. Built on Base UI." "UI Primitive" "UIComponent"
                skeletonUI    = component "Skeleton"       "Animated placeholder for loading states." "UI Primitive" "UIComponent"
                alertMessage  = component "AlertMessage"   "Alert banner with icon for danger, info, and warning variants." "UI Primitive" "UIComponent"
                bookCoverImage = component "BookCoverImage" "Book cover with Open Library CDN URL and graceful fallback placeholder." "UI Primitive" "UIComponent"
                copyPips      = component "CopyPips"       "Visual availability indicator: colored pips for available vs total copies." "UI Primitive" "UIComponent"
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

        # ══════════════════════════════════════════════════════════════════════
        # SPA COMPONENT RELATIONSHIPS
        # ══════════════════════════════════════════════════════════════════════

        # App entry → contexts and router
        appRouter -> appLayout "Renders as root layout"
        appRouter -> protectedRoute "Wraps authenticated routes"
        appLayout -> themeToggle "Renders in navbar"
        appLayout -> buttonUI "Uses for nav links"
        appLayout -> authContext "Reads user state"
        themeToggle -> themeContext "Reads/toggles theme"

        # Router → Pages
        appRouter -> catalogPage "Route: /"
        appRouter -> bookDetailPage "Route: /book/:id"
        appRouter -> authPage "Route: /login"
        appRouter -> myLoansPage "Route: /loans (protected)"
        appRouter -> myReservationsPage "Route: /reservations (protected)"
        appRouter -> myBooksPage "Route: /my-books (protected)"

        # CatalogPage dependencies
        catalogPage -> useCatalogSearch "Uses for search state"
        catalogPage -> categoryFilterBar
        catalogPage -> catalogSearchForm
        catalogPage -> catalogToolbar
        catalogPage -> catalogResultsGrid
        catalogPage -> catalogPagination
        catalogPage -> catalogEmptyState
        catalogPage -> catalogErrorState
        catalogSearchForm -> buttonUI
        catalogToolbar -> buttonUI
        catalogResultsGrid -> bookCard
        catalogResultsGrid -> skeletonUI
        bookCard -> bookCoverImage
        bookCard -> copyPips
        bookCard -> buttonUI
        bookCard -> cardUI
        catalogPagination -> buttonUI
        catalogEmptyState -> buttonUI
        catalogErrorState -> buttonUI

        # BookDetailPage dependencies
        bookDetailPage -> useBookDetail "Uses for work data"
        bookDetailPage -> bookHero
        bookDetailPage -> bookMeta
        bookDetailPage -> bookAvailabilityPanel
        bookDetailPage -> bookActionCard
        bookDetailPage -> bookDescription
        bookDetailPage -> buttonUI
        bookDetailPage -> skeletonUI
        bookHero -> bookCoverImage
        bookAvailabilityPanel -> copyPips
        bookActionCard -> buttonUI
        bookActionCard -> alertMessage
        bookActionCard -> readingStatusSelector
        bookActionCard -> useReservations "Uses for reserve action"
        bookActionCard -> authContext "Reads user state"
        readingStatusSelector -> useReadingStatus "Uses for status actions"
        readingStatusSelector -> authContext "Reads user state"

        # AuthPage dependencies
        authPage -> buttonUI
        authPage -> cardUI
        authPage -> alertMessage
        authPage -> inputUI
        authPage -> authContext "Uses login/register"

        # MyLoansPage dependencies
        myLoansPage -> useMyLoans "Uses for loan data"
        myLoansPage -> loanCard
        myLoansPage -> loanEmptyState
        myLoansPage -> loanHistoryTable
        myLoansPage -> alertMessage
        myLoansPage -> skeletonUI
        loanCard -> bookCoverImage
        loanCard -> buttonUI
        loanCard -> cardUI
        loanCard -> loanOverdueBadge
        loanEmptyState -> buttonUI
        loanHistoryTable -> bookCoverImage

        # MyReservationsPage dependencies
        myReservationsPage -> useReservations "Uses for reservation data"
        myReservationsPage -> reservationCard
        myReservationsPage -> reservationEmptyState
        myReservationsPage -> alertMessage
        myReservationsPage -> skeletonUI
        reservationCard -> cardUI
        reservationCard -> buttonUI
        reservationCard -> bookCoverImage
        reservationEmptyState -> buttonUI

        # MyBooksPage dependencies
        myBooksPage -> useReadingStatus "Uses for reading data"
        myBooksPage -> readingBookCard
        myBooksPage -> readingEmptyState
        myBooksPage -> alertMessage
        myBooksPage -> skeletonUI
        readingBookCard -> cardUI
        readingBookCard -> bookCoverImage
        readingEmptyState -> buttonUI

        # Hooks → API container
        useCatalogSearch -> api "GET /api/books/search"
        useBookDetail -> api "GET /api/books/:key"
        useMyLoans -> api "GET/POST /api/loans"
        useReservations -> api "GET/POST/DELETE /api/reservations"
        useReadingStatus -> api "GET/PUT/DELETE /api/reading-status"

        # ══════════════════════════════════════════════════════════════════════
        # API COMPONENT RELATIONSHIPS
        # ══════════════════════════════════════════════════════════════════════

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

        # C4 Level 3 — Components (SPA internals)
        component spa "SpaComponents" "C4 Level 3: Component diagram — pages, hooks, contexts, and UI primitives inside the React SPA." {
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

        # Dynamic view: Reserve a book (UC-03)
        dynamic librarySystem "ReserveFlow" "Key interaction sequence: a user reserves an unavailable book (UC-03 — FIFO queue, happy path)." {
            user -> spa "Clicks 'Reserve Copy' when 0 available"
            spa -> api "POST /api/reservations  { workKey }"
            api -> db "BEGIN TRANSACTION — verify 0 available, no duplicate reservation"
            db -> api "Returns queue state"
            api -> db "INSERT Reservation with FIFO position"
            db -> api "COMMIT — Reservation created, position = #N"
            api -> spa "201 Created — { reservation, position }"
            spa -> user "Shows reservation confirmation with queue position"
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
            element "UIComponent" {
                background #ec4899
                color #ffffff
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
