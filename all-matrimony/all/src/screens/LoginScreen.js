import React, { useEffect, useState } from "react";
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

import InlineMessage from "../components/InlineMessage";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { API_BASE_URL } from "../config/api";
import { getStrings } from "../constants/i18n";
import { useMatrimony } from "../context/MatrimonyContext";
import { validateIdentifier } from "../utils/authValidation";

const LOGIN_TEXT = {
  en: {
    cardTitle: "Bride / Groom Login",
    cardSubtitle: "Continue your matrimony journey",
    identifierLabel: "Email or Phone Number",
    identifierPlaceholder: "Enter email or 10-digit phone number",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    vendorTitle: "Vendor Login",
    vendorSubtitle: "Manage your wedding service bookings",
    vendorIdentifierLabel: "Mobile number",
    vendorIdentifierPlaceholder: "Enter registered vendor mobile number",
    brideGroomTab: "Bride / Groom",
    vendorTab: "Vendor",
    createVendorAccount: "Create Vendor Account",
    vendorLoginSuccess: "Vendor login successful.",
    invalidVendorLogin: "Invalid vendor mobile number or password.",
    forgotPassword: "Forgot Password?",
    checking: "Checking...",
    login: "Login",
    newUser: "New user? ",
    createAccount: "Create Account",
    adminLogin: "Admin Login",
    infoText:
      "Web and mobile both use the same validation now. Login accepts either email or phone number.",
    enterPassword: "Please enter password.",
    invalidResponse: (baseUrl) => `Login API returned an invalid response from ${baseUrl}.`,
    invalidLogin: "Invalid email, phone number, or password.",
    loginSuccess: "Login successful.",
    backendError: (baseUrl) =>
      `Could not reach ${baseUrl}. Make sure the phone/browser can access this backend URL.`,
  },
  te: {
    cardTitle: "వధువు / వరుడు లాగిన్",
    cardSubtitle: "మీ మ్యాట్రిమోని ప్రయాణాన్ని కొనసాగించండి",
    identifierLabel: "ఇమెయిల్ లేదా ఫోన్ నంబర్",
    identifierPlaceholder: "ఇమెయిల్ లేదా 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "పాస్‌వర్డ్ నమోదు చేయండి",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    checking: "తనిఖీ చేస్తున్నాం...",
    login: "లాగిన్",
    newUser: "కొత్త వినియోగదారా? ",
    createAccount: "ఖాతా సృష్టించండి",
    adminLogin: "అడ్మిన్ లాగిన్",
    infoText:
      "ఇప్పుడు వెబ్ మరియు మొబైల్ రెండూ ఒకే వాలిడేషన్‌ను ఉపయోగిస్తాయి. లాగిన్‌కు ఇమెయిల్ లేదా ఫోన్ నంబర్ సరిపోతుంది.",
    enterPassword: "దయచేసి పాస్‌వర్డ్ నమోదు చేయండి.",
    invalidResponse: (baseUrl) => `${baseUrl} నుండి లాగిన్ API చెల్లని స్పందన ఇచ్చింది.`,
    invalidLogin: "చెల్లని ఇమెయిల్, ఫోన్ నంబర్ లేదా పాస్‌వర్డ్.",
    loginSuccess: "లాగిన్ విజయవంతం అయింది.",
    backendError: (baseUrl) =>
      `${baseUrl} ను చేరుకోలేకపోయాం. ఫోన్/బ్రౌజర్ ఈ backend URL ను యాక్సెస్ చేయగలదో చూసుకోండి.`,
  },
};

export default function LoginScreen({ navigation }) {
  const {
    hydrateUserSession,
    clearUserSession,
    appTheme,
    language,
    loginVendor,
    getVendorSetupRoute,
  } = useMatrimony();
  const t = getStrings(language).login;
  const l = LOGIN_TEXT[language] || LOGIN_TEXT.en;
  const theme = appTheme || {
    bg: COLORS.bg,
    card: COLORS.white,
    text: COLORS.text,
    muted: COLORS.muted,
    border: COLORS.border,
    soft: COLORS.softOrange,
    mode: "light",
    headerGradient: [COLORS.primaryDark, COLORS.primary, COLORS.maroon || COLORS.primaryDark],
  };
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info", text: "" });
  const [loginMode, setLoginMode] = useState("user");

  useEffect(() => {
    clearUserSession?.();
  }, []);

  const handleLogin = async () => {
    if (loginMode === "vendor") {
      const cleanMobile = identifier.trim();
      const cleanPassword = password.trim();

      if (!/^\d{10}$/.test(cleanMobile)) {
        setMessage({
          type: "error",
          text: "Please enter a valid 10-digit vendor mobile number.",
        });
        return;
      }

      if (!cleanPassword) {
        setMessage({
          type: "error",
          text: l.enterPassword,
        });
        return;
      }

      try {
        setLoading(true);
        setMessage({ type: "info", text: "" });

        const result = await loginVendor?.(cleanMobile, cleanPassword);

        if (!result?.success) {
          setMessage({
            type: "error",
            text: result?.message || l.invalidVendorLogin,
          });
          return;
        }

        setMessage({
          type: "success",
          text: result.message || l.vendorLoginSuccess,
        });
        const nextRoute = getVendorSetupRoute?.(result.vendor) || { name: "VendorDashboard" };
        navigation.replace(nextRoute.name, nextRoute.params);
      } catch (error) {
        setMessage({
          type: "error",
          text: error.message || l.invalidVendorLogin,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    const identifierResult = validateIdentifier(identifier);
    const cleanPassword = password.trim();

    if (!identifierResult.valid) {
      setMessage({
        type: "error",
        text: identifierResult.message,
      });
      return;
    }

    if (!cleanPassword) {
      setMessage({
        type: "error",
        text: l.enterPassword,
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "info", text: "" });

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifierResult.normalizedValue,
          password: cleanPassword,
        }),
      });

      const rawResponse = await response.text();
      let data = null;

      try {
        data = rawResponse ? JSON.parse(rawResponse) : null;
      } catch (parseError) {
        setMessage({
          type: "error",
          text: l.invalidResponse(API_BASE_URL),
        });
        return;
      }

      if (!response.ok || !data?.success) {
        setMessage({
          type: "error",
          text: data?.message || l.invalidLogin,
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || l.loginSuccess,
      });

      await hydrateUserSession(data.data);
      navigation.replace("MainTabs");
    } catch (error) {
      setMessage({
        type: "error",
        text: l.backendError(API_BASE_URL),
      });
    } finally {
      setLoading(false);
    }
  };

  const isVendorLogin = loginMode === "vendor";
  const switchLoginMode = (mode) => {
    setLoginMode(mode);
    setIdentifier("");
    setPassword("");
    setShowPassword(false);
    setMessage({ type: "info", text: "" });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearGradient
            colors={[
              ...(theme.headerGradient || [COLORS.primaryDark, COLORS.primary, COLORS.maroon || COLORS.primaryDark]),
            ]}
            style={styles.hero}
          >
            <View style={styles.logo}>
              <Ionicons name="heart" size={42} color={COLORS.primary} />
            </View>

            <Text style={styles.title}>{t.backTitle}</Text>
            <Text style={styles.subtitle}>{t.backSubtitle}</Text>
          </LinearGradient>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {isVendorLogin ? l.vendorTitle : l.cardTitle}
            </Text>
            <Text style={[styles.cardSubTitle, { color: theme.muted }]}>
              {isVendorLogin ? l.vendorSubtitle : l.cardSubtitle}
            </Text>

            <View style={[styles.modeTabs, { borderColor: theme.border }]}>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  !isVendorLogin && { backgroundColor: theme.primary || COLORS.primary },
                ]}
                activeOpacity={0.85}
                onPress={() => switchLoginMode("user")}
              >
                <Ionicons
                  name="heart"
                  size={16}
                  color={!isVendorLogin ? COLORS.white : theme.primary || COLORS.primary}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    { color: !isVendorLogin ? COLORS.white : theme.primary || COLORS.primary },
                  ]}
                >
                  {l.brideGroomTab}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeTab,
                  isVendorLogin && { backgroundColor: theme.primary || COLORS.primary },
                ]}
                activeOpacity={0.85}
                onPress={() => switchLoginMode("vendor")}
              >
                <Ionicons
                  name="briefcase"
                  size={16}
                  color={isVendorLogin ? COLORS.white : theme.primary || COLORS.primary}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    { color: isVendorLogin ? COLORS.white : theme.primary || COLORS.primary },
                  ]}
                >
                  {l.vendorTab}
                </Text>
              </TouchableOpacity>
            </View>

            <InlineMessage type={message.type} text={message.text} />

            <Text style={[styles.label, { color: theme.text }]}>
              {isVendorLogin ? l.vendorIdentifierLabel : l.identifierLabel}
            </Text>
            <View
              style={[
                styles.inputBox,
                { backgroundColor: theme.bg, borderColor: theme.border },
              ]}
            >
              <Ionicons
                name={isVendorLogin ? "call-outline" : "person-circle-outline"}
                size={20}
                color={theme.muted}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={
                  isVendorLogin
                    ? l.vendorIdentifierPlaceholder
                    : l.identifierPlaceholder
                }
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(
                    isVendorLogin ? text.replace(/\D/g, "").slice(0, 10) : text
                  );
                  if (message.text) {
                    setMessage({ type: "info", text: "" });
                  }
                }}
                autoCapitalize="none"
                keyboardType={isVendorLogin ? "phone-pad" : "email-address"}
                maxLength={isVendorLogin ? 10 : undefined}
                placeholderTextColor={theme.muted}
              />
            </View>

            <Text style={[styles.label, { color: theme.text }]}>
              {l.passwordLabel}
            </Text>
            <View
              style={[
                styles.inputBox,
                { backgroundColor: theme.bg, borderColor: theme.border },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.muted}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={l.passwordPlaceholder}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (message.text) {
                    setMessage({ type: "info", text: "" });
                  }
                }}
                placeholderTextColor={theme.muted}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={theme.muted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgot}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={[styles.forgotText, { color: theme.primary || COLORS.primary }]}>
                {l.forgotPassword}
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title={loading ? l.checking : l.login}
              onPress={handleLogin}
              disabled={loading}
            />

            {loading && (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
            )}

            <TouchableOpacity
              style={styles.registerRow}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate(isVendorLogin ? "VendorRegister" : "Register")
              }
            >
              {!isVendorLogin && (
                <Text style={[styles.registerText, { color: theme.muted }]}>
                  {l.newUser}
                </Text>
              )}
              <Text style={[styles.registerLink, { color: theme.primary || COLORS.primary }]}>
                {isVendorLogin ? l.createVendorAccount : l.createAccount}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.muted }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity
              style={[
                styles.adminLinkBtn,
                { backgroundColor: theme.soft || COLORS.softOrange, borderColor: theme.border },
              ]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AdminLogin")}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color={theme.primary || COLORS.primary}
              />
              <Text style={[styles.adminLinkText, { color: theme.primary || COLORS.primary }]}>
                {l.adminLogin}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={theme.primary || COLORS.primary}
            />
            <Text style={[styles.infoText, { color: theme.muted }]}>
              {l.infoText}
            </Text>
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

  scrollContent: {
    paddingBottom: 34,
  },

  hero: {
    alignItems: "center",
    paddingTop: 42,
    paddingBottom: 34,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    position: "relative",
  },

  backBtn: {
    position: "absolute",
    left: 16,
    top: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    marginBottom: 18,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.white,
    textAlign: "center",
  },

  subtitle: {
    color: "#FDEDD8",
    marginTop: 7,
    fontWeight: "700",
    textAlign: "center",
  },

  card: {
    margin: 18,
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },

  cardSubTitle: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 5,
    fontWeight: "700",
    marginBottom: 8,
  },

  modeTabs: {
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1,
    padding: 4,
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
  },

  modeTab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  modeTabText: {
    fontSize: 12,
    fontWeight: "900",
  },

  label: {
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 4,
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

  forgot: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 8,
  },

  forgotText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  loader: {
    marginTop: 2,
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  registerText: {
    color: COLORS.muted,
    fontWeight: "700",
  },

  registerLink: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 8,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  dividerText: {
    color: COLORS.muted,
    fontWeight: "900",
  },

  adminLinkBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.softOrange,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  adminLinkText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  infoBox: {
    marginHorizontal: 18,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  infoText: {
    flex: 1,
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 19,
  },
});
