import React, { useState, useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import { ToastProvider } from "./src/context/ToastContext";
import { RootNavigator } from "./src/navigation";
import { AnimatedSplashScreen } from "./src/components";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    // Simulate any initial loading (fonts, assets, etc.)
    const prepare = async () => {
      try {
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
