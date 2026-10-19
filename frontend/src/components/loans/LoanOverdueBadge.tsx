import { AlertTriangle, Clock } from 'lucide-react';

interface LoanOverdueBadgeProps {
  daysRemaining?: number;
  daysOverdue?: number;
}

export function LoanOverdueBadge({
  daysRemaining,
  daysOverdue,
}: LoanOverdueBadgeProps) {
  if (daysOverdue && daysOverdue > 0) {
    return (
      <div
        role="alert"
        className="bg-danger/15 border-danger/30 text-danger inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-xs font-semibold"
      >
        <AlertTriangle size={14} className="shrink-0" />
        <span>
          Overdue by {daysOverdue} day{daysOverdue > 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  if (daysRemaining !== undefined && daysRemaining <= 2) {
    return (
      <div className="bg-warn/15 border-warn/30 text-warn inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-xs font-medium">
        <Clock size={14} className="shrink-0" />
        <span>
          Due in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-surface-2 border-border text-muted inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-xs">
      <Clock size={14} className="shrink-0 opacity-70" />
      <span>{daysRemaining ?? 0} days remaining</span>
    </div>
  );
}
