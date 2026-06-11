import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

export default function VerificationSubmitScreen({ navigation }) {
  const { submitVerificationRequest } = useMatrimony();

  const [form, setForm] = useState({
    idNumber: "",
    addressProof: "",
    educationProof: "",
    jobProof: "",
    familyContact: "",
    characterVerification: "",
    maritalProof: "",
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.idNumber.trim() || !form.addressProof.trim()) {
      Alert.alert(
        "Required",
        "Please add Aadhaar/ID number and address proof."
      );
      return;
    }

    submitVerificationRequest(form);

    Alert.alert("Submitted", "Verification request sent to admin.", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Background Verification"
        subtitle="Submit documents for admin approval"
        navigation={navigation}
        showNotification={false}
        backTo="MainTabs"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.note}>
          Submit correct details. Admin will check and approve your bride/groom
          profile.
        </Text>

        <FormInput
          label="Aadhaar / ID Number"
          placeholder="Enter ID number"
          value={form.idNumber}
          onChangeText={(text) => updateField("idNumber", text)}
        />

        <FormInput
          label="Address Proof"
          placeholder="Aadhaar / Voter ID / Electricity Bill"
          value={form.addressProof}
          onChangeText={(text) => updateField("addressProof", text)}
        />

        <FormInput
          label="Education Proof"
          placeholder="Degree certificate / marks memo"
          value={form.educationProof}
          onChangeText={(text) => updateField("educationProof", text)}
        />

        <FormInput
          label="Job / Income Proof"
          placeholder="Salary slip / business proof"
          value={form.jobProof}
          onChangeText={(text) => updateField("jobProof", text)}
        />

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

        <FormInput
          label="Marital Status Proof"
          placeholder="Never married / divorce proof / widow proof"
          value={form.maritalProof}
          onChangeText={(text) => updateField("maritalProof", text)}
        />

        <PrimaryButton
          title="Submit Verification"
          onPress={handleSubmit}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: 16,
    paddingBottom: 40,
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
});
