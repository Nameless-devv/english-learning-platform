import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    A1: 'bg-green-100 text-green-800',
    A2: 'bg-blue-100 text-blue-800',
    B1: 'bg-yellow-100 text-yellow-800',
    B2: 'bg-orange-100 text-orange-800',
    C1: 'bg-red-100 text-red-800',
    C2: 'bg-purple-100 text-purple-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}
