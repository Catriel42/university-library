import { useState, useEffect } from 'react';
import axios from 'axios';
import type { BookDetailDTO } from '@university-library/shared';
import { apiClient } from '@/lib/api';

export interface UseBookDetailReturn {
  book: BookDetailDTO | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useBookDetail(id?: string): UseBookDetailReturn {
  const [book, setBook] = useState<BookDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<BookDetailDTO>(
          `/books/${encodeURIComponent(id)}`,
          {
            signal: controller.signal,
          }
        );
        setBook(response.data);
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;
        setError(
          'Unable to load book details from the catalog. Please try again.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      controller.abort();
    };
  }, [id, retryTrigger]);

  const retry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  return {
    book,
    isLoading,
    error,
    retry,
  };
}
