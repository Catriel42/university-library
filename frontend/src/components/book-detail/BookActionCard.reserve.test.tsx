import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BookActionCard } from './BookActionCard';
import * as AuthContextModule from '@/context/AuthContext';
import * as ReservationsHook from '@/hooks/useReservations';

jest.mock('@/context/AuthContext');
jest.mock('@/hooks/useReservations');

describe('BookActionCard - Reserve Flow', () => {
  const mockReserve = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'usr-1', email: 'user@test.com', name: 'User One' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('renders place reservation button when copies are 0 and not reserved', () => {
    jest.spyOn(ReservationsHook, 'useReservations').mockReturnValue({
      reservations: [],
      isLoading: false,
      errorMessage: null,
      handleReserveWork: mockReserve,
      handleCancelReservation: mockCancel,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <BookActionCard workKey="/works/OL1W" isAvailable={false} />
      </MemoryRouter>
    );

    const reserveBtn = screen.getByRole('button', {
      name: /reserve copy/i,
    });
    expect(reserveBtn).toBeInTheDocument();
    fireEvent.click(reserveBtn);
    expect(mockReserve).toHaveBeenCalledWith('/works/OL1W');
  });

  it('renders queue position and cancel button when user has pending reservation', () => {
    jest.spyOn(ReservationsHook, 'useReservations').mockReturnValue({
      reservations: [
        {
          id: 'res-1',
          workId: '/works/OL1W',
          title: 'Solaris',
          userId: 'usr-1',
          status: 'PENDING',
          queuePosition: 2,
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
      errorMessage: null,
      handleReserveWork: mockReserve,
      handleCancelReservation: mockCancel,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <BookActionCard workKey="/works/OL1W" isAvailable={false} />
      </MemoryRouter>
    );

    expect(screen.getByText(/position #2 in queue/i)).toBeInTheDocument();
    const cancelBtn = screen.getByRole('button', {
      name: /cancel reservation/i,
    });
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);
    expect(mockCancel).toHaveBeenCalledWith('res-1');
  });

  it('renders hold banner and claim button when reservation status is HOLD', () => {
    jest.spyOn(ReservationsHook, 'useReservations').mockReturnValue({
      reservations: [
        {
          id: 'res-1',
          workId: '/works/OL1W',
          title: 'Solaris',
          userId: 'usr-1',
          status: 'HOLD',
          hoursRemaining: 36,
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
      errorMessage: null,
      handleReserveWork: mockReserve,
      handleCancelReservation: mockCancel,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <BookActionCard workKey="/works/OL1W" isAvailable={false} />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/your reserved copy is ready for pickup/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /claim & borrow copy/i })
    ).toBeInTheDocument();
  });
});
