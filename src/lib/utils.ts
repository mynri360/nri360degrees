import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
  Safe localStorage setItem wrapper.
  Guarantees QuotaExceededError or DOMException never crashes application execution.
 */
export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (_err) {
    // If quota exceeded or storage blocked, clean up heavy legacy keys safely
    safeClearLegacyCMSCache();
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (_retryErr) {
      // Graceful fallback — do not throw exception or disrupt app execution
      return false;
    }
  }
}

/**
  Safe localStorage getItem wrapper.
  Returns null if storage is restricted or throws.
 */
export function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch (_err) {
    return null;
  }
}

/**
  Safe localStorage removeItem wrapper.
 */
export function safeRemoveItem(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (_err) {
    return false;
  }
}

/**
  Safely removes legacy heavy CMS cache entries from localStorage to free up quota.
  Does NOT touch actual backend database data.
 */
export function safeClearLegacyCMSCache(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        k !== "nri360_active_cms_cache" &&
        k !== "nri360_admin_password_hash" &&
        (k.startsWith("nri360_cms_") || k === "nri360_cms_data_v2" || k === "nri360_cms_data")
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (_e) {}
    });
  } catch (_err) {}
}
