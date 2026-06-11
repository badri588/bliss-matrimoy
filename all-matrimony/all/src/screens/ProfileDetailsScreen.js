import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import { useMatrimony } from "../context/MatrimonyContext";

export default function ProfileDetailsScreen({ navigation, route }) {
  const initialProfile = route?.params?.profile;
  const [profile, setProfile] = useState(initialProfile || null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [viewerAccess, setViewerAccess] = useState({
    canViewFullProfile: false,
    canChat: false,
  });

  const {
    wishlist,
    addToWishlist,
    sendInterest,
    getInterestStatus,
    hasSilverAccess,
    hasGoldAccess,
    getPublicProfileDetails,
    appTheme,
  } = useMatrimony();

  useEffect(() => {
    let active = true;

    const loadViewerProfile = async () => {
      if (!initialProfile?.id || typeof getPublicProfileDetails !== "function") {
        return;
      }

      setLoadingProfile(true);
      const result = await getPublicProfileDetails(initialProfile.id);

      if (!active) {
        return;
      }

      if (result?.success && result?.profile) {
        setProfile(result.profile);
        setViewerAccess({
          canViewFullProfile:
            Boolean(result.rawProfile?.canViewFullProfile) || hasSilverAccess(),
          canChat: Boolean(result.rawProfile?.canChat) || hasGoldAccess(),
        });
      }

      setLoadingProfile(false);
    };

    loadViewerProfile();

    return () => {
      active = false;
    };
  }, [initialProfile?.id]);

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
        <Header
          title="Profile Details"
          subtitle="No profile selected"
          navigation={navigation}
          showBack={true}
          showNotification={false}
          backTo="MainTabs"
        />

        <View style={styles.emptyBox}>
          <Ionicons
            name="person-circle-outline"
            size={70}
            color={COLORS.muted}
          />
          <Text style={styles.emptyTitle}>No Profile Found</Text>
          <Text style={styles.emptyText}>
            Please go back and select one profile.
          </Text>

          <PrimaryButton
            title="Go Back"
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("MainTabs");
              }
            }}
            style={{ width: "100%", marginTop: 18 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const interestStatus = getInterestStatus(profile.id);
  const canViewFullProfile = viewerAccess.canViewFullProfile || hasSilverAccess();
  const canUseChat = viewerAccess.canChat || hasGoldAccess();
  const isWishlisted = Array.isArray(wishlist)
    ? wishlist.some((item) => String(item?.id) === String(profile.id))
    : false;

  const handleShortlist = async () => {
    const result = await addToWishlist(profile);
    Alert.alert(
      result.success ? "Shortlisted" : "Unable to Save",
      result.message || (result.success
        ? `${profile.name} added to wishlist.`
        : "Please try again.")
    );
  };

  const handleSendInterest = async () => {
    if (!canViewFullProfile) {
      Alert.alert(
        "Silver Required",
        "Premium plans can be upgraded only from your own My Profile page.",
        [
          { text: "Later", style: "cancel" },
        ]
      );
      return;
    }

    const result = await sendInterest(profile);
    Alert.alert(result.success ? "Success" : "Already Sent", result.message);
  };

  const handleChat = () => {
    if (!canUseChat) {
      Alert.alert(
        "Gold Required",
        "Premium plans can be upgraded only from your own My Profile page.",
        [
          { text: "Later", style: "cancel" },
        ]
      );
      return;
    }

    if (interestStatus === "Accepted") {
      navigation.navigate("Chat", { profile });
      return;
    }

    Alert.alert(
      "Chat Locked",
      "Chat will be enabled after interest is accepted."
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
      <Header
        title="Profile Details"
        subtitle={profile.name}
        navigation={navigation}
        showBack={true}
        showNotification={true}
        backTo="MainTabs"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: profile.image }} style={styles.image} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: appTheme?.card || COLORS.white,
              borderColor: appTheme?.border || COLORS.border,
            },
          ]}
        >
          {loadingProfile ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingStateText}>Checking premium access...</Text>
            </View>
          ) : null}

          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.meta}>
                {profile.age} yrs | {profile.height} | {profile.gender}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.heartBtn,
                isWishlisted && styles.heartBtnActive,
              ]}
              onPress={handleShortlist}
            >
              <Ionicons
                name={isWishlisted ? "heart" : "heart-outline"}
                size={23}
                color={isWishlisted ? COLORS.success : COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {interestStatus ? (
            <View
              style={[
                styles.statusPill,
                interestStatus === "Accepted" && styles.acceptedPill,
                interestStatus === "Rejected" && styles.rejectedPill,
              ]}
            >
              <Ionicons
                name={
                  interestStatus === "Accepted"
                    ? "checkmark-circle"
                    : interestStatus === "Rejected"
                      ? "close-circle"
                      : "time"
                }
                size={17}
                color={
                  interestStatus === "Accepted"
                    ? COLORS.success
                    : interestStatus === "Rejected"
                      ? COLORS.danger
                      : COLORS.gold
                }
              />
              <Text
                style={[
                  styles.statusText,
                  interestStatus === "Accepted" && { color: COLORS.success },
                  interestStatus === "Rejected" && { color: COLORS.danger },
                ]}
              >
                Interest {interestStatus}
              </Text>
            </View>
          ) : null}

          {canViewFullProfile ? (
            <>
              <View style={styles.infoGrid}>
                <Info icon="people-outline" label="Community" value={profile.community} />
                <Info icon="heart-outline" label="Religion" value={profile.religion} />
                <Info icon="location-outline" label="Location" value={profile.location} />
                <Info icon="school-outline" label="Education" value={profile.education} />
                <Info icon="briefcase-outline" label="Job" value={profile.job} />
                <Info icon="cash-outline" label="Income" value={profile.income} />
              </View>

              <Text style={styles.sectionTitle}>About Profile</Text>
              <Text style={styles.about}>
                {profile.about ||
                  "This profile is looking for a suitable life partner with good family values."}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.outlineBtn} onPress={handleShortlist}>
                  <Ionicons
                    name={isWishlisted ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={isWishlisted ? COLORS.success : COLORS.primary}
                  />
                  <Text style={[styles.outlineText, isWishlisted && { color: COLORS.success }]}>Shortlist</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.interestBtn,
                    interestStatus && styles.disabledInterestBtn,
                  ]}
                  onPress={handleSendInterest}
                  disabled={!!interestStatus}
                >
                  <Ionicons
                    name="heart-circle-outline"
                    size={20}
                    color={interestStatus ? COLORS.muted : COLORS.white}
                  />
                  <Text
                    style={[
                      styles.interestText,
                      interestStatus && { color: COLORS.muted },
                    ]}
                  >
                    {interestStatus ? interestStatus : "Send Interest"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.chatBtn,
                  (!canUseChat || interestStatus !== "Accepted") && styles.lockedChatBtn,
                ]}
                onPress={handleChat}
              >
                <Ionicons
                  name={canUseChat && interestStatus === "Accepted" ? "chatbubble" : "lock-closed"}
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.chatBtnText}>
                  {canUseChat
                    ? interestStatus === "Accepted"
                      ? "Start Chat"
                      : "Chat Locked Until Accepted"
                    : "Gold Plan Required For Chat"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.lockCard}>
              <Ionicons name="lock-closed" size={26} color={COLORS.primary} />
              <Text style={styles.lockTitle}>Silver plan required</Text>
              <Text style={styles.lockText}>
                Free users can see profile cards only. Premium plans can be upgraded only from your own My Profile page, and they apply to the logged-in account.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ icon, label, value }) {
  return (
    <View style={styles.infoBox}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  image: {
    width: "100%",
    height: 330,
    borderRadius: 26,
    backgroundColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 18,
    marginTop: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingState: {
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingStateText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 26, fontWeight: "900", color: COLORS.text },
  meta: { color: COLORS.muted, marginTop: 5, fontWeight: "700" },
  heartBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  heartBtnActive: {
    backgroundColor: "rgba(34, 197, 94, 0.16)",
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  statusPill: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  acceptedPill: { backgroundColor: "#DCFCE7" },
  rejectedPill: { backgroundColor: "#FEE2E2" },
  statusText: { color: COLORS.gold, fontWeight: "900" },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  infoBox: {
    width: "48%",
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
    fontWeight: "700",
  },
  infoValue: { color: COLORS.text, marginTop: 2, fontWeight: "900" },
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  about: {
    marginTop: 8,
    color: COLORS.muted,
    lineHeight: 22,
    fontWeight: "600",
  },
  actions: { flexDirection: "row", gap: 12, marginTop: 22 },
  outlineBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.softOrange,
  },
  outlineText: { color: COLORS.primary, fontWeight: "900" },
  interestBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  disabledInterestBtn: { backgroundColor: "#E5E7EB" },
  interestText: { color: COLORS.white, fontWeight: "900" },
  chatBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  lockedChatBtn: { backgroundColor: "#9CA3AF" },
  chatBtnText: { color: COLORS.white, fontWeight: "900" },
  lockCard: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: COLORS.softOrange,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    alignItems: "center",
  },
  lockTitle: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  lockText: {
    marginTop: 8,
    color: COLORS.muted,
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 21,
  },
  lockBtn: {
    width: "100%",
    marginTop: 16,
  },
  emptyBox: {
    margin: 18,
    marginTop: 80,
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.text,
  },
  emptyText: {
    marginTop: 6,
    color: COLORS.muted,
    textAlign: "center",
    fontWeight: "600",
  },
});
