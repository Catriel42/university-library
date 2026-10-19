import type { Request, Response, NextFunction } from 'express';
import { ErrorCode, createReservationSchema } from '@university-library/shared';
import {
  ReservationService,
  ReservationError,
} from '../services/ReservationService.js';

async function createReservation(
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

  const parsed = createReservationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message:
          parsed.error.issues[0]?.message ||
          'Invalid reservation request format',
      },
    });
    return;
  }

  try {
    const reservation = await ReservationService.reserveWork(
      userId,
      parsed.data.workKey
    );
    res.status(201).json({ reservation });
  } catch (error: unknown) {
    if (error instanceof ReservationError) {
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

async function getMyReservations(
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
    const reservations = await ReservationService.getMyReservations(userId);
    res.json({ reservations });
  } catch (error: unknown) {
    next(error);
  }
}

async function cancelReservation(
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
        message: 'Reservation id is required',
      },
    });
    return;
  }

  try {
    await ReservationService.cancelReservation(userId, id);
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error: unknown) {
    if (error instanceof ReservationError) {
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

export const ReservationController = {
  createReservation,
  getMyReservations,
  cancelReservation,
};
