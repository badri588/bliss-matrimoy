import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

import Header from "../components/Header";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

const formatPrice = (amount = 0) => `Rs. ${(amount / 100).toFixed(0)}`;
const planRank = {
  FREE: 0,
  SILVER: 1,
  GOLD: 2,
};
const fallbackCheckoutPlans = {
  SILVER: {
    name: "Silver",
    amount: 99900,
    description: "Unlock complete bride and groom profile details.",
  },
  GOLD: {
    name: "Gold",
    amount: 199900,
    description: "Unlock full profiles plus direct chat after accepted interests.",
  },
};

export default function PaymentCheckoutScreen({ navigation, route }) {
  const {
    currentUser,
    myProfile,
    loadPremiumPlans,
    createPremiumOrder,
    verifyPremiumPayment,
    appTheme,
  } = useMatrimony();
  const planCode = String(route?.params?.planCode || "SILVER").toUpperCase();
  const fallbackPlan =
    route?.params?.plan || fallbackCheckoutPlans[planCode] || null;
  const ownerId = String(route?.params?.ownerId || currentUser?.id || "");
  const activePlan = String(
    currentUser?.premiumPlan || myProfile?.premiumPlan || "FREE"
  ).toUpperCase();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Preparing secure Razorpay checkout...");
  const [webScriptReady, setWebScriptReady] = useState(Platform.OS !== "web");

  const showCompletedState = (completedPlan = planCode) => {
    const completedFallbackPlan =
      fallbackPlan || fallbackCheckoutPlans[completedPlan] || fallbackCheckoutPlans[planCode];

    setOrderData({
      planCode: completedPlan,
      fallbackPlan: completedFallbackPlan,
      planName: completedFallbackPlan?.name || completedPlan,
      amount:
        completedFallbackPlan?.amount ||
        fallbackCheckoutPlans[completedPlan]?.amount ||
        fallbackCheckoutPlans[planCode]?.amount ||
        0,
      description:
        completedFallbackPlan?.description ||
        fallbackCheckoutPlans[completedPlan]?.description ||
        `${completedPlan} membership is already active.`,
    });
    setPaymentCompleted(true);
    setStatusMessage(`${completedPlan} membership is already active.`);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const bootstrapOrder = async () => {
      setPaymentCompleted(false);

      if (!currentUser?.id || String(ownerId) !== String(currentUser.id)) {
        setLoading(false);
        setStatusMessage("Premium checkout is only available for your own logged-in account.");
        Alert.alert(
          "Not Allowed",
          "You can only buy premium for the account that is currently logged in.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return;
      }

      setLoading(true);
      setStatusMessage("Preparing secure Razorpay checkout...");

      if ((planRank[activePlan] ?? 0) >= (planRank[planCode] ?? 0)) {
        showCompletedState(planCode);
        return;
      }

      const latestPlans = await loadPremiumPlans?.();

      if (!active) {
        return;
      }

      const latestPlan = String(latestPlans?.currentPlan || activePlan).toUpperCase();

      if (
        latestPlans?.success &&
        (planRank[latestPlan] ?? 0) >= (planRank[planCode] ?? 0)
      ) {
        showCompletedState(planCode);
        return;
      }

      const result = await createPremiumOrder?.(planCode);

      if (!active) {
        return;
      }

      if (result?.success) {
        setOrderData({
          ...(result.data || {}),
          planCode,
          fallbackPlan,
        });
      } else {
        setStatusMessage(result?.message || "Unable to create payment order.");
      }

      setLoading(false);
    };

    bootstrapOrder();

    return () => {
      active = false;
    };
  }, [
    activePlan,
    planCode,
    currentUser?.id,
    ownerId,
    loadPremiumPlans,
    createPremiumOrder,
    fallbackPlan,
    navigation,
  ]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return undefined;
    }

    if (typeof document === "undefined") {
      setWebScriptReady(false);
      return undefined;
    }

    const existingScript = document.querySelector('script[data-razorpay-checkout="true"]');

    if (existingScript && window?.Razorpay) {
      setWebScriptReady(true);
      return undefined;
    }

    const script = existingScript || document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";

    const handleLoad = () => setWebScriptReady(true);
    const handleError = () => {
      setWebScriptReady(false);
      setStatusMessage("Unable to load Razorpay checkout in browser.");
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (!existingScript) {
      document.body.appendChild(script);
    }

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, []);

  const checkoutHtml = useMemo(() => {
    if (!orderData?.orderId || !orderData?.keyId) {
      return "";
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "All Matrimony",
      description: orderData.description || `${planCode} membership upgrade`,
      order_id: orderData.orderId,
      prefill: orderData.prefill || {},
      theme: {
        color: COLORS.primary,
      },
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background: linear-gradient(180deg, #f8f3ff 0%, #ffffff 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              color: #1f1433;
            }
            .card {
              width: 88%;
              max-width: 440px;
              background: #ffffff;
              border-radius: 24px;
              padding: 24px;
              box-shadow: 0 18px 40px rgba(76, 29, 149, 0.16);
            }
            .badge {
              display: inline-block;
              background: #efe4ff;
              color: #7c3aed;
              font-weight: 700;
              border-radius: 999px;
              padding: 8px 12px;
              margin-bottom: 16px;
            }
            h1 {
              margin: 0 0 8px 0;
              font-size: 26px;
            }
            p {
              margin: 0;
              color: #746887;
              line-height: 1.5;
            }
            .price {
              margin: 18px 0;
              font-size: 32px;
              font-weight: 900;
              color: #4c1d95;
            }
            button {
              width: 100%;
              height: 54px;
              border: none;
              border-radius: 16px;
              background: linear-gradient(90deg, #4c1d95 0%, #7c3aed 100%);
              color: white;
              font-size: 18px;
              font-weight: 800;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">Secure Razorpay Checkout</div>
            <h1>${orderData.planName || planCode} Plan</h1>
            <p>${orderData.description || ""}</p>
            <div class="price">${formatPrice(orderData.amount)}</div>
            <button id="pay-button">Pay Securely</button>
          </div>
          <script>
            const options = ${JSON.stringify(options)};
            options.handler = function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "success",
                payload: response
              }));
            };
            options.modal = {
              ondismiss: function () {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: "dismiss"
                }));
              }
            };
            const razorpay = new Razorpay(options);
            razorpay.on("payment.failed", function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "failure",
                payload: response.error || {}
              }));
            });
            document.getElementById("pay-button").addEventListener("click", function (event) {
              event.preventDefault();
              razorpay.open();
            });
            setTimeout(function () {
              document.getElementById("pay-button").click();
            }, 600);
          </script>
        </body>
      </html>
    `;
  }, [orderData, planCode]);

  const handleWebMessage = async (event) => {
    let message = null;

    try {
      message = JSON.parse(event?.nativeEvent?.data || "{}");
    } catch (error) {
      setStatusMessage("Payment response could not be parsed.");
      return;
    }

    if (message?.type === "dismiss") {
      setStatusMessage("Payment popup was closed before completion.");
      return;
    }

    if (message?.type === "failure") {
      setStatusMessage(message?.payload?.description || "Payment failed. Please try again.");
      return;
    }

    if (message?.type !== "success") {
      return;
    }

    setVerifying(true);
    setStatusMessage("Verifying payment securely with backend...");

    const result = await verifyPremiumPayment?.({
      planCode,
      razorpayOrderId: orderData.orderId,
      razorpayPaymentId: message?.payload?.razorpay_payment_id,
      razorpaySignature: message?.payload?.razorpay_signature,
    });

    setVerifying(false);

    if (result?.success) {
      setPaymentCompleted(true);
      setStatusMessage(`${planCode} membership is active.`);
      return;
    }

    setStatusMessage(result?.message || "Payment verification failed.");
  };

  const handleWebCheckout = () => {
    if (Platform.OS !== "web") {
      return;
    }

    if (!orderData?.orderId) {
      setStatusMessage("Payment order is not ready yet.");
      return;
    }

    if (typeof window === "undefined" || typeof window.Razorpay !== "function") {
      setStatusMessage("Razorpay checkout is still loading. Please try again.");
      return;
    }

    const razorpay = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "All Matrimony",
      description: orderData.description || `${planCode} membership upgrade`,
      order_id: orderData.orderId,
      prefill: orderData.prefill || {},
      theme: {
        color: COLORS.primary,
      },
      modal: {
        ondismiss: () => {
          setStatusMessage("Payment popup was closed before completion.");
        },
      },
      handler: (response) =>
        handleWebMessage({
          nativeEvent: {
            data: JSON.stringify({
              type: "success",
              payload: response,
            }),
          },
        }),
    });

    razorpay.on("payment.failed", (response) => {
      handleWebMessage({
        nativeEvent: {
          data: JSON.stringify({
            type: "failure",
            payload: response?.error || {},
          }),
        },
      });
    });

    razorpay.open();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
      <Header
        title="Secure Payment"
        subtitle={`${planCode} membership checkout`}
        navigation={navigation}
        showBack={true}
        showNotification={false}
        backTo="Premium"
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryIcon}>
            <Ionicons name="card-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>
              {orderData?.planName || fallbackPlan?.name || planCode} Upgrade
            </Text>
            <Text style={styles.summaryText}>
              {orderData?.description || fallbackPlan?.description || "Secure payment powered by Razorpay."}
            </Text>
          </View>
          <Text style={styles.summaryAmount}>
            {formatPrice(orderData?.amount || fallbackPlan?.amount || 0)}
          </Text>
        </View>

        <View style={styles.noteRow}>
          <Ionicons name="shield-checkmark-outline" size={17} color={COLORS.secondary} />
          <Text style={styles.noteText}>
            Backend creates the order first and verifies the signature before your plan is activated.
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      ) : paymentCompleted || orderData?.orderId ? (
        paymentCompleted || Platform.OS === "web" ? (
          <View style={styles.webCard}>
            <View style={styles.browserPreview}>
              <View style={styles.browserDots}>
                <View style={[styles.browserDot, { backgroundColor: "#F87171" }]} />
                <View style={[styles.browserDot, { backgroundColor: "#FBBF24" }]} />
                <View style={[styles.browserDot, { backgroundColor: "#34D399" }]} />
              </View>
              <Text style={styles.browserUrl}>checkout.razorpay.com</Text>
            </View>

            <View style={styles.checkoutHero}>
              <Text style={styles.checkoutBadge}>Live-style Secure Checkout</Text>
              <Text style={styles.checkoutTitle}>
                {orderData?.planName || fallbackPlan?.name || planCode} Membership
              </Text>
              <Text style={styles.checkoutDescription}>
                {orderData?.description || fallbackPlan?.description || "Secure payment powered by Razorpay."}
              </Text>
              <Text style={styles.checkoutAmount}>
                {formatPrice(orderData?.amount || fallbackPlan?.amount || 0)}
              </Text>
            </View>

            <View style={styles.featureList}>
              <FeatureRow text="Backend-created Razorpay order" />
              <FeatureRow text="Server-side payment signature verification" />
              <FeatureRow
                text={
                  paymentCompleted
                    ? `${planCode} access is active on your account`
                    : `${planCode} access activates after successful payment`
                }
              />
            </View>

            {paymentCompleted ? (
              <TouchableOpacity
                style={[styles.webCheckoutBtn, styles.completedBtn]}
                onPress={() => navigation.replace("Premium", { ownerId })}
              >
                <Ionicons name="checkmark-circle" size={19} color={COLORS.white} />
                <Text style={styles.webCheckoutBtnText}>Completed</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.webCheckoutBtn,
                  (!webScriptReady || verifying) && styles.webCheckoutBtnDisabled,
                ]}
                onPress={handleWebCheckout}
                disabled={!webScriptReady || verifying}
              >
                <Ionicons name="lock-closed" size={18} color={COLORS.white} />
                <Text style={styles.webCheckoutBtnText}>
                  {verifying
                    ? "Verifying Payment..."
                    : webScriptReady
                      ? "Pay With Razorpay"
                      : "Loading Razorpay..."}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
        <View style={styles.webviewWrap}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: checkoutHtml }}
            onMessage={handleWebMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.statusText}>Opening Razorpay checkout...</Text>
              </View>
            )}
          />
        </View>
        )
      ) : (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={34} color={COLORS.danger} />
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      )}

      {verifying ? (
        <View style={styles.verifyingBar}>
          <ActivityIndicator size="small" color={COLORS.white} />
          <Text style={styles.verifyingText}>Verifying payment...</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  summaryCard: {
    margin: 16,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  summaryText: {
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 4,
  },
  summaryAmount: {
    color: COLORS.primaryDark,
    fontWeight: "900",
  },
  noteRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    gap: 8,
  },
  noteText: {
    flex: 1,
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 19,
  },
  webviewWrap: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  webCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  browserPreview: {
    backgroundColor: "#FFF8ED",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  browserDots: {
    flexDirection: "row",
    gap: 6,
  },
  browserDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  browserUrl: {
    color: COLORS.muted,
    fontWeight: "700",
  },
  checkoutHero: {
    padding: 20,
    backgroundColor: "#FCFAFF",
  },
  checkoutBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFE4FF",
    color: COLORS.primary,
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  checkoutTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "900",
  },
  checkoutDescription: {
    marginTop: 8,
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 21,
  },
  checkoutAmount: {
    marginTop: 18,
    color: COLORS.primaryDark,
    fontSize: 32,
    fontWeight: "900",
  },
  featureList: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureRowText: {
    flex: 1,
    color: COLORS.text,
    fontWeight: "700",
    lineHeight: 20,
  },
  webCheckoutBtn: {
    margin: 20,
    marginTop: 22,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  webCheckoutBtnDisabled: {
    backgroundColor: "#9CA3AF",
  },
  completedBtn: {
    backgroundColor: COLORS.success,
  },
  webCheckoutBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  statusText: {
    color: COLORS.text,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 22,
  },
  verifyingBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primaryDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  verifyingText: {
    color: COLORS.white,
    fontWeight: "900",
  },
});

function FeatureRow({ text }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
      <Text style={styles.featureRowText}>{text}</Text>
    </View>
  );
}
