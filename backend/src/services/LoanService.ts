import { ErrorCode, type LoanDTO } from '@university-library/shared';
import { prisma } from '../lib/prisma.js';
import { OpenLibraryService } from './OpenLibraryService.js';

export class LoanError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'LoanError';
  }
}

const DEFAULT_COPIES = Number(process.env.DEFAULT_COPIES) || 3;
const LOAN_PERIOD_DAYS = Number(process.env.LOAN_PERIOD_DAYS) || 14;
const MAX_ACTIVE_LOANS = Number(process.env.MAX_ACTIVE_LOANS) || 5;
const HOLD_WINDOW_HOURS = Number(process.env.HOLD_WINDOW_HOURS) || 48;
const MAX_RENEWALS = Number(process.env.MAX_RENEWALS) || 2;
const RENEWAL_EXTENSION_DAYS = Number(process.env.RENEWAL_EXTENSION_DAYS) || 7;
const WORK_KEY_PREFIX = /^\/works\//;

const toCleanKey = (key: string): string => key.replace(WORK_KEY_PREFIX, '');

function mapLoanToDTO(
  loan: {
    id: string;
    userId: string;
    workId: string;
    borrowedAt: Date;
    dueDate: Date;
    returnedAt: Date | null;
    status: 'ACTIVE' | 'RETURNED';
    renewals: number;
    work: {
      id: string;
      title: string;
      firstAuthor: string | null;
      coverId: number | null;
    };
  },
  now: Date = new Date()
): LoanDTO {
  let daysRemaining: number | undefined = undefined;
  let daysOverdue: number | undefined = undefined;

  if (loan.status === 'ACTIVE') {
    const diffMs = loan.dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays >= 0) {
      daysRemaining = diffDays;
    } else {
      daysRemaining = 0;
      daysOverdue = Math.abs(diffDays);
    }
  }

  return {
    id: loan.id,
    userId: loan.userId,
    workId: loan.workId,
    title: loan.work.title,
    firstAuthor: loan.work.firstAuthor ?? undefined,
    coverId: loan.work.coverId ?? undefined,
    borrowedAt: loan.borrowedAt.toISOString(),
    dueDate: loan.dueDate.toISOString(),
    returnedAt: loan.returnedAt?.toISOString() ?? null,
    status: loan.status,
    renewals: loan.renewals,
    daysRemaining,
    daysOverdue,
  };
}

async function borrowBook(userId: string, workKey: string): Promise<LoanDTO> {
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
      throw new LoanError(
        ErrorCode.HAS_OVERDUE,
        'Cannot borrow books while you have overdue loans',
        422
      );
    }

    const activeLoansCount = await tx.loan.count({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (activeLoansCount >= MAX_ACTIVE_LOANS) {
      throw new LoanError(
        ErrorCode.LOAN_LIMIT,
        `Maximum limit of ${MAX_ACTIVE_LOANS} active loans reached`,
        422
      );
    }

    const existingActiveLoan = await tx.loan.findFirst({
      where: {
        userId,
        workId: cleanKey,
        status: 'ACTIVE',
      },
    });

    if (existingActiveLoan) {
      throw new LoanError(
        ErrorCode.ALREADY_BORROWED,
        'You already have an active loan for this book',
        409
      );
    }

    const existingReservation = await tx.reservation.findFirst({
      where: {
        userId,
        workId: cleanKey,
        status: 'PENDING',
      },
    });

    if (existingReservation) {
      throw new LoanError(
        ErrorCode.ALREADY_BORROWED,
        'You already have a pending reservation for this book',
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

    const workActiveLoansCount = await tx.loan.count({
      where: {
        workId: cleanKey,
        status: 'ACTIVE',
      },
    });

    const activeHolds = await tx.reservation.findMany({
      where: {
        workId: cleanKey,
        status: 'HOLD',
        holdExpiresAt: { gt: now },
      },
    });

    const userHold = activeHolds.find((h) => h.userId === userId);
    const availableForEveryone =
      work.copies - workActiveLoansCount - activeHolds.length;

    if (userHold) {
      await tx.reservation.update({
        where: { id: userHold.id },
        data: { status: 'FULFILLED' },
      });
    } else {
      if (availableForEveryone <= 0) {
        throw new LoanError(
          ErrorCode.NO_COPIES,
          'No copies of this book are currently available to borrow',
          409
        );
      }
    }

    const dueDate = new Date(
      now.getTime() + LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000
    );

    const newLoan = await tx.loan.create({
      data: {
        userId,
        workId: cleanKey,
        borrowedAt: now,
        dueDate,
        status: 'ACTIVE',
        renewals: 0,
      },
      include: {
        work: true,
      },
    });

    return mapLoanToDTO(newLoan, now);
  });
}

async function getUserLoans(
  userId: string,
  filterStatus?: 'ACTIVE' | 'RETURNED'
): Promise<LoanDTO[]> {
  const now = new Date();

  const loans = await prisma.loan.findMany({
    where: {
      userId,
      ...(filterStatus ? { status: filterStatus } : {}),
    },
    include: {
      work: true,
    },
    orderBy:
      filterStatus === 'RETURNED' ? { returnedAt: 'desc' } : { dueDate: 'asc' },
  });

  return loans.map((l) => mapLoanToDTO(l, now));
}

async function returnLoan(userId: string, loanId: string): Promise<LoanDTO> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: { id: loanId },
      include: { work: true },
    });

    if (!loan) {
      throw new LoanError(ErrorCode.BAD_REQUEST, 'Loan not found', 404);
    }

    if (loan.userId !== userId) {
      throw new LoanError(
        ErrorCode.UNAUTHORIZED,
        'You can only return your own loans',
        403
      );
    }

    if (loan.status === 'RETURNED') {
      throw new LoanError(
        ErrorCode.BAD_REQUEST,
        'This loan has already been returned',
        400
      );
    }

    const updatedLoan = await tx.loan.update({
      where: { id: loanId },
      data: {
        status: 'RETURNED',
        returnedAt: now,
      },
      include: { work: true },
    });

    const nextPendingReservation = await tx.reservation.findFirst({
      where: {
        workId: loan.workId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
    });

    if (nextPendingReservation) {
      const holdExpiresAt = new Date(
        now.getTime() + HOLD_WINDOW_HOURS * 60 * 60 * 1000
      );
      await tx.reservation.update({
        where: { id: nextPendingReservation.id },
        data: {
          status: 'HOLD',
          holdExpiresAt,
        },
      });
    }

    return mapLoanToDTO(updatedLoan, now);
  });
}

async function renewLoan(userId: string, loanId: string): Promise<LoanDTO> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: { id: loanId },
      include: { work: true },
    });

    if (!loan) {
      throw new LoanError(ErrorCode.BAD_REQUEST, 'Loan not found', 404);
    }

    if (loan.userId !== userId) {
      throw new LoanError(
        ErrorCode.UNAUTHORIZED,
        'You can only renew your own loans',
        403
      );
    }

    if (loan.status !== 'ACTIVE') {
      throw new LoanError(
        ErrorCode.RENEWAL_BLOCKED,
        'Only active loans can be renewed',
        400
      );
    }

    if (loan.renewals >= MAX_RENEWALS) {
      throw new LoanError(
        ErrorCode.RENEWAL_LIMIT,
        `This loan has already been renewed the maximum allowed (${MAX_RENEWALS}) times`,
        422
      );
    }

    if (now.getTime() > loan.dueDate.getTime()) {
      throw new LoanError(
        ErrorCode.RENEWAL_BLOCKED,
        'Overdue loans cannot be renewed. Please return the book.',
        422
      );
    }

    const activeReservation = await tx.reservation.findFirst({
      where: {
        workId: loan.workId,
        userId: { not: userId },
        status: { in: ['PENDING', 'HOLD'] },
      },
    });

    if (activeReservation) {
      throw new LoanError(
        ErrorCode.RENEWAL_BLOCKED,
        'This book cannot be renewed because another reader has a pending reservation on it',
        422
      );
    }

    const newDueDate = new Date(
      loan.dueDate.getTime() + RENEWAL_EXTENSION_DAYS * 24 * 60 * 60 * 1000
    );

    const updatedLoan = await tx.loan.update({
      where: { id: loanId },
      data: {
        dueDate: newDueDate,
        renewals: loan.renewals + 1,
      },
      include: { work: true },
    });

    return mapLoanToDTO(updatedLoan, now);
  });
}

export const LoanService = {
  borrowBook,
  getUserLoans,
  returnLoan,
  renewLoan,
};
