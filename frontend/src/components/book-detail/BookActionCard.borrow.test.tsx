import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BookActionCard } from './BookActionCard';
import { apiClient } from '@/lib/api';
import * as AuthContextModule from '@/context/AuthContext';
import * as ReservationsHook from '@/hooks/useReservations';

jest.mock('@/context/AuthContext');
jest.mock('@/hooks/useReservations');

describe('BookActionCard - Borrow Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'usr-1', email: 'user@test.com', name: 'User One' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    jest.spyOn(ReservationsHook, 'useReservations').mockReturnValue({
      reservations: [],
      isLoading: false,
      errorMessage: null,
      handleReserveWork: jest.fn(),
      handleCancelReservation: jest.fn(),
      refresh: jest.fn(),
    });
  });

  it('renders borrow button when copies are available', () => {
    render(
      <MemoryRouter>
        <BookActionCard workKey="/works/OL1W" isAvailable={true} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('button', { name: /borrow book/i })
    ).toBeInTheDocument();
  });

  it('handles borrow submission and displays confirmation banner', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        loan: {
          id: 'loan-1',
          workId: '/works/OL1W',
          userId: 'usr-1',
          borrowedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
          renewalsCount: 0,
        },
      },
    });

    render(
      <MemoryRouter>
        <BookActionCard workKey="/works/OL1W" isAvailable={true} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /borrow book/i }));

    await waitFor(() => {
      expect(screen.getByText('Book Checked Out!')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /view in my loans/i })
      ).toBeInTheDocument();
    });
  });
});
