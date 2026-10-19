import { Filter } from 'lucide-react';

export const CATEGORIES = [
  { id: '', label: 'All Subjects' },
  { id: 'fiction', label: 'Fiction' },
  { id: 'history', label: 'History' },
  { id: 'science', label: 'Science' },
  { id: 'biography', label: 'Biography' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'art', label: 'Art' },
  { id: 'computers', label: 'Computer Science' },
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'psychology', label: 'Psychology' },
  { id: 'economics', label: 'Economics' },
];

interface CategoryFilterBarProps {
  selectedSubject: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryFilterBar({
  selectedSubject,
  onSelectCategory,
}: CategoryFilterBarProps) {
  return (
    <div className="mt-6 w-full scrollbar-none overflow-x-auto pb-2">
      <div className="flex min-w-max items-center justify-start gap-2 px-2 md:justify-center">
        <span className="text-muted mr-1 flex items-center gap-1 font-mono text-xs tracking-wider uppercase">
          <Filter size={13} />
          <span>Subjects:</span>
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`rounded-full border px-3 py-1.5 font-sans text-xs whitespace-nowrap transition-all ${
              selectedSubject === cat.id
                ? 'bg-accent/15 border-accent text-accent font-medium shadow-sm'
                : 'bg-surface-2/60 border-border text-muted hover:text-text hover:border-border/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
