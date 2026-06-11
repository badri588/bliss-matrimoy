import React from "react";
import { Alert, ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { useMatrimony } from "../../context/MatrimonyContext";

export default function AdminProfileRequestsScreen({ navigation }) {
  const { profileRequests, approveProfile, rejectProfile } = useMatrimony();

  const handleApprove = (id) => {
    Alert.alert("Approve Profile", "Are you sure you want to approve this profile?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Approve",
        style: "default",
        onPress: () => approveProfile(id),
      },
    ]);
  };

  const handleReject = (id) => {
    Alert.alert("Reject Profile", "Are you sure you want to reject this profile?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => rejectProfile(id),
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile Requests</Text>

      {profileRequests.map((request) => (
        <View key={request.id} style={styles.card}>
          <Text style={styles.profileName}>{request.name}</Text>
          <Text style={styles.status}>Status: {request.status}</Text>

          <View style={styles.actions}>
            {request.status === "Pending" && (
              <>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleApprove(request.id)}
                >
                  <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleReject(request.id)}
                >
                  <Ionicons name="close-circle-outline" size={22} color={COLORS.danger} />
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  status: {
    color: COLORS.muted,
    marginTop: 8,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  actionText: {
    marginLeft: 8,
    fontWeight: "700",
    color: COLORS.primary,
  },
});