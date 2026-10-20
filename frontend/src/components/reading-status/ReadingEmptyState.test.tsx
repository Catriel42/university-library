import { render, screen, fireEvent } from '@testing-library/react';
import { ReadingEmptyState } from './ReadingEmptyState';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('ReadingEmptyState', () => {
  it('renders reading specific message when status is READING', () => {
    render(<ReadingEmptyState status="READING" />);

    expect(
      screen.getByText('No books in your Reading list')
    ).toBeInTheDocument();
  });

  it('renders completed specific message when status is COMPLETED', () => {
    render(<ReadingEmptyState status="COMPLETED" />);

    expect(screen.getByText('No completed books yet')).toBeInTheDocument();

    const browseBtn = screen.getByRole('button', { name: /browse catalog/i });
    fireEvent.click(browseBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
