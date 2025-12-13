import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bike as BikeIcon, Plus, Edit, Trash2 } from 'lucide-react-native';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  ModalDialog,
} from '../components';
import { Bike, BikeCreate } from '../types';
import apiService from '../services/api';

export const BikesScreen = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [formData, setFormData] = useState<BikeCreate>({
    name: '',
    model: '',
    registration: '',
  });

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const data = await apiService.getBikes();
      setBikes(data);
    } catch (error) {
      console.error('Failed to load bikes:', error);
      Alert.alert('Error', 'Failed to load bikes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBikes();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.model || !formData.registration) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (editingBike) {
        await apiService.updateBike(editingBike.id, formData);
        Alert.alert('Success', 'Bike updated successfully!');
      } else {
        await apiService.createBike(formData);
        Alert.alert('Success', 'Bike added successfully!');
      }
      
      setModalVisible(false);
      resetForm();
      fetchBikes();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save bike');
    }
  };

  const handleEdit = (bike: Bike) => {
    setEditingBike(bike);
    setFormData({
      name: bike.name,
      model: bike.model,
      registration: bike.registration,
    });
    setModalVisible(true);
  };

  const handleDelete = (bike: Bike) => {
    Alert.alert(
      'Delete Bike',
      'Are you sure you want to delete this bike? All associated expenses will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteBike(bike.id);
              Alert.alert('Success', 'Bike deleted successfully!');
              fetchBikes();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete bike');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({ name: '', model: '', registration: '' });
    setEditingBike(null);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    resetForm();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ccfbf1" />
          <Text className="text-zinc-400 mt-4">Loading bikes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-white/10">
          <View>
            <Text className="text-white text-3xl font-bold">My Bikes</Text>
            <Text className="text-zinc-400 mt-1">Manage your bikes</Text>
          </View>
          <TouchableOpacity
            className="bg-primary rounded-full w-12 h-12 items-center justify-center"
            onPress={() => setModalVisible(true)}
          >
            <Plus color="#115e59" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Bikes List */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ccfbf1"
            />
          }
        >
          {bikes.length === 0 ? (
            <Card>
              <CardContent>
                <View className="py-12 items-center">
                  <View className="w-20 h-20 rounded-full bg-zinc-800 items-center justify-center mb-4">
                    <BikeIcon color="#52525b" size={40} />
                  </View>
                  <Text className="text-white text-xl font-semibold mb-2">
                    No bikes yet
                  </Text>
                  <Text className="text-zinc-400">
                    Add your first bike to start tracking expenses
                  </Text>
                </View>
              </CardContent>
            </Card>
          ) : (
            bikes.map((bike) => (
              <Card key={bike.id} style={{ marginBottom: 16 }}>
                <CardHeader>
                  <View className="aspect-video rounded bg-zinc-800 mb-4 overflow-hidden">
                    <Image
                      source={{
                        uri: 'https://images.unsplash.com/photo-1589963575227-08d8ea840e85?crop=entropy&cs=srgb&fm=jpg&q=85',
                      }}
                      className="w-full h-full"
                      style={{ opacity: 0.3 }}
                    />
                  </View>
                  <Text className="text-white text-xl font-bold">{bike.name}</Text>
                </CardHeader>
                <CardContent>
                  <View className="mb-3">
                    <Text className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Model
                    </Text>
                    <Text className="text-zinc-300 font-medium">{bike.model}</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Registration
                    </Text>
                    <Text className="text-zinc-300 font-mono">{bike.registration}</Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center border border-white/10 rounded-full h-10"
                      onPress={() => handleEdit(bike)}
                    >
                      <Edit color="#d4d4d8" size={16} />
                      <Text className="text-zinc-300 ml-2">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center border border-red-500/20 rounded-full h-10"
                      onPress={() => handleDelete(bike)}
                    >
                      <Trash2 color="#f87171" size={16} />
                      <Text className="text-red-400 ml-2">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            ))
          )}
        </ScrollView>
      </View>

      {/* Add/Edit Modal */}
      <ModalDialog
        visible={modalVisible}
        onClose={handleModalClose}
        title={editingBike ? 'Edit Bike' : 'Add New Bike'}
        description={
          editingBike ? 'Update your bike details' : 'Add a new bike to track expenses'
        }
      >
        <Input
          label="Bike Name *"
          placeholder="e.g., My Royal Enfield"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        <Input
          label="Model *"
          placeholder="e.g., Classic 350"
          value={formData.model}
          onChangeText={(text) => setFormData({ ...formData, model: text })}
        />

        <Input
          label="Registration Number *"
          placeholder="e.g., DL-01-AB-1234"
          value={formData.registration}
          onChangeText={(text) => setFormData({ ...formData, registration: text })}
          autoCapitalize="characters"
        />

        <Button
          title={editingBike ? 'Update Bike' : 'Add Bike'}
          onPress={handleSubmit}
          style={{ marginTop: 8 }}
        />
      </ModalDialog>
    </SafeAreaView>
  );
};
