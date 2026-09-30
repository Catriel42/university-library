#!/usr/bin/env node
// SPIKE-01: live verification of the Open Library behaviors the SRS depends on.
// Requires Node 18+ (global fetch). Usage: node docs/spike/openlibrary-spike.js
// Makes about 25 requests with short pauses. Do not run it in a loop.

const BASE = 'https://openlibrary.org';
// Replace with your contact so Open Library can identify your traffic.
const HEADERS = { 'User-Agent': 'UniversityLibraryCapstone/1.0 (replace-with-your-email)' };
const FIELDS =
  'key,title,author_name,first_publish_year,cover_i,edition_count,subject,readinglog_count,want_to_read_count,already_read_count';

const results = [];
const latencies = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path) {
  await sleep(300);
  const t0 = performance.now();
  const res = await fetch(BASE + path, { headers: HEADERS });
  const ms = Math.round(performance.now() - t0);
  latencies.push(ms);
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* body was not JSON */
  }
  return { status: res.status, ms, json };
}

function report(level, name, detail = '') {
  results.push(level);
  console.log(`${level.padEnd(4)}  ${name}${detail ? '  |  ' + detail : ''}`);
}
const pass = (n, d) => report('PASS', n, d);
const fail = (n, d) => report('FAIL', n, d);
const info = (n, d) => report('INFO', n, d);
const check = (ok, n, d) => (ok ? pass(n, d) : fail(n, d));

const total = (j) => j?.numFound ?? j?.num_found;
const nonIncreasing = (a) => a.every((v, i) => i === 0 || v <= a[i - 1]);
const nonDecreasing = (a) => a.every((v, i) => i === 0 || v >= a[i - 1]);
const normKey = (k) => String(k).replace('/works/', '');

async function run() {
  console.log('SPIKE-01 Open Library live verification\n');

  // 1. Basic search shape
  const basic = await api(`/search.json?q=the+lord+of+the+rings&limit=5&fields=${FIELDS}`);
  check(basic.status === 200 && Array.isArray(basic.json?.docs), 'basic search returns docs[]', `status ${basic.status}, ${basic.ms} ms`);
  info('total count key', `numFound=${basic.json?.numFound} num_found=${basic.json?.num_found} (read numFound ?? num_found)`);
  info('work key format', `first doc key = ${basic.json?.docs?.[0]?.key} -> normalized ${normKey(basic.json?.docs?.[0]?.key)}`);

  // 2. Category filter
  const subj = await api(`/search.json?subject=science&limit=10&fields=key,title,subject`);
  const docs = subj.json?.docs ?? [];
  const matching = docs.filter((d) => (d.subject ?? []).some((s) => /science/i.test(s))).length;
  check(subj.status === 200 && docs.length > 0 && matching / docs.length >= 0.8, 'subject filter works', `${matching}/${docs.length} docs list a science subject, total ${total(subj.json)}`);

  // 3. Publication date sorts
  const newer = await api(`/search.json?q=history&sort=new&limit=20&fields=key,first_publish_year`);
  const yNew = (newer.json?.docs ?? []).map((d) => d.first_publish_year).filter((y) => y != null);
  const missingNew = (newer.json?.docs ?? []).filter((d) => d.first_publish_year == null).length;
  check(nonIncreasing(yNew) && yNew.length > 0, 'sort=new is newest first', `years ${yNew.slice(0, 6).join(',')}...`);
  info('sort=new works without a year on first 20', String(missingNew));

  const older = await api(`/search.json?q=history&sort=old&limit=20&fields=key,first_publish_year`);
  const oldDocs = older.json?.docs ?? [];
  const yOld = oldDocs.map((d) => d.first_publish_year).filter((y) => y != null);
  const firstMissing = oldDocs.findIndex((d) => d.first_publish_year == null);
  const missingLast = firstMissing === -1 || oldDocs.slice(firstMissing).every((d) => d.first_publish_year == null);
  check(nonDecreasing(yOld) && yOld.length > 0 && missingLast, 'sort=old is oldest first, missing years last', `years ${yOld.slice(0, 6).join(',')}...`);

  // 4. Popularity sorts
  for (const [sort, field] of [
    ['readinglog', 'readinglog_count'],
    ['want_to_read', 'want_to_read_count'],
    ['already_read', 'already_read_count'],
  ]) {
    const r = await api(`/search.json?q=history&sort=${sort}&limit=20&fields=key,title,${field}`);
    const counts = (r.json?.docs ?? []).map((d) => d[field] ?? 0);
    check(r.status === 200 && counts.length > 0 && nonIncreasing(counts), `sort=${sort} is descending by ${field}`, `top counts ${counts.slice(0, 5).join(',')}`);
  }
  const rated = await api(`/search.json?q=history&sort=rating&limit=10&fields=key,title`);
  check(rated.status === 200 && (rated.json?.docs ?? []).length > 0, 'sort=rating accepted', `status ${rated.status}`);

  // 5. Title sort (eyeball the order)
  const byTitle = await api(`/search.json?q=history&sort=title&limit=10&fields=key,title`);
  check(byTitle.status === 200 && (byTitle.json?.docs ?? []).length > 0, 'sort=title accepted', (byTitle.json?.docs ?? []).slice(0, 5).map((d) => d.title).join(' | '));

  // 6. Author sort: expected to be unsupported
  const relevance = await api(`/search.json?q=history&limit=20&fields=key`);
  const byAuthor = await api(`/search.json?q=history&sort=author&limit=20&fields=key,author_name`);
  const same = JSON.stringify((relevance.json?.docs ?? []).map((d) => d.key)) === JSON.stringify((byAuthor.json?.docs ?? []).map((d) => d.key));
  info('sort=author (expected unsupported)', `status ${byAuthor.status}; order identical to relevance: ${same}. If true or non-200, author sort is not native.`);

  // 7. Search by author
  const auth = await api(`/search.json?author=tolkien&limit=10&fields=key,title,author_name`);
  const tolkien = (auth.json?.docs ?? []).filter((d) => (d.author_name ?? []).some((a) => /tolkien/i.test(a))).length;
  check(auth.status === 200 && tolkien > 0, 'author= filter works', `${tolkien}/${(auth.json?.docs ?? []).length} docs by a Tolkien`);

  // 8. Pagination
  const p1 = await api(`/search.json?q=history&limit=10&page=1&fields=key`);
  const p2 = await api(`/search.json?q=history&limit=10&page=2&fields=key`);
  const off = await api(`/search.json?q=history&limit=10&offset=10&fields=key`);
  const k1 = new Set((p1.json?.docs ?? []).map((d) => d.key));
  const k2 = (p2.json?.docs ?? []).map((d) => d.key);
  const ko = (off.json?.docs ?? []).map((d) => d.key);
  check(k2.length > 0 && k2.every((k) => !k1.has(k)), 'page=1 and page=2 are disjoint');
  check(JSON.stringify(k2) === JSON.stringify(ko), 'offset=10 equals page=2 (limit 10)');

  // 9. Maximum limit (needed for the exact author-sort tier)
  const big = await api(`/search.json?q=history&limit=100&fields=key,title,author_name`);
  const n = (big.json?.docs ?? []).length;
  check(big.status === 200 && n === 100, 'limit=100 returns 100 docs', `got ${n}, ${big.ms} ms`);

  // 10. Work detail
  const work = await api(`/works/OL27448W.json`);
  check(work.status === 200 && !!work.json?.title, 'work detail endpoint works', `title: ${work.json?.title}`);
  const d = work.json?.description;
  info('work description type', d == null ? 'absent' : typeof d === 'string' ? 'string' : `object (${Object.keys(d).join(',')}), handle .value`);

  // 11. Cover
  const cover = await fetch('https://covers.openlibrary.org/b/id/258027-M.jpg?default=false', { method: 'HEAD', headers: HEADERS });
  check(cover.status === 200, 'cover by id returns an image', `status ${cover.status}`);

  // 12. Candidate categories with result counts
  console.log('\nCandidate categories (result counts):');
  for (const s of ['fiction', 'science', 'history', 'biography', 'philosophy', 'art', 'computers', 'mathematics', 'psychology', 'economics']) {
    const r = await api(`/search.json?subject=${encodeURIComponent(s)}&limit=1&fields=key`);
    info(`subject=${s}`, `${total(r.json) ?? 'n/a'} works`);
  }

  // Latency
  const sorted = [...latencies].sort((a, b) => a - b);
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
  console.log(`\nLatency over ${sorted.length} calls: median ${sorted[Math.floor(sorted.length / 2)]} ms, p95 ${p95} ms, max ${sorted[sorted.length - 1]} ms`);
  info('NFR-01 (2 s) risk', p95 > 2000 ? 'p95 above 2 s: rely on backend caching' : 'p95 within 2 s');

  const failed = results.filter((r) => r === 'FAIL').length;
  console.log(`\n${results.filter((r) => r === 'PASS').length} passed, ${failed} failed. Paste this output into SPIKE-01-openlibrary.md.`);
  process.exitCode = failed ? 1 : 0;
}

run().catch((e) => {
  console.error('Spike aborted:', e);
  process.exitCode = 2;
});
