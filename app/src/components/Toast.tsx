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
    const iconProps = { size: 26, color: "#ffffff", strokeWidth: 2.5 };
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
        top: 60,
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
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.6,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        <View className="flex-row items-start p-5">
          <View className="mt-1 mr-4">{getIcon()}</View>
          <View className="flex-1 mr-3">
            <Text className="text-white font-bold text-lg mb-1.5 leading-6">
              {title}
            </Text>
            {message && (
              <Text className="text-white/95 text-base leading-6 mt-1">
                {typeof message === "string"
                  ? message
                  : JSON.stringify(message)}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleDismiss}
            className="bg-white/20 rounded-full p-1.5 ml-2"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
