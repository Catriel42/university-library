import { prisma } from '../lib/prisma.js';
import { OpenLibraryService } from './OpenLibraryService.js';
import type { OpenLibrarySearchResponse } from './OpenLibraryService.js';

const DEFAULT_COPIES = 3;
const WORK_KEY_PREFIX = /^\/works\//;

export interface Availability {
  total: number;
  available: number;
}

type SearchDoc = OpenLibrarySearchResponse['docs'][number];

export type EnrichedDoc = SearchDoc & {
  cleanKey: string;
  totalCopies: number;
  availableCopies: number;
};

export type BookSearchResult = Omit<OpenLibrarySearchResponse, 'docs'> & {
  docs: EnrichedDoc[];
  authorSortScope?: 'exact' | 'page';
};

const toCleanKey = (key: string): string => key.replace(WORK_KEY_PREFIX, '');

/**
 * Availability for a list of works (ADR-0002: batched on-read query).
 * The three queries are independent, so they run in parallel.
 */
async function getAvailabilityForWorks(workKeys: string[]): Promise<Record<string, Availability>> {
  if (workKeys.length === 0) return {};

  const [localWorks, activeLoans, activeHolds] = await Promise.all([
    prisma.work.findMany({
      where: { id: { in: workKeys } },
      select: { id: true, copies: true },
    }),
    prisma.loan.groupBy({
      by: ['workId'],
      where: { workId: { in: workKeys }, status: 'ACTIVE' },
      _count: { _all: true },
    }),
    prisma.reservation.groupBy({
      by: ['workId'],
      where: {
        workId: { in: workKeys },
        status: 'HOLD',
        holdExpiresAt: { gt: new Date() },
      },
      _count: { _all: true },
    }),
  ]);

  const totalCopies = new Map<string, number>(localWorks.map((w) => [w.id, w.copies]));
  const loans = new Map<string, number>(activeLoans.map((l) => [l.workId, l._count._all]));
  const holds = new Map<string, number>(activeHolds.map((h) => [h.workId, h._count._all]));

  const result: Record<string, Availability> = {};
  for (const key of workKeys) {
    const total = totalCopies.get(key) ?? DEFAULT_COPIES;
    const used = (loans.get(key) ?? 0) + (holds.get(key) ?? 0);

    if (used > total) {
      console.warn(`Availability inconsistency for ${key}: ${used} in use, ${total} copies`);
    }

    result[key] = { total, available: Math.max(0, total - used) };
  }

  return result;
}

/**
 * Searches Open Library and merges in local availability.
 * Does not mutate the cached objects: it builds new ones.
 */
export interface BookSearchParams {
  q?: string;
  title?: string;
  author?: string;
  subject?: string;
  sort?: string;
  page?: string | number;
  limit?: string | number;
  lang?: string;
}

const SORT_MAPPING: Record<string, string | undefined> = {
  relevance: undefined,
  popular: 'readinglog',
  readinglog: 'readinglog',
  rating: 'rating desc',
  newest: 'new',
  new: 'new',
  oldest: 'old',
  old: 'old',
  title: 'title',
};

async function searchBooks(query: BookSearchParams): Promise<BookSearchResult> {
  const requestedPage = Math.max(1, Number(query.page) || 1);
  const requestedLimit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const rawSort = query.sort?.trim().toLowerCase();

  const stringParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      stringParams[key] = String(value);
    }
  }

  let olData: OpenLibrarySearchResponse;
  let authorSortScope: 'exact' | 'page' | undefined = undefined;

  if (rawSort === 'author') {
    const cleanParams = { ...stringParams };
    delete cleanParams.sort;

    const initialFetch = await OpenLibraryService.searchBooks({
      ...cleanParams,
      limit: '100',
      page: '1',
    });

    if (initialFetch.numFound <= 100) {
      const sortedDocs = [...initialFetch.docs].sort((a, b) => {
        const authorA = a.author_name?.[0] ?? '';
        const authorB = b.author_name?.[0] ?? '';
        return authorA.localeCompare(authorB);
      });
      const startIdx = (requestedPage - 1) * requestedLimit;
      const pagedDocs = sortedDocs.slice(startIdx, startIdx + requestedLimit);
      olData = {
        ...initialFetch,
        start: startIdx,
        docs: pagedDocs,
      };
      authorSortScope = 'exact';
    } else {
      let pageDocs: OpenLibrarySearchResponse['docs'];
      let startIdx = (requestedPage - 1) * requestedLimit;

      if (requestedPage === 1 && requestedLimit <= 100) {
        pageDocs = initialFetch.docs.slice(0, requestedLimit);
      } else {
        const pageFetch = await OpenLibraryService.searchBooks({
          ...cleanParams,
          limit: String(requestedLimit),
          page: String(requestedPage),
        });
        pageDocs = pageFetch.docs;
        startIdx = pageFetch.start;
      }

      const sortedDocs = [...pageDocs].sort((a, b) => {
        const authorA = a.author_name?.[0] ?? '';
        const authorB = b.author_name?.[0] ?? '';
        return authorA.localeCompare(authorB);
      });

      olData = {
        numFound: initialFetch.numFound,
        start: startIdx,
        docs: sortedDocs,
      };
      authorSortScope = 'page';
    }
  } else {
    const params = { ...stringParams };
    if (rawSort) {
      const mappedSort = SORT_MAPPING[rawSort];
      if (mappedSort) {
        params.sort = mappedSort;
      } else {
        delete params.sort;
      }
    }
    olData = await OpenLibraryService.searchBooks(params);
  }

  const availability = await getAvailabilityForWorks(olData.docs.map((doc) => toCleanKey(doc.key)));

  const docs: EnrichedDoc[] = olData.docs.map((doc) => {
    const cleanKey = toCleanKey(doc.key);
    const { total, available } = availability[cleanKey] ?? {
      total: DEFAULT_COPIES,
      available: DEFAULT_COPIES,
    };
    return { ...doc, cleanKey, totalCopies: total, availableCopies: available };
  });

  return { ...olData, docs, authorSortScope };
}

export const BookService = { getAvailabilityForWorks, searchBooks };