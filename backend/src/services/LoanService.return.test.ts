import { ErrorCode } from '@university-library/shared';
import { mockPrisma, mockTx } from '../test/mocks/prisma.mock.js';
import { LoanService } from './LoanService.js';

jest.mock('../lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

describe('LoanService.returnLoan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws BAD_REQUEST 404 when loan is not found', async () => {
    mockTx.loan.findUnique.mockResolvedValueOnce(null);

    await expect(
      LoanService.returnLoan('user-1', 'nonexistent')
    ).rejects.toMatchObject({
      name: 'LoanError',
      code: ErrorCode.BAD_REQUEST,
      statusCode: 404,
    });
  });

  it('throws UNAUTHORIZED 403 when loan belongs to another user', async () => {
    mockTx.loan.findUnique.mockResolvedValueOnce({
      id: 'loan-1',
      userId: 'user-other',
      status: 'ACTIVE',
      work: { title: 'Book' },
    });

    await expect(
      LoanService.returnLoan('user-1', 'loan-1')
    ).rejects.toMatchObject({
      name: 'LoanError',
      code: ErrorCode.UNAUTHORIZED,
      statusCode: 403,
    });
  });

  it('successfully returns loan and promotes pending reservation to hold', async () => {
    const returnDate = new Date();
    mockTx.loan.findUnique.mockResolvedValueOnce({
      id: 'loan-1',
      userId: 'user-1',
      workId: 'OL123W',
      status: 'ACTIVE',
      borrowedAt: new Date(),
      dueDate: new Date(),
      renewals: 0,
      work: {
        id: 'OL123W',
        title: 'Book Title',
        firstAuthor: 'Author A',
        coverId: null,
      },
    });

    mockTx.loan.update.mockResolvedValueOnce({
      id: 'loan-1',
      userId: 'user-1',
      workId: 'OL123W',
      status: 'RETURNED',
      borrowedAt: new Date(),
      dueDate: new Date(),
      returnedAt: returnDate,
      renewals: 0,
      work: {
        id: 'OL123W',
        title: 'Book Title',
        firstAuthor: 'Author A',
        coverId: null,
      },
    });

    mockTx.reservation.findFirst.mockResolvedValueOnce({
      id: 'res-next',
      workId: 'OL123W',
      status: 'PENDING',
    });

    const result = await LoanService.returnLoan('user-1', 'loan-1');

    expect(result.status).toBe('RETURNED');
    expect(mockTx.reservation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'res-next' },
        data: expect.objectContaining({ status: 'HOLD' }),
      })
    );
  });
});
