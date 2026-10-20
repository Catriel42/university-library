import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogPagination } from './CatalogPagination';

describe('CatalogPagination', () => {
  it('renders nothing when totalPages is 1 or less', () => {
    const { container } = render(
      <CatalogPagination
        currentPage={1}
        totalPages={1}
        totalFound={10}
        onPageChange={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders current page information and page buttons', () => {
    render(
      <CatalogPagination
        currentPage={2}
        totalPages={5}
        totalFound={100}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /previous/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(
      <CatalogPagination
        currentPage={1}
        totalPages={3}
        totalFound={60}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <CatalogPagination
        currentPage={3}
        totalPages={3}
        totalFound={60}
        onPageChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /previous/i })
    ).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('calls onPageChange when page button is clicked', () => {
    const handlePageChange = jest.fn();
    render(
      <CatalogPagination
        currentPage={2}
        totalPages={5}
        totalFound={100}
        onPageChange={handlePageChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(handlePageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });
});
