// API Configuration
// Update this file to change the backend URL for different environments

/**
 * Backend URL Configuration
 * 
 * IMPORTANT: Update this constant based on your environment:
 * 
 * LOCAL DEVELOPMENT:
 * - iOS Simulator: 'http://localhost:8000'
 * - Android Emulator: 'http://10.0.2.2:8000'
 * - Physical Device: 'http://YOUR_LOCAL_IP:8000' (get IP with ifconfig/ipconfig)
 * 
 * PRODUCTION:
 * - Use your deployed backend URL: 'https://your-api.com'
 * 
 * Make sure your backend CORS settings allow requests from your device/emulator.
 */

export const API_CONFIG = {
  // Change this to your backend URL
  BACKEND_URL: 'http://localhost:8000',
  
  // API prefix (usually '/api')
  API_PREFIX: '/api',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
};

// Helper to get full API URL
export const getApiUrl = () => {
  return `${API_CONFIG.BACKEND_URL}${API_CONFIG.API_PREFIX}`;
};
