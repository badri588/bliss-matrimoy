import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";
import {
  formatAgeLabel,
  translateGender,
} from "../constants/localization";

export default function ProfileCard({ item, onPress, onWishlist, isWishlisted = false }) {
  const { appTheme, language } = useMatrimony();
  const ageLabel = formatAgeLabel(language, item.age);
  const genderLabel = translateGender(language, item.gender);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: appTheme?.card || COLORS.card,
          borderColor: appTheme?.border || COLORS.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.info}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: appTheme?.text || COLORS.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.meta, { color: appTheme?.muted || COLORS.muted }]}>
              {ageLabel} | {item.height} | {genderLabel}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.heartBtn,
              {
                backgroundColor: isWishlisted
                  ? "rgba(34, 197, 94, 0.16)"
                  : appTheme?.soft || COLORS.softOrange,
                borderColor: isWishlisted ? COLORS.success : "transparent",
                borderWidth: isWishlisted ? 1 : 0,
              },
            ]}
            onPress={onWishlist}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={22}
              color={isWishlisted ? COLORS.success : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.detail, { color: appTheme?.text || COLORS.text }]}>
          {item.community} | {item.location}
        </Text>
        <Text style={[styles.detail, { color: appTheme?.text || COLORS.text }]}>
          {item.education} | {item.job}
        </Text>
        <Text style={styles.income}>{item.income}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    elevation: 3,
  },
  image: {
    height: 210,
    width: "100%",
  },
  info: {
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 19,
    fontWeight: "900",
  },
  meta: {
    marginTop: 3,
    fontWeight: "600",
  },
  detail: {
    marginTop: 7,
    fontWeight: "600",
  },
  income: {
    color: COLORS.secondary,
    marginTop: 8,
    fontWeight: "900",
  },
  heartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
