import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReadingStatusSelector } from './ReadingStatusSelector';
import { ReadingStatus } from '@university-library/shared';
import * as AuthContextModule from '@/context/AuthContext';
import * as ReadingStatusHook from '@/hooks/useReadingStatus';

jest.mock('@/context/AuthContext');
jest.mock('@/hooks/useReadingStatus');

describe('ReadingStatusSelector', () => {
  const mockSetStatus = jest.fn();
  const mockClearStatus = jest.fn();
  const mockGetStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'usr-1', email: 'user@test.com', name: 'User' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    jest.spyOn(ReadingStatusHook, 'useReadingStatus').mockReturnValue({
      readingBooks: [],
      completedBooks: [],
      isLoading: false,
      errorMessage: null,
      getStatusForWork: mockGetStatus,
      handleSetStatus: mockSetStatus,
      handleClearStatus: mockClearStatus,
      refresh: jest.fn(),
    });
  });

  it('renders reading tracker buttons when authenticated', async () => {
    mockGetStatus.mockResolvedValueOnce(null);

    render(<ReadingStatusSelector workKey="/works/OL1W" />);

    expect(screen.getByText('Reading Tracker')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reading/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /completed/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetStatus).toHaveBeenCalledWith('/works/OL1W');
    });
  });

  it('handles clicking Reading status button', async () => {
    mockGetStatus.mockResolvedValueOnce(null);

    render(<ReadingStatusSelector workKey="/works/OL1W" />);

    await waitFor(() => {
      expect(mockGetStatus).toHaveBeenCalledWith('/works/OL1W');
    });

    fireEvent.click(screen.getByRole('button', { name: /reading/i }));

    await waitFor(() => {
      expect(mockSetStatus).toHaveBeenCalledWith(
        '/works/OL1W',
        ReadingStatus.READING
      );
    });
  });

  it('renders clear button when status is already active', async () => {
    mockGetStatus.mockResolvedValueOnce(ReadingStatus.COMPLETED);

    render(<ReadingStatusSelector workKey="/works/OL1W" />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /clear/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    await waitFor(() => {
      expect(mockClearStatus).toHaveBeenCalledWith('/works/OL1W');
    });
  });
});
