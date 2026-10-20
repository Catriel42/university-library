import { render, screen } from '@testing-library/react';
import { BookCoverImage } from './BookCoverImage';

describe('BookCoverImage', () => {
  it('renders image when coverId is provided', () => {
    render(<BookCoverImage coverId={12345} title="Clean Code" size="md" />);
    const image = screen.getByRole('img', { name: /cover of clean code/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      'src',
      'https://covers.openlibrary.org/b/id/12345-M.jpg'
    );
  });

  it('renders fallback title text when coverId is missing', () => {
    render(<BookCoverImage title="The Pragmatic Programmer" size="md" />);
    expect(
      screen.queryByRole('img', { name: /cover of the pragmatic programmer/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
  });

  it('uses size letter S for sm size', () => {
    render(<BookCoverImage coverId={999} title="Small Book" size="sm" />);
    const image = screen.getByRole('img', { name: /cover of small book/i });
    expect(image).toHaveAttribute(
      'src',
      'https://covers.openlibrary.org/b/id/999-S.jpg'
    );
  });

  it('uses size letter L for lg size', () => {
    render(<BookCoverImage coverId={888} title="Large Book" size="lg" />);
    const image = screen.getByRole('img', { name: /cover of large book/i });
    expect(image).toHaveAttribute(
      'src',
      'https://covers.openlibrary.org/b/id/888-L.jpg'
    );
  });
});
