import { render, screen, fireEvent } from '@testing-library/react';
import { ReservationEmptyState } from './ReservationEmptyState';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('ReservationEmptyState', () => {
  it('renders empty notice and navigates to catalog on button click', () => {
    render(<ReservationEmptyState />);

    expect(screen.getByText('No active reservations')).toBeInTheDocument();

    const browseBtn = screen.getByRole('button', { name: /browse catalog/i });
    expect(browseBtn).toBeInTheDocument();

    fireEvent.click(browseBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
