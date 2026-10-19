import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { CheckCircle2, Loader2, LogIn, ArrowRight } from 'lucide-react';
import type { LoanDTO, ApiError } from '@university-library/shared';
import axios from 'axios';

interface BookActionCardProps {
  workKey: string;
  isAvailable: boolean;
}

export function BookActionCard({ workKey, isAvailable }: BookActionCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isBorrowing, setIsBorrowing] = useState(false);
  const [borrowedLoan, setBorrowedLoan] = useState<LoanDTO | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBorrow = async () => {
    setIsBorrowing(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post<{ loan: LoanDTO }>('/loans', {
        workKey,
      });
      setBorrowedLoan(response.data.loan);
    } catch (err: unknown) {
      let msg = 'Failed to borrow this book. Please try again.';
      if (axios.isAxiosError<ApiError>(err)) {
        msg = err.response?.data?.error?.message || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsBorrowing(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-surface-2 border-border flex flex-col gap-3 rounded-2xl border p-5 text-center">
        <h3 className="text-text font-serif text-base font-medium">
          Borrow with your library card
        </h3>
        <p className="text-muted font-sans text-xs">
          Log in with your academic account to borrow this book or join the
          reservation queue.
        </p>
        <Button
          onClick={() =>
            navigate('/login', {
              state: { from: `/book/${encodeURIComponent(workKey)}` },
            })
          }
          className="bg-accent text-bg hover:bg-accent/90 mt-1 flex w-full items-center justify-center gap-2 rounded-xl"
        >
          <LogIn size={16} />
          <span>Sign In to Borrow</span>
        </Button>
      </div>
    );
  }

  if (borrowedLoan) {
    const formattedDueDate = new Date(borrowedLoan.dueDate).toLocaleDateString(
      undefined,
      {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }
    );

    return (
      <div className="bg-accent/10 border-accent/30 flex flex-col gap-3 rounded-2xl border p-5">
        <div className="text-accent flex items-center gap-2">
          <CheckCircle2 size={20} className="shrink-0" />
          <h3 className="text-text font-serif text-base font-medium">
            Book Checked Out!
          </h3>
        </div>
        <p className="text-muted font-sans text-xs leading-relaxed">
          You have borrowed this book for 14 days. Please return it before{' '}
          <strong className="text-accent font-semibold">
            {formattedDueDate}
          </strong>
          .
        </p>
        <Button
          onClick={() => navigate('/loans')}
          className="bg-accent text-bg hover:bg-accent/90 mt-1 flex w-full items-center justify-center gap-2 rounded-xl font-sans text-xs font-medium"
        >
          <span>View in My Loans</span>
          <ArrowRight size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMessage && (
        <AlertMessage message={errorMessage} className="p-3 text-xs" />
      )}

      {isAvailable ? (
        <Button
          disabled={isBorrowing}
          onClick={handleBorrow}
          className="bg-accent text-bg hover:bg-accent/90 h-12 w-full rounded-xl text-base font-medium shadow-sm transition-all"
        >
          {isBorrowing ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Checking out...</span>
            </span>
          ) : (
            <span>Borrow Book (14 Days)</span>
          )}
        </Button>
      ) : (
        <Button
          onClick={() =>
            setErrorMessage('Reservations queue will be activated in Sprint 5.')
          }
          variant="outline"
          className="border-border text-muted hover:text-text hover:border-accent h-12 w-full rounded-xl text-base font-medium transition-all"
        >
          <span>Place a Hold (Waitlist)</span>
        </Button>
      )}
    </div>
  );
}
