import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Asset } from "expo-asset";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";
import {
  translateServiceCategory,
  translateServiceTitle,
} from "../constants/localization";

const DEFAULT_SERVICE_IMAGE = Asset.fromModule(
  require("../../assets/Images/all-hero.png")
).uri;

export default function ServiceCard({ item, onPress }) {
  const { appTheme, language } = useMatrimony();
  const categoryLabel = translateServiceCategory(language, item.category);
  const titleLabel = translateServiceTitle(language, item.title);
  const [imageUri, setImageUri] = useState(item?.image || DEFAULT_SERVICE_IMAGE);

  useEffect(() => {
    setImageUri(item?.image || DEFAULT_SERVICE_IMAGE);
  }, [item?.image]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: appTheme?.card || COLORS.white,
          borderColor: appTheme?.border || COLORS.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        onError={() => setImageUri(DEFAULT_SERVICE_IMAGE)}
      />

      <View style={styles.content}>
        <View
          style={[
            styles.categoryPill,
            { backgroundColor: appTheme?.mode === "dark" ? "#163126" : COLORS.softGreen },
          ]}
        >
          <Text style={styles.category}>{categoryLabel}</Text>
        </View>

        <Text style={[styles.title, { color: appTheme?.text || COLORS.text }]}>
          {titleLabel}
        </Text>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={COLORS.muted} />
          <Text style={[styles.meta, { color: appTheme?.muted || COLORS.muted }]}>
            {item.location}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>{item.price}</Text>
          <View
            style={[
              styles.rating,
              { backgroundColor: appTheme?.soft || COLORS.softOrange },
            ]}
          >
            <Ionicons name="star" size={14} color={COLORS.gold} />
            <Text style={[styles.ratingText, { color: appTheme?.text || COLORS.text }]}>
              {item.rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 160,
  },
  content: {
    padding: 14,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.softGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 8,
  },
  category: {
    color: COLORS.secondary,
    fontWeight: "900",
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 5,
  },
  meta: {
    color: COLORS.muted,
    fontWeight: "600",
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    color: COLORS.primary,
    fontWeight: "900",
  },
  rating: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    backgroundColor: COLORS.softOrange,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  ratingText: {
    fontWeight: "900",
    color: COLORS.text,
  },
});
