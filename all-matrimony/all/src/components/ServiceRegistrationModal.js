import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import PrimaryButton from "./PrimaryButton";
import { useMatrimony } from "../context/MatrimonyContext";

const INITIAL_FORM = {
  name: "",
  phone: "",
  email: "",
  location: "",
  notes: "",
};

const STRINGS = {
  en: {
    title: (serviceTitle) =>
      serviceTitle ? `Register for ${serviceTitle}` : "Service Registration",
    subtitle:
      "Fill in your details to continue to secure payment and booking approval.",
    fullName: "Full Name",
    fullNamePh: "Enter your full name",
    phone: "Phone Number",
    phonePh: "Enter your phone number",
    email: "Email Address",
    emailPh: "Enter your email address",
    location: "Location",
    locationPh: "Enter your city or area",
    notes: "Notes",
    notesPh: "Any additional requirement for the vendor",
    cancel: "Cancel",
    submit: "Register & Continue",
    submitting: "Submitting...",
    enterName: "Enter your full name.",
    enterPhone: "Enter your phone number.",
    enterEmail: "Enter your email address.",
    enterLocation: "Enter your location.",
    invalidPhone: "Phone number should be exactly 10 digits.",
    invalidEmail: "Enter a valid email address.",
  },
  te: {
    title: (serviceTitle) =>
      serviceTitle ? `${serviceTitle} కోసం రిజిస్టర్ చేయండి` : "సర్వీస్ రిజిస్ట్రేషన్",
    subtitle: "సర్వీస్ బుకింగ్ అభ్యర్థన కొనసాగించడానికి మీ వివరాలు నమోదు చేయండి.",
    fullName: "పూర్తి పేరు",
    fullNamePh: "మీ పూర్తి పేరు నమోదు చేయండి",
    phone: "ఫోన్ నంబర్",
    phonePh: "మీ ఫోన్ నంబర్ నమోదు చేయండి",
    email: "ఇమెయిల్ చిరునామా",
    emailPh: "మీ ఇమెయిల్ నమోదు చేయండి",
    location: "స్థానం",
    locationPh: "మీ నగరం లేదా ప్రాంతం నమోదు చేయండి",
    notes: "గమనికలు",
    notesPh: "వెండర్ కోసం అదనపు అవసరం ఏమైనా ఉంటే",
    cancel: "రద్దు",
    submit: "రిజిస్టర్ చేసి కొనసాగించండి",
    submitting: "పంపుతున్నాం...",
    enterName: "దయచేసి పూర్తి పేరు నమోదు చేయండి.",
    enterPhone: "దయచేసి ఫోన్ నంబర్ నమోదు చేయండి.",
    enterEmail: "దయచేసి ఇమెయిల్ చిరునామా నమోదు చేయండి.",
    enterLocation: "దయచేసి స్థానం నమోదు చేయండి.",
    invalidPhone: "ఫోన్ నంబర్‌లో కనీసం 10 అంకెలు ఉండాలి.",
    invalidEmail: "చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామా నమోదు చేయండి.",
  },
};

export default function ServiceRegistrationModal({
  visible,
  loading = false,
  service,
  onClose,
  onSubmit,
}) {
  const { appTheme, language } = useMatrimony();
  const t = STRINGS[language] || STRINGS.en;
  const theme = appTheme || {
    bg: COLORS.bg,
    card: COLORS.white,
    text: COLORS.text,
    muted: COLORS.muted,
    border: COLORS.border,
  };
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!visible) {
      setForm(INITIAL_FORM);
      setErrors({});
    }
  }, [visible]);

  const title = useMemo(() => t.title(service?.title), [service?.title, language]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      return { ...prev, [key]: "" };
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!String(form.name || "").trim()) {
      nextErrors.name = t.enterName;
    }

    if (!String(form.phone || "").trim()) {
      nextErrors.phone = t.enterPhone;
    } else if (!/^[6-9]\d{9}$/.test(String(form.phone).trim())) {
      nextErrors.phone = t.invalidPhone;
    }

    if (!String(form.email || "").trim()) {
      nextErrors.email = t.enterEmail;
    } else if (!/\S+@\S+\.\S+/.test(String(form.email).trim())) {
      nextErrors.email = t.invalidEmail;
    }

    if (!String(form.location || "").trim()) {
      nextErrors.location = t.enterLocation;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    onSubmit?.({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      location: form.location.trim(),
      notes: form.notes.trim(),
    });
  };

  const renderField = ({
    keyName,
    label,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "sentences",
    multiline = false,
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        value={form[keyName]}
        onChangeText={(value) =>
          updateField(
            keyName,
            keyName === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value
          )
        }
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        maxLength={keyName === "phone" ? 10 : undefined}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          {
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.text,
          },
          multiline && styles.textArea,
        ]}
      />
      {errors[keyName] ? <Text style={styles.errorText}>{errors[keyName]}</Text> : null}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>{t.subtitle}</Text>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.bg }]}
              onPress={onClose}
              disabled={loading}
            >
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            {renderField({
              keyName: "name",
              label: t.fullName,
              placeholder: t.fullNamePh,
              autoCapitalize: "words",
            })}

            {renderField({
              keyName: "phone",
              label: t.phone,
              placeholder: t.phonePh,
              keyboardType: "phone-pad",
            })}

            {renderField({
              keyName: "email",
              label: t.email,
              placeholder: t.emailPh,
              keyboardType: "email-address",
              autoCapitalize: "none",
            })}

            {renderField({
              keyName: "location",
              label: t.location,
              placeholder: t.locationPh,
              autoCapitalize: "words",
            })}

            {renderField({
              keyName: "notes",
              label: t.notes,
              placeholder: t.notesPh,
              multiline: true,
            })}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.bg, borderColor: theme.border }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.secondaryText, { color: theme.primary || COLORS.primary }]}>
                {t.cancel}
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title={loading ? t.submitting : t.submit}
              onPress={handleSubmit}
              style={styles.primaryAction}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 6,
    lineHeight: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  formContent: {
    paddingTop: 18,
    paddingBottom: 8,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  label: {
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontWeight: "600",
  },
  textArea: {
    minHeight: 110,
    paddingTop: 14,
    paddingBottom: 14,
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontWeight: "900",
  },
  primaryAction: {
    flex: 1,
  },
});
