import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReservationDTO } from '@university-library/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookCoverImage } from '@/components/ui/BookCoverImage';
import { formatDate } from '@/lib/utils';
import { Clock, CheckCircle2, X, Loader2, ArrowRight } from 'lucide-react';

interface ReservationCardProps {
  reservation: ReservationDTO;
  onCancel: (id: string) => Promise<void>;
}

export function ReservationCard({
  reservation,
  onCancel,
}: ReservationCardProps) {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelClick = async () => {
    setIsCancelling(true);
    try {
      await onCancel(reservation.id);
    } finally {
      setIsCancelling(false);
    }
  };

  const isHold = reservation.status === 'HOLD';
  const formattedDate = formatDate(reservation.createdAt, 'short');

  return (
    <Card className="bg-surface border-border hover:border-border/80 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          onClick={() =>
            navigate(`/book/${encodeURIComponent(reservation.workId)}`)
          }
          className="cursor-pointer transition-opacity hover:opacity-90"
        >
          <BookCoverImage
            coverId={reservation.coverId}
            title={reservation.title}
            size="md"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3
            onClick={() =>
              navigate(`/book/${encodeURIComponent(reservation.workId)}`)
            }
            className="text-text hover:text-accent line-clamp-1 cursor-pointer font-serif text-base leading-snug transition-colors sm:text-lg"
          >
            {reservation.title}
          </h3>
          <p className="text-muted line-clamp-1 font-sans text-xs sm:text-sm">
            {reservation.firstAuthor || 'Unknown Author'}
          </p>

          <div className="text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
            <span>Reserved {formattedDate}</span>
          </div>

          <div className="mt-2.5">
            {isHold ? (
              <span className="bg-accent/15 border-accent/40 text-accent inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium">
                <CheckCircle2 size={13} />
                <span>
                  Ready for pickup •{' '}
                  {reservation.hoursRemaining !== undefined
                    ? `${reservation.hoursRemaining}h remaining`
                    : '48h window'}
                </span>
              </span>
            ) : (
              <span className="bg-surface-2 border-border text-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs">
                <Clock size={13} />
                <span>Position #{reservation.queuePosition ?? 1} in queue</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-border/60 flex w-full shrink-0 flex-wrap items-center justify-between gap-2 border-t pt-3 sm:w-auto sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        {isHold && (
          <Button
            onClick={() =>
              navigate(`/book/${encodeURIComponent(reservation.workId)}`)
            }
            size="sm"
            className="bg-accent text-bg hover:bg-accent/90 flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 font-sans text-xs font-medium transition-all sm:w-36 sm:flex-none"
          >
            <span>Borrow Now</span>
            <ArrowRight size={13} />
          </Button>
        )}

        <Button
          onClick={handleCancelClick}
          disabled={isCancelling}
          size="sm"
          variant="outline"
          className="border-border hover:border-danger hover:text-danger flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 font-sans text-xs font-medium transition-all sm:w-36 sm:flex-none"
        >
          {isCancelling ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Cancelling...</span>
            </>
          ) : (
            <>
              <X size={13} />
              <span>Cancel</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
