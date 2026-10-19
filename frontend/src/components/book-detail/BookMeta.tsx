import { Calendar, User, Tag } from 'lucide-react';

interface BookMetaProps {
  title: string;
  firstAuthor?: string;
  firstPublishYear?: number;
  subjects?: string[];
}

export function BookMeta({
  title,
  firstAuthor,
  firstPublishYear,
  subjects,
}: BookMetaProps) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-text font-serif text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h1>

      <div className="text-muted flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 font-sans">
          <User size={16} className="text-accent" />
          <span className="text-text font-medium">
            {firstAuthor || 'Unknown Author'}
          </span>
        </div>

        {firstPublishYear && (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Calendar size={14} className="opacity-70" />
            <span>Published {firstPublishYear}</span>
          </div>
        )}
      </div>

      {subjects && subjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <Tag size={13} className="text-muted mr-1 opacity-70" />
          {subjects.map((subj) => (
            <span
              key={subj}
              className="bg-surface-2 border-border text-muted rounded-md border px-2.5 py-1 font-sans text-xs"
            >
              {subj}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
