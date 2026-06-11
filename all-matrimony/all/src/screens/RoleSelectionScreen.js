import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import { useMatrimony } from "../context/MatrimonyContext";

export default function RoleSelectionScreen({ navigation }) {
  const { language, appTheme } = useMatrimony();
  const t = getStrings(language).roleSelection;
  const theme = appTheme || {
    bg: COLORS.bg,
    card: COLORS.white,
    text: COLORS.text,
    muted: COLORS.muted,
    border: COLORS.border,
    soft: COLORS.softOrange,
    headerGradient: [COLORS.primaryDark, COLORS.primary, COLORS.maroon || COLORS.primaryDark],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <LinearGradient
        colors={theme.headerGradient || [COLORS.primaryDark, COLORS.primary, COLORS.maroon || COLORS.primaryDark]}
        style={styles.hero}
      >
        <View style={[styles.logoCircle, { backgroundColor: theme.card }]}>
          <Ionicons name="heart" size={34} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={[
            styles.roleCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Login")}
        >
          <View style={[styles.iconBox, { backgroundColor: theme.soft || COLORS.softOrange }]}>
            <Ionicons name="people" size={32} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{t.brideGroomTitle}</Text>
            <Text style={[styles.cardText, { color: theme.muted }]}>{t.brideGroomText}</Text>
          </View>

          <Ionicons name="chevron-forward" size={24} color={theme.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AdminLogin")}
        >
          <View style={[styles.iconBox, { backgroundColor: COLORS.softGreen }]}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.secondary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{t.adminTitle}</Text>
            <Text style={[styles.cardText, { color: theme.muted }]}>{t.adminText}</Text>
          </View>

          <Ionicons name="chevron-forward" size={24} color={theme.muted} />
        </TouchableOpacity>

        <View style={[styles.noteBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
          <Text style={[styles.noteText, { color: theme.muted }]}>{t.note}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 34,
    paddingBottom: 36,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    alignItems: "center",
  },

  logoCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#FDEDD8",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  roleCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },

  iconBox: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  cardText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 5,
  },

  noteBox: {
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },

  noteText: {
    flex: 1,
    fontWeight: "700",
    lineHeight: 19,
  },
});
