import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: string | number, currencyCode: string = "PKR"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num) || num < 0) return `Rs. 0`;
  const formatted = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(num);
  return `Rs. ${formatted}`;
}

export function hasCompareAtDiscount(
  priceAmount: string | number | null | undefined,
  compareAtAmount: string | number | null | undefined
): boolean {
  if (!compareAtAmount || !priceAmount) return false;
  const p = typeof priceAmount === "string" ? parseFloat(priceAmount) : priceAmount;
  const c = typeof compareAtAmount === "string" ? parseFloat(compareAtAmount) : compareAtAmount;
  if (isNaN(p) || isNaN(c)) return false;
  return c > p && c > 0 && p > 0;
}

export function calculateDiscount(
  priceAmount: string | number | null | undefined,
  compareAtAmount: string | number | null | undefined
): number {
  if (!hasCompareAtDiscount(priceAmount, compareAtAmount)) return 0;
  const p = typeof priceAmount === "string" ? parseFloat(priceAmount) : priceAmount;
  const c = typeof compareAtAmount === "string" ? parseFloat(compareAtAmount) : compareAtAmount;
  return Math.round(((c - p) / c) * 100);
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Optimizes an image URL for Shopify CDN or Unsplash to specify dimension limits and web formatting.
 */
export function getOptimizedImageUrl(url: string | null | undefined, width: number = 600): string {
  if (!url) return "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80";

  // Shopify CDN
  if (url.includes("cdn.shopify.com") || url.includes("shopify.com")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("width", width.toString());
      return parsed.toString();
    } catch {
      if (url.includes("?")) {
        return url.replace(/([?&])width=\d+/, "$1").replace(/([?&])w=\d+/, "$1") + `&width=${width}`;
      }
      return `${url}?width=${width}`;
    }
  }

  // Unsplash CDN
  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("w", width.toString());
      parsed.searchParams.set("q", "80");
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Generates a responsive srcset string for Shopify / Unsplash images.
 */
export function getImageSrcSet(url: string | null | undefined, widths: number[] = [300, 600, 900, 1200]): string {
  if (!url) return "";
  return widths.map((w) => `${getOptimizedImageUrl(url, w)} ${w}w`).join(", ");
}
