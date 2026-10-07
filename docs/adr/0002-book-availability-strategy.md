# Book Availability Strategy (On-Read vs Maintained Counters)

- **Status:** accepted
- **Date:** 2026-10-07
- **Deciders:** Development Team
- **Technical Story:** OPEN-03, BR-03, NFR-05

---

## Context and Problem Statement

The system allows users to browse books retrieved from the Open Library API. For each book displayed, we must show whether it is available to borrow. Since the catalog comes from a third-party API, our local database only stores borrowing activity (loans). When returning lists of up to 100 books per page, we need an efficient way to determine the availability of each book. The problem is how to design the database architecture to support fast availability checks without introducing data inconsistencies.

---

## Decision Drivers

- Performance requirements (NFR-05): Needs to resolve availability for 100 items quickly.
- Data Consistency: Avoiding out-of-sync states between catalog and loans.
- Simplicity: Keeping the database schema and application logic straightforward.

---

## Considered Options

- **Option 1:** Compute availability on-read using batched queries.
- **Option 2:** Maintain an availability counter column in a local `works` table.

---

## Decision Outcome

Chosen option: **"Option 1: Compute availability on-read using batched queries"**, because our domain rules state there is only ever 1 virtual copy of each book (ASM-01). We only need to check if an active loan exists for a given Open Library `work_id`. A batched `SELECT ... WHERE work_id IN (...) AND status = 'ACTIVE'` query is fast, maintains perfect consistency by making the `loans` table the single source of truth, and avoids the complexity of synchronizing counter columns.

### Positive Consequences

- **Perfect Consistency:** No risk of the "available" status drifting from the actual loan records.
- **Simpler Schema:** We do not need a secondary table just to keep track of counts.
- **Simpler Writes:** Borrowing and returning books only requires inserting/updating a single `loans` record, without distributed transactions or triggers.

### Negative Consequences and Trade-offs

- **Slightly Higher Read Cost:** Requires querying the `loans` table every time the catalog is browsed. However, with an index on `work_id` and `status`, this read cost is negligible.

---

## Pros and Cons of the Options

### Option 1: Compute availability on-read using batched queries

- **Pros:**
  - Single source of truth.
  - Simpler write operations (no updating counts).
  - Robust against concurrency issues (no race conditions updating a counter).
- **Cons:**
  - Database must perform a join or batched IN query on every catalog fetch.

### Option 2: Maintain an availability counter column in a local `works` table

- **Pros:**
  - Reading the catalog does not require querying the `loans` table.
- **Cons:**
  - Requires maintaining a duplicate local representation of the catalog.
  - High risk of data inconsistency if a transaction fails (e.g. loan created but count not decremented).
  - Requires database triggers or complex application-level transactions.

---

## Links and References

- docs/SRS.md#OPEN-03 V1.2
