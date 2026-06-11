import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminVerificationScreen from "../screens/admin/AdminVerificationScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminServicesScreen from "../screens/admin/AdminServicesScreen";
import AdminVendorNotificationsScreen from "../screens/admin/AdminVendorNotificationsScreen";

// These two screens remain available for navigation,
// but they will NOT show in bottom tab bar.
import AdminApprovalsScreen from "../screens/admin/AdminApprovalsScreen";
import AdminNotificationsScreen from "../screens/admin/AdminNotificationsScreen";

import { COLORS } from "../constants/colors";

const Tab = createBottomTabNavigator();

function TabIcon({ focused, icon, label }) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? icon : `${icon}-outline`}
        size={22}
        color={focused ? COLORS.primary : COLORS.muted}
      />

      <Text style={[styles.tabText, focused && { color: COLORS.primary }]}>
        {label}
      </Text>
    </View>
  );
}

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="grid" label="Home" />
          ),
        }}
      />

      <Tab.Screen
        name="AdminVerification"
        component={AdminVerificationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="shield-checkmark" label="Verify" />
          ),
        }}
      />

      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="people" label="Users" />
          ),
        }}
      />

      <Tab.Screen
        name="AdminServices"
        component={AdminServicesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="business" label="Services" />
          ),
        }}
      />

      {/* Hidden screen: Approve tab removed from bottom navigation */}
      <Tab.Screen
        name="AdminApprovals"
        component={AdminApprovalsScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />

      {/* Hidden screen: Alerts tab removed from bottom navigation */}
      <Tab.Screen
        name="AdminNotifications"
        component={AdminNotificationsScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />

      <Tab.Screen
        name="AdminVendorNotifications"
        component={AdminVendorNotificationsScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    borderTopWidth: 0,
    elevation: 12,
    backgroundColor: COLORS.white,
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  tabText: {
    fontSize: 11,
    marginTop: 3,
    color: COLORS.muted,
    fontWeight: "900",
  },
});
