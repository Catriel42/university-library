# Open Library Proxying and Caching Policies

- **Status:** accepted
- **Date:** 2026-10-07
- **Deciders:** Development Team
- **Technical Story:** OPEN-04, NFR-04, ASM-01

---

## Context and Problem Statement

The application relies on the Open Library API to retrieve book catalog data. During technical spikes (SPIKE-01), we observed that the Open Library API can take up to 4 seconds to return a page of 100 books. Furthermore, third-party APIs often have rate limits. To provide a responsive user experience (NFR-04 requires catalog browsing to be fast) and to avoid being blocked by Open Library, we must proxy the requests through our backend and cache the responses. The problem is selecting the appropriate caching infrastructure and strategy.

---

## Decision Drivers

- Performance and Latency (NFR-04): Must hide the 4-second latency of the upstream API.
- Infrastructure Complexity: Avoiding unnecessary services in a small-scale capstone project.
- Data Freshness: Catalog metadata (title, author, cover) changes very rarely.

---

## Considered Options

- **Option 1:** In-memory RAM cache (e.g., `lru-cache` or `node-cache`).
- **Option 2:** Distributed cache using Redis.
- **Option 3:** Client-side caching only.

---

## Decision Outcome

Chosen option: **"Option 1: In-memory RAM cache"**, because the catalog metadata is highly static, and our backend will run as a single instance for this capstone project. Introducing Redis would add unnecessary infrastructure complexity (provisioning, environment variables, deployment dependencies). An in-memory LRU cache in Node.js is sufficient to drastically reduce API calls for popular searches (like "fiction") and keep responses under 200ms after the initial warm-up.

### Positive Consequences

- **Zero Infrastructure Overhead:** No need to host or manage a Redis instance.
- **High Performance:** Reading from local RAM is faster than a network call to a Redis server.
- **Cost Effective:** Keeps deployment costs at zero (can run easily on AWS Lambda or basic VPS).

### Negative Consequences and Trade-offs

- **Memory Constraints:** The cache size is limited by the Node.js process memory. We must use an LRU (Least Recently Used) policy to prevent Out-Of-Memory (OOM) crashes.
- **No Shared State:** If we were to scale the backend to multiple instances (e.g., behind a load balancer), each instance would have its own cold cache. This is acceptable for our current scope.

---

## Pros and Cons of the Options

### Option 1: In-memory RAM cache (e.g., `lru-cache`)

- **Pros:**
  - Extremely fast.
  - Zero operational overhead.
  - Easy to implement.
- **Cons:**
  - State is lost on server restart.
  - Cache is not shared across horizontal instances.

### Option 2: Distributed cache using Redis

- **Pros:**
  - Persistent and shared across multiple backend instances.
  - Can store much larger volumes of data.
- **Cons:**
  - Overkill for a capstone project.
  - Adds a new service dependency and deployment complexity.

### Option 3: Client-side caching only

- **Pros:**
  - Backend stays completely stateless and acts as a simple pass-through.
- **Cons:**
  - Does not protect the Open Library API from global rate-limits (every new user triggers a new 4s request to the upstream API).

---

## Links and References

- docs/SRS.md#OPEN-04 V1.2
- docs/spikes/SPIKE-01-openlibrary.md
