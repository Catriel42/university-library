import { render, screen } from '@testing-library/react';
import { BookAvailabilityPanel } from './BookAvailabilityPanel';

describe('BookAvailabilityPanel', () => {
  it('renders in stock status and copies count when available', () => {
    render(
      <BookAvailabilityPanel
        totalCopies={5}
        availableCopies={3}
        queueLength={0}
      />
    );

    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('3 of 5 available')).toBeInTheDocument();
  });

  it('renders checked out status and queue length when unavailable', () => {
    render(
      <BookAvailabilityPanel
        totalCopies={3}
        availableCopies={0}
        queueLength={4}
        earliestReturnDate="2026-11-01T00:00:00.000Z"
      />
    );

    expect(screen.getByText('Checked Out')).toBeInTheDocument();
    expect(
      screen.getByText(/4 readers currently in waitlist queue/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/expected earliest return/i)).toBeInTheDocument();
  });
});
