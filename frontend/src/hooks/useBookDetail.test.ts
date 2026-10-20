import { renderHook, waitFor, act } from '@testing-library/react';
import type { BookDetailDTO } from '@university-library/shared';
import { apiClient } from '@/lib/api';
import { useBookDetail } from './useBookDetail';

const mockDetail: BookDetailDTO = {
  id: 'OL999W',
  title: 'Sample Book',
  description: 'Detailed description',
  coverId: 300,
  firstAuthor: 'Jane Austen',
  firstPublishYear: 1813,
  totalCopies: 5,
  availableCopies: 2,
  queueLength: 0,
};

describe('useBookDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches book detail by id on mount', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ data: mockDetail });

    const { result } = renderHook(() => useBookDetail('OL999W'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.book?.title).toBe('Sample Book');
    expect(result.current.error).toBeNull();
    expect(apiClient.get).toHaveBeenCalledWith(
      '/books/OL999W',
      expect.anything()
    );
  });

  it('sets error when fetch fails', async () => {
    jest.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBookDetail('OL999W'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Unable to load book details from the catalog. Please try again.'
    );
    expect(result.current.book).toBeNull();
  });

  it('retries fetching book detail when retry is called', async () => {
    jest
      .mocked(apiClient.get)
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce({ data: mockDetail });

    const { result } = renderHook(() => useBookDetail('OL999W'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBeTruthy();

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.book?.title).toBe('Sample Book');
    expect(result.current.error).toBeNull();
  });
});
