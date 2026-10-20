import { render, screen, fireEvent } from '@testing-library/react';
import { BookActionCard } from './BookActionCard';
import * as AuthContextModule from '@/context/AuthContext';
import * as ReservationsHook from '@/hooks/useReservations';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('@/context/AuthContext');
jest.mock('@/hooks/useReservations');

describe('BookActionCard - Visitor Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
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

  it('renders login prompt and button for unauthenticated visitor', () => {
    render(<BookActionCard workKey="/works/OL99W" isAvailable={true} />);

    expect(
      screen.getByText('Borrow with your library card')
    ).toBeInTheDocument();

    const signInBtn = screen.getByRole('button', {
      name: /sign in to borrow/i,
    });
    expect(signInBtn).toBeInTheDocument();

    fireEvent.click(signInBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { from: '/book/%2Fworks%2FOL99W' },
    });
  });
});
