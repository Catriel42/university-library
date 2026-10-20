import { renderHook, waitFor, act } from '@testing-library/react';
import {
  ReadingStatus,
  type ReadingStatusDTO,
} from '@university-library/shared';
import { apiClient } from '@/lib/api';
import { useReadingStatus } from './useReadingStatus';

const mockReading: ReadingStatusDTO = {
  id: 'rs-1',
  userId: 'user-1',
  workId: 'OL10W',
  title: 'Current Read',
  firstAuthor: 'Author A',
  coverId: 50,
  status: ReadingStatus.READING,
  updatedAt: '2026-03-01T00:00:00.000Z',
};

const mockCompleted: ReadingStatusDTO = {
  id: 'rs-2',
  userId: 'user-1',
  workId: 'OL20W',
  title: 'Finished Book',
  status: ReadingStatus.COMPLETED,
  updatedAt: '2026-02-15T00:00:00.000Z',
};

describe('useReadingStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches reading and completed books on mount', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({
      data: { reading: [mockReading], completed: [mockCompleted] },
    });

    const { result } = renderHook(() => useReadingStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.readingBooks).toHaveLength(1);
    expect(result.current.completedBooks).toHaveLength(1);
  });

  it('sets status for a book', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({
      data: { reading: [], completed: [] },
    });
    jest.mocked(apiClient.put).mockResolvedValue({
      data: { readingStatus: mockReading },
    });

    const { result } = renderHook(() => useReadingStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let res: ReadingStatusDTO | undefined;
    await act(async () => {
      res = await result.current.handleSetStatus(
        'OL10W',
        ReadingStatus.READING
      );
    });

    expect(apiClient.put).toHaveBeenCalledWith('/reading-status/OL10W', {
      status: ReadingStatus.READING,
    });
    expect(res?.status).toBe(ReadingStatus.READING);
  });

  it('clears reading status for a book', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({
      data: { reading: [mockReading], completed: [] },
    });
    jest.mocked(apiClient.delete).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useReadingStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleClearStatus('OL10W');
    });

    expect(apiClient.delete).toHaveBeenCalledWith('/reading-status/OL10W');
  });

  it('retrieves current status for a single work', async () => {
    jest.mocked(apiClient.get).mockImplementation((url) => {
      if (url.includes('/reading-status/OL10W')) {
        return Promise.resolve({ data: { status: ReadingStatus.READING } });
      }
      return Promise.resolve({ data: { reading: [], completed: [] } });
    });

    const { result } = renderHook(() => useReadingStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let status: ReadingStatus | null = null;
    await act(async () => {
      status = await result.current.getStatusForWork('OL10W');
    });

    expect(status).toBe(ReadingStatus.READING);
  });
});
