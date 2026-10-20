import { render, screen, fireEvent } from '@testing-library/react';
import { LoanEmptyState } from './LoanEmptyState';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('LoanEmptyState', () => {
  it('renders empty message and navigates to catalog on click', () => {
    render(<LoanEmptyState />);

    expect(screen.getByText('You have no active loans')).toBeInTheDocument();

    const exploreBtn = screen.getByRole('button', {
      name: /explore book catalog/i,
    });
    expect(exploreBtn).toBeInTheDocument();

    fireEvent.click(exploreBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
