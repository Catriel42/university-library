import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReservationCard } from './ReservationCard';
import type { ReservationDTO } from '@university-library/shared';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const holdReservation: ReservationDTO = {
  id: 'res-hold-1',
  workId: '/works/OL600W',
  userId: 'usr-1',
  title: 'Snow Crash',
  firstAuthor: 'Neal Stephenson',
  status: 'HOLD',
  hoursRemaining: 24,
  createdAt: '2026-10-10T12:00:00.000Z',
};

describe('ReservationCard - Hold State', () => {
  it('renders hold banner and navigates to book on Borrow Now click', () => {
    render(
      <MemoryRouter>
        <ReservationCard reservation={holdReservation} onCancel={jest.fn()} />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/ready for pickup • 24h remaining/i)
    ).toBeInTheDocument();

    const borrowBtn = screen.getByRole('button', { name: /borrow now/i });
    expect(borrowBtn).toBeInTheDocument();

    fireEvent.click(borrowBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/book/%2Fworks%2FOL600W');
  });
});
