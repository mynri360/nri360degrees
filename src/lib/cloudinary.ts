/**
 * Cloudinary Integration Utility for NRI360
 * Key Name: NRI360
 * Cloud Name: cjf0l3ew
 */

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env["VITE_CLOUDINARY_CLOUD_NAME"] || "cjf0l3ew",
  apiKey: import.meta.env["VITE_CLOUDINARY_API_KEY"] || "515462529238595",
  apiSecret: import.meta.env["VITE_CLOUDINARY_API_SECRET"] || import.meta.env["CLOUDINARY_API_SECRET"] || "j9bA2euw-fP8aX6_bf5DLg5Jpbk",
  baseUrl: `https://res.cloudinary.com/${import.meta.env["VITE_CLOUDINARY_CLOUD_NAME"] || "cjf0l3ew"}`,
};

export type CloudinaryTransformOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb" | "crop" | "pad";
  quality?: "auto" | number | string;
  format?: "auto" | "webp" | "jpg" | "png" | "avif";
  gravity?: "auto" | "face" | "center";
  aspectRatio?: string;
  blur?: number;
  effect?: string;
  customTransform?: string;
};

/**
 * Builds an optimized Cloudinary delivery URL for an asset.
 * 
 * @param publicId - The public ID or path of the asset in Cloudinary
 * @param options - Transformation options (width, height, crop, format, quality)
 * @returns Fully formatted Cloudinary URL
 * 
 * Example usage:
 * getCloudinaryUrl("nri360/hero-banner", { width: 1200, height: 630, crop: "fill" })
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!publicId) return "";
  
  // If a full HTTP/HTTPS URL is provided, return it directly if it's not a raw path
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
    gravity,
    aspectRatio,
    blur,
    effect,
    customTransform,
  } = options;

  const transforms: string[] = [`f_${format}`, `q_${quality}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);
  if (gravity) transforms.push(`g_${gravity}`);
  if (aspectRatio) transforms.push(`ar_${aspectRatio}`);
  if (blur) transforms.push(`e_blur:${blur}`);
  if (effect) transforms.push(`e_${effect}`);
  if (customTransform) transforms.push(customTransform);

  const transformString = transforms.join(",");
  const cleanPublicId = publicId.replace(/^\//, "");

  return `${CLOUDINARY_CONFIG.baseUrl}/image/upload/${transformString}/${cleanPublicId}`;
}

/**
 * Convenience helper to format responsive Cloudinary image srcSet
 */
export function getCloudinarySrcSet(
  publicId: string,
  widths: number[] = [400, 800, 1200, 1600],
  options: Omit<CloudinaryTransformOptions, "width"> = {}
): string {
  return widths
    .map((w) => `${getCloudinaryUrl(publicId, { ...options, width: w })} ${w}w`)
    .join(", ");
}

/**
 * Computes SHA-1 hex hash for Cloudinary API signature generation in browser.
 */
async function sha1Hex(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Cloudinary primary upload provider supporting signed uploads (API key/secret) and unsigned presets.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  uploadPreset?: string,
  folder: string = "nri360"
): Promise<{ url: string; publicId: string; secureUrl: string }> {
  // 1. Primary: Signed Upload using Cloudinary API credentials
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
    const signature = await sha1Hex(stringToSign);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", CLOUDINARY_CONFIG.apiKey);
    formData.append("timestamp", timestamp);
    formData.append("folder", folder);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        url: data.url,
        publicId: data.public_id,
        secureUrl: data.secure_url || data.url,
      };
    }
  } catch (signedErr) {
    console.warn("Cloudinary signed upload attempt warning:", signedErr);
  }

  // 2. Secondary: Unsigned upload with candidate presets
  const envPreset = import.meta.env["VITE_CLOUDINARY_UPLOAD_PRESET"];
  const presetsToTry: string[] = [
    envPreset,
    uploadPreset,
    "nri360_unsigned",
    "nri360_preset",
    "nri360",
    "ml_default"
  ].filter((p): p is string => Boolean(p && p.trim()));

  const uniquePresets = Array.from(new Set(presetsToTry));
  let lastError: Error | null = null;

  for (const preset of uniquePresets) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);
      formData.append("folder", folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.url,
          publicId: data.public_id,
          secureUrl: data.secure_url || data.url,
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        lastError = new Error(
          errorData.error?.message || `Cloudinary upload failed for preset '${preset}' with status ${response.status}`
        );
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to upload media to Cloudinary");
}
