import React, {useContext, useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, StatusBar, RefreshControl,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';

const SERVICE_ICONS = {
  'Church Wedding Hall': 'church',
  'Wedding Photography': 'camera-retro',
  'Church Decoration': 'spa',
  'Christian Catering': 'utensils',
  'Bridal Makeup': 'female',
  'Wedding Orchestra': 'music',
  'Pastor Booking': 'bible',
  'Wedding Cars': 'car',
  'Honeymoon Planning': 'plane',
  'Wedding Invitation Design': 'envelope-open-text',
  'Cleaning Services': 'broom',
  'Sound & Lighting': 'lightbulb',
  'Wedding Cake': 'birthday-cake',
};

export default function VendorDashboardScreen({navigation}) {
  const ctx = useContext(ProfileContext);
  const vendor = ctx?.currentVendor || {};
  const svc = ctx?.getVendorService?.(vendor.id) || {};
  const vendorNotifications = ctx?.getVendorNotifications?.(vendor.id) || [];
  const unreadVendorNotifications = vendorNotifications.filter(notification => !notification.read);
  const [refreshing, setRefreshing] = useState(false);
  const vendorServices = Array.isArray(vendor.services) && vendor.services.length
    ? vendor.services
    : vendor.category
      ? [vendor.category]
      : [];
  const serviceProfiles = Object.values(svc.serviceProfiles || {});

  const serviceStatus = svc.serviceStatus || 'Draft';
  const kycDone = svc.kyc?.submitted;
  const photosDone = (svc.photos || []).length > 0 || serviceProfiles.some(profile => Array.isArray(profile?.photos) && profile.photos.length > 0);
  const packagesDone = (svc.packages || []).length > 0 || serviceProfiles.some(profile => Array.isArray(profile?.packages) && profile.packages.length > 0);
  const detailsDone = Object.values(svc.serviceDetails || {}).some(value => String(value || '').trim().length > 0) || serviceProfiles.some(profile => Object.values(profile?.serviceDetails || {}).some(value => String(value || '').trim().length > 0) || String(profile?.serviceDescription || '').trim().length > 0);
  const canSubmit = kycDone && photosDone && packagesDone && detailsDone && ['Draft', 'Rejected'].includes(serviceStatus);

  const statusColor = {
    Draft: '#FF9800', PendingApproval: '#2196F3',
    Live: '#4CAF50', Rejected: '#F44336',
  }[serviceStatus] || '#FF9800';

  const statusLabel = {
    Draft: 'Setup Pending', PendingApproval: 'Waiting for Approval',
    Live: '🟢 Live', Rejected: 'Rejected – Resubmit',
  }[serviceStatus] || 'Setup Pending';

  const onRefresh = async () => {
    setRefreshing(true);
    await ctx?.refreshData?.();
    setRefreshing(false);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert('Incomplete', 'Please complete KYC, add photos, add at least one package, and add service details before submitting.');
      return;
    }
    Alert.alert('Submit for Approval', 'Your service profile will be sent for admin review. Continue?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Submit', onPress: async () => {
        const result = await ctx?.submitVendorForApproval?.(vendor.id);
        if (!result?.success) {
          Alert.alert('Submit Failed', result?.message || 'Unable to submit vendor profile.');
          return;
        }
        Alert.alert('Submitted!', 'Your profile is now under admin review.', [
          {text: 'OK', onPress: () => navigation.replace('VendorApprovalWaiting', {vendorData: result.vendor || vendor})},
        ]);
      }},
    ]);
  };

  const goToService = () => {
    navigation.navigate('VendorServicePage', {category: vendorServices[0] || vendor.category});
  };

  const pendingBookings = (svc.bookings || []).filter(b => ['Pending', 'Payment Pending'].includes(b.status)).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.profileAvatar}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('VendorProfile')}>
            {vendor.avatar || vendor.imageName ? (
              <Image source={{uri: vendor.avatar || vendor.imageName}} style={styles.profileAvatarImage} />
            ) : (
              <Ionicons name="person" size={24} color={COLORS.dark} />
            )}
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.businessName}>{vendor.businessName || 'Vendor'}</Text>
            <Text style={styles.profileHint}>Tap profile icon to update vendor details</Text>
          </View>
          <TouchableOpacity
            style={styles.notifyBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('VendorNotifications')}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {unreadVendorNotifications.length > 0 && (
              <View style={styles.notifyBadge}>
                <Text style={styles.notifyBadgeText}>{unreadVendorNotifications.length > 9 ? '9+' : unreadVendorNotifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: statusColor + '28', borderColor: statusColor + '80'}]}>
          <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
          <Text style={[styles.statusText, {color: statusColor}]}>{statusLabel}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{paddingBottom: 120}}>

        {/* Setup Progress */}
        {serviceStatus === 'Draft' && (
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Complete Your Service Profile</Text>
            <Text style={styles.setupSub}>Fill all sections to go live and get bookings</Text>

            <SetupStep
              num="1" label="KYC Documents" done={kycDone}
              onPress={() => navigation.navigate('VendorKYC')} />
            <SetupStep
              num="2" label="Service Photos & Gallery" done={photosDone}
              onPress={() => navigation.navigate('VendorPhotos', {category: vendorServices[0] || vendor.category})} />
            <SetupStep
              num="3" label="Packages & Pricing" done={packagesDone}
              onPress={() => navigation.navigate('VendorPackages', {category: vendorServices[0] || vendor.category})} />
            <SetupStep
              num="4" label="Service Details" done={detailsDone}
              onPress={goToService} />

            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Submit for Admin Approval</Text>
            </TouchableOpacity>
          </View>
        )}

        {serviceStatus === 'PendingApproval' && (
          <View style={styles.pendingCard}>
            <Ionicons name="time-outline" size={40} color="#2196F3" />
            <Text style={styles.pendingTitle}>Under Admin Review</Text>
            <Text style={styles.pendingSub}>Your service profile is being reviewed. You'll be notified once approved.</Text>
          </View>
        )}

        {serviceStatus === 'Rejected' && (
          <View style={[styles.pendingCard, {borderColor: '#FFCDD2'}]}>
            <Ionicons name="close-circle-outline" size={40} color="#F44336" />
            <Text style={[styles.pendingTitle, {color: '#F44336'}]}>Profile Rejected</Text>
            <Text style={styles.pendingSub}>Admin rejected your profile. Please update and resubmit.</Text>
            <View style={{width: '100%', gap: 10, marginTop: 14}}>
              <TouchableOpacity style={[styles.submitBtn, {backgroundColor: '#F44336', marginTop: 0}]}
                onPress={goToService}>
                <Text style={styles.submitBtnText}>Edit Service Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled, {marginTop: 0}]}
                onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>Resubmit for Admin Approval</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionBtn icon="briefcase" label="My Service" color="#7FA08A"
            onPress={goToService} />
          <ActionBtn icon="id-card" label="KYC Docs" color="#7FA08A"
            onPress={() => navigation.navigate('VendorKYC')} />
          <ActionBtn icon="images" label="My Photos" color="#2196F3"
            onPress={() => navigation.navigate('VendorPhotos', {category: vendorServices[0] || vendor.category})} />
          <ActionBtn icon="tags" label="Packages" color="#FF9800"
            onPress={() => navigation.navigate('VendorPackages', {category: vendorServices[0] || vendor.category})} />
          <ActionBtn icon="calendar-alt" label="Bookings" color="#9C27B0"
            onPress={() => navigation.navigate('VendorBookings')} />
          <ActionBtn icon="wallet" label="Revenue" color="#4CAF50"
            onPress={() => navigation.navigate('VendorRevenue')} />
        </View>

        {/* Recent Bookings */}
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        {(svc.bookings || []).length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={36} color={COLORS.gray} />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubText}>Bookings from customers will appear here</Text>
          </View>
        ) : (
          (svc.bookings || []).slice(0, 3).map((b, i) => (
            <View key={i} style={styles.bookingRow}>
              <View style={styles.bookingAvatar}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.bookingName}>{b.customerName}</Text>
                <Text style={styles.bookingDate}>{b.date} • {b.package}</Text>
              </View>
              <View style={[styles.bookingStatus, {backgroundColor: (b.status === 'Confirmed' ? '#E3F2FD' : b.status === 'Payment Pending' ? '#F3E5F5' : b.status === 'Completed' ? '#E8F5E9' : '#FFF8E1')}]}>
                <Text style={{fontSize: 11, fontWeight: 'bold', color: b.status === 'Confirmed' ? '#1565C0' : b.status === 'Payment Pending' ? '#6A1B9A' : b.status === 'Completed' ? '#2E7D32' : '#F57C00'}}>
                  {b.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <VendorBottomTab icon="home" label="Home" active onPress={() => navigation.navigate('VendorDashboard')} />
        <VendorBottomTab icon="calendar-alt" label="Bookings" count={pendingBookings} onPress={() => navigation.navigate('VendorBookings')} />
        <VendorBottomTab icon="briefcase" label="Service" onPress={goToService} />
        <VendorBottomTab icon="wallet" label="Revenue" onPress={() => navigation.navigate('VendorRevenue')} />
        <VendorBottomTab icon="user-circle" label="Profile" onPress={() => navigation.navigate('VendorProfile')} />
      </View>
    </View>
  );
}

function SetupStep({num, label, done, onPress}) {
  return (
    <TouchableOpacity style={styles.stepRow} onPress={onPress}>
      <View style={[styles.stepNum, done && styles.stepDone]}>
        {done
          ? <Ionicons name="checkmark" size={14} color="#fff" />
          : <Text style={styles.stepNumText}>{num}</Text>}
      </View>
      <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{label}</Text>
      <Ionicons name={done ? 'checkmark-circle' : 'chevron-forward'}
        size={18} color={done ? '#4CAF50' : COLORS.gray} />
    </TouchableOpacity>
  );
}

function ActionBtn({icon, label, color, onPress}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIcon, {backgroundColor: color + '18'}]}>
        <FontAwesome5 name={icon} size={20} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function VendorBottomTab({icon, label, active, onPress, count}) {
  return (
    <TouchableOpacity style={styles.bottomItem} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.bottomIconWrap}>
        <FontAwesome5 name={icon} size={19} color={active ? COLORS.primary : COLORS.muted} />
        {count > 0 && (
          <View style={styles.bottomBadge}>
            <Text style={styles.bottomBadgeText}>{count > 9 ? '9+' : count}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.bottomText, active && styles.bottomTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {
    backgroundColor: COLORS.dark, paddingTop: 55, paddingBottom: 20,
    paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  greeting: {color: '#9BB5AC', fontSize: 13},
  profileAvatar: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)', overflow: 'hidden'},
  profileAvatarImage: {width: '100%', height: '100%'},
  businessName: {color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 2},
  profileHint: {color: '#DDEAE5', fontSize: 11, marginTop: 3},
  notifyBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginLeft: 10},
  notifyBadge: {position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4},
  notifyBadgeText: {color: '#fff', fontWeight: 'bold', fontSize: 9},
  statusBadge: {flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12, alignSelf: 'flex-start', borderWidth: 1},
  statusDot: {width: 8, height: 8, borderRadius: 4, marginRight: 6},
  statusText: {fontWeight: 'bold', fontSize: 12},
  setupCard: {backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border},
  setupTitle: {fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginBottom: 4},
  setupSub: {color: COLORS.muted, fontSize: 12, marginBottom: 16},
  stepRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#DDEAE5'},
  stepNum: {width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gray, justifyContent: 'center', alignItems: 'center', marginRight: 12},
  stepDone: {backgroundColor: '#4CAF50'},
  stepNumText: {color: '#fff', fontWeight: 'bold', fontSize: 12},
  stepLabel: {flex: 1, color: COLORS.dark, fontWeight: '600', fontSize: 14},
  stepLabelDone: {color: COLORS.muted, textDecorationLine: 'line-through'},
  submitBtn: {height: 50, borderRadius: 14, backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16},
  submitBtnDisabled: {backgroundColor: COLORS.gray, opacity: 0.6},
  submitBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 15},
  pendingCard: {backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#BBDEFB'},
  pendingTitle: {fontSize: 18, fontWeight: 'bold', color: '#1565C0', marginTop: 10, marginBottom: 6},
  pendingSub: {color: COLORS.muted, textAlign: 'center', fontSize: 13, lineHeight: 20},
  sectionTitle: {fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginLeft: 16, marginTop: 18, marginBottom: 10},
  actionsGrid: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10},
  actionBtn: {width: '46%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
  actionIcon: {width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8},
  actionLabel: {color: COLORS.dark, fontWeight: 'bold', fontSize: 13},
  serviceCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border},
  serviceIconBox: {width: 54, height: 54, borderRadius: 16, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: COLORS.border},
  serviceName: {fontSize: 15, fontWeight: 'bold', color: COLORS.dark},
  serviceSub: {color: COLORS.muted, fontSize: 12, marginTop: 3},
  emptyCard: {backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
  emptyText: {color: COLORS.dark, fontWeight: 'bold', marginTop: 8},
  emptySubText: {color: COLORS.muted, fontSize: 12, marginTop: 4, textAlign: 'center'},
  bookingRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border},
  bookingAvatar: {width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 12},
  bookingName: {fontWeight: 'bold', color: COLORS.dark, fontSize: 14},
  bookingDate: {color: COLORS.muted, fontSize: 12, marginTop: 2},
  bookingStatus: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10},
  bottomNav: {position: 'absolute', left: 14, right: 14, bottom: 14, height: 72, backgroundColor: '#fff', borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', elevation: 8, borderWidth: 1, borderColor: COLORS.border},
  bottomItem: {alignItems: 'center', justifyContent: 'center', flex: 1},
  bottomIconWrap: {position: 'relative'},
  bottomText: {marginTop: 4, color: COLORS.muted, fontSize: 10, fontWeight: 'bold'},
  bottomTextActive: {color: COLORS.primary},
  bottomBadge: {position: 'absolute', top: -8, right: -12, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3},
  bottomBadgeText: {color: '#fff', fontSize: 9, fontWeight: 'bold'},
});
