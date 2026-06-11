import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { Asset } from "expo-asset";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import Header from "../components/Header";
import { useMatrimony } from "../context/MatrimonyContext";

const TEXT = {
  en: {
    title: "My Profile",
    subtitle: "Manage your matrimony account",
    completion: "Profile Completion",
    editProfile: "Create / Edit Profile",
    pending: "Pending",
    accepted: "Accepted",
    total: "Total",
    summary: "Profile Summary",
    community: "Community",
    religion: "Religion",
    education: "Education",
    profession: "Profession",
    income: "Income",
    height: "Height",
    editTitle: "Edit Profile",
    editSub: "Update personal, family and partner preferences",
    verification: "Background Verification",
    interests: "Interest Requests",
    interestsSub: "Accept, reject or open chat",
    premium: "Premium Membership",
    premiumSub: "Upgrade your profile visibility",
    services: "My Wedding Service Requests",
    servicesSub: "Your function hall, arkestra, cooking, car service requests",
    notifications: "Notifications",
    notificationsSub: "View latest profile and service updates",
    faq: "FAQ Questions",
    faqSub: "Common questions about this app",
    language: "Language",
    languageSub: "Tap to choose Telugu or English",
    theme: "Black / White Mode",
    themeSub: "Swipe to change app mode",
    about: "About Us",
    aboutSub: "Know more about this matrimony app",
    support: "Contact Support",
    supportSub: "Call, email or WhatsApp support",
    aiChat: "AI Chat Assistant",
    aiChatSub: "Get app guidance, booking steps and profile help",
    logout: "Logout",
    logoutSub: "Go back to login page",
  },
  te: {
    title: "నా ప్రొఫైల్",
    subtitle: "మీ మ్యాట్రిమోనీ అకౌంట్ నిర్వహించండి",
    completion: "ప్రొఫైల్ పూర్తి",
    editProfile: "ప్రొఫైల్ క్రియేట్ / ఎడిట్",
    pending: "పెండింగ్",
    accepted: "అంగీకరించబడింది",
    total: "మొత్తం",
    summary: "ప్రొఫైల్ సారాంశం",
    community: "కమ్యూనిటీ",
    religion: "మతం",
    education: "విద్య",
    profession: "వృత్తి",
    income: "ఆదాయం",
    height: "ఎత్తు",
    editTitle: "ప్రొఫైల్ ఎడిట్",
    editSub: "వ్యక్తిగత, కుటుంబ, భాగస్వామి వివరాలు అప్డేట్ చేయండి",
    verification: "బ్యాక్‌గ్రౌండ్ వెరిఫికేషన్",
    interests: "ఇంట్రెస్ట్ రిక్వెస్ట్స్",
    interestsSub: "Accept, reject లేదా chat open చేయండి",
    premium: "ప్రీమియం మెంబర్‌షిప్",
    premiumSub: "మీ ప్రొఫైల్ visibility పెంచండి",
    services: "నా వెడ్డింగ్ సర్వీస్ రిక్వెస్ట్స్",
    servicesSub: "ఫంక్షన్ హాల్, ఆర్కెస్ట్రా, కుకింగ్, కార్ సర్వీసులు",
    notifications: "నోటిఫికేషన్స్",
    notificationsSub: "ప్రొఫైల్ మరియు సర్వీస్ అప్డేట్స్ చూడండి",
    faq: "FAQ ప్రశ్నలు",
    faqSub: "ఈ యాప్ గురించి సాధారణ ప్రశ్నలు",
    language: "భాష",
    languageSub: "తెలుగు లేదా ఇంగ్లీష్ ఎంచుకోవడానికి ట్యాప్ చేయండి",
    theme: "బ్లాక్ / వైట్ మోడ్",
    themeSub: "యాప్ మోడ్ మార్చడానికి స్వైప్ చేయండి",
    about: "మా గురించి",
    aboutSub: "ఈ మ్యాట్రిమోనీ యాప్ గురించి తెలుసుకోండి",
    support: "సపోర్ట్ సంప్రదించండి",
    supportSub: "కాల్, ఇమెయిల్ లేదా వాట్సాప్ సపోర్ట్",
    aiChat: "AI చాట్ అసిస్టెంట్",
    aiChatSub: "యాప్ గైడెన్స్, బుకింగ్ స్టెప్స్, ప్రొఫైల్ హెల్ప్",
    logout: "లాగౌట్",
    logoutSub: "లాగిన్ పేజీకి తిరిగి వెళ్ళండి",
  },
};

const DEFAULT_AVATAR = Asset.fromModule(
  require("../../assets/Images/all-hero.png")
).uri;

const FAQ_DATA = [
  {
    enQ: "How do I edit my profile?",
    enA: "Go to My Profile and tap Create / Edit Profile. Fill your personal, family and partner preference details, then save.",
    teQ: "నా ప్రొఫైల్ ఎలా ఎడిట్ చేయాలి?",
    teA: "My Profile లో Create / Edit Profile పై click చేసి మీ personal, family, partner preference details fill చేసి save చేయండి.",
  },
  {
    enQ: "How does admin approval work?",
    enA: "After you save your profile, it goes to admin approval. Admin approves or rejects it, then you receive a notification.",
    teQ: "Admin approval ఎలా work అవుతుంది?",
    teA: "మీరు profile save చేసిన తర్వాత అది admin approval కి వెళ్తుంది. Admin approve/reject చేసిన తర్వాత మీకు notification వస్తుంది.",
  },
  {
    enQ: "How does background verification work?",
    enA: "Submit verification details from Background Verification. Admin checks and approves or rejects your request.",
    teQ: "Background verification ఎలా work అవుతుంది?",
    teA: "Background Verification లో details submit చేస్తే admin check చేసి approve/reject చేస్తారు.",
  },
  {
    enQ: "How do I book wedding services?",
    enA: "Open Wedding Services, select a service, and send a booking request. Admin receives your request.",
    teQ: "Wedding services ఎలా book చేయాలి?",
    teA: "Wedding Services open చేసి service select చేసి booking request send చేయండి. Admin కి request వెళ్తుంది.",
  },
];

export default function MyProfileScreen({ navigation }) {
  const {
    myProfile,
    currentUser,
    interests = [],
    verificationRequests = [],
    clearUserSession,
    language,
    setLanguage,
    isDarkMode,
    setIsDarkMode,
    appTheme,
  } =
    useMatrimony();

  const [showLanguage, setShowLanguage] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const t = getStrings(language).myProfile;

  const theme = {
    ...appTheme,
    progressBg: isDarkMode ? "#1F2937" : COLORS.softGreen,
  };

  const completion = myProfile?.profileCompletion || 0;

  const pendingCount = interests.filter(
    (item) => item.status === "Pending"
  ).length;

  const acceptedCount = interests.filter(
    (item) => item.status === "Accepted"
  ).length;

  const latestVerification = verificationRequests[0];

  const verificationStatus =
    myProfile?.verificationStatus ||
    latestVerification?.status ||
    "Not Submitted";

  const premiumPlan = String(
    currentUser?.premiumPlan || myProfile?.premiumPlan || "FREE"
  )
    .trim()
    .toUpperCase();

  const premiumPlanLabel =
    premiumPlan.charAt(0) + premiumPlan.slice(1).toLowerCase();

  const getPremiumPlanColor = () => {
    if (premiumPlan === "GOLD") return COLORS.gold;
    if (premiumPlan === "SILVER") return COLORS.primary;
    return COLORS.muted;
  };

  const getVerificationColor = () => {
    if (verificationStatus === "Approved") return COLORS.success;
    if (verificationStatus === "Rejected") return COLORS.danger;
    if (verificationStatus === "Pending") return COLORS.warning;
    return COLORS.muted;
  };

  const getVerificationIcon = () => {
    if (verificationStatus === "Approved") return "shield-checkmark";
    if (verificationStatus === "Rejected") return "close-circle";
    if (verificationStatus === "Pending") return "time";
    return "shield-outline";
  };

  const getVerificationSubtitle = () => {
    if (verificationStatus === "Approved") {
      return language === "te"
        ? "మీ ప్రొఫైల్ verified అయింది"
        : "Your profile is verified";
    }

    if (verificationStatus === "Pending") {
      return language === "te"
        ? "Verification request pending లో ఉంది"
        : "Verification request pending";
    }

    if (verificationStatus === "Rejected") {
      return language === "te"
        ? "Verification rejected, మళ్లీ submit చేయండి"
        : "Verification rejected, submit again";
    }

    return language === "te"
      ? "Admin approval కోసం documents submit చేయండి"
      : "Submit documents for admin approval";
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguage(false);
  };

  const toggleAboutUs = () => {
    setShowAbout((prev) => !prev);
    setShowSupport(false);
  };

  const toggleContactSupport = () => {
    setShowSupport((prev) => !prev);
    setShowAbout(false);
  };

  const openSupportLink = async (url, fallbackTitle, fallbackValue) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        return;
      }

      Alert.alert(fallbackTitle, fallbackValue);
    } catch (error) {
      Alert.alert(fallbackTitle, fallbackValue);
    }
  };

const logout = () => {
  try {
    clearUserSession?.();

    let rootNavigation = navigation;

    while (rootNavigation?.getParent?.()) {
      rootNavigation = rootNavigation.getParent();
    }

    if (rootNavigation?.replace) {
      rootNavigation.replace("Login");
      return;
    }

    rootNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  } catch (error) {
    clearUserSession?.();

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  }
};
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header title={t.title} subtitle={t.subtitle} navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.avatarBox}>
            <Image
              source={{
                uri: myProfile?.image || DEFAULT_AVATAR,
              }}
              style={styles.avatar}
            />

            {verificationStatus === "Approved" && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={COLORS.white}
                />
              </View>
            )}
          </View>

          <Text style={[styles.name, { color: theme.text }]}>
            {myProfile?.name || "My Matrimony Profile"}
          </Text>

          <Text style={[styles.meta, { color: theme.muted }]}>
            {myProfile?.gender || "Groom"} •{" "}
            {myProfile?.age ? `${myProfile.age} yrs` : "Age not added"} •{" "}
            {myProfile?.location || "Location not added"}
          </Text>

          <View style={styles.statusPillRow}>
            <View
              style={[
                styles.verifyStatusBox,
                {
                  borderColor: getVerificationColor(),
                  backgroundColor: theme.card,
                },
              ]}
            >
              <Ionicons
                name={getVerificationIcon()}
                size={18}
                color={getVerificationColor()}
              />

              <Text
                style={[
                  styles.verifyStatusText,
                  { color: getVerificationColor() },
                ]}
              >
                Verification: {verificationStatus}
              </Text>
            </View>

            <View
              style={[
                styles.verifyStatusBox,
                {
                  borderColor: getPremiumPlanColor(),
                  backgroundColor: theme.card,
                },
              ]}
            >
              <Ionicons
                name={premiumPlan === "GOLD" ? "diamond" : "diamond-outline"}
                size={18}
                color={getPremiumPlanColor()}
              />

              <Text
                style={[
                  styles.verifyStatusText,
                  { color: getPremiumPlanColor() },
                ]}
              >
                Plan: {premiumPlanLabel}
              </Text>
            </View>
          </View>

          <View
            style={[styles.progressBox, { backgroundColor: theme.progressBg }]}
          >
            <View style={styles.progressTop}>
              <Text style={[styles.progressText, { color: COLORS.secondary }]}>
                {t.completion}
              </Text>

              <Text
                style={[styles.progressPercent, { color: COLORS.secondary }]}
              >
                {completion}%
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(completion, 100)}%` },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("ProfileCreateEdit")}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.white} />
            {/* <Text style={styles.editButtonText}>{t.editProfile}</Text> */}
          </TouchableOpacity>
        </View>

        <View style={styles.interestStats}>
          <TouchableOpacity
            style={[
              styles.interestBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("InterestRequests")}
          >
            <Ionicons name="time-outline" size={24} color={COLORS.warning} />
            <Text style={[styles.interestNumber, { color: theme.text }]}>
              {pendingCount}
            </Text>
            <Text style={[styles.interestLabel, { color: theme.muted }]}>
              {t.pending}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.interestBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("InterestRequests")}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={COLORS.success}
            />
            <Text style={[styles.interestNumber, { color: theme.text }]}>
              {acceptedCount}
            </Text>
            <Text style={[styles.interestLabel, { color: theme.muted }]}>
              {t.accepted}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.interestBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("InterestRequests")}
          >
            <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.interestNumber, { color: theme.text }]}>
              {interests.length}
            </Text>
            <Text style={[styles.interestLabel, { color: theme.muted }]}>
              {t.total}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            {t.summary}
          </Text>

          <SummaryRow
            label="Profile Created For"
            value={myProfile?.profileCreatedFor || "-"}
            theme={theme}
          />
          <SummaryRow
            label={t.community}
            value={myProfile?.community || "-"}
            theme={theme}
          />
          <SummaryRow
            label={t.religion}
            value={myProfile?.religion || "-"}
            theme={theme}
          />
          <SummaryRow
            label={t.education}
            value={myProfile?.education || "-"}
            theme={theme}
          />
          <SummaryRow
            label={t.profession}
            value={myProfile?.job || "-"}
            theme={theme}
          />
          <SummaryRow
            label={t.income}
            value={myProfile?.income || "-"}
            theme={theme}
          />
          <SummaryRow
            label={t.height}
            value={myProfile?.height || "-"}
            theme={theme}
          />
        </View>

        <LanguageCard
          language={language}
          setLanguage={handleLanguageSelect}
          t={t}
          theme={theme}
          showLanguage={showLanguage}
          onToggle={() => setShowLanguage((prev) => !prev)}
        />

        <ThemeCard
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          t={t}
          theme={theme}
        />

        <MenuItem
          icon="help-circle-outline"
          title={t.faq}
          subtitle={t.faqSub}
          onPress={() => setShowFaq((prev) => !prev)}
          theme={theme}
        />

        {showFaq && (
          <View style={styles.faqBox}>
            {FAQ_DATA.map((item, index) => {
              const opened = openFaqIndex === index;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  style={[
                    styles.faqItem,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={() => setOpenFaqIndex(opened ? null : index)}
                >
                  <View style={styles.faqTop}>
                    <Text style={[styles.faqQuestion, { color: theme.text }]}>
                      {language === "te" ? item.teQ : item.enQ}
                    </Text>

                    <Ionicons
                      name={opened ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>

                  {opened && (
                    <Text style={[styles.faqAnswer, { color: theme.muted }]}>
                      {language === "te" ? item.teA : item.enA}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <MenuItem
          icon="information-circle-outline"
          title={t.about}
          subtitle={t.aboutSub}
          onPress={toggleAboutUs}
          theme={theme}
        />

        {showAbout && (
          <View
            style={[
              styles.aboutBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="heart-circle-outline"
              size={34}
              color={COLORS.primary}
            />

            <Text style={[styles.panelTitle, { color: theme.text }]}>
              Bliss Matrimony App
            </Text>

            <Text style={[styles.panelText, { color: theme.muted }]}>
              {language === "te"
                ? "ఈ యాప్‌లో profile creation, admin approval, background verification, interest requests, notifications మరియు wedding services booking features ఉన్నాయి."
                : "This app helps users create matrimony profiles, send interests, complete admin approval, background verification, receive notifications, and book wedding services."}
            </Text>

            <Text style={[styles.panelText, { color: theme.muted }]}>
              {language === "te"
                ? "Bride/Groom profiles, wedding services, admin panel, approval notifications అన్నీ ఒకే app లో manage చేయవచ్చు."
                : "Bride/Groom profiles, wedding services, admin panel, and approval notifications can be managed in one app."}
            </Text>
          </View>
        )}

        <MenuItem
          icon="headset-outline"
          title={t.support}
          subtitle={t.supportSub}
          onPress={toggleContactSupport}
          theme={theme}
        />

        {showSupport && (
          <View
            style={[
              styles.supportBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.panelTitle, { color: theme.text }]}>
              {language === "te" ? "సపోర్ట్ ఆప్షన్స్" : "Support Options"}
            </Text>

            <Text style={[styles.panelText, { color: theme.muted }]}>
              {language === "te"
                ? "మీకు ఏదైనా సమస్య ఉంటే call, email లేదా WhatsApp ద్వారా contact చేయండి."
                : "If you have any issue, contact us by call, email, or WhatsApp."}
            </Text>

            <TouchableOpacity
              style={[styles.aiAssistCard, { borderColor: theme.border }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate("AiChat")}
            >
              <View style={styles.aiAssistIcon}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.menuContent}>
                <Text style={[styles.menuText, { color: theme.text }]}>
                  {language === "te" ? "AI సహాయం" : t.aiChat}
                </Text>

                <Text style={[styles.menuSubText, { color: theme.muted }]}>
                  {language === "te"
                    ? "యాప్ స్టెప్స్, ప్రొఫైల్, బుకింగ్ కోసం చాట్ చేయండి"
                    : t.aiChatSub}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.muted}
              />
            </TouchableOpacity>

            <View style={styles.supportButtons}>
              <TouchableOpacity
                style={styles.supportBtn}
                activeOpacity={0.85}
                onPress={() =>
                  openSupportLink(
                    "tel:+919876543210",
                    "Support Number",
                    "+91 98765 43210"
                  )
                }
              >
                <Ionicons name="call-outline" size={18} color={COLORS.white} />
                <Text style={styles.supportBtnText}>
                  {language === "te" ? "కాల్" : "Call"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportBtn}
                activeOpacity={0.85}
                onPress={() =>
                  openSupportLink(
                    "mailto:support@matrimonyapp.com",
                    "Support Email",
                    "support@matrimonyapp.com"
                  )
                }
              >
                <Ionicons name="mail-outline" size={18} color={COLORS.white} />
                <Text style={styles.supportBtnText}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportBtn}
                activeOpacity={0.85}
                onPress={() =>
                  openSupportLink(
                    "https://wa.me/919876543210?text=Hello%20Support",
                    "WhatsApp Number",
                    "+91 98765 43210"
                  )
                }
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={18}
                  color={COLORS.white}
                />
                <Text style={styles.supportBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <MenuItem
          icon="shield-checkmark-outline"
          title={t.verification}
          subtitle={getVerificationSubtitle()}
          badgeText={verificationStatus}
          onPress={() => navigation.navigate("VerificationSubmit")}
          theme={theme}
        />

        <MenuItem
          icon="heart-circle-outline"
          title={t.interests}
          subtitle={t.interestsSub}
          badge={pendingCount}
          onPress={() => navigation.navigate("InterestRequests")}
          theme={theme}
        />

        <MenuItem
          icon="diamond-outline"
          title={t.premium}
          subtitle={t.premiumSub}
          onPress={() => navigation.navigate("Premium", { ownerId: currentUser?.id })}
          theme={theme}
        />

        <MenuItem
          icon="business-outline"
          title={t.services}
          subtitle={t.servicesSub}
          onPress={() => navigation.navigate("Services")}
          theme={theme}
        />

        <MenuItem
          icon="notifications-outline"
          title={t.notifications}
          subtitle={t.notificationsSub}
          onPress={() => navigation.navigate("Notifications")}
          theme={theme}
        />

        <MenuItem
          icon="log-out-outline"
          title={t.logout}
          subtitle={t.logoutSub}
          danger
          onPress={logout}
          theme={theme}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function LanguageCard({
  language,
  setLanguage,
  t,
  theme,
  showLanguage,
  onToggle,
}) {
  return (
    <View
      style={[
        styles.languageCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.languageHeader}
        onPress={onToggle}
      >
        <View style={styles.menuIcon}>
          <Ionicons name="language-outline" size={21} color={COLORS.primary} />
        </View>

        <View style={styles.menuContent}>
          <Text style={[styles.menuText, { color: theme.text }]}>
            {t.language}
          </Text>

          <Text style={[styles.menuSubText, { color: theme.muted }]}>
            {language === "te" ? "ప్రస్తుతం: తెలుగు" : "Current: English"}
          </Text>
        </View>

        <Ionicons
          name={showLanguage ? "chevron-up" : "chevron-down"}
          size={22}
          color={theme.muted}
        />
      </TouchableOpacity>

      {showLanguage && (
        <View style={styles.languageRow}>
          <TouchableOpacity
            style={[
              styles.langBtn,
              language === "en" && styles.langBtnActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setLanguage("en")}
          >
            <Text
              style={[
                styles.langText,
                language === "en" && styles.langTextActive,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langBtn,
              language === "te" && styles.langBtnActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setLanguage("te")}
          >
            <Text
              style={[
                styles.langText,
                language === "te" && styles.langTextActive,
              ]}
            >
              తెలుగు
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function ThemeCard({ isDarkMode, setIsDarkMode, t, theme }) {
  return (
    <View
      style={[
        styles.settingCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.menuIcon}>
        <Ionicons name="contrast-outline" size={21} color={COLORS.primary} />
      </View>

      <View style={styles.menuContent}>
        <Text style={[styles.menuText, { color: theme.text }]}>
          {t.theme}
        </Text>

        <Text style={[styles.menuSubText, { color: theme.muted }]}>
          {t.themeSub}
        </Text>
      </View>

      <Switch
        value={isDarkMode}
        onValueChange={setIsDarkMode}
        trackColor={{ false: "#D1D5DB", true: "#333333" }}
        thumbColor={isDarkMode ? "#FFFFFF" : COLORS.primary}
      />
    </View>
  );
}

function SummaryRow({ label, value, theme }) {
  return (
    <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
      <Text style={[styles.summaryLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  danger,
  onPress,
  badge,
  badgeText,
  theme,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, danger && styles.dangerIcon]}>
        <Ionicons
          name={icon}
          size={21}
          color={danger ? COLORS.danger : COLORS.primary}
        />
      </View>

      <View style={styles.menuContent}>
        <Text
          style={[
            styles.menuText,
            { color: danger ? COLORS.danger : theme.text },
          ]}
        >
          {title}
        </Text>

        {!!subtitle && (
          <Text style={[styles.menuSubText, { color: theme.muted }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {!!badgeText && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{badgeText}</Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={20} color={theme.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 100,
  },

  profileCard: {
    borderRadius: 26,
    padding: 20,
    alignItems: "center",
    marginBottom: 18,
    elevation: 3,
    borderWidth: 1,
  },

  avatarBox: {
    position: "relative",
    marginBottom: 12,
  },

  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.border,
  },

  verifiedBadge: {
    position: "absolute",
    right: 0,
    bottom: 3,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  name: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },

  meta: {
    marginTop: 6,
    textAlign: "center",
    fontWeight: "600",
  },

  verifyStatusBox: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  statusPillRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },

  verifyStatusText: {
    fontWeight: "900",
    fontSize: 12,
  },

  progressBox: {
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    width: "100%",
  },

  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressText: {
    fontWeight: "900",
  },

  progressPercent: {
    fontWeight: "900",
  },

  progressTrack: {
    height: 9,
    backgroundColor: "rgba(18,128,92,0.18)",
    borderRadius: 99,
    overflow: "hidden",
    marginTop: 10,
  },

  progressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 99,
  },

  editButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  editButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 15,
  },

  interestStats: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  interestBox: {
    flex: 1,
    borderRadius: 18,
    padding: 13,
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
  },

  interestNumber: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },

  interestLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  infoCard: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    borderWidth: 1,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingVertical: 10,
    gap: 12,
  },

  summaryLabel: {
    fontWeight: "700",
  },

  summaryValue: {
    fontWeight: "900",
    flex: 1,
    textAlign: "right",
  },

  settingCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },

  languageCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },

  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuItem: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },

  dangerIcon: {
    backgroundColor: "#FEE2E2",
  },

  menuContent: {
    flex: 1,
  },

  menuText: {
    fontWeight: "900",
    fontSize: 15,
  },

  menuSubText: {
    fontWeight: "700",
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },

  languageRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  langBtnActive: {
    backgroundColor: COLORS.primary,
  },

  langText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 12,
  },

  langTextActive: {
    color: COLORS.white,
  },

  faqBox: {
    marginBottom: 10,
  },

  faqItem: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },

  faqTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  faqQuestion: {
    flex: 1,
    fontWeight: "900",
    fontSize: 14,
  },

  faqAnswer: {
    marginTop: 8,
    fontWeight: "700",
    lineHeight: 19,
    fontSize: 12,
  },

  aboutBox: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },

  supportBox: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },

  panelTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 8,
  },

  panelText: {
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 8,
    fontSize: 13,
  },

  supportButtons: {
    marginTop: 8,
    gap: 9,
  },

  aiAssistCard: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EAF2FF",
  },

  aiAssistIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#DCEAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  supportBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  supportBtnText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 13,
  },

  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },

  badgeText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 12,
  },

  statusBadge: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadgeText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 10,
  },
});
