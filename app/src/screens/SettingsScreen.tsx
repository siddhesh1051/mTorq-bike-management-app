import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LogOut,
  User,
  Mail,
  Edit,
  Lock,
  ChevronRight,
  X,
  Check,
} from "lucide-react-native";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  ConfirmDialog,
  Input,
  ModalDialog,
} from "../components";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import apiService from "../services/api";

export const SettingsScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLogoutDialogVisible(true);
  };

  const confirmLogout = async () => {
    await logout();
    showSuccess("Logged Out", "Logged out successfully");
    setLogoutDialogVisible(false);
  };

  const cancelLogout = () => {
    setLogoutDialogVisible(false);
  };

  const handleEditName = () => {
    setName(user?.name || "");
    setEditNameModalVisible(true);
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      showError("Invalid Name", "Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await apiService.updateName(name.trim());
      updateUser(updatedUser);
      showSuccess("Name Updated", "Your name has been updated successfully");
      setEditNameModalVisible(false);
    } catch (error: any) {
      console.error("Error updating name:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to update name";
      showError("Update Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setResetPasswordModalVisible(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("Missing Fields", "Please fill in all password fields");
      return;
    }

    if (newPassword.length < 6) {
      showError("Invalid Password", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Password Mismatch", "New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiService.updatePassword(currentPassword, newPassword);
      showSuccess("Password Updated", "Your password has been updated successfully");
      setResetPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to update password";
      showError("Update Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your account preferences</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFILE</Text>
          
          {/* Name Card */}
          <TouchableOpacity
            style={styles.settingCard}
            onPress={handleEditName}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <User color="#5eead4" size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Name</Text>
              <Text style={styles.settingValue}>{user?.name || "User"}</Text>
            </View>
            <Edit color="#71717a" size={18} />
          </TouchableOpacity>

          {/* Email Card (Read-only) */}
          <View style={styles.settingCard}>
            <View style={styles.settingIconContainer}>
              <Mail color="#5eead4" size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValueEmail}>{user?.email || "email@example.com"}</Text>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          
          <TouchableOpacity
            style={styles.settingCard}
            onPress={handleResetPassword}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Lock color="#5eead4" size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Reset Password</Text>
              <Text style={styles.settingSubtext}>Change your account password</Text>
            </View>
            <ChevronRight color="#71717a" size={18} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          
          <TouchableOpacity
            style={[styles.settingCard, styles.dangerCard]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.settingIconContainer, styles.dangerIconContainer]}>
              <LogOut color="#f87171" size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Logout</Text>
              <Text style={styles.settingSubtext}>Sign out of your account</Text>
            </View>
            <ChevronRight color="#71717a" size={18} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <ModalDialog
        visible={editNameModalVisible}
        onClose={() => setEditNameModalVisible(false)}
        title="Edit Name"
        description="Update your display name"
        footer={
          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setEditNameModalVisible(false)}
              style={styles.modalButton}
            />
            <Button
              title={loading ? "Saving..." : "Save"}
              onPress={handleSaveName}
              loading={loading}
              style={styles.modalButton}
            />
          </View>
        }
      >
        <Input
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </ModalDialog>

      {/* Reset Password Modal */}
      <ModalDialog
        visible={resetPasswordModalVisible}
        onClose={() => setResetPasswordModalVisible(false)}
        title="Reset Password"
        description="Enter your current password and choose a new one"
        footer={
          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setResetPasswordModalVisible(false)}
              style={styles.modalButton}
            />
            <Button
              title={loading ? "Updating..." : "Update Password"}
              onPress={handleSavePassword}
              loading={loading}
              style={styles.modalButton}
            />
          </View>
        }
      >
        <Input
          label="Current Password"
          placeholder="Enter current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <Input
          label="New Password"
          placeholder="Enter new password (min 6 characters)"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <Input
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </ModalDialog>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={logoutDialogVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#71717a",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#71717a",
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dangerCard: {
    borderColor: "rgba(248, 113, 113, 0.2)",
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(94, 234, 212, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dangerIconContainer: {
    backgroundColor: "rgba(248, 113, 113, 0.15)",
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    color: "#a1a1aa",
  },
  settingValueEmail: {
    fontSize: 13,
    color: "#a1a1aa",
    fontFamily: "monospace",
  },
  settingSubtext: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 2,
  },
  dangerText: {
    color: "#f87171",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});
