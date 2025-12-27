import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card, CardHeader, CardContent, Input, Button } from "../components";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const mTorqLogo = require("../../assets/mTorq.png");

export const AuthScreen = () => {
  const { login, signup, loginWithGoogle } = useAuth();
  const { showError } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      showError("Missing Fields", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
      }
    } catch (error: any) {
      console.log("Auth error:", error);
      console.log("Error message:", error.message);
      console.log("Error response:", error.response?.data);

      let errorMessage = "An error occurred. Please try again.";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("network")
      ) {
        errorMessage =
          "Cannot connect to server. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError("Authentication Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.log("Google Sign-In error:", error);
      let errorMessage = "Failed to sign in with Google. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }
      showError("Google Sign-In Error", errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[
          "rgba(9, 9, 11, 1)",
          "rgba(9, 9, 11, 0.95)",
          "rgba(9, 9, 11, 1)",
        ]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={mTorqLogo}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.welcomeText}>
                {isLogin ? "Welcome Back" : "Get Started"}
              </Text>
              <Text style={styles.subtitleText}>
                {isLogin
                  ? "Sign in to continue tracking your bike expenses"
                  : "Create your account to start tracking"}
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.cardContainer}>
              <Card style={styles.card}>
                <CardContent>
                  {!isLogin && (
                    <Input
                      label="Name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChangeText={(text) =>
                        setFormData({ ...formData, name: text })
                      }
                      autoCapitalize="words"
                    />
                  )}

                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <Button
                    title={
                      loading
                        ? "Please wait..."
                        : isLogin
                        ? "Sign In"
                        : "Create Account"
                    }
                    onPress={handleSubmit}
                    loading={loading}
                    style={styles.submitButton}
                  />

                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Google Sign-In Button */}
                  <TouchableOpacity
                    style={[
                      styles.googleButton,
                      (googleLoading || loading) && styles.googleButtonDisabled,
                    ]}
                    onPress={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    activeOpacity={0.8}
                  >
                    <View style={styles.googleButtonContent}>
                      <View style={styles.googleIcon}>
                        <Svg
                          width={20}
                          height={20}
                          viewBox="0 0 256 262"
                          preserveAspectRatio="xMidYMid"
                        >
                          <Path
                            fill="#4285F4"
                            d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                          />
                          <Path
                            fill="#34A853"
                            d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                          />
                          <Path
                            fill="#FBBC05"
                            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                          />
                          <Path
                            fill="#EB4335"
                            d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                          />
                        </Svg>
                      </View>
                      <Text style={styles.googleButtonText}>
                        {googleLoading
                          ? "Signing in..."
                          : "Continue with Google"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Toggle Login/Signup */}
                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>
                      {isLogin
                        ? "Don't have an account? "
                        : "Already have an account? "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setIsLogin(!isLogin);
                        setFormData({ email: "", password: "", name: "" });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.toggleLink}>
                        {isLogin ? "Sign up" : "Sign in"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
    alignSelf: "center",
  },
  logoContainer: {
    width: 200,
    height: 80,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 15,
    color: "#71717a",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    overflow: "hidden",
  },
  submitButton: {
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  toggleText: {
    fontSize: 14,
    color: "#71717a",
  },
  toggleLink: {
    fontSize: 14,
    color: "#5eead4",
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: "#71717a",
    fontWeight: "500",
  },
  googleButton: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 12,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
});
