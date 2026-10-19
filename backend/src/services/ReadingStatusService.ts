import {
  ReadingStatus,
  type ReadingStatusDTO,
  type ReadingStatusGroupDTO,
} from '@university-library/shared';
import { prisma } from '../lib/prisma.js';
import { OpenLibraryService } from './OpenLibraryService.js';
import type { ReadingState } from '@prisma/client';

const DEFAULT_COPIES = Number(process.env.DEFAULT_COPIES) || 3;
const WORK_KEY_PREFIX = /^\/works\//;

const toCleanKey = (key: string): string => key.replace(WORK_KEY_PREFIX, '');

function mapReadingStatusToDTO(record: {
  id: string;
  userId: string;
  workId: string;
  status: ReadingState;
  updatedAt: Date;
  work: {
    title: string;
    firstAuthor: string | null;
    coverId: number | null;
  };
}): ReadingStatusDTO {
  return {
    id: record.id,
    userId: record.userId,
    workId: record.workId,
    title: record.work.title,
    firstAuthor: record.work.firstAuthor ?? undefined,
    coverId: record.work.coverId ?? undefined,
    status: record.status as unknown as ReadingStatus,
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function setStatus(
  userId: string,
  workKey: string,
  status: ReadingStatus
): Promise<ReadingStatusDTO> {
  const cleanKey = toCleanKey(workKey);

  let work = await prisma.work.findUnique({
    where: { id: cleanKey },
  });

  if (!work) {
    let title = cleanKey;
    let coverId: number | null = null;
    let firstAuthor: string | null = null;

    try {
      const olWork = await OpenLibraryService.getWorkDetails(cleanKey);
      title = olWork.title;
      coverId = olWork.covers?.[0] ?? null;
    } catch {
      title = cleanKey;
    }

    work = await prisma.work.create({
      data: {
        id: cleanKey,
        title,
        coverId,
        firstAuthor,
        copies: DEFAULT_COPIES,
      },
    });
  }

  const record = await prisma.readingStatus.upsert({
    where: {
      userId_workId: {
        userId,
        workId: cleanKey,
      },
    },
    create: {
      userId,
      workId: cleanKey,
      status: status as unknown as ReadingState,
    },
    update: {
      status: status as unknown as ReadingState,
    },
    include: {
      work: true,
    },
  });

  return mapReadingStatusToDTO(record);
}

async function clearStatus(userId: string, workKey: string): Promise<void> {
  const cleanKey = toCleanKey(workKey);

  await prisma.readingStatus.deleteMany({
    where: {
      userId,
      workId: cleanKey,
    },
  });
}

async function getMyBooks(userId: string): Promise<ReadingStatusGroupDTO> {
  const records = await prisma.readingStatus.findMany({
    where: { userId },
    include: { work: true },
    orderBy: { updatedAt: 'desc' },
  });

  const reading: ReadingStatusDTO[] = [];
  const completed: ReadingStatusDTO[] = [];

  for (const record of records) {
    const dto = mapReadingStatusToDTO(record);
    if (record.status === 'READING') {
      reading.push(dto);
    } else if (record.status === 'COMPLETED') {
      completed.push(dto);
    }
  }

  return { reading, completed };
}

async function getStatusForWork(
  userId: string,
  workKey: string
): Promise<ReadingStatus | null> {
  const cleanKey = toCleanKey(workKey);

  const record = await prisma.readingStatus.findUnique({
    where: {
      userId_workId: {
        userId,
        workId: cleanKey,
      },
    },
  });

  return record ? (record.status as unknown as ReadingStatus) : null;
}

export const ReadingStatusService = {
  setStatus,
  clearStatus,
  getMyBooks,
  getStatusForWork,
};
