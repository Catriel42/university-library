import { useState, useRef, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookX, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import type { WorkDTO, SearchResponseDTO } from '@university-library/shared';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookCard } from '@/components/catalog/BookCard';
import { CategoryFilterBar } from '@/components/catalog/CategoryFilterBar';
import { CatalogSearchForm } from '@/components/catalog/CatalogSearchForm';
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar';
import { CatalogPagination } from '@/components/catalog/CatalogPagination';

const PAGE_SIZE = 12;

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const queryParam = searchParams.get('q') || '';
  const fieldParam = searchParams.get('field') || 'q';
  const subjectParam = searchParams.get('subject') || '';
  const sortParam = searchParams.get('sort') || 'relevance';
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const hideUnavailableParam = searchParams.get('hideUnavailable') === 'true';

  const [prevQueryParam, setPrevQueryParam] = useState(queryParam);
  const [inputQuery, setInputQuery] = useState(queryParam);

  if (prevQueryParam !== queryParam) {
    setPrevQueryParam(queryParam);
    setInputQuery(queryParam);
  }

  const [results, setResults] = useState<WorkDTO[]>([]);
  const [numFound, setNumFound] = useState(0);
  const [authorSortScope, setAuthorSortScope] = useState<'exact' | 'page' | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const hasSearched = Boolean(queryParam.trim() || subjectParam);
  const resultsRef = useRef<HTMLDivElement>(null);
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
        setSearchError('Unable to load catalog results from Open Library. Please check your connection and retry.');
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
  }, [queryParam, fieldParam, subjectParam, sortParam, pageParam, retryTrigger]);

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

  const handleExplicitSubmit = (e: React.FormEvent) => {
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
      if (!hideUnavailableParam) {
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

  const totalPages = Math.max(1, Math.ceil(numFound / PAGE_SIZE));
  const displayedResults = hideUnavailableParam
    ? results.filter((book) => book.availableCopies > 0)
    : results;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="max-w-3xl mx-auto w-full text-center mb-8 mt-2">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight text-text">
          Search the catalog
        </h1>
        <p className="text-muted text-base md:text-lg font-sans mb-8">
          Browse university collections, check copy availability in real-time, and borrow books instantly.
        </p>

        <CatalogSearchForm
          inputQuery={inputQuery}
          fieldParam={fieldParam}
          onQueryChange={updateSearchQuery}
          onFieldChange={handleFieldChange}
          onClearQuery={handleClearQuery}
          onSubmit={handleExplicitSubmit}
        />

        <CategoryFilterBar
          selectedSubject={subjectParam}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      <div ref={resultsRef} className="w-full">
        {hasSearched && (
          <CatalogToolbar
            queryParam={queryParam}
            subjectParam={subjectParam}
            numFound={numFound}
            displayedCount={displayedResults.length}
            hideUnavailable={hideUnavailableParam}
            authorSortScope={authorSortScope}
            sortParam={sortParam}
            onToggleHideUnavailable={handleToggleHideUnavailable}
            onSortChange={handleSortChange}
          />
        )}

        <AnimatePresence mode="wait">
          {searchError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center py-16 px-4 text-center border border-danger/30 rounded-2xl bg-danger/5"
            >
              <AlertCircle className="text-danger mb-3" size={40} />
              <h3 className="text-xl font-serif text-text mb-2">Search Error</h3>
              <p className="text-muted max-w-md text-sm mb-6">{searchError}</p>
              <Button
                variant="outline"
                onClick={() => setRetryTrigger((prev) => prev + 1)}
                className="flex items-center gap-2 border-border hover:border-accent text-text"
              >
                <RefreshCw size={14} />
                <span>Retry Search</span>
              </Button>
            </motion.div>
          ) : isSearching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="w-full aspect-2/3 rounded-xl bg-surface" />
                  <Skeleton className="h-5 w-3/4 bg-surface" />
                  <Skeleton className="h-4 w-1/2 bg-surface" />
                  <Skeleton className="h-3 w-1/4 bg-surface mt-2" />
                </div>
              ))}
            </motion.div>
          ) : !isSearching && hasSearched && displayedResults.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center py-24 text-center border border-dashed border-border rounded-2xl bg-surface"
            >
              <BookX className="text-muted mb-4 opacity-50" size={48} />
              <h3 className="text-xl font-serif text-text mb-2">No matching items found</h3>
              <p className="text-muted max-w-md text-sm">
                We couldn't find any books matching your query and filters. Try adjusting your search term, clearing category filters, or showing unavailable copies.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full"
            >
              {displayedResults.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, ease: 'easeOut', duration: 0.25 }}
                  className="group h-full"
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {hasSearched && (
          <CatalogPagination
            currentPage={pageParam}
            totalPages={totalPages}
            totalFound={numFound}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
