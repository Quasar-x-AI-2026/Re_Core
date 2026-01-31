import { clsx } from "clsx";
// twMerge resolves Tailwind class conflicts
// (e.g., "p-2 p-4" → "p-4")
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
