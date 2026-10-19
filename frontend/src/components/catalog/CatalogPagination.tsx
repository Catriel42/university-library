import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  totalFound: number;
  onPageChange: (newPage: number) => void;
}

export function CatalogPagination({
  currentPage,
  totalPages,
  totalFound,
  onPageChange,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 pb-12">
      <span className="text-xs font-mono text-muted">
        Page {currentPage} of {totalPages.toLocaleString()} ({totalFound.toLocaleString()} total items)
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 px-3 border-border hover:border-accent text-text disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 rounded-lg text-xs font-mono transition-colors ${
                  currentPage === pageNum
                    ? 'bg-accent text-bg font-bold shadow-sm'
                    : 'bg-surface border border-border text-muted hover:text-text hover:border-border/80'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 px-3 border-border hover:border-accent text-text disabled:opacity-40"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
