import React, { useEffect } from "react";
import {
  Alert,
  Linking,
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

export default function AdminVerificationScreen({ route }) {
  const selectedRequestId = route?.params?.requestId || null;

  const { verificationRequests = [], updateVerificationStatus, loadAdminData } = useMatrimony();

  useEffect(() => {
    if (typeof loadAdminData === "function") {
      loadAdminData();
    }
  }, []);

  const sortedRequests = selectedRequestId
    ? [...verificationRequests].sort((a, b) => {
        if (a.id === selectedRequestId) return -1;
        if (b.id === selectedRequestId) return 1;
        return 0;
      })
    : verificationRequests;

  const pendingCount = verificationRequests.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedCount = verificationRequests.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = verificationRequests.filter(
    (item) => item.status === "Rejected"
  ).length;

  const handleApprove = async (request) => {
    const result = await updateVerificationStatus(
      request.id,
      "Approved",
      "Congratulations! Your background verification has been approved by the admin."
    );

    if (result?.success) {
      Alert.alert(
        "Verification Approved",
        `${request.profileName}'s verification was approved. The user has been notified.`
      );
    }
  };

  const handleReject = async (request) => {
    const result = await updateVerificationStatus(
      request.id,
      "Rejected",
      "Your background verification was rejected by the admin. Please correct the details and submit again."
    );

    if (result?.success) {
      Alert.alert(
        "Verification Rejected",
        `${request.profileName}'s verification was rejected. The user has been notified.`
      );
    }
  };

  const getStatusColor = (status) => {
    if (status === "Approved") return COLORS.success || "#16A34A";
    if (status === "Rejected") return COLORS.danger || "#DC2626";
    return COLORS.warning || "#F59E0B";
  };

  const getStatusBg = (status) => {
    if (status === "Approved") return "#DCFCE7";
    if (status === "Rejected") return "#FEE2E2";
    return "#FFF7DD";
  };

  const openProof = async (proofUrl) => {
    if (!proofUrl) {
      return;
    }

    try {
      await Linking.openURL(proofUrl);
    } catch (error) {
      Alert.alert("Open Failed", "Unable to open this uploaded proof right now.");
    }
  };

  const getAdminMessageText = (message) => {
    const text = String(message || "").trim();
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("background verification") &&
      lowerText.includes("approve chesaru")
    ) {
      return "Congratulations! Your background verification has been approved by the admin.";
    }

    if (
      lowerText.includes("background verification") &&
      lowerText.includes("reject chesaru")
    ) {
      return "Your background verification was rejected by the admin. Please correct the details and submit again.";
    }

    return text;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerIcon}>
          <Ionicons
            name="shield-checkmark"
            size={28}
            color={COLORS.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Background Verification</Text>
          <Text style={styles.headerSubtitle}>
            Review user documents and approve or reject them
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <StatBox
            icon="time"
            label="Pending"
            value={pendingCount}
            color={COLORS.warning || "#F59E0B"}
          />
          <StatBox
            icon="checkmark-circle"
            label="Approved"
            value={approvedCount}
            color={COLORS.success || "#16A34A"}
          />
          <StatBox
            icon="close-circle"
            label="Rejected"
            value={rejectedCount}
            color={COLORS.danger || "#DC2626"}
          />
        </View>

        {sortedRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="shield-checkmark-outline"
              size={58}
              color={COLORS.muted}
            />

            <Text style={styles.emptyTitle}>No Verification Requests</Text>

            <Text style={styles.emptyText}>
              When a user submits background verification details, the request
              appears here.
            </Text>
          </View>
        ) : (
          sortedRequests.map((request) => {
            const isSelected = selectedRequestId === request.id;

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
                  <Image
                    source={{ uri: request.image }}
                    style={styles.avatar}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{request.profileName}</Text>

                    <Text style={styles.subText}>
                      {request.gender || "User"} • {request.age || "Age N/A"}
                    </Text>

                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: getStatusBg(request.status),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: getStatusColor(request.status),
                          },
                        ]}
                      >
                        {request.status}
                      </Text>
                    </View>
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
                  <InfoRow
                    icon="briefcase"
                    label="Job"
                    value={request.job}
                  />
                  <InfoRow
                    icon="people"
                    label="Community"
                    value={request.community}
                  />
                  <InfoRow
                    icon="document-text"
                    label="Aadhaar"
                    value={request.aadhaarNumber || request.aadhaar || "N/A"}
                  />
                  <InfoRow icon="home" label="Family Contact" value={request.familyContact || "N/A"} />
                  <InfoRow
                    icon="person"
                    label="Character"
                    value={request.characterVerification || "N/A"}
                  />
                </View>

                <View style={styles.proofSection}>
                  <Text style={styles.proofTitle}>Uploaded Proofs</Text>
                  <ProofRow
                    label="Address Proof"
                    value={request.address}
                    detailValue={request.addressDetail}
                    detailLabel="Address"
                    onOpen={openProof}
                  />
                  <ProofRow
                    label="Education Proof"
                    value={request.educationProof}
                    detailValue={request.educationDetail}
                    detailLabel="Education"
                    onOpen={openProof}
                  />
                  <ProofRow
                    label="Job / Income Proof"
                    value={request.jobProof}
                    detailValue={request.jobDetail}
                    detailLabel="Job / Income"
                    onOpen={openProof}
                  />
                </View>

                {request.adminMessage ? (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageLabel}>Admin Message</Text>
                    <Text style={styles.messageText}>
                      {getAdminMessageText(request.adminMessage)}
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.submittedText}>
                  Submitted: {request.submittedAt || "Now"}
                </Text>

                {request.status === "Pending" ? (
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
                ) : (
                  <View style={styles.completedBox}>
                    <Ionicons
                      name={
                        request.status === "Approved"
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={18}
                      color={getStatusColor(request.status)}
                    />
                    <Text
                      style={[
                        styles.completedText,
                        { color: getStatusColor(request.status) },
                      ]}
                    >
                      Verification {request.status}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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

function ProofRow({ label, value, detailValue, detailLabel, onOpen }) {
  const isFileLink =
    typeof value === "string" &&
    (value.startsWith("http://") || value.startsWith("https://"));

  const fileName = isFileLink ? value.split("/").pop()?.split("?")[0] : "";

  return (
    <View style={styles.proofRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.proofLabel}>{label}</Text>
        <Text style={styles.proofValue}>
          {isFileLink ? fileName || "Uploaded file" : value || "Not uploaded"}
        </Text>
        {detailValue ? (
          <Text style={styles.proofMeta}>
            {detailLabel}: {detailValue}
          </Text>
        ) : null}
      </View>

      {isFileLink ? (
        <TouchableOpacity
          style={styles.viewProofBtn}
          activeOpacity={0.85}
          onPress={() => onOpen(value)}
        >
          <Ionicons name="open-outline" size={16} color={COLORS.white} />
          <Text style={styles.viewProofText}>View</Text>
        </TouchableOpacity>
      ) : null}
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

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
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

  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 7,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
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
    width: 86,
  },

  infoValue: {
    flex: 1,
    color: COLORS.muted,
    fontWeight: "700",
  },

  messageBox: {
    backgroundColor: COLORS.softOrange,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  proofSection: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  proofTitle: {
    color: COLORS.text,
    fontWeight: "900",
    marginBottom: 10,
  },

  proofRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  proofLabel: {
    color: COLORS.text,
    fontWeight: "900",
    marginBottom: 2,
  },

  proofValue: {
    color: COLORS.muted,
    fontWeight: "700",
  },
  proofMeta: {
    color: COLORS.text,
    fontWeight: "800",
    marginTop: 4,
  },

  viewProofBtn: {
    minWidth: 82,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
  },

  viewProofText: {
    color: COLORS.white,
    fontWeight: "900",
  },

  messageLabel: {
    color: COLORS.text,
    fontWeight: "900",
    marginBottom: 4,
  },

  messageText: {
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 19,
  },

  submittedText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 12,
    marginTop: 10,
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

  completedBox: {
    marginTop: 14,
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  completedText: {
    fontWeight: "900",
  },
});
