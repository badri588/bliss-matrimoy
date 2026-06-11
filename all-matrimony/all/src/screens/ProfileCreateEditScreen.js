import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Asset } from "expo-asset";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import Header from "../components/Header";
import InlineMessage from "../components/InlineMessage";
import PrimaryButton from "../components/PrimaryButton";
import { API_BASE_URL, toApiAssetUrl } from "../config/api";
import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import { useMatrimony } from "../context/MatrimonyContext";

const genderOptions = ["Bride", "Groom"];
const profileCreatedForOptions = [
  "Self",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Relative",
  "Friend",
];
const maritalOptions = ["Never Married", "Divorced", "Widowed"];

const DEFAULT_PROFILE_IMAGE = Asset.fromModule(
  require("../../assets/Images/all-hero.png")
).uri;

const IMAGE_MEDIA_TYPES = ["images"];

export default function ProfileCreateEditScreen({ navigation }) {
  const { myProfile, saveMyProfile, language } = useMatrimony();
  const t = getStrings(language).profileEdit;
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitMessageType, setSubmitMessageType] = useState("info");
  const [showSuccessOk, setShowSuccessOk] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: myProfile?.name || "",
    profileCreatedFor: myProfile?.profileCreatedFor || "Self",
    gender: myProfile?.gender || "Groom",
    age: myProfile?.age || "",
    dob: myProfile?.dob || "",
    phone: myProfile?.phone || "",
    email: myProfile?.email || "",
    community: myProfile?.community || "",
    religion: myProfile?.religion || "",
    caste: myProfile?.caste || "",
    location: myProfile?.location || "",
    education: myProfile?.education || "",
    job: myProfile?.job || "",
    income: myProfile?.income || "",
    height: myProfile?.height || "",
    maritalStatus: myProfile?.maritalStatus || "Never Married",
    familyType: myProfile?.familyType || "",
    fatherName: myProfile?.fatherName || "",
    motherName: myProfile?.motherName || "",
    siblings: myProfile?.siblings || "",
    about: myProfile?.about || "",
    partnerAge: myProfile?.partnerAge || "",
    partnerCommunity: myProfile?.partnerCommunity || "",
    partnerLocation: myProfile?.partnerLocation || "",
    partnerEducation: myProfile?.partnerEducation || "",
    habits: myProfile?.habits || "",
    image: toApiAssetUrl(myProfile?.image || DEFAULT_PROFILE_IMAGE),
  });

  const updateField = (key, value) => {
    if (submitMessage) {
      setSubmitMessage("");
    }

    if (showSuccessOk) {
      setShowSuccessOk(false);
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSuccessAcknowledge = () => {
    setShowSuccessOk(false);

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("MainTabs");
  };

  const uploadProfileImage = async (asset) => {
    if (!asset?.uri) {
      return null;
    }

    setIsUploadingImage(true);
    setSubmitMessageType("info");
    setSubmitMessage("Uploading profile image...");
    setShowSuccessOk(false);

    try {
      const formData = new FormData();
      const fallbackName = `profile-${Date.now()}.jpg`;

      if (Platform.OS === "web" && asset.file) {
        formData.append("file", asset.file, asset.file.name || fallbackName);
      } else {
        formData.append("file", {
          uri: asset.uri,
          name: asset.fileName || fallbackName,
          type: asset.mimeType || "image/jpeg",
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/uploads/profile-image`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      const uploadedImagePath = data?.data?.imagePath || data?.data?.imageUrl;

      if (!response.ok || data.success === false || !uploadedImagePath) {
        throw new Error(data.message || "Image upload failed.");
      }

      updateField("image", toApiAssetUrl(uploadedImagePath));
      setSubmitMessageType("success");
      setSubmitMessage("Profile image uploaded successfully.");
      return uploadedImagePath;
    } catch (error) {
      setSubmitMessageType("error");
      setSubmitMessage(error.message || "Unable to upload image.");

      if (Platform.OS !== "web") {
        Alert.alert("Upload Failed", error.message || "Unable to upload image.");
      }

      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Camera symbol click chesthe real camera open avtundi
  const openProfileCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera permission to take profile photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: IMAGE_MEDIA_TYPES,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Camera Error", "Unable to open camera. Please try again.");
    }
  };

  // Choose button click chesthe gallery open avtundi
  const pickProfileImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Gallery Permission Required",
            "Please allow gallery permission to select profile photo."
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPES,
        allowsEditing: Platform.OS !== "web",
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Image Error", "Unable to select image. Please try again.");
    }
  };

  const removeProfileImage = () => {
    updateField("image", DEFAULT_PROFILE_IMAGE);
  };

  const validate = () => {
    if (!form.name.trim()) {
      setSubmitMessageType("error");
      setSubmitMessage("Please enter full name.");
      return false;
    }

    if (!form.profileCreatedFor.trim()) {
      setSubmitMessageType("error");
      setSubmitMessage("Please select profile created for.");
      return false;
    }

    if (!form.phone.trim()) {
      setSubmitMessageType("error");
      setSubmitMessage("Please enter phone number.");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setSubmitMessageType("error");
      setSubmitMessage("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!form.age.trim()) {
      setSubmitMessageType("error");
      setSubmitMessage("Please enter age.");
      return false;
    }

    if (!form.community.trim()) {
      setSubmitMessageType("error");
      setSubmitMessage("Please enter community.");
      return false;
    }

    if (!form.location.trim()) {
      setSubmitMessageType("error");
      setSubmitMessage("Please enter location.");
      return false;
    }

    if (!form.about.trim()) {
      setSubmitMessageType("error");
      setSubmitMessage("Please write about profile.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (isUploadingImage) {
      setSubmitMessageType("info");
      setSubmitMessage("Please wait until the image upload finishes.");
      return;
    }

    setSubmitMessage("");
    setShowSuccessOk(false);
    const result = await saveMyProfile(form);

    if (!result?.success) {
      const message = result?.message || "Unable to save profile.";
      setSubmitMessageType("error");
      setSubmitMessage(message);

      if (Platform.OS !== "web") {
        Alert.alert("Save Failed", message);
      }

      return;
    }

    const successMessage =
      "Profile submitted successfully. Waiting for admin approval.";

    setSubmitMessageType("success");
    setSubmitMessage(successMessage);
    setShowSuccessOk(true);

    if (Platform.OS !== "web") {
      Alert.alert("Success", successMessage, [
        {
          text: "OK",
          onPress: handleSuccessAcknowledge,
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        navigation={navigation}
        showBack={true}
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <InlineMessage type={submitMessageType} text={submitMessage} />

          {/* PROFILE PHOTO CARD */}
          <View style={styles.photoCard}>
            <View style={styles.imageBox}>
              <Image source={{ uri: form.image }} style={styles.avatar} />

              {/* Only this camera symbol opens real camera */}
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={openProfileCamera}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={19} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.photoInfo}>
              <Text style={styles.photoTitle}>Profile Photo</Text>
              <Text style={styles.photoText}>
                Tap camera icon to take photo. Use Choose to select from
                gallery.
              </Text>

              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={[
                    styles.chooseBtn,
                    isUploadingImage && styles.disabledAction,
                  ]}
                  onPress={pickProfileImage}
                  activeOpacity={0.85}
                  disabled={isUploadingImage}
                >
                  <Ionicons
                    name="image-outline"
                    size={17}
                    color={COLORS.maroon || COLORS.primary}
                  />
                  <Text style={styles.chooseBtnText}>Choose</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.removeBtn,
                    isUploadingImage && styles.disabledAction,
                  ]}
                  onPress={removeProfileImage}
                  activeOpacity={0.85}
                  disabled={isUploadingImage}
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={COLORS.danger}
                  />
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Basic Details</Text>

          <FormInput
            label="Full Name"
            placeholder="Enter full name"
            value={form.name}
            onChangeText={(text) => updateField("name", text)}
          />

          <Text style={styles.label}>Profile Created For</Text>
          <View style={styles.optionWrap}>
            {profileCreatedForOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.smallChip,
                  form.profileCreatedFor === item && styles.activeChip,
                ]}
                onPress={() => updateField("profileCreatedFor", item)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.smallChipText,
                    form.profileCreatedFor === item && styles.activeChipText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.optionRow}>
            {genderOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionBtn,
                  form.gender === item && styles.activeOption,
                ]}
                onPress={() => updateField("gender", item)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={item === "Bride" ? "female" : "male"}
                  size={18}
                  color={form.gender === item ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.optionText,
                    form.gender === item && styles.activeOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.twoCol}>
            <FormInput
              label="Age"
              placeholder="25"
              value={String(form.age)}
              keyboardType="number-pad"
              onChangeText={(text) => updateField("age", text)}
              containerStyle={styles.flexOne}
            />

            <FormInput
              label="Height"
              placeholder="5'7"
              value={form.height}
              onChangeText={(text) => updateField("height", text)}
              containerStyle={styles.flexOne}
            />
          </View>

          <FormInput
            label="Date of Birth"
            placeholder="DD/MM/YYYY"
            value={form.dob}
            onChangeText={(text) => updateField("dob", text)}
          />

          <FormInput
            label="Phone Number"
            placeholder="Enter phone number"
            value={form.phone}
            keyboardType="phone-pad"
            maxLength={10}
            onChangeText={(text) =>
              updateField("phone", text.replace(/\D/g, "").slice(0, 10))
            }
          />

          <FormInput
            label="Email"
            placeholder="Enter email"
            value={form.email}
            keyboardType="email-address"
            onChangeText={(text) => updateField("email", text)}
          />

          <Text style={styles.sectionTitle}>Community Details</Text>

          <View style={styles.twoCol}>
            <FormInput
              label="Religion"
              placeholder="Hindu / Christian / Muslim"
              value={form.religion}
              onChangeText={(text) => updateField("religion", text)}
              containerStyle={styles.flexOne}
            />

            <FormInput
              label="Community"
              placeholder="Community"
              value={form.community}
              onChangeText={(text) => updateField("community", text)}
              containerStyle={styles.flexOne}
            />
          </View>

          <FormInput
            label="Caste / Sub Community"
            placeholder="Optional"
            value={form.caste}
            onChangeText={(text) => updateField("caste", text)}
          />

          <FormInput
            label="Location"
            placeholder="City, State"
            value={form.location}
            onChangeText={(text) => updateField("location", text)}
          />

          <Text style={styles.sectionTitle}>Education & Career</Text>

          <FormInput
            label="Education"
            placeholder="B.Tech / MBA / Degree"
            value={form.education}
            onChangeText={(text) => updateField("education", text)}
          />

          <FormInput
            label="Job / Profession"
            placeholder="Software Engineer"
            value={form.job}
            onChangeText={(text) => updateField("job", text)}
          />

          <FormInput
            label="Annual Income"
            placeholder="₹8 LPA"
            value={form.income}
            onChangeText={(text) => updateField("income", text)}
          />

          <Text style={styles.sectionTitle}>Family Details</Text>

          <Text style={styles.label}>Marital Status</Text>
          <View style={styles.optionWrap}>
            {maritalOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.smallChip,
                  form.maritalStatus === item && styles.activeChip,
                ]}
                onPress={() => updateField("maritalStatus", item)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.smallChipText,
                    form.maritalStatus === item && styles.activeChipText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormInput
            label="Family Type"
            placeholder="Nuclear / Joint"
            value={form.familyType}
            onChangeText={(text) => updateField("familyType", text)}
          />

          <View style={styles.twoCol}>
            <FormInput
              label="Father Name"
              placeholder="Father name"
              value={form.fatherName}
              onChangeText={(text) => updateField("fatherName", text)}
              containerStyle={styles.flexOne}
            />

            <FormInput
              label="Mother Name"
              placeholder="Mother name"
              value={form.motherName}
              onChangeText={(text) => updateField("motherName", text)}
              containerStyle={styles.flexOne}
            />
          </View>

          <FormInput
            label="Siblings"
            placeholder="Example: 1 Brother, 1 Sister"
            value={form.siblings}
            onChangeText={(text) => updateField("siblings", text)}
          />

          <Text style={styles.sectionTitle}>About Profile</Text>

          <Text style={styles.label}>About</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write about yourself, family values and expectations"
            value={form.about}
            onChangeText={(text) => updateField("about", text)}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />

          <FormInput
            label="Profile Image URL"
            placeholder="https://image-url.com/photo.jpg"
            value={form.image}
            onChangeText={(text) => updateField("image", text)}
          />

          <FormInput
            label="Habits"
            placeholder="Reading, travel, fitness, music"
            value={form.habits}
            onChangeText={(text) => updateField("habits", text)}
          />

          <Text style={styles.sectionTitle}>Partner Preferences</Text>

          <FormInput
            label="Preferred Age"
            placeholder="Example: 24 - 30"
            value={form.partnerAge}
            onChangeText={(text) => updateField("partnerAge", text)}
          />

          <FormInput
            label="Preferred Community"
            placeholder="Any / Same community"
            value={form.partnerCommunity}
            onChangeText={(text) => updateField("partnerCommunity", text)}
          />

          <FormInput
            label="Preferred Location"
            placeholder="Kerala / Bangalore / Any"
            value={form.partnerLocation}
            onChangeText={(text) => updateField("partnerLocation", text)}
          />

          <FormInput
            label="Preferred Education"
            placeholder="Graduate / Post Graduate"
            value={form.partnerEducation}
            onChangeText={(text) => updateField("partnerEducation", text)}
          />

          <PrimaryButton
            title="Save Profile"
            onPress={handleSave}
            style={styles.saveBtn}
            disabled={isUploadingImage}
          />

          {Platform.OS === "web" && showSuccessOk ? (
            <PrimaryButton
              title="OK"
              onPress={handleSuccessAcknowledge}
              style={styles.okBtn}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
  maxLength,
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
    gap: 12,
  },

  photoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    marginBottom: 18,
  },

  imageBox: {
    position: "relative",
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.border,
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  cameraBtn: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 4,
  },

  photoInfo: {
    flex: 1,
  },

  photoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  photoText: {
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 5,
    lineHeight: 18,
    fontSize: 12,
  },

  photoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  chooseBtn: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: COLORS.softMaroon || COLORS.softOrange,
    borderWidth: 1,
    borderColor: COLORS.maroon || COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  chooseBtnText: {
    color: COLORS.maroon || COLORS.primary,
    fontWeight: "900",
    fontSize: 12,
  },

  removeBtn: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  removeBtnText: {
    color: COLORS.danger,
    fontWeight: "900",
    fontSize: 12,
  },

  disabledAction: {
    opacity: 0.55,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 18,
    marginBottom: 4,
  },

  label: {
    color: COLORS.text,
    fontWeight: "900",
    marginTop: 13,
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

  textArea: {
    height: 120,
    paddingTop: 14,
    lineHeight: 21,
  },

  twoCol: {
    flexDirection: "row",
    gap: 12,
  },

  flexOne: {
    flex: 1,
  },

  optionRow: {
    flexDirection: "row",
    gap: 12,
  },

  optionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  activeOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  optionText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  activeOptionText: {
    color: COLORS.white,
  },

  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  smallChip: {
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  smallChipText: {
    color: COLORS.text,
    fontWeight: "900",
  },

  activeChipText: {
    color: COLORS.white,
  },

  saveBtn: {
    marginTop: 24,
  },

  okBtn: {
    marginTop: 12,
  },
});
