import React, { useEffect } from "react";
import { ScrollView, Text, View, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header";
import { COLORS } from "../../constants/colors";
import { useMatrimony } from "../../context/MatrimonyContext";

export default function AdminUsersScreen({ navigation }) {
  const { allUsers = [], profiles, loadAdminData } = useMatrimony();
  const users = allUsers.length > 0 ? allUsers : profiles;
  const approvedUsersCount = users.filter(
    (item) => item.approvalStatus === "Approved"
  ).length;

  useEffect(() => {
    if (typeof loadAdminData === "function") {
      loadAdminData();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Users"
        subtitle={`${users.length} profiles • ${approvedUsersCount} approved`}
        navigation={navigation}
        showNotification={false}
        backTo="AdminDashboard"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {users.map((item) => {
          const status = item.approvalStatus || "Not Submitted";

          return (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.avatar} />

              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      status === "Approved"
                        ? styles.statusApproved
                        : status === "Rejected"
                          ? styles.statusRejected
                          : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        status === "Approved"
                          ? styles.statusApprovedText
                          : status === "Rejected"
                            ? styles.statusRejectedText
                            : styles.statusPendingText,
                      ]}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.meta}>
                  {item.gender || "N/A"} • {item.age || "N/A"} yrs •{" "}
                  {item.community || "N/A"}
                </Text>
                <Text style={styles.meta}>{item.location || "N/A"}</Text>
                <Text style={styles.job}>
                  {item.education || "N/A"} • {item.job || "N/A"}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: COLORS.border,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  name: { color: COLORS.text, fontSize: 17, fontWeight: "900" },
  meta: { color: COLORS.muted, marginTop: 4, fontWeight: "700" },
  job: { color: COLORS.primary, marginTop: 4, fontWeight: "800" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  statusApproved: {
    backgroundColor: "#ECFDF5",
    borderColor: "#BBF7D0",
  },
  statusApprovedText: {
    color: COLORS.success || "#16A34A",
  },
  statusPending: {
    backgroundColor: "#FFF7DD",
    borderColor: "#FDE68A",
  },
  statusPendingText: {
    color: COLORS.warning || "#F59E0B",
  },
  statusRejected: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  statusRejectedText: {
    color: COLORS.danger || "#DC2626",
  },
});
