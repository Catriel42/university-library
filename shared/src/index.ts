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
  UNAUTHORIZED = 'UNAUTHORIZED',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// Reading Status matches backend/prisma schema enum ReadingState
export enum ReadingStatus {
  READING = 'READING',
  COMPLETED = 'COMPLETED'
}

// Data Transfer Objects (DTOs)
export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

export interface WorkDTO {
  id: string; // Open Library key
  title: string;
  firstAuthor?: string;
  coverId?: number;
  totalCopies: number;
  availableCopies: number;
}
