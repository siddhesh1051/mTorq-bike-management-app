import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { User, LoginCredentials, SignupCredentials } from "../types";
import apiService from "../services/api";
import { auth, db, GOOGLE_CLIENT_ID } from "../config/firebase.config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configure Google Sign-In
    const configureGoogleSignIn = async () => {
      try {
        // Use Web client ID for Android (the package uses it for both iOS and Android)
        // For iOS, the iosUrlScheme in app.json handles the URL scheme
        const webClientId =
          GOOGLE_CLIENT_ID ||
          "525146398554-8jakei2tm0uq5hv03a0552hcnq3addn8.apps.googleusercontent.com";

        GoogleSignin.configure({
          webClientId: webClientId, // Required for Android and iOS
          offlineAccess: true, // If you want to access Google API on behalf of the user FROM YOUR SERVER
          scopes: ["profile", "email"],
        });
        console.log("✅ Google Sign-In configured successfully");
      } catch (error) {
        console.error("❌ Error configuring Google Sign-In:", error);
      }
    };

    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userProfile: User = {
              email: userData.email,
              name: userData.name,
              created_at:
                userData.created_at?.toDate?.()?.toISOString() ||
                new Date().toISOString(),
            };
            setUser(userProfile);
            // Store in AsyncStorage for compatibility
            await AsyncStorage.setItem("user", JSON.stringify(userProfile));
            const token = await firebaseUser.getIdToken();
            await AsyncStorage.setItem("token", token);
          } else {
            setUser(null);
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
          }
        } catch (error: any) {
          console.error("❌ Error fetching user profile:", error);
          console.error("Error code:", error?.code);
          console.error("Error message:", error?.message);
          if (error?.code === "permission-denied") {
            console.error(
              "⚠️  Firestore permission denied! Make sure security rules are set up."
            );
            console.error("📖 See FIRESTORE_SETUP.md for instructions");
          }
          setUser(null);
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiService.login(credentials);
    await AsyncStorage.setItem("token", response.access_token);
    await AsyncStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
  };

  const signup = async (credentials: SignupCredentials) => {
    const response = await apiService.signup(credentials);
    await AsyncStorage.setItem("token", response.access_token);
    await AsyncStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
  };

  const loginWithGoogle = async () => {
    try {
      // Check if Google Sign-In is available
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      // Get the ID token from the response (structure: userInfo.data.idToken)
      const idToken = (userInfo.data as any)?.idToken;

      if (!idToken) {
        throw new Error("Failed to get Google ID token");
      }

      // Use the idToken to sign in with Firebase
      const response = await apiService.signInWithGoogle(idToken);
      await AsyncStorage.setItem("token", response.access_token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      console.error("❌ Google Sign-In error:", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
        console.log("User cancelled Google Sign-In");
        throw new Error("Sign-in cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation (e.g. sign in) is in progress already
        console.log("Google Sign-In already in progress");
        throw new Error("Sign-in already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play services not available or outdated
        console.error("Play services not available");
        throw new Error(
          "Google Play Services not available. Please update Google Play Services."
        );
      } else {
        // Some other error
        const errorMessage =
          error.message || "Failed to sign in with Google. Please try again.";
        throw new Error(errorMessage);
      }
    }
  };

  const logout = async () => {
    try {
      // Sign out from Google Sign-In (will silently fail if not signed in)
      await GoogleSignin.signOut();
    } catch (error) {
      // Ignore errors if user is not signed in with Google
      console.log("Google Sign-In sign out:", error);
    }

    // Sign out from Firebase
    await apiService.logout();
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = async (updatedUser: User) => {
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
