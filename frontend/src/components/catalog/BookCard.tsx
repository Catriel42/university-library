import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import type { WorkDTO } from '@university-library/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CopyPips } from '@/components/CopyPips';

interface BookCardProps {
  book: WorkDTO;
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/book/${encodeURIComponent(book.id)}`);
  };

  return (
    <Card
      onClick={handleNavigate}
      className="bg-surface border-border overflow-hidden rounded-2xl hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(45,212,168,0.1)] hover:border-accent/30 transition-all duration-300 h-full flex flex-col cursor-pointer"
    >
      <div className="w-full aspect-2/3 relative bg-surface-2 border-b border-border overflow-hidden shrink-0">
        {book.coverId ? (
          <img
            src={`https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-border flex items-center justify-center p-6 text-center">
            <span className="font-serif text-muted/60 text-lg line-clamp-4 leading-snug">
              {book.title}
            </span>
          </div>
        )}

        {book.availableCopies === 0 && (
          <div className="absolute top-2 right-2 bg-surface-2/90 backdrop-blur border border-border px-2 py-1 rounded-md">
            <span className="text-[10px] uppercase tracking-wider font-mono text-warn">Waitlist</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif text-text text-base leading-tight line-clamp-2 mb-1 group-hover:text-accent transition-colors">
          {book.title}
        </h3>
        <p className="text-sm font-sans text-muted line-clamp-1 mb-2">
          {book.firstAuthor || 'Unknown Author'}
        </p>

        {book.firstPublishYear && (
          <div className="flex items-center gap-1 text-[11px] text-muted font-mono mb-3">
            <Calendar size={12} className="opacity-70" />
            <span>{book.firstPublishYear}</span>
          </div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <CopyPips total={book.totalCopies} available={book.availableCopies} />

          {book.availableCopies > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-accent hover:bg-accent/10 px-2 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
            >
              Borrow
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted hover:bg-surface-2 px-2 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
            >
              Place hold
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
