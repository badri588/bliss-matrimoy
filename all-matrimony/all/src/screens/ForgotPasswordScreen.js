import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import InlineMessage from "../components/InlineMessage";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { API_BASE_URL } from "../config/api";
import {
  isValidEmail,
  isValidOtp,
  isValidPassword,
  normalizeEmail,
} from "../utils/authValidation";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: "info", text: "" });
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const canReset = useMemo(() => {
    return (
      isValidEmail(email) &&
      isValidOtp(otp) &&
      isValidPassword(password) &&
      password === confirmPassword
    );
  }, [email, otp, password, confirmPassword]);

  const clearMessage = () => {
    if (message.text) {
      setMessage({ type: "info", text: "" });
    }
  };

  const handleSendOtp = async () => {
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    try {
      setSendingOtp(true);
      setMessage({ type: "info", text: "" });

      const response = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: normalizedEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage({
          type: "error",
          text: data.message || "Unable to send OTP.",
        });
        return;
      }

      setOtpSent(true);
      setMessage({
        type: "success",
        text:
          data.message ||
          "OTP sent successfully to your email address.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Could not connect to backend. Check server and mail settings.",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!isValidOtp(otp)) {
      setMessage({
        type: "error",
        text: "Please enter the 6-digit OTP sent to your email.",
      });
      return;
    }

    if (!isValidPassword(password)) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Password and confirm password must match.",
      });
      return;
    }

    try {
      setResetting(true);
      setMessage({ type: "info", text: "" });

      const response = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            otp: otp.trim(),
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage({
          type: "error",
          text: data.message || "Unable to update password.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Password updated successfully.",
      });

      setTimeout(() => {
        navigation.replace("Login");
      }, 900);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Could not connect to backend. Check server and mail settings.",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Forgot Password"
        subtitle="Reset your account password with email OTP"
        navigation={navigation}
        showBack={true}
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
            colors={[COLORS.primaryDark, COLORS.primary, COLORS.maroon]}
            style={styles.hero}
          >
            <View style={styles.heroIcon}>
              <Ionicons name="mail-open-outline" size={34} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>Email OTP Reset</Text>
            <Text style={styles.heroText}>
              Enter your matrimony email, receive OTP, and set a new password securely.
            </Text>
          </LinearGradient>

          <View style={styles.card}>
            <InlineMessage type={message.type} text={message.text} />

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.row}>
              <View style={[styles.inputBox, styles.rowInput]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter registered email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearMessage();
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                style={styles.sideButton}
                activeOpacity={0.85}
                onPress={handleSendOtp}
                disabled={sendingOtp}
              >
                {sendingOtp ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.sideButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>OTP</Text>
            <View style={styles.inputBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.muted}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  clearMessage();
                }}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <PasswordField
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearMessage();
              }}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            <PasswordField
              label="Confirm Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearMessage();
              }}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
            />

            <PrimaryButton
              title={resetting ? "Updating..." : "Update Password"}
              onPress={handleResetPassword}
              disabled={resetting || !otpSent || !canReset}
              style={styles.primaryButton}
            />

            <View style={styles.noteBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.noteText}>
                After password update, old password will stop working and login will work only with the new password.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  showPassword,
  setShowPassword,
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={COLORS.muted}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
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
    </View>
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
    paddingBottom: 80,
    gap: 16,
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    alignItems: "center",
  },
  heroIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  heroText: {
    color: "#FDEDD8",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    gap: 10,
  },
  label: {
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 2,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  inputBox: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontWeight: "700",
    paddingVertical: 0,
  },
  sideButton: {
    minWidth: 108,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  sideButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 10,
  },
  noteBox: {
    borderRadius: 16,
    backgroundColor: COLORS.softOrange,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    color: COLORS.text,
    fontWeight: "700",
    lineHeight: 19,
    fontSize: 12,
  },
});
