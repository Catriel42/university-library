import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoanDTO } from '@university-library/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookCoverImage } from '@/components/ui/BookCoverImage';
import { formatDate } from '@/lib/utils';
import { LoanOverdueBadge } from './LoanOverdueBadge';
import { RotateCcw, Loader2, Calendar } from 'lucide-react';

interface LoanCardProps {
  loan: LoanDTO;
  onReturn: (loanId: string) => Promise<void>;
}

export function LoanCard({ loan, onReturn }: LoanCardProps) {
  const navigate = useNavigate();
  const [isReturning, setIsReturning] = useState(false);

  const handleReturnClick = async () => {
    setIsReturning(true);
    try {
      await onReturn(loan.id);
    } finally {
      setIsReturning(false);
    }
  };

  const formattedBorrowDate = formatDate(loan.borrowedAt, 'short');
  const formattedDueDate = formatDate(loan.dueDate, 'long');

  return (
    <Card className="bg-surface border-border hover:border-border/80 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          onClick={() => navigate(`/book/${encodeURIComponent(loan.workId)}`)}
          className="cursor-pointer transition-opacity hover:opacity-90"
        >
          <BookCoverImage coverId={loan.coverId} title={loan.title} size="md" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3
            onClick={() => navigate(`/book/${encodeURIComponent(loan.workId)}`)}
            className="text-text hover:text-accent line-clamp-1 cursor-pointer font-serif text-base leading-snug transition-colors sm:text-lg"
          >
            {loan.title}
          </h3>
          <p className="text-muted line-clamp-1 font-sans text-xs sm:text-sm">
            {loan.firstAuthor || 'Unknown Author'}
          </p>

          <div className="text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="opacity-70" />
              <span>Borrowed {formattedBorrowDate}</span>
            </span>
            <span>Due {formattedDueDate}</span>
          </div>

          <div className="mt-2.5">
            <LoanOverdueBadge
              daysRemaining={loan.daysRemaining}
              daysOverdue={loan.daysOverdue}
            />
          </div>
        </div>
      </div>

      <div className="border-border/60 flex w-full shrink-0 items-center justify-between gap-3 border-t pt-3 sm:w-auto sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <Button
          onClick={handleReturnClick}
          disabled={isReturning}
          size="sm"
          variant="outline"
          className="border-border hover:border-accent hover:text-accent flex h-10 w-full items-center gap-2 rounded-xl px-4 font-sans text-xs font-medium transition-all sm:w-auto"
        >
          {isReturning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Returning...</span>
            </>
          ) : (
            <>
              <RotateCcw size={14} />
              <span>Return Book</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
