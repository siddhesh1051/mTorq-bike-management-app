import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IndianRupee, TrendingUp, Bike as BikeIcon, Calendar } from 'lucide-react-native';
import { Card, CardHeader, CardContent } from '../components';
import { DashboardStats } from '../types';
import apiService from '../services/api';
import { format } from 'date-fns';

export const DashboardScreen = () => {
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
      console.error('Failed to load dashboard data:', error);
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
    Fuel: '#60a5fa',
    Service: '#f87171',
    Insurance: '#4ade80',
    Other: '#fbbf24',
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ccfbf1" />
          <Text className="text-zinc-400 mt-4">Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
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
          <Text className="text-zinc-400 mt-2">Track your bike expenses at a glance</Text>
        </View>

        {/* Stats Grid */}
        <View className="mb-4">
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
                ₹{stats?.total_expenses?.toLocaleString('en-IN') || 0}
              </Text>
            </CardContent>
          </Card>

          {/* Total Bikes */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader>
              <View className="flex-row justify-between items-center">
                <Text className="text-zinc-400 text-xs uppercase tracking-wider">
                  Total Bikes
                </Text>
                <BikeIcon color="#ccfbf1" size={20} />
              </View>
            </CardHeader>
            <CardContent>
              <Text className="text-white text-3xl font-bold font-mono">
                {stats?.total_bikes || 0}
              </Text>
            </CardContent>
          </Card>
        </View>

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
                {Object.entries(stats.category_breakdown).map(([category, amount]) => (
                  <View key={category} className="mb-4">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-zinc-300 font-medium">{category}</Text>
                      <Text className="text-white font-bold font-mono">
                        ₹{amount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${(amount / stats.total_expenses) * 100}%`,
                          backgroundColor: categoryColors[category] || '#fbbf24',
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-zinc-500 text-center py-8">
                No expenses recorded yet
              </Text>
            )}
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
                      <Text className="text-white font-medium">{expense.type}</Text>
                      <Text className="text-zinc-500 text-sm font-mono">
                        {format(new Date(expense.date), 'dd MMM yyyy')}
                      </Text>
                    </View>
                    <Text className="text-primary font-bold font-mono text-lg">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-zinc-500 text-center py-8">No recent expenses</Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
