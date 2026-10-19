import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SEARCH_FIELDS = [
  { id: 'q', label: 'All' },
  { id: 'title', label: 'Title' },
  { id: 'author', label: 'Author' },
];

interface CatalogSearchFormProps {
  inputQuery: string;
  fieldParam: string;
  onQueryChange: (query: string) => void;
  onFieldChange: (field: string) => void;
  onClearQuery: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CatalogSearchForm({
  inputQuery,
  fieldParam,
  onQueryChange,
  onFieldChange,
  onClearQuery,
  onSubmit,
}: CatalogSearchFormProps) {
  const currentPlaceholder =
    fieldParam === 'title'
      ? 'Search by book title...'
      : fieldParam === 'author'
        ? 'Search by author name...'
        : 'Search by title, author, or keyword...';

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <div className="bg-surface-2 border-border flex shrink-0 self-center rounded-xl border p-1 sm:w-auto">
          {SEARCH_FIELDS.map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => onFieldChange(field.id)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors ${
                fieldParam === field.id
                  ? 'bg-surface text-accent font-semibold shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              {field.label}
            </button>
          ))}
        </div>

        <div className="group relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <Search
              className="text-muted group-focus-within:text-accent transition-colors"
              size={18}
            />
          </div>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={currentPlaceholder}
            className="bg-surface border-border text-text placeholder:text-muted focus:border-accent/50 focus:ring-accent/50 w-full rounded-xl border py-3.5 pr-20 pl-11 text-base shadow-sm transition-all focus:ring-1 focus:outline-none"
          />
          {inputQuery && (
            <button
              type="button"
              onClick={onClearQuery}
              aria-label="Clear search input"
              className="text-muted hover:text-text absolute inset-y-0 right-12 flex items-center pr-2 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="bg-accent text-bg hover:bg-accent/80 absolute inset-y-1.5 right-1.5 rounded-lg px-4 transition-colors"
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
