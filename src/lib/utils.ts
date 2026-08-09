import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: string | number, currencyCode: string = "PKR"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `Rs. 0`;
  const formatted = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(num);
  return `Rs. ${formatted}`;
}

export function calculateDiscount(priceAmount: string | number, compareAtAmount?: string | number | null): number {
  if (!compareAtAmount) return 0;
  const p = typeof priceAmount === "string" ? parseFloat(priceAmount) : priceAmount;
  const c = typeof compareAtAmount === "string" ? parseFloat(compareAtAmount) : compareAtAmount;
  if (isNaN(p) || isNaN(c) || c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
