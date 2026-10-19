import { BookmarkX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function ReservationEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="border-border bg-surface flex w-full flex-col items-center rounded-2xl border border-dashed py-16 text-center">
      <BookmarkX size={48} className="text-muted mb-4 opacity-50" />
      <h3 className="text-text mb-2 font-serif text-xl">
        No active reservations
      </h3>
      <p className="text-muted mb-6 max-w-sm font-sans text-xs sm:text-sm">
        When copies of a book you want are unavailable, you can join the queue
        and we will hold it for you when it is returned.
      </p>
      <Button
        onClick={() => navigate('/')}
        className="bg-accent text-bg hover:bg-accent/90"
      >
        Browse Catalog
      </Button>
    </div>
  );
}
