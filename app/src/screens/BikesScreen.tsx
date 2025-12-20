import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bike as BikeIcon,
  Plus,
  Edit,
  Trash2,
  Gauge,
  Flame,
  Fuel,
  Camera,
  ImageIcon,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
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
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// Hardcoded bike specs for the modern card design
const bikeSpecs: Record<
  string,
  { power: string; mileage: string; cc: string }
> = {
  default: { power: "45 bhp", mileage: "40 kmpl", cc: "400cc" },
};

const BikeImage = require("../../assets/bike.png");

interface BikeCardProps {
  bike: Bike;
  onEdit: (bike: Bike) => void;
  onDelete: (bike: Bike) => void;
  onPress: (bike: Bike) => void;
  index: number;
}

const BikeCard: React.FC<BikeCardProps> = ({
  bike,
  onEdit,
  onDelete,
  onPress,
  index,
}) => {
  const specs = bikeSpecs[bike.model] || bikeSpecs.default;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onPress(bike)}
      activeOpacity={0.8}
    >
      {/* Main content area with bike image on top */}
      <View style={styles.cardContent}>
        {/* Text info - positioned below the image */}
        <View style={styles.textSection}>
          {bike.registration && (
            <View style={styles.registrationBadge}>
              <Text style={styles.registrationText}>
                {bike.registration.length > 13
                  ? bike.registration.slice(0, 13) + "..."
                  : bike.registration}
              </Text>
            </View>
          )}
          <Text style={styles.bikeBrand}>{bike.brand}</Text>
          <Text style={styles.bikeModel}>{bike.model}</Text>
        </View>

        {/* Bike image - floating on top right */}
        <View style={styles.imageContainer}>
          <Image
            source={bike.image_url ? { uri: bike.image_url } : BikeImage}
            style={styles.bikeImage}
            resizeMode={bike.image_url ? "cover" : "contain"}
          />
        </View>
      </View>

      {/* Specs Row */}
      <LinearGradient
        colors={["rgba(130, 130, 130, 0.5)", "rgba(9, 9, 11, 0)"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.specsRow}
      >
        <View style={styles.specItem}>
          <Flame color="#ffffff80" size={20} strokeWidth={1.5} />
          <Text style={styles.specText}>{specs.power}</Text>
        </View>
        <View style={styles.specItem}>
          <Gauge color="#ffffff80" size={20} strokeWidth={1.5} />
          <Text style={styles.specText}>{specs.cc}</Text>
        </View>
        <View style={styles.specItem}>
          <Fuel color="#ffffff80" size={20} strokeWidth={1.5} />
          <Text style={styles.specText}>{specs.mileage}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export const BikesScreen = () => {
  const navigation = useNavigation<any>();
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
    image_url: "",
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      image_url: bike.image_url || "",
    });
    if (bike.image_url) {
      setSelectedImage(bike.image_url);
    }
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
    setFormData({ brand: "", model: "", registration: "", image_url: "" });
    setAvailableModels([]);
    setEditingBike(null);
    setSelectedImage(null);
  };

  const handleBrandChange = (brand: string) => {
    setFormData({ ...formData, brand, model: "" });
    setAvailableModels(brandsModels[brand] || []);
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setSelectedImage(result.assets[0].uri);
      setFormData({ ...formData, image_url: base64Image });
    }
  };

  const takePhoto = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setSelectedImage(result.assets[0].uri);
      setFormData({ ...formData, image_url: base64Image });
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setFormData({ ...formData, image_url: "" });
  };

  const handleModalClose = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleCardPress = (bike: Bike) => {
    navigation.navigate("BikeDetail", { bike });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#5eead4" />
          <Text style={styles.loadingText}>Loading bikes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>My Bikes</Text>
              <Text style={styles.headerSubtitle}>Manage your bikes</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Plus color="#115e59" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bikes List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#5eead4"
            />
          }
        >
          {bikes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <BikeIcon color="#52525b" size={48} />
              </View>
              <Text style={styles.emptyTitle}>No bikes yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first bike to start tracking expenses
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => setModalVisible(true)}
              >
                <Plus color="#115e59" size={20} />
                <Text style={styles.emptyAddText}>Add Your First Bike</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bikes.map((bike, index) => (
              <BikeCard
                key={bike.id}
                bike={bike}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPress={handleCardPress}
                index={index}
              />
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
        footer={
          <Button
            title={editingBike ? "Update Bike" : "Add Bike"}
            onPress={handleSubmit}
          />
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

        {/* Image Picker Section */}
        <View style={styles.imagePickerSection}>
          <Text style={styles.imagePickerLabel}>Bike Photo (Optional)</Text>
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <X color="#ffffff" size={16} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePickerButtons}>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={takePhoto}
              >
                <Camera color="#5eead4" size={24} />
                <Text style={styles.imagePickerButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickImage}
              >
                <ImageIcon color="#5eead4" size={24} />
                <Text style={styles.imagePickerButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#71717a",
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#5eead4",
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5eead4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
    overflow: "visible",
  },
  cardContainer: {
    // backgroundColor: "#18181b",
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "visible",
    position: "relative",
  },
  cardContent: {
    paddingBottom: 28,
  },
  textSection: {
    paddingLeft: 12,
    paddingTop: 12,
    zIndex: 1,
  },
  bikeBrand: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff90",
    letterSpacing: -1,
  },
  bikeModel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#a1a1aa",
  },
  registrationBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  registrationText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#a1a1aa",
    letterSpacing: 1.5,
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    right: -40,
    width: width * 0.7,
    height: 160,
    zIndex: 10,
  },
  bikeImage: {
    width: "100%",
    height: "100%",
  },
  specsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingTop: 32,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
  specItem: {
    alignItems: "center",
    gap: 6,
  },
  specText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff90",
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.08)",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#a1a1aa",
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f87171",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5eead4",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#5eead4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyAddText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#115e59",
  },
  imagePickerSection: {
    marginBottom: 16,
  },
  imagePickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#a1a1aa",
    marginBottom: 8,
  },
  imagePickerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  imagePickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(94, 234, 212, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(94, 234, 212, 0.3)",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
  },
  imagePickerButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5eead4",
  },
  selectedImageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 6,
  },
});
