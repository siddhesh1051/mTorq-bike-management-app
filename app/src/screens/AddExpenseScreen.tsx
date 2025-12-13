import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { Card, CardHeader, CardContent, Input, Button, Picker } from '../components';
import { Bike, ExpenseCreate } from '../types';
import apiService from '../services/api';

export const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExpenseCreate>({
    bike_id: '',
    type: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    odometer: undefined,
    notes: '',
  });

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const data = await apiService.getBikes();
      setBikes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load bikes');
    }
  };

  const handleSubmit = async () => {
    if (!formData.bike_id || !formData.type || !formData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await apiService.createExpense(formData);
      Alert.alert('Success', 'Expense added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add expense');
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
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-6">
            <Text className="text-white text-4xl font-bold">Add Expense</Text>
            <Text className="text-zinc-400 mt-2">Record a new bike expense</Text>
          </View>

          <Card>
            <CardHeader>
              <View className="flex-row items-center">
                <Plus color="#ccfbf1" size={20} />
                <Text className="text-white text-xl font-semibold ml-2">
                  Expense Details
                </Text>
              </View>
            </CardHeader>

            <CardContent>
              {/* Bike Selection */}
              <Picker
                label="Bike *"
                placeholder="Select a bike"
                value={formData.bike_id}
                options={bikes.map((bike) => ({
                  label: `${bike.name} - ${bike.registration}`,
                  value: bike.id,
                }))}
                onValueChange={(value) => setFormData({ ...formData, bike_id: value })}
              />

              {/* Type Selection */}
              <Picker
                label="Type *"
                placeholder="Select type"
                value={formData.type}
                options={[
                  { label: 'Fuel', value: 'Fuel' },
                  { label: 'Service', value: 'Service' },
                  { label: 'Insurance', value: 'Insurance' },
                  { label: 'Other', value: 'Other' },
                ]}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              />

              {/* Amount */}
              <Input
                label="Amount (₹) *"
                placeholder="Enter amount"
                value={formData.amount ? formData.amount.toString() : ''}
                onChangeText={(text) =>
                  setFormData({ ...formData, amount: parseFloat(text) || 0 })
                }
                keyboardType="numeric"
              />

              {/* Date */}
              <Input
                label="Date *"
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />

              {/* Odometer */}
              <Input
                label="Odometer (km)"
                placeholder="Enter odometer reading"
                value={formData.odometer ? formData.odometer.toString() : ''}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    odometer: text ? parseInt(text) : undefined,
                  })
                }
                keyboardType="numeric"
              />

              {/* Notes */}
              <Input
                label="Notes"
                placeholder="Add any notes..."
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
              />

              <Button
                title={loading ? 'Adding...' : 'Add Expense'}
                onPress={handleSubmit}
                loading={loading}
                style={{ marginTop: 8 }}
              />
            </CardContent>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
