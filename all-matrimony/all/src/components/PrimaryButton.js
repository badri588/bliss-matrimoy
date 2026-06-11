import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

export default function PrimaryButton({ title, onPress, style, disabled }) {
  const { appTheme } = useMatrimony();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={style}
      disabled={disabled}
    >
      <LinearGradient
        colors={
          disabled
            ? ["#C4B5FD", "#A78BFA"]
            : appTheme?.mode === "dark"
              ? ["#3B3B3B", "#151515"]
              : [COLORS.primary, COLORS.primaryDark]
        }
        style={[styles.button, disabled && styles.buttonDisabled]}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  text: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 16,
  },
});
