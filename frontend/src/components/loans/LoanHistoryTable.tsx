import { useNavigate } from 'react-router-dom';
import type { LoanDTO } from '@university-library/shared';
import { BookCoverImage } from '@/components/ui/BookCoverImage';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, History } from 'lucide-react';

interface LoanHistoryTableProps {
  loans: LoanDTO[];
}

export function LoanHistoryTable({ loans }: LoanHistoryTableProps) {
  const navigate = useNavigate();

  if (loans.length === 0) {
    return (
      <div className="bg-surface border-border flex flex-col items-center rounded-2xl border border-dashed py-16 text-center">
        <History size={36} className="text-muted mb-3 opacity-60" />
        <h3 className="text-text mb-1 font-serif text-base">
          No loan history yet
        </h3>
        <p className="text-muted max-w-sm font-sans text-xs">
          Books you borrow and return in the future will be recorded here in
          your permanent reading log.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {loans.map((loan) => {
        const formattedReturnDate = loan.returnedAt
          ? formatDate(loan.returnedAt, 'long')
          : 'Returned';

        return (
          <div
            key={loan.id}
            onClick={() => navigate(`/book/${encodeURIComponent(loan.workId)}`)}
            className="bg-surface border-border hover:border-accent/30 flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
              <BookCoverImage
                coverId={loan.coverId}
                title={loan.title}
                size="sm"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-text hover:text-accent line-clamp-1 font-serif text-sm transition-colors">
                  {loan.title}
                </span>
                <span className="text-muted line-clamp-1 font-sans text-xs">
                  {loan.firstAuthor || 'Unknown Author'}
                </span>
              </div>
            </div>

            <div className="text-muted flex shrink-0 items-center gap-2 pl-12 font-mono text-xs sm:pl-0">
              <CheckCircle2 size={15} className="text-accent" />
              <span>Returned {formattedReturnDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
