import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import Header from "../../components/Header";
import { COLORS } from "../../constants/colors";
import { useMatrimony } from "../../context/MatrimonyContext";

export default function AdminVendorNotificationsScreen({ navigation, route }) {
  const {
    vendorApprovalRequests = [],
    loadVendorApprovals,
    approveVendor,
    rejectVendor,
  } = useMatrimony();
  const [loadingId, setLoadingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadVendorApprovals?.();
    }, [loadVendorApprovals])
  );

  const highlightedVendorId = route?.params?.vendorId || route?.params?.requestId;

  const updateStatus = async (vendorId, status) => {
    setLoadingId(vendorId);
    const result =
      status === "Approved"
        ? await approveVendor?.(vendorId)
        : await rejectVendor?.(vendorId);
    setLoadingId(null);

    if (!result?.success) {
      Alert.alert("Vendor Update Failed", result?.message || "Unable to update vendor.");
      return;
    }

    Alert.alert(
      status === "Approved" ? "Vendor Approved" : "Vendor Rejected",
      result?.message ||
        (status === "Approved"
          ? "Vendor details are now visible in wedding services."
          : "Vendor request rejected.")
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Vendor Notifications"
        subtitle="Approve vendor KYC and publish services"
        navigation={navigation}
        showNotification={false}
        backTo="AdminDashboard"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {vendorApprovalRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="storefront-outline" size={52} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No Vendor Notifications</Text>
            <Text style={styles.emptyText}>
              Vendor KYC submissions will appear here after registration and document upload.
            </Text>
          </View>
        ) : (
          vendorApprovalRequests.map((vendor) => {
            const isHighlighted = String(vendor.id) === String(highlightedVendorId);
            const services = Array.isArray(vendor.services) ? vendor.services : [];

            return (
              <View
                key={vendor.id}
                style={[styles.card, isHighlighted && styles.highlightCard]}
              >
                <View style={styles.topRow}>
                  <View style={styles.vendorIcon}>
                    <Ionicons name="business" size={22} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{vendor.businessName}</Text>
                    <Text style={styles.owner}>{vendor.ownerName}</Text>
                  </View>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>PENDING</Text>
                  </View>
                </View>

                <Text style={styles.detail}>Phone: {vendor.phone || vendor.mobile}</Text>
                <Text style={styles.detail}>Email: {vendor.email}</Text>
                <Text style={styles.detail}>
                  Location: {vendor.location || vendor.city || "Not added"}
                </Text>
                <Text style={styles.detail}>
                  Services: {services.length ? services.join(", ") : vendor.category || "Not added"}
                </Text>

                <View style={styles.historyBox}>
                  <Text style={styles.historyTitle}>Approval History</Text>
                  <Text style={styles.historyLine}>
                    Submitted: {vendor.kycSubmittedAt || vendor.createdAt || "N/A"}
                  </Text>
                  <Text style={styles.historyLine}>
                    Status: {vendor.approvalStatus || "Pending"}
                  </Text>
                  <Text style={styles.historyLine}>
                    Approved: {vendor.approvedAt || "N/A"}
                  </Text>
                  <Text style={styles.historyLine}>
                    Rejected: {vendor.rejectedAt || "N/A"}
                  </Text>
                  {!!vendor.adminMessage && (
                    <Text style={styles.historyNote}>Admin Note: {vendor.adminMessage}</Text>
                  )}
                </View>

                {!!vendor.idProofDocument && (
                  <Text style={styles.document}>ID Proof: {vendor.idProofDocument}</Text>
                )}
                {!!vendor.businessDocument && (
                  <Text style={styles.document}>Business Proof: {vendor.businessDocument}</Text>
                )}
                {!!vendor.addressProofDocument && (
                  <Text style={styles.document}>Address Proof: {vendor.addressProofDocument}</Text>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    disabled={loadingId === vendor.id}
                    onPress={() => updateStatus(vendor.id, "Approved")}
                  >
                    <Text style={styles.actionText}>
                      {loadingId === vendor.id ? "Please wait..." : "Approve"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    disabled={loadingId === vendor.id}
                    onPress={() => updateStatus(vendor.id, "Rejected")}
                  >
                    <Text style={styles.actionText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 100 },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
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
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  highlightCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  vendorIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: COLORS.text, fontSize: 17, fontWeight: "900" },
  owner: { color: COLORS.muted, marginTop: 3, fontWeight: "700" },
  pendingBadge: {
    backgroundColor: COLORS.softOrange,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingText: { color: COLORS.text, fontSize: 11, fontWeight: "900" },
  detail: { color: COLORS.text, marginTop: 7, fontWeight: "800" },
  historyBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8F3FF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
  },
  historyTitle: { color: COLORS.primary, fontWeight: "900", marginBottom: 6 },
  historyLine: { color: COLORS.text, marginTop: 3, fontWeight: "700", fontSize: 12 },
  historyNote: { color: COLORS.muted, marginTop: 6, fontWeight: "700", fontSize: 12, lineHeight: 18 },
  document: { color: COLORS.muted, marginTop: 7, fontWeight: "700", fontSize: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  approveButton: { backgroundColor: COLORS.success },
  rejectButton: { backgroundColor: COLORS.danger },
  actionText: { color: COLORS.white, fontWeight: "900" },
});
