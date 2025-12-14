import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bike } from 'lucide-react-native';
import { Card, CardHeader, CardContent, Input, Button } from '../components';
import { useAuth } from '../context/AuthContext';

export const AuthScreen = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      Alert.alert('Error', 'Please fill in all fields');
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
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={{ marginBottom: 16 }}>
            <CardHeader>
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
                  <Bike color="#ccfbf1" size={32} />
                </View>
                <Text className="text-white text-3xl font-bold text-center">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </Text>
                <Text className="text-zinc-400 text-center mt-2">
                  {isLogin
                    ? 'Sign in to track your bike expenses'
                    : 'Start tracking your bike expenses today'}
                </Text>
              </View>
            </CardHeader>

            <CardContent>
              {!isLogin && (
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                />
              )}

              <Input
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                autoCapitalize="none"
              />

              <Button
                title={loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
                onPress={handleSubmit}
                loading={loading}
                style={{ marginTop: 8 }}
              />

              <View className="mt-6 items-center">
                <Text
                  className="text-zinc-400 text-sm"
                  onPress={() => setIsLogin(!isLogin)}
                >
                  {isLogin
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                  <Text className="text-primary">
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </Text>
                </Text>
              </View>
            </CardContent>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
