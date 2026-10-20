import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoanCard } from './LoanCard';
import type { LoanDTO } from '@university-library/shared';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const sampleLoan: LoanDTO = {
  id: 'loan-1',
  workId: '/works/OL100W',
  userId: 'usr-1',
  title: 'Brave New World',
  firstAuthor: 'Aldous Huxley',
  coverId: 777,
  borrowedAt: '2026-10-01T12:00:00.000Z',
  dueDate: '2026-10-15T12:00:00.000Z',
  status: 'ACTIVE',
  renewals: 0,
  daysRemaining: 5,
};

describe('LoanCard', () => {
  it('renders loan book details and calls onReturn when return button is clicked', async () => {
    const handleReturn = jest.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LoanCard loan={sampleLoan} onReturn={handleReturn} />
      </MemoryRouter>
    );

    expect(screen.getByText('Brave New World')).toBeInTheDocument();
    expect(screen.getByText('Aldous Huxley')).toBeInTheDocument();
    expect(screen.getByText(/renewals: 0\/2/i)).toBeInTheDocument();

    const returnBtn = screen.getByRole('button', { name: /return book/i });
    expect(returnBtn).toBeInTheDocument();

    fireEvent.click(returnBtn);
    expect(handleReturn).toHaveBeenCalledWith('loan-1');
  });

  it('navigates to book detail on title click', () => {
    render(
      <MemoryRouter>
        <LoanCard loan={sampleLoan} onReturn={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Brave New World'));
    expect(mockNavigate).toHaveBeenCalledWith('/book/%2Fworks%2FOL100W');
  });
});
