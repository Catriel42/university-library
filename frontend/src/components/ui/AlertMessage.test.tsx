import { render, screen } from '@testing-library/react';
import { AlertMessage } from './AlertMessage';

describe('AlertMessage', () => {
  it('renders message text with default danger role and classes', () => {
    render(<AlertMessage message="Something went wrong" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Something went wrong');
    expect(alert).toHaveClass('text-danger');
  });

  it('renders info variant styling', () => {
    render(<AlertMessage message="Information note" variant="info" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-accent');
  });

  it('renders warning variant styling', () => {
    render(<AlertMessage message="Warning notice" variant="warning" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-amber-500');
  });

  it('applies custom className', () => {
    render(<AlertMessage message="Custom alert" className="my-alert" />);
    expect(screen.getByRole('alert')).toHaveClass('my-alert');
  });
});
