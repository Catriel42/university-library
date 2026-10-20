import { ReadingStatus } from '@university-library/shared';
import { mockPrisma } from '../test/mocks/prisma.mock.js';
import { ReadingStatusService } from './ReadingStatusService.js';

jest.mock('../lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

describe('ReadingStatusService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets reading status using atomic upsert (NFR-15)', async () => {
    mockPrisma.work.findUnique.mockResolvedValueOnce({
      id: 'OL123W',
      title: 'Tracked Book',
      firstAuthor: 'Author A',
      coverId: 10,
    });

    mockPrisma.readingStatus.upsert.mockResolvedValueOnce({
      id: 'rs-1',
      userId: 'user-1',
      workId: 'OL123W',
      status: 'READING',
      updatedAt: new Date(),
      work: {
        title: 'Tracked Book',
        firstAuthor: 'Author A',
        coverId: 10,
      },
    });

    const result = await ReadingStatusService.setStatus(
      'user-1',
      'OL123W',
      ReadingStatus.READING
    );

    expect(result.status).toBe(ReadingStatus.READING);
    expect(mockPrisma.readingStatus.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_workId: {
            userId: 'user-1',
            workId: 'OL123W',
          },
        },
      })
    );
  });

  it('clears reading status for a work', async () => {
    mockPrisma.readingStatus.deleteMany.mockResolvedValueOnce({ count: 1 });

    await ReadingStatusService.clearStatus('user-1', 'OL123W');

    expect(mockPrisma.readingStatus.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        workId: 'OL123W',
      },
    });
  });

  it('retrieves user reading status grouped by category', async () => {
    mockPrisma.readingStatus.findMany.mockResolvedValueOnce([
      {
        id: 'rs-1',
        userId: 'user-1',
        workId: 'OL1W',
        status: 'READING',
        updatedAt: new Date(),
        work: { title: 'Book 1', firstAuthor: 'A', coverId: null },
      },
      {
        id: 'rs-2',
        userId: 'user-1',
        workId: 'OL2W',
        status: 'COMPLETED',
        updatedAt: new Date(),
        work: { title: 'Book 2', firstAuthor: 'B', coverId: null },
      },
    ]);

    const result = await ReadingStatusService.getMyBooks('user-1');

    expect(result.reading).toHaveLength(1);
    expect(result.completed).toHaveLength(1);
  });
});
