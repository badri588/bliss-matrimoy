import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';

export default function VendorApprovalWaitingScreen({navigation, route}) {
  const profileContext = useContext(ProfileContext);
  const vendors = profileContext?.vendors || [];

  const vendorData = route?.params?.vendorData || {};

  // Check live status from store
  const liveVendor = vendors.find(v => v.mobile === vendorData.mobile);
  const rawStatus = liveVendor?.status || vendorData?.status || 'Registered';
  const status = rawStatus === 'Registered' ? 'Pending' : rawStatus;

  const handleCheckStatus = () => {
    if (liveVendor?.status === 'Approved') {
      navigation.replace('VendorDashboard');
    } else {
      // Show current pending state
    }
  };

  if (status === 'Approved') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
        <View style={styles.centerBox}>
          <View style={[styles.iconCircle, styles.approvedCircle]}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          </View>
          <Text style={styles.statusTitle}>Account Approved!</Text>
          <Text style={styles.statusDesc}>
            Your vendor account has been approved by the admin. You can now
            access your vendor dashboard.
          </Text>
          <TouchableOpacity
            style={styles.dashboardBtn}
            onPress={() => navigation.replace('VendorDashboard')}>
            <FontAwesome5 name="store" size={20} color="#fff" />
            <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Registration Status</Text>
          <Text style={styles.headerSub}>GraceMatrimony Vendor Portal</Text>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>
        {/* Waiting Illustration */}
        <View style={styles.waitingBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="time-outline" size={56} color={COLORS.primary} />
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusBadgeText}>Waiting for Admin Approval</Text>
          </View>

          <Text style={styles.waitingTitle}>Registration Submitted!</Text>
          <Text style={styles.waitingDesc}>
            Your vendor registration has been successfully submitted. Our admin
            team will review your application and approve it shortly.
          </Text>
        </View>

        {/* Vendor Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Your Submission Details</Text>

          <DetailRow
            icon="briefcase"
            label="Business Name"
            value={vendorData.businessName || '—'}
          />
          <DetailRow
            icon="user"
            label="Owner Name"
            value={vendorData.ownerName || '—'}
          />
          <DetailRow
            icon="phone"
            label="Mobile"
            value={vendorData.mobile || '—'}
          />
          <DetailRow
            icon="briefcase"
            label="Service Category"
            value={vendorData.category || '—'}
          />
          <DetailRow
            icon="clock"
            label="Status"
            value="Pending Admin Review"
            valueColor="#FF9800"
          />
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={COLORS.muted}
          />
          <Text style={styles.infoText}>
            You will be notified once admin approves your account. Typical
            review time is 24–48 hours.
          </Text>
        </View>

        {/* Check Status Button */}
        <TouchableOpacity
          style={styles.checkBtn}
          onPress={handleCheckStatus}>
          <Ionicons name="refresh-circle-outline" size={22} color="#fff" />
          <Text style={styles.checkBtnText}>Check Approval Status</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function DetailRow({icon, label, value, valueColor}) {
  return (
    <View style={styles.detailRow}>
      <FontAwesome5
        name={icon}
        size={14}
        color={COLORS.primary}
        style={styles.detailIcon}
      />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor && {color: valueColor}]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.dark,
    paddingTop: 55,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  headerSub: {
    color: '#9BB5AC',
    marginTop: 4,
    fontSize: 13,
  },

  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  waitingBox: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  approvedCircle: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
  },

  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF9800',
    marginRight: 8,
  },

  statusBadgeText: {
    color: '#F57C00',
    fontWeight: 'bold',
    fontSize: 13,
  },

  waitingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 10,
  },

  waitingDesc: {
    color: COLORS.muted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
  },

  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },

  detailsTitle: {
    fontWeight: 'bold',
    color: COLORS.dark,
    fontSize: 15,
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#DDEAE5',
  },

  detailIcon: {
    width: 22,
    marginRight: 10,
  },

  detailLabel: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 13,
  },

  detailValue: {
    color: COLORS.dark,
    fontWeight: '600',
    fontSize: 13,
    maxWidth: '50%',
    textAlign: 'right',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  infoText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 8,
  },

  checkBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  checkBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  statusTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 16,
    textAlign: 'center',
  },

  statusDesc: {
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },

  dashboardBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 30,
  },

  dashboardBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
