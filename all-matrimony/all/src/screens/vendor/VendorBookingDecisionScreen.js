import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import COLORS from '../../constants/colors';

export default function VendorBookingDecisionScreen({navigation, route}) {
  const status = route.params?.status || 'Confirmed';
  const booking = route.params?.booking || {};
  const isRejected = status === 'Cancelled' || status === 'Rejected';
  const isCompleted = status === 'Completed';
  const color = isRejected ? COLORS.danger : COLORS.success;
  const icon = isRejected ? 'close-circle' : isCompleted ? 'checkmark-done-circle' : 'checkmark-circle';
  const title = isRejected
    ? 'Booking Rejected'
    : isCompleted
    ? 'Booking Completed'
    : 'Booking Confirmed';
  const message = isRejected
    ? 'The customer and admin pages are updated with the rejection status.'
    : isCompleted
    ? 'The booking has been marked as completed on your side.'
    : 'The customer and admin pages are updated with the confirmation status.';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconWrap, {backgroundColor: `${color}18`}]}>
          <Ionicons name={icon} size={76} color={color} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.label}>Customer</Text>
          <Text style={styles.value}>{booking.customerName || 'Customer'}</Text>

          <Text style={styles.label}>Service</Text>
          <Text style={styles.value}>{booking.package || 'Wedding Service'}</Text>

          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>
            {booking.date || 'Date not set'}
            {booking.endDate ? ` to ${booking.endDate}` : ''}
            {booking.time ? `, ${booking.time}` : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, {backgroundColor: color}]}
          onPress={() => (navigation.canGoBack?.() ? navigation.goBack() : navigation.navigate('VendorBookings'))}
        >
          <Text style={styles.primaryText}>Back to My Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    alignItems: 'center',
  },
  iconWrap: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: COLORS.dark,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
    marginBottom: 18,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  value: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  primaryButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
