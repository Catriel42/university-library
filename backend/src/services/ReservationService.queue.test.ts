import { ErrorCode } from '@university-library/shared';
import { mockPrisma, mockTx } from '../test/mocks/prisma.mock.js';
import { ReservationService } from './ReservationService.js';

jest.mock('../lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

describe('ReservationService.reserveWork (Queue rules)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects reservation if book has available copies (BR-10)', async () => {
    mockTx.loan.findFirst.mockResolvedValueOnce(null);
    mockTx.loan.findFirst.mockResolvedValueOnce(null);
    mockTx.reservation.findFirst.mockResolvedValueOnce(null);
    mockTx.work.findUnique.mockResolvedValueOnce({
      id: 'OL123W',
      title: 'Available Work',
      copies: 3,
    });
    mockTx.reservation.findMany.mockResolvedValueOnce([]);
    mockTx.loan.count.mockResolvedValueOnce(1);
    mockTx.reservation.count.mockResolvedValueOnce(0);

    await expect(
      ReservationService.reserveWork('user-1', 'OL123W')
    ).rejects.toMatchObject({
      name: 'ReservationError',
      code: ErrorCode.CANNOT_RESERVE_AVAILABLE,
      statusCode: 400,
    });
  });

  it('successfully enqueues reservation when available copies is 0', async () => {
    const now = new Date();
    mockTx.loan.findFirst.mockResolvedValueOnce(null);
    mockTx.loan.findFirst.mockResolvedValueOnce(null);
    mockTx.reservation.findFirst.mockResolvedValueOnce(null);
    mockTx.work.findUnique.mockResolvedValueOnce({
      id: 'OL123W',
      title: 'Zero Copies Book',
      copies: 3,
    });
    mockTx.reservation.findMany.mockResolvedValueOnce([]);
    mockTx.loan.count.mockResolvedValueOnce(3);
    mockTx.reservation.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);

    mockTx.reservation.create.mockResolvedValueOnce({
      id: 'res-new',
      userId: 'user-1',
      workId: 'OL123W',
      status: 'PENDING',
      createdAt: now,
      holdExpiresAt: null,
      work: {
        title: 'Zero Copies Book',
        firstAuthor: 'Author A',
        coverId: null,
      },
    });

    const result = await ReservationService.reserveWork('user-1', 'OL123W');

    expect(result.id).toBe('res-new');
    expect(result.status).toBe('PENDING');
    expect(result.queuePosition).toBe(1);
  });
});
