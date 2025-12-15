import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { AuthScreen, AddExpenseScreen, BikeDetailScreen } from "../screens";
import { MainNavigator } from "./MainNavigator";

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ccfbf1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="Add"
              component={AddExpenseScreen}
              options={{
                presentation: "transparentModal",
                animation: "fade",
                contentStyle: { backgroundColor: "transparent" },
              }}
            />
            <Stack.Screen
              name="BikeDetail"
              component={BikeDetailScreen}
              options={{
                animation: "slide_from_right",
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
