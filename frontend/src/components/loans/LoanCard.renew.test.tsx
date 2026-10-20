import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoanCard } from './LoanCard';
import type { LoanDTO } from '@university-library/shared';

const activeLoan: LoanDTO = {
  id: 'loan-2',
  workId: '/works/OL200W',
  userId: 'usr-1',
  title: 'Fahrenheit 451',
  firstAuthor: 'Ray Bradbury',
  borrowedAt: '2026-10-01T12:00:00.000Z',
  dueDate: '2026-10-15T12:00:00.000Z',
  status: 'ACTIVE',
  renewals: 1,
  daysRemaining: 4,
};

describe('LoanCard - Renewal Flow', () => {
  it('enables renew button and calls onRenew when clicked', () => {
    const handleRenew = jest.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LoanCard
          loan={activeLoan}
          onReturn={jest.fn()}
          onRenew={handleRenew}
        />
      </MemoryRouter>
    );

    const renewBtn = screen.getByRole('button', { name: /renew \(\+7d\)/i });
    expect(renewBtn).toBeEnabled();

    fireEvent.click(renewBtn);
    expect(handleRenew).toHaveBeenCalledWith('loan-2');
  });

  it('disables renew button when max renewals (2/2) reached', () => {
    const maxedLoan: LoanDTO = {
      ...activeLoan,
      renewals: 2,
    };

    render(
      <MemoryRouter>
        <LoanCard loan={maxedLoan} onReturn={jest.fn()} onRenew={jest.fn()} />
      </MemoryRouter>
    );

    const renewBtn = screen.getByRole('button', { name: /max renewals/i });
    expect(renewBtn).toBeDisabled();
  });

  it('disables renew button when loan is overdue', () => {
    const overdueLoan: LoanDTO = {
      ...activeLoan,
      daysOverdue: 3,
      daysRemaining: 0,
    };

    render(
      <MemoryRouter>
        <LoanCard loan={overdueLoan} onReturn={jest.fn()} onRenew={jest.fn()} />
      </MemoryRouter>
    );

    const renewBtn = screen.getByRole('button', { name: /renew \(\+7d\)/i });
    expect(renewBtn).toBeDisabled();
  });
});
