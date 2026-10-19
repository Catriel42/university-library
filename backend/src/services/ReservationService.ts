import { ErrorCode, type ReservationDTO } from '@university-library/shared';
import { prisma } from '../lib/prisma.js';
import { OpenLibraryService } from './OpenLibraryService.js';
import type { Prisma } from '@prisma/client';

export class ReservationError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ReservationError';
  }
}

const DEFAULT_COPIES = Number(process.env.DEFAULT_COPIES) || 3;
const HOLD_WINDOW_HOURS = Number(process.env.HOLD_WINDOW_HOURS) || 48;
const WORK_KEY_PREFIX = /^\/works\//;

const toCleanKey = (key: string): string => key.replace(WORK_KEY_PREFIX, '');

async function lazyExpireHolds(
  tx: Prisma.TransactionClient,
  workId: string,
  now: Date
): Promise<void> {
  const expiredHolds = await tx.reservation.findMany({
    where: {
      workId,
      status: 'HOLD',
      holdExpiresAt: { lte: now },
    },
  });

  for (const hold of expiredHolds) {
    await tx.reservation.update({
      where: { id: hold.id },
      data: { status: 'CANCELLED' },
    });

    const nextPending = await tx.reservation.findFirst({
      where: {
        workId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
    });

    if (nextPending) {
      const holdExpiresAt = new Date(
        now.getTime() + HOLD_WINDOW_HOURS * 60 * 60 * 1000
      );
      await tx.reservation.update({
        where: { id: nextPending.id },
        data: {
          status: 'HOLD',
          holdExpiresAt,
        },
      });
    }
  }
}

function mapReservationToDTO(
  reservation: {
    id: string;
    userId: string;
    workId: string;
    createdAt: Date;
    status: 'PENDING' | 'HOLD' | 'FULFILLED' | 'CANCELLED';
    holdExpiresAt: Date | null;
    work: {
      title: string;
      firstAuthor: string | null;
      coverId: number | null;
    };
  },
  queuePosition?: number,
  now: Date = new Date()
): ReservationDTO {
  let hoursRemaining: number | undefined = undefined;

  if (reservation.status === 'HOLD' && reservation.holdExpiresAt) {
    const diffMs = reservation.holdExpiresAt.getTime() - now.getTime();
    hoursRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  }

  return {
    id: reservation.id,
    userId: reservation.userId,
    workId: reservation.workId,
    title: reservation.work.title,
    firstAuthor: reservation.work.firstAuthor ?? undefined,
    coverId: reservation.work.coverId ?? undefined,
    createdAt: reservation.createdAt.toISOString(),
    status: reservation.status,
    queuePosition,
    holdExpiresAt: reservation.holdExpiresAt?.toISOString() ?? null,
    hoursRemaining,
  };
}

async function reserveWork(
  userId: string,
  workKey: string
): Promise<ReservationDTO> {
  const cleanKey = toCleanKey(workKey);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const overdueLoan = await tx.loan.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        dueDate: { lt: now },
      },
    });

    if (overdueLoan) {
      throw new ReservationError(
        ErrorCode.HAS_OVERDUE,
        'Cannot place reservations while you have overdue loans',
        422
      );
    }

    const activeLoan = await tx.loan.findFirst({
      where: {
        userId,
        workId: cleanKey,
        status: 'ACTIVE',
      },
    });

    if (activeLoan) {
      throw new ReservationError(
        ErrorCode.ALREADY_BORROWED,
        'You already have an active loan for this book',
        409
      );
    }

    const existingReservation = await tx.reservation.findFirst({
      where: {
        userId,
        workId: cleanKey,
        status: { in: ['PENDING', 'HOLD'] },
      },
    });

    if (existingReservation) {
      throw new ReservationError(
        ErrorCode.ALREADY_RESERVED,
        'You already have an active reservation for this book',
        409
      );
    }

    let work = await tx.work.findUnique({
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

      work = await tx.work.create({
        data: {
          id: cleanKey,
          title,
          coverId,
          firstAuthor,
          copies: DEFAULT_COPIES,
        },
      });
    }

    await lazyExpireHolds(tx, cleanKey, now);

    const activeLoansCount = await tx.loan.count({
      where: {
        workId: cleanKey,
        status: 'ACTIVE',
      },
    });

    const activeHoldsCount = await tx.reservation.count({
      where: {
        workId: cleanKey,
        status: 'HOLD',
        holdExpiresAt: { gt: now },
      },
    });

    const availableCopies = work.copies - activeLoansCount - activeHoldsCount;
    if (availableCopies > 0) {
      throw new ReservationError(
        ErrorCode.CANNOT_RESERVE_AVAILABLE,
        'Copies of this book are currently available to borrow directly',
        400
      );
    }

    const newReservation = await tx.reservation.create({
      data: {
        userId,
        workId: cleanKey,
        status: 'PENDING',
        createdAt: now,
      },
      include: {
        work: true,
      },
    });

    const queuePosition = await tx.reservation.count({
      where: {
        workId: cleanKey,
        status: 'PENDING',
        createdAt: { lte: now },
      },
    });

    return mapReservationToDTO(newReservation, queuePosition, now);
  });
}

async function getMyReservations(userId: string): Promise<ReservationDTO[]> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const userReservations = await tx.reservation.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'HOLD'] },
      },
      include: {
        work: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const results: ReservationDTO[] = [];

    for (const res of userReservations) {
      await lazyExpireHolds(tx, res.workId, now);

      const refreshed = await tx.reservation.findUnique({
        where: { id: res.id },
        include: { work: true },
      });

      if (!refreshed || refreshed.status === 'CANCELLED') {
        continue;
      }

      let position: number | undefined = undefined;
      if (refreshed.status === 'PENDING') {
        position = await tx.reservation.count({
          where: {
            workId: refreshed.workId,
            status: 'PENDING',
            createdAt: { lte: refreshed.createdAt },
          },
        });
      }

      results.push(mapReservationToDTO(refreshed, position, now));
    }

    return results;
  });
}

async function cancelReservation(
  userId: string,
  reservationId: string
): Promise<void> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new ReservationError(
        ErrorCode.RESERVATION_NOT_FOUND,
        'Reservation not found',
        404
      );
    }

    if (reservation.userId !== userId) {
      throw new ReservationError(
        ErrorCode.UNAUTHORIZED,
        'You can only cancel your own reservations',
        403
      );
    }

    if (reservation.status !== 'PENDING' && reservation.status !== 'HOLD') {
      throw new ReservationError(
        ErrorCode.BAD_REQUEST,
        'Reservation is already inactive',
        400
      );
    }

    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    });

    if (reservation.status === 'HOLD') {
      const nextPending = await tx.reservation.findFirst({
        where: {
          workId: reservation.workId,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'asc' },
      });

      if (nextPending) {
        const holdExpiresAt = new Date(
          now.getTime() + HOLD_WINDOW_HOURS * 60 * 60 * 1000
        );
        await tx.reservation.update({
          where: { id: nextPending.id },
          data: {
            status: 'HOLD',
            holdExpiresAt,
          },
        });
      }
    }
  });
}

export const ReservationService = {
  reserveWork,
  getMyReservations,
  cancelReservation,
};
