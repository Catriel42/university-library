import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatDate(
  date: string | Date,
  style: 'short' | 'long' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (style === 'short') {
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
