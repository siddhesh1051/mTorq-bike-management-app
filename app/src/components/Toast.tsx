import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const { width } = Dimensions.get("window");

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 3000,
  onDismiss,
}) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(id);
    });
  };

  const getIcon = () => {
    const iconProps = { size: 24, color: "#ffffff" };
    switch (type) {
      case "success":
        return <CheckCircle {...iconProps} />;
      case "error":
        return <XCircle {...iconProps} />;
      case "warning":
        return <AlertCircle {...iconProps} />;
      case "info":
        return <Info {...iconProps} />;
    }
  };

  const getGradientColors = () => {
    switch (type) {
      case "success":
        return ["#10b981", "#059669"];
      case "error":
        return ["#ef4444", "#dc2626"];
      case "warning":
        return ["#f59e0b", "#d97706"];
      case "info":
        return ["#3b82f6", "#2563eb"];
    }
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        position: "absolute",
        top: 50,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl shadow-2xl"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="flex-row items-start p-4 space-x-3">
          <View className="mt-0.5">{getIcon()}</View>
          <View className="flex-1 mr-2">
            <Text className="text-white font-bold text-base mb-0.5">
              {title}
            </Text>
            {message && (
              <Text className="text-white/90 text-sm leading-5">{message}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleDismiss}
            className="bg-white/20 rounded-full p-1"
            activeOpacity={0.7}
          >
            <X size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};


