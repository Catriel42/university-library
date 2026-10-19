import { useState, useEffect } from 'react';
import axios from 'axios';
import type { LoanDTO } from '@university-library/shared';
import { apiClient } from '@/lib/api';

export interface UseMyLoansReturn {
  activeLoans: LoanDTO[];
  historyLoans: LoanDTO[];
  isLoading: boolean;
  errorMessage: string | null;
  handleReturnLoan: (loanId: string) => Promise<void>;
  refresh: () => void;
}

export function useMyLoans(): UseMyLoansReturn {
  const [activeLoans, setActiveLoans] = useState<LoanDTO[]>([]);
  const [historyLoans, setHistoryLoans] = useState<LoanDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLoans = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [activeRes, historyRes] = await Promise.all([
          apiClient.get<{ loans: LoanDTO[] }>('/loans/me', {
            params: { status: 'ACTIVE' },
            signal: controller.signal,
          }),
          apiClient.get<{ loans: LoanDTO[] }>('/loans/me', {
            params: { status: 'RETURNED' },
            signal: controller.signal,
          }),
        ]);

        setActiveLoans(activeRes.data.loans);
        setHistoryLoans(historyRes.data.loans);
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;
        setErrorMessage('Failed to load your loans. Please refresh the page.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchLoans();

    return () => {
      controller.abort();
    };
  }, [refreshTrigger]);

  const handleReturnLoan = async (loanId: string) => {
    try {
      await apiClient.post<{ loan: LoanDTO }>(`/loans/${loanId}/return`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      let msg = 'Failed to return loan. Please try again.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.error?.message || msg;
      }
      setErrorMessage(msg);
    }
  };

  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    activeLoans,
    historyLoans,
    isLoading,
    errorMessage,
    handleReturnLoan,
    refresh,
  };
}
