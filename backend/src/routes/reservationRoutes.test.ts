import request from 'supertest';
import { createApp } from '../app.js';
import { signToken } from '../lib/jwt.js';
import { ReservationService } from '../services/ReservationService.js';

jest.mock('../lib/prisma.js', () => {
  const actual = jest.requireActual('../test/mocks/prisma.mock.js');
  return { prisma: actual.mockPrisma };
});

jest.mock('../services/ReservationService.js');

describe('Reservation Routes integration', () => {
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
    const res = await request(app).get('/api/reservations/me');
    expect(res.status).toBe(401);
  });

  it('rejects create reservation with invalid schema with 400', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ workKey: 'not-valid-ol-key' });

    expect(res.status).toBe(400);
  });

  it('returns user reservations with 200 when authenticated', async () => {
    jest.mocked(ReservationService.getMyReservations).mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/reservations/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.reservations).toEqual([]);
    expect(ReservationService.getMyReservations).toHaveBeenCalledWith('user-1');
  });

  it('cancels reservation on DELETE /api/reservations/:id', async () => {
    jest
      .mocked(ReservationService.cancelReservation)
      .mockResolvedValueOnce(undefined);

    const res = await request(app)
      .delete('/api/reservations/res-10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(ReservationService.cancelReservation).toHaveBeenCalledWith(
      'user-1',
      'res-10'
    );
  });
});
