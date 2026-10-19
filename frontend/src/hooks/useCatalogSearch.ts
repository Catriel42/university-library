import {
  useState,
  useRef,
  useEffect,
  useTransition,
  type FormEvent,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import type { WorkDTO, SearchResponseDTO } from '@university-library/shared';
import { apiClient } from '@/lib/api';

const PAGE_SIZE = 12;

export interface UseCatalogSearchReturn {
  inputQuery: string;
  results: WorkDTO[];
  numFound: number;
  isSearching: boolean;
  searchError: string | null;
  authorSortScope?: 'exact' | 'page';
  displayedResults: WorkDTO[];
  totalPages: number;
  hasSearched: boolean;
  queryParam: string;
  fieldParam: string;
  subjectParam: string;
  sortParam: string;
  pageParam: number;
  hideUnavailable: boolean;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  updateSearchQuery: (query: string) => void;
  handleSubmit: (e: FormEvent) => void;
  handleClearQuery: () => void;
  handleFieldChange: (field: string) => void;
  handleCategorySelect: (id: string) => void;
  handleSortChange: (sort: string) => void;
  handleToggleHideUnavailable: () => void;
  handlePageChange: (page: number) => void;
  retry: () => void;
}

export function useCatalogSearch(): UseCatalogSearchReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const queryParam = searchParams.get('q') || '';
  const fieldParam = searchParams.get('field') || 'q';
  const subjectParam = searchParams.get('subject') || '';
  const sortParam = searchParams.get('sort') || 'relevance';
  const pageParam = Math.max(
    1,
    parseInt(searchParams.get('page') || '1', 10) || 1
  );
  const hideUnavailable = searchParams.get('hideUnavailable') === 'true';

  const [prevQueryParam, setPrevQueryParam] = useState(queryParam);
  const [inputQuery, setInputQuery] = useState(queryParam);

  if (prevQueryParam !== queryParam) {
    setPrevQueryParam(queryParam);
    setInputQuery(queryParam);
  }

  const [results, setResults] = useState<WorkDTO[]>([]);
  const [numFound, setNumFound] = useState(0);
  const [authorSortScope, setAuthorSortScope] = useState<
    'exact' | 'page' | undefined
  >(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const hasSearched = Boolean(queryParam.trim() || subjectParam);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!queryParam.trim() && !subjectParam) {
      return;
    }

    const controller = new AbortController();

    const requestParams: Record<string, string | number> = {
      limit: PAGE_SIZE,
      page: pageParam,
    };

    if (queryParam.trim()) {
      if (fieldParam === 'title') {
        requestParams.title = queryParam.trim();
      } else if (fieldParam === 'author') {
        requestParams.author = queryParam.trim();
      } else {
        requestParams.q = queryParam.trim();
      }
    }

    if (subjectParam) {
      requestParams.subject = subjectParam;
    }

    if (sortParam && sortParam !== 'relevance') {
      requestParams.sort = sortParam;
    }

    const fetchBooks = async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await apiClient.get<SearchResponseDTO>('/books', {
          params: requestParams,
          signal: controller.signal,
        });

        setResults(response.data.docs);
        setNumFound(response.data.numFound);
        setAuthorSortScope(response.data.authorSortScope);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setSearchError(
          'Unable to load catalog results from Open Library. Please check your connection and retry.'
        );
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    fetchBooks();

    return () => {
      controller.abort();
    };
  }, [
    queryParam,
    fieldParam,
    subjectParam,
    sortParam,
    pageParam,
    retryTrigger,
  ]);

  const updateSearchQuery = (newQuery: string) => {
    setInputQuery(newQuery);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      startTransition(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = newQuery.trim();
          if (trimmed) {
            next.set('q', trimmed);
          } else {
            next.delete('q');
          }
          next.set('page', '1');
          return next;
        });
      });
    }, 450);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const trimmed = inputQuery.trim();
      if (trimmed) {
        next.set('q', trimmed);
      } else {
        next.delete('q');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleClearQuery = () => {
    setInputQuery('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      next.set('page', '1');
      return next;
    });
  };

  const handleFieldChange = (newField: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newField === 'q') {
        next.delete('field');
      } else {
        next.set('field', newField);
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (categoryId) {
        next.set('subject', categoryId);
      } else {
        next.delete('subject');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleSortChange = (newSort: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newSort === 'relevance') {
        next.delete('sort');
      } else {
        next.set('sort', newSort);
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleToggleHideUnavailable = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!hideUnavailable) {
        next.set('hideUnavailable', 'true');
      } else {
        next.delete('hideUnavailable');
      }
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const retry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  const totalPages = Math.max(1, Math.ceil(numFound / PAGE_SIZE));
  const displayedResults = hideUnavailable
    ? results.filter((book) => book.availableCopies > 0)
    : results;

  return {
    inputQuery,
    results,
    numFound,
    isSearching,
    searchError,
    authorSortScope,
    displayedResults,
    totalPages,
    hasSearched,
    queryParam,
    fieldParam,
    subjectParam,
    sortParam,
    pageParam,
    hideUnavailable,
    resultsRef,
    updateSearchQuery,
    handleSubmit,
    handleClearQuery,
    handleFieldChange,
    handleCategorySelect,
    handleSortChange,
    handleToggleHideUnavailable,
    handlePageChange,
    retry,
  };
}
