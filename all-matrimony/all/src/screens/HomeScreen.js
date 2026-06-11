import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import Header from "../components/Header";
import { useMatrimony } from "../context/MatrimonyContext";
import ProfileCard from "../components/ProfileCard";
import PrimaryButton from "../components/PrimaryButton";
import { getVipLabel } from "../constants/localization";

export default function HomeScreen({ navigation }) {
  const { profiles, addToWishlist, services, appTheme, language, loadApprovedProfiles } = useMatrimony();
  const t = getStrings(language).home;
  const vipLabel = getVipLabel(language);

  useFocusEffect(
    useCallback(() => {
      loadApprovedProfiles?.();
    }, [loadApprovedProfiles])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
      <Header
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        navigation={navigation}
        hideBack={true}
        showNotification={true}
      />

      <ScrollView contentContainerStyle={styles.content}>
           <ImageBackground
            source={require("../../assets/Images/heroall.png")}
            style={styles.heroBanner}
            imageStyle={styles.heroImage}
          >

          <LinearGradient
           colors={[
  "rgba(76,29,149,0.08)",
  "rgba(91,18,69,0.45)",
  "rgba(31,20,51,0.92)",
]}
            style={styles.heroOverlay}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroTag}>
                <Ionicons name="heart" size={15} color={COLORS.maroon} />
                <Text style={styles.heroTagText}>{t.verified}</Text>
              </View>

              <View style={styles.heroRating}>
                <Ionicons name="star" size={14} color={COLORS.gold} />
                <Text style={styles.heroRatingText}>{t.trusted}</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{t.heroTitle}</Text>

            <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>

            {/* <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={() => navigation.navigate("Matches")}
              >
                <Text style={styles.heroPrimaryText}>{t.exploreMatches}</Text>
                <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heroOutlineBtn}
                onPress={() => navigation.navigate("Services")}
              >
                <Text style={styles.heroOutlineText}>{t.weddingServices}</Text>
              </TouchableOpacity>
            </View> */}
          </LinearGradient>
        </ImageBackground>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.softOrange }]}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{profiles.length}+</Text>
            <Text style={styles.statLabel}>{t.profiles}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.softGreen }]}>
              <Ionicons name="business" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.statNumber}>{services.length}+</Text>
            <Text style={styles.statLabel}>{t.services}</Text>
          </View>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate("Premium")}
          >
            <View style={[styles.statIcon, { backgroundColor: COLORS.goldLight }]}>
              <Ionicons name="diamond" size={24} color={COLORS.gold} />
            </View>
            <Text style={styles.statNumber}>{vipLabel}</Text>
            <Text style={styles.statLabel}>{t.premium}</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[COLORS.softMaroon, COLORS.softOrange]}
          style={styles.quickCard}
        >
          <View style={styles.quickIcon}>
            <Ionicons name="sparkles" size={24} color={COLORS.maroon} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.quickTitle}>{t.journeyTitle}</Text>
            <Text style={styles.quickText}>{t.journeyText}</Text>
          </View>

          <TouchableOpacity
            style={styles.quickArrow}
            onPress={() => navigation.navigate("Matches")}
          >
            <Ionicons name="chevron-forward" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.quickButtons}>
          <PrimaryButton
            title={t.findMatches}
            onPress={() => navigation.navigate("Matches")}
            style={styles.quickBtn}
          />

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("Premium")}
          >
            <Ionicons name="diamond-outline" size={18} color={COLORS.maroon} />
            <Text style={styles.secondaryBtnText}>{t.goPremium}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t.recommendedMatches}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Matches")}>
            <Text style={styles.viewAll}>{t.viewAll}</Text>
          </TouchableOpacity>
        </View>

        {profiles.slice(0, 2).map((item) => (
          <ProfileCard
            key={item.id}
            item={item}
            onPress={() =>
              navigation.navigate("ProfileDetails", { profile: item })
            }
            onWishlist={() => addToWishlist(item)}
          />
        ))}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t.weddingServices}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Services")}>
            <Text style={styles.viewAll}>{t.viewAll}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicePreview}>
          <View style={styles.serviceIconBox}>
            <Ionicons name="business" size={28} color={COLORS.secondary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.serviceTitle}>{t.bookServices}</Text>
            <Text style={styles.serviceText}>{t.bookServicesText}</Text>
          </View>

          <TouchableOpacity
            style={styles.serviceArrow}
            onPress={() => navigation.navigate("Services")}
          >
            <Ionicons name="chevron-forward" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.aiFab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("AiChat")}
      >
        <View style={styles.aiFabAvatar}>
          <RobotBadge />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  content: {
    padding: 16,
    paddingBottom: 110,
  },

  heroBanner: {
    height: 270,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 18,
    elevation: 5,
    backgroundColor: COLORS.maroon,
  },

  heroImage: {
    borderRadius: 30,
  },

  heroOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: "flex-end",
  },

  heroTopRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  heroTagText: {
    color: COLORS.maroon,
    fontWeight: "900",
    fontSize: 12,
  },

  heroRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  heroRatingText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 12,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 36,
  },

  heroSubtitle: {
    color: "#FFE8D6",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    lineHeight: 20,
  },

  heroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  heroPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    height: 44,
    borderRadius: 15,
  },

  heroPrimaryText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 13,
  },

  heroOutlineBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 15,
    justifyContent: "center",
  },

  heroOutlineText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 13,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 7,
    color: COLORS.text,
  },

  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "800",
    marginTop: 2,
  },

  quickCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },

  quickTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  quickText: {
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 4,
    fontSize: 12,
  },

  quickArrow: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.maroon,
    alignItems: "center",
    justifyContent: "center",
  },

  quickButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },

  quickBtn: {
    flex: 1,
  },

  secondaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.maroon,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    backgroundColor: COLORS.softMaroon,
  },

  secondaryBtnText: {
    color: COLORS.maroon,
    fontWeight: "900",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.text,
  },

  viewAll: {
    color: COLORS.maroon,
    fontWeight: "900",
  },

  servicePreview: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 3,
    marginBottom: 20,
  },

  serviceIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },

  serviceTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 16,
  },

  serviceText: {
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 4,
    lineHeight: 19,
  },

  serviceArrow: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },

  aiFab: {
    position: "absolute",
    right: 16,
    bottom: 92,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.maroon,
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },

  aiFabAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

function RobotBadge() {
  return (
    <View style={robotStyles.wrap}>
      <View style={robotStyles.bubble}>
        <View style={robotStyles.tail} />
        <View style={robotStyles.dotRow}>
          <View style={robotStyles.dot} />
          <View style={robotStyles.dot} />
          <View style={robotStyles.dot} />
        </View>
      </View>
    </View>
  );
}

const robotStyles = StyleSheet.create({
  wrap: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    width: 26,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F7FBFF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tail: {
    position: "absolute",
    left: 4,
    bottom: -4,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderRightWidth: 7,
    borderTopColor: "#F7FBFF",
    borderRightColor: "transparent",
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.maroon,
    opacity: 0.72,
  },
});
