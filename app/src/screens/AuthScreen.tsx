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
import { Card, CardHeader, CardContent, Input, Button } from "../components";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const mTorqLogo = require("../../assets/mTorq.png");

export const AuthScreen = () => {
  const { login, signup } = useAuth();
  const { showError } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
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
      } else if (error.message?.includes("Network Error")) {
        errorMessage =
          "Cannot connect to server. Make sure backend is running and your device is on the same network.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError("Authentication Error", errorMessage);
    } finally {
      setLoading(false);
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
});
