import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
  isReady: boolean;
}

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationComplete,
  isReady,
}) => {
  // Animation values using React Native's Animated API
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-15)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;

  const hideSplashScreen = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      // Handle error silently
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Hide native splash screen
    hideSplashScreen();

    // Phase 1: Glow and Logo entrance
    Animated.parallel([
      // Glow animation
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(glowScale, {
            toValue: 1.5,
            damping: 8,
            stiffness: 80,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Logo entrance
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.spring(logoScale, {
              toValue: 1.1,
              damping: 6,
              stiffness: 100,
              useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
              toValue: 1,
              damping: 10,
              stiffness: 150,
              useNativeDriver: true,
            }),
          ]),
          Animated.spring(logoRotate, {
            toValue: 0,
            damping: 12,
            stiffness: 80,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Particles fade in
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(particleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // Text entrance
      Animated.sequence([
        Animated.delay(700),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(textTranslateY, {
            toValue: 0,
            damping: 15,
            stiffness: 100,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // Phase 2: Final pulse
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1600);

    // Phase 3: Fade out and complete
    setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete();
      });
    }, 2200);
  }, [isReady, hideSplashScreen, onAnimationComplete]);

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [-15, 0],
    outputRange: ["-15deg", "0deg"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <LinearGradient
        colors={["#09090b", "#0c1117", "#09090b"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating particles */}
      <Animated.View
        style={[styles.particlesContainer, { opacity: particleOpacity }]}
      >
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
        <View style={[styles.particle, styles.particle4]} />
        <View style={[styles.particle, styles.particle5]} />
        <View style={[styles.particle, styles.particle6]} />
      </Animated.View>

      {/* Glow effect behind logo */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "transparent",
            "#14b8a622",
            "#14b8a633",
            "#14b8a622",
            "transparent",
          ]}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Main logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { rotate: logoRotateInterpolate },
            ],
          },
        ]}
      >
        <View style={styles.logoGlow} />
        <Image
          source={require("../../assets/mTorq.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App name text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Animated.Text style={styles.appName}>mTorq</Animated.Text>
        <Animated.Text style={styles.tagline}>Track your ride</Animated.Text>
      </Animated.View>

      {/* Bottom accent line */}
      <Animated.View
        style={[
          styles.accentLine,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <LinearGradient
          colors={["transparent", "#14b8a6", "transparent"]}
          style={styles.accentGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#09090b",
    zIndex: 100,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#14b8a6",
  },
  particle1: {
    top: "15%",
    left: "20%",
    opacity: 0.4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  particle2: {
    top: "25%",
    right: "15%",
    opacity: 0.3,
    width: 3,
    height: 3,
  },
  particle3: {
    top: "45%",
    left: "10%",
    opacity: 0.5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  particle4: {
    bottom: "35%",
    right: "20%",
    opacity: 0.4,
    width: 4,
    height: 4,
  },
  particle5: {
    bottom: "20%",
    left: "25%",
    opacity: 0.3,
    width: 3,
    height: 3,
  },
  particle6: {
    top: "60%",
    right: "12%",
    opacity: 0.6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  glowContainer: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  glowGradient: {
    width: "100%",
    height: "100%",
    borderRadius: width * 0.4,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#14b8a6",
    opacity: 0.08,
    shadowColor: "#14b8a6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  logo: {
    width: 140,
    height: 140,
  },
  textContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  appName: {
    fontSize: 42,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 2,
    textShadowColor: "#14b8a6",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "400",
    color: "#71717a",
    letterSpacing: 4,
    marginTop: 8,
    textTransform: "uppercase",
  },
  accentLine: {
    position: "absolute",
    bottom: 80,
    width: width * 0.5,
    height: 2,
  },
  accentGradient: {
    width: "100%",
    height: "100%",
  },
});
