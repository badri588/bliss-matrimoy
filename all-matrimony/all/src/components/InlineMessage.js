import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

const MESSAGE_STYLES = {
  success: {
    icon: "checkmark-circle",
    backgroundColor: "#ECFDF5",
    borderColor: "#BBF7D0",
    color: COLORS.success,
  },
  error: {
    icon: "close-circle",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    color: COLORS.danger,
  },
  info: {
    icon: "information-circle",
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    color: "#1D4ED8",
  },
};

export default function InlineMessage({ type = "info", text }) {
  const { appTheme } = useMatrimony();

  if (!text) {
    return null;
  }

  const theme = MESSAGE_STYLES[type] || MESSAGE_STYLES.info;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: appTheme?.mode === "dark" ? "#161616" : theme.backgroundColor,
          borderColor: appTheme?.mode === "dark" ? appTheme.border : theme.borderColor,
        },
      ]}
    >
      <Ionicons name={theme.icon} size={18} color={theme.color} />
      <Text
        style={[
          styles.text,
          { color: appTheme?.mode === "dark" ? appTheme.text : theme.color },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  text: {
    flex: 1,
    fontWeight: "700",
    lineHeight: 19,
  },
});
