import React, {useCallback, useContext, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';

const TABS = ['All', 'Pending', 'Payment Pending', 'Accepted', 'Rejected', 'Completed'];
const STATUS_COLORS = {
  Pending: '#FF9800',
  'Payment Pending': '#9C27B0',
  Accepted: '#2196F3',
  Completed: '#4CAF50',
  Rejected: '#F44336',
};

const getDisplayStatus = (status) => {
  if (status === 'Confirmed') return 'Accepted';
  if (status === 'Cancelled') return 'Rejected';
  return status;
};

const parseDateOnly = (value) => {
  if (!value || value === 'Date not set') return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const formatDateOnly = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const expandDateRange = (startValue, endValue = startValue) => {
  const start = parseDateOnly(startValue);
  const end = parseDateOnly(endValue || startValue);
  if (!start || !end) return [];

  const cursor = start <= end ? new Date(start) : new Date(end);
  const finalDate = start <= end ? end : start;
  const values = [];

  while (cursor <= finalDate) {
    values.push(formatDateOnly(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return values;
};

export default function VendorBookingsScreen({navigation}) {
  const ctx = useContext(ProfileContext);
  const vendor = ctx?.currentVendor || {};
  const svc = ctx?.getVendorService?.(vendor.id) || {};
  const revenue = ctx?.getVendorRevenue?.(vendor.id) || {totalRevenue: 0, paidBookings: 0, pendingCollection: 0};
  const [activeTab, setActiveTab] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const allBookings = svc.bookings || [];
  const filtered = activeTab === 'All'
    ? allBookings
    : allBookings.filter(b => getDisplayStatus(b.status) === activeTab);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useFocusEffect(
    useCallback(() => {
      ctx?.loadVendorBookings?.(vendor.id);
    }, [ctx, vendor.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      ctx?.loadVendorBookings?.(vendor.id),
      ctx?.refreshData?.(),
    ]);
    setRefreshing(false);
  };

  const handleAction = async (booking, nextStatus) => {
    const result = await ctx?.updateVendorBookingStatus?.(vendor.id, booking.id, nextStatus, booking);
    if (!result?.ok) {
      Alert.alert('Unable to Update', result?.reason || 'Please try again.');
      return;
    }
    navigation.navigate('VendorBookingDecision', {
      status: nextStatus,
      booking: result.booking || {...booking, status: nextStatus},
    });
  };

  const handleDownloadInvoice = async (booking) => {
    await Promise.resolve(ctx?.downloadInvoice?.(booking, {
      invoiceTitle: "Service Booking Invoice",
      appName: "All Matrimony",
      serviceTitle: booking?.package || booking?.serviceTitle || "Wedding Service",
      customerName: booking?.customerName || "Customer",
      customerPhone: booking?.customerPhone || booking?.phone || "",
      customerLocation: booking?.customerLocation || booking?.location || "",
      vendorName: vendor?.businessName || "",
    })).catch(() => null);
  };

  const blockedDates = Array.from(new Set(
    allBookings
      .filter(b => getDisplayStatus(b.status) === 'Accepted')
      .flatMap(b => expandDateRange(b.date, b.endDate || b.date))
      .filter(date => {
        const parsed = parseDateOnly(date);
        return parsed && parsed >= today;
      })
  )).sort();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSub}>Approve request → customer pays → revenue updates</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.revenueSummary}>
        <TouchableOpacity style={styles.revenueItem} onPress={() => navigation.navigate('VendorRevenue')}>
          <Text style={styles.revenueValue}>₹{revenue.totalRevenue}</Text>
          <Text style={styles.revenueLabel}>Paid Revenue</Text>
        </TouchableOpacity>
        <View style={styles.revenueDivider} />
        <View style={styles.revenueItem}>
          <Text style={styles.revenueValue}>₹{revenue.pendingCollection}</Text>
          <Text style={styles.revenueLabel}>Awaiting Payment</Text>
        </View>
        <View style={styles.revenueDivider} />
        <View style={styles.revenueItem}>
          <Text style={styles.revenueValue}>{revenue.paidBookings}</Text>
          <Text style={styles.revenueLabel}>Paid Orders</Text>
        </View>
      </View>

      {blockedDates.length > 0 && (
        <View style={styles.blockedDatesBox}>
          <Ionicons name="lock-closed-outline" size={18} color="#2E7D32" />
          <Text style={styles.blockedDatesText}>Today & upcoming confirmed dates: {blockedDates.join(', ')}</Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={44} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySub}>Customer requests will appear here after they browse your service details and book. Paid bookings can be confirmed from Payment Pending.</Text>
          </View>
        ) : (
          filtered.map(b => {
            const color = STATUS_COLORS[b.status] || '#888';
            return (
              <View key={b.id} style={styles.bookingCard}>
                  <View style={styles.bookingTop}>
                  <View style={styles.bookingAvatar}>
                    <Ionicons name="people" size={22} color={COLORS.primary} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.customerName}>{b.customerName}</Text>
                    <Text style={styles.bookingDate}>📅 {b.date} • {b.time || 'Time not set'}</Text>
                  </View>
                  <View style={[styles.statusChip, {backgroundColor: color + '20'}]}>
                    <Text style={[styles.statusChipText, {color}]}>{getDisplayStatus(b.status)}</Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <Text style={styles.bookingPackage}>📦 {b.package}</Text>
                  <Text style={styles.bookingAmount}>{b.amount ? `💰 ₹${b.amount}` : 'Custom price'}</Text>
                </View>

                <View style={styles.infoLine}>
                  <Ionicons name="card-outline" size={14} color={COLORS.muted} />
                  <Text style={styles.infoText}>Payment: {b.paymentStatus || 'Not requested'} {b.paidAmount ? `· Paid ₹${b.paidAmount}` : ''}</Text>
                </View>
                {b.transactionId ? (
                  <View style={styles.infoLine}>
                    <Ionicons name="receipt-outline" size={14} color={COLORS.muted} />
                    <Text style={styles.infoText}>Txn: {b.transactionId} · {b.paymentMethod || 'Online'}</Text>
                  </View>
                ) : null}
                {String(b.paymentStatus || b.invoiceStatus || "").toUpperCase() === 'PAID' ? (
                  <View style={styles.invoiceBox}>
                    <Text style={styles.invoiceLine}>Invoice: {b.invoiceNumber || b.invoice?.number || 'N/A'}</Text>
                    <Text style={styles.invoiceLine}>Amount: ₹{b.invoiceAmount || b.invoice?.amount || b.paidAmount || 0}</Text>
                    <Text style={styles.invoiceLine}>Ref: {b.invoiceReference || b.invoice?.reference || b.transactionId || 'N/A'}</Text>
                    <TouchableOpacity style={styles.invoiceDownloadBtn} onPress={() => handleDownloadInvoice(b)}>
                      <Text style={styles.invoiceDownloadText}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <View style={styles.infoLine}>
                  <Ionicons name="call-outline" size={14} color={COLORS.muted} />
                  <Text style={styles.infoText}>{b.customerPhone || b.phone || 'No phone'}</Text>
                </View>
                <View style={styles.infoLine}>
                  <Ionicons name="location-outline" size={14} color={COLORS.muted} />
                  <Text style={styles.infoText}>{b.customerLocation || b.location || 'No location'}</Text>
                </View>
                {b.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>Notes: {b.notes}</Text>
                  </View>
                ) : null}

                <View style={styles.workflowBox}>
                  <Text style={styles.workflowTitle}>Workflow: {b.workflowStage || 'Waiting for vendor update'}</Text>
                  {(b.statusHistory || []).slice(-4).map((entry, index) => (
                    <View key={`${entry.status}-${index}`} style={styles.historyLine}>
                      <View style={styles.historyDot} />
                      <Text style={styles.historyText}>{entry.status} · {entry.time || 'Just now'}</Text>
                    </View>
                  ))}
                </View>

                {['Pending', 'Payment Pending'].includes(b.status) && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.confirmBtn, styles.actionBtnSpacing]} onPress={() => handleAction(b, 'Confirmed')}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.confirmBtnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleAction(b, 'Cancelled')}>
                      <Ionicons name="close" size={16} color="#fff" />
                      <Text style={styles.cancelBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {b.status === 'Payment Pending' && (
                  <View style={styles.waitingBox}>
                    <Ionicons name="time-outline" size={18} color="#6A1B9A" />
                    <Text style={styles.waitingText}>Customer has paid. Please accept or reject this booking.</Text>
                  </View>
                )}

                {b.status === 'Confirmed' && b.paymentStatus === 'Paid' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.completedBtn} onPress={() => handleAction(b, 'Completed')}>
                      <Ionicons name="checkmark-done" size={16} color="#fff" />
                      <Text style={styles.confirmBtnText}>Mark Completed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleAction(b, 'Cancelled')}>
                      <Ionicons name="close" size={16} color="#fff" />
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {backgroundColor: COLORS.dark, paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center'},
  backBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14},
  refreshBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginLeft: 10},
  headerTitle: {color: '#fff', fontSize: 22, fontWeight: 'bold'},
  headerSub: {color: '#DDEAE5', fontSize: 12, marginTop: 3, lineHeight: 17},
  revenueSummary: {flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14},
  revenueItem: {flex: 1, alignItems: 'center', paddingHorizontal: 6},
  revenueValue: {fontSize: 17, fontWeight: 'bold', color: COLORS.primary},
  revenueLabel: {fontSize: 10, color: COLORS.muted, marginTop: 3, textAlign: 'center'},
  revenueDivider: {width: 1, backgroundColor: COLORS.border},
  blockedDatesBox: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#E8F5E9', marginHorizontal: 16, marginTop: 14, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#A5D6A7'},
  blockedDatesText: {flex: 1, color: '#2E7D32', fontSize: 12, fontWeight: 'bold', lineHeight: 18},
  tabsScroll: {
    minHeight: 60,
    marginTop: 16,
    marginBottom: 18,
    marginHorizontal: 16,
    backgroundColor: COLORS.background,
    borderRadius: 999,
    zIndex: 2,
    elevation: 2,
    overflow: 'visible',
  },
  tabsContent: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tab: {paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, marginRight: 8},
  tabActive: {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
  tabText: {color: COLORS.muted, fontWeight: '600', fontSize: 13},
  tabTextActive: {color: '#fff'},
  listContent: {
    paddingTop: 18,
    paddingBottom: 30,
  },
  emptyBox: {alignItems: 'center', padding: 50},
  emptyTitle: {color: COLORS.dark, fontSize: 16, fontWeight: 'bold', marginTop: 10},
  emptySub: {color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 18},
  bookingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 1,
    overflow: 'visible',
  },
  bookingTop: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  bookingAvatar: {width: 44, height: 44, borderRadius: 13, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 12},
  customerName: {fontWeight: 'bold', color: COLORS.dark, fontSize: 15},
  bookingDate: {color: COLORS.muted, fontSize: 12, marginTop: 2},
  statusChip: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10},
  statusChipText: {fontSize: 11, fontWeight: 'bold'},
  bookingDetails: {flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#DDEAE5'},
  bookingPackage: {color: COLORS.dark, fontSize: 13, flex: 1},
  bookingAmount: {color: COLORS.primary, fontWeight: 'bold', fontSize: 14},
  infoLine: {flexDirection: 'row', alignItems: 'center', marginTop: 7, gap: 5},
  infoText: {color: COLORS.muted, fontSize: 12, flex: 1},
  invoiceBox: {marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: '#F8F3FF', borderWidth: 1, borderColor: '#E6D8FF'},
  invoiceLine: {color: COLORS.dark, fontSize: 12, fontWeight: '600', marginTop: 3},
  invoiceDownloadBtn: {
    marginTop: 10,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E6D8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceDownloadText: {color: COLORS.primary, fontSize: 12, fontWeight: '900'},
  notesBox: {backgroundColor: COLORS.background, borderRadius: 12, padding: 10, marginTop: 10},
  notesText: {color: COLORS.muted, fontSize: 12, lineHeight: 18},
  workflowBox: {backgroundColor: COLORS.background, borderRadius: 12, padding: 10, marginTop: 10},
  workflowTitle: {color: COLORS.dark, fontSize: 12, fontWeight: 'bold', marginBottom: 6},
  historyLine: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3},
  historyDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary},
  historyText: {color: COLORS.muted, fontSize: 11, flex: 1},
  actionRow: {flexDirection: 'row', marginTop: 12},
  actionBtnSpacing: {marginRight: 10},
  confirmBtn: {flex: 1, minHeight: 42, borderRadius: 10, backgroundColor: '#4CAF50', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingHorizontal: 8},
  completedBtn: {flex: 1, minHeight: 42, borderRadius: 10, backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingHorizontal: 8},
  confirmBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center'},
  cancelBtn: {flex: 1, minHeight: 42, borderRadius: 10, backgroundColor: '#F44336', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingHorizontal: 8},
  cancelBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 13},
  waitingBox: {marginTop: 12, borderRadius: 12, backgroundColor: '#F3E5F5', padding: 11, flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  waitingText: {flex: 1, color: '#6A1B9A', fontSize: 12, lineHeight: 18, fontWeight: '600'},
});
