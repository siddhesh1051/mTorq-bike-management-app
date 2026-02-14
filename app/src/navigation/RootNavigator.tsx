import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { AuthScreen, AddExpenseScreen, BikeDetailScreen, VaultScreen } from "../screens";
import { MainNavigator } from "./MainNavigator";
import analyticsService from "../services/analytics";

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user, loading } = useAuth();
  const navigationRef = React.useRef<any>(null);
  const routeNameRef = React.useRef<string | undefined>();

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ccfbf1" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        // Save the initial route name
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName && currentRouteName) {
          // Track screen view
          await analyticsService.trackScreenView(currentRouteName);
        }

        // Save the current route name for next comparison
        routeNameRef.current = currentRouteName;
      }}
    >
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
            <Stack.Screen
              name="Vault"
              component={VaultScreen}
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
