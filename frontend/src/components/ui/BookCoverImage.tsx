import { cn } from '@/lib/utils';

export interface BookCoverImageProps {
  coverId?: number;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  imageClassName?: string;
  loading?: 'lazy' | 'eager';
}

export function BookCoverImage({
  coverId,
  title,
  size = 'full',
  className,
  imageClassName,
  loading = 'lazy',
}: BookCoverImageProps) {
  const sizeLetter = size === 'sm' ? 'S' : size === 'md' ? 'M' : 'L';

  return (
    <div
      className={cn(
        'bg-surface-2 relative flex shrink-0 items-center justify-center overflow-hidden',
        size === 'sm' && 'h-14 w-10 rounded-lg',
        size === 'md' && 'h-24 w-16 rounded-xl sm:h-28 sm:w-20',
        size === 'lg' &&
          'aspect-[2/3] w-full max-w-[280px] rounded-2xl sm:max-w-[320px]',
        size === 'full' && 'aspect-[2/3] h-full w-full',
        className
      )}
    >
      {coverId ? (
        <img
          src={`https://covers.openlibrary.org/b/id/${coverId}-${sizeLetter}.jpg`}
          alt={`Cover of ${title}`}
          className={cn('h-full w-full object-cover', imageClassName)}
          loading={loading}
        />
      ) : (
        <div className="from-surface to-border flex h-full w-full items-center justify-center bg-gradient-to-br p-3 text-center">
          <span
            className={cn(
              'text-muted/70 line-clamp-3 font-serif leading-snug select-none',
              size === 'sm' && 'line-clamp-2 text-[9px]',
              size === 'md' && 'text-xs',
              size === 'lg' && 'p-6 text-xl',
              size === 'full' && 'line-clamp-4 text-base'
            )}
          >
            {title}
          </span>
        </div>
      )}
    </div>
  );
}
