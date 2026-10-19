import { Check } from 'lucide-react';

export const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'title', label: 'Title (A-Z)' },
  { id: 'author', label: 'Author (A-Z)' },
];

interface CatalogToolbarProps {
  queryParam: string;
  subjectParam: string;
  numFound: number;
  displayedCount: number;
  hideUnavailable: boolean;
  authorSortScope?: 'exact' | 'page';
  sortParam: string;
  onToggleHideUnavailable: () => void;
  onSortChange: (newSort: string) => void;
}

export function CatalogToolbar({
  queryParam,
  subjectParam,
  numFound,
  displayedCount,
  hideUnavailable,
  authorSortScope,
  sortParam,
  onToggleHideUnavailable,
  onSortChange,
}: CatalogToolbarProps) {
  const resultTitle = queryParam
    ? `Results for "${queryParam}"`
    : subjectParam
    ? `Subject: ${subjectParam}`
    : 'Catalog';

  const countDisplay = hideUnavailable
    ? `${displayedCount} available on page`
    : `${numFound.toLocaleString()} found`;

  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center justify-between border-b border-border pb-4">
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-serif text-text">{resultTitle}</h2>
          <span className="text-mono text-sm text-muted">{countDisplay}</span>
        </div>
        {authorSortScope === 'page' && sortParam === 'author' && (
          <p className="text-xs text-warn font-sans mt-1">
            * Matches exceed 100 items; results are alphabetically sorted within this page.
          </p>
        )}
        {authorSortScope === 'exact' && sortParam === 'author' && (
          <p className="text-xs text-accent font-sans mt-1">
            * Exact alphabetical sort by author across all matches.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onToggleHideUnavailable}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-sans transition-colors ${
            hideUnavailable
              ? 'bg-accent/10 border-accent/40 text-accent font-medium'
              : 'bg-surface border-border text-muted hover:text-text'
          }`}
        >
          <span
            className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
              hideUnavailable ? 'bg-accent border-accent text-bg' : 'border-border'
            }`}
          >
            {hideUnavailable && <Check size={10} strokeWidth={3} />}
          </span>
          <span>Hide unavailable</span>
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="catalog-sort" className="text-xs font-mono text-muted uppercase">
            Sort:
          </label>
          <select
            id="catalog-sort"
            value={sortParam}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-accent font-sans"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
