import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from './BookCard';
import type { WorkDTO } from '@university-library/shared';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const sampleBook: WorkDTO = {
  id: '/works/OL12345W',
  title: 'Dune',
  firstAuthor: 'Frank Herbert',
  firstPublishYear: 1965,
  coverId: 54321,
  totalCopies: 3,
  availableCopies: 2,
};

describe('BookCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders book details and borrow button when copies are available', () => {
    render(<BookCard book={sampleBook} />);

    expect(screen.getByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument();
    expect(screen.getByText('1965')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /borrow/i })).toBeInTheDocument();
  });

  it('navigates to book detail page on card click', () => {
    render(<BookCard book={sampleBook} />);

    fireEvent.click(screen.getByText('Dune'));
    expect(mockNavigate).toHaveBeenCalledWith('/book/%2Fworks%2FOL12345W');
  });

  it('renders waitlist badge and place hold button when copies are 0', () => {
    const unavailableBook: WorkDTO = {
      ...sampleBook,
      availableCopies: 0,
    };

    render(<BookCard book={unavailableBook} />);

    expect(screen.getByText(/waitlist/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /place hold/i })
    ).toBeInTheDocument();
  });
});
