import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { ToastProvider } from "./src/context/ToastContext";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#09090b" />
        <RootNavigator />
      </AuthProvider>
    </ToastProvider>
  );
}
