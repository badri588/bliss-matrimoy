import React, {useEffect, useMemo, useState} from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

import Header from "../components/Header";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

const formatPrice = (amount = 0) => `Rs. ${(amount / 100).toFixed(0)}`;
const parseRupees = (value = "") => {
  const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};
const buildInvoiceNumber = (bookingId) => `INV-${String(bookingId || "").padStart(6, "0")}`;

export default function ServiceBookingPaymentScreen({ navigation, route }) {
  const { createServiceBookingOrder, verifyServiceBookingPayment, appTheme } = useMatrimony();
  const service = route?.params?.service || null;
  const bookingDetails = route?.params?.bookingDetails || {};
  const customerDetails = route?.params?.customerDetails || null;
  const packages = useMemo(
    () => (Array.isArray(service?.packages) ? service.packages.filter(Boolean) : []),
    [service?.packages]
  );
  const hasPackages = packages.length > 0;
  const baseAmount = useMemo(() => parseRupees(service?.price), [service?.price]);

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    hasPackages
      ? "Select a service package to continue with Razorpay checkout."
      : "Select an amount to continue with Razorpay checkout."
  );
  const [webScriptReady, setWebScriptReady] = useState(Platform.OS !== "web");
  const [selectedAmountType, setSelectedAmountType] = useState("full");
  const [selectedPaymentType, setSelectedPaymentType] = useState("full");
  const [customAmount, setCustomAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [selectedPackageKey, setSelectedPackageKey] = useState("");
  const [bookingStep, setBookingStep] = useState(hasPackages ? "package" : "payment");

  const screenTitle = useMemo(
    () => `Pay & Book ${service?.title || "Service"}`,
    [service?.title]
  );
  const getPackageKey = (pkg = {}, index = 0) =>
    String(pkg?.id || pkg?.packageId || pkg?.name || `package-${index}`);
  const selectedPackage = useMemo(() => {
    if (!hasPackages) {
      return null;
    }

    return packages.find((pkg, index) => getPackageKey(pkg, index) === selectedPackageKey) || packages[0];
  }, [hasPackages, packages, selectedPackageKey]);
  const selectedPackageAmount = useMemo(
    () => parseRupees(selectedPackage?.price),
    [selectedPackage?.price]
  );
  const selectedAmount = useMemo(() => {
    if (hasPackages) {
      if (selectedPaymentType === "advance") {
        return selectedPackageAmount > 0 ? Math.max(1, Math.round(selectedPackageAmount * 0.5)) : 0;
      }

      if (selectedPaymentType === "custom") {
        return parseRupees(customAmount);
      }

      return selectedPackageAmount;
    }

    if (selectedAmountType === "advance") {
      return baseAmount > 0 ? Math.max(1, Math.round(baseAmount * 0.5)) : 0;
    }

    if (selectedAmountType === "custom") {
      return parseRupees(customAmount);
    }

    return baseAmount;
  }, [baseAmount, customAmount, hasPackages, selectedAmountType, selectedPackageAmount, selectedPaymentType]);

  const amountOptions = useMemo(() => {
    const full = baseAmount > 0 ? baseAmount : 0;
    const advance = full > 0 ? Math.max(1, Math.round(full * 0.5)) : 0;

    return [
      {
        id: "full",
        title: "Pay Full Amount",
        subtitle: full > 0 ? `Complete payment of ${formatPrice(full * 100)}` : "Use the listed service price",
      },
      {
        id: "advance",
        title: "Pay 50% Advance",
        subtitle: advance > 0 ? `Book now with ${formatPrice(advance * 100)}` : "A deposit to reserve the service",
      },
      {
        id: "custom",
        title: "Pay Custom Amount",
        subtitle: "Choose your own amount before checkout",
      },
    ];
  }, [baseAmount]);

  useEffect(() => {
    if (!hasPackages) {
      return;
    }

    const nextPackageKey = getPackageKey(packages[0], 0);
    setSelectedPackageKey((current) => current || nextPackageKey);
    setSelectedPaymentType("full");
    setCustomAmount("");
    setBookingStep("package");
  }, [hasPackages, packages]);

  useEffect(() => {
    if (!hasPackages) {
      setSelectedPackageKey("");
      setBookingStep("payment");
      return;
    }

    if (!packages.some((pkg, index) => getPackageKey(pkg, index) === selectedPackageKey)) {
      setSelectedPackageKey(getPackageKey(packages[0], 0));
    }
  }, [hasPackages, packages, selectedPackageKey]);

  const resetCheckout = () => {
    setOrderData(null);
    setLoading(false);
    setVerifying(false);
    setAmountError("");
    setSelectedPaymentType("full");
    setBookingStep(hasPackages ? "package" : "payment");
    setStatusMessage(
      hasPackages
        ? "Select a service package to continue with Razorpay checkout."
        : "Select an amount to continue with Razorpay checkout."
    );
  };

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

  useEffect(() => {
    resetCheckout();
  }, [service?.id, hasPackages]);

  useEffect(() => {
    if (Platform.OS === "web" && orderData?.orderId && webScriptReady) {
      const timer = setTimeout(() => handleWebCheckout(), 450);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [orderData, webScriptReady]);

  const bookingSummary = orderData?.booking || bookingDetails || {};
  const selectedAmountText = selectedAmount > 0 ? `Rs. ${selectedAmount}` : "Select an amount";
  const showPackageStep = hasPackages && bookingStep === "package";

  const checkoutHtml = useMemo(() => {
    if (!orderData?.orderId || !orderData?.keyId) {
      return "";
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "All Matrimony",
      description: orderData.description || `Booking payment for ${service?.title || "service"}`,
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
            h1 { margin: 0 0 8px 0; font-size: 26px; }
            p { margin: 0; color: #746887; line-height: 1.5; }
            .price { margin: 18px 0; font-size: 32px; font-weight: 900; color: #4c1d95; }
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
            <h1>${service?.title || "Service"} Booking</h1>
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
  }, [orderData, service?.title]);

  const handleNextStep = () => {
    if (!selectedPackage) {
      setAmountError("Please select a package to continue.");
      return;
    }

    setAmountError("");
    setBookingStep("payment");
    setStatusMessage("Now choose how much you want to pay for this package.");
  };

  const handleBackToPackage = () => {
    setAmountError("");
    setBookingStep("package");
    setStatusMessage("Select a service package to continue with Razorpay checkout.");
  };

  const finalizePayment = async (payload) => {
    setVerifying(true);
    setStatusMessage("Verifying payment securely with backend...");

    const result = await verifyServiceBookingPayment?.(payload);
    setVerifying(false);

    if (result?.success) {
      const bookingId = result?.data?.requestId || result?.data?.id || null;
      navigation.replace("ServiceBookingSuccess", {
        service,
        bookingDetails,
        selectedPackage,
        paymentAmount: orderData?.amount || 0,
        bookingId,
        orderId: orderData?.orderId || "",
        transactionId: payload?.razorpayPaymentId || "",
        customerName: customerDetails?.name || "",
        customerPhone: customerDetails?.phone || "",
        customerEmail: customerDetails?.email || "",
        customerLocation: customerDetails?.location || "",
        vendorName: service?.vendorName || "",
        vendorPhone: service?.vendorPhone || "",
        invoice: {
          number: result?.data?.invoiceNumber || buildInvoiceNumber(bookingId),
          amount: orderData?.amount || 0,
          status: "PAID",
          date: new Date().toISOString(),
          reference: payload?.razorpayPaymentId || payload?.razorpayOrderId || "",
          paymentMode: "Razorpay",
        },
      });
      return;
    }

    setStatusMessage(result?.message || "Payment verification failed.");
  };

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

    await finalizePayment({
      razorpayOrderId: orderData.orderId,
      razorpayPaymentId: message?.payload?.razorpay_payment_id,
      razorpaySignature: message?.payload?.razorpay_signature,
    });
  };

  const handleProceedToPay = async () => {
    if (!service?.id) {
      setStatusMessage("No service selected.");
      return;
    }

    if (hasPackages && !selectedPackage) {
      setAmountError("Please select a package to continue.");
      return;
    }

    if (!selectedAmount || selectedAmount <= 0) {
      setAmountError("Please select a valid payment amount.");
      return;
    }

    setLoading(true);
    setAmountError("");
    setStatusMessage("Preparing secure Razorpay checkout...");

    const result = await createServiceBookingOrder?.(
      service,
      bookingDetails,
      customerDetails,
      selectedAmount,
      selectedPackage
    );

    if (result?.registrationRequired) {
      setStatusMessage(result?.message || "Please register before booking.");
    } else if (result?.success) {
      setOrderData(result.data || {});
    } else {
      setStatusMessage(result?.message || "Unable to create payment order.");
    }

    setLoading(false);
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
      description: orderData.description || `Booking payment for ${service?.title || "service"}`,
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
        title={screenTitle}
        subtitle={service?.title || "Service booking checkout"}
        navigation={navigation}
        showBack={true}
        showNotification={false}
        backTo="ServiceDetails"
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryIcon}>
            <Ionicons name="card-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>{service?.title || "Service"} Booking</Text>
            <Text style={styles.summaryText}>
              {orderData?.description ||
                (hasPackages
                  ? "Choose a service package, then continue to Razorpay checkout."
                  : "Choose a payment amount, then continue to Razorpay checkout.")}
            </Text>
          </View>
          <Text style={styles.summaryAmount}>
            {formatPrice(orderData?.amount || (selectedAmount > 0 ? selectedAmount * 100 : 0))}
          </Text>
        </View>

        {hasPackages && selectedPackage ? (
          <View style={styles.packageSummary}>
            <Text style={styles.packageSummaryLabel}>Selected package</Text>
            <Text style={styles.packageSummaryTitle}>{selectedPackage?.name || "Package"}</Text>
            {!!selectedPackage?.description && (
              <Text style={styles.packageSummaryText}>{selectedPackage.description}</Text>
            )}
            {!!selectedPackage?.includes && (
              <Text style={styles.packageSummaryText}>{selectedPackage.includes}</Text>
            )}
          </View>
        ) : null}

        <View style={styles.noteRow}>
          <Ionicons name="shield-checkmark-outline" size={17} color={COLORS.secondary} />
          <Text style={styles.noteText}>
            After payment verification, the booking request is sent to the vendor for approval.
          </Text>
        </View>

        {!!bookingSummary.bookingDate && (
          <View style={styles.noteRow}>
            <Ionicons name="calendar-outline" size={17} color={COLORS.secondary} />
            <Text style={styles.noteText}>
              {bookingSummary.bookingDate}
              {bookingSummary.bookingEndDate ? ` to ${bookingSummary.bookingEndDate}` : ""}
              {bookingSummary.bookingTime ? `, ${bookingSummary.bookingTime}` : ""}
            </Text>
          </View>
        )}
      </View>

      {!orderData?.orderId ? (
        <View style={styles.selectionCard}>
          <Text style={styles.selectionTitle}>
            {showPackageStep
              ? "Select service package"
              : hasPackages
              ? "Choose payment amount"
              : "Select payment amount"}
          </Text>
          <Text style={styles.selectionSub}>
            {showPackageStep
              ? "Choose the package you want to book."
              : hasPackages
              ? "Choose how much of the package you want to pay now."
              : `Base service price: ${service?.price || "Contact vendor"}`}
          </Text>

          {showPackageStep ? (
            <View style={styles.optionList}>
              {packages.map((pkg, index) => {
                const key = getPackageKey(pkg, index);
                const active = selectedPackageKey === key || (!selectedPackageKey && index === 0);
                const packagePrice = parseRupees(pkg?.price);

                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.optionCard, active && styles.optionCardActive]}
                    onPress={() => {
                      setSelectedPackageKey(key);
                      setAmountError("");
                    }}
                  >
                    <View style={styles.optionTop}>
                      <View style={[styles.optionDot, active && styles.optionDotActive]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                          {pkg?.name || "Package"}
                        </Text>
                        <Text style={[styles.optionSubtitle, active && styles.optionSubtitleActive]}>
                          {pkg?.duration ? `${pkg.duration}` : "Package pricing"}
                          {pkg?.includes ? ` | ${pkg.includes}` : ""}
                        </Text>
                      </View>
                      <Text style={[styles.optionPrice, active && styles.optionPriceActive]}>
                        {packagePrice > 0 ? formatPrice(packagePrice * 100) : "Contact"}
                      </Text>
                    </View>

                    {!!pkg?.description ? (
                      <Text style={styles.packageCardDescription}>{pkg.description}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <>
              <View style={styles.optionList}>
                {(hasPackages
                  ? [
                      {
                        id: "full",
                        title: "Pay Total Amount",
                        subtitle:
                          selectedPackageAmount > 0
                            ? `Pay the full package amount of ${formatPrice(selectedPackageAmount * 100)}`
                            : "Pay the full package amount",
                      },
                      {
                        id: "advance",
                        title: "Pay 50% Now",
                        subtitle:
                          selectedPackageAmount > 0
                            ? `Pay half now: ${formatPrice(Math.max(1, Math.round(selectedPackageAmount * 0.5)) * 100)}`
                            : "Pay 50% of the selected package",
                      },
                      {
                        id: "custom",
                        title: "Pay Custom Amount",
                        subtitle: "Choose your own amount before checkout",
                      },
                    ]
                  : amountOptions
                ).map((option) => {
                  const active = hasPackages ? selectedPaymentType === option.id : selectedAmountType === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.optionCard, active && styles.optionCardActive]}
                      onPress={() => {
                        if (hasPackages) {
                          setSelectedPaymentType(option.id);
                        } else {
                          setSelectedAmountType(option.id);
                        }
                        setAmountError("");
                      }}
                    >
                      <View style={styles.optionTop}>
                        <View style={[styles.optionDot, active && styles.optionDotActive]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                            {option.title}
                          </Text>
                          <Text style={[styles.optionSubtitle, active && styles.optionSubtitleActive]}>
                            {option.subtitle}
                          </Text>
                        </View>
                        <Text style={[styles.optionPrice, active && styles.optionPriceActive]}>
                          {option.id === "full"
                            ? formatPrice((hasPackages ? selectedPackageAmount : baseAmount || 0) * 100)
                            : option.id === "advance"
                            ? formatPrice(
                                Math.max(
                                  1,
                                  Math.round((hasPackages ? selectedPackageAmount : baseAmount || 0) * 0.5)
                                ) * 100
                              )
                            : "Custom"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {(hasPackages ? selectedPaymentType === "custom" : selectedAmountType === "custom") ? (
                <View style={styles.customAmountBox}>
                  <Text style={styles.customAmountLabel}>Custom amount</Text>
                  <TextInput
                    value={customAmount}
                    onChangeText={(value) => {
                      setCustomAmount(value);
                      setAmountError("");
                    }}
                    keyboardType="numeric"
                    placeholder="Enter amount in rupees"
                    placeholderTextColor={COLORS.muted}
                    style={styles.customAmountInput}
                  />
                </View>
              ) : null}
            </>
          )}

          {!!amountError ? <Text style={styles.amountError}>{amountError}</Text> : null}

          <View style={styles.proceedBox}>
            <Text style={styles.proceedLabel}>Selected amount</Text>
            <Text style={styles.proceedAmount}>{selectedAmountText}</Text>
          </View>

          {showPackageStep ? (
            <TouchableOpacity
              style={[styles.proceedBtn, !selectedPackage && styles.proceedBtnDisabled]}
              onPress={handleNextStep}
              disabled={!selectedPackage}
            >
              <>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                <Text style={styles.proceedBtnText}>Next</Text>
              </>
            </TouchableOpacity>
          ) : (
            <>
              {hasPackages ? (
                <TouchableOpacity style={styles.backBtn} onPress={handleBackToPackage}>
                  <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
                  <Text style={styles.backBtnText}>Back to packages</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[styles.proceedBtn, (loading || verifying || selectedAmount <= 0) && styles.proceedBtnDisabled]}
                onPress={handleProceedToPay}
                disabled={loading || verifying || selectedAmount <= 0}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={18} color={COLORS.white} />
                    <Text style={styles.proceedBtnText}>Proceed to Razorpay</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {!!statusMessage && <Text style={styles.statusText}>{statusMessage}</Text>}
        </View>
      ) : loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      ) : orderData?.orderId ? (
        Platform.OS === "web" ? (
          <View style={styles.webCard}>
            <View style={styles.checkoutHero}>
              <Text style={styles.checkoutBadge}>Live-style Secure Checkout</Text>
              <Text style={styles.checkoutTitle}>
                {service?.title || "Service"} Booking
              </Text>
              <Text style={styles.checkoutDescription}>
                {orderData?.description || "Secure payment powered by Razorpay."}
              </Text>
              <Text style={styles.checkoutAmount}>
                {formatPrice(orderData?.amount || 0)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.webCheckoutBtn, (!webScriptReady || verifying) && styles.webCheckoutBtnDisabled]}
              onPress={handleWebCheckout}
              disabled={!webScriptReady || verifying}
            >
              <Ionicons name="lock-closed" size={18} color={COLORS.white} />
              <Text style={styles.webCheckoutBtnText}>
                {verifying ? "Verifying..." : "Pay With Razorpay"}
              </Text>
            </TouchableOpacity>

            {!!statusMessage && (
              <Text style={styles.statusText}>{statusMessage}</Text>
            )}
          </View>
        ) : (
          <View style={styles.nativeCard}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: checkoutHtml }}
              javaScriptEnabled
              domStorageEnabled
              nestedScrollEnabled
              onMessage={(event) => handleWebMessage(event)}
              style={styles.webview}
            />
          </View>
        )
      ) : (
        <View style={styles.centerBox}>
          <Text style={styles.statusText}>{statusMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  summaryCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: { color: COLORS.text, fontSize: 17, fontWeight: "900" },
  summaryText: { color: COLORS.muted, marginTop: 4, fontWeight: "600", lineHeight: 20 },
  summaryAmount: { color: COLORS.primary, fontSize: 20, fontWeight: "900" },
  packageSummary: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F8F3FF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
  },
  packageSummaryLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  packageSummaryTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900", marginTop: 4 },
  packageSummaryText: { color: COLORS.muted, marginTop: 4, lineHeight: 18, fontWeight: "600" },
  noteRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 12 },
  noteText: { flex: 1, color: COLORS.muted, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  selectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  selectionSub: { color: COLORS.muted, marginTop: 4, fontWeight: "600" },
  optionList: { gap: 10, marginTop: 14 },
  optionCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
    backgroundColor: COLORS.bg,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#F5EEFF",
  },
  optionTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  optionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionDotActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  optionTitle: { color: COLORS.text, fontWeight: "900", fontSize: 15 },
  optionTitleActive: { color: COLORS.primary },
  optionSubtitle: { color: COLORS.muted, marginTop: 3, lineHeight: 18, fontWeight: "600" },
  optionSubtitleActive: { color: COLORS.text },
  optionPrice: { color: COLORS.muted, fontWeight: "900" },
  optionPriceActive: { color: COLORS.primary },
  packageCardDescription: { color: COLORS.muted, marginTop: 10, lineHeight: 18, fontWeight: "600" },
  customAmountBox: { marginTop: 14 },
  customAmountLabel: { color: COLORS.text, fontWeight: "800", marginBottom: 8 },
  customAmountInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontWeight: "700",
  },
  amountError: { color: COLORS.danger, marginTop: 10, fontWeight: "700" },
  proceedBox: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: "#F8F3FF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
    padding: 14,
  },
  proceedLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  proceedAmount: { color: COLORS.primary, fontSize: 22, fontWeight: "900", marginTop: 4 },
  proceedBtn: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  proceedBtnDisabled: { opacity: 0.65 },
  proceedBtnText: { color: COLORS.white, fontWeight: "900", fontSize: 16 },
  backBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6D8FF",
    backgroundColor: "#F8F3FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  backBtnText: { color: COLORS.primary, fontWeight: "900" },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  statusText: { marginTop: 14, color: COLORS.muted, textAlign: "center", fontWeight: "700" },
  webCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkoutHero: { alignItems: "center", paddingVertical: 8 },
  checkoutBadge: { color: COLORS.primary, fontWeight: "900", marginBottom: 8 },
  checkoutTitle: { color: COLORS.text, fontSize: 22, fontWeight: "900", textAlign: "center" },
  checkoutDescription: { color: COLORS.muted, textAlign: "center", marginTop: 8, lineHeight: 20, fontWeight: "600" },
  checkoutAmount: { color: COLORS.primary, fontSize: 30, fontWeight: "900", marginTop: 14 },
  webCheckoutBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  webCheckoutBtnDisabled: { opacity: 0.65 },
  webCheckoutBtnText: { color: COLORS.white, fontWeight: "900", fontSize: 16 },
  nativeCard: {
    flex: 1,
    minHeight: 520,
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  webview: { flex: 1, backgroundColor: "transparent" },
  retryBtn: {
    marginTop: 18,
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: { color: COLORS.white, fontWeight: "900" },
});
