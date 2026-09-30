# Architecture Decision Records (ADR)

This directory documents the significant architectural decisions made during the design and development of the University Library Single-Page Application.

---

## What is an ADR?

An **Architecture Decision Record (ADR)** is a lightweight, version-controlled document that captures a key architectural choice, along with its context, considered alternatives, and consequences (both positive and trade-offs).

This project adopts the **MADR (Markdown Architectural Decision Records)** standard, based on the principles established by Michael Nygard (2011) and endorsed by the ThoughtWorks Technology Radar.

---

## When to Write an ADR

Write an ADR whenever a technical decision:

1. Has significant long-term impact on system architecture, security, or data integrity.
2. Involves trade-offs between two or more viable alternatives.
3. Resolves an open issue or architectural requirement identified in [docs/SRS.md](../SRS.md) (e.g. `OPEN-02`, `OPEN-03`).

---

## How to Create a New Record

1. Copy [`docs/adr/template.md`](./template.md) to a new file named `XXXX-short-title.md` (e.g. `0001-client-token-storage.md`).
2. Fill in the context, decision drivers, considered options, and outcome.
3. Submit the ADR for review. Once approved, update its status from `proposed` to `accepted`.
4. Register the new record in the index table below.

---

## Decision Log

| ID | Date | Title | Status | Related SRS Item |
| --- | --- | --- | --- | --- |
| [ADR-0001](./0001-client-token-storage.md) | 2026-09-30 | Client Token Storage Strategy (LocalStorage vs HttpOnly Cookie) | Accepted | OPEN-02, NFR-10, NFR-11 |
| [ADR-0002](./0002-book-availability-strategy.md) | Pending | Book Availability Strategy (On-Read vs Maintained Counters) | Proposed | OPEN-03, BR-03, NFR-05 |
| [ADR-0003](./0003-open-library-proxy-and-caching.md) | Pending | Open Library Proxying, Identification, and Caching Policies | Proposed | OPEN-04, NFR-04, ASM-01 |
| [ADR-0004](./0004-jwt-lifecycle-and-sessions.md) | Pending | JWT Expiration and Refresh Token Strategy | Proposed | OPEN-05, FR-03, NFR-10 |
