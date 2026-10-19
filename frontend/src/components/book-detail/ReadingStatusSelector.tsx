import { useState, useEffect } from 'react';
import { ReadingStatus } from '@university-library/shared';
import { useReadingStatus } from '@/hooks/useReadingStatus';
import { BookOpen, CheckCircle2, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ReadingStatusSelectorProps {
  workKey: string;
}

export function ReadingStatusSelector({ workKey }: ReadingStatusSelectorProps) {
  const { user } = useAuth();
  const { getStatusForWork, handleSetStatus, handleClearStatus } =
    useReadingStatus();
  const [currentStatus, setCurrentStatus] = useState<ReadingStatus | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    getStatusForWork(workKey).then((status) => {
      if (!ignore) {
        setCurrentStatus(status);
      }
    });
    return () => {
      ignore = true;
    };
  }, [user, workKey, getStatusForWork]);

  if (!user) {
    return null;
  }

  const handleToggle = async (status: ReadingStatus) => {
    setIsUpdating(true);
    try {
      if (currentStatus === status) {
        await handleClearStatus(workKey);
        setCurrentStatus(null);
      } else {
        await handleSetStatus(workKey, status);
        setCurrentStatus(status);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClear = async () => {
    setIsUpdating(true);
    try {
      await handleClearStatus(workKey);
      setCurrentStatus(null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border-border/60 bg-surface-2 flex flex-col gap-2 rounded-xl border p-3">
      <div className="flex items-center justify-between">
        <span className="text-muted font-mono text-xs tracking-wider uppercase">
          Reading Tracker
        </span>
        {currentStatus && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isUpdating}
            className="text-muted hover:text-danger flex items-center gap-1 font-sans text-xs transition-colors"
          >
            <X size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleToggle(ReadingStatus.READING)}
          disabled={isUpdating}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-sans text-xs font-medium transition-all ${
            currentStatus === ReadingStatus.READING
              ? 'bg-accent text-bg shadow-sm'
              : 'bg-surface border-border text-text hover:border-accent border'
          }`}
        >
          {isUpdating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <BookOpen size={13} />
          )}
          <span>Reading</span>
        </button>

        <button
          type="button"
          onClick={() => handleToggle(ReadingStatus.COMPLETED)}
          disabled={isUpdating}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-sans text-xs font-medium transition-all ${
            currentStatus === ReadingStatus.COMPLETED
              ? 'bg-accent text-bg shadow-sm'
              : 'bg-surface border-border text-text hover:border-accent border'
          }`}
        >
          {isUpdating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <CheckCircle2 size={13} />
          )}
          <span>Completed</span>
        </button>
      </div>
    </div>
  );
}
