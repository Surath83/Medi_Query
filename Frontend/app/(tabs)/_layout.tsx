import { Tabs, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, ActivityIndicator, View } from "react-native";
import * as SecureStore from "expo-secure-store";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");

        if (!token) {
          router.replace("../login");
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error(error);
        router.replace("../login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return React.createElement(
      View,
      {
        style: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      },
      React.createElement(ActivityIndicator, { size: "large" })
    );
  }

  if (!authenticated) {
    return null;
  }

  return React.createElement(
    Tabs,
    {
      screenOptions: {
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      },
    },
    React.createElement(Tabs.Screen, {
      name: "index",
      options: {
        title: "Home",
        tabBarIcon: ({ color }) =>
          React.createElement(IconSymbol, {
            size: 28,
            name: "house.fill",
            color,
          }),
      },
    }),
    Platform.OS !== "web"
      ? React.createElement(Tabs.Screen, {
          name: "maps",
          options: {
            title: "Maps",
            tabBarIcon: ({ color }) =>
              React.createElement(IconSymbol, {
                size: 28,
                name: "location.fill",
                color,
              }),
          },
        })
      : null,
    React.createElement(Tabs.Screen, {
      name: "reminder",
      options: {
        title: "Reminder",
        tabBarIcon: ({ color }) =>
          React.createElement(IconSymbol, {
            size: 28,
            name: "bell.fill",
            color,
          }),
      },
    }),
    React.createElement(Tabs.Screen, {
      name: "profile",
      options: {
        title: "Profile",
        tabBarIcon: ({ color }) =>
          React.createElement(IconSymbol, {
            size: 28,
            name: "person.crop.circle.fill",
            color,
          }),
      },
    })
  );
}
