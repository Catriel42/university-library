import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  ReadingStatus,
  type ReadingStatusDTO,
} from '@university-library/shared';
import { useReadingStatus } from '@/hooks/useReadingStatus';
import { MyBooksPage } from './MyBooksPage';

jest.mock('@/hooks/useReadingStatus');

const mockReading: ReadingStatusDTO = {
  id: 'rs-1',
  userId: 'user-1',
  workId: 'OL10W',
  title: 'Currently Reading Book',
  firstAuthor: 'First Author',
  coverId: 10,
  status: ReadingStatus.READING,
  updatedAt: '2026-03-01T00:00:00.000Z',
};

const mockCompleted: ReadingStatusDTO = {
  id: 'rs-2',
  userId: 'user-1',
  workId: 'OL20W',
  title: 'Already Completed Book',
  firstAuthor: 'Second Author',
  coverId: 20,
  status: ReadingStatus.COMPLETED,
  updatedAt: '2026-02-01T00:00:00.000Z',
};

describe('MyBooksPage', () => {
  const mockSetStatus = jest.fn();
  const mockClearStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when there are no reading books', () => {
    jest.mocked(useReadingStatus).mockReturnValue({
      readingBooks: [],
      completedBooks: [],
      isLoading: false,
      errorMessage: null,
      handleSetStatus: mockSetStatus,
      handleClearStatus: mockClearStatus,
      getStatusForWork: jest.fn(),
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MyBooksPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /my books/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no books in your reading list/i)
    ).toBeInTheDocument();
  });

  it('renders reading books and switches to completed tab', async () => {
    const user = userEvent.setup();
    jest.mocked(useReadingStatus).mockReturnValue({
      readingBooks: [mockReading],
      completedBooks: [mockCompleted],
      isLoading: false,
      errorMessage: null,
      handleSetStatus: mockSetStatus,
      handleClearStatus: mockClearStatus,
      getStatusForWork: jest.fn(),
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MyBooksPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Currently Reading Book')).toBeInTheDocument();

    const completedTab = screen.getByRole('button', {
      name: /^completed \(\d+\)/i,
    });
    await user.click(completedTab);

    expect(screen.getByText('Already Completed Book')).toBeInTheDocument();
  });

  it('renders error message when present', () => {
    jest.mocked(useReadingStatus).mockReturnValue({
      readingBooks: [],
      completedBooks: [],
      isLoading: false,
      errorMessage: 'Failed to load books tracker',
      handleSetStatus: mockSetStatus,
      handleClearStatus: mockClearStatus,
      getStatusForWork: jest.fn(),
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MyBooksPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Failed to load books tracker')
    ).toBeInTheDocument();
  });
});
