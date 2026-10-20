import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReservationCard } from './ReservationCard';
import type { ReservationDTO } from '@university-library/shared';

const queueReservation: ReservationDTO = {
  id: 'res-queue-1',
  workId: '/works/OL500W',
  userId: 'usr-1',
  title: 'Hyperion',
  firstAuthor: 'Dan Simmons',
  coverId: 888,
  status: 'PENDING',
  queuePosition: 3,
  createdAt: '2026-10-10T12:00:00.000Z',
};

describe('ReservationCard - Queue State', () => {
  it('renders queue position badge and triggers cancel on button click', () => {
    const handleCancel = jest.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <ReservationCard
          reservation={queueReservation}
          onCancel={handleCancel}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Hyperion')).toBeInTheDocument();
    expect(screen.getByText('Dan Simmons')).toBeInTheDocument();
    expect(screen.getByText(/position #3 in queue/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeInTheDocument();

    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledWith('res-queue-1');
  });
});
