import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReservationDTO } from '@university-library/shared';
import { useReservations } from '@/hooks/useReservations';
import { MyReservationsPage } from './MyReservationsPage';

jest.mock('@/hooks/useReservations');

const mockReservation: ReservationDTO = {
  id: 'res-10',
  userId: 'user-1',
  workId: 'OL300W',
  title: 'Reserved Great Gatsby',
  firstAuthor: 'F. Scott Fitzgerald',
  coverId: 303,
  createdAt: '2026-03-01T00:00:00.000Z',
  status: 'PENDING',
  queuePosition: 2,
};

describe('MyReservationsPage', () => {
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when there are no reservations', () => {
    jest.mocked(useReservations).mockReturnValue({
      reservations: [],
      isLoading: false,
      errorMessage: null,
      handleReserveWork: jest.fn(),
      handleCancelReservation: mockCancel,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MyReservationsPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /my reservations/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/no active reservations/i)).toBeInTheDocument();
  });

  it('renders reservation cards when reservations exist', () => {
    jest.mocked(useReservations).mockReturnValue({
      reservations: [mockReservation],
      isLoading: false,
      errorMessage: null,
      handleReserveWork: jest.fn(),
      handleCancelReservation: mockCancel,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MyReservationsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Reserved Great Gatsby')).toBeInTheDocument();
  });

  it('renders error message when present', () => {
    jest.mocked(useReservations).mockReturnValue({
      reservations: [],
      isLoading: false,
      errorMessage: 'Failed to fetch reservations',
      handleReserveWork: jest.fn(),
      handleCancelReservation: mockCancel,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MyReservationsPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Failed to fetch reservations')
    ).toBeInTheDocument();
  });
});
