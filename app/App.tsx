import React, { useState, useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, AppState, AppStateStatus } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import { ToastProvider } from "./src/context/ToastContext";
import { RootNavigator } from "./src/navigation";
import { AnimatedSplashScreen } from "./src/components";
import analyticsService from "./src/services/analytics";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    // Initialize app with analytics
    const prepare = async () => {
      try {
        // Initialize Mixpanel Analytics
        await analyticsService.initialize();
        
        // Track app opened
        await analyticsService.trackAppOpened();
        
        // Add any async initialization here if needed
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    };

    prepare();
  }, []);

  // Track app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        analyticsService.trackAppBackgrounded();
      } else if (nextAppState === 'active') {
        analyticsService.trackAppOpened();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onSplashComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#09090b" }}>
      <ToastProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor="#09090b" />
          {splashComplete && <RootNavigator />}
        </AuthProvider>
      </ToastProvider>

      {!splashComplete && (
        <AnimatedSplashScreen
          isReady={appIsReady}
          onAnimationComplete={onSplashComplete}
        />
      )}
    </View>
  );
}
