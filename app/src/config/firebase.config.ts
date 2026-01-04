import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_GOOGLE_CLIENT_ID,
} from "@env";

// Import getReactNativePersistence from the React Native specific bundle
// This is exported when the metro bundler resolves for React Native platform
// @ts-ignore - Type definitions don't include RN-specific exports
import { getReactNativePersistence } from "@firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase - check if already initialized to prevent duplicate app errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with React Native persistence
// This ensures the auth state persists across app restarts
// Using a function to handle the initialization safely
const initializeAuthWithPersistence = () => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // If auth is already initialized (e.g., during hot reload), get the existing instance
    if (error.code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw error;
  }
};

export const auth = initializeAuthWithPersistence();
export const db = getFirestore(app);

// Google OAuth Client ID (Web client ID - used for native Google Sign-In)
// For Android: Use Web client ID (525146398554-8jakei2tm0uq5hv03a0552hcnq3addn8.apps.googleusercontent.com)
// For iOS: iOS client ID is configured in app.json plugin (iosUrlScheme)
export const GOOGLE_CLIENT_ID = EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export default app;
