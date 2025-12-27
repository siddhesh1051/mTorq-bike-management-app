import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_REDIRECT_URI,
} from "@env";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google OAuth Client ID (Web client ID from Firebase Console)
// Get this from: Firebase Console > Authentication > Sign-in method > Google > Web client ID
export const GOOGLE_CLIENT_ID = EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";

// Google OAuth Redirect URI (must be HTTPS)
// For development: Use Expo proxy URL or custom HTTPS domain
// Format: https://auth.expo.io/@username/slug or https://yourdomain.com/auth
export const GOOGLE_REDIRECT_URI = EXPO_PUBLIC_GOOGLE_REDIRECT_URI || "";

export default app;
