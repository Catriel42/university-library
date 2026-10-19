import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReadingStatus,
  type ReadingStatusDTO,
} from '@university-library/shared';
import { Card } from '@/components/ui/card';
import { BookCoverImage } from '@/components/ui/BookCoverImage';
import { formatDate } from '@/lib/utils';
import { BookOpen, CheckCircle2, X, Loader2 } from 'lucide-react';

interface ReadingBookCardProps {
  book: ReadingStatusDTO;
  onStatusChange: (workKey: string, status: ReadingStatus) => Promise<unknown>;
  onClear: (workKey: string) => Promise<unknown>;
}

export function ReadingBookCard({
  book,
  onStatusChange,
  onClear,
}: ReadingBookCardProps) {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const nextStatus =
        book.status === ReadingStatus.READING
          ? ReadingStatus.COMPLETED
          : ReadingStatus.READING;
      await onStatusChange(book.workId, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearClick = async () => {
    setIsUpdating(true);
    try {
      await onClear(book.workId);
    } finally {
      setIsUpdating(false);
    }
  };

  const isReading = book.status === ReadingStatus.READING;
  const formattedDate = formatDate(book.updatedAt, 'short');

  return (
    <Card className="bg-surface border-border hover:border-border/80 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          onClick={() => navigate(`/book/${encodeURIComponent(book.workId)}`)}
          className="cursor-pointer transition-opacity hover:opacity-90"
        >
          <BookCoverImage coverId={book.coverId} title={book.title} size="md" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3
            onClick={() => navigate(`/book/${encodeURIComponent(book.workId)}`)}
            className="text-text hover:text-accent line-clamp-1 cursor-pointer font-serif text-base leading-snug transition-colors sm:text-lg"
          >
            {book.title}
          </h3>
          <p className="text-muted line-clamp-1 font-sans text-xs sm:text-sm">
            {book.firstAuthor || 'Unknown Author'}
          </p>

          <div className="text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
            <span>Updated {formattedDate}</span>
          </div>

          <div className="mt-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium ${
                isReading
                  ? 'bg-accent/15 border-accent/40 text-accent'
                  : 'border-border bg-surface-2 text-muted'
              }`}
            >
              {isReading ? <BookOpen size={13} /> : <CheckCircle2 size={13} />}
              <span>{isReading ? 'Reading' : 'Completed'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="border-border/60 flex w-full shrink-0 flex-wrap items-center justify-between gap-2 border-t pt-3 sm:w-auto sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isUpdating}
          className="border-border hover:border-accent hover:text-accent flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 font-sans text-xs font-medium transition-all sm:w-36 sm:flex-none"
        >
          {isUpdating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : isReading ? (
            <>
              <CheckCircle2 size={13} />
              <span>Mark Completed</span>
            </>
          ) : (
            <>
              <BookOpen size={13} />
              <span>Mark Reading</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleClearClick}
          disabled={isUpdating}
          className="border-border hover:border-danger hover:text-danger flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 font-sans text-xs font-medium transition-all sm:w-36 sm:flex-none"
        >
          <X size={13} />
          <span>Remove</span>
        </button>
      </div>
    </Card>
  );
}
