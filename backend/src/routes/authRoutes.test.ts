import request from 'supertest';
import { createApp } from '../app.js';

jest.mock('../lib/prisma.js', () => {
  const actual = jest.requireActual('../test/mocks/prisma.mock.js');
  return { prisma: actual.mockPrisma };
});

describe('Auth Routes integration', () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responds with 200 on health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('rejects /api/auth/me with 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects invalid registration payload with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects invalid login payload with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
