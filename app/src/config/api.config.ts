import {
  EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
} from "@env";

/**
 * API Configuration
 *
 * Note: Backend has been migrated to Firebase.
 * This file now only contains Cloudinary configuration.
 */

export const API_CONFIG = {
  // Legacy config - no longer used (kept for compatibility)
  BACKEND_URL: "",
  API_PREFIX: "",
  TIMEOUT: 300000,
};

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  UPLOAD_PRESET: EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "mtorq_documents",
  UPLOAD_URL: `https://api.cloudinary.com/v1_1/${
    EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
  }/raw/upload`,
};

// Helper to get full API URL (legacy - no longer used)
export const getApiUrl = () => {
  return "";
};
