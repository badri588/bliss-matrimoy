import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

const genderOptions = ["All", "Bride", "Groom"];

export default function SearchFilterScreen({ navigation, route }) {
  const { appTheme } = useMatrimony();
  const oldFilters = route?.params?.filters || {};

  const [filters, setFilters] = useState({
    gender: oldFilters.gender || "All",
    name: oldFilters.name || "",
    minAge: oldFilters.minAge || "",
    maxAge: oldFilters.maxAge || "",
    region: oldFilters.region || "",
    location: oldFilters.location || "",
    education: oldFilters.education || "",
    job: oldFilters.job || "",
  });

  const updateField = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const min = Number(filters.minAge);
    const max = Number(filters.maxAge);

    if (filters.minAge && Number.isNaN(min)) {
      Alert.alert("Invalid Age", "Please enter valid minimum age.");
      return;
    }

    if (filters.maxAge && Number.isNaN(max)) {
      Alert.alert("Invalid Age", "Please enter valid maximum age.");
      return;
    }

    if (filters.minAge && filters.maxAge && min > max) {
      Alert.alert("Invalid Age", "Minimum age should be less than maximum age.");
      return;
    }

    navigation.navigate("MainTabs", {
      screen: "Matches",
      params: { filters },
    });
  };

  const resetFilters = () => {
    setFilters({
      gender: "All",
      name: "",
      minAge: "",
      maxAge: "",
      region: "",
      location: "",
      education: "",
      job: "",
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
      <Header
        title="Search Filters"
        subtitle="Find suitable profiles"
        navigation={navigation}
        showBack={true}
        showNotification={false}
        backTo="MainTabs"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Looking For</Text>

        <FormInput
          label="Name"
          placeholder="Search by profile name"
          value={filters.name}
          onChangeText={(text) => updateField("name", text)}
        />

        <View style={styles.genderRow}>
          {genderOptions.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.genderBtn,
                filters.gender === item && styles.activeGenderBtn,
              ]}
              onPress={() => updateField("gender", item)}
            >
              <Ionicons
                name={
                  item === "Bride"
                    ? "female"
                    : item === "Groom"
                    ? "male"
                    : "people"
                }
                size={18}
                color={filters.gender === item ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.genderText,
                  filters.gender === item && styles.activeGenderText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Age Range</Text>

        <View style={styles.twoCol}>
          <FormInput
            label="Min Age"
            placeholder="21"
            value={filters.minAge}
            keyboardType="number-pad"
            onChangeText={(text) => updateField("minAge", text)}
            containerStyle={{ flex: 1 }}
          />

          <FormInput
            label="Max Age"
            placeholder="35"
            value={filters.maxAge}
            keyboardType="number-pad"
            onChangeText={(text) => updateField("maxAge", text)}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Text style={styles.sectionTitle}>Profile Details</Text>

        <FormInput
          label="Region"
          placeholder="Example: Telangana, Andhra, Kerala"
          value={filters.region}
          onChangeText={(text) => updateField("region", text)}
        />

        <FormInput
          label="Location"
          placeholder="Example: Kochi, Hyderabad, Kerala"
          value={filters.location}
          onChangeText={(text) => updateField("location", text)}
        />

        <FormInput
          label="Education"
          placeholder="Example: B.Tech, MBA, Degree"
          value={filters.education}
          onChangeText={(text) => updateField("education", text)}
        />

        <FormInput
          label="Profession"
          placeholder="Example: Doctor, Engineer"
          value={filters.job}
          onChangeText={(text) => updateField("job", text)}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Apply Filters"
            onPress={applyFilters}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  containerStyle,
}) {
  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 10,
  },
  genderRow: { flexDirection: "row", gap: 10 },
  genderBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  activeGenderBtn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  genderText: { color: COLORS.primary, fontWeight: "900", fontSize: 13 },
  activeGenderText: { color: COLORS.white },
  twoCol: { flexDirection: "row", gap: 12 },
  label: {
    color: COLORS.text,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 7,
  },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontWeight: "700",
  },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 26 },
  resetBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.softOrange,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  resetText: { color: COLORS.primary, fontWeight: "900" },
});
