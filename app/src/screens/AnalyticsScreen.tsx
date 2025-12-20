import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrendingUp, PieChart } from "lucide-react-native";
import { Card, CardHeader, CardContent, Skeleton } from "../components";
import { DashboardStats } from "../types";
import apiService from "../services/api";

// Category breakdown item skeleton
const CategoryItemSkeleton = () => (
  <View className="mb-4">
    <View className="flex-row justify-between mb-2">
      <Skeleton width={80} height={16} borderRadius={4} />
      <Skeleton width={70} height={16} borderRadius={4} />
    </View>
    <Skeleton width="100%" height={8} borderRadius={4} />
  </View>
);

// Full analytics skeleton
const AnalyticsSkeleton = () => (
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
        <Skeleton width={160} height={40} borderRadius={8} />
        <Skeleton width={220} height={18} borderRadius={6} style={{ marginTop: 10 }} />
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

      {/* Category Breakdown Card skeleton */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} borderRadius={10} />
            <Skeleton width={170} height={24} borderRadius={6} style={{ marginLeft: 8 }} />
          </View>
        </CardHeader>
        <CardContent>
          <CategoryItemSkeleton />
          <CategoryItemSkeleton />
          <CategoryItemSkeleton />
          <CategoryItemSkeleton />
          <CategoryItemSkeleton />
        </CardContent>
      </Card>
    </ScrollView>
  </SafeAreaView>
);

export const AnalyticsScreen = () => {
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
      console.error("Failed to load analytics data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const categoryColors: Record<string, string> = {
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
    return <AnalyticsSkeleton />;
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
          <Text className="text-white text-4xl font-bold">Analytics</Text>
          <Text className="text-zinc-400 mt-2">
            Insights into your spending patterns
          </Text>
        </View>

        {/* Total Expenses Card */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader>
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-400 text-xs uppercase tracking-wider">
                Total Expenses
              </Text>
              <PieChart color="#ccfbf1" size={20} />
            </View>
          </CardHeader>
          <CardContent>
            <Text className="text-white text-3xl font-bold font-mono">
              ₹{stats?.total_expenses?.toLocaleString("en-IN") || 0}
            </Text>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader>
            <View className="flex-row items-center">
              <TrendingUp color="#ccfbf1" size={20} />
              <Text className="text-white text-xl font-semibold ml-2">
                Category Breakdown
              </Text>
            </View>
          </CardHeader>
          <CardContent>
            {stats?.category_breakdown &&
            Object.keys(stats.category_breakdown).length > 0 ? (
              <View>
                {Object.entries(stats.category_breakdown).map(
                  ([category, amount]) => (
                    <View key={category} className="mb-4">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-zinc-300 font-medium">
                          {category}
                        </Text>
                        <Text className="text-white font-bold font-mono">
                          ₹{amount.toLocaleString("en-IN")}
                        </Text>
                      </View>
                      <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${(amount / stats.total_expenses) * 100}%`,
                            backgroundColor:
                              categoryColors[category] || "#fbbf24",
                          }}
                        />
                      </View>
                    </View>
                  )
                )}
              </View>
            ) : (
              <Text className="text-zinc-500 text-center py-8">
                No expenses recorded yet
              </Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

