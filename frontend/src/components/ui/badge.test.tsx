import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge component', () => {
  it('renders children content correctly', () => {
    render(<Badge>Active Status</Badge>);
    expect(screen.getByText('Active Status')).toBeInTheDocument();
  });

  it('applies variant styling', () => {
    const { container } = render(<Badge variant="destructive">Overdue</Badge>);
    expect(container.firstChild).toHaveClass('text-destructive');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-badge">Tag</Badge>);
    expect(container.firstChild).toHaveClass('custom-badge');
  });
});
