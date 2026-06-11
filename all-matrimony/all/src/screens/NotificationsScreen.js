import React, { useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import Header from "../components/Header";
import { useMatrimony } from "../context/MatrimonyContext";

const getLocalizedNotification = (item, language) => {
  const isTelugu = language === "te";
  const type = String(item?.type || "");

  if (type === "PROFILE_APPROVED") {
    return {
      title: isTelugu ? "ప్రొఫైల్ ఆమోదించబడింది" : "Profile Approved",
      message: isTelugu
        ? "అభినందనలు! మీ ప్రొఫైల్ admin ఆమోదించారు."
        : "Congratulations! Your profile has been approved by admin.",
    };
  }

  if (type === "PROFILE_REJECTED") {
    return {
      title: isTelugu ? "ప్రొఫైల్ తిరస్కరించబడింది" : "Profile Rejected",
      message: isTelugu
        ? "మీ ప్రొఫైల్ admin తిరస్కరించారు. దయచేసి వివరాలను సరిచేసి మళ్లీ submit చేయండి."
        : "Your profile was rejected by admin. Please correct the details and submit again.",
    };
  }

  if (type === "PROFILE_SUBMITTED" || type === "PROFILE_APPROVAL_PENDING") {
    return {
      title: isTelugu ? "ప్రొఫైల్ admin కు పంపబడింది" : "Profile Sent to Admin",
      message: isTelugu
        ? "మీ ప్రొఫైల్ admin approval కోసం పంపబడింది. ఆమోదించినప్పుడు మీకు update వస్తుంది."
        : "Your profile has been sent to admin for approval. You will receive an update once reviewed.",
    };
  }

  if (type === "SERVICE_REQUEST_SENT") {
    return {
      title: isTelugu ? "సర్వీస్ అభ్యర్థన పంపబడింది" : "Service Request Sent",
      message: isTelugu
        ? "మీ wedding service అభ్యర్థన vendor approval కోసం పంపబడింది."
        : "Your wedding service request has been sent to the vendor for approval.",
    };
  }

  if (type === "SERVICE_BOOKING_APPROVED") {
    return {
      title: isTelugu ? "సర్వీస్ బుకింగ్ ఆమోదించబడింది" : "Service Booking Approved",
      message: isTelugu
        ? "మీ booking అభ్యర్థన approve అయింది. Vendor త్వరలో మిమ్మల్ని సంప్రదిస్తారు."
        : "Your booking request has been approved. The vendor will contact you soon.",
    };
  }

  if (type === "SERVICE_BOOKING_REJECTED") {
    return {
      title: isTelugu ? "సర్వీస్ బుకింగ్ తిరస్కరించబడింది" : "Service Booking Rejected",
      message: isTelugu
        ? "మీ booking అభ్యర్థన తిరస్కరించబడింది. దయచేసి ఇతర service ని ప్రయత్నించండి."
        : "Your booking request was rejected. Please try another service.",
    };
  }

  if (type === "VERIFICATION_SUBMITTED") {
    return {
      title: isTelugu ? "వెరిఫికేషన్ పంపబడింది" : "Verification Submitted",
      message: isTelugu
        ? "మీ background verification request admin కు పంపబడింది."
        : "Your background verification request has been sent to admin.",
    };
  }

  if (type === "VERIFICATION_APPROVED") {
    return {
      title: isTelugu ? "వెరిఫికేషన్ ఆమోదించబడింది" : "Verification Approved",
      message: isTelugu
        ? "అభినందనలు! మీ background verification ఆమోదించబడింది."
        : "Congratulations! Your background verification has been approved.",
    };
  }

  if (type === "VERIFICATION_REJECTED") {
    return {
      title: isTelugu ? "వెరిఫికేషన్ తిరస్కరించబడింది" : "Verification Rejected",
      message: isTelugu
        ? "మీ background verification తిరస్కరించబడింది. దయచేసి వివరాలను సరిచేసి మళ్లీ submit చేయండి."
        : "Your background verification was rejected. Please correct the details and submit again.",
    };
  }

  return {
    title: item?.title || "",
    message: item?.message || "",
  };
};

export default function NotificationsScreen({ navigation }) {
  const { getUserNotifications, markNotificationRead, appTheme, language } = useMatrimony();
  const t = getStrings(language).notifications;

  const userNotifications = getUserNotifications ? getUserNotifications() : [];
  const locale = language === "te" ? "te-IN" : "en-IN";

  useEffect(() => {
    const unreadNotifications = userNotifications.filter((item) => !item.read);

    if (unreadNotifications.length === 0 || typeof markNotificationRead !== "function") {
      return;
    }

    unreadNotifications.forEach((item) => {
      markNotificationRead(item.id);
    });
  }, [markNotificationRead, userNotifications]);

  const getIconName = (type) => {
    if (type === "PROFILE_APPROVED") return "checkmark-circle";
    if (type === "PROFILE_REJECTED") return "close-circle";
    if (type === "PROFILE_SUBMITTED") return "time";
    if (type === "PROFILE_APPROVAL_PENDING") return "hourglass";
    return "notifications";
  };

  const getIconColor = (type) => {
    if (type === "PROFILE_APPROVED") return COLORS.success || "#16A34A";
    if (type === "PROFILE_REJECTED") return COLORS.danger || "#DC2626";
    if (type === "PROFILE_SUBMITTED") return COLORS.warning || "#F59E0B";
    return COLORS.primary;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
      <Header
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        navigation={navigation}
        showBack={true}
        showNotification={false}
        backTo="MainTabs"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {userNotifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="notifications-off-outline"
              size={42}
              color={COLORS.muted}
            />
            <Text style={styles.emptyTitle}>{t.emptyTitle}</Text>
            <Text style={styles.emptyText}>{t.emptyText}</Text>
          </View>
        ) : (
          userNotifications.map((item) => {
            const localized = getLocalizedNotification(item, language);

            return (
              <View
                key={item.id}
                style={[styles.card, !item.read && styles.unreadCard]}
              >
                <View
                  style={[
                    styles.icon,
                    { backgroundColor: COLORS.softOrange || "#FFF1E8" },
                  ]}
                >
                  <Ionicons
                    name={getIconName(item.type)}
                    size={22}
                    color={getIconColor(item.type)}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{localized.title}</Text>

                    {!item.read && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>{t.new}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.message}>{localized.message}</Text>

                  <Text style={styles.time}>
                    {item.time ||
                      (item.createdAt
                        ? new Date(item.createdAt).toLocaleString(locale)
                        : t.now)}
                  </Text>

                  {!item.read && (
                    <TouchableOpacity
                      style={styles.markBtn}
                      activeOpacity={0.85}
                      onPress={async () => {
                        await markNotificationRead(item.id);
                      }}
                    >
                      <Text style={styles.markBtnText}>{t.markRead}</Text>
                    </TouchableOpacity>
                  )}
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

  content: {
    padding: 16,
    paddingBottom: 40,
  },

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
    fontWeight: "900",
    fontSize: 18,
    marginTop: 10,
  },

  emptyText: {
    color: COLORS.muted,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 20,
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
  },

  unreadCard: {
    borderColor: COLORS.primary,
  },

  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
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

  markBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: COLORS.softOrange,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },

  markBtnText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 12,
  },
});
