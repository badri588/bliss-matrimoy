import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import Header from "../components/Header";
import ServiceCard from "../components/ServiceCard";
import { useMatrimony } from "../context/MatrimonyContext";
import { useFocusEffect } from "@react-navigation/native";

const CATEGORY_KEYS = [
  "all",
  "functionHall",
  "photography",
  "cooking",
  "makeup",
  "decoration",
  "arkestra",
  "carServices",
  "cleaning",
];

const CATEGORY_VALUES = {
  all: "All",
  functionHall: "Function Hall",
  photography: "Photography",
  cooking: "Cooking",
  makeup: "Makeup",
  decoration: "Decoration",
  arkestra: "Arkestra",
  carServices: "Bride And Groom Car Services",
  cleaning: "Cleaning",
};

const CATEGORY_LABELS = {
  en: {
    all: "All",
    functionHall: "Function Hall",
    photography: "Photography",
    cooking: "Catering",
    makeup: "Makeup",
    decoration: "Decoration",
    arkestra: "Arkestra",
    carServices: "Bride/Groom Car",
    cleaning: "Cleaning",
  },
  te: {
    all: "అన్నీ",
    functionHall: "ఫంక్షన్ హాల్",
    photography: "ఫోటోగ్రఫీ",
    cooking: "కేటరింగ్",
    makeup: "మేకప్",
    decoration: "డెకరేషన్",
    arkestra: "ఆర్కెస్ట్రా",
    carServices: "వధువు / వరుడు కార్",
    cleaning: "క్లీనింగ్",
  },
};

const CATEGORY_ALIASES = {
  functionHall: ["Function Hall", "Church Wedding Hall", "Wedding Hall", "Hall"],
  photography: ["Photography", "Wedding Photography"],
  cooking: ["Cooking", "Catering", "Christian Catering"],
  makeup: ["Makeup", "Bridal Makeup"],
  decoration: ["Decoration", "Church Decoration"],
  arkestra: ["Arkestra", "Wedding Orchestra", "Orchestra"],
  carServices: ["Bride And Groom Car Services", "Wedding Cars", "Car Services"],
  cleaning: ["Cleaning", "Cleaning Services"],
};

const matchesCategory = (itemCategory, selectedKey) => {
  if (selectedKey === "all") return true;
  const normalized = String(itemCategory || "").trim().toLowerCase();
  return (CATEGORY_ALIASES[selectedKey] || [CATEGORY_VALUES[selectedKey]]).some(
    (value) => String(value).trim().toLowerCase() === normalized
  );
};

export default function ServicesScreen({ navigation }) {
  const {
    services,
    loadServiceRequests,
    loadWeddingServices,
    appTheme,
    language,
  } = useMatrimony();

  const t = getStrings(language).services;
  const theme = appTheme || {
    bg: COLORS.bg,
    card: COLORS.white,
    text: COLORS.text,
    muted: COLORS.muted,
    border: COLORS.border,
    soft: COLORS.softOrange,
    mode: "light",
  };

  const [category, setCategory] = useState("all");

  const categoryOptions = CATEGORY_KEYS.map((key, index) => ({
    key,
    value: CATEGORY_VALUES[key],
    label:
      (CATEGORY_LABELS[language] && CATEGORY_LABELS[language][key]) ||
      CATEGORY_VALUES[key],
  }));

  useFocusEffect(
    useCallback(() => {
      loadServiceRequests?.();
      loadWeddingServices?.();
    }, [loadServiceRequests, loadWeddingServices])
  );

  const filtered =
    category === "all"
      ? services
      : services.filter((item) => matchesCategory(item.category, category));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        navigation={navigation}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categoryOptions.map((item) => {
          const isActive = category === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? COLORS.primary : theme.card,
                  borderColor: isActive ? COLORS.primary : theme.border,
                },
              ]}
              onPress={() => setCategory(item.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? COLORS.white : theme.text },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {filtered.map((item) => (
          <ServiceCard
            key={item.id}
            item={item}
            onPress={() =>
              navigation.navigate("ServiceDetails", { service: item })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  categoryRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    height: 42,
    minWidth: 72,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 10,
    flexShrink: 0,
  },
  chipText: {
    fontWeight: "900",
    fontSize: 13,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
});
