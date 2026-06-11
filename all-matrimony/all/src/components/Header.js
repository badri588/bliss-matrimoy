import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

const APP_LOGO = require("../../assets/Images/app-logo.png");

export default function Header({
  title,
  subtitle,
  navigation,
  showNotification = true,
  backTo = "MainTabs",
  hideBack = false,
}) {
  const fallbackNavigation = useNavigation();
  const route = useRoute();
  const { getUnreadUserNotificationCount, appTheme } = useMatrimony();

  const nav = navigation || fallbackNavigation;
  const currentRouteName = route?.name;
  const unreadNotificationCount =
    typeof getUnreadUserNotificationCount === "function"
      ? getUnreadUserNotificationCount()
      : 0;

  const handleBack = () => {
    if (nav?.canGoBack && nav.canGoBack()) {
      nav.goBack();
      return;
    }

    if (currentRouteName === "Home") {
      if (nav?.replace) {
        nav.replace("Login");
      } else {
        nav.navigate("Login");
      }
      return;
    }

    if (
      currentRouteName === "Matches" ||
      currentRouteName === "Wishlist" ||
      currentRouteName === "Services" ||
      currentRouteName === "MyProfile"
    ) {
      nav.navigate("Home");
      return;
    }

    if (nav?.replace) {
      nav.replace(backTo);
      return;
    }

    if (nav?.navigate) {
      nav.navigate(backTo);
    }
  };

  const handleNotification = () => {
    if (nav?.navigate) {
      nav.navigate("Notifications");
    }
  };

  return (
    <LinearGradient
      colors={appTheme?.headerGradient || [COLORS.primaryDark, COLORS.maroon, COLORS.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.topGlow} />

      <View style={styles.row}>
        {!hideBack ? (
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoCircle}>
            <Image source={APP_LOGO} style={styles.profileImage} />
          </View>
        )}

        <View style={styles.titleBox}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>

          {!!subtitle && (
            <Text
              numberOfLines={1}
              style={[
                styles.subtitle,
                appTheme?.mode === "dark" && styles.subtitleDark,
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {showNotification ? (
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={handleNotification}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.white}
            />
            {unreadNotificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.rightSpace} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === "android" ? 48 : 54,
    paddingBottom: 24,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },

  topGlow: {
    position: "absolute",
    right: -50,
    top: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  titleBox: {
    flex: 1,
  },

  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    overflow: "hidden",
  },
  profileImage: {
    width: "92%",
    height: "92%",
    resizeMode: "contain",
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  rightSpace: {
    width: 42,
    height: 42,
  },

  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },

  subtitle: {
    color: "#FFE8D6",
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
  },
  subtitleDark: {
    color: "#D1D5DB",
  },

  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger || "#DC2626",
    borderWidth: 1,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
});
