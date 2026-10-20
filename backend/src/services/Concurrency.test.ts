import { ErrorCode } from '@university-library/shared';
import { mockPrisma, mockTx } from '../test/mocks/prisma.mock.js';
import { LoanService, LoanError } from './LoanService.js';

jest.mock('../lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

describe('Concurrency and Double-Booking Guard (NFR-14)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prevents double-booking when two users concurrently request the last copy', async () => {
    let availableCopies = 1;
    const workRecord = {
      id: 'OL999W',
      title: 'Rare Book',
      copies: 1,
    };

    mockTx.loan.findFirst.mockResolvedValue(null);
    mockTx.reservation.findFirst.mockResolvedValue(null);
    mockTx.reservation.findMany.mockResolvedValue([]);
    mockTx.work.findUnique.mockResolvedValue(workRecord);

    mockTx.loan.count.mockImplementation(async (args) => {
      if (args?.where?.workId) {
        return 1 - availableCopies;
      }
      return 0;
    });

    mockTx.loan.create.mockImplementation(async (args) => {
      availableCopies--;
      return {
        id: 'loan-' + Math.random(),
        userId: args.data.userId,
        workId: args.data.workId,
        borrowedAt: new Date(),
        dueDate: new Date(Date.now() + 14 * 86400000),
        returnedAt: null,
        status: 'ACTIVE',
        renewals: 0,
        work: {
          id: 'OL999W',
          title: 'Rare Book',
          firstAuthor: 'Rare Author',
          coverId: null,
        },
      };
    });

    let queue = Promise.resolve<unknown>(undefined);
    mockPrisma.$transaction.mockImplementation(
      (callback: (tx: typeof mockTx) => Promise<unknown>) => {
        const next = queue.then(() => callback(mockTx));
        queue = next.catch(() => {});
        return next;
      }
    );

    const results = await Promise.allSettled([
      LoanService.borrowBook('user-1', 'OL999W'),
      LoanService.borrowBook('user-2', 'OL999W'),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    if (rejected[0].status === 'rejected') {
      const error = rejected[0].reason as LoanError;
      expect(error.code).toBe(ErrorCode.NO_COPIES);
      expect(error.statusCode).toBe(409);
    }
  });
});
