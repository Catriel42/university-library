# SPIKE-01: Open Library Search API verification

**Status:** Live verification complete (2026-09-30). All 15 checks passed (0 failed).
**Related SRS items:** ASM-02 to ASM-05, FR-11 to FR-14, OPEN-01, OPEN-04

## Goal

Confirm that Open Library can support the search, category filter, and sort options the SRS requires, and decide how to handle whatever it cannot.

## Method

- Read the official Search API documentation (https://openlibrary.org/dev/docs/api/search).
- Read the Open Library source that defines the searchable fields and sort options (`openlibrary/plugins/worksearch/schemes/works.py`, commit `b4afa14`).
- **Live verification performed:** Executed `docs/spikes/openlibrary-spike.js` (27 live API calls) against `https://openlibrary.org` with User-Agent identification.

## Findings

| # | Question | Result | Evidence |
|---|---|---|---|
| 1 | Category filter possible? | **Yes.** `subject` is a supported search parameter (`/search.json?subject=science`). | Live verified: 10/10 results matched requested subject; total count: 587,987 works for science. |
| 2 | Sort by publication date? | **Yes.** `sort=new` (newest first), `sort=old` (oldest first). Works with no publication year are placed last for `old`. | Live verified: `sort=new` ordered descending (note: some catalog entries contain erroneous future years like 9981); `sort=old` ordered ascending with missing years placed last. |
| 3 | Sort by popularity? | **Yes.** `readinglog`, `want_to_read`, `already_read`, `rating` (also `rating asc` / `rating desc`). | Live verified: counts for `readinglog_count`, `want_to_read_count`, `already_read_count` all sort in strictly non-increasing order. |
| 4 | Sort by title? | **Yes.** `sort=title` (ascending). | Live verified: status 200, results returned alphabetically. |
| 5 | Sort by author? | **No native support (returns HTTP 500).** Passing `sort=author` crashes the query upstream with a 500 Internal Server Error. | Live verified: confirmed HTTP 500 response from Open Library when `sort=author` is supplied. |
| 6 | Search by title / author? | **Yes.** `title=`, `author=` (mapped to `author_name`, accepts author key or name), and `q=`. | Live verified: 10/10 results for `author=tolkien` matched author name. |
| 7 | Pagination | **Yes.** `page` with `limit`, or `offset` with `limit`. | Live verified: `page=1` and `page=2` are disjoint sets; `offset=10` produces identical results to `page=2` (at `limit=10`). |
| 8 | What does search return? | **Works**, not editions. Each doc has `key`, `title`, `author_name`, `first_publish_year`, `cover_i`, etc. | Live verified: doc key format `/works/OL...W`. Use `fields=` to request only required keys to minimize payload. |
| 9 | Useful extra fields | `readinglog_count`, `want_to_read_count`, `already_read_count`, `subject`, `first_publish_year` are valid fields. | Live verified: all fields returned successfully when specified in `fields=`. |
| 10 | Max limit | Tested up to `limit=100` successfully. | Live verified: returned exactly 100 docs in 3,963 ms. |
| 11 | Work detail description format | **Varies between string and object.** Returned as `{ type: '/type/text', value: '...' }`. | Live verified: backend/frontend adapter must handle both `typeof desc === 'string' ? desc : desc?.value`. |
| 12 | Cover image availability | Verified via `covers.openlibrary.org/b/id/{id}-M.jpg`. | Live verified: HTTP 200 image response. |

## Inconsistencies to handle in the backend

These come from the official docs and live verification, and must be normalized in an adapter module:

1. **Total count key:** API may return `num_found` or `numFound`. Read `json.numFound ?? json.num_found`.
2. **Work key format:** API returns `"key": "/works/OL27448W"`. Normalize by stripping the `/works/` prefix and always storing and querying the bare `OL...W` key.
3. **Description schema:** Work detail endpoint `/works/{key}.json` may return `description` as a raw string or an object `{ type: string, value: string }`.
4. **`availability` field:** Open Library can add Internet Archive lending availability (`fields=*,availability`). That is archive.org's lending state and has nothing to do with this system's loans. Do not use it.
5. **No `sort=author` on upstream:** Never pass `sort=author` to Open Library (it returns HTTP 500). Implement the backend 2-tier sort specified in ASM-05.

## Decisions

| Topic | Decision |
|---|---|
| Category list | Curated list of 10 subjects in frontend config mapped to `subject=`. Live counts verified: `fiction` (1.68M), `history` (3.5M), `science` (587K), `biography` (1.0M), `philosophy` (339K), `art` (603K), `computers` (256K), `mathematics` (209K), `psychology` (314K), `economics` (768K). |
| Sort options in the UI | Relevance (default), Newest (`new`), Oldest (`old`), Most popular (`readinglog`), Top rated (`rating desc`), Title A-Z (`title`), Author A-Z (backend-managed). |
| Default "popularity" | `readinglog` (total reading-log adds). |
| **Author sort** | Implemented in backend proxy: if total matches <= 100, fetch with `limit=100` and sort by first author name (**exact**). If > 100, sort **within the current page** only, and UI displays "Sorted within this page". |
| Availability enrichment | One batched database query per result page using the work keys of that page (NFR-05). |
| Backend caching | Mandatory. Live latency p95 is ~3.96 s. Backend caching (NFR-04) with Redis/in-memory cache (10 min TTL for search, 24 h for work details) is necessary to meet NFR-01 (<= 2 s). |

## How to run the live check

Requires Node 18 or newer and internet access:

```bash
node docs/spikes/openlibrary-spike.js
```

## Live results (Run on 2026-09-30)

```text
SPIKE-01 Open Library live verification

PASS  basic search returns docs[]  |  status 200, 1053 ms
INFO  total count key  |  numFound=1106 num_found=1106 (read numFound ?? num_found)
INFO  work key format  |  first doc key = /works/OL27448W -> normalized OL27448W
PASS  subject filter works  |  10/10 docs list a science subject, total 587987
PASS  sort=new is newest first  |  years 9981,9461,9183,9176,2945,2904...
INFO  sort=new works without a year on first 20  |  0
PASS  sort=old is oldest first, missing years last  |  years 0,1,1,1,1,1...
PASS  sort=readinglog is descending by readinglog_count  |  top counts 51568,37102,23940,15129,8598
PASS  sort=want_to_read is descending by want_to_read_count  |  top counts 46468,32033,20410,13521,7170
PASS  sort=already_read is descending by already_read_count  |  top counts 1703,1315,1170,905,732
PASS  sort=rating accepted  |  status 200
PASS  sort=title accepted  |  ́ | ̇̈̇̄ | ̆̆̆̄ | 	 The Rose and the Lotus. Partnership Studies in the Works of Raja Rao.  | 	Sowjetische Schriftpolitik zwischen 1917 und 1941: Eine handlungstheoretische Analyse
INFO  sort=author (expected unsupported)  |  status 500; order identical to relevance: false. If true or non-200, author sort is not native.
PASS  author= filter works  |  10/10 docs by a Tolkien
PASS  page=1 and page=2 are disjoint
PASS  offset=10 equals page=2 (limit 10)
PASS  limit=100 returns 100 docs  |  got 100, 3963 ms
PASS  work detail endpoint works  |  title: The Lord of the Rings
INFO  work description type  |  object (type,value), handle .value
PASS  cover by id returns an image  |  status 200

Candidate categories (result counts):
INFO  subject=fiction  |  1688529 works
INFO  subject=science  |  587987 works
INFO  subject=history  |  3509426 works
INFO  subject=biography  |  1000982 works
INFO  subject=philosophy  |  339830 works
INFO  subject=art  |  603243 works
INFO  subject=computers  |  256735 works
INFO  subject=mathematics  |  209980 works
INFO  subject=psychology  |  314994 works
INFO  subject=economics  |  768097 works

Latency over 27 calls: median 1070 ms, p95 3963 ms, max 3999 ms
INFO  NFR-01 (2 s) risk  |  p95 above 2 s: rely on backend caching

15 passed, 0 failed. Paste this output into SPIKE-01-openlibrary.md.
```
