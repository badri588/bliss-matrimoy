import React, { useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS } from "../../constants/colors";
import { useMatrimony } from "../../context/MatrimonyContext";

export default function AdminDashboardScreen({ navigation }) {
  const {
    profiles,
    services,
    allUsers = [],
    verificationRequests = [],
    approvalRequests = [],
    vendorApprovalRequests = [],
    currentUser,
    getAdminNotifications,
    loadAdminData,
  } = useMatrimony();

  useEffect(() => {
    if (typeof loadAdminData === "function") {
      loadAdminData();
    }
  }, []);

  const adminNotifications = getAdminNotifications ? getAdminNotifications() : [];

  const unreadAdminNotifications = adminNotifications.filter(
    (item) => !item.read
  ).length;

  const pendingApprovalCount = approvalRequests.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedProfileCount = approvalRequests.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedProfileCount = approvalRequests.filter(
    (item) => item.status === "Rejected"
  ).length;

  const pendingVerificationCount = verificationRequests.filter(
    (item) => item.status === "Pending"
  ).length;

  const pendingVendorCount = vendorApprovalRequests.length;

  const handleLogout = () => {
    const parentNav = navigation.getParent();

    if (parentNav) {
      parentNav.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.adminHeader}
      >
        <View style={styles.headerRow}>
          <View style={styles.adminIcon}>
            {currentUser?.image ? (
              <Image source={{ uri: currentUser.image }} style={styles.adminAvatarImage} />
            ) : (
              <Ionicons
                name="shield-checkmark"
                size={22}
                color={COLORS.primary}
              />
            )}
          </View>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <Text style={styles.headerSubtitle}>Manage matrimony platform</Text>
          </View>

          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("AdminNotifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={COLORS.white}
            />

            {unreadAdminNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadAdminNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="checkmark-circle" size={34} color={COLORS.white} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Profile Approvals</Text>
            <Text style={styles.heroText}>
              When a user submits a profile, an approval request appears here.
              After approval, the user receives a notification.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="time"
            label="Pending"
            value={pendingApprovalCount}
            color={COLORS.warning || "#F59E0B"}
          />

          <StatCard
            icon="checkmark-circle"
            label="Approved"
            value={approvedProfileCount}
            color={COLORS.success || "#16A34A"}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="close-circle"
            label="Rejected"
            value={rejectedProfileCount}
            color={COLORS.danger || "#DC2626"}
          />

          <StatCard
            icon="notifications"
            label="Admin Alerts"
            value={unreadAdminNotifications}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="people"
            label="Profiles"
            value={allUsers.length || profiles.length}
            color={COLORS.primary}
          />

          <StatCard
            icon="business"
            label="Services"
            value={services.length}
            color={COLORS.secondary || COLORS.primary}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="shield"
            label="Verify Pending"
            value={pendingVerificationCount}
            color={COLORS.gold || COLORS.primary}
          />

          <StatCard
            icon="shield-checkmark"
            label="Total Checks"
            value={verificationRequests.length}
            color={COLORS.success || "#16A34A"}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="storefront"
            label="Vendors"
            value={pendingVendorCount}
            color={COLORS.primary}
          />

          <StatCard
            icon="briefcase"
            label="Live Services"
            value={services.length}
            color={COLORS.secondary || COLORS.primary}
          />
        </View>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AdminApprovals")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Approve User Profiles</Text>
            <Text style={styles.actionText}>
              Review pending bride and groom profiles, then approve or reject them.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AdminNotifications")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="notifications" size={24} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Admin Notifications</Text>
            <Text style={styles.actionText}>
              View user submissions and admin alerts here.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AdminVerification")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Verify Bride/Groom Profiles</Text>
            <Text style={styles.actionText}>
              Aadhaar, address, education, job and family verification.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AdminUsers")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="people" size={24} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Manage Users</Text>
            <Text style={styles.actionText}>
              View registered bride and groom profiles.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AdminServices")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="business" size={24} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Wedding Services</Text>
            <Text style={styles.actionText}>
              Hall, arkestra, cooking, cleaning and cars services.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AdminVendorNotifications")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="storefront" size={24} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Vendor Notifications</Text>
            <Text style={styles.actionText}>
              Approved vendor KYC requests will be shown in wedding services.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={23} color={COLORS.white} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  adminHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  adminIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  adminAvatarImage: {
    width: "100%",
    height: "100%",
  },

  headerTitleBox: {
    flex: 1,
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

  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  notificationBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger || "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },

  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  content: {
    padding: 16,
    paddingBottom: 120,
  },

  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    marginBottom: 16,
  },

  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },

  heroText: {
    color: COLORS.muted,
    marginTop: 5,
    fontWeight: "700",
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },

  statLabel: {
    color: COLORS.muted,
    fontWeight: "800",
    marginTop: 2,
    textAlign: "center",
  },

  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    marginTop: 10,
  },

  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },

  actionTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 16,
  },

  actionText: {
    color: COLORS.muted,
    marginTop: 4,
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 18,
  },
});
