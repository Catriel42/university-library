import { AnimatePresence } from 'motion/react';
import { useCatalogSearch } from '@/hooks/useCatalogSearch';
import { CategoryFilterBar } from '@/components/catalog/CategoryFilterBar';
import { CatalogSearchForm } from '@/components/catalog/CatalogSearchForm';
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar';
import { CatalogPagination } from '@/components/catalog/CatalogPagination';
import { CatalogResultsGrid } from '@/components/catalog/CatalogResultsGrid';
import { CatalogEmptyState } from '@/components/catalog/CatalogEmptyState';
import { CatalogErrorState } from '@/components/catalog/CatalogErrorState';

export function CatalogPage() {
  const {
    inputQuery,
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
  } = useCatalogSearch();

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mx-auto mt-2 mb-8 w-full max-w-3xl text-center">
        <h1 className="text-text mb-4 font-serif text-4xl leading-tight md:text-5xl">
          Search the catalog
        </h1>
        <p className="text-muted mb-8 font-sans text-base md:text-lg">
          Browse university collections, check copy availability in real-time,
          and borrow books instantly.
        </p>

        <CatalogSearchForm
          inputQuery={inputQuery}
          fieldParam={fieldParam}
          onQueryChange={updateSearchQuery}
          onFieldChange={handleFieldChange}
          onClearQuery={handleClearQuery}
          onSubmit={handleSubmit}
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
            hideUnavailable={hideUnavailable}
            authorSortScope={authorSortScope}
            sortParam={sortParam}
            onToggleHideUnavailable={handleToggleHideUnavailable}
            onSortChange={handleSortChange}
          />
        )}

        <AnimatePresence mode="wait">
          {searchError ? (
            <CatalogErrorState error={searchError} onRetry={retry} />
          ) : !isSearching && hasSearched && displayedResults.length === 0 ? (
            <CatalogEmptyState />
          ) : (
            <CatalogResultsGrid
              books={displayedResults}
              isLoading={isSearching}
            />
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
