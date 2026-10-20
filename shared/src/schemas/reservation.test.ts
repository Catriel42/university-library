import { createReservationSchema } from './reservation';

describe('createReservationSchema', () => {
  it('accepts valid Open Library work key', () => {
    const valid = { workKey: 'OL82586W' };
    const result = createReservationSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workKey).toBe('OL82586W');
    }
  });

  it('trims whitespace around workKey', () => {
    const validWithSpaces = { workKey: '  OL12345W  ' };
    const result = createReservationSchema.safeParse(validWithSpaces);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workKey).toBe('OL12345W');
    }
  });

  it('rejects work keys not conforming to OL<number>W format', () => {
    expect(
      createReservationSchema.safeParse({ workKey: 'invalid' }).success
    ).toBe(false);
    expect(createReservationSchema.safeParse({ workKey: 'OLW' }).success).toBe(
      false
    );
    expect(
      createReservationSchema.safeParse({ workKey: 'OL1234M' }).success
    ).toBe(false);
  });
});
