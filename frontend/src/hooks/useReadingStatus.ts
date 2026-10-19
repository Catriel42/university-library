import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ReadingStatus,
  type ReadingStatusDTO,
  type ReadingStatusGroupDTO,
} from '@university-library/shared';
import { apiClient } from '@/lib/api';

export interface UseReadingStatusReturn {
  readingBooks: ReadingStatusDTO[];
  completedBooks: ReadingStatusDTO[];
  isLoading: boolean;
  errorMessage: string | null;
  handleSetStatus: (
    workKey: string,
    status: ReadingStatus
  ) => Promise<ReadingStatusDTO>;
  handleClearStatus: (workKey: string) => Promise<void>;
  getStatusForWork: (workKey: string) => Promise<ReadingStatus | null>;
  refresh: () => void;
}

export function useReadingStatus(): UseReadingStatusReturn {
  const [readingBooks, setReadingBooks] = useState<ReadingStatusDTO[]>([]);
  const [completedBooks, setCompletedBooks] = useState<ReadingStatusDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMyBooks = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiClient.get<ReadingStatusGroupDTO>(
          '/reading-status/me',
          { signal: controller.signal }
        );
        setReadingBooks(response.data.reading);
        setCompletedBooks(response.data.completed);
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;
        setErrorMessage('Failed to load your books list. Please try again.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchMyBooks();

    return () => {
      controller.abort();
    };
  }, [refreshTrigger]);

  const handleSetStatus = async (
    workKey: string,
    status: ReadingStatus
  ): Promise<ReadingStatusDTO> => {
    try {
      const response = await apiClient.put<{
        readingStatus: ReadingStatusDTO;
      }>(`/reading-status/${encodeURIComponent(workKey)}`, { status });
      setRefreshTrigger((prev) => prev + 1);
      return response.data.readingStatus;
    } catch (err: unknown) {
      let msg = 'Failed to update reading status. Please try again.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.error?.message || msg;
      }
      setErrorMessage(msg);
      throw err;
    }
  };

  const handleClearStatus = async (workKey: string) => {
    try {
      await apiClient.delete(`/reading-status/${encodeURIComponent(workKey)}`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      let msg = 'Failed to clear reading status. Please try again.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.error?.message || msg;
      }
      setErrorMessage(msg);
      throw err;
    }
  };

  const getStatusForWork = useCallback(
    async (workKey: string): Promise<ReadingStatus | null> => {
      try {
        const response = await apiClient.get<{ status: ReadingStatus | null }>(
          `/reading-status/${encodeURIComponent(workKey)}`
        );
        return response.data.status;
      } catch {
        return null;
      }
    },
    []
  );

  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    readingBooks,
    completedBooks,
    isLoading,
    errorMessage,
    handleSetStatus,
    handleClearStatus,
    getStatusForWork,
    refresh,
  };
}
