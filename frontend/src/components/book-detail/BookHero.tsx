import { BookCoverImage } from '@/components/ui/BookCoverImage';

interface BookHeroProps {
  coverId?: number;
  title: string;
  isAvailable: boolean;
}

export function BookHero({ coverId, title, isAvailable }: BookHeroProps) {
  return (
    <div className="border-border relative mx-auto aspect-[2/3] w-full max-w-[280px] shrink-0 overflow-hidden rounded-2xl border shadow-2xl sm:max-w-[320px]">
      <BookCoverImage
        coverId={coverId}
        title={title}
        size="lg"
        loading="eager"
      />

      {!isAvailable && (
        <div className="border-border bg-surface/90 absolute top-3 right-3 rounded-lg border px-3 py-1.5 shadow-sm backdrop-blur">
          <span className="text-warn font-mono text-xs font-medium tracking-wider uppercase">
            Waitlist Only
          </span>
        </div>
      )}
    </div>
  );
}
