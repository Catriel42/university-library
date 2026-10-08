interface CopyPipsProps {
  total: number;
  available: number;
}

export function CopyPips({ total, available }: CopyPipsProps) {
  // Cap at 10 pips max to prevent layout overflow on crazy data
  const maxPips = Math.min(total, 10);
  const availableCount = Math.min(available, maxPips);
  
  // Fewer than 2 available -> warn (amber), None -> danger/muted logic
  // The brief says: "Fewer than 2 available -> pips turn amber. None available -> muted"
  // Let's determine the fill color for available pips
  let fillColor = 'bg-accent';
  let emptyColor = 'border-border';

  if (available === 0) {
    // None available -> muted
    emptyColor = 'border-muted opacity-50';
  } else if (available < 2) {
    // Fewer than 2 available -> amber
    fillColor = 'bg-warn';
  }

  return (
    <div className="flex items-center gap-1 mt-1" aria-label={`${available} out of ${total} copies available`}>
      {Array.from({ length: maxPips }).map((_, i) => {
        const isAvailable = i < availableCount;
        return (
          <div
            key={i}
            className={`
              w-2 h-2 rounded-full transition-colors duration-300
              ${isAvailable ? fillColor : `border border-dashed ${emptyColor} bg-transparent`}
            `}
          />
        );
      })}
      {total > 10 && (
        <span className="text-mono text-[10px] text-muted ml-1">+{total - 10}</span>
      )}
    </div>
  );
}
