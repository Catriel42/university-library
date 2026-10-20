import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogResultsGrid } from './CatalogResultsGrid';
import type { WorkDTO } from '@university-library/shared';

const sampleBooks: WorkDTO[] = [
  {
    id: '/works/OL1W',
    title: 'Book One',
    firstAuthor: 'Author One',
    totalCopies: 3,
    availableCopies: 2,
  },
  {
    id: '/works/OL2W',
    title: 'Book Two',
    firstAuthor: 'Author Two',
    totalCopies: 4,
    availableCopies: 0,
  },
];

describe('CatalogResultsGrid', () => {
  it('renders skeleton placeholders when isLoading is true', () => {
    const { container } = render(
      <CatalogResultsGrid books={[]} isLoading={true} />
    );

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders book cards when results are loaded', () => {
    render(
      <MemoryRouter>
        <CatalogResultsGrid books={sampleBooks} isLoading={false} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: 'Book One' })
    ).toBeInTheDocument();
    expect(screen.getByText('Author One')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Book Two' })
    ).toBeInTheDocument();
    expect(screen.getByText('Author Two')).toBeInTheDocument();
  });
});
