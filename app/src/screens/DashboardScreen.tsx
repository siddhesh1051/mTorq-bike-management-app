import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Plus, IndianRupee } from "lucide-react-native";
import { Card, CardHeader, CardContent, Skeleton } from "../components";
import { DashboardStats } from "../types";
import apiService from "../services/api";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";

// Skeleton for expense item
const ExpenseItemSkeleton = () => (
  <View className="flex-row justify-between items-center p-3 bg-zinc-900/50 rounded border border-white/5 mb-2">
    <View className="flex-1">
      <Skeleton width={80} height={18} borderRadius={6} />
      <Skeleton width={100} height={14} borderRadius={4} style={{ marginTop: 6 }} />
    </View>
    <Skeleton width={70} height={24} borderRadius={6} />
  </View>
);

// Full dashboard skeleton
const DashboardSkeleton = () => (
  <SafeAreaView className="flex-1 bg-background">
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 80,
      }}
    >
      {/* Header skeleton */}
      <View className="mb-6">
        <Skeleton width={180} height={40} borderRadius={8} />
        <Skeleton width={240} height={18} borderRadius={6} style={{ marginTop: 10 }} />
      </View>

      {/* Total Expenses Card skeleton */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <View className="flex-row justify-between items-center">
            <Skeleton width={100} height={14} borderRadius={4} />
            <Skeleton width={20} height={20} borderRadius={10} />
          </View>
        </CardHeader>
        <CardContent>
          <Skeleton width={160} height={36} borderRadius={8} />
        </CardContent>
      </Card>

      {/* Recent Expenses Card skeleton */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} borderRadius={10} />
            <Skeleton width={150} height={24} borderRadius={6} style={{ marginLeft: 8 }} />
          </View>
        </CardHeader>
        <CardContent>
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
        </CardContent>
      </Card>
    </ScrollView>
  </SafeAreaView>
);

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
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
        {/* Header */}
        <View className="mb-6">
          <Text className="text-white text-4xl font-bold">Dashboard</Text>
          <Text className="text-zinc-400 mt-2">
            Track your bike expenses at a glance
          </Text>
        </View>

        {/* Total Expenses */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader>
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-400 text-xs uppercase tracking-wider">
                Total Expenses
              </Text>
              <IndianRupee color="#ccfbf1" size={20} />
            </View>
          </CardHeader>
          <CardContent>
            <Text className="text-white text-3xl font-bold font-mono">
              ₹{stats?.total_expenses?.toLocaleString("en-IN") || 0}
            </Text>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader>
            <View className="flex-row items-center">
              <Calendar color="#ccfbf1" size={20} />
              <Text className="text-white text-xl font-semibold ml-2">
                Recent Expenses
              </Text>
            </View>
          </CardHeader>
          <CardContent>
            {stats?.recent_expenses && stats.recent_expenses.length > 0 ? (
              <View>
                {stats.recent_expenses.map((expense) => (
                  <View
                    key={expense.id}
                    className="flex-row justify-between items-center p-3 bg-zinc-900/50 rounded border border-white/5 mb-2"
                  >
                    <View className="flex-1">
                      <Text className="text-white font-medium">
                        {expense.type}
                      </Text>
                      <Text className="text-zinc-500 text-sm font-mono">
                        {format(new Date(expense.date), "dd MMM yyyy")}
                      </Text>
                    </View>
                    <Text className="text-primary font-bold font-mono text-lg">
                      ₹{expense.amount.toLocaleString("en-IN")}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-zinc-500 text-center py-8">
                No recent expenses
              </Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-4 right-4 bg-primary rounded-full w-16 h-16 items-center justify-center shadow-2xl"
        onPress={() => navigation.navigate("Add" as never)}
        activeOpacity={0.8}
        style={{
          shadowColor: "#ccfbf1",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus color="#115e59" size={28} strokeWidth={3} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
