import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Plus, X, Calendar } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Card,
  CardHeader,
  CardContent,
  Input,
  Button,
  Picker,
} from "../components";
import { Bike, ExpenseCreate } from "../types";
import apiService from "../services/api";
import { useToast } from "../context/ToastContext";
import { format } from "date-fns";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const { showSuccess, showError } = useToast();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState<ExpenseCreate>({
    bike_id: "",
    type: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    odometer: undefined,
    notes: "",
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in on mount
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const data = await apiService.getBikes();
      setBikes(data);
    } catch (error: any) {
      console.error("Error loading bikes:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to load bikes";
      showError("Load Failed", errorMessage);
    }
  };

  const handleSubmit = async () => {
    if (!formData.bike_id || !formData.type || !formData.amount) {
      showError("Missing Fields", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await apiService.createExpense(formData);
      showSuccess("Expense Added", "Expense added successfully!");
      setTimeout(() => {
        animateOut();
      }, 800);
    } catch (error: any) {
      console.error("Error adding expense:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to add expense";
      showError("Add Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const animateOut = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
      navigation.goBack();
    });
  };

  const handleClose = () => {
    animateOut();
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

  return (
    <View className="flex-1">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          className="absolute inset-0 bg-black"
          style={{
            opacity: backdropAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.7],
            }),
          }}
        />
      </TouchableWithoutFeedback>

      {/* Modal Content */}
      <Animated.View
        className="flex-1"
        style={{
          transform: [{ translateY: slideAnim }],
        }}
      >
        <SafeAreaView className="flex-1 bg-background">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/10">
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold">
                  Add Expense
                </Text>
                <Text className="text-zinc-400 text-sm mt-1">
                  Record a new bike expense
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="w-10 h-10 items-center justify-center rounded-full bg-white/5 border border-white/10"
                activeOpacity={0.7}
              >
                <X color="#ccfbf1" size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 80,
              }}
              keyboardShouldPersistTaps="handled"
            >
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
                      label: bike.model,
                      value: bike.id,
                    }))}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bike_id: value })
                    }
                  />

                  {/* Type Selection */}
                  <Picker
                    label="Type *"
                    placeholder="Select type"
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  />

                  {/* Amount */}
                  <Input
                    label="Amount (₹) *"
                    placeholder="Enter amount"
                    value={formData.amount ? formData.amount.toString() : ""}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(text) || 0,
                      })
                    }
                    keyboardType="numeric"
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

                  {/* Odometer */}
                  <Input
                    label="Odometer (km)"
                    placeholder="Enter odometer reading"
                    value={
                      formData.odometer ? formData.odometer.toString() : ""
                    }
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
                    onChangeText={(text) =>
                      setFormData({ ...formData, notes: text })
                    }
                    multiline
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: "top" }}
                  />

                  <Button
                    title={loading ? "Adding..." : "Add Expense"}
                    onPress={handleSubmit}
                    loading={loading}
                    style={{ marginTop: 8 }}
                  />
                </CardContent>
              </Card>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>

      {/* Date Picker */}
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
    </View>
  );
};
