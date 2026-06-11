// import React, { useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";

// import Header from "../components/Header";
// import InlineMessage from "../components/InlineMessage";
// import PrimaryButton from "../components/PrimaryButton";
// import { COLORS } from "../constants/colors";
// import { API_BASE_URL } from "../config/api";
// import {
//   isValidEmail,
//   isValidOtp,
//   isValidPassword,
//   isValidPhone,
//   normalizeEmail,
//   normalizePhone,
// } from "../utils/authValidation";

// const initialForm = {
//   name: "",
//   email: "",
//   phone: "",
//   otp: "",
//   gender: "",
//   community: "",
//   location: "",
//   password: "",
//   confirmPassword: "",
// };

// export default function RegisterScreen({ navigation }) {
//   const [form, setForm] = useState(initialForm);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [message, setMessage] = useState({ type: "info", text: "" });
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [verifyingOtp, setVerifyingOtp] = useState(false);
//   const [registering, setRegistering] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [phoneVerified, setPhoneVerified] = useState(false);

//   const updateField = (key, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [key]: value,
//       ...(key === "phone" ? { otp: "" } : {}),
//     }));

//     if (key === "phone") {
//       setOtpSent(false);
//       setPhoneVerified(false);
//     }

//     if (message.text) {
//       setMessage({ type: "info", text: "" });
//     }
//   };

//   const canVerifyOtp = useMemo(
//     () => otpSent && isValidOtp(form.otp) && !phoneVerified,
//     [form.otp, otpSent, phoneVerified]
//   );

//   const validateRegisterForm = () => {
//     if (!form.name.trim()) {
//       return "Please enter full name.";
//     }

//     if (!isValidEmail(form.email)) {
//       return "Please enter a valid email address.";
//     }

//     if (!isValidPhone(form.phone)) {
//       return "Please enter a valid 10-digit phone number.";
//     }

//     if (!phoneVerified) {
//       return "Please verify your phone number with OTP.";
//     }

//     if (!form.gender.trim()) {
//       return "Please enter gender.";
//     }

//     if (!form.community.trim()) {
//       return "Please enter community or religion.";
//     }

//     if (!form.location.trim()) {
//       return "Please enter location.";
//     }

//     if (!isValidPassword(form.password)) {
//       return "Password must be at least 6 characters.";
//     }

//     if (form.password !== form.confirmPassword) {
//       return "Password and confirm password must match.";
//     }

//     return "";
//   };

//   const handleSendOtp = async () => {
//     const phone = normalizePhone(form.phone);

//     if (!isValidPhone(phone)) {
//       setMessage({
//         type: "error",
//         text: "Please enter a valid 10-digit phone number before sending OTP.",
//       });
//       return;
//     }

//     try {
//       setSendingOtp(true);
//       setMessage({ type: "info", text: "" });

//       const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ phone }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         setMessage({
//           type: "error",
//           text: data.message || "Unable to send OTP right now.",
//         });
//         return;
//       }

//       setOtpSent(true);
//       setPhoneVerified(false);
//       setMessage({
//         type: "success",
//         text: data.demoOtp
//           ? `${data.message} Demo OTP: ${data.demoOtp}`
//           : data.message || "OTP sent successfully.",
//       });
//     } catch (error) {
//       setMessage({
//         type: "error",
//         text: "Could not connect to backend. Check Spring Boot server and API URL.",
//       });
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   const handleVerifyOtp = async () => {
//     const phone = normalizePhone(form.phone);
//     const otp = form.otp.trim();

//     if (!isValidPhone(phone)) {
//       setMessage({
//         type: "error",
//         text: "Please enter a valid phone number.",
//       });
//       return;
//     }

//     if (!isValidOtp(otp)) {
//       setMessage({
//         type: "error",
//         text: "Please enter a valid 6-digit OTP.",
//       });
//       return;
//     }

//     try {
//       setVerifyingOtp(true);
//       setMessage({ type: "info", text: "" });

//       const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ phone, otp }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         setPhoneVerified(false);
//         setMessage({
//           type: "error",
//           text: data.message || "Invalid OTP.",
//         });
//         return;
//       }

//       setPhoneVerified(true);
//       setMessage({
//         type: "success",
//         text: data.message || "Phone number verified successfully.",
//       });
//     } catch (error) {
//       setMessage({
//         type: "error",
//         text: "Could not verify OTP. Check backend connection.",
//       });
//     } finally {
//       setVerifyingOtp(false);
//     }
//   };

//   const handleRegister = async () => {
//     const validationError = validateRegisterForm();

//     if (validationError) {
//       setMessage({
//         type: "error",
//         text: validationError,
//       });
//       return;
//     }

//     try {
//       setRegistering(true);
//       setMessage({ type: "info", text: "" });

//       const payload = {
//         name: form.name.trim(),
//         email: normalizeEmail(form.email),
//         phone: normalizePhone(form.phone),
//         gender: form.gender.trim(),
//         community: form.community.trim(),
//         location: form.location.trim(),
//         password: form.password,
//       };

//       const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         setMessage({
//           type: "error",
//           text: data.message || "Registration failed.",
//         });
//         return;
//       }

//       setMessage({
//         type: "success",
//         text: data.message || "Registration successful. Please login.",
//       });

//       setTimeout(() => {
//         navigation.replace("Login");
//       }, 900);
//     } catch (error) {
//       setMessage({
//         type: "error",
//         text: "Could not connect to backend. Check Spring Boot server and database.",
//       });
//     } finally {
//       setRegistering(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Header
//         title="Create Profile"
//         subtitle="Register bride or groom profile"
//         navigation={navigation}
//         showBack={true}
//         showNotification={false}
//         backTo="Login"
//       />

//       <KeyboardAvoidingView
//         style={styles.keyboardView}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <ScrollView
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.content}
//         >
//           <InlineMessage type={message.type} text={message.text} />

//           <FormField
//             label="Full Name"
//             placeholder="Enter full name"
//             value={form.name}
//             onChangeText={(text) => updateField("name", text)}
//             icon="person-outline"
//           />

//           <FormField
//             label="Email Address"
//             placeholder="Enter email address"
//             value={form.email}
//             onChangeText={(text) => updateField("email", text)}
//             icon="mail-outline"
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />

//           <Text style={styles.label}>Phone Number</Text>
//           <View style={styles.actionRow}>
//             <View style={[styles.inputBox, styles.rowInput]}>
//               <Ionicons name="call-outline" size={20} color={COLORS.muted} />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter 10-digit phone number"
//                 value={form.phone}
//                 onChangeText={(text) => updateField("phone", text)}
//                 keyboardType="phone-pad"
//                 placeholderTextColor="#9CA3AF"
//               />
//               {phoneVerified && (
//                 <Ionicons
//                   name="checkmark-circle"
//                   size={20}
//                   color={COLORS.success}
//                 />
//               )}
//             </View>

//             <TouchableOpacity
//               style={styles.sideButton}
//               activeOpacity={0.85}
//               onPress={handleSendOtp}
//               disabled={sendingOtp}
//             >
//               {sendingOtp ? (
//                 <ActivityIndicator size="small" color={COLORS.white} />
//               ) : (
//                 <Text style={styles.sideButtonText}>Send OTP</Text>
//               )}
//             </TouchableOpacity>
//           </View>

//           <Text style={styles.label}>OTP</Text>
//           <View style={styles.actionRow}>
//             <View style={[styles.inputBox, styles.rowInput]}>
//               <Ionicons
//                 name="shield-checkmark-outline"
//                 size={20}
//                 color={COLORS.muted}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter 6-digit OTP"
//                 value={form.otp}
//                 onChangeText={(text) => updateField("otp", text)}
//                 keyboardType="number-pad"
//                 placeholderTextColor="#9CA3AF"
//                 maxLength={6}
//               />
//             </View>

//             <TouchableOpacity
//               style={[
//                 styles.sideButton,
//                 (!canVerifyOtp || verifyingOtp) && styles.sideButtonDisabled,
//               ]}
//               activeOpacity={0.85}
//               onPress={handleVerifyOtp}
//               disabled={!canVerifyOtp || verifyingOtp}
//             >
//               {verifyingOtp ? (
//                 <ActivityIndicator size="small" color={COLORS.white} />
//               ) : (
//                 <Text style={styles.sideButtonText}>Verify</Text>
//               )}
//             </TouchableOpacity>
//           </View>

//           <FormField
//             label="Bride or Groom"
//             placeholder="Enter Bride or Groom"
//             value={form.gender}
//             onChangeText={(text) => updateField("gender", text)}
//             icon="people-outline"
//           />

//           <FormField
//             label="Community / Religion"
//             placeholder="Enter community or religion"
//             value={form.community}
//             onChangeText={(text) => updateField("community", text)}
//             icon="albums-outline"
//           />

//           <FormField
//             label="Location"
//             placeholder="Enter location"
//             value={form.location}
//             onChangeText={(text) => updateField("location", text)}
//             icon="location-outline"
//           />

//           <PasswordField
//             label="Password"
//             placeholder="Enter password"
//             value={form.password}
//             onChangeText={(text) => updateField("password", text)}
//             showPassword={showPassword}
//             setShowPassword={setShowPassword}
//           />

//           <PasswordField
//             label="Confirm Password"
//             placeholder="Re-enter password"
//             value={form.confirmPassword}
//             onChangeText={(text) => updateField("confirmPassword", text)}
//             showPassword={showConfirmPassword}
//             setShowPassword={setShowConfirmPassword}
//           />

//           <PrimaryButton
//             title={registering ? "Creating Account..." : "Submit Registration"}
//             onPress={handleRegister}
//             style={{ marginTop: 22 }}
//             disabled={registering}
//           />
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// function FormField({
//   label,
//   placeholder,
//   value,
//   onChangeText,
//   icon,
//   keyboardType,
//   autoCapitalize = "sentences",
// }) {
//   return (
//     <View>
//       <Text style={styles.label}>{label}</Text>
//       <View style={styles.inputBox}>
//         <Ionicons name={icon} size={20} color={COLORS.muted} />
//         <TextInput
//           style={styles.input}
//           placeholder={placeholder}
//           value={value}
//           onChangeText={onChangeText}
//           keyboardType={keyboardType}
//           autoCapitalize={autoCapitalize}
//           placeholderTextColor="#9CA3AF"
//         />
//       </View>
//     </View>
//   );
// }

// function PasswordField({
//   label,
//   placeholder,
//   value,
//   onChangeText,
//   showPassword,
//   setShowPassword,
// }) {
//   return (
//     <View>
//       <Text style={styles.label}>{label}</Text>
//       <View style={styles.inputBox}>
//         <Ionicons
//           name="lock-closed-outline"
//           size={20}
//           color={COLORS.muted}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder={placeholder}
//           secureTextEntry={!showPassword}
//           value={value}
//           onChangeText={onChangeText}
//           placeholderTextColor="#9CA3AF"
//         />
//         <TouchableOpacity
//           activeOpacity={0.8}
//           onPress={() => setShowPassword((prev) => !prev)}
//         >
//           <Ionicons
//             name={showPassword ? "eye-off-outline" : "eye-outline"}
//             size={20}
//             color={COLORS.muted}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.bg,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   content: {
//     padding: 18,
//     paddingBottom: 120,
//     flexGrow: 1,
//     gap: 12,
//   },
//   label: {
//     fontWeight: "900",
//     color: COLORS.text,
//     marginBottom: 8,
//   },
//   inputBox: {
//     minHeight: 52,
//     borderRadius: 16,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   input: {
//     flex: 1,
//     fontWeight: "600",
//     color: COLORS.text,
//     paddingVertical: 0,
//   },
//   actionRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   rowInput: {
//     flex: 1,
//   },
//   sideButton: {
//     minWidth: 108,
//     height: 52,
//     borderRadius: 16,
//     backgroundColor: COLORS.primary,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 14,
//   },
//   sideButtonDisabled: {
//     backgroundColor: "#C4B5FD",
//   },
//   sideButtonText: {
//     color: COLORS.white,
//     fontWeight: "900",
//     fontSize: 13,
//   },
// });





import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import Header from "../components/Header";
import InlineMessage from "../components/InlineMessage";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { API_BASE_URL } from "../config/api";
import { useMatrimony } from "../context/MatrimonyContext";
import {
  isValidEmail,
  isValidOtp,
  isValidPassword,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from "../utils/authValidation";

const initialForm = {
  profileCreatedFor: "",
  name: "",
  email: "",
  phone: "",
  otp: "",
  gender: "",
  password: "",
  confirmPassword: "",
};

const PROFILE_CREATED_FOR_OPTIONS = [
  "Self",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Relative",
  "Friend",
];

const GENDER_OPTIONS = ["Groom", "Bride"];

export default function RegisterScreen({ navigation }) {
  const { hydrateUserSession } = useMatrimony();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: "info", text: "" });
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [profileCreatedForOpen, setProfileCreatedForOpen] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "phone" ? { otp: "" } : {}),
    }));

    if (key === "phone") {
      setOtpSent(false);
      setPhoneVerified(false);
    }

    if (key === "profileCreatedFor") {
      setProfileCreatedForOpen(false);
    }

    if (message.text) {
      setMessage({ type: "info", text: "" });
    }
  };

  const canVerifyOtp = useMemo(
    () => otpSent && isValidOtp(form.otp) && !phoneVerified,
    [form.otp, otpSent, phoneVerified]
  );

  const validateRegisterForm = () => {
    if (!form.profileCreatedFor.trim()) {
      return "Please select profile created for.";
    }

    if (!form.gender.trim()) {
      return "Please select gender.";
    }

    if (!form.name.trim()) {
      return "Please enter full name.";
    }

    if (!isValidEmail(form.email)) {
      return "Please enter a valid email address.";
    }

    if (!isValidPhone(form.phone)) {
      return "Please enter a valid 10-digit phone number.";
    }

    if (!phoneVerified) {
      return "Please verify your phone number with OTP.";
    }

    if (!isValidPassword(form.password)) {
      return "Password must be at least 6 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Password and confirm password must match.";
    }

    return "";
  };

  const handleSendOtp = async () => {
    const phone = normalizePhone(form.phone);

    if (!isValidPhone(phone)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit phone number before sending OTP.",
      });
      return;
    }

    try {
      setSendingOtp(true);
      setMessage({ type: "info", text: "" });

      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      const otpSendFailed =
        data?.demoOtp ||
        /twilio otp failed|demo otp|local testing/i.test(data?.message || "");

      if (!response.ok || !data.success || otpSendFailed) {
        Alert.alert("OTP Failed", "OTP failed. Please try again later.");
        setMessage({
          type: "error",
          text: "OTP failed. Please try again later.",
        });
        return;
      }

      setOtpSent(true);
      setPhoneVerified(false);
      setMessage({
        type: "success",
        text: data.message || "OTP sent successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Could not connect to backend. Check Spring Boot server and API URL.",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const phone = normalizePhone(form.phone);
    const otp = form.otp.trim();

    if (!isValidPhone(phone)) {
      setMessage({
        type: "error",
        text: "Please enter a valid phone number.",
      });
      return;
    }

    if (!isValidOtp(otp)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 6-digit OTP.",
      });
      return;
    }

    try {
      setVerifyingOtp(true);
      setMessage({ type: "info", text: "" });

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setPhoneVerified(false);
        setMessage({
          type: "error",
          text: data.message || "Invalid OTP.",
        });
        return;
      }

      setPhoneVerified(true);
      setMessage({
        type: "success",
        text: data.message || "Phone number verified successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Could not verify OTP. Check backend connection.",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRegister = async () => {
    const validationError = validateRegisterForm();

    if (validationError) {
      setMessage({
        type: "error",
        text: validationError,
      });
      return;
    }

    try {
      setRegistering(true);
      setMessage({ type: "info", text: "" });

      const payload = {
        profileCreatedFor: form.profileCreatedFor.trim(),
        name: form.name.trim(),
        email: normalizeEmail(form.email),
        phone: normalizePhone(form.phone),
        gender: form.gender.trim(),
        password: form.password,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage({
          type: "error",
          text: data.message || "Registration failed.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Registration successful. Please login.",
      });

      await hydrateUserSession?.(data.data);

      setTimeout(() => {
        navigation.replace("MainTabs");
      }, 500);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Could not connect to backend. Check Spring Boot server and database.",
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Create Profile"
        subtitle="Register bride or groom profile"
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
          <InlineMessage type={message.type} text={message.text} />

          <DropdownField
            label="Profile Created For"
            selectedValue={form.profileCreatedFor}
            placeholder="Select profile relation"
            options={PROFILE_CREATED_FOR_OPTIONS}
            isOpen={profileCreatedForOpen}
            onToggle={() => setProfileCreatedForOpen((prev) => !prev)}
            onSelect={(value) => updateField("profileCreatedFor", value)}
          />

          <OptionField
            label="Select Gender"
            options={GENDER_OPTIONS}
            selectedValue={form.gender}
            onSelect={(value) => updateField("gender", value)}
          />

          <FormField
            label="Full Name"
            placeholder="Enter full name"
            value={form.name}
            onChangeText={(text) => updateField("name", text)}
            icon="person-outline"
          />

          <FormField
            label="Email Address"
            placeholder="Enter email address"
            value={form.email}
            onChangeText={(text) => updateField("email", text)}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.actionRow}>
            <View style={[styles.inputBox, styles.rowInput]}>
              <Ionicons name="call-outline" size={20} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit phone number"
                value={form.phone}
                onChangeText={(text) =>
                  updateField("phone", text.replace(/\D/g, "").slice(0, 10))
                }
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#9CA3AF"
              />
              {phoneVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
              )}
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
          <View style={styles.actionRow}>
            <View style={[styles.inputBox, styles.rowInput]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.muted}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChangeText={(text) => updateField("otp", text)}
                keyboardType="number-pad"
                placeholderTextColor="#9CA3AF"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sideButton,
                (!canVerifyOtp || verifyingOtp) && styles.sideButtonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleVerifyOtp}
              disabled={!canVerifyOtp || verifyingOtp}
            >
              {verifyingOtp ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.sideButtonText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>

          <PasswordField
            label="Password"
            placeholder="Enter password"
            value={form.password}
            onChangeText={(text) => updateField("password", text)}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          <PasswordField
            label="Confirm Password"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChangeText={(text) => updateField("confirmPassword", text)}
            showPassword={showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
          />

          <PrimaryButton
            title={registering ? "Creating Account..." : "Submit Registration"}
            onPress={handleRegister}
            style={{ marginTop: 22 }}
            disabled={registering}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function OptionField({ label, options, selectedValue, onSelect }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionWrap}>
        {options.map((option) => {
          const selected = selectedValue === option;

          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.85}
              style={[styles.optionButton, selected && styles.optionButtonActive]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  selected && styles.optionButtonTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function DropdownField({
  label,
  options,
  selectedValue,
  placeholder,
  isOpen,
  onToggle,
  onSelect,
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.dropdownInput}
        onPress={onToggle}
      >
        <Ionicons name="people-outline" size={20} color={COLORS.muted} />
        <Text
          style={[
            styles.dropdownValue,
            !selectedValue && styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
        >
          {selectedValue || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
          size={18}
          color={COLORS.muted}
        />
      </TouchableOpacity>

      <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onToggle}>
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={onToggle}
        >
          <View style={styles.dropdownMenu}>
            {options.map((option) => {
              const selected = selectedValue === option;

              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.85}
                  style={[styles.dropdownItem, selected && styles.dropdownItemActive]}
                  onPress={() => onSelect(option)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selected && styles.dropdownItemTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType,
  autoCapitalize = "sentences",
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        <Ionicons name={icon} size={20} color={COLORS.muted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
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
    padding: 18,
    paddingBottom: 120,
    flexGrow: 1,
    gap: 12,
  },
  label: {
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
  },
  inputBox: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontWeight: "600",
    color: COLORS.text,
    paddingVertical: 0,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowInput: {
    flex: 1,
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
  sideButtonDisabled: {
    backgroundColor: "#C4B5FD",
  },
  sideButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 13,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 13,
  },
  optionButtonTextActive: {
    color: COLORS.white,
  },
  dropdownInput: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dropdownValue: {
    flex: 1,
    fontWeight: "700",
    color: COLORS.text,
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontWeight: "600",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 18,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 10,
    gap: 8,
  },
  dropdownItem: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.bg,
  },
  dropdownItemActive: {
    backgroundColor: "#F4EEFF",
    borderWidth: 1,
    borderColor: "#D6C6FF",
  },
  dropdownItemText: {
    fontWeight: "700",
    color: COLORS.text,
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
  },
});
