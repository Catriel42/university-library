import { render } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton component', () => {
  it('renders skeleton element with pulse animation class', () => {
    const { container } = render(<Skeleton className="h-6 w-32" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('h-6');
    expect(container.firstChild).toHaveClass('w-32');
  });

  it('renders with data-slot attribute', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('data-slot', 'skeleton');
  });
});
