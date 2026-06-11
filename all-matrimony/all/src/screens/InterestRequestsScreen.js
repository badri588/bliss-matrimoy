import React, { useMemo, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import Header from "../components/Header";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

export default function InterestRequestsScreen({ navigation }) {
  const {
    interests = [],
    updateInterestStatus,
    loadCurrentUserData,
    currentUser,
    hasGoldAccess,
    appTheme,
  } =
    useMatrimony();
  const [activeTab, setActiveTab] = useState("Incoming");

  useFocusEffect(
    useCallback(() => {
      if (typeof loadCurrentUserData === "function" && currentUser?.id) {
        loadCurrentUserData(currentUser.id);
      }
    }, [currentUser?.id, loadCurrentUserData])
  );

  const incomingInterests = useMemo(
    () => interests.filter((item) => item.direction === "incoming"),
    [interests]
  );
  const sentInterests = useMemo(
    () => interests.filter((item) => item.direction === "outgoing"),
    [interests]
  );
  const acceptedInterests = useMemo(
    () => interests.filter((item) => item.status === "Accepted"),
    [interests]
  );

  const visibleInterests =
    activeTab === "Incoming"
      ? incomingInterests
      : activeTab === "Sent"
        ? sentInterests
        : acceptedInterests;

  const handleStatusUpdate = async (interestId, status, profileName) => {
    const result = await updateInterestStatus(interestId, status);

    Alert.alert(
      result?.success ? status : "Update Failed",
      result?.message ||
        `${profileName || "Interest"} status updated to ${status}.`
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
      <Header
        title="Interest Requests"
        subtitle="Receive, send and unlock chat"
        navigation={navigation}
        showBack={true}
        showNotification={false}
        backTo="MainTabs"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabRow}>
          <TabButton
            title={`Incoming (${incomingInterests.length})`}
            active={activeTab === "Incoming"}
            onPress={() => setActiveTab("Incoming")}
          />
          <TabButton
            title={`Sent (${sentInterests.length})`}
            active={activeTab === "Sent"}
            onPress={() => setActiveTab("Sent")}
          />
          <TabButton
            title={`Accepted (${acceptedInterests.length})`}
            active={activeTab === "Accepted"}
            onPress={() => setActiveTab("Accepted")}
          />
        </View>

        {visibleInterests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="heart-outline" size={68} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No {activeTab} Interests</Text>
            <Text style={styles.emptyText}>
              {activeTab === "Incoming"
                ? "Other users send chesina interest requests ikkada kanipistayi."
                : activeTab === "Sent"
                  ? "Meeru pampina interest requests ikkada kanipistayi."
                  : "Accepted interests chat unlock ayyaka ikkada kanipistayi."}
            </Text>
          </View>
        ) : (
          visibleInterests.map((item) => {
            const isIncoming = item.direction === "incoming";

            return (
              <View key={item.id} style={styles.card}>
                <Image source={{ uri: item.profile.image }} style={styles.avatar} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.profile.name}</Text>
                  <Text style={styles.meta}>
                    {item.profile.age || "N/A"} yrs • {item.profile.community || "N/A"}
                  </Text>
                  <Text style={styles.location}>{item.profile.location || "N/A"}</Text>

                  <View style={styles.infoRow}>
                    <View
                      style={[
                        styles.directionPill,
                        isIncoming ? styles.incomingPill : styles.sentPill,
                      ]}
                    >
                      <Text
                        style={[
                          styles.directionPillText,
                          isIncoming ? styles.incomingPillText : styles.sentPillText,
                        ]}
                      >
                        {isIncoming ? "Incoming" : "Sent"}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        item.status === "Accepted" && styles.acceptedPill,
                        item.status === "Rejected" && styles.rejectedPill,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          item.status === "Accepted" && { color: COLORS.success },
                          item.status === "Rejected" && { color: COLORS.danger },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {isIncoming && item.status === "Pending" ? (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() =>
                          handleStatusUpdate(item.id, "Accepted", item.profile.name)
                        }
                      >
                        <Ionicons
                          name="checkmark"
                          size={17}
                          color={COLORS.white}
                        />
                        <Text style={styles.actionText}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() =>
                          handleStatusUpdate(item.id, "Rejected", item.profile.name)
                        }
                      >
                        <Ionicons name="close" size={17} color={COLORS.white} />
                        <Text style={styles.actionText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {item.status === "Accepted" && item.chatUnlocked ? (
                    <TouchableOpacity
                      style={styles.chatBtn}
                      onPress={() => {
                        if (hasGoldAccess()) {
                          navigation.navigate("Chat", { profile: item.profile });
                          return;
                        }

                        Alert.alert(
                          "Gold Required",
                          "Upgrade to Gold to chat with accepted matches.",
                          [
                            {
                              text: "Go Premium",
                              onPress: () => navigation.navigate("Premium"),
                            },
                            { text: "Later", style: "cancel" },
                          ]
                        );
                      }}
                    >
                      <Ionicons
                        name={hasGoldAccess() ? "chatbubble-outline" : "lock-closed-outline"}
                        size={17}
                        color={COLORS.white}
                      />
                      <Text style={styles.actionText}>
                        {hasGoldAccess() ? "Open Chat" : "Gold Required"}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
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
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    marginTop: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 12,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    gap: 13,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 18,
    backgroundColor: COLORS.border,
  },
  name: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  meta: { color: COLORS.muted, marginTop: 4, fontWeight: "700" },
  location: { color: COLORS.text, marginTop: 4, fontWeight: "700" },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 9,
  },
  directionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  incomingPill: {
    backgroundColor: "#DBEAFE",
  },
  sentPill: {
    backgroundColor: "#F3E8FF",
  },
  directionPillText: {
    fontWeight: "900",
    fontSize: 12,
  },
  incomingPillText: {
    color: "#1D4ED8",
  },
  sentPillText: {
    color: "#7C3AED",
  },
  statusPill: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  acceptedPill: { backgroundColor: "#DCFCE7" },
  rejectedPill: { backgroundColor: "#FEE2E2" },
  statusText: { color: COLORS.gold, fontWeight: "900", fontSize: 12 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  acceptBtn: {
    flex: 1,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  rejectBtn: {
    flex: 1,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  chatBtn: {
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
  },
  actionText: { color: COLORS.white, fontWeight: "900", fontSize: 12 },
});
