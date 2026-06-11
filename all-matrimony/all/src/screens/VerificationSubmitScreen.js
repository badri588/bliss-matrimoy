import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import * as DocumentPicker from "expo-document-picker";

import Header from "../components/Header";
import InlineMessage from "../components/InlineMessage";
import PrimaryButton from "../components/PrimaryButton";
import { API_BASE_URL, toApiAssetUrl } from "../config/api";
import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import { useMatrimony } from "../context/MatrimonyContext";

const proofFields = [
  {
    key: "addressProof",
    detailKey: "addressDetail",
    proofType: "address-proof",
    label: "Address Proof",
    detailLabel: "Address",
    detailPlaceholder: "Type address or area details",
    helperText: "Upload Aadhaar, voter ID, electricity bill, or another address document.",
  },
  {
    key: "educationProof",
    detailKey: "educationDetail",
    proofType: "education-proof",
    label: "Education Proof",
    detailLabel: "Education",
    detailPlaceholder: "Type education like B.Tech, MBA",
    helperText: "Upload degree certificate, marks memo, or educational proof.",
  },
  {
    key: "jobProof",
    detailKey: "jobDetail",
    proofType: "job-income-proof",
    label: "Job / Income Proof",
    detailLabel: "Job / Income",
    detailPlaceholder: "Type job or income like Software Engineer, 5 LPA",
    helperText: "Upload salary slip, offer letter, income proof, or business document.",
  },
];

const getDocumentName = (value) => {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return url.pathname.split("/").pop() || "Uploaded document";
  } catch (error) {
    return value.split("/").pop() || value;
  }
};

export default function VerificationSubmitScreen({ navigation }) {
  const { submitVerificationRequest, language } = useMatrimony();
  const t = getStrings(language).verification;
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitMessageType, setSubmitMessageType] = useState("info");
  const [showOkButton, setShowOkButton] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    idNumber: "",
    addressProof: "",
    addressDetail: "",
    educationProof: "",
    educationDetail: "",
    jobProof: "",
    jobDetail: "",
    familyContact: "",
    characterVerification: "",
  });

  const updateField = (key, value) => {
    if (submitMessage) {
      setSubmitMessage("");
    }

    if (showOkButton) {
      setShowOkButton(false);
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAcknowledge = () => {
    setShowOkButton(false);

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("MainTabs");
  };

  const openUploadedProof = async (value) => {
    if (!value) {
      return;
    }

    try {
      await Linking.openURL(value);
    } catch (error) {
      Alert.alert("Open Failed", "Unable to open the uploaded proof.");
    }
  };

  const uploadProofDocument = async (fieldKey, proofType, asset) => {
    if (!asset?.uri) {
      return null;
    }

    setUploadingField(fieldKey);
    setSubmitMessageType("info");
    setSubmitMessage(`Uploading ${proofFields.find((item) => item.key === fieldKey)?.label || "document"}...`);
    setShowOkButton(false);

    try {
      const formData = new FormData();
      const fallbackName = `${proofType}-${Date.now()}.${asset?.mimeType === "application/pdf" ? "pdf" : "jpg"}`;

      if (Platform.OS === "web" && asset.file) {
        formData.append("file", asset.file, asset.file.name || fallbackName);
      } else {
        formData.append("file", {
          uri: asset.uri,
          name: asset.name || asset.fileName || fallbackName,
          type: asset.mimeType || "application/octet-stream",
        });
      }

      formData.append("proofType", proofType);

      const response = await fetch(`${API_BASE_URL}/api/uploads/verification-document`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      const uploadedPath = data?.data?.filePath || data?.data?.fileUrl;

      if (!response.ok || data?.success === false || !uploadedPath) {
        throw new Error(data?.message || "Document upload failed.");
      }

      const normalizedPath = toApiAssetUrl(uploadedPath);
      updateField(fieldKey, normalizedPath);
      setSubmitMessageType("success");
      setSubmitMessage(`${proofFields.find((item) => item.key === fieldKey)?.label || "Document"} uploaded successfully.`);
      return normalizedPath;
    } catch (error) {
      setSubmitMessageType("error");
      setSubmitMessage(error.message || "Unable to upload document.");

      if (Platform.OS !== "web") {
        Alert.alert("Upload Failed", error.message || "Unable to upload document.");
      }

      return null;
    } finally {
      setUploadingField("");
    }
  };

  const pickProofDocument = async (fieldKey, proofType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      await uploadProofDocument(fieldKey, proofType, result.assets[0]);
    } catch (error) {
      setSubmitMessageType("error");
      setSubmitMessage("Unable to pick document. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!form.idNumber.trim()) {
      setSubmitMessageType("error");
      setSubmitMessage("Please enter Aadhaar / ID number.");
      return;
    }

    const missingProof = proofFields.find((field) => !form[field.key]);

    if (missingProof) {
      setSubmitMessageType("error");
      setSubmitMessage(`Please upload ${missingProof.label.toLowerCase()}.`);
      return;
    }

    if (typeof submitVerificationRequest !== "function") {
      setSubmitMessageType("error");
      setSubmitMessage(
        "submitVerificationRequest function is missing in MatrimonyContext."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await submitVerificationRequest(form);
      const isAlreadyPending =
        String(result?.message || "").toLowerCase().includes("already pending");
      const title = result?.success === false
        ? "Verification Failed"
        : isAlreadyPending
          ? "Already Pending"
          : "Submitted";
      const message =
        result?.message ||
        (isAlreadyPending
          ? "Your verification request is already pending."
          : "Verification request sent to admin.");

      setSubmitMessageType(result?.success === false ? "error" : "success");
      setSubmitMessage(message);
      setShowOkButton(true);

      if (Platform.OS !== "web") {
        Alert.alert(title, message, [
          {
            text: "OK",
            onPress: handleAcknowledge,
          },
        ]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        navigation={navigation}
        showNotification={false}
        backTo="MainTabs"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          contentContainerStyle={styles.content}
        >
          <InlineMessage type={submitMessageType} text={submitMessage} />

          <Text style={styles.note}>
            Submit correct details and upload address, education, and job/income proofs as image or PDF. Admin will review the same uploaded files from any device.
          </Text>

          <FormInput
            label="Aadhaar / ID Number"
            placeholder="Enter ID number"
            value={form.idNumber}
            onChangeText={(text) => updateField("idNumber", text)}
          />

          {proofFields.map((field) => (
            <View key={field.key}>
              <FormInput
                label={field.detailLabel}
                placeholder={field.detailPlaceholder}
                value={form[field.detailKey]}
                onChangeText={(text) => updateField(field.detailKey, text)}
              />
              <ProofUploader
                label={field.label}
                helperText={field.helperText}
                value={form[field.key]}
                isUploading={uploadingField === field.key}
                onChoose={() => pickProofDocument(field.key, field.proofType)}
                onOpen={() => openUploadedProof(form[field.key])}
              />
            </View>
          ))}

          <FormInput
            label="Family Contact Number"
            placeholder="Parent / guardian number"
            value={form.familyContact}
            onChangeText={(text) =>
              updateField("familyContact", text.replace(/\D/g, "").slice(0, 10))
            }
            keyboardType="phone-pad"
            maxLength={10}
          />

          <FormInput
            label="Character Verification"
            placeholder="Reference person / local verification details"
            value={form.characterVerification}
            onChangeText={(text) => updateField("characterVerification", text)}
          />

          <PrimaryButton
            title={isSubmitting ? "Submitting..." : "Submit Verification"}
            onPress={handleSubmit}
            style={styles.submitBtn}
            disabled={isSubmitting || Boolean(uploadingField)}
          />

          {isSubmitting ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={styles.loader}
            />
          ) : null}

          {Platform.OS === "web" && showOkButton ? (
            <PrimaryButton
              title="OK"
              onPress={handleAcknowledge}
              style={styles.okBtn}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProofUploader({
  label,
  helperText,
  value,
  isUploading,
  onChoose,
  onOpen,
}) {
  return (
    <View style={styles.proofCard}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.helperText}>{helperText}</Text>

      <View style={styles.proofActionRow}>
        <TouchableOpacity
          style={styles.uploadBtn}
          activeOpacity={0.85}
          onPress={onChoose}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color={COLORS.white} />
              <Text style={styles.uploadBtnText}>Upload File</Text>
            </>
          )}
        </TouchableOpacity>

        {value ? (
          <TouchableOpacity
            style={styles.viewBtn}
            activeOpacity={0.85}
            onPress={onOpen}
          >
            <Ionicons name="open-outline" size={18} color={COLORS.primary} />
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.uploadedName}>
        {value ? getDocumentName(value) : "No file uploaded yet"}
      </Text>
    </View>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  maxLength,
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        placeholderTextColor="#9CA3AF"
      />
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
    paddingBottom: 160,
    flexGrow: 1,
  },

  note: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },

  label: {
    color: COLORS.text,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 7,
  },

  helperText: {
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 19,
  },

  input: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontWeight: "700",
  },

  proofCard: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },

  proofActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  uploadBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
  },

  uploadBtnText: {
    color: COLORS.white,
    fontWeight: "900",
  },

  viewBtn: {
    minWidth: 92,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: COLORS.softOrange,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 12,
  },

  viewBtnText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  uploadedName: {
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 10,
  },

  submitBtn: {
    marginTop: 24,
  },

  loader: {
    marginTop: 12,
  },

  okBtn: {
    marginTop: 12,
  },
});
