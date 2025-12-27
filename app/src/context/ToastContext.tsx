import React, { createContext, useContext, useState, ReactNode } from "react";
import { View } from "react-native";
import { Toast, ToastType, ToastProps } from "../components/Toast";

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: ToastData = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const showSuccess = (title: string, message?: string, duration?: number) => {
    showToast("success", title, message, duration);
  };

  const showError = (title: string, message?: string, duration?: number) => {
    showToast("error", title, message, duration);
  };

  const showWarning = (title: string, message?: string, duration?: number) => {
    showToast("warning", title, message, duration);
  };

  const showInfo = (title: string, message?: string, duration?: number) => {
    showToast("info", title, message, duration);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    // For confirmation dialogs, we'll use a special approach
    // This will show a warning toast with longer duration
    // In a production app, you might want to create a proper modal for this
    showToast("warning", title, message, 5000);
    // Store callbacks for later use if needed
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
      }}
    >
      {children}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onDismiss={dismissToast}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};
