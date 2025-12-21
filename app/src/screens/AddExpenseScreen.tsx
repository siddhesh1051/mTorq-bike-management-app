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
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { Plus, X, Calendar, Fuel, Check, PlusCircle } from "lucide-react-native";
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
    // Fuel-specific fields
    litres: undefined,
    is_full_tank: false,
    price_per_litre: undefined,
  });

  // Raw string values for decimal inputs (to allow typing "5." without it becoming "5")
  const [pricePerLitreText, setPricePerLitreText] = useState("");
  const [litresText, setLitresText] = useState("");
  
  // Track which fuel field was last edited to determine auto-fill direction
  // User enters Amount first, then enters either price OR litres - we calculate the other
  const [lastEditedFuelField, setLastEditedFuelField] = useState<"price" | "litres" | null>(null);

  // Auto-calculate: Amount is always entered first
  // If user enters Price → calculate Litres = Amount / Price
  // If user enters Litres → calculate Price = Amount / Litres
  useEffect(() => {
    if (formData.type !== "Fuel") return;
    
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
  }, [formData.amount, formData.price_per_litre, formData.litres, formData.type, lastEditedFuelField]);

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
                    options={[
                      ...bikes.map((bike) => ({
                        label: `${bike.brand ? bike.brand + ' ' : ''}${bike.model}`,
                        value: bike.id,
                      })),
                      { label: "+ Add New Bike", value: "__ADD_NEW_BIKE__" },
                    ]}
                    onValueChange={(value) => {
                      if (value === "__ADD_NEW_BIKE__") {
                        // Navigate to Bikes tab to add new bike
                        navigation.dispatch(
                          CommonActions.reset({
                            index: 0,
                            routes: [
                              {
                                name: "Main",
                                state: {
                                  routes: [{ name: "Bikes" }],
                                  index: 0,
                                },
                              },
                            ],
                          })
                        );
                      } else {
                        setFormData({ ...formData, bike_id: value });
                      }
                    }}
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

                  {/* Amount */}
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
