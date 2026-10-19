import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BookDescriptionProps {
  description?: string;
}

export function BookDescription({ description }: BookDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description || !description.trim()) {
    return (
      <div className="border-border border-t py-6">
        <h2 className="text-text mb-2 font-serif text-lg">Overview</h2>
        <p className="text-muted font-sans text-sm italic">
          No bibliographic description is available for this edition in Open
          Library.
        </p>
      </div>
    );
  }

  const cleanDescription = description
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .trim();

  const isLong = cleanDescription.length > 500;
  const displayedText =
    isLong && !isExpanded
      ? `${cleanDescription.slice(0, 500)}...`
      : cleanDescription;

  const paragraphs = displayedText.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="border-border flex flex-col gap-3 border-t py-6">
      <h2 className="text-text font-serif text-lg">Overview</h2>
      <div className="text-muted flex flex-col gap-3 font-sans text-sm leading-relaxed">
        {paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-accent mt-1 flex items-center gap-1 self-start font-mono text-xs transition-colors hover:underline"
        >
          <span>{isExpanded ? 'Show less' : 'Read full description'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
}
