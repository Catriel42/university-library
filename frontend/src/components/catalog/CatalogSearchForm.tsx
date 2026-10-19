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
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex bg-surface-2 p-1 rounded-xl border border-border sm:w-auto shrink-0 self-center">
          {SEARCH_FIELDS.map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => onFieldChange(field.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                fieldParam === field.id
                  ? 'bg-surface text-accent font-semibold shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              {field.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-muted group-focus-within:text-accent transition-colors" size={18} />
          </div>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={currentPlaceholder}
            className="w-full bg-surface border border-border rounded-xl py-3.5 pl-11 pr-20 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base shadow-sm"
          />
          {inputQuery && (
            <button
              type="button"
              onClick={onClearQuery}
              aria-label="Clear search input"
              className="absolute inset-y-0 right-12 flex items-center pr-2 text-muted hover:text-text transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="absolute inset-y-1.5 right-1.5 rounded-lg px-4 bg-accent text-bg hover:bg-accent/80 transition-colors"
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
