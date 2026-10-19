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

export function CategoryFilterBar({ selectedSubject, onSelectCategory }: CategoryFilterBarProps) {
  return (
    <div className="w-full mt-6 overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 justify-start md:justify-center min-w-max px-2">
        <span className="text-xs font-mono uppercase tracking-wider text-muted flex items-center gap-1 mr-1">
          <Filter size={13} />
          <span>Subjects:</span>
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all border ${
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
