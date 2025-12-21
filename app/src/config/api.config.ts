import {
  EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
} from "@env";

/**
 * API Configuration
 *
 * Backend URL is now loaded from environment variables (.env file)
 *
 * To change the backend URL:
 * 1. Update the .env file in the project root
 * 2. Restart the Expo development server
 *
 * Environment-specific URLs:
 * - iOS Simulator: http://localhost:8000
 * - Android Emulator: http://10.0.2.2:8000
 * - Physical Device: http://YOUR_LOCAL_IP:8000
 * - Production: https://your-api.com
 */

export const API_CONFIG = {
  // Backend URL from environment variable with fallback
  BACKEND_URL: EXPO_PUBLIC_API_URL || "http://localhost:8000",

  // API prefix (usually '/api')
  API_PREFIX: "/api",

  // Request timeout in milliseconds
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

// Helper to get full API URL
export const getApiUrl = () => {
  return `${API_CONFIG.BACKEND_URL}${API_CONFIG.API_PREFIX}`;
};
