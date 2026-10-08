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
async function searchBooks(query: Record<string, string>): Promise<BookSearchResult> {
  const olData = await OpenLibraryService.searchBooks(query);
  const availability = await getAvailabilityForWorks(olData.docs.map((doc) => toCleanKey(doc.key)));

  const docs: EnrichedDoc[] = olData.docs.map((doc) => {
    const cleanKey = toCleanKey(doc.key);
    const { total, available } = availability[cleanKey] ?? {
      total: DEFAULT_COPIES,
      available: DEFAULT_COPIES,
    };
    return { ...doc, cleanKey, totalCopies: total, availableCopies: available };
  });

  return { ...olData, docs };
}

export const BookService = { getAvailabilityForWorks, searchBooks };