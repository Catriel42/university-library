import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogErrorState } from './CatalogErrorState';

describe('CatalogErrorState', () => {
  it('renders error message and retry button', () => {
    const handleRetry = jest.fn();
    render(
      <CatalogErrorState
        error="Network timeout occurred"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText('Search Error')).toBeInTheDocument();
    expect(screen.getByText('Network timeout occurred')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry search/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
