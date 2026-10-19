import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertMessageProps {
  message: string;
  variant?: 'danger' | 'info' | 'warning';
  className?: string;
}

export function AlertMessage({
  message,
  variant = 'danger',
  className,
}: AlertMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-xl border p-3 font-sans text-sm',
        variant === 'danger' && 'bg-danger/10 border-danger/30 text-danger',
        variant === 'info' && 'bg-accent/10 border-accent/30 text-accent',
        variant === 'warning' &&
          'border-amber-500/30 bg-amber-500/10 text-amber-500',
        className
      )}
    >
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <span className="leading-tight">{message}</span>
    </div>
  );
}
