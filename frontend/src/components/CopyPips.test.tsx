import { render, screen } from '@testing-library/react';
import { CopyPips } from './CopyPips';

describe('CopyPips', () => {
  it('renders accessible label with available and total count', () => {
    render(<CopyPips total={5} available={3} />);
    expect(
      screen.getByLabelText('3 out of 5 copies available')
    ).toBeInTheDocument();
  });

  it('renders warning color when fewer than 2 copies available', () => {
    const { container } = render(<CopyPips total={3} available={1} />);
    const filledPip = container.querySelector('.bg-warn');
    expect(filledPip).toBeInTheDocument();
  });

  it('renders muted styling when 0 copies available', () => {
    const { container } = render(<CopyPips total={3} available={0} />);
    const emptyPip = container.querySelector('.border-muted');
    expect(emptyPip).toBeInTheDocument();
  });

  it('displays overflow text when total exceeds 10', () => {
    render(<CopyPips total={15} available={8} />);
    expect(screen.getByText('+5')).toBeInTheDocument();
  });
});
