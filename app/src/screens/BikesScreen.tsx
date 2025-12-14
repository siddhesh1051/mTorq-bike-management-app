import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bike as BikeIcon, Plus, Edit, Trash2 } from "lucide-react-native";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  ModalDialog,
  Picker,
  ConfirmDialog,
} from "../components";
import { Bike, BikeCreate, BrandModelsMap } from "../types";
import apiService from "../services/api";
import { useToast } from "../context/ToastContext";

export const BikesScreen = () => {
  const { showSuccess, showError } = useToast();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [brandsModels, setBrandsModels] = useState<BrandModelsMap>({});
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState<Bike | null>(null);
  const [formData, setFormData] = useState<BikeCreate>({
    brand: "",
    model: "",
    registration: "",
  });

  useEffect(() => {
    fetchBikes();
    fetchBrandsModels();
  }, []);

  const fetchBrandsModels = async () => {
    try {
      const data = await apiService.getBrandsWithModels();
      setBrandsModels(data);
    } catch (error) {
      console.error("Failed to load brands/models:", error);
    }
  };

  const fetchBikes = async () => {
    try {
      const data = await apiService.getBikes();
      setBikes(data);
    } catch (error: any) {
      console.error("Failed to load bikes:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to load bikes";
      showError("Load Failed", errorMessage);
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
    if (!formData.brand || !formData.model) {
      showError("Missing Fields", "Please fill in brand and model");
      return;
    }

    try {
      if (editingBike) {
        await apiService.updateBike(editingBike.id, formData);
        showSuccess("Bike Updated", "Bike updated successfully!");
      } else {
        await apiService.createBike(formData);
        showSuccess("Bike Added", "Bike added successfully!");
      }

      setModalVisible(false);
      resetForm();
      fetchBikes();
    } catch (error: any) {
      console.error("Error saving bike:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to save bike";
      showError("Save Failed", errorMessage);
    }
  };

  const handleEdit = (bike: Bike) => {
    setEditingBike(bike);
    const brand = bike.brand || "";
    setFormData({
      brand: brand,
      model: bike.model,
      registration: bike.registration || "",
    });
    if (brand && brandsModels[brand]) {
      setAvailableModels(brandsModels[brand]);
    }
    setModalVisible(true);
  };

  const handleDelete = (bike: Bike) => {
    setBikeToDelete(bike);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!bikeToDelete) return;

    try {
      await apiService.deleteBike(bikeToDelete.id);
      showSuccess("Bike Deleted", "Bike deleted successfully!");
      fetchBikes();
    } catch (error: any) {
      console.error("Error deleting bike:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to delete bike";
      showError("Delete Failed", errorMessage);
    } finally {
      setDeleteDialogVisible(false);
      setBikeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setBikeToDelete(null);
  };

  const resetForm = () => {
    setFormData({ brand: "", model: "", registration: "" });
    setAvailableModels([]);
    setEditingBike(null);
  };

  const handleBrandChange = (brand: string) => {
    setFormData({ ...formData, brand, model: "" });
    setAvailableModels(brandsModels[brand] || []);
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
        <View className="flex-row justify-between items-center px-5 py-4 border-b border-white/10">
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
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 80,
          }}
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
                  <View className="aspect-video rounded bg-zinc-800 mb-4 overflow-hidden items-center justify-center">
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1589963575227-08d8ea840e85?crop=entropy&cs=srgb&fm=jpg&q=85",
                      }}
                      className="w-full h-full"
                      style={{ opacity: 0.3 }}
                    />
                  </View>
                  <Text className="text-white text-xl font-bold">
                    {bike.brand} {bike.model}
                  </Text>
                </CardHeader>
                <CardContent>
                  {bike.registration && (
                    <View className="mb-4">
                      <Text className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                        Registration Number
                      </Text>
                      <Text className="text-zinc-300 font-mono text-lg">
                        {bike.registration}
                      </Text>
                    </View>
                  )}
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
        title={editingBike ? "Edit Bike" : "Add New Bike"}
        description={
          editingBike
            ? "Update your bike details"
            : "Add a new bike to track expenses"
        }
      >
        <Picker
          label="Brand *"
          placeholder="Select brand"
          value={formData.brand}
          options={Object.keys(brandsModels).map((brand) => ({
            label: brand,
            value: brand,
          }))}
          onValueChange={handleBrandChange}
        />

        <Picker
          label="Model *"
          placeholder={formData.brand ? "Select model" : "Select brand first"}
          value={formData.model}
          options={availableModels.map((model) => ({
            label: model,
            value: model,
          }))}
          onValueChange={(model) => setFormData({ ...formData, model })}
        />

        <Input
          label="Registration Number (Optional)"
          placeholder="e.g., DL-01-AB-1234"
          value={formData.registration}
          onChangeText={(text) =>
            setFormData({ ...formData, registration: text })
          }
          autoCapitalize="characters"
        />

        <Button
          title={editingBike ? "Update Bike" : "Add Bike"}
          onPress={handleSubmit}
          style={{ marginTop: 8 }}
        />
      </ModalDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Bike"
        message="Are you sure you want to delete this bike? All associated expenses will also be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </SafeAreaView>
  );
};
