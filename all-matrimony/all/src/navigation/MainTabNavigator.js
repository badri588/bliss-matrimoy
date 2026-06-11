import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import MatchesScreen from "../screens/MatchesScreen";
import WishlistScreen from "../screens/WishlistScreen";
import ServicesScreen from "../screens/ServicesScreen";
import MyProfileScreen from "../screens/MyProfileScreen";
import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import { useMatrimony } from "../context/MatrimonyContext";

const Tab = createBottomTabNavigator();

function TabIcon({ focused, icon, label }) {
  const { appTheme } = useMatrimony();

  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? icon : `${icon}-outline`}
        size={22}
        color={focused ? COLORS.primary : appTheme?.muted || COLORS.muted}
      />
      <Text
        style={[
          styles.tabText,
          { color: focused ? COLORS.primary : appTheme?.muted || COLORS.muted },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function MainTabNavigator() {
  const { appTheme, language } = useMatrimony();
  const t = getStrings(language).tabs;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: appTheme?.tabBar || COLORS.white },
        ],
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="home" label={t.home} />
          ),
        }}
      />

      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="heart" label={t.matches} />
          ),
        }}
      />

      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="bookmark" label={t.saved} />
          ),
        }}
      />

      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="business" label={t.services} />
          ),
        }}
      />

      <Tab.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="person" label={t.profile} />
          ),
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    fontWeight: "700",
  },
});
