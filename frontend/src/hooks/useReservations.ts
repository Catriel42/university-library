import { useState, useEffect } from 'react';
import axios from 'axios';
import type { ReservationDTO } from '@university-library/shared';
import { apiClient } from '@/lib/api';

export interface UseReservationsReturn {
  reservations: ReservationDTO[];
  isLoading: boolean;
  errorMessage: string | null;
  handleReserveWork: (workKey: string) => Promise<ReservationDTO>;
  handleCancelReservation: (reservationId: string) => Promise<void>;
  refresh: () => void;
}

export function useReservations(): UseReservationsReturn {
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReservations = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiClient.get<{
          reservations: ReservationDTO[];
        }>('/reservations/me', { signal: controller.signal });
        setReservations(response.data.reservations);
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;
        setErrorMessage('Failed to load reservations. Please try again.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchReservations();

    return () => {
      controller.abort();
    };
  }, [refreshTrigger]);

  const handleReserveWork = async (
    workKey: string
  ): Promise<ReservationDTO> => {
    try {
      const response = await apiClient.post<{ reservation: ReservationDTO }>(
        '/reservations',
        { workKey }
      );
      setRefreshTrigger((prev) => prev + 1);
      return response.data.reservation;
    } catch (err: unknown) {
      let msg = 'Failed to place reservation. Please try again.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.error?.message || msg;
      }
      setErrorMessage(msg);
      throw err;
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await apiClient.delete(`/reservations/${reservationId}`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      let msg = 'Failed to cancel reservation. Please try again.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.error?.message || msg;
      }
      setErrorMessage(msg);
      throw err;
    }
  };

  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    reservations,
    isLoading,
    errorMessage,
    handleReserveWork,
    handleCancelReservation,
    refresh,
  };
}
