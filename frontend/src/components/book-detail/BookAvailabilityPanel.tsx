import { CopyPips } from '@/components/CopyPips';
import { Clock, Users, BookOpen } from 'lucide-react';

interface BookAvailabilityPanelProps {
  totalCopies: number;
  availableCopies: number;
  queueLength: number;
  earliestReturnDate?: string | null;
}

export function BookAvailabilityPanel({
  totalCopies,
  availableCopies,
  queueLength,
  earliestReturnDate,
}: BookAvailabilityPanelProps) {
  const isAvailable = availableCopies > 0;

  const formattedReturnDate = earliestReturnDate
    ? new Date(earliestReturnDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="bg-surface border-border flex flex-col gap-4 rounded-2xl border p-5">
      <div className="flex items-center justify-between">
        <span className="text-muted font-mono text-xs tracking-wider uppercase">
          Availability Status
        </span>
        <span
          className={`rounded-md px-2.5 py-1 font-mono text-xs font-semibold uppercase ${
            isAvailable
              ? 'bg-accent/15 text-accent border-accent/30 border'
              : 'bg-warn/15 text-warn border-warn/30 border'
          }`}
        >
          {isAvailable ? 'In Stock' : 'Checked Out'}
        </span>
      </div>

      <div className="border-border/60 flex items-center justify-between border-y py-2">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-muted" />
          <span className="text-text font-sans text-sm">Library Copies:</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted font-mono text-xs">
            {availableCopies} of {totalCopies} available
          </span>
          <CopyPips total={totalCopies} available={availableCopies} />
        </div>
      </div>

      {queueLength > 0 && (
        <div className="text-muted flex items-center gap-2 font-sans text-xs">
          <Users size={14} className="text-accent" />
          <span>
            {queueLength} reader{queueLength > 1 ? 's' : ''} currently in
            waitlist queue
          </span>
        </div>
      )}

      {!isAvailable && formattedReturnDate && (
        <div className="text-warn bg-warn/5 border-warn/20 flex items-center gap-2 rounded-lg border p-2.5 font-sans text-xs">
          <Clock size={14} className="shrink-0" />
          <span>Expected earliest return: {formattedReturnDate}</span>
        </div>
      )}
    </div>
  );
}
