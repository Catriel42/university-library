import { setReadingStatusSchema } from './readingStatus';

describe('setReadingStatusSchema', () => {
  it('accepts READING status', () => {
    const result = setReadingStatusSchema.safeParse({ status: 'READING' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('READING');
    }
  });

  it('accepts COMPLETED status', () => {
    const result = setReadingStatusSchema.safeParse({ status: 'COMPLETED' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('COMPLETED');
    }
  });

  it('rejects invalid or unknown statuses', () => {
    expect(
      setReadingStatusSchema.safeParse({ status: 'ABANDONED' }).success
    ).toBe(false);
    expect(
      setReadingStatusSchema.safeParse({ status: 'reading' }).success
    ).toBe(false);
    expect(setReadingStatusSchema.safeParse({}).success).toBe(false);
  });
});
