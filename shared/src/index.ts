// API Error Response Shape
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// Error Codes based on FR-25
export enum ErrorCode {
  NO_COPIES = 'NO_COPIES',
  LOAN_LIMIT = 'LOAN_LIMIT',
  ALREADY_BORROWED = 'ALREADY_BORROWED',
  HAS_OVERDUE = 'HAS_OVERDUE',
  HOLD_FOR_OTHER = 'HOLD_FOR_OTHER',
  RENEWAL_LIMIT = 'RENEWAL_LIMIT',
  RENEWAL_BLOCKED = 'RENEWAL_BLOCKED',
  ALREADY_RESERVED = 'ALREADY_RESERVED',
  CANNOT_RESERVE_AVAILABLE = 'CANNOT_RESERVE_AVAILABLE',
  RESERVATION_NOT_FOUND = 'RESERVATION_NOT_FOUND',
  INVALID_READING_STATUS = 'INVALID_READING_STATUS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_IN_USE = 'EMAIL_IN_USE',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Reading Status matches backend/prisma schema enum ReadingState
export enum ReadingStatus {
  READING = 'READING',
  COMPLETED = 'COMPLETED',
}

// Data Transfer Objects (DTOs)
export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  user: UserDTO;
}

export interface WorkDTO {
  id: string;
  title: string;
  firstAuthor?: string;
  coverId?: number;
  firstPublishYear?: number;
  totalCopies: number;
  availableCopies: number;
}

export interface SearchResponseDTO {
  numFound: number;
  start: number;
  docs: WorkDTO[];
  authorSortScope?: 'exact' | 'page';
}

export interface BookDetailDTO {
  id: string;
  title: string;
  description?: string;
  covers?: number[];
  coverId?: number;
  subjects?: string[];
  firstAuthor?: string;
  firstPublishYear?: number;
  totalCopies: number;
  availableCopies: number;
  queueLength: number;
  earliestReturnDate?: string | null;
}

export interface LoanDTO {
  id: string;
  userId: string;
  workId: string;
  title: string;
  firstAuthor?: string;
  coverId?: number;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string | null;
  status: 'ACTIVE' | 'RETURNED';
  renewals: number;
  daysRemaining?: number;
  daysOverdue?: number;
}

export interface BorrowRequestDTO {
  workKey: string;
}

export interface ReservationDTO {
  id: string;
  userId: string;
  workId: string;
  title: string;
  firstAuthor?: string;
  coverId?: number;
  createdAt: string;
  status: 'PENDING' | 'HOLD' | 'FULFILLED' | 'CANCELLED';
  queuePosition?: number;
  holdExpiresAt?: string | null;
  hoursRemaining?: number;
}

export interface CreateReservationDTO {
  workKey: string;
}

export interface ReadingStatusDTO {
  id: string;
  userId: string;
  workId: string;
  title: string;
  firstAuthor?: string;
  coverId?: number;
  status: ReadingStatus;
  updatedAt: string;
}

export interface ReadingStatusGroupDTO {
  reading: ReadingStatusDTO[];
  completed: ReadingStatusDTO[];
}

export interface RenewLoanResponseDTO {
  loan: LoanDTO;
}

export * from './schemas/auth.js';
export * from './schemas/reservation.js';
export * from './schemas/readingStatus.js';
