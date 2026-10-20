import { ErrorCode } from '@university-library/shared';
import { mockPrisma, mockTx } from '../test/mocks/prisma.mock.js';
import { LoanService, LoanError } from './LoanService.js';

jest.mock('../lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

describe('LoanService.borrowBook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws HAS_OVERDUE when user has overdue loans (BR-01)', async () => {
    mockTx.loan.findFirst.mockResolvedValueOnce({
      id: 'loan-old',
      dueDate: new Date(Date.now() - 86400000),
    });

    await expect(
      LoanService.borrowBook('user-1', 'OL123W')
    ).rejects.toMatchObject({
      name: 'LoanError',
      code: ErrorCode.HAS_OVERDUE,
      statusCode: 422,
    });
  });

  it('throws LOAN_LIMIT when user already has 5 active loans (BR-02)', async () => {
    mockTx.loan.findFirst.mockResolvedValueOnce(null);
    mockTx.loan.count.mockResolvedValueOnce(5);

    await expect(
      LoanService.borrowBook('user-1', 'OL123W')
    ).rejects.toMatchObject({
      name: 'LoanError',
      code: ErrorCode.LOAN_LIMIT,
      statusCode: 422,
    });
  });

  it('throws ALREADY_BORROWED when user already borrowed this book (BR-03)', async () => {
    mockTx.loan.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'loan-active', workId: 'OL123W' });
    mockTx.loan.count.mockResolvedValueOnce(2);

    await expect(
      LoanService.borrowBook('user-1', 'OL123W')
    ).rejects.toMatchObject({
      name: 'LoanError',
      code: ErrorCode.ALREADY_BORROWED,
      statusCode: 409,
    });
  });

  it('successfully borrows book when copies are available', async () => {
    const mockDate = new Date();
    mockTx.loan.findFirst.mockResolvedValue(null);
    mockTx.reservation.findFirst.mockResolvedValue(null);
    mockTx.reservation.findMany.mockResolvedValue([]);
    mockTx.loan.count.mockResolvedValue(0);
    mockTx.work.findUnique.mockResolvedValue({
      id: 'OL123W',
      title: 'Valid Book',
      firstAuthor: 'Author A',
      coverId: 10,
      copies: 3,
    });
    mockTx.loan.create.mockResolvedValue({
      id: 'new-loan-1',
      userId: 'user-1',
      workId: 'OL123W',
      borrowedAt: mockDate,
      dueDate: new Date(mockDate.getTime() + 14 * 86400000),
      returnedAt: null,
      status: 'ACTIVE',
      renewals: 0,
      work: {
        id: 'OL123W',
        title: 'Valid Book',
        firstAuthor: 'Author A',
        coverId: 10,
      },
    });

    const result = await LoanService.borrowBook('user-1', 'OL123W');

    expect(result.id).toBe('new-loan-1');
    expect(result.status).toBe('ACTIVE');
    expect(result.renewals).toBe(0);
  });
});
