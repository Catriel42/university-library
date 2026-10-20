import { render, screen } from '@testing-library/react';
import { BookHero } from './BookHero';

describe('BookHero', () => {
  it('renders book cover image with eager loading', () => {
    render(<BookHero coverId={123} title="Solaris" isAvailable={true} />);

    const image = screen.getByRole('img', { name: /cover of solaris/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('loading', 'eager');
    expect(screen.queryByText(/waitlist only/i)).not.toBeInTheDocument();
  });

  it('renders waitlist only badge when book is not available', () => {
    render(<BookHero coverId={123} title="Solaris" isAvailable={false} />);

    expect(screen.getByText(/waitlist only/i)).toBeInTheDocument();
  });
});
