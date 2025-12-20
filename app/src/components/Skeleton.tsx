import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(39, 39, 42, 0)",
            "rgba(63, 63, 70, 0.5)",
            "rgba(39, 39, 42, 0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// Pre-built skeleton layouts for common patterns
export const SkeletonText: React.FC<{ lines?: number; style?: ViewStyle }> = ({
  lines = 1,
  style,
}) => (
  <View style={style}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={14}
        width={i === lines - 1 && lines > 1 ? "70%" : "100%"}
        style={{ marginBottom: i < lines - 1 ? 8 : 0 }}
      />
    ))}
  </View>
);

export const SkeletonCircle: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 40,
  style,
}) => <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#27272a",
    overflow: "hidden",
  },
  shimmer: {
    width: 200,
    height: "100%",
    position: "absolute",
  },
});

