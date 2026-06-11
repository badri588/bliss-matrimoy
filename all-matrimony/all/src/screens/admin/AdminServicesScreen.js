import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import Header from "../../components/Header";
import { COLORS } from "../../constants/colors";
import { useMatrimony } from "../../context/MatrimonyContext";

const FILTERS = ["All", "Approved", "Rejected"];

export default function AdminServicesScreen({ navigation, route }) {
  const {
    adminServiceRequests,
    loadAdminServiceRequests,
    downloadInvoice,
  } = useMatrimony();
  const [filter, setFilter] = useState("All");

  useFocusEffect(
    useCallback(() => {
      loadAdminServiceRequests?.();
    }, [loadAdminServiceRequests])
  );

  const highlightedRequestId = route.params?.requestId;

  const filteredRequests = useMemo(() => {
    const visibleRequests = (adminServiceRequests || []).filter(
      (item) => String(item?.status || "").toUpperCase() !== "PENDING"
    );

    if (filter === "All") {
      return visibleRequests;
    }

    return visibleRequests.filter(
      (item) => String(item?.status || "").toUpperCase() === filter.toUpperCase()
    );
  }, [adminServiceRequests, filter]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Wedding Service Requests"
        subtitle="Vendor-approved bookings appear here after vendor confirmation"
        navigation={navigation}
        showNotification={false}
        backTo="AdminDashboard"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Request Filters</Text>
            <Text style={styles.filterSubtitle}>
              {filteredRequests.length} request{filteredRequests.length === 1 ? "" : "s"} in {filter.toLowerCase()}
            </Text>
          </View>

          <View style={styles.filterGrid}>
            {FILTERS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.filterChip, filter === item && styles.activeFilterChip]}
                onPress={() => setFilter(item)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.activeFilterText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {filteredRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Service Requests</Text>
            <Text style={styles.emptyText}>
              Wedding service bookings will appear here once users submit requests.
            </Text>
          </View>
        ) : (
          filteredRequests.map((item) => {
            const normalizedStatus = String(item?.status || "").toUpperCase();
            const isHighlighted = String(item?.id) === String(highlightedRequestId);
            const handleDownloadInvoice = async () => {
              await Promise.resolve(downloadInvoice?.(item, {
                invoiceTitle: "Service Booking Invoice",
                appName: "All Matrimony",
                serviceTitle: item?.serviceTitle || "Wedding Service",
                customerName: item?.userName || item?.customerName || "Customer",
                customerPhone: item?.phone || item?.customerPhone || "",
                customerEmail: item?.email || item?.customerEmail || "",
                customerLocation: item?.customerLocation || item?.location || "",
                vendorName: item?.vendorName || "",
              })).catch(() => null);
            };

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  isHighlighted && styles.highlightCard,
                ]}
              >
                <View style={styles.topRow}>
                  <Text style={styles.name}>{item.serviceTitle}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      normalizedStatus === "APPROVED"
                        ? styles.approvedBadge
                        : normalizedStatus === "REJECTED"
                        ? styles.rejectedBadge
                        : styles.pendingBadge,
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>{normalizedStatus}</Text>
                  </View>
                </View>

                <Text style={styles.meta}>{item.category || "Wedding Service"}</Text>
                {!!item.packageName && (
                  <Text style={styles.detail}>
                    Package: {item.packageName}
                    {item.packagePrice ? ` - ${item.packagePrice}` : ""}
                  </Text>
                )}
                {!!item.userName && (
                  <Text style={styles.detail}>User: {item.userName}</Text>
                )}
                {!!item.phone && (
                  <Text style={styles.detail}>Phone: {item.phone}</Text>
                )}
                <Text style={styles.meta}>
                  {item.location || "Location not added"} • {item.price || "Price not added"}
                </Text>

                {!!item.bookingDate && (
                  <Text style={styles.detail}>
                    Date: {item.bookingDate}
                    {item.bookingEndDate ? ` to ${item.bookingEndDate}` : ""}
                  </Text>
                )}

                {!!item.bookingTime && (
                  <Text style={styles.detail}>Time: {item.bookingTime}</Text>
                )}

                {String(item.paymentStatus || item.invoiceStatus || "").toUpperCase() === "PAID" && (
                  <View style={styles.invoiceBox}>
                    <Text style={styles.invoiceTitle}>Invoice</Text>
                    <Text style={styles.invoiceLine}>
                      No: {item.invoiceNumber || item.invoice?.number || "N/A"}
                    </Text>
                    <Text style={styles.invoiceLine}>
                      Amount: {item.invoiceAmount || item.invoice?.amount || item.paymentAmount || "N/A"}
                    </Text>
                    <Text style={styles.invoiceLine}>
                      Ref: {item.invoiceReference || item.invoice?.reference || "N/A"}
                    </Text>
                    <TouchableOpacity style={styles.invoiceDownloadBtn} onPress={handleDownloadInvoice}>
                      <Text style={styles.invoiceDownloadText}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!!item.adminMessage && (
                  <Text style={styles.message}>{item.adminMessage}</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    padding: 16,
    paddingTop: 18,
    paddingBottom: 100,
  },
  filterPanel: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E6DAFA",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  filterHeader: {
    marginBottom: 12,
  },
  filterTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },
  filterSubtitle: {
    color: COLORS.muted,
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterChip: {
    minWidth: 78,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#FBF8FF",
    borderWidth: 1,
    borderColor: "#E8DCF9",
    alignItems: "center",
    justifyContent: "center",
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.text,
    fontWeight: "900",
  },
  activeFilterText: {
    color: COLORS.white,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    color: COLORS.muted,
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "700",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6DAFA",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  highlightCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    flex: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  meta: {
    color: COLORS.muted,
    marginTop: 4,
    fontWeight: "700",
  },
  detail: {
    color: COLORS.text,
    marginTop: 8,
    fontWeight: "800",
  },
  message: {
    color: COLORS.muted,
    marginTop: 10,
    lineHeight: 19,
    fontWeight: "700",
  },
  invoiceBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8F3FF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
  },
  invoiceTitle: {
    color: COLORS.primary,
    fontWeight: "900",
    marginBottom: 6,
  },
  invoiceLine: {
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 3,
  },
  invoiceDownloadBtn: {
    marginTop: 10,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  invoiceDownloadText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 12,
  },
  statusBadge: {
    minWidth: 92,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  pendingBadge: {
    backgroundColor: COLORS.softOrange,
  },
  approvedBadge: {
    backgroundColor: COLORS.softGreen,
  },
  rejectedBadge: {
    backgroundColor: COLORS.softRose,
  },
  statusBadgeText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
  },
});
