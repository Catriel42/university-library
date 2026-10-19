import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ErrorCode } from '@university-library/shared';
import { LoanService, LoanError } from '../services/LoanService.js';

const borrowSchema = z.object({
  workKey: z.string().trim().min(1, 'workKey is required'),
});

async function borrow(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      },
    });
    return;
  }

  const parsed = borrowSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: parsed.error.issues[0]?.message || 'Invalid borrow parameters',
      },
    });
    return;
  }

  try {
    const loan = await LoanService.borrowBook(userId, parsed.data.workKey);
    res.status(201).json({ loan });
  } catch (error: unknown) {
    if (error instanceof LoanError) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }
    next(error);
  }
}

async function getMyLoans(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      },
    });
    return;
  }

  const statusQuery =
    typeof req.query.status === 'string'
      ? req.query.status.toUpperCase()
      : undefined;
  const status =
    statusQuery === 'ACTIVE' || statusQuery === 'RETURNED'
      ? statusQuery
      : undefined;

  try {
    const loans = await LoanService.getUserLoans(userId, status);
    res.json({ loans });
  } catch (error: unknown) {
    next(error);
  }
}

async function returnBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      },
    });
    return;
  }

  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: 'Loan id is required',
      },
    });
    return;
  }

  try {
    const loan = await LoanService.returnLoan(userId, id);
    res.json({ loan });
  } catch (error: unknown) {
    if (error instanceof LoanError) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }
    next(error);
  }
}

async function renew(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      },
    });
    return;
  }

  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: 'Loan id is required',
      },
    });
    return;
  }

  try {
    const loan = await LoanService.renewLoan(userId, id);
    res.json({ loan });
  } catch (error: unknown) {
    if (error instanceof LoanError) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }
    next(error);
  }
}

export const LoanController = {
  borrow,
  getMyLoans,
  returnBook,
  renew,
};
