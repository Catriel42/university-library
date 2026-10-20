import { useState } from 'react';
import { useReadingStatus } from '@/hooks/useReadingStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { ReadingBookCard } from '@/components/reading-status/ReadingBookCard';
import { ReadingEmptyState } from '@/components/reading-status/ReadingEmptyState';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export function MyBooksPage() {
  const [activeTab, setActiveTab] = useState<'READING' | 'COMPLETED'>(
    'READING'
  );
  const {
    readingBooks,
    completedBooks,
    isLoading,
    errorMessage,
    handleSetStatus,
    handleClearStatus,
  } = useReadingStatus();

  const currentList = activeTab === 'READING' ? readingBooks : completedBooks;

  return (
    <div className="mx-auto w-full max-w-4xl py-6 md:py-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-text font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
          My Books
        </h1>
        <p className="text-muted font-sans text-sm">
          Track books you are currently reading and celebrate completed titles.
        </p>
      </div>

      <div className="bg-surface-2 border-border mb-6 flex w-full rounded-xl border p-1 sm:max-w-xs">
        <button
          type="button"
          onClick={() => setActiveTab('READING')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-mono text-xs tracking-wider uppercase transition-all ${
            activeTab === 'READING'
              ? 'bg-surface text-accent font-semibold shadow-sm'
              : 'text-muted hover:text-text'
          }`}
        >
          <BookOpen size={15} />
          <span>Reading ({readingBooks.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-mono text-xs tracking-wider uppercase transition-all ${
            activeTab === 'COMPLETED'
              ? 'bg-surface text-accent font-semibold shadow-sm'
              : 'text-muted hover:text-text'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>Completed ({completedBooks.length})</span>
        </button>
      </div>

      {errorMessage && (
        <AlertMessage message={errorMessage} className="mb-6 p-4" />
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border-border flex items-center gap-4 rounded-2xl border p-5"
            >
              <Skeleton className="bg-surface-2 h-24 w-16 shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="bg-surface-2 h-5 w-1/2" />
                <Skeleton className="bg-surface-2 h-4 w-1/4" />
                <Skeleton className="bg-surface-2 mt-2 h-6 w-32 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <ReadingEmptyState status={activeTab} />
      ) : (
        <div className="flex flex-col gap-4">
          {currentList.map((book) => (
            <ReadingBookCard
              key={book.id}
              book={book}
              onStatusChange={handleSetStatus}
              onClear={handleClearStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
