import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogToolbar } from './CatalogToolbar';

describe('CatalogToolbar', () => {
  it('renders search query title and total results count', () => {
    render(
      <CatalogToolbar
        queryParam="Science"
        subjectParam=""
        numFound={1250}
        displayedCount={20}
        hideUnavailable={false}
        sortParam="relevance"
        onToggleHideUnavailable={jest.fn()}
        onSortChange={jest.fn()}
      />
    );

    expect(screen.getByText('Results for "Science"')).toBeInTheDocument();
    expect(screen.getByText('1,250 found')).toBeInTheDocument();
  });

  it('renders subject title when no search query is present', () => {
    render(
      <CatalogToolbar
        queryParam=""
        subjectParam="history"
        numFound={42}
        displayedCount={20}
        hideUnavailable={false}
        sortParam="relevance"
        onToggleHideUnavailable={jest.fn()}
        onSortChange={jest.fn()}
      />
    );

    expect(screen.getByText('Subject: history')).toBeInTheDocument();
  });

  it('calls onToggleHideUnavailable when hide unavailable button is clicked', () => {
    const handleToggle = jest.fn();
    render(
      <CatalogToolbar
        queryParam=""
        subjectParam=""
        numFound={10}
        displayedCount={5}
        hideUnavailable={false}
        sortParam="relevance"
        onToggleHideUnavailable={handleToggle}
        onSortChange={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /hide unavailable/i }));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onSortChange when sort dropdown value changes', () => {
    const handleSortChange = jest.fn();
    render(
      <CatalogToolbar
        queryParam=""
        subjectParam=""
        numFound={10}
        displayedCount={10}
        hideUnavailable={false}
        sortParam="relevance"
        onToggleHideUnavailable={jest.fn()}
        onSortChange={handleSortChange}
      />
    );

    const select = screen.getByLabelText(/sort:/i);
    fireEvent.change(select, { target: { value: 'newest' } });
    expect(handleSortChange).toHaveBeenCalledWith('newest');
  });
});
