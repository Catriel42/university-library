import type { Request, Response, NextFunction } from 'express';
import {
  ErrorCode,
  setReadingStatusSchema,
  type ReadingStatus,
} from '@university-library/shared';
import { ReadingStatusService } from '../services/ReadingStatusService.js';

async function setStatus(
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

  const { workKey } = req.params;
  if (!workKey) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: 'workKey is required',
      },
    });
    return;
  }

  const parsed = setReadingStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message:
          parsed.error.issues[0]?.message || 'Invalid reading status value',
      },
    });
    return;
  }

  try {
    const record = await ReadingStatusService.setStatus(
      userId,
      workKey,
      parsed.data.status as ReadingStatus
    );
    res.json({ readingStatus: record });
  } catch (error: unknown) {
    next(error);
  }
}

async function clearStatus(
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

  const { workKey } = req.params;
  if (!workKey) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: 'workKey is required',
      },
    });
    return;
  }

  try {
    await ReadingStatusService.clearStatus(userId, workKey);
    res.json({ message: 'Reading status cleared successfully' });
  } catch (error: unknown) {
    next(error);
  }
}

async function getMyBooks(
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

  try {
    const myBooks = await ReadingStatusService.getMyBooks(userId);
    res.json(myBooks);
  } catch (error: unknown) {
    next(error);
  }
}

async function getStatusForWork(
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

  const { workKey } = req.params;
  if (!workKey) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: 'workKey is required',
      },
    });
    return;
  }

  try {
    const status = await ReadingStatusService.getStatusForWork(userId, workKey);
    res.json({ status });
  } catch (error: unknown) {
    next(error);
  }
}

export const ReadingStatusController = {
  setStatus,
  clearStatus,
  getMyBooks,
  getStatusForWork,
};
