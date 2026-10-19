import type { Request, Response, NextFunction } from 'express';
import {
  ErrorCode,
  registerSchema,
  loginSchema,
} from '@university-library/shared';
import { AuthService, AuthError } from '../services/AuthService.js';
import { setAuthCookie, clearAuthCookie } from '../lib/cookies.js';

async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: 'Invalid registration input',
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  try {
    const { user, token } = await AuthService.register(parsed.data);
    setAuthCookie(res, token);
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
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

async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: 'Invalid login credentials format',
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  try {
    const { user, token } = await AuthService.login(parsed.data);
    setAuthCookie(res, token);
    res.status(200).json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
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

async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.status(200).json({
    message: 'Logged out successfully',
  });
}

async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      },
    });
    return;
  }

  try {
    const user = await AuthService.getCurrentUser(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
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

export const AuthController = {
  register,
  login,
  logout,
  me,
};
