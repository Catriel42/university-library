import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useBookDetail } from '@/hooks/useBookDetail';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookHero } from '@/components/book-detail/BookHero';
import { BookMeta } from '@/components/book-detail/BookMeta';
import { BookAvailabilityPanel } from '@/components/book-detail/BookAvailabilityPanel';
import { BookActionCard } from '@/components/book-detail/BookActionCard';
import { BookDescription } from '@/components/book-detail/BookDescription';

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { book, isLoading, error, retry } = useBookDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted hover:text-text mb-8 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex justify-center md:col-span-1">
            <Skeleton className="bg-surface aspect-[2/3] w-full max-w-[280px] rounded-2xl" />
          </div>
          <div className="flex flex-col gap-4 md:col-span-2">
            <Skeleton className="bg-surface h-10 w-3/4" />
            <Skeleton className="bg-surface h-5 w-1/3" />
            <Skeleton className="bg-surface mt-4 h-28 w-full rounded-2xl" />
            <Skeleton className="bg-surface mt-2 h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center py-20 text-center">
        <AlertCircle size={48} className="text-danger mb-4 opacity-80" />
        <h2 className="text-text mb-2 font-serif text-2xl">Book Not Found</h2>
        <p className="text-muted mb-6 font-sans text-sm">
          {error ||
            'The requested work could not be retrieved from the library catalog.'}
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={retry}
            className="border-border text-text hover:border-accent flex items-center gap-2"
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-accent text-bg hover:bg-accent/90"
          >
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="mx-auto w-full max-w-4xl py-6 md:py-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="text-muted hover:text-text mb-8 flex items-center gap-2 px-0 hover:bg-transparent"
      >
        <ArrowLeft size={16} />
        <span className="font-sans text-sm">Back</span>
      </Button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
        <div className="flex flex-col items-center md:col-span-1">
          <BookHero
            coverId={book.coverId}
            title={book.title}
            isAvailable={isAvailable}
          />
        </div>

        <div className="flex flex-col gap-6 md:col-span-2">
          <BookMeta
            title={book.title}
            firstAuthor={book.firstAuthor}
            firstPublishYear={book.firstPublishYear}
            subjects={book.subjects}
          />

          <BookAvailabilityPanel
            totalCopies={book.totalCopies}
            availableCopies={book.availableCopies}
            queueLength={book.queueLength}
            earliestReturnDate={book.earliestReturnDate}
          />

          <BookActionCard workKey={book.id} isAvailable={isAvailable} />

          <BookDescription description={book.description} />
        </div>
      </div>
    </div>
  );
}
