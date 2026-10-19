import { useState } from 'react';
import { useMyLoans } from '@/hooks/useMyLoans';
import { Skeleton } from '@/components/ui/skeleton';
import { LoanCard } from '@/components/loans/LoanCard';
import { LoanHistoryTable } from '@/components/loans/LoanHistoryTable';
import { LoanEmptyState } from '@/components/loans/LoanEmptyState';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { BookMarked, History } from 'lucide-react';

export function MyLoansPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const {
    activeLoans,
    historyLoans,
    isLoading,
    errorMessage,
    handleReturnLoan,
    handleRenewLoan,
  } = useMyLoans();

  return (
    <div className="mx-auto w-full max-w-4xl py-6 md:py-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-text font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
          My Borrowed Books
        </h1>
        <p className="text-muted font-sans text-sm">
          Manage your active library loans, track due dates, and view past
          borrow history.
        </p>
      </div>

      <div className="bg-surface-2 border-border mb-6 flex max-w-xs rounded-xl border p-1">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-mono text-xs tracking-wider uppercase transition-all ${
            activeTab === 'active'
              ? 'bg-surface text-accent font-semibold shadow-sm'
              : 'text-muted hover:text-text'
          }`}
        >
          <BookMarked size={15} />
          <span>Active ({activeLoans.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-mono text-xs tracking-wider uppercase transition-all ${
            activeTab === 'history'
              ? 'bg-surface text-accent font-semibold shadow-sm'
              : 'text-muted hover:text-text'
          }`}
        >
          <History size={15} />
          <span>History ({historyLoans.length})</span>
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
      ) : activeTab === 'active' ? (
        activeLoans.length === 0 ? (
          <LoanEmptyState />
        ) : (
          <div className="flex flex-col gap-4">
            {activeLoans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onReturn={handleReturnLoan}
                onRenew={handleRenewLoan}
              />
            ))}
          </div>
        )
      ) : (
        <LoanHistoryTable loans={historyLoans} />
      )}
    </div>
  );
}
