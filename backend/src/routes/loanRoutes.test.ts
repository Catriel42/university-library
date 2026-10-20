import request from 'supertest';
import { createApp } from '../app.js';
import { signToken } from '../lib/jwt.js';
import { LoanService } from '../services/LoanService.js';

jest.mock('../lib/prisma.js', () => {
  const actual = jest.requireActual('../test/mocks/prisma.mock.js');
  return { prisma: actual.mockPrisma };
});

jest.mock('../services/LoanService.js');

describe('Loan Routes integration', () => {
  const app = createApp();
  const token = signToken({
    sub: 'user-1',
    email: 'user@test.edu',
    name: 'Test Student',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/loans/me');
    expect(res.status).toBe(401);
  });

  it('rejects borrow without workKey with 400', async () => {
    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns user active and history loans with 200 when authenticated', async () => {
    jest.mocked(LoanService.getUserLoans).mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/loans/me?status=ACTIVE')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.loans).toEqual([]);
    expect(LoanService.getUserLoans).toHaveBeenCalledWith('user-1', 'ACTIVE');
  });

  it('calls returnLoan on POST /api/loans/:id/return', async () => {
    jest.mocked(LoanService.returnLoan).mockResolvedValueOnce({
      id: 'loan-1',
      userId: 'user-1',
      workId: 'OL1W',
      title: 'Book',
      borrowedAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      returnedAt: new Date().toISOString(),
      status: 'RETURNED',
      renewals: 0,
    });

    const res = await request(app)
      .post('/api/loans/loan-1/return')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(LoanService.returnLoan).toHaveBeenCalledWith('user-1', 'loan-1');
  });
});
