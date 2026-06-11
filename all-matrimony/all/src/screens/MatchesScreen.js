import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import Header from "../components/Header";
import ProfileCard from "../components/ProfileCard";
import { useMatrimony } from "../context/MatrimonyContext";
import {
  formatAgeRangeLabel,
  translateGender,
} from "../constants/localization";

const defaultFilters = {
  gender: "All",
  name: "",
  minAge: "",
  maxAge: "",
  region: "",
  location: "",
  education: "",
  job: "",
};

export default function MatchesScreen({ navigation, route }) {
  const { profiles, wishlist, addToWishlist, loadApprovedProfiles, appTheme, language, myProfile } = useMatrimony();
  const strings = getStrings(language);
  const t = strings.matches;
  const theme = appTheme || {
    bg: COLORS.bg,
    card: COLORS.white,
    text: COLORS.text,
    muted: COLORS.muted,
    border: COLORS.border,
    soft: COLORS.softOrange,
    mode: "light",
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [loadingResults, setLoadingResults] = useState(false);
  const [didApplyRoleDefault, setDidApplyRoleDefault] = useState(false);

  useEffect(() => {
    if (route?.params?.filters) {
      setFilters(route.params.filters);
    }
  }, [route?.params?.filters]);

  useEffect(() => {
    if (route?.params?.filters || didApplyRoleDefault) {
      return;
    }

    const currentGender = String(myProfile?.gender || "").trim().toLowerCase();
    const targetGender =
      currentGender === "groom"
        ? "Bride"
        : currentGender === "bride"
        ? "Groom"
        : "All";

    const stillDefault =
      filters.gender === "All" &&
      !filters.name &&
      !filters.minAge &&
      !filters.maxAge &&
      !filters.region &&
      !filters.location &&
      !filters.education &&
      !filters.job;

    if (targetGender !== "All" && stillDefault) {
      setFilters((prev) => ({ ...prev, gender: targetGender }));
      setDidApplyRoleDefault(true);
    }
  }, [didApplyRoleDefault, filters, myProfile?.gender, route?.params?.filters]);

  useFocusEffect(
    useCallback(() => {
      if (typeof loadApprovedProfiles === "function") {
        loadApprovedProfiles(filters);
      }
    }, [filters, loadApprovedProfiles])
  );

  useEffect(() => {
    let active = true;

    const syncProfiles = async () => {
      if (typeof loadApprovedProfiles !== "function") {
        return;
      }

      setLoadingResults(true);

      try {
        await loadApprovedProfiles(filters);
      } finally {
        if (active) {
          setLoadingResults(false);
        }
      }
    };

    syncProfiles();

    return () => {
      active = false;
    };
  }, [filters]);

  const filteredProfiles = useMemo(() => {
    const normalizedName = String(filters.name || "").trim().toLowerCase();
    const normalizedGender = String(filters.gender || "All").trim().toLowerCase();
    const minAge = filters.minAge ? Number(filters.minAge) : null;
    const maxAge = filters.maxAge ? Number(filters.maxAge) : null;
    const normalizedRegion = String(filters.region || "").trim().toLowerCase();
    const normalizedLocation = String(filters.location || "").trim().toLowerCase();
    const normalizedEducation = String(filters.education || "").trim().toLowerCase();
    const normalizedJob = String(filters.job || "").trim().toLowerCase();

    return (profiles || []).filter((item) => {
      const nameOk =
        !normalizedName ||
        String(item?.name || "")
          .trim()
          .toLowerCase()
          .includes(normalizedName);

      const genderOk =
        normalizedGender === "all" ||
        String(item?.gender || "").trim().toLowerCase() === normalizedGender;

      const ageValue = Number(item?.age);
      const ageOk =
        (!minAge || Number.isNaN(ageValue) || ageValue >= minAge) &&
        (!maxAge || Number.isNaN(ageValue) || ageValue <= maxAge);

      const regionOk =
        !normalizedRegion ||
        [item?.location, item?.community, item?.religion, item?.caste]
          .filter(Boolean)
          .some((value) =>
            String(value).trim().toLowerCase().includes(normalizedRegion)
          );

      const locationOk =
        !normalizedLocation ||
        String(item?.location || "").trim().toLowerCase().includes(normalizedLocation);

      const educationOk =
        !normalizedEducation ||
        String(item?.education || "").trim().toLowerCase().includes(normalizedEducation);

      const jobOk =
        !normalizedJob ||
        String(item?.job || "").trim().toLowerCase().includes(normalizedJob);

      return nameOk && genderOk && ageOk && regionOk && locationOk && educationOk && jobOk;
    });
  }, [filters, profiles]);
  const wishlistIds = useMemo(
    () => new Set((wishlist || []).map((item) => String(item?.id))),
    [wishlist]
  );

  const hasActiveFilters =
    filters.gender !== "All" ||
    filters.name ||
    filters.minAge ||
    filters.maxAge ||
    filters.region ||
    filters.location ||
    filters.education ||
    filters.job;

  const activeFilterSummary = [
    filters.name || null,
    filters.gender !== "All" ? translateGender(language, filters.gender) : null,
    filters.minAge || filters.maxAge ? formatAgeRangeLabel(language, filters.minAge, filters.maxAge) : null,
    filters.region || null,
    filters.location || null,
    filters.education || null,
    filters.job || null,
  ]
    .filter(Boolean)
    .join(" | ");

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        navigation={navigation}
      />

      <View
        style={[
        styles.topCard,
        {
            backgroundColor: theme.card,
            borderColor: theme.border,
        },
      ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.resultTitle, { color: theme.text }]}>
            {`${filteredProfiles.length} ${t.profilesFound}`}
          </Text>

          <Text style={[styles.resultSub, { color: theme.muted }]}>
            {loadingResults ? t.loadingResult : t.resultText}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.navigate("SearchFilter", { filters })}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.white} />
          <Text style={styles.filterText}>{t.filter}</Text>
        </TouchableOpacity>
      </View>

      {hasActiveFilters && (
        <View
          style={[
            styles.activeFilterBox,
            {
              backgroundColor: theme.soft,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.activeTitle, { color: theme.primary || COLORS.primary }]}>
              {t.filtersApplied}
            </Text>
            <Text style={[styles.activeText, { color: theme.text }]}>
              {activeFilterSummary}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: theme.card }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearText, { color: theme.primary || COLORS.primary }]}>
              {t.clear}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {loadingResults ? (
          <View style={[styles.loadingBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="sync-outline" size={28} color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: COLORS.primary }]}>
              {t.loadingText}
            </Text>
          </View>
        ) : null}

        {filteredProfiles.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={64} color={COLORS.muted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{t.noProfiles}</Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>{t.noProfilesText}</Text>

            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: COLORS.primary }]}
              onPress={clearFilters}
            >
              <Text style={styles.emptyBtnText}>{t.resetFilters}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredProfiles.map((item) => (
            <ProfileCard
              key={item.id}
              item={item}
              isWishlisted={wishlistIds.has(String(item.id))}
              onPress={() =>
                navigation.navigate("ProfileDetails", { profile: item })
              }
              onWishlist={() => addToWishlist(item)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  topCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  resultSub: {
    marginTop: 4,
    fontWeight: "600",
    fontSize: 12,
  },

  filterBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  filterText: {
    color: COLORS.white,
    fontWeight: "900",
  },

  activeFilterBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: COLORS.softOrange,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  activeTitle: {
    fontWeight: "900",
  },

  activeText: {
    marginTop: 3,
    fontWeight: "600",
    fontSize: 12,
  },

  clearBtn: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  clearText: {
    fontWeight: "900",
  },

  content: {
    padding: 16,
    paddingBottom: 100,
  },

  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginTop: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  loadingBox: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  loadingText: {
    flex: 1,
    color: COLORS.primary,
    fontWeight: "800",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 21,
    fontWeight: "600",
  },

  emptyBtn: {
    marginTop: 18,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBtnText: {
    color: COLORS.white,
    fontWeight: "900",
  },
});
