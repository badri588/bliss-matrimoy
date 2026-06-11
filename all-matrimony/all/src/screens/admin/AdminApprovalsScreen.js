import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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

export default function AdminApprovalsScreen({ route }) {
  const selectedRequestId = route?.params?.requestId || null;
  const [activeTab, setActiveTab] = useState("Pending");

  const {
    approvalRequests = [],
    approveProfile,
    rejectProfile,
    getPendingApprovalRequests,
    getApprovedApprovalRequests,
    getRejectedApprovalRequests,
    loadAdminData,
  } = useMatrimony();

  useEffect(() => {
    if (typeof loadAdminData === "function") {
      loadAdminData();
    }
  }, []);

  const pendingRequests = getPendingApprovalRequests
    ? getPendingApprovalRequests()
    : approvalRequests.filter((item) => item.status === "Pending");

  const approvedRequests = getApprovedApprovalRequests
    ? getApprovedApprovalRequests()
    : approvalRequests.filter((item) => item.status === "Approved");

  const rejectedRequests = getRejectedApprovalRequests
    ? getRejectedApprovalRequests()
    : approvalRequests.filter((item) => item.status === "Rejected");

  const currentRequests = useMemo(() => {
    if (activeTab === "Approved") {
      return approvedRequests;
    }

    if (activeTab === "Rejected") {
      return rejectedRequests;
    }

    return pendingRequests;
  }, [activeTab, approvedRequests, rejectedRequests, pendingRequests]);

  const sortedRequests = selectedRequestId
    ? [...currentRequests].sort((a, b) => {
        if (a.id === selectedRequestId) return -1;
        if (b.id === selectedRequestId) return 1;
        return 0;
      })
    : currentRequests;

  const handleApprove = async (request) => {
    const result = await approveProfile(
      request.id,
      "Congratulations! Your profile has been approved by the admin."
    );

    if (result?.success) {
      Alert.alert(
        "Approved",
        `${request.profileName}'s profile was approved. The user has been notified.`
      );
      setActiveTab("Approved");
    }
  };

  const handleReject = async (request) => {
    const result = await rejectProfile(
      request.id,
      "Your profile was rejected by the admin. Please correct the details and submit again."
    );

    if (result?.success) {
      Alert.alert(
        "Rejected",
        `${request.profileName}'s profile was rejected. The user has been notified.`
      );
      setActiveTab("Rejected");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerIcon}>
          <Ionicons name="checkmark-circle" size={28} color={COLORS.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Profile Approvals</Text>
          <Text style={styles.headerSubtitle}>
            Review submitted profiles and approve or reject them
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabRow}>
          <TabButton
            title={`Pending (${pendingRequests.length})`}
            active={activeTab === "Pending"}
            onPress={() => setActiveTab("Pending")}
          />
          <TabButton
            title={`Approved (${approvedRequests.length})`}
            active={activeTab === "Approved"}
            onPress={() => setActiveTab("Approved")}
          />
          <TabButton
            title={`Rejected (${rejectedRequests.length})`}
            active={activeTab === "Rejected"}
            onPress={() => setActiveTab("Rejected")}
          />
        </View>

        {sortedRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={50}
              color={COLORS.primary}
            />

            <Text style={styles.emptyTitle}>No {activeTab} Requests</Text>

            <Text style={styles.emptyText}>
              {activeTab === "Pending"
                ? "When a user saves or submits a profile, the approval request appears here."
                : `${activeTab} profiles appear here.`}
            </Text>
          </View>
        ) : (
          sortedRequests.map((request) => {
            const isSelected = selectedRequestId === request.id;
            const isPending = request.status === "Pending";

            return (
              <View
                key={request.id}
                style={[styles.card, isSelected && styles.selectedCard]}
              >
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons
                      name="notifications"
                      size={14}
                      color={COLORS.white}
                    />
                    <Text style={styles.selectedBadgeText}>
                      Opened from Notification
                    </Text>
                  </View>
                )}

                <View style={styles.profileRow}>
                  <Image source={{ uri: request.image }} style={styles.avatar} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{request.profileName}</Text>

                    <Text style={styles.subText}>
                      {request.gender || "N/A"} • {request.age || "Age N/A"}
                    </Text>

                    <Text
                      style={[
                        styles.statusText,
                        request.status === "Approved"
                          ? styles.approvedStatusText
                          : request.status === "Rejected"
                            ? styles.rejectedStatusText
                            : styles.pendingStatusText,
                      ]}
                    >
                      {request.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <InfoRow icon="call" label="Phone" value={request.phone} />
                  <InfoRow icon="mail" label="Email" value={request.email} />
                  <InfoRow
                    icon="location"
                    label="Location"
                    value={request.location}
                  />
                  <InfoRow
                    icon="school"
                    label="Education"
                    value={request.education}
                  />
                  <InfoRow icon="briefcase" label="Job" value={request.job} />
                  <InfoRow
                    icon="people"
                    label="Community"
                    value={request.community}
                  />
                </View>

                <Text style={styles.submittedText}>
                  Submitted: {request.submittedAt || "Now"}
                </Text>

                {!isPending && request.adminMessage ? (
                  <Text style={styles.adminMessage}>{request.adminMessage}</Text>
                ) : null}

                {isPending ? (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      activeOpacity={0.85}
                      onPress={() => handleApprove(request)}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={COLORS.white}
                      />
                      <Text style={styles.btnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      activeOpacity={0.85}
                      onPress={() => handleReject(request)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={COLORS.white}
                      />
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton({ title, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.activeTabButton]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, active && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={`${icon}-outline`} size={17} color={COLORS.primary} />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || "N/A"}</Text>
    </View>
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

  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeTabButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  tabButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  activeTabButtonText: {
    color: COLORS.white,
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
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },

  selectedCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  selectedBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 12,
  },

  selectedBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: COLORS.softOrange,
  },

  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  subText: {
    color: COLORS.muted,
    marginTop: 3,
    fontWeight: "700",
  },

  statusText: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 7,
  },

  pendingStatusText: {
    color: COLORS.warning || "#F59E0B",
    backgroundColor: "#FFF7DD",
  },

  approvedStatusText: {
    color: COLORS.success || "#16A34A",
    backgroundColor: "#ECFDF5",
  },

  rejectedStatusText: {
    color: COLORS.danger || "#DC2626",
    backgroundColor: "#FEF2F2",
  },

  infoBox: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },

  infoLabel: {
    color: COLORS.text,
    fontWeight: "900",
    width: 80,
  },

  infoValue: {
    flex: 1,
    color: COLORS.muted,
    fontWeight: "700",
  },

  submittedText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 12,
    marginTop: 10,
  },

  adminMessage: {
    marginTop: 8,
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 19,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  approveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.success || "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  rejectBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.danger || "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  btnText: {
    color: COLORS.white,
    fontWeight: "900",
  },
});
