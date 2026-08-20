import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (_err) {
    try {
      // Clean up legacy or duplicate storage keys silently
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== key && (k.startsWith("nri360_") || k.includes("cms"))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(key, value);
      return true;
    } catch (_retryErr) {
      // If setting full CMS data fails due to size, store a lightweight fallback copy
      if (key === "nri360_cms_data_v2") {
        try {
          const parsed = JSON.parse(value);
          const slimmed = {
            ...parsed,
            about: {
              ...parsed.about,
              gallery: [],
            },
          };
          localStorage.setItem(key, JSON.stringify(slimmed));
          return true;
        } catch (_slimErr) {
          // Graceful fallback — Firebase RTDB handles the complete remote state
        }
      }
      return false;
    }
  }
}

export function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch (_err) {
    return null;
  }
}

