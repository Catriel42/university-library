import { ErrorCode } from '@university-library/shared';
import { mockPrisma, mockTx } from '../test/mocks/prisma.mock.js';
import { ReservationService } from './ReservationService.js';

jest.mock('../lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

describe('ReservationService.cancelReservation (Hold and cancellation)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws 404 when reservation does not exist', async () => {
    mockTx.reservation.findUnique.mockResolvedValueOnce(null);

    await expect(
      ReservationService.cancelReservation('user-1', 'res-none')
    ).rejects.toMatchObject({
      name: 'ReservationError',
      code: ErrorCode.RESERVATION_NOT_FOUND,
      statusCode: 404,
    });
  });

  it('throws 403 when cancelling another user reservation', async () => {
    mockTx.reservation.findUnique.mockResolvedValueOnce({
      id: 'res-other',
      userId: 'user-other',
      status: 'PENDING',
    });

    await expect(
      ReservationService.cancelReservation('user-1', 'res-other')
    ).rejects.toMatchObject({
      name: 'ReservationError',
      code: ErrorCode.UNAUTHORIZED,
      statusCode: 403,
    });
  });

  it('cancels hold reservation and promotes next pending in line (BR-11, BR-12)', async () => {
    mockTx.reservation.findUnique.mockResolvedValueOnce({
      id: 'res-1',
      userId: 'user-1',
      workId: 'OL123W',
      status: 'HOLD',
    });

    mockTx.reservation.findFirst.mockResolvedValueOnce({
      id: 'res-2',
      userId: 'user-2',
      workId: 'OL123W',
      status: 'PENDING',
    });

    await ReservationService.cancelReservation('user-1', 'res-1');

    expect(mockTx.reservation.update).toHaveBeenCalledWith({
      where: { id: 'res-1' },
      data: { status: 'CANCELLED' },
    });

    expect(mockTx.reservation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'res-2' },
        data: expect.objectContaining({ status: 'HOLD' }),
      })
    );
  });
});
