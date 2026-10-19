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
    <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 pb-12 sm:flex-row">
      <span className="text-muted font-mono text-xs">
        Page {currentPage} of {totalPages.toLocaleString()} (
        {totalFound.toLocaleString()} total items)
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="border-border hover:border-accent text-text h-9 px-3 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          <span className="ml-1 hidden sm:inline">Previous</span>
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
                className={`h-9 w-9 rounded-lg font-mono text-xs transition-colors ${
                  currentPage === pageNum
                    ? 'bg-accent text-bg font-bold shadow-sm'
                    : 'bg-surface border-border text-muted hover:text-text hover:border-border/80 border'
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
          className="border-border hover:border-accent text-text h-9 px-3 disabled:opacity-40"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
