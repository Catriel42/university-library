# ADR-0001: Client Token Storage via HttpOnly Cookies

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Development Team
- **Technical Story:** OPEN-02, FR-03, FR-04, NFR-10, NFR-11

---

## Context and Problem Statement

The University Library SPA requires authenticated sessions for registered users to perform loans, renewals, returns, and reservations. Authentication is implemented using JSON Web Tokens (JWT) signed by the backend.

Because a Single-Page Application (SPA) runs client-side JavaScript in the browser, the client must persist the token across page reloads and include it in requests to protected API endpoints. We must decide where and how the client stores this authentication credential while balancing security (mitigating token theft) and operational complexity.

---

## Decision Drivers

- **XSS Mitigation (NFR-11):** Prevent malicious scripts from accessing or exfiltrating user authentication tokens.
- **Stateless Architecture:** Maintain a stateless backend where requests are authenticated via cryptographic signature verification without requiring a centralized session store (e.g. Redis or database session tables).
- **Deployment and CORS Compatibility:** Support development on local environments (`localhost:5173` frontend, `localhost:3001` backend) and production deployments (unified CloudFront/reverse proxy or dedicated domains).
- **User Experience:** Maintain session persistence across browser reloads without requiring re-authentication.

---

## Considered Options

- **Option 1:** `localStorage` / `sessionStorage` with manual `Authorization: Bearer <token>` header.
- **Option 2:** Browser-managed `HttpOnly`, `Secure`, `SameSite` cookies transporting the JWT.
- **Option 3:** In-memory token storage (JavaScript variable) combined with an `HttpOnly` cookie for refresh tokens.

---

## Decision Outcome

Chosen option: **"Option 2: Browser-managed HttpOnly, Secure, SameSite cookies transporting the JWT"**, because:

1. **Total XSS Immunity for the Token:** Setting the `HttpOnly` flag ensures that client-side JavaScript (`document.cookie`, third-party libraries, or injected scripts) cannot read or exfiltrate the token.
2. **Stateless Verification:** The cookie carries the self-contained JWT. The backend does not need to query a session table; it validates the token signature statelessly on every request.
3. **Simplicity over Option 3:** Option 3 introduces significant client-side complexity (silent refresh loops, race conditions on expired access tokens) that is disproportionate for this capstone's 7-week scope.

### Security Configurations Required

To eliminate Cross-Site Request Forgery (CSRF) and secure transit, the authentication cookie will be issued with the following attributes:

- `HttpOnly`: Set to `true` (blocks JavaScript access).
- `Secure`: Set to `true` in production (enforces transmission strictly over HTTPS; disabled on localhost development).
- `SameSite`: Set to `Lax` (or `Strict` for mutating endpoints), ensuring the browser never sends the cookie on cross-site requests initiated by third-party origins.
- `Path`: Set to `/api` to scope cookie transmission solely to backend endpoints.

### Positive Consequences

- Mitigates credential theft via Cross-Site Scripting (XSS).
- Retains complete statelessness on the Node.js / Express backend.
- Simplifies client-side API calls: the browser automatically includes the cookie with requests without needing custom header interceptors.

### Negative Consequences and Trade-offs

- **CORS Configuration:** In cross-origin setups (e.g. development on ports `5173` and `3001`), Express CORS must be explicitly configured with `credentials: true` and a specific `origin` whitelist (wildcard `*` is disallowed when credentials are included).
- **Frontend Fetch Configuration:** Frontend network calls must set `credentials: 'include'` in Fetch/Axios.

---

## Pros and Cons of the Options

### Option 1: LocalStorage / SessionStorage

- **Pros:**
  - Trivial to implement.
  - Immune to CSRF attacks by default because headers must be attached explicitly by code.
  - Works easily across different domains without CORS cookie restrictions.
- **Cons:**
  - Highly vulnerable to XSS: any compromised dependency or script injection can immediately execute `localStorage.getItem('token')` and exfiltrate the credential.

### Option 2: HttpOnly, Secure, SameSite Cookie with JWT (Selected)

- **Pros:**
  - Token is inaccessible to client JavaScript; immune to script-based exfiltration.
  - Automatic browser management for transmission and expiration.
  - Completely stateless backend verification.
- **Cons:**
  - Requires strict `SameSite` and `Secure` attributes to prevent CSRF.
  - Requires explicit CORS credentials configuration when frontend and backend run on different ports during development.

### Option 3: In-Memory Access Token with HttpOnly Refresh Token

- **Pros:**
  - Combines the strongest attributes of both approaches: access token cannot be sent via CSRF, and refresh token cannot be stolen via XSS.
- **Cons:**
  - Substantially higher implementation complexity: requires token rotation, mutex locking during concurrent requests, and automatic refresh interceptors in React.

---

## Links and References

- [SRS Section 4.1: Authentication (FR-01 to FR-07)](../SRS.md#41-authentication)
- [SRS Section 5: Security (NFR-10, NFR-11, NFR-12)](../SRS.md#5-non-functional-requirements)
- [SRS Section 9: Open Issue OPEN-02 (Resolved)](../SRS.md#9-assumptions-and-open-issues)
- [OWASP Session Management Cheat Sheet: Cookies](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#cookies)
