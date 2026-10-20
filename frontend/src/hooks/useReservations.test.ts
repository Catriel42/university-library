import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReservationDTO } from '@university-library/shared';
import { apiClient } from '@/lib/api';
import { useReservations } from './useReservations';

const mockReservation: ReservationDTO = {
  id: 'res-1',
  userId: 'user-1',
  workId: 'OL100W',
  title: 'Reserved Book',
  firstAuthor: 'Jane Author',
  coverId: 200,
  createdAt: '2026-03-01T00:00:00.000Z',
  status: 'PENDING',
  queuePosition: 1,
};

describe('useReservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches reservations on mount', async () => {
    jest
      .mocked(apiClient.get)
      .mockResolvedValue({ data: { reservations: [mockReservation] } });

    const { result } = renderHook(() => useReservations());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.reservations).toHaveLength(1);
    expect(result.current.reservations[0].id).toBe('res-1');
    expect(result.current.errorMessage).toBeNull();
  });

  it('sets error message when fetch fails', async () => {
    jest.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useReservations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBe(
      'Failed to load reservations. Please try again.'
    );
  });

  it('places a reservation successfully', async () => {
    jest
      .mocked(apiClient.get)
      .mockResolvedValue({ data: { reservations: [] } });
    jest
      .mocked(apiClient.post)
      .mockResolvedValue({ data: { reservation: mockReservation } });

    const { result } = renderHook(() => useReservations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let res: ReservationDTO | undefined;
    await act(async () => {
      res = await result.current.handleReserveWork('OL100W');
    });

    expect(apiClient.post).toHaveBeenCalledWith('/reservations', {
      workKey: 'OL100W',
    });
    expect(res?.id).toBe('res-1');
  });

  it('cancels a reservation successfully', async () => {
    jest
      .mocked(apiClient.get)
      .mockResolvedValue({ data: { reservations: [mockReservation] } });
    jest.mocked(apiClient.delete).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useReservations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleCancelReservation('res-1');
    });

    expect(apiClient.delete).toHaveBeenCalledWith('/reservations/res-1');
  });
});
