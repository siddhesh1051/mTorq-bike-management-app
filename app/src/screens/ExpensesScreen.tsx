import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Edit, Trash2, Calendar, Fuel } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Card,
  CardContent,
  Button,
  Input,
  Picker,
  ModalDialog,
  ConfirmDialog,
  Skeleton,
} from "../components";
import { Expense, Bike, ExpenseCreate } from "../types";
import apiService from "../services/api";
import { format } from "date-fns";
import { useToast } from "../context/ToastContext";

// Expense card skeleton
const ExpenseCardSkeleton = () => (
  <Card style={{ marginBottom: 12 }}>
    <CardContent>
      <View className="flex-row justify-between">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-2">
            <Skeleton width={70} height={24} borderRadius={12} />
          </View>
          <Skeleton width={140} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width={100} height={28} borderRadius={6} style={{ marginBottom: 6 }} />
          <Skeleton width={90} height={14} borderRadius={4} />
        </View>
        <View className="gap-2">
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>
      </View>
    </CardContent>
  </Card>
);

// Expenses screen skeleton
const ExpensesScreenSkeleton = () => (
  <SafeAreaView className="flex-1 bg-background">
    <View className="flex-1">
      {/* Header skeleton */}
      <View className="px-5 py-4 border-b border-white/10">
        <Skeleton width={130} height={32} borderRadius={8} />
        <Skeleton width={200} height={16} borderRadius={6} style={{ marginTop: 8 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 80,
        }}
      >
        {/* Filters skeleton */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            {/* Search skeleton */}
            <View className="mb-4">
              <Skeleton width="100%" height={48} borderRadius={8} />
            </View>
            {/* Type & Bike Filters skeleton */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Skeleton width={40} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={48} borderRadius={8} />
              </View>
              <View className="flex-1">
                <Skeleton width={30} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={48} borderRadius={8} />
              </View>
            </View>
            {/* Date range skeleton */}
            <View className="mt-4">
              <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
              <View className="flex-row gap-3">
                <Skeleton width="48%" height={48} borderRadius={8} />
                <Skeleton width="48%" height={48} borderRadius={8} />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Expense cards skeleton */}
        <ExpenseCardSkeleton />
        <ExpenseCardSkeleton />
        <ExpenseCardSkeleton />
      </ScrollView>
    </View>
  </SafeAreaView>
);

export const ExpensesScreen = () => {
  const { showSuccess, showError } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterBike, setFilterBike] = useState("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseCreate>({
    bike_id: "",
    type: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    odometer: undefined,
    notes: "",
    // Fuel-specific fields
    litres: undefined,
    is_full_tank: false,
    price_per_litre: undefined,
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Raw string values for decimal inputs (to allow typing "5." without it becoming "5")
  const [pricePerLitreText, setPricePerLitreText] = useState("");
  const [litresText, setLitresText] = useState("");
  // Track which fuel field was last edited to determine auto-fill direction
  const [lastEditedFuelField, setLastEditedFuelField] = useState<"price" | "litres" | null>(null);

  // Refresh data when screen comes into focus (after add/edit/delete)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [expensesData, bikesData] = await Promise.all([
        apiService.getExpenses(),
        apiService.getBikes(),
      ]);
      setExpenses(expensesData);
      setBikes(bikesData);
    } catch (error: any) {
      console.error("Failed to load expenses:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to load expenses";
      showError("Load Failed", errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Auto-calculate: Amount is always entered first
  // If user enters Price → calculate Litres = Amount / Price
  // If user enters Litres → calculate Price = Amount / Litres
  useEffect(() => {
    if (formData.type !== "Fuel" || !editModalVisible) return;
    
    const amount = formData.amount;
    const price = formData.price_per_litre;
    const litres = formData.litres;

    // Only calculate if we have amount
    if (!amount || amount <= 0) return;

    if (lastEditedFuelField === "price" && price && price > 0) {
      // User entered price, calculate litres = amount / price
      const calculated = Math.round((amount / price) * 100) / 100;
      if (calculated !== litres) {
        setLitresText(calculated.toString());
        setFormData(prev => ({ ...prev, litres: calculated }));
      }
    } else if (lastEditedFuelField === "litres" && litres && litres > 0) {
      // User entered litres, calculate price = amount / litres
      const calculated = Math.round((amount / litres) * 100) / 100;
      if (calculated !== price) {
        setPricePerLitreText(calculated.toString());
        setFormData(prev => ({ ...prev, price_per_litre: calculated }));
      }
    }
  }, [formData.amount, formData.price_per_litre, formData.litres, formData.type, lastEditedFuelField, editModalVisible]);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    const expenseDate = new Date(expense.date);
    setSelectedDate(expenseDate);
    setFormData({
      bike_id: expense.bike_id,
      type: expense.type,
      amount: expense.amount,
      date: expense.date,
      odometer: expense.odometer,
      notes: expense.notes || "",
      // Fuel-specific fields
      litres: expense.litres,
      is_full_tank: expense.is_full_tank || false,
      price_per_litre: expense.price_per_litre,
    });
    // Set text values for fuel fields
    setPricePerLitreText(expense.price_per_litre ? expense.price_per_litre.toString() : "");
    setLitresText(expense.litres ? expense.litres.toString() : "");
    setLastEditedFuelField(null);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingExpense) return;

    try {
      await apiService.updateExpense(editingExpense.id, formData);
      showSuccess("Expense Updated", "Expense updated successfully!");
      setEditModalVisible(false);
      setEditingExpense(null);
      // Reset form data
      setFormData({
        bike_id: "",
        type: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        odometer: undefined,
        notes: "",
        litres: undefined,
        is_full_tank: false,
        price_per_litre: undefined,
      });
      setPricePerLitreText("");
      setLitresText("");
      setLastEditedFuelField(null);
      fetchData();
    } catch (error: any) {
      console.error("Error updating expense:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to update expense";
      showError("Update Failed", errorMessage);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
    }
  };

  const handleDatePickerConfirm = () => {
    setShowDatePicker(false);
  };

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await apiService.deleteExpense(expenseToDelete.id);
      showSuccess("Expense Deleted", "Expense deleted successfully!");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to delete expense";
      showError("Delete Failed", errorMessage);
    } finally {
      setDeleteDialogVisible(false);
      setExpenseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setExpenseToDelete(null);
  };

  const getBikeName = (bikeId: string) => {
    const bike = bikes.find((b) => b.id === bikeId);
    if (!bike) return "Unknown Bike";
    const bikeName = `${bike.brand || ""} ${bike.model}`.trim();
    return bike.registration ? `${bikeName} (${bike.registration})` : bikeName;
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = search
      ? expense.notes?.toLowerCase().includes(search.toLowerCase()) ||
        expense.type.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesType =
      filterType !== "all" ? expense.type === filterType : true;
    const matchesBike =
      filterBike !== "all" ? expense.bike_id === filterBike : true;
    
    // Date range filtering
    const expenseDate = new Date(expense.date);
    const matchesStartDate = startDate
      ? expenseDate >= new Date(startDate.setHours(0, 0, 0, 0))
      : true;
    const matchesEndDate = endDate
      ? expenseDate <= new Date(endDate.setHours(23, 59, 59, 999))
      : true;
    
    return matchesSearch && matchesType && matchesBike && matchesStartDate && matchesEndDate;
  });

  const handleStartDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowStartDatePicker(false);
    }
    if (date) {
      setTempDate(date);
      if (Platform.OS === "android") {
        setStartDate(date);
      }
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowEndDatePicker(false);
    }
    if (date) {
      setTempDate(date);
      if (Platform.OS === "android") {
        setEndDate(date);
      }
    }
  };

  const confirmStartDate = () => {
    setStartDate(tempDate);
    setShowStartDatePicker(false);
  };

  const confirmEndDate = () => {
    setEndDate(tempDate);
    setShowEndDatePicker(false);
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const typeColors: Record<string, string> = {
    Fuel: "#60a5fa",
    Service: "#f87171",
    Insurance: "#4ade80",
    PUC: "#a3e635",
    Tyres: "#818cf8",
    Battery: "#f472b6",
    "Spare Parts": "#fb7185",
    Repair: "#ef4444",
    Accessories: "#38bdf8",
    Gear: "#0ea5e9",
    Modification: "#8b5cf6",
    Toll: "#94a3b8",
    Parking: "#64748b",
    Washing: "#06b6d4",
    "Registration/RTO": "#34d399",
    "Fines/Challan": "#f43f5e",
    EMI: "#10b981",
    Other: "#fbbf24",
  };

  if (loading) {
    return <ExpensesScreenSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 py-4 border-b border-white/10">
          <Text className="text-white text-3xl font-bold">Expenses</Text>
          <Text className="text-zinc-400 mt-1">
            View and manage all expenses
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
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
          {/* Filters */}
          <View>
            <Card style={{ marginBottom: 16 }}>
              <CardContent>
                {/* Search */}
                <View className="mb-4">
                  <View className="flex-row items-center h-12 bg-zinc-900/50 border border-white/10 rounded-lg px-4">
                    <Search color="#71717a" size={20} />
                    <TextInput
                      placeholder="Search by notes or type..."
                      placeholderTextColor="#71717a"
                      value={search}
                      onChangeText={setSearch}
                      className="flex-1 ml-2 text-white"
                    />
                  </View>
                </View>

                {/* Type & Bike Filters */}
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Picker
                      label="Type"
                      placeholder="All Types"
                      value={filterType}
                      options={[
                        { label: "All Types", value: "all" },
                        { label: "Fuel", value: "Fuel" },
                        { label: "Service", value: "Service" },
                        { label: "Insurance", value: "Insurance" },
                        { label: "PUC", value: "PUC" },
                        { label: "Tyres", value: "Tyres" },
                        { label: "Battery", value: "Battery" },
                        { label: "Spare Parts", value: "Spare Parts" },
                        { label: "Repair", value: "Repair" },
                        { label: "Accessories", value: "Accessories" },
                        { label: "Gear", value: "Gear" },
                        { label: "Modification", value: "Modification" },
                        { label: "Toll", value: "Toll" },
                        { label: "Parking", value: "Parking" },
                        { label: "Washing", value: "Washing" },
                        { label: "Registration/RTO", value: "Registration/RTO" },
                        { label: "Fines/Challan", value: "Fines/Challan" },
                        { label: "EMI", value: "EMI" },
                        { label: "Other", value: "Other" },
                      ]}
                      onValueChange={setFilterType}
                    />
                  </View>
                  <View className="flex-1">
                    <Picker
                      label="Bike"
                      placeholder="All Bikes"
                      value={filterBike}
                      options={[
                        { label: "All Bikes", value: "all" },
                        ...bikes.map((bike) => ({
                          label: `${bike.brand || ""} ${bike.model}`.trim(),
                          value: bike.id,
                        })),
                      ]}
                      onValueChange={setFilterBike}
                    />
                  </View>
                </View>

                {/* Date Range Filter */}
                <View className="mt-2">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-zinc-300 text-sm">Date Range</Text>
                    {(startDate || endDate) && (
                      <TouchableOpacity onPress={clearDateFilter}>
                        <Text className="text-primary text-sm">Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View className="flex-row gap-3">
                    {/* Start Date */}
                    <TouchableOpacity
                      className="flex-1 h-12 bg-zinc-900/50 border border-white/10 rounded-lg px-4 flex-row justify-between items-center"
                      onPress={() => {
                        setTempDate(startDate || new Date());
                        setShowStartDatePicker(true);
                      }}
                    >
                      <Text className={startDate ? "text-white" : "text-zinc-500"}>
                        {startDate ? format(startDate, "dd MMM yyyy") : "From"}
                      </Text>
                      <Calendar color="#71717a" size={18} />
                    </TouchableOpacity>

                    {/* End Date */}
                    <TouchableOpacity
                      className="flex-1 h-12 bg-zinc-900/50 border border-white/10 rounded-lg px-4 flex-row justify-between items-center"
                      onPress={() => {
                        setTempDate(endDate || new Date());
                        setShowEndDatePicker(true);
                      }}
                    >
                      <Text className={endDate ? "text-white" : "text-zinc-500"}>
                        {endDate ? format(endDate, "dd MMM yyyy") : "To"}
                      </Text>
                      <Calendar color="#71717a" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Expenses List */}
            {filteredExpenses.length === 0 ? (
              <Card>
                <CardContent>
                  <Text className="text-zinc-500 text-center py-8">
                    {expenses.length === 0
                      ? "No expenses recorded yet. Add your first expense!"
                      : "No expenses match your filters."}
                  </Text>
                </CardContent>
              </Card>
            ) : (
              filteredExpenses.map((expense) => (
                <Card key={expense.id} style={{ marginBottom: 12 }}>
                  <CardContent>
                    <View className="flex-row justify-between">
                      <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                          <View
                            className="px-3 py-1 rounded-full mr-2"
                            style={{
                              backgroundColor: `${typeColors[expense.type]}20`,
                            }}
                          >
                            <Text
                              className="text-xs font-medium"
                              style={{ color: typeColors[expense.type] }}
                            >
                              {expense.type}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-zinc-500 text-sm mb-2">
                          {getBikeName(expense.bike_id)}
                        </Text>
                        <Text className="text-primary text-2xl font-bold font-mono mb-1">
                          ₹{expense.amount.toLocaleString("en-IN")}
                        </Text>
                        <Text className="text-zinc-500 text-sm font-mono">
                          {format(new Date(expense.date), "dd MMM yyyy")}
                        </Text>
                        {expense.odometer && (
                          <Text className="text-zinc-500 text-sm font-mono">
                            {expense.odometer.toLocaleString()} km
                          </Text>
                        )}
                        {expense.notes && (
                          <Text className="text-zinc-400 text-sm mt-2">
                            {expense.notes}
                          </Text>
                        )}
                      </View>
                      <View className="gap-2">
                        <TouchableOpacity
                          className="border border-white/10 rounded-full w-10 h-10 items-center justify-center"
                          onPress={() => handleEdit(expense)}
                        >
                          <Edit color="#d4d4d8" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="border border-red-500/20 rounded-full w-10 h-10 items-center justify-center"
                          onPress={() => handleDelete(expense)}
                        >
                          <Trash2 color="#f87171" size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Edit Modal */}
      <ModalDialog
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingExpense(null);
          // Reset form data
          setFormData({
            bike_id: "",
            type: "",
            amount: 0,
            date: new Date().toISOString().split("T")[0],
            odometer: undefined,
            notes: "",
            litres: undefined,
            is_full_tank: false,
            price_per_litre: undefined,
          });
          setPricePerLitreText("");
          setLitresText("");
          setLastEditedFuelField(null);
          setSelectedDate(new Date());
        }}
        title="Edit Expense"
        description="Update expense details"
        footer={<Button title="Update Expense" onPress={handleUpdate} />}
      >
        <Picker
          label="Bike *"
          value={formData.bike_id}
          options={bikes.map((bike) => ({
            label: `${bike.brand ? bike.brand + ' ' : ''}${bike.model}`,
            value: bike.id,
          }))}
          onValueChange={(value) =>
            setFormData({ ...formData, bike_id: value })
          }
        />

        <Picker
          label="Type *"
          value={formData.type}
          options={[
            { label: "Fuel", value: "Fuel" },
            { label: "Service", value: "Service" },
            { label: "Insurance", value: "Insurance" },
            { label: "PUC", value: "PUC" },
            { label: "Tyres", value: "Tyres" },
            { label: "Battery", value: "Battery" },
            { label: "Spare Parts", value: "Spare Parts" },
            { label: "Repair", value: "Repair" },
            { label: "Accessories", value: "Accessories" },
            { label: "Gear", value: "Gear" },
            { label: "Modification", value: "Modification" },
            { label: "Toll", value: "Toll" },
            { label: "Parking", value: "Parking" },
            { label: "Washing", value: "Washing" },
            { label: "Registration/RTO", value: "Registration/RTO" },
            { label: "Fines/Challan", value: "Fines/Challan" },
            { label: "EMI", value: "EMI" },
            { label: "Other", value: "Other" },
          ]}
          onValueChange={(value) => {
            if (value !== "Fuel") {
              // Reset fuel-specific fields when type is not Fuel
              setFormData({
                ...formData,
                type: value,
                litres: undefined,
                is_full_tank: false,
                price_per_litre: undefined,
              });
              setPricePerLitreText("");
              setLitresText("");
              setLastEditedFuelField(null);
            } else {
              setFormData({ ...formData, type: value });
            }
          }}
        />

        <Input
          label="Amount (₹) *"
          placeholder="Enter amount"
          value={formData.amount ? formData.amount.toString() : ""}
          onChangeText={(text) => {
            // Allow empty, numbers, and decimal point
            const cleanText = text.replace(/[^0-9.]/g, '');
            const parts = cleanText.split('.');
            const sanitized = parts.length > 2 
              ? parts[0] + '.' + parts.slice(1).join('')
              : cleanText;
            const numValue = parseFloat(sanitized);
            setFormData({
              ...formData,
              amount: !isNaN(numValue) ? numValue : 0,
            });
            // Reset fuel fields when amount changes so user can re-enter
            if (formData.type === "Fuel") {
              setPricePerLitreText("");
              setLitresText("");
              setFormData(prev => ({
                ...prev,
                amount: !isNaN(numValue) ? numValue : 0,
                price_per_litre: undefined,
                litres: undefined,
              }));
              setLastEditedFuelField(null);
            }
          }}
          keyboardType="decimal-pad"
        />

        {/* Date */}
        <View className="mb-4">
          <Text className="text-zinc-300 mb-2 text-sm">Date *</Text>
          <TouchableOpacity
            className="h-12 bg-zinc-900/50 border border-white/10 rounded-lg px-4 flex-row justify-between items-center"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-white">
              {format(selectedDate, "dd MMM yyyy")}
            </Text>
            <Calendar color="#71717a" size={20} />
          </TouchableOpacity>
        </View>

        <Input
          label="Odometer (km)"
          placeholder="Enter odometer reading"
          value={formData.odometer ? formData.odometer.toString() : ""}
          onChangeText={(text) =>
            setFormData({
              ...formData,
              odometer: text ? parseInt(text) : undefined,
            })
          }
          keyboardType="numeric"
        />

        {/* Fuel-specific fields - only show when type is Fuel */}
        {formData.type === "Fuel" && (
          <View className="mt-2 mb-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <View className="flex-row items-center mb-4">
              <Fuel color="#3b82f6" size={20} />
              <Text className="text-blue-400 text-base font-semibold ml-2">
                Fuel Details
              </Text>
              <Text className="text-zinc-500 text-xs ml-2">
                (Optional)
              </Text>
            </View>

            {/* Price per litre */}
            <Input
              label="Price per Litre (₹)"
              placeholder="e.g., 104.50"
              value={pricePerLitreText}
              onChangeText={(text) => {
                // Allow empty, numbers, and decimal point
                const cleanText = text.replace(/[^0-9.]/g, '');
                // Ensure only one decimal point
                const parts = cleanText.split('.');
                const sanitized = parts.length > 2 
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : cleanText;
                setPricePerLitreText(sanitized);
                setLastEditedFuelField("price");
                const numValue = parseFloat(sanitized);
                setFormData({
                  ...formData,
                  price_per_litre: !isNaN(numValue) ? numValue : undefined,
                });
              }}
              keyboardType="decimal-pad"
            />

            {/* Litres */}
            <Input
              label="Litres Filled"
              placeholder="e.g., 5.5"
              value={litresText}
              onChangeText={(text) => {
                // Allow empty, numbers, and decimal point
                const cleanText = text.replace(/[^0-9.]/g, '');
                // Ensure only one decimal point
                const parts = cleanText.split('.');
                const sanitized = parts.length > 2 
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : cleanText;
                setLitresText(sanitized);
                setLastEditedFuelField("litres");
                const numValue = parseFloat(sanitized);
                setFormData({
                  ...formData,
                  litres: !isNaN(numValue) ? numValue : undefined,
                });
              }}
              keyboardType="decimal-pad"
            />

            {/* Auto-calculation info */}
            {(() => {
              const hasAmount = formData.amount && formData.amount > 0;
              const hasPrice = formData.price_per_litre && formData.price_per_litre > 0;
              const hasLitres = formData.litres && formData.litres > 0;
              
              if (hasAmount && hasPrice && hasLitres) {
                const calculatedMessage = lastEditedFuelField === "price"
                  ? `Litres: ${formData.litres?.toFixed(2)}L (₹${formData.amount} ÷ ₹${formData.price_per_litre})`
                  : `Price: ₹${formData.price_per_litre?.toFixed(2)}/L (₹${formData.amount} ÷ ${formData.litres}L)`;
                
                return (
                  <View className="bg-green-500/10 rounded-lg p-3 mb-4 border border-green-500/20">
                    <Text className="text-green-400 text-xs">
                      ✓ Auto-filled: {calculatedMessage}
                    </Text>
                  </View>
                );
              }
              
              // Show hint if amount is entered but fuel details are empty
              if (hasAmount && !hasPrice && !hasLitres) {
                return (
                  <View className="bg-blue-500/10 rounded-lg p-3 mb-4 border border-blue-500/20">
                    <Text className="text-blue-400 text-xs">
                      💡 Enter price or litres - the other will be auto-calculated
                    </Text>
                  </View>
                );
              }
              
              return null;
            })()}

            {/* Full Tank Checkbox */}
            <View className="flex-row items-center justify-between mb-2 py-2">
              <View className="flex-1">
                <Text className="text-zinc-300 text-sm font-medium">
                  Full Tank
                </Text>
                <Text className="text-zinc-500 text-xs mt-1">
                  Enable to track mileage between refuels
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setFormData({
                    ...formData,
                    is_full_tank: !formData.is_full_tank,
                  })
                }
                className={`w-12 h-7 rounded-full flex-row items-center px-0.5 ${
                  formData.is_full_tank
                    ? "bg-blue-500"
                    : "bg-zinc-700"
                }`}
              >
                <View
                  className={`w-6 h-6 rounded-full bg-white shadow-md ${
                    formData.is_full_tank ? "ml-5" : "ml-0"
                  }`}
                />
              </TouchableOpacity>
            </View>

            {formData.is_full_tank && (
              <View className="bg-blue-500/10 rounded-lg p-3 mt-2 border border-blue-500/20">
                <Text className="text-blue-300 text-xs">
                  Mileage will be calculated when you add your next full tank refuel
                </Text>
              </View>
            )}
          </View>
        )}

        <Input
          label="Notes"
          placeholder="Add any notes..."
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: "top" }}
        />
      </ModalDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Start Date Picker */}
      {Platform.OS === "ios" ? (
        <Modal
          visible={showStartDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStartDatePicker(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/80 justify-end"
            activeOpacity={1}
            onPress={() => setShowStartDatePicker(false)}
          >
            <View className="bg-zinc-900 rounded-t-2xl border-t border-white/10">
              <View className="flex-row justify-between items-center px-4 py-3 border-b border-white/10">
                <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                  <Text className="text-zinc-400 text-base">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-white text-base font-semibold">
                  From Date
                </Text>
                <TouchableOpacity onPress={confirmStartDate}>
                  <Text className="text-primary text-base font-semibold">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleStartDateChange}
                maximumDate={endDate || new Date()}
                textColor="#ffffff"
                style={{ height: 200 }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      ) : (
        showStartDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            maximumDate={endDate || new Date()}
          />
        )
      )}

      {/* End Date Picker */}
      {Platform.OS === "ios" ? (
        <Modal
          visible={showEndDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEndDatePicker(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/80 justify-end"
            activeOpacity={1}
            onPress={() => setShowEndDatePicker(false)}
          >
            <View className="bg-zinc-900 rounded-t-2xl border-t border-white/10">
              <View className="flex-row justify-between items-center px-4 py-3 border-b border-white/10">
                <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                  <Text className="text-zinc-400 text-base">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-white text-base font-semibold">
                  To Date
                </Text>
                <TouchableOpacity onPress={confirmEndDate}>
                  <Text className="text-primary text-base font-semibold">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleEndDateChange}
                minimumDate={startDate || undefined}
                maximumDate={new Date()}
                textColor="#ffffff"
                style={{ height: 200 }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      ) : (
        showEndDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            minimumDate={startDate || undefined}
            maximumDate={new Date()}
          />
        )
      )}

      {/* Edit Modal Date Picker */}
      {Platform.OS === "ios" ? (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <View className="flex-1 bg-black/80 justify-end">
              <TouchableWithoutFeedback>
                <View className="bg-zinc-900 rounded-t-2xl border-t border-white/10">
                  <View className="flex-row justify-between items-center px-4 py-3 border-b border-white/10">
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text className="text-zinc-400 text-base">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-white text-base font-semibold">
                      Select Date
                    </Text>
                    <TouchableOpacity onPress={handleDatePickerConfirm}>
                      <Text className="text-primary text-base font-semibold">
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    textColor="#ffffff"
                    style={{ height: 200 }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}
    </SafeAreaView>
  );
};
