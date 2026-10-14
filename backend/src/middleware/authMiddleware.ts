import type { Request, Response, NextFunction } from 'express';
import { ErrorCode, type UserDTO } from '@university-library/shared';
import { verifyToken } from '../lib/jwt.js';
import { AUTH_COOKIE_NAME } from '../lib/cookies.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserDTO;
    }
  }
}

function extractToken(req: Request): string | null {
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required to access this resource',
      },
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Invalid or expired authentication session',
      },
    });
    return;
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
  };

  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
    }
  }

  next();
}
