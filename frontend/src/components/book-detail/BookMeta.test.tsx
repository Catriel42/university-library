import { render, screen } from '@testing-library/react';
import { BookMeta } from './BookMeta';

describe('BookMeta', () => {
  it('renders title, author, year, and subject tags', () => {
    render(
      <BookMeta
        title="Foundation"
        firstAuthor="Isaac Asimov"
        firstPublishYear={1951}
        subjects={['Science Fiction', 'Space Opera']}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Foundation'
    );
    expect(screen.getByText('Isaac Asimov')).toBeInTheDocument();
    expect(screen.getByText(/published 1951/i)).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    expect(screen.getByText('Space Opera')).toBeInTheDocument();
  });

  it('renders fallback when author is missing', () => {
    render(<BookMeta title="Anonymous Poem" />);

    expect(screen.getByText('Unknown Author')).toBeInTheDocument();
  });
});
