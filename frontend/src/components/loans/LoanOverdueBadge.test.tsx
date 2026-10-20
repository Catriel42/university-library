import { render, screen } from '@testing-library/react';
import { LoanOverdueBadge } from './LoanOverdueBadge';

describe('LoanOverdueBadge', () => {
  it('renders overdue alert with days count when overdue', () => {
    render(<LoanOverdueBadge daysOverdue={4} daysRemaining={0} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Overdue by 4 days');
    expect(alert).toHaveClass('text-danger');
  });

  it('renders due soon warning when days remaining is 2 or less', () => {
    render(<LoanOverdueBadge daysRemaining={2} daysOverdue={0} />);

    expect(screen.getByText('Due in 2 days')).toBeInTheDocument();
  });

  it('renders normal countdown when days remaining is greater than 2', () => {
    render(<LoanOverdueBadge daysRemaining={8} daysOverdue={0} />);

    expect(screen.getByText('8 days remaining')).toBeInTheDocument();
  });
});
