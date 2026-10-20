import { memo } from 'react';
import { motion } from 'motion/react';
import type { WorkDTO } from '@university-library/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { BookCard } from '@/components/catalog/BookCard';

interface CatalogResultsGridProps {
  books: WorkDTO[];
  isLoading: boolean;
}

export const CatalogResultsGrid = memo(function CatalogResultsGrid({
  books,
  isLoading,
}: CatalogResultsGridProps) {
  if (isLoading) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="grid w-full grid-cols-1 gap-4 min-[440px]:grid-cols-2 md:grid-cols-3 md:gap-6 xl:grid-cols-4"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="bg-surface aspect-2/3 w-full rounded-xl" />
            <Skeleton className="bg-surface h-5 w-3/4" />
            <Skeleton className="bg-surface h-4 w-1/2" />
            <Skeleton className="bg-surface mt-2 h-3 w-1/4" />
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      key="results"
      className="grid w-full grid-cols-1 gap-4 min-[440px]:grid-cols-2 md:grid-cols-3 md:gap-6 xl:grid-cols-4"
    >
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.03,
            ease: 'easeOut',
            duration: 0.25,
          }}
          className="group h-full"
        >
          <BookCard book={book} />
        </motion.div>
      ))}
    </motion.div>
  );
});
