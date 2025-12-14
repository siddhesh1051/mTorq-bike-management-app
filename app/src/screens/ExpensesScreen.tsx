import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, Edit, Trash2 } from "lucide-react-native";
import {
  Card,
  CardContent,
  Button,
  Input,
  Picker,
  ModalDialog,
  ConfirmDialog,
} from "../components";
import { Expense, Bike, ExpenseCreate } from "../types";
import apiService from "../services/api";
import { format } from "date-fns";
import { useToast } from "../context/ToastContext";

export const ExpensesScreen = () => {
  const { showSuccess, showError } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterBike, setFilterBike] = useState("all");
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
  });

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      bike_id: expense.bike_id,
      type: expense.type,
      amount: expense.amount,
      date: expense.date,
      odometer: expense.odometer,
      notes: expense.notes || "",
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingExpense) return;

    try {
      await apiService.updateExpense(editingExpense.id, formData);
      showSuccess("Expense Updated", "Expense updated successfully!");
      setEditModalVisible(false);
      setEditingExpense(null);
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
    return matchesSearch && matchesType && matchesBike;
  });

  const typeColors: Record<string, string> = {
    Fuel: "#60a5fa",
    Service: "#f87171",
    Insurance: "#4ade80",
    Other: "#fbbf24",
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ccfbf1" />
          <Text className="text-zinc-400 mt-4">Loading expenses...</Text>
        </View>
      </SafeAreaView>
    );
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

                {/* Type Filter */}
                <Picker
                  label="Type"
                  placeholder="All Types"
                  value={filterType}
                  options={[
                    { label: "All Types", value: "all" },
                    { label: "Fuel", value: "Fuel" },
                    { label: "Service", value: "Service" },
                    { label: "Insurance", value: "Insurance" },
                    { label: "Other", value: "Other" },
                  ]}
                  onValueChange={setFilterType}
                />

                {/* Bike Filter */}
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
        }}
        title="Edit Expense"
        description="Update expense details"
      >
        <Picker
          label="Bike *"
          value={formData.bike_id}
          options={bikes.map((bike) => ({
            label: bike.model,
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
            { label: "Other", value: "Other" },
          ]}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        />

        <Input
          label="Amount (₹) *"
          placeholder="Enter amount"
          value={formData.amount.toString()}
          onChangeText={(text) =>
            setFormData({ ...formData, amount: parseFloat(text) || 0 })
          }
          keyboardType="numeric"
        />

        <Input
          label="Date *"
          placeholder="YYYY-MM-DD"
          value={formData.date}
          onChangeText={(text) => setFormData({ ...formData, date: text })}
        />

        <Input
          label="Odometer (km)"
          placeholder="Enter odometer reading"
          value={formData.odometer?.toString() || ""}
          onChangeText={(text) =>
            setFormData({
              ...formData,
              odometer: text ? parseInt(text) : undefined,
            })
          }
          keyboardType="numeric"
        />

        <Input
          label="Notes"
          placeholder="Add any notes..."
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: "top" }}
        />

        <Button
          title="Update Expense"
          onPress={handleUpdate}
          style={{ marginTop: 8 }}
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
    </SafeAreaView>
  );
};
