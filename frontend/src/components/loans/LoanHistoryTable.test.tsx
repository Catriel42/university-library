import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoanHistoryTable } from './LoanHistoryTable';
import type { LoanDTO } from '@university-library/shared';

const historyLoans: LoanDTO[] = [
  {
    id: 'loan-hist-1',
    workId: '/works/OL10W',
    userId: 'usr-1',
    title: 'History of Time',
    firstAuthor: 'Stephen Hawking',
    coverId: 999,
    borrowedAt: '2026-09-01T10:00:00.000Z',
    dueDate: '2026-09-15T10:00:00.000Z',
    returnedAt: '2026-09-14T10:00:00.000Z',
    status: 'RETURNED',
    renewals: 0,
  },
];

describe('LoanHistoryTable', () => {
  it('renders empty state message when loan history is empty', () => {
    render(
      <MemoryRouter>
        <LoanHistoryTable loans={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText('No loan history yet')).toBeInTheDocument();
  });

  it('renders returned loans list with book title and return date', () => {
    render(
      <MemoryRouter>
        <LoanHistoryTable loans={historyLoans} />
      </MemoryRouter>
    );

    expect(screen.getByText('History of Time')).toBeInTheDocument();
    expect(screen.getByText('Stephen Hawking')).toBeInTheDocument();
    expect(screen.getByText(/returned/i)).toBeInTheDocument();
  });
});
