import { LRUCache } from 'lru-cache';
import { z } from 'zod';

const BASE_URL = 'https://openlibrary.org';
const CONTACT_EMAIL = process.env.OPENLIBRARY_CONTACT_EMAIL ?? 'contact@example.com';
const USER_AGENT = `BookLoanApp (${CONTACT_EMAIL})`;
const REQUEST_TIMEOUT_MS = 8_000;

const SEARCH_CACHE_MAX = 500;
const SEARCH_CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const DETAILS_CACHE_MAX = 1000;
const DETAILS_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const ALLOWED_SEARCH_PARAMS = ['author', 'lang', 'limit', 'page', 'q', 'sort', 'subject', 'title'];
const WORK_KEY_REGEX = /^OL\d+W$/;

export class OpenLibraryError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'OpenLibraryError';
  }
}

const searchDocSchema = z.object({
  key: z.string(),
  title: z.string(),
  author_name: z.array(z.string()).optional(),
  first_publish_year: z.number().optional(),
  cover_i: z.number().optional(),
  edition_count: z.number().optional(),
});

const searchResponseSchema = z.object({
  numFound: z.number(),
  start: z.number(),
  docs: z.array(searchDocSchema),
});

const workSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.union([z.string(), z.object({ value: z.string() })]).optional(),
  covers: z.array(z.number()).optional(),
  subjects: z.array(z.string()).optional(),
});

export type OpenLibrarySearchResponse = z.infer<typeof searchResponseSchema>;
export type OpenLibraryWork = z.infer<typeof workSchema>;

async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new OpenLibraryError(`Open Library responded with ${response.status}`, response.status);
    }

    const data = schema.parse(await response.json());
    return data;
  } catch (error: any) {
    if (error instanceof OpenLibraryError) throw error;
    if (error.name === 'TimeoutError') {
      throw new OpenLibraryError('Open Library request timed out', 504);
    }
    if (error instanceof z.ZodError) {
      throw new OpenLibraryError('Invalid response format from Open Library', 502);
    }
    throw new OpenLibraryError(error.message || 'Unknown Open Library error', 500);
  }
}

const searchCache = new LRUCache<string, OpenLibrarySearchResponse>({
  max: SEARCH_CACHE_MAX,
  ttl: SEARCH_CACHE_TTL_MS,
  fetchMethod: (url) => fetchJson(url, searchResponseSchema),
});

const detailsCache = new LRUCache<string, OpenLibraryWork>({
  max: DETAILS_CACHE_MAX,
  ttl: DETAILS_CACHE_TTL_MS,
  fetchMethod: (workKey) => fetchJson(`${BASE_URL}/works/${workKey}.json`, workSchema),
});

function buildSearchUrl(params: Record<string, string>): string {
  const searchParams = new URLSearchParams();

  for (const key of ALLOWED_SEARCH_PARAMS) {
    const raw = params[key]?.trim().replace(/\s+/g, ' ');
    if (!raw) continue;

    if (key === 'limit') {
      const limit = Math.min(Math.max(Number(raw) || DEFAULT_LIMIT, 1), MAX_LIMIT);
      searchParams.set(key, String(limit));
    } else {
      searchParams.set(key, raw);
    }
  }

  if (searchParams.size === 0) {
    throw new OpenLibraryError('At least one search parameter is required', 400);
  }

  return `${BASE_URL}/search.json?${searchParams.toString()}`;
}

async function searchBooks(params: Record<string, string>): Promise<OpenLibrarySearchResponse> {
  const result = await searchCache.fetch(buildSearchUrl(params));
  if (result === undefined) {
    throw new OpenLibraryError('Empty response from Open Library', 502);
  }
  return result;
}

async function getWorkDetails(workKey: string): Promise<OpenLibraryWork> {
  if (!WORK_KEY_REGEX.test(workKey)) {
    throw new OpenLibraryError(`Invalid work key: ${workKey}`, 400);
  }
  const result = await detailsCache.fetch(workKey);
  if (result === undefined) {
    throw new OpenLibraryError('Empty response from Open Library', 502);
  }
  return result;
}

export const OpenLibraryService = { searchBooks, getWorkDetails };