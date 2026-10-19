import { BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ReadingEmptyStateProps {
  status: 'READING' | 'COMPLETED';
}

export function ReadingEmptyState({ status }: ReadingEmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="border-border bg-surface flex w-full flex-col items-center rounded-2xl border border-dashed py-16 text-center">
      <BookMarked size={48} className="text-muted mb-4 opacity-50" />
      <h3 className="text-text mb-2 font-serif text-xl">
        {status === 'READING'
          ? 'No books in your Reading list'
          : 'No completed books yet'}
      </h3>
      <p className="text-muted mb-6 max-w-sm font-sans text-xs sm:text-sm">
        {status === 'READING'
          ? 'Browse the catalog and mark books you are reading to track your academic progress.'
          : 'Finish books from your reading list to build your completed reading history.'}
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
