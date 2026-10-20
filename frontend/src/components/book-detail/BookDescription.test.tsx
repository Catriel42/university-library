import { render, screen, fireEvent } from '@testing-library/react';
import { BookDescription } from './BookDescription';

describe('BookDescription', () => {
  it('renders fallback notice when description is empty', () => {
    render(<BookDescription />);
    expect(
      screen.getByText(/no bibliographic description is available/i)
    ).toBeInTheDocument();
  });

  it('sanitizes markdown links and html tags', () => {
    render(
      <BookDescription description="Visit [Open Library](https://openlibrary.org) for <b>great</b> books." />
    );

    expect(
      screen.getByText('Visit Open Library for great books.')
    ).toBeInTheDocument();
  });

  it('truncates long descriptions and expands on toggle click', () => {
    const longText = 'A'.repeat(600);
    render(<BookDescription description={longText} />);

    expect(
      screen.getByRole('button', { name: /read full description/i })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /read full description/i })
    );

    expect(
      screen.getByRole('button', { name: /show less/i })
    ).toBeInTheDocument();
  });
});
