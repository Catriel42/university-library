import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogSearchForm } from './CatalogSearchForm';

describe('CatalogSearchForm', () => {
  it('renders search input with placeholder based on field param', () => {
    render(
      <CatalogSearchForm
        inputQuery=""
        fieldParam="title"
        onQueryChange={jest.fn()}
        onFieldChange={jest.fn()}
        onClearQuery={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(
      screen.getByPlaceholderText('Search by book title...')
    ).toBeInTheDocument();
  });

  it('triggers onQueryChange when user types in the input', () => {
    const handleQueryChange = jest.fn();
    render(
      <CatalogSearchForm
        inputQuery=""
        fieldParam="q"
        onQueryChange={handleQueryChange}
        onFieldChange={jest.fn()}
        onClearQuery={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    const input = screen.getByPlaceholderText(
      'Search by title, author, or keyword...'
    );
    fireEvent.change(input, { target: { value: 'Dune' } });
    expect(handleQueryChange).toHaveBeenCalledWith('Dune');
  });

  it('triggers onFieldChange when user switches search field pill', () => {
    const handleFieldChange = jest.fn();
    render(
      <CatalogSearchForm
        inputQuery="Asimov"
        fieldParam="q"
        onQueryChange={jest.fn()}
        onFieldChange={handleFieldChange}
        onClearQuery={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /author/i }));
    expect(handleFieldChange).toHaveBeenCalledWith('author');
  });

  it('shows clear button and invokes onClearQuery on click', () => {
    const handleClear = jest.fn();
    render(
      <CatalogSearchForm
        inputQuery="Tolkien"
        fieldParam="author"
        onQueryChange={jest.fn()}
        onFieldChange={jest.fn()}
        onClearQuery={handleClear}
        onSubmit={jest.fn()}
      />
    );

    const clearBtn = screen.getByRole('button', {
      name: /clear search input/i,
    });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('invokes onSubmit when search button is clicked', () => {
    const handleSubmit = jest.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <CatalogSearchForm
        inputQuery="Neuromancer"
        fieldParam="q"
        onQueryChange={jest.fn()}
        onFieldChange={jest.fn()}
        onClearQuery={jest.fn()}
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
