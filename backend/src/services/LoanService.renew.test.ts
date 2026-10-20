import { ErrorCode } from '@university-library/shared';
import { mockPrisma, mockTx } from '../test/mocks/prisma.mock.js';
import { LoanService } from './LoanService.js';

jest.mock('../lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

describe('LoanService.renewLoan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws RENEWAL_LIMIT when loan has reached max renewals (BR-08)', async () => {
    mockTx.loan.findUnique.mockResolvedValueOnce({
      id: 'loan-1',
      userId: 'user-1',
      workId: 'OL123W',
      status: 'ACTIVE',
      renewals: 2,
      dueDate: new Date(Date.now() + 86400000),
      work: { title: 'Book' },
    });

    await expect(
      LoanService.renewLoan('user-1', 'loan-1')
    ).rejects.toMatchObject({
      name: 'LoanError',
      code: ErrorCode.RENEWAL_LIMIT,
      statusCode: 422,
    });
  });

  it('throws RENEWAL_BLOCKED when another user reserved the book (BR-09)', async () => {
    mockTx.loan.findUnique.mockResolvedValueOnce({
      id: 'loan-1',
      userId: 'user-1',
      workId: 'OL123W',
      status: 'ACTIVE',
      renewals: 0,
      dueDate: new Date(Date.now() + 86400000),
      work: { title: 'Book' },
    });
    mockTx.reservation.findFirst.mockResolvedValueOnce({
      id: 'res-other',
      userId: 'user-other',
      status: 'PENDING',
    });

    await expect(
      LoanService.renewLoan('user-1', 'loan-1')
    ).rejects.toMatchObject({
      name: 'LoanError',
      code: ErrorCode.RENEWAL_BLOCKED,
      statusCode: 422,
    });
  });

  it('successfully renews loan and extends due date', async () => {
    const originalDue = new Date(Date.now() + 86400000);
    mockTx.loan.findUnique.mockResolvedValueOnce({
      id: 'loan-1',
      userId: 'user-1',
      workId: 'OL123W',
      status: 'ACTIVE',
      renewals: 0,
      dueDate: originalDue,
      borrowedAt: new Date(),
      work: {
        id: 'OL123W',
        title: 'Renewable Book',
        firstAuthor: 'Author A',
        coverId: null,
      },
    });
    mockTx.reservation.findFirst.mockResolvedValueOnce(null);
    mockTx.loan.update.mockResolvedValueOnce({
      id: 'loan-1',
      userId: 'user-1',
      workId: 'OL123W',
      status: 'ACTIVE',
      renewals: 1,
      borrowedAt: new Date(),
      dueDate: new Date(originalDue.getTime() + 7 * 86400000),
      returnedAt: null,
      work: {
        id: 'OL123W',
        title: 'Renewable Book',
        firstAuthor: 'Author A',
        coverId: null,
      },
    });

    const result = await LoanService.renewLoan('user-1', 'loan-1');

    expect(result.id).toBe('loan-1');
    expect(result.renewals).toBe(1);
    expect(mockTx.loan.update).toHaveBeenCalled();
  });
});
