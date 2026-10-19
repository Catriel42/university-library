import bcrypt from 'bcryptjs';
import {
  ErrorCode,
  type RegisterRequestDTO,
  type LoginRequestDTO,
  type UserDTO,
} from '@university-library/shared';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';

export class AuthError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

const BCRYPT_SALT_ROUNDS = 10;

async function register(
  data: RegisterRequestDTO
): Promise<{ user: UserDTO; token: string }> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const trimmedName = data.name.trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AuthError(
      ErrorCode.EMAIL_IN_USE,
      'An account with this email address already exists.',
      409
    );
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const token = signToken({
    sub: newUser.id,
    email: newUser.email,
    name: newUser.name,
  });

  return {
    user: newUser,
    token,
  };
}

async function login(
  data: LoginRequestDTO
): Promise<{ user: UserDTO; token: string }> {
  const normalizedEmail = data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AuthError(
      ErrorCode.INVALID_CREDENTIALS,
      'Invalid email or password.',
      401
    );
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AuthError(
      ErrorCode.INVALID_CREDENTIALS,
      'Invalid email or password.',
      401
    );
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}

async function getCurrentUser(userId: string): Promise<UserDTO> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new AuthError(
      ErrorCode.UNAUTHORIZED,
      'User session is no longer active.',
      401
    );
  }

  return user;
}

export const AuthService = {
  register,
  login,
  getCurrentUser,
};
