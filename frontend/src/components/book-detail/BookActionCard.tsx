import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useReservations } from '@/hooks/useReservations';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { ReadingStatusSelector } from './ReadingStatusSelector';
import {
  CheckCircle2,
  Loader2,
  LogIn,
  ArrowRight,
  BookmarkPlus,
  Clock,
  X,
} from 'lucide-react';
import type { LoanDTO, ApiError } from '@university-library/shared';
import axios from 'axios';

interface BookActionCardProps {
  workKey: string;
  isAvailable: boolean;
}

export function BookActionCard({ workKey, isAvailable }: BookActionCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { reservations, handleReserveWork, handleCancelReservation } =
    useReservations();

  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [borrowedLoan, setBorrowedLoan] = useState<LoanDTO | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const existingReservation = reservations.find(
    (r) =>
      r.workId === workKey && (r.status === 'PENDING' || r.status === 'HOLD')
  );

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

  const handleReserve = async () => {
    setIsReserving(true);
    setErrorMessage(null);

    try {
      await handleReserveWork(workKey);
    } catch (err: unknown) {
      let msg = 'Failed to place reservation. Please try again.';
      if (axios.isAxiosError<ApiError>(err)) {
        msg = err.response?.data?.error?.message || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsReserving(false);
    }
  };

  const handleCancel = async (id: string) => {
    setIsReserving(true);
    setErrorMessage(null);
    try {
      await handleCancelReservation(id);
    } catch (err: unknown) {
      let msg = 'Failed to cancel reservation. Please try again.';
      if (axios.isAxiosError<ApiError>(err)) {
        msg = err.response?.data?.error?.message || msg;
      }
      setErrorMessage(msg);
    } finally {
      setIsReserving(false);
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
      <div className="flex flex-col gap-4">
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

        <ReadingStatusSelector workKey={workKey} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
        ) : existingReservation ? (
          existingReservation.status === 'HOLD' ? (
            <div className="border-accent/40 bg-accent/10 flex flex-col gap-3 rounded-2xl border p-4 text-center">
              <span className="text-accent font-serif text-sm font-medium">
                Your reserved copy is ready for pickup!
              </span>
              <p className="text-muted font-sans text-xs">
                {existingReservation.hoursRemaining !== undefined
                  ? `${existingReservation.hoursRemaining} hours remaining in your hold window.`
                  : '48-hour pickup window is active.'}
              </p>
              <Button
                disabled={isBorrowing}
                onClick={handleBorrow}
                className="bg-accent text-bg hover:bg-accent/90 h-11 w-full rounded-xl text-sm font-medium"
              >
                {isBorrowing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>Claim & Borrow Copy</span>
                )}
              </Button>
            </div>
          ) : (
            <div className="border-border bg-surface-2 flex flex-col gap-3 rounded-2xl border p-4 text-center">
              <div className="text-muted flex items-center justify-center gap-2 font-mono text-xs">
                <Clock size={14} className="text-accent" />
                <span>
                  Reserved • Position #{existingReservation.queuePosition ?? 1}{' '}
                  in queue
                </span>
              </div>
              <Button
                variant="outline"
                disabled={isReserving}
                onClick={() => handleCancel(existingReservation.id)}
                className="border-border hover:border-danger hover:text-danger h-9 w-full rounded-xl text-xs font-medium"
              >
                {isReserving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <X size={13} />
                    <span>Cancel Reservation</span>
                  </span>
                )}
              </Button>
            </div>
          )
        ) : (
          <Button
            onClick={handleReserve}
            disabled={isReserving}
            className="bg-surface-2 border-border text-text hover:border-accent hover:text-accent h-12 w-full rounded-xl border text-base font-medium transition-all"
          >
            {isReserving ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Placing hold...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <BookmarkPlus size={18} />
                <span>Reserve Copy (Join Queue)</span>
              </span>
            )}
          </Button>
        )}
      </div>

      <ReadingStatusSelector workKey={workKey} />
    </div>
  );
}
