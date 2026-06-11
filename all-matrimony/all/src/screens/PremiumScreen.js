import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import { useMatrimony } from "../context/MatrimonyContext";

const fallbackPlans = {
  FREE: {
    code: "FREE",
    name: "Free",
    amount: 0,
    description: "Browse profile cards and matches.",
    features: [
      "See profile cards only",
      "Basic browse experience",
      "Upgrade anytime for more access",
    ],
  },
  SILVER: {
    code: "SILVER",
    name: "Silver",
    amount: 99900,
    description: "Unlock full profile details.",
    features: [
      "View complete profile details",
      "See education, job, income and about",
      "Better shortlisting experience",
    ],
  },
  GOLD: {
    code: "GOLD",
    name: "Gold",
    amount: 199900,
    description: "Unlock full details plus chat.",
    features: [
      "Everything in Silver",
      "Chat after accepted interests",
      "Top premium member access",
    ],
  },
};

const orderedPlanCodes = ["FREE", "SILVER", "GOLD"];
const planRank = {
  FREE: 0,
  SILVER: 1,
  GOLD: 2,
};

const formatPrice = (amount = 0) => {
  if (!amount) {
    return "Free";
  }

  return `Rs. ${(amount / 100).toFixed(0)}`;
};

const getPlanActionTitle = ({
  plan,
  currentPlan,
  isCurrent,
  isIncluded,
  isAlreadyPaid,
  isActionLoading,
  t,
}) => {
  if (isActionLoading) {
    return t.waiting;
  }

  if (isCurrent) {
    return plan.code === "FREE" ? t.current : `Upgraded to ${plan.name}`;
  }

  if (isAlreadyPaid) {
    return "Already Paid";
  }

  if (isIncluded) {
    const currentPlanName =
      currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase();
    return `Included in ${currentPlanName}`;
  }

  return plan.code === "FREE" ? t.useFree : t.continuePayment;
};

export default function PremiumScreen({ navigation, route }) {
  const {
    myProfile,
    currentUser,
    loadPremiumPlans,
    createPremiumOrder,
    appTheme,
    language,
  } = useMatrimony();
  const t = getStrings(language).premium;
  const ownerId = String(route?.params?.ownerId || currentUser?.id || myProfile?.id || "");
  const currentUserId = String(currentUser?.id || "");
  const [plans, setPlans] = useState(fallbackPlans);
  const [currentPlan, setCurrentPlan] = useState(
    String(myProfile?.premiumPlan || "FREE").toUpperCase()
  );
  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState("");

  useEffect(() => {
    if (!currentUserId || !ownerId) {
      return;
    }

    if (String(ownerId) !== String(currentUserId)) {
      Alert.alert(
        "Account Mismatch",
        "Premium membership can only be purchased for the account that is currently logged in.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, [currentUserId, ownerId, navigation]);

  const refreshPlans = useCallback(
    async (isActive = () => true) => {
      setLoading(true);

      const result = await loadPremiumPlans?.();

      if (!isActive()) {
        return;
      }

      if (result?.success) {
        setPlans(result.plans || fallbackPlans);
        setCurrentPlan(String(result.currentPlan || "FREE").toUpperCase());
      } else {
        setPlans(fallbackPlans);
        setCurrentPlan(String(myProfile?.premiumPlan || "FREE").toUpperCase());
      }

      setLoading(false);
    },
    [loadPremiumPlans, myProfile?.premiumPlan]
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      refreshPlans(() => active);

      return () => {
        active = false;
      };
    }, [refreshPlans])
  );

  const visiblePlans = useMemo(
    () => orderedPlanCodes.map((code) => plans?.[code] || fallbackPlans[code]),
    [plans]
  );

  const handleChoosePlan = async (planCode) => {
    if (!currentUserId || String(ownerId) !== String(currentUserId)) {
      Alert.alert(
        "Not Allowed",
        "Please log in with the same account you want to upgrade."
      );
      return;
    }

    if (planCode === currentPlan) {
      Alert.alert("Current Plan", `Your current membership plan is already ${planCode}.`);
      return;
    }

    if (planCode === "FREE") {
      setActionPlan(planCode);
      const result = await createPremiumOrder?.("FREE");
      setActionPlan("");

      if (result?.success) {
        setCurrentPlan("FREE");
        Alert.alert("Plan Updated", "Free plan is now active.");
      } else {
        Alert.alert("Update Failed", result?.message || "Unable to switch plan.");
      }
      return;
    }

    navigation.navigate("PaymentCheckout", {
      planCode,
      plan: plans?.[planCode] || fallbackPlans[planCode],
      ownerId,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
      <Header
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        navigation={navigation}
        showBack={true}
        showNotification={false}
        backTo="MainTabs"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.maroon, COLORS.primary]}
          style={styles.hero}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={18} color={COLORS.gold} />
            <Text style={styles.heroBadgeText}>{t.currentPlan}: {currentPlan}</Text>
          </View>

          <Text style={styles.heroTitle}>{t.heroTitle}</Text>
          <Text style={styles.heroText}>{t.heroText}</Text>
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        ) : null}

        {visiblePlans.map((plan, index) => {
          const isCurrent = plan.code === currentPlan;
          const currentRank = planRank[currentPlan] ?? 0;
          const planCodeRank = planRank[plan.code] ?? 0;
          const isIncluded = plan.code === "FREE" && planCodeRank < currentRank;
          const isAlreadyPaid =
            plan.code !== "FREE" && planCodeRank < currentRank;
          const isActionLoading = actionPlan === plan.code;
          const gradientColors =
            plan.code === "GOLD"
              ? [COLORS.gold, "#F4B942"]
              : plan.code === "SILVER"
                ? [COLORS.primaryLight, COLORS.primary]
                : [COLORS.softOrange, COLORS.bg2];

          return (
            <View
              key={plan.code}
              style={[
                styles.card,
                {
                  backgroundColor: appTheme?.card || COLORS.white,
                  borderColor: appTheme?.border || COLORS.border,
                },
              ]}
            >
              <LinearGradient colors={gradientColors} style={styles.planStripe}>
                <View style={styles.planStripeContent}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{formatPrice(plan.amount)}</Text>
                  </View>

                  <View style={[styles.tag, isCurrent && styles.currentTag]}>
                    <Text style={[styles.tagText, isCurrent && styles.currentTagText]}>
                      {isCurrent ? "Active" : `Plan ${index + 1}`}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              <Text style={styles.planDescription}>{plan.description}</Text>

              {plan.features?.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={plan.code === "GOLD" ? COLORS.gold : COLORS.success}
                  />
                  <Text style={styles.feature}>{feature}</Text>
                </View>
              ))}

              <PrimaryButton
                title={getPlanActionTitle({
                  plan,
                  currentPlan,
                  isCurrent,
                  isIncluded,
                  isAlreadyPaid,
                  isActionLoading,
                  t,
                })}
                onPress={() => handleChoosePlan(plan.code)}
                disabled={isCurrent || isIncluded || isAlreadyPaid || isActionLoading}
                style={styles.chooseBtn}
              />
            </View>
          );
        })}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: appTheme?.card || COLORS.white,
              borderColor: appTheme?.border || COLORS.border,
            },
          ]}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            {t.infoText} Premium is linked to the currently logged-in account only.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroBadgeText: {
    color: COLORS.white,
    fontWeight: "900",
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 16,
  },
  heroText: {
    color: "#F6ECFF",
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 8,
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  loadingText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  planStripe: {
    marginHorizontal: -18,
    marginTop: -18,
    marginBottom: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  planStripeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  planPrice: {
    color: COLORS.text,
    fontWeight: "900",
    marginTop: 3,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.70)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  currentTag: {
    backgroundColor: COLORS.primaryDark,
  },
  tagText: {
    color: COLORS.text,
    fontWeight: "900",
  },
  currentTagText: {
    color: COLORS.white,
  },
  planDescription: {
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  feature: {
    color: COLORS.text,
    fontWeight: "700",
    flex: 1,
  },
  chooseBtn: {
    marginTop: 18,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 20,
  },
});
