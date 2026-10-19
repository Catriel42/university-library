import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import type { WorkDTO } from '@university-library/shared';
import { BookCoverImage } from '@/components/ui/BookCoverImage';
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
      className="bg-surface border-border hover:border-accent/30 flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(45,212,168,0.1)]"
    >
      <div className="border-border relative aspect-2/3 w-full shrink-0 overflow-hidden border-b">
        <BookCoverImage
          coverId={book.coverId}
          title={book.title}
          size="full"
          imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {book.availableCopies === 0 && (
          <div className="bg-surface-2/90 border-border absolute top-2 right-2 rounded-md border px-2 py-1 backdrop-blur">
            <span className="text-warn font-mono text-[10px] tracking-wider uppercase">
              Waitlist
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-text group-hover:text-accent mb-1 line-clamp-2 font-serif text-base leading-tight transition-colors">
          {book.title}
        </h3>
        <p className="text-muted mb-2 line-clamp-1 font-sans text-sm">
          {book.firstAuthor || 'Unknown Author'}
        </p>

        {book.firstPublishYear && (
          <div className="text-muted mb-3 flex items-center gap-1 font-mono text-[11px]">
            <Calendar size={12} className="opacity-70" />
            <span>{book.firstPublishYear}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <CopyPips total={book.totalCopies} available={book.availableCopies} />

          {book.availableCopies > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-accent hover:bg-accent/10 ml-auto h-7 px-2 text-xs"
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
              className="text-muted hover:bg-surface-2 ml-auto h-7 px-2 text-xs"
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
