import { Tabs, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ActivityIndicator,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/constants/theme";
import { useTranslation } from "@/constants/i18n";

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let token: string | null = null;

        if (Platform.OS === "web") {
          token = window.localStorage.getItem("token");
        } else {
          token = await SecureStore.getItemAsync("token");
        }

        console.log(
          "Auth token:",
          token ? "Found" : "Not found"
        );

        if (!token) {
          router.replace("/login");
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,

        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },

        tabBarButton: HapticTab,
      }}
    >

      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />

      {/* MAPS */}
      {Platform.OS !== "web" && (
        <Tabs.Screen
          name="maps"
          options={{
            title: t("tabs.maps"),
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={28}
                name="location.fill"
                color={color}
              />
            ),
          }}
        />
      )}

      {/* REMINDER */}
      <Tabs.Screen
        name="reminder"
        options={{
          title: t("tabs.reminder"),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="bell.fill"
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="person.crop.circle.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}