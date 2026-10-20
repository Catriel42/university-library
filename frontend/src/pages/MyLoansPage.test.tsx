import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { LoanDTO } from '@university-library/shared';
import { useMyLoans } from '@/hooks/useMyLoans';
import { MyLoansPage } from './MyLoansPage';

jest.mock('@/hooks/useMyLoans');

const mockActiveLoan: LoanDTO = {
  id: 'loan-1',
  userId: 'user-1',
  workId: 'OL100W',
  title: 'Borrowed Pride and Prejudice',
  firstAuthor: 'Jane Austen',
  coverId: 101,
  status: 'ACTIVE',
  borrowedAt: '2026-03-01T00:00:00.000Z',
  dueDate: '2026-03-15T00:00:00.000Z',
  returnedAt: null,
  renewals: 0,
};

const mockHistoryLoan: LoanDTO = {
  id: 'loan-2',
  userId: 'user-1',
  workId: 'OL200W',
  title: 'Returned Dune',
  firstAuthor: 'Frank Herbert',
  coverId: 202,
  status: 'RETURNED',
  borrowedAt: '2026-02-01T00:00:00.000Z',
  dueDate: '2026-02-15T00:00:00.000Z',
  returnedAt: '2026-02-14T00:00:00.000Z',
  renewals: 1,
};

describe('MyLoansPage', () => {
  const mockReturn = jest.fn();
  const mockRenew = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no active loans exist', () => {
    jest.mocked(useMyLoans).mockReturnValue({
      activeLoans: [],
      historyLoans: [],
      isLoading: false,
      errorMessage: null,
      handleReturnLoan: mockReturn,
      handleRenewLoan: mockRenew,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MyLoansPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /my borrowed books/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/no active loans/i)).toBeInTheDocument();
  });

  it('renders active loans and switches to history tab', async () => {
    const user = userEvent.setup();
    jest.mocked(useMyLoans).mockReturnValue({
      activeLoans: [mockActiveLoan],
      historyLoans: [mockHistoryLoan],
      isLoading: false,
      errorMessage: null,
      handleReturnLoan: mockReturn,
      handleRenewLoan: mockRenew,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MyLoansPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Borrowed Pride and Prejudice')
    ).toBeInTheDocument();

    const historyTab = screen.getByRole('button', { name: /history/i });
    await user.click(historyTab);

    expect(screen.getByText('Returned Dune')).toBeInTheDocument();
  });

  it('renders error message when present', () => {
    jest.mocked(useMyLoans).mockReturnValue({
      activeLoans: [],
      historyLoans: [],
      isLoading: false,
      errorMessage: 'Network failed to load loans',
      handleReturnLoan: mockReturn,
      handleRenewLoan: mockRenew,
      refresh: jest.fn(),
    });

    render(
      <MemoryRouter>
        <MyLoansPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Network failed to load loans')
    ).toBeInTheDocument();
  });
});
