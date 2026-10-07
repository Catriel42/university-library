# JWT Expiration and Refresh Token Strategy

- **Status:** accepted
- **Date:** 2026-10-07
- **Deciders:** Development Team
- **Technical Story:** OPEN-05, FR-03, NFR-10

---

## Context and Problem Statement

As decided in ADR-0001, we are using HttpOnly cookies to store session tokens for security (XSS mitigation). However, JSON Web Tokens (JWTs) cannot be easily invalidated on the server once issued (statelessness). If we issue a long-lived JWT (e.g., 7 days) and a user's account is compromised, we cannot revoke their access until the token expires. We need a strategy to balance security (short expiration) with user experience (not forcing users to log in repeatedly).

---

## Decision Drivers

- Security (NFR-10): Minimizing the window of opportunity for stolen tokens.
- User Experience: Keeping users logged in for a reasonable duration (e.g., 7 days).
- System Complexity: Maintaining a mostly stateless authentication flow.

---

## Considered Options

- **Option 1:** Short-lived Access Token + Long-lived Refresh Token (HttpOnly).
- **Option 2:** Long-lived Access Token only.
- **Option 3:** Stateful sessions (Database-backed session IDs).

---

## Decision Outcome

Chosen option: **"Option 1: Short-lived Access Token + Long-lived Refresh Token (HttpOnly)"**, because it provides the best balance of security and usability. We will issue a short-lived Access Token (e.g., 15 minutes) and a long-lived Refresh Token (e.g., 7 days), both stored in Secure, HttpOnly cookies. When the Access Token expires, the frontend will automatically call a `/refresh` endpoint. The backend can then validate the Refresh Token against the database (allowing us to revoke it if necessary) before issuing a new Access Token.

### Positive Consequences

- **High Security:** The Access Token, which is used for all API calls, expires quickly.
- **Revocability:** Refresh tokens can be revoked in the database (e.g., on logout, password change, or admin action), effectively terminating access within 15 minutes.
- **Seamless UX:** Users remain logged in without interruption as long as their Refresh Token is valid.

### Negative Consequences and Trade-offs

- **Increased Complexity:** Requires implementing an additional `/refresh` endpoint and handling token rotation logic on the frontend (intercepting 401 Unauthorized responses to trigger a refresh and retry).
- **Slightly Stateful:** While API calls remain stateless, the `/refresh` endpoint must query the database to verify the Refresh Token has not been revoked.

---

## Pros and Cons of the Options

### Option 1: Short-lived Access Token + Long-lived Refresh Token

- **Pros:**
  - Limits exposure of the Access Token.
  - Allows token revocation.
  - Good user experience.
- **Cons:**
  - Most complex to implement on both frontend and backend.

### Option 2: Long-lived Access Token only

- **Pros:**
  - Very simple to implement.
  - Completely stateless.
- **Cons:**
  - Cannot revoke access. If a token is stolen, the attacker has full access for days.

### Option 3: Stateful sessions (Database-backed session IDs)

- **Pros:**
  - Perfect revocability.
  - Simplest security model.
- **Cons:**
  - Every API request requires a database lookup to validate the session.
  - Less scalable (though acceptable for our scale, it deviates from the modern JWT standard).

---

## Links and References

- docs/SRS.md#OPEN-05 V1.2
- docs/adr/0001-client-token-storage.md
