import { renderHook, waitFor, act } from '@testing-library/react';
import type { LoanDTO } from '@university-library/shared';
import { apiClient } from '@/lib/api';
import { useMyLoans } from './useMyLoans';

const mockLoan: LoanDTO = {
  id: 'loan-1',
  userId: 'user-1',
  workId: 'OL123W',
  title: 'Test Book',
  firstAuthor: 'Test Author',
  coverId: 101,
  status: 'ACTIVE',
  borrowedAt: '2026-03-01T00:00:00.000Z',
  dueDate: '2026-03-15T00:00:00.000Z',
  returnedAt: null,
  renewals: 0,
};

describe('useMyLoans', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches active and history loans on mount', async () => {
    const mockedGet = jest.mocked(apiClient.get);
    mockedGet.mockImplementation((_url, config) => {
      const status = (config?.params as { status?: string })?.status;
      if (status === 'ACTIVE') {
        return Promise.resolve({ data: { loans: [mockLoan] } });
      }
      return Promise.resolve({ data: { loans: [] } });
    });

    const { result } = renderHook(() => useMyLoans());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeLoans).toHaveLength(1);
    expect(result.current.activeLoans[0].id).toBe('loan-1');
    expect(result.current.historyLoans).toHaveLength(0);
    expect(result.current.errorMessage).toBeNull();
  });

  it('sets error message when API fails', async () => {
    jest.mocked(apiClient.get).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useMyLoans());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBe(
      'Failed to load your loans. Please refresh the page.'
    );
  });

  it('handles loan return successfully', async () => {
    jest
      .mocked(apiClient.get)
      .mockResolvedValue({ data: { loans: [mockLoan] } });
    jest.mocked(apiClient.post).mockResolvedValue({ data: { loan: mockLoan } });

    const { result } = renderHook(() => useMyLoans());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleReturnLoan('loan-1');
    });

    expect(apiClient.post).toHaveBeenCalledWith('/loans/loan-1/return');
  });

  it('handles loan renew successfully', async () => {
    jest
      .mocked(apiClient.get)
      .mockResolvedValue({ data: { loans: [mockLoan] } });
    jest.mocked(apiClient.post).mockResolvedValue({ data: { loan: mockLoan } });

    const { result } = renderHook(() => useMyLoans());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleRenewLoan('loan-1');
    });

    expect(apiClient.post).toHaveBeenCalledWith('/loans/loan-1/renew');
  });
});
