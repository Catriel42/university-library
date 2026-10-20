import { render, screen } from '@testing-library/react';
import { CatalogEmptyState } from './CatalogEmptyState';

describe('CatalogEmptyState', () => {
  it('renders informative message when no items match', () => {
    render(<CatalogEmptyState />);

    expect(screen.getByText('No matching items found')).toBeInTheDocument();
    expect(
      screen.getByText(/we couldn't find any books matching your query/i)
    ).toBeInTheDocument();
  });
});
