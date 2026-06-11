import React from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../components/Header";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

const formatAmount = (amount = 0) => `Rs. ${(Number(amount || 0) / 100).toFixed(0)}`;

export default function ServiceBookingSuccessScreen({ navigation, route }) {
  const { appTheme } = useMatrimony();
  const service = route?.params?.service || null;
  const bookingDetails = route?.params?.bookingDetails || {};
  const selectedPackage = route?.params?.selectedPackage || null;
  const paymentAmount = route?.params?.paymentAmount || 0;
  const bookingId = route?.params?.bookingId || null;
  const transactionId = route?.params?.transactionId || "";
  const invoice = route?.params?.invoice || {};
  const invoiceNumber = invoice?.number || (bookingId ? `INV-${String(bookingId).padStart(6, "0")}` : "");
  const { downloadInvoice } = useMatrimony();
  const customerName = route?.params?.customerName || "Customer";
  const customerPhone = route?.params?.customerPhone || "N/A";
  const customerEmail = route?.params?.customerEmail || "N/A";
  const customerLocation = route?.params?.customerLocation || "N/A";
  const invoiceDate = invoice?.date || new Date().toISOString();
  const paymentMode = invoice?.paymentMode || "Razorpay";
  const paymentStatus = invoice?.status || "PAID";

  const handleDownloadInvoice = async () => {
    try {
      await downloadInvoice?.(
        {
          id: bookingId,
          invoiceNumber,
          invoiceDate,
          invoiceAmount: paymentAmount,
          invoiceStatus: paymentStatus,
          invoiceReference: invoice?.reference || transactionId || "",
          paymentStatus: "PAID",
          paymentMethod: paymentMode,
          paymentAmount,
          paymentCurrency: "INR",
          razorpayPaymentId: transactionId,
          razorpayOrderId: route?.params?.orderId || "",
          customerName,
          customerPhone,
          customerEmail,
          customerLocation,
          serviceTitle: service?.title || "Service booking",
          vendorName: service?.vendorName || "",
          vendorPhone: service?.vendorPhone || "",
          bookingDate: bookingDetails?.bookingDate || "",
          bookingEndDate: bookingDetails?.bookingEndDate || "",
          bookingTime: bookingDetails?.bookingTime || "",
          service: {
            title: service?.title || "Service booking",
            vendorName: service?.vendorName || "",
            vendorPhone: service?.vendorPhone || "",
          },
        },
        {
          invoiceTitle: "Service Booking Invoice",
          appName: "All Matrimony",
          notes: "Payment confirmation invoice",
        }
      );
    } catch (error) {
      Alert.alert("Download failed", error?.message || "Unable to open the invoice PDF.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
      <Header
        title="Payment Successful"
        subtitle={service?.title || "Service booking"}
        navigation={navigation}
        showBack={true}
        showNotification={false}
        backTo="ServiceDetails"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.heroTop}>
            <View style={styles.iconWrap}>
              <Ionicons name="receipt-outline" size={34} color={COLORS.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.title}>Invoice Generated</Text>
              <Text style={styles.subtitle}>
                Your payment was received and the invoice is ready with booking details, customer info, and payment fields.
              </Text>
            </View>
          </View>

          <View style={styles.invoiceHeader}>
            <View style={{flex: 1}}>
              <Text style={styles.invoiceLabel}>Invoice No.</Text>
              <Text style={styles.invoiceValue}>{invoiceNumber || "N/A"}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{paymentStatus}</Text>
            </View>
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Paid Amount</Text>
            <Text style={styles.amountValue}>{formatAmount(paymentAmount)}</Text>
            <Text style={styles.amountSub}>Paid via {paymentMode}</Text>
          </View>

          <Section title="Customer Details" icon="person-outline">
            <InfoRow label="Name" value={customerName} />
            <InfoRow label="Phone" value={customerPhone} />
            <InfoRow label="Email" value={customerEmail} />
            <InfoRow label="Location" value={customerLocation} />
          </Section>

          <Section title="Booking Details" icon="calendar-outline">
            {!!service?.title && <InfoRow label="Service" value={service.title} />}
            {!!selectedPackage?.name && (
              <InfoRow
                label="Package"
                value={`${selectedPackage.name}${selectedPackage.price ? ` - ${selectedPackage.price}` : ""}`}
              />
            )}
            <InfoRow
              label="Schedule"
              value={`${bookingDetails?.bookingDate || "N/A"}${
                bookingDetails?.bookingEndDate ? ` to ${bookingDetails.bookingEndDate}` : ""
              }${bookingDetails?.bookingTime ? `, ${bookingDetails.bookingTime}` : ""}`}
            />
            {!!bookingId && <InfoRow label="Booking ID" value={String(bookingId)} />}
          </Section>

          <Section title="Payment Details" icon="card-outline">
            {!!transactionId && <InfoRow label="Transaction ID" value={transactionId} />}
            {!!invoice?.reference && <InfoRow label="Reference" value={invoice.reference} />}
            <InfoRow label="Invoice Date" value={new Date(invoiceDate).toLocaleString()} />
            <InfoRow label="Currency" value="INR" />
          </Section>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleDownloadInvoice}>
            <Ionicons name="download-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Download Invoice PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryBtnText}>Return to Service Page</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, icon, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 24 },
  card: {
    margin: 16,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#F8F3FF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: COLORS.text, fontSize: 24, fontWeight: "900" },
  subtitle: {
    color: COLORS.muted,
    marginTop: 6,
    lineHeight: 22,
    fontWeight: "600",
  },
  invoiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  invoiceLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  invoiceValue: { color: COLORS.text, fontSize: 18, fontWeight: "900", marginTop: 4 },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.softGreen,
  },
  statusPillText: { color: COLORS.success, fontSize: 11, fontWeight: "900" },
  amountBox: {
    width: "100%",
    marginTop: 22,
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#F8F3FF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
    alignItems: "center",
  },
  amountLabel: { color: COLORS.muted, fontWeight: "700" },
  amountValue: { color: COLORS.primary, fontSize: 30, fontWeight: "900", marginTop: 6 },
  amountSub: { color: COLORS.muted, fontSize: 12, marginTop: 5, fontWeight: "600" },
  section: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#FAFBFA",
  },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: "900" },
  sectionBody: { padding: 14 },
  infoRow: {
    width: "100%",
    marginBottom: 10,
  },
  infoLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  infoValue: { color: COLORS.text, fontWeight: "800", marginTop: 4, lineHeight: 20 },
  secondaryBtn: {
    width: "100%",
    marginTop: 16,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F8F3FF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryBtnText: { color: COLORS.primary, fontWeight: "900", fontSize: 16 },
  primaryBtn: {
    width: "100%",
    marginTop: "auto",
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: COLORS.white, fontWeight: "900", fontSize: 16 },
});
