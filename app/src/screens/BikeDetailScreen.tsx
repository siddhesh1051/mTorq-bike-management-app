import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Camera,
  ImageIcon,
  X,
  Fuel,
  Wrench,
  Shield,
  FileCheck,
  CircleDollarSign,
  Sparkles,
  Car,
  ParkingCircle,
  Droplets,
  FileText,
  AlertTriangle,
  CreditCard,
  MoreHorizontal,
  Gauge,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FolderOpen,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { Bike, BikeCreate, BrandModelsMap, Expense } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import {
  Button,
  Input,
  ModalDialog,
  Picker,
  ConfirmDialog,
  Skeleton,
} from "../components";
import apiService from "../services/api";
import { useToast } from "../context/ToastContext";
import { format } from "date-fns";

const { width } = Dimensions.get("window");

const BikeImage = require("../../assets/bike.png");

type BikeDetailRouteParams = {
  BikeDetail: {
    bike: Bike;
  };
};

// Expense type icons and colors
const expenseTypeConfig: Record<
  string,
  { icon: any; color: string; bgColor: string }
> = {
  Fuel: { icon: Fuel, color: "#3b82f6", bgColor: "#1e3a5f" },
  Service: { icon: Wrench, color: "#f97316", bgColor: "#4a2512" },
  Insurance: { icon: Shield, color: "#22c55e", bgColor: "#14532d" },
  PUC: { icon: FileCheck, color: "#84cc16", bgColor: "#365314" },
  Tyres: { icon: CircleDollarSign, color: "#8b5cf6", bgColor: "#3b2069" },
  Battery: { icon: CircleDollarSign, color: "#ec4899", bgColor: "#5c1a3d" },
  "Spare Parts": { icon: Sparkles, color: "#f43f5e", bgColor: "#4c1524" },
  Repair: { icon: Wrench, color: "#ef4444", bgColor: "#4c1414" },
  Accessories: { icon: Sparkles, color: "#0ea5e9", bgColor: "#0c3447" },
  Gear: { icon: Shield, color: "#06b6d4", bgColor: "#083344" },
  Modification: { icon: Sparkles, color: "#a855f7", bgColor: "#3b1a5c" },
  Toll: { icon: Car, color: "#64748b", bgColor: "#1e293b" },
  Parking: { icon: ParkingCircle, color: "#475569", bgColor: "#1e293b" },
  Washing: { icon: Droplets, color: "#06b6d4", bgColor: "#083344" },
  "Registration/RTO": { icon: FileText, color: "#10b981", bgColor: "#064e3b" },
  "Fines/Challan": {
    icon: AlertTriangle,
    color: "#f43f5e",
    bgColor: "#4c1524",
  },
  EMI: { icon: CreditCard, color: "#10b981", bgColor: "#064e3b" },
  Other: { icon: MoreHorizontal, color: "#fbbf24", bgColor: "#451a03" },
};

// Group expenses by month
const groupExpensesByMonth = (expenses: Expense[]) => {
  const groups: { [key: string]: Expense[] } = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const monthYear = format(date, "MMMM yyyy");
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(expense);
  });

  // Sort each group by date (newest first), then by created_at if dates are same
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => {
      // First sort by date (newest first)
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      // If dates are same, sort by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  // Sort groups by date (newest first)
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const dateA = new Date(groups[a][0].date);
    const dateB = new Date(groups[b][0].date);
    return dateB.getTime() - dateA.getTime();
  });

  return sortedKeys.map((key) => ({ month: key, expenses: groups[key] }));
};

// Calculate mileage between two consecutive full tank fuel expenses
interface MileageInfo {
  mileage: number | null;
  distance: number | null;
  litres: number | null;
  previousOdometer: number | null;
  canCalculate: boolean;
  errorMessage: string | null;
}

const calculateMileageForExpense = (
  expense: Expense,
  allExpenses: Expense[]
): MileageInfo => {
  // Only calculate for fuel expenses with full tank
  if (expense.type !== "Fuel") {
    return {
      mileage: null,
      distance: null,
      litres: null,
      previousOdometer: null,
      canCalculate: false,
      errorMessage: null,
    };
  }

  // Check if this expense has required data
  if (!expense.is_full_tank) {
    return {
      mileage: null,
      distance: null,
      litres: expense.litres || null,
      previousOdometer: null,
      canCalculate: false,
      errorMessage: "Not a full tank - mileage cannot be calculated",
    };
  }

  if (!expense.odometer) {
    return {
      mileage: null,
      distance: null,
      litres: expense.litres || null,
      previousOdometer: null,
      canCalculate: false,
      errorMessage: "Odometer reading missing",
    };
  }

  if (!expense.litres) {
    return {
      mileage: null,
      distance: null,
      litres: null,
      previousOdometer: null,
      canCalculate: false,
      errorMessage: "Litres not recorded",
    };
  }

  // Find the previous full tank expense (most recent full tank before this one)
  const currentExpenseTime = new Date(expense.date).getTime();
  const currentExpenseCreatedTime = new Date(expense.created_at).getTime();
  
  // Get all full tank expenses with odometer readings (excluding current expense)
  const previousFullTankExpenses = [...allExpenses]
    .filter(
      (e) =>
        e.type === "Fuel" &&
        e.is_full_tank &&
        e.odometer &&
        e.litres &&
        e.id !== expense.id // Exclude current expense
    )
    .filter((e) => {
      // Previous expense must be before current expense
      const eDate = new Date(e.date).getTime();
      const eCreated = new Date(e.created_at).getTime();
      return (
        eDate < currentExpenseTime ||
        (eDate === currentExpenseTime && eCreated < currentExpenseCreatedTime)
      );
    })
    .sort((a, b) => {
      // Get the most recent one before current expense
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      const dateDiff = bDate - aDate;
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const previousExpense = previousFullTankExpenses[0];

  if (!previousExpense) {
    return {
      mileage: null,
      distance: null,
      litres: expense.litres,
      previousOdometer: null,
      canCalculate: false,
      errorMessage: "First full tank - mileage will be calculated on next full tank",
    };
  }

  // Calculate mileage: (Current Odometer - Previous Odometer) / Litres of Current Expense
  const distance = expense.odometer - (previousExpense.odometer || 0);
  
  if (distance <= 0) {
    return {
      mileage: null,
      distance: null,
      litres: expense.litres,
      previousOdometer: previousExpense.odometer || null,
      canCalculate: false,
      errorMessage: "Invalid odometer reading (current ≤ previous)",
    };
  }
  
  const mileage = distance / expense.litres;

  return {
    mileage: Math.round(mileage * 10) / 10,
    distance,
    litres: expense.litres,
    previousOdometer: previousExpense.odometer || null,
    canCalculate: true,
    errorMessage: null,
  };
};

// Calculate overall mileage for a bike from all full tank expenses
interface OverallMileageStats {
  averageMileage: number | null;
  latestOdometer: number | null;
  totalDistance: number | null;
  totalFuel: number | null;
  fullTankCount: number;
}

// Helper to get highest odometer reading from all expenses
const getLatestOdometer = (expenses: Expense[]): number | null => {
  const withOdometer = expenses.filter((e) => e.odometer);
  if (withOdometer.length === 0) return null;
  // Return the highest odometer reading
  return Math.max(...withOdometer.map((e) => e.odometer || 0));
};

const calculateOverallMileage = (expenses: Expense[]): OverallMileageStats => {
  // Filter full tank expenses with odometer and litres
  const fullTankExpenses = expenses.filter(
    (e) => e.type === "Fuel" && e.is_full_tank && e.odometer && e.litres
  );

  if (fullTankExpenses.length < 2) {
    // Need at least 2 full tank expenses to calculate mileage
    return {
      averageMileage: null,
      latestOdometer: getLatestOdometer(expenses),
      totalDistance: null,
      totalFuel: null,
      fullTankCount: fullTankExpenses.length,
    };
  }

  // Sort full tank expenses by date and created_at
  const sortedFullTanks = [...fullTankExpenses].sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Get first full tank (earliest)
  const firstFullTank = sortedFullTanks[0];
  // Get latest/recent full tank (most recent)
  const latestFullTank = sortedFullTanks[sortedFullTanks.length - 1];

  // Calculate total distance = Latest Full Tank Odometer - First Full Tank Odometer
  const totalDistance = (latestFullTank.odometer || 0) - (firstFullTank.odometer || 0);

  // Get all fuel expenses (not just full tank) for calculating total fuel consumed
  const allFuelExpenses = expenses.filter(
    (e) => e.type === "Fuel" && e.litres
  );

  // Sum all fuel expenses litres EXCEPT the first full tank's litres
  const totalFuel = allFuelExpenses
    .filter((e) => e.id !== firstFullTank.id) // Exclude first full tank
    .reduce((sum, e) => sum + (e.litres || 0), 0);

  // Average mileage = Total Distance / Total Petrol Consumed (excluding first full tank)
  const averageMileage =
    totalFuel > 0 ? Math.round((totalDistance / totalFuel) * 10) / 10 : null;

  return {
    averageMileage,
    latestOdometer: getLatestOdometer(expenses),
    totalDistance,
    totalFuel,
    fullTankCount: fullTankExpenses.length,
  };
};

interface TimelineItemProps {
  expense: Expense;
  isLast: boolean;
  allExpenses: Expense[];
}

const TimelineItem: React.FC<TimelineItemProps> = ({ expense, isLast, allExpenses }) => {
  const config = expenseTypeConfig[expense.type] || expenseTypeConfig.Other;
  const IconComponent = config.icon;
  const date = new Date(expense.date);

  // Calculate mileage for fuel expenses
  const mileageInfo = calculateMileageForExpense(expense, allExpenses);

  return (
    <View style={styles.timelineItem}>
      {/* Timeline line */}
      <View style={styles.timelineLineContainer}>
        <View
          style={[
            styles.timelineIconCircle,
            { backgroundColor: config.bgColor },
          ]}
        >
          <IconComponent color={config.color} size={20} strokeWidth={2} />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Content */}
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <View style={styles.timelineInfo}>
            <View style={styles.timelineTitleRow}>
              <Text style={styles.timelineTitle}>{expense.type}</Text>
              {expense.type === "Fuel" && expense.is_full_tank && (
                <View style={styles.fullTankBadge}>
                  <CheckCircle color="#22c55e" size={10} />
                  <Text style={styles.fullTankText}>Full</Text>
                </View>
              )}
            </View>
            <Text style={styles.timelineDate}>{format(date, "EEEE, dd")}</Text>
          </View>
          <Text style={styles.timelineAmount}>
            ₹{expense.amount.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.timelineDetails}>
          {expense.odometer && (
            <View style={styles.timelineDetailRow}>
              <Gauge color="#71717a" size={14} />
              <Text style={styles.timelineDetailText}>
                {expense.odometer.toLocaleString()} km
              </Text>
            </View>
          )}

          {/* Fuel-specific details */}
          {expense.type === "Fuel" && expense.litres && (
            <View style={styles.timelineDetailRow}>
              <Fuel color="#71717a" size={14} />
              <Text style={styles.timelineDetailText}>
                {expense.litres} L {expense.price_per_litre ? `@ ₹${expense.price_per_litre}/L` : ""}
              </Text>
            </View>
          )}

          {/* Mileage display for full tank fuel expenses */}
          {expense.type === "Fuel" && mileageInfo.canCalculate && mileageInfo.mileage && (
            <View style={styles.mileageBadge}>
              <TrendingUp color="#22c55e" size={14} />
              <Text style={styles.mileageText}>
                {mileageInfo.mileage} km/L
              </Text>
              <Text style={styles.mileageSubtext}>
                ({mileageInfo.distance?.toLocaleString()} km / {mileageInfo.litres} L)
              </Text>
            </View>
          )}

          {/* Soft error message when mileage can't be calculated */}
          {expense.type === "Fuel" && mileageInfo.errorMessage && (
            <View style={styles.mileageWarning}>
              <AlertCircle color="#fbbf24" size={12} />
              <Text style={styles.mileageWarningText}>
                {mileageInfo.errorMessage}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

interface MonthSectionProps {
  month: string;
  expenses: Expense[];
  isFirst: boolean;
  allExpenses: Expense[];
}

// Timeline skeleton for loading state
const TimelineSkeleton = () => (
  <View style={styles.timeline}>
    {/* Month header skeleton */}
    <View style={styles.monthHeader}>
      <View style={styles.monthDotContainer}>
        <Skeleton width={12} height={12} borderRadius={6} />
      </View>
      <Skeleton
        width={120}
        height={20}
        borderRadius={6}
        style={{ marginLeft: 12 }}
      />
    </View>
    {/* Timeline items skeleton */}
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.timelineItem}>
        <View style={styles.timelineLineContainer}>
          <Skeleton width={44} height={44} borderRadius={22} />
          {i < 3 && <View style={styles.timelineLine} />}
        </View>
        <View style={[styles.timelineContent, { marginBottom: 12 }]}>
          <View style={styles.timelineHeader}>
            <View style={styles.timelineInfo}>
              <Skeleton width={80} height={18} borderRadius={6} />
              <Skeleton
                width={100}
                height={14}
                borderRadius={4}
                style={{ marginTop: 8 }}
              />
            </View>
            <Skeleton width={70} height={22} borderRadius={6} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

const MonthSection: React.FC<MonthSectionProps> = ({
  month,
  expenses,
  isFirst,
  allExpenses,
}) => {
  return (
    <View style={styles.monthSection}>
      {/* Month header with dot */}
      <View style={styles.monthHeader}>
        <View style={styles.monthDotContainer}>
          <View style={styles.monthDot} />
          {!isFirst && <View style={styles.monthLineUp} />}
        </View>
        <Text style={styles.monthTitle}>{month}</Text>
      </View>

      {/* Expenses */}
      {expenses.map((expense, index) => (
        <TimelineItem
          key={expense.id}
          expense={expense}
          isLast={index === expenses.length - 1}
          allExpenses={allExpenses}
        />
      ))}
    </View>
  );
};

export const BikeDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<BikeDetailRouteParams, "BikeDetail">>();
  const { bike } = route.params;
  const { showSuccess, showError } = useToast();

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    image_url: bike.image_url || "",
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(
    bike.image_url || null
  );

  // Refresh data when screen comes into focus (after add/edit/delete expense)
  useFocusEffect(
    useCallback(() => {
      fetchBrandsModels();
      fetchExpenses();
    }, [])
  );

  const fetchExpenses = async () => {
    try {
      const allExpenses = await apiService.getExpenses({ bike_id: bike.id });
      setExpenses(allExpenses);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoadingExpenses(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const fetchBrandsModels = async () => {
    try {
      const data = await apiService.getBrandsWithModels();
      setBrandsModels(data);
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

  const pickImage = async () => {
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

  const handleEdit = () => {
    setFormData({
      brand: currentBike.brand || "",
      model: currentBike.model,
      registration: currentBike.registration || "",
      image_url: currentBike.image_url || "",
    });
    setSelectedImage(currentBike.image_url || null);
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
      setCurrentBike({
        ...currentBike,
        brand: formData.brand,
        model: formData.model,
        registration: formData.registration,
        image_url: formData.image_url,
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

  const groupedExpenses = groupExpensesByMonth(expenses);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const mileageStats = calculateOverallMileage(expenses);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5eead4"
          />
        }
      >
        {/* Bike Image Section */}
        <LinearGradient
          colors={["rgba(130, 130, 130, 0.1)", "rgba(9, 9, 11, 0)"]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.imageSection}
        >
          <Image
            source={
              currentBike.image_url ? { uri: currentBike.image_url } : BikeImage
            }
            style={[
              styles.bikeImage,
              currentBike.image_url && styles.bikeImageCover,
            ]}
            resizeMode={currentBike.image_url ? "cover" : "contain"}
          />
        </LinearGradient>

        {/* Bike Info */}
        <View style={styles.bikeInfoSection}>
          <View style={styles.bikeInfoHeader}>
            <View>
              <Text style={styles.bikeBrand}>{currentBike.brand}</Text>
              <Text style={styles.bikeModel}>{currentBike.model}</Text>
            </View>
            {currentBike.registration && (
              <View style={styles.registrationBadge}>
                <Text style={styles.registrationText}>
                  {currentBike.registration}
                </Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{expenses.length}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹{totalExpenses.toLocaleString("en-IN")}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>

          {/* Mileage & Odometer Row */}
          <View style={styles.mileageStatsRow}>
            <View style={styles.mileageStatItem}>
              <View style={styles.mileageStatIcon}>
                <Gauge color="#5eead4" size={18} />
              </View>
              <View style={styles.mileageStatTextContainer}>
                <Text style={styles.mileageStatValue} numberOfLines={1}>
                  {mileageStats.latestOdometer
                    ? `${mileageStats.latestOdometer.toLocaleString()} km`
                    : "—"}
                </Text>
                <Text style={styles.mileageStatLabel}>Odometer</Text>
              </View>
            </View>
            <View style={styles.mileageStatItem}>
              <View style={styles.mileageStatIcon}>
                <TrendingUp color="#22c55e" size={18} />
              </View>
              <View style={styles.mileageStatTextContainer}>
                <Text style={styles.mileageStatValue}>
                  {mileageStats.averageMileage
                    ? `${mileageStats.averageMileage} km/L`
                    : "—"}
                </Text>
                <Text style={styles.mileageStatLabel} numberOfLines={1}>
                  {mileageStats.fullTankCount < 2
                    ? `+${2 - mileageStats.fullTankCount} full tank needed`
                    : "Avg Mileage"}
                </Text>
              </View>
            </View>
          </View>

          {/* Document Vault Button */}
          <TouchableOpacity
            style={styles.vaultButton}
            onPress={() => navigation.navigate("Vault", { bike: currentBike })}
          >
            <View style={styles.vaultButtonContent}>
              <View style={styles.vaultIcon}>
                <FolderOpen color="#f59e0b" size={22} />
              </View>
              <View style={styles.vaultTextContainer}>
                <Text style={styles.vaultTitle}>Document Vault</Text>
                <Text style={styles.vaultSubtitle}>
                  Store RC, Insurance, PUC & more
                </Text>
              </View>
            </View>
            <ArrowLeft
              color="#71717a"
              size={18}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>EXPENSE HISTORY</Text>

          {loadingExpenses ? (
            <TimelineSkeleton />
          ) : expenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <CircleDollarSign color="#3f3f46" size={48} />
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first expense for this bike
              </Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {groupedExpenses.map((group, index) => (
                <MonthSection
                  key={group.month}
                  month={group.month}
                  expenses={group.expenses}
                  isFirst={index === 0}
                  allExpenses={expenses}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <ModalDialog
        visible={modalVisible}
        onClose={handleModalClose}
        title="Edit Bike"
        description="Update your bike details"
        footer={<Button title="Update Bike" onPress={handleSubmit} />}
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
    width: width - 40,
    height: 180,
  },
  bikeImageCover: {
    borderRadius: 8,
  },
  bikeInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  bikeInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  bikeBrand: {
    fontSize: 14,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bikeModel: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
  },
  registrationBadge: {
    backgroundColor: "rgba(94, 234, 212, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(94, 234, 212, 0.3)",
  },
  registrationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5eead4",
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#71717a",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 16,
  },
  mileageStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  mileageStatItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  mileageStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  mileageStatTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  mileageStatValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    fontVariant: ["tabular-nums"],
  },
  mileageStatLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#71717a",
    marginTop: 2,
  },
  vaultButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  vaultButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  vaultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  vaultTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  vaultTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  vaultSubtitle: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 2,
  },
  timelineSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#71717a",
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 4,
  },
  timeline: {
    marginLeft: 8,
  },
  monthSection: {
    marginBottom: 8,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  monthDotContainer: {
    width: 40,
    alignItems: "center",
    position: "relative",
  },
  monthDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3f3f46",
  },
  monthLineUp: {
    position: "absolute",
    bottom: 12,
    width: 2,
    height: 24,
    backgroundColor: "#27272a",
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#71717a",
    marginLeft: 12,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  timelineLineContainer: {
    width: 40,
    alignItems: "center",
  },
  timelineIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#27272a",
    marginVertical: 8,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 16,
    marginLeft: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  fullTankBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fullTankText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#22c55e",
  },
  timelineDate: {
    fontSize: 13,
    color: "#71717a",
    marginTop: 2,
  },
  timelineAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5eead4",
    fontVariant: ["tabular-nums"],
  },
  timelineDetails: {
    marginTop: 12,
    gap: 6,
  },
  timelineDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timelineDetailText: {
    fontSize: 13,
    color: "#71717a",
    flex: 1,
  },
  mileageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  mileageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#22c55e",
  },
  mileageSubtext: {
    fontSize: 11,
    color: "#71717a",
  },
  mileageWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  mileageWarningText: {
    fontSize: 11,
    color: "#fbbf24",
    flex: 1,
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
