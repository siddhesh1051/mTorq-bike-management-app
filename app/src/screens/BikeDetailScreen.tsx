import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Edit, Trash2 } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Bike, BikeCreate, BrandModelsMap } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import {
  Button,
  Input,
  ModalDialog,
  Picker,
  ConfirmDialog,
} from "../components";
import apiService from "../services/api";
import { useToast } from "../context/ToastContext";

const { width } = Dimensions.get("window");

const BikeImage = require("../../assets/bike.png");

// Hardcoded bike details for now
const bikeDetails = {
  power: "30.60 bhp",
  mileage: "30.00 kmpl",
  cc: "398.00 cc",
  manufacturer: "Triumph",
  manufacturedOn: "sep '25",
  model: "Speed",
  variant: "T4",
  fuelType: "petrol",
  seatingCapacity: "2 seats",
  weight: "182 kg",
};

type BikeDetailRouteParams = {
  BikeDetail: {
    bike: Bike;
  };
};

interface InfoRowProps {
  leftLabel: string;
  leftValue: string;
  rightLabel?: string;
  rightValue?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoColumn}>
      <Text style={styles.infoLabel}>{leftLabel}</Text>
      <Text style={styles.infoValue}>{leftValue}</Text>
    </View>
    {rightLabel && rightValue && (
      <View style={styles.infoColumn}>
        <Text style={styles.infoLabel}>{rightLabel}</Text>
        <Text style={styles.infoValue}>{rightValue}</Text>
      </View>
    )}
  </View>
);

export const BikeDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<BikeDetailRouteParams, "BikeDetail">>();
  const { bike } = route.params;
  const { showSuccess, showError } = useToast();

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [brandsModels, setBrandsModels] = useState<BrandModelsMap>({});
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [currentBike, setCurrentBike] = useState<Bike>(bike);
  const [formData, setFormData] = useState<BikeCreate>({
    brand: bike.brand || "",
    model: bike.model,
    registration: bike.registration || "",
  });

  useEffect(() => {
    fetchBrandsModels();
  }, []);

  const fetchBrandsModels = async () => {
    try {
      const data = await apiService.getBrandsWithModels();
      setBrandsModels(data);
      // Set available models for current brand
      if (bike.brand && data[bike.brand]) {
        setAvailableModels(data[bike.brand]);
      }
    } catch (error) {
      console.error("Failed to load brands/models:", error);
    }
  };

  const handleBrandChange = (brand: string) => {
    setFormData({ ...formData, brand, model: "" });
    setAvailableModels(brandsModels[brand] || []);
  };

  const handleEdit = () => {
    setFormData({
      brand: currentBike.brand || "",
      model: currentBike.model,
      registration: currentBike.registration || "",
    });
    if (currentBike.brand && brandsModels[currentBike.brand]) {
      setAvailableModels(brandsModels[currentBike.brand]);
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.brand || !formData.model) {
      showError("Missing Fields", "Please fill in brand and model");
      return;
    }

    try {
      await apiService.updateBike(currentBike.id, formData);
      showSuccess("Bike Updated", "Bike updated successfully!");
      // Update local state
      setCurrentBike({
        ...currentBike,
        brand: formData.brand,
        model: formData.model,
        registration: formData.registration,
      });
      setModalVisible(false);
    } catch (error: any) {
      console.error("Error saving bike:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to save bike";
      showError("Save Failed", errorMessage);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleDelete = () => {
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteBike(currentBike.id);
      showSuccess("Bike Deleted", "Bike deleted successfully!");
      setDeleteDialogVisible(false);
      navigation.goBack();
    } catch (error: any) {
      console.error("Error deleting bike:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to delete bike";
      showError("Delete Failed", errorMessage);
      setDeleteDialogVisible(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleEdit}
          >
            <Edit color="#a1a1aa" size={20} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleDelete}
          >
            <Trash2 color="#f87171" size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bike Image Section */}
        <LinearGradient
          colors={["rgba(130, 130, 130, 0.1)", "rgba(9, 9, 11, 0)"]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.imageSection}
        >
          <Image
            source={BikeImage}
            style={styles.bikeImage}
            resizeMode="contain"
          />
        </LinearGradient>

        {/* Bike Name */}
        <View style={styles.nameSection}>
          <Text style={styles.bikeName}>{currentBike.model}</Text>
          <View style={styles.divider} />
        </View>

        {/* Specs Row */}
        <View style={styles.specsContainer}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>POWER</Text>
            <Text style={styles.specValue}>{bikeDetails.power}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>MILEAGE</Text>
            <Text style={styles.specValue}>{bikeDetails.mileage}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>CUBIC CAPACITY</Text>
            <Text style={styles.specValue}>{bikeDetails.cc}</Text>
          </View>
        </View>
        {/* Key Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>KEY INFORMATION</Text>

          <InfoRow
            leftLabel="Brand"
            leftValue={currentBike.brand || bikeDetails.manufacturer}
            rightLabel="Manufactured On"
            rightValue={bikeDetails.manufacturedOn}
          />

          <InfoRow
            leftLabel="Model"
            leftValue={currentBike.model}
            rightLabel="Seating Capacity"
            rightValue={bikeDetails.seatingCapacity}
          />

          <InfoRow
            leftLabel="Fuel Type"
            leftValue={bikeDetails.fuelType}
            rightLabel="Weight"
            rightValue={bikeDetails.weight}
          />
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <ModalDialog
        visible={modalVisible}
        onClose={handleModalClose}
        title="Edit Bike"
        description="Update your bike details"
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
          title="Update Bike"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#09090b",
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageSection: {
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 0,
    borderRadius: 0,
  },
  bikeImage: {
    width: width - 80,
    height: 200,
  },
  nameSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  bikeName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(153, 153, 153, 0.15)",
    marginTop: 16,
  },
  specsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717a",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  sectionTitleContainer: {
    backgroundColor: "#09090b",
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
  },
  sectionTitleText: {
    fontSize: 24,
    fontWeight: "400",
    color: "#ffffff",
  },
  sectionTitleTextBold: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  infoCard: {
    backgroundColor: "#09090b",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ffffff90",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff70",
  },
});
