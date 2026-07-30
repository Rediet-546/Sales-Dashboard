import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiBaseUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!rawUrl) {
    return 'http://localhost:5000/api';
  }

  const normalizedUrl = rawUrl.replace(/\/$/, '');

  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
}
