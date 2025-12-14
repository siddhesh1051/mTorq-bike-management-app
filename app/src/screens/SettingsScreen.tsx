import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, Mail } from 'lucide-react-native';
import { Card, CardHeader, CardContent, Button } from '../components';
import { useAuth } from '../context/AuthContext';

export const SettingsScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Alert.alert('Success', 'Logged out successfully');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-white text-4xl font-bold">Settings</Text>
          <Text className="text-zinc-400 mt-2">Manage your account</Text>
        </View>

        {/* User Info */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader>
            <Text className="text-white text-xl font-semibold">Account Information</Text>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center p-4 bg-zinc-900/50 rounded border border-white/5 mb-4">
              <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-4">
                <User color="#ccfbf1" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  Name
                </Text>
                <Text className="text-white font-medium">{user?.name || 'User'}</Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 bg-zinc-900/50 rounded border border-white/5">
              <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-4">
                <Mail color="#ccfbf1" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  Email
                </Text>
                <Text className="text-white font-medium font-mono text-sm">
                  {user?.email || 'email@example.com'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader>
            <Text className="text-white text-xl font-semibold">Actions</Text>
          </CardHeader>
          <CardContent>
            <Button
              title="Logout"
              variant="danger"
              onPress={handleLogout}
            />
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <Text className="text-white text-xl font-semibold">About</Text>
          </CardHeader>
          <CardContent>
            <Text className="text-zinc-400 text-sm mb-2">
              Bike Expense Tracker v1.0
            </Text>
            <Text className="text-zinc-400 text-sm mb-4">
              Track and manage all your bike-related expenses in one place.
            </Text>
            <Text className="text-zinc-600 text-xs">
              © 2024 Bike Budget. All rights reserved.
            </Text>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
