import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { User, LoginCredentials, SignupCredentials } from '../types';
import apiService from '../services/api';
import { auth, db, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '../config/firebase.config';

// Complete web browser authentication session
WebBrowser.maybeCompleteAuthSession();

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
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userProfile: User = {
              email: userData.email,
              name: userData.name,
              created_at: userData.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            };
            setUser(userProfile);
            // Store in AsyncStorage for compatibility
            await AsyncStorage.setItem('user', JSON.stringify(userProfile));
            const token = await firebaseUser.getIdToken();
            await AsyncStorage.setItem('token', token);
          } else {
            setUser(null);
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
          }
        } catch (error: any) {
          console.error('❌ Error fetching user profile:', error);
          console.error('Error code:', error?.code);
          console.error('Error message:', error?.message);
          if (error?.code === 'permission-denied') {
            console.error('⚠️  Firestore permission denied! Make sure security rules are set up.');
            console.error('📖 See FIRESTORE_SETUP.md for instructions');
          }
          setUser(null);
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiService.login(credentials);
    await AsyncStorage.setItem('token', response.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const signup = async (credentials: SignupCredentials) => {
    const response = await apiService.signup(credentials);
    await AsyncStorage.setItem('token', response.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const loginWithGoogle = async () => {
    try {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in your .env file');
      }

      // Get the redirect URI - must use HTTPS for Google OAuth
      let redirectUri: string;
      
      if (GOOGLE_REDIRECT_URI) {
        // Use custom redirect URI from env
        redirectUri = GOOGLE_REDIRECT_URI;
        console.log('✅ Using custom redirect URI from .env');
      } else {
        // Try Expo proxy (generates HTTPS URL)
        redirectUri = AuthSession.makeRedirectUri({ 
          useProxy: true,
        });
        
        // If we get exp:// URL, Expo proxy isn't working - need custom URI
        if (redirectUri.startsWith('exp://')) {
          throw new Error(
            'Redirect URI must be HTTPS. Please add EXPO_PUBLIC_GOOGLE_REDIRECT_URI to your .env file.\n' +
            'Example: EXPO_PUBLIC_GOOGLE_REDIRECT_URI=https://auth.expo.io/@yourusername/mtorq\n' +
            'Or use a custom domain: EXPO_PUBLIC_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth'
          );
        }
      }

      // Final check - must be HTTPS
      if (!redirectUri.startsWith('https://')) {
        throw new Error(`Invalid redirect URI: ${redirectUri}. Must use HTTPS.`);
      }

      console.log('🔗 Redirect URI (add this EXACT URL to Google Cloud Console):', redirectUri);

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri: redirectUri,
        additionalParameters: {},
        extraParams: {},
      });

      const result = await request.promptAsync(discovery, {
        useProxy: true,
      });

      if (result.type === 'success') {
        const { id_token, error, error_description } = result.params;
        
        if (error) {
          console.error('❌ OAuth error:', error, error_description);
          throw new Error(`OAuth error: ${error} - ${error_description || 'Unknown error'}`);
        }
        
        if (id_token) {
          const response = await apiService.signInWithGoogle(id_token);
          await AsyncStorage.setItem('token', response.access_token);
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
        } else {
          throw new Error('Failed to get Google ID token');
        }
      } else if (result.type === 'error') {
        const errorMsg = result.error?.message || result.error?.code || 'Google sign-in failed';
        console.error('❌ Google Sign-In error:', result.error);
        throw new Error(errorMsg);
      } else if (result.type === 'dismiss') {
        // User cancelled - silently return
        console.log('User cancelled Google Sign-In');
        return;
      }
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        error: error?.error,
      });
      
      // Provide helpful error messages
      if (error?.message?.includes('access_denied') || error?.message?.includes('access blocked')) {
        throw new Error('Access blocked. Please configure OAuth consent screen in Google Cloud Console. See GOOGLE_SIGNIN_SETUP.md for details.');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    await apiService.logout();
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (updatedUser: User) => {
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
