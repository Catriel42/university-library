import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: { sub: string; email: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
