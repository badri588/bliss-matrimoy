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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { API_BASE_URL } from "../config/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("user@matrimony.com");
  const [password, setPassword] = useState("user123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert("Required", "Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert("Login Failed", data.message || "Invalid email or password.");
        return;
      }

      Alert.alert("Success", "Login successful.");

      navigation.replace("MainTabs");
    } catch (error) {
      Alert.alert(
        "Backend Error",
        "Backend connect avvadam ledu. Server run lo unda? API_BASE_URL correct aa check cheyyandi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="User Login"
        subtitle="Bride / Groom account"
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
            style={styles.loginCard}
          >
            <View style={styles.loginIcon}>
              <Ionicons name="heart" size={40} color={COLORS.primary} />
            </View>

            <Text style={styles.loginTitle}>Welcome Back</Text>

            <Text style={styles.loginText}>
              Login to manage your matrimony profile, interests, notifications
              and wedding services.
            </Text>
          </LinearGradient>

          <View style={styles.formCard}>
            <Text style={styles.label}>Email</Text>

            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color={COLORS.muted} />

              <TextInput
                style={styles.input}
                placeholder="user@matrimony.com"
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
                placeholder="user123"
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
              title={loading ? "Checking..." : "Login"}
              onPress={handleLogin}
              style={styles.loginBtn}
              disabled={loading}
            />

            {loading && (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={styles.loader}
              />
            )}

            <TouchableOpacity
              style={styles.registerBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("Register")}
            >
              <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />

              <Text style={styles.registerText}>
                New user? Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adminBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AdminLogin")}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={COLORS.primary}
              />

              <Text style={styles.adminText}>Go to Admin Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.credentialBox}>
            <Text style={styles.credentialTitle}>Demo User Credentials</Text>
            <Text style={styles.credentialText}>Email: user@matrimony.com</Text>
            <Text style={styles.credentialText}>Password: user123</Text>
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
    paddingBottom: 60,
    flexGrow: 1,
  },

  loginCard: {
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },

  loginIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  loginTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },

  loginText: {
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

  loader: {
    marginTop: 12,
  },

  registerBtn: {
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

  registerText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  adminBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  adminText: {
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
