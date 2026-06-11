import React, {useContext, useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';

export default function VendorRevenueScreen({navigation}) {
  const ctx = useContext(ProfileContext);
  const vendor = ctx?.currentVendor || {};
  const revenue = ctx?.getVendorRevenue?.(vendor.id) || {totalRevenue: 0, paidBookings: 0, pendingCollection: 0, transactions: []};
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    ctx?.loadVendorBookings?.(vendor.id);
  }, [vendor.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      ctx?.loadVendorBookings?.(vendor.id),
      ctx?.refreshData?.(),
    ]);
    setRefreshing(false);
  };

  const handleDownloadInvoice = async (item) => {
    await Promise.resolve(ctx?.downloadInvoice?.(item, {
      invoiceTitle: "Service Booking Invoice",
      appName: "All Matrimony",
      serviceTitle: item?.serviceTitle || "Wedding Service",
      customerName: item?.customerName || "Customer",
      vendorName: vendor?.businessName || "",
    })).catch(() => null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>Revenue</Text>
          <Text style={styles.headerSub}>Paid bookings and vendor earnings</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Vendor Revenue Received</Text>
          <Text style={styles.heroAmount}>₹{revenue.totalRevenue}</Text>
          <Text style={styles.heroSub}>{revenue.paidBookings} paid booking{revenue.paidBookings === 1 ? '' : 's'} credited in full</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="time-outline" size={22} color="#9C27B0" />
            <Text style={styles.statValue}>₹{revenue.pendingCollection}</Text>
            <Text style={styles.statLabel}>Awaiting Customer Payment</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-done-outline" size={22} color="#4CAF50" />
            <Text style={styles.statValue}>{revenue.paidBookings}</Text>
            <Text style={styles.statLabel}>Paid Orders</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment Transactions</Text>
        {revenue.transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={50} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>No paid revenue yet</Text>
            <Text style={styles.emptyText}>After vendor approval, customers will pay from My Bookings. Paid orders will appear here and in admin bookings.</Text>
          </View>
        ) : revenue.transactions.map(item => (
          <View key={`${item.vendorId}-${item.id}`} style={styles.txnCard}>
            <View style={styles.txnTop}>
              <View style={styles.txnIcon}>
                <Ionicons name="receipt-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.txnTitle}>{item.customerName || 'Customer'}</Text>
                <Text style={styles.txnSub}>{item.serviceTitle || 'Wedding Service'} · {item.package || 'Package'}</Text>
              </View>
              <Text style={styles.txnAmount}>₹{item.vendorEarning || item.paidAmount || item.amount}</Text>
            </View>
            <View style={styles.txnDetails}>
              <Info label="Event" value={`${item.date || 'Not set'} ${item.time ? `· ${item.time}` : ''}`} />
              <Info label="Paid At" value={item.paidAt || item.updatedAt || 'Just now'} />
              <Info label="Method" value={item.paymentMethod || 'Online'} />
              <Info label="Transaction ID" value={item.transactionId || '—'} />
                          </View>
            <TouchableOpacity style={styles.invoiceDownloadBtn} onPress={() => handleDownloadInvoice(item)}>
              <Text style={styles.invoiceDownloadText}>Download Invoice PDF</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Info({label, value}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {backgroundColor: COLORS.dark, paddingTop: 55, paddingBottom: 24, paddingHorizontal: 18, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center'},
  backBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  refreshBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginLeft: 10},
  headerTitle: {color: '#fff', fontSize: 24, fontWeight: 'bold'},
  headerSub: {color: '#DDEAE5', fontSize: 12, marginTop: 4},
  scrollContent: {padding: 16, paddingBottom: 80},
  heroCard: {backgroundColor: COLORS.primary, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 14},
  heroLabel: {color: '#EAF2EE', fontWeight: '700', fontSize: 13},
  heroAmount: {color: '#fff', fontSize: 38, fontWeight: 'bold', marginTop: 5},
  heroSub: {color: '#EAF2EE', marginTop: 6},
  statsRow: {flexDirection: 'row', gap: 10, marginBottom: 18},
  statBox: {flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
  statValue: {fontSize: 19, fontWeight: 'bold', color: COLORS.dark, marginTop: 6},
  statLabel: {fontSize: 11, color: COLORS.muted, textAlign: 'center', marginTop: 4, lineHeight: 15},
  sectionTitle: {fontSize: 17, fontWeight: 'bold', color: COLORS.dark, marginBottom: 10},
  emptyCard: {backgroundColor: '#fff', borderRadius: 22, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
  emptyTitle: {fontSize: 18, color: COLORS.dark, fontWeight: 'bold', marginTop: 10},
  emptyText: {fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 7, lineHeight: 20},
  txnCard: {backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border},
  txnTop: {flexDirection: 'row', alignItems: 'center', gap: 10},
  txnIcon: {width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center'},
  txnTitle: {fontSize: 15, fontWeight: 'bold', color: COLORS.dark},
  txnSub: {fontSize: 12, color: COLORS.muted, marginTop: 3},
  txnAmount: {fontSize: 17, fontWeight: 'bold', color: '#2E7D32'},
  txnDetails: {backgroundColor: COLORS.background, borderRadius: 14, padding: 12, marginTop: 12},
  invoiceDownloadBtn: {marginTop: 12, height: 42, borderRadius: 12, backgroundColor: '#F8F3FF', borderWidth: 1, borderColor: '#E6D8FF', alignItems: 'center', justifyContent: 'center'},
  invoiceDownloadText: {color: COLORS.primary, fontWeight: '900', fontSize: 12},
  infoRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 5},
  infoLabel: {fontSize: 12, color: COLORS.muted, fontWeight: '700'},
  infoValue: {fontSize: 12, color: COLORS.dark, flex: 1, textAlign: 'right'},
});
