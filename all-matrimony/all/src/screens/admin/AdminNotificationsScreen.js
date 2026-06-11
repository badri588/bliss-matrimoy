import React, { useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS } from "../../constants/colors";
import { useMatrimony } from "../../context/MatrimonyContext";

const COPY = {
  title: "Admin Notifications",
  subtitle: (count) =>
    count > 0 ? `${count} new admin alerts` : "User requests and approval alerts",
  emptyTitle: "No Admin Notifications",
  emptyText:
    "User profile approval, background verification, and wedding service booking requests are shown here.",
  openApproval: "Open Approval Request",
  openVerification: "Open Verification Request",
  openService: "Open Service Request",
  openVendor: "Open Vendor Notification",
  openNotification: "Open Notification",
  markRead: "Mark Read",
  now: "Now",
  new: "NEW",
};

export default function AdminNotificationsScreen({ navigation }) {
  const { getAdminNotifications, markNotificationRead } = useMatrimony();

  const adminNotifications = getAdminNotifications ? getAdminNotifications() : [];

  useEffect(() => {
    const unreadNotifications = adminNotifications.filter((item) => !item.read);

    if (unreadNotifications.length === 0 || typeof markNotificationRead !== "function") {
      return;
    }

    unreadNotifications.forEach((item) => {
      markNotificationRead(item.id);
    });
  }, [adminNotifications, markNotificationRead]);

  const handleNotificationPress = (item) => {
    if (markNotificationRead) {
      markNotificationRead(item.id);
    }

    if (item.type === "PROFILE_APPROVAL_REQUEST") {
      navigation.navigate("AdminApprovals", {
        requestId: item.requestId,
      });
      return;
    }

    if (item.type === "VERIFICATION_REQUEST") {
      navigation.navigate("AdminVerification", {
        requestId: item.requestId,
      });
      return;
    }

    if (item.type === "SERVICE_BOOKING_REQUEST") {
      navigation.navigate("AdminServices", {
        requestId: item.requestId,
      });
      return;
    }

    if (item.type === "VENDOR_APPROVAL_REQUEST") {
      navigation.navigate("AdminVendorNotifications", {
        vendorId: item.requestId,
        requestId: item.requestId,
      });
    }
  };

  const getIconName = (type) => {
    if (type === "PROFILE_APPROVAL_REQUEST") return "person-add";
    if (type === "VERIFICATION_REQUEST") return "shield-checkmark";
    if (type === "SERVICE_BOOKING_REQUEST") return "business";
    if (type === "VENDOR_APPROVAL_REQUEST") return "storefront";
    return "notifications";
  };

  const getActionText = (type) => {
    if (type === "PROFILE_APPROVAL_REQUEST") return COPY.openApproval;
    if (type === "VERIFICATION_REQUEST") return COPY.openVerification;
    if (type === "SERVICE_BOOKING_REQUEST") return COPY.openService;
    if (type === "VENDOR_APPROVAL_REQUEST") return COPY.openVendor;
    return COPY.openNotification;
  };

  const getHeaderSubtitle = () => {
    const unreadCount = adminNotifications.filter((item) => !item.read).length;
    return COPY.subtitle(unreadCount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerIcon}>
          <Ionicons name="notifications" size={28} color={COLORS.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{COPY.title}</Text>
          <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {adminNotifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="notifications-off-outline"
              size={50}
              color={COLORS.muted}
            />

            <Text style={styles.emptyTitle}>{COPY.emptyTitle}</Text>

            <Text style={styles.emptyText}>{COPY.emptyText}</Text>
          </View>
        ) : (
          adminNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => handleNotificationPress(item)}
              style={[styles.card, !item.read && styles.unreadCard]}
            >
              <View style={styles.icon}>
                <Ionicons
                  name={getIconName(item.type)}
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.title}</Text>

                  {!item.read && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>{COPY.new}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.message}>{item.message}</Text>

                <Text style={styles.time}>
                  {item.time ||
                    (item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : COPY.now)}
                </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    activeOpacity={0.85}
                    onPress={() => handleNotificationPress(item)}
                  >
                    <Text style={styles.primaryBtnText}>
                      {getActionText(item.type)}
                    </Text>
                  </TouchableOpacity>

                  {!item.read && (
                    <TouchableOpacity
                      style={styles.smallBtn}
                      activeOpacity={0.85}
                      onPress={() => markNotificationRead(item.id)}
                    >
                      <Text style={styles.smallBtnText}>{COPY.markRead}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={21}
                color={COLORS.muted}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: "#FDEDD8",
    marginTop: 3,
    fontWeight: "700",
    fontSize: 13,
  },

  content: {
    padding: 16,
    paddingBottom: 120,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 10,
  },

  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    alignItems: "center",
  },

  unreadCard: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },

  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    flex: 1,
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 16,
  },

  newBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  newBadgeText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 10,
  },

  message: {
    color: COLORS.muted,
    marginTop: 4,
    fontWeight: "600",
    lineHeight: 19,
  },

  time: {
    color: COLORS.primary,
    marginTop: 6,
    fontWeight: "900",
    fontSize: 12,
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  smallBtn: {
    backgroundColor: COLORS.softOrange,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },

  smallBtnText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 12,
  },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },

  primaryBtnText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 12,
  },
});
