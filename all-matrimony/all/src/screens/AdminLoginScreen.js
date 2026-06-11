import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";

const ADMIN_EMAIL = "admin@matrimony.com";
const ADMIN_PASSWORD = "admin123";

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState("admin@matrimony.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert("Required", "Please enter admin email and password.");
      return;
    }

    if (cleanEmail === ADMIN_EMAIL && cleanPassword === ADMIN_PASSWORD) {
      navigation.replace("AdminTabs");
      return;
    }

    Alert.alert("Invalid Login", "Admin email or password is incorrect.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Admin Login"
        subtitle="Secure admin access"
        navigation={navigation}
        showNotification={false}
        backTo="Login"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.adminCard}
          >
            <View style={styles.adminIcon}>
              <Ionicons
                name="shield-checkmark"
                size={40}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.adminTitle}>Admin Panel Access</Text>
            <Text style={styles.adminText}>
              Login with admin credentials to approve profiles, manage
              verifications, users and wedding services.
            </Text>
          </LinearGradient>

          <View style={styles.formCard}>
            <Text style={styles.label}>Admin Email</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="admin@matrimony.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.muted}
              />
              <TextInput
                style={styles.input}
                placeholder="admin123"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            </View>

            <PrimaryButton
              title="Login as Admin"
              onPress={handleAdminLogin}
              style={styles.loginBtn}
            />

            <TouchableOpacity
              style={styles.userLoginBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("Login")}
            >
              <Ionicons name="people-outline" size={18} color={COLORS.primary} />
              <Text style={styles.userLoginText}>Go to Bride/Groom Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.credentialBox}>
            <Text style={styles.credentialTitle}>Demo Admin Credentials</Text>
            <Text style={styles.credentialText}>Email: admin@matrimony.com</Text>
            <Text style={styles.credentialText}>Password: admin123</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  adminCard: {
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },

  adminIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  adminTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },

  adminText: {
    color: "#FDEDD8",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 8,
  },

  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },

  label: {
    color: COLORS.text,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 7,
  },

  inputBox: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    gap: 10,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontWeight: "700",
    paddingVertical: 0,
  },

  loginBtn: {
    marginTop: 24,
  },

  userLoginBtn: {
    marginTop: 16,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.softOrange,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  userLoginText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  credentialBox: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  credentialTitle: {
    color: COLORS.text,
    fontWeight: "900",
    marginBottom: 6,
  },

  credentialText: {
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 3,
  },
});
