import React, {useContext, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';

export default function VendorNotificationsScreen({navigation}) {
  const ctx = useContext(ProfileContext);
  const vendor = ctx?.currentVendor || {};
  const notifications = ctx?.getVendorNotifications?.(vendor.id) || [];
  const unreadNotifications = notifications.filter(item => !item.read);

  useEffect(() => {
    if (!vendor?.id || unreadNotifications.length === 0) {
      return;
    }

    if (typeof ctx?.markAllVendorNotificationsRead === 'function') {
      ctx.markAllVendorNotificationsRead(vendor.id);
    }
  }, [ctx, unreadNotifications.length, vendor?.id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.heading}>Vendor Notifications</Text>
          <Text style={styles.subHeading}>{vendor.businessName || 'Vendor'} alerts and booking updates</Text>
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="notifications-off-outline" size={70} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No Vendor Alerts</Text>
          <Text style={styles.emptyText}>Account approval, service approval and booking updates will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: 16, paddingBottom: 40}}
          renderItem={({item}) => (
            <View style={[styles.card, !item.read && styles.unreadCard]}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={item.title?.includes('Booking') ? 'calendar-outline' : item.title?.includes('Approved') ? 'checkmark-circle-outline' : 'notifications-outline'}
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View style={{flex: 1}}>
                <View style={styles.cardTop}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.time}>{item.time || 'Just now'}</Text>
                </View>
                <Text style={styles.message}>{item.message}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {backgroundColor: COLORS.dark, paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center'},
  backBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14},
  heading: {color: '#fff', fontSize: 23, fontWeight: 'bold'},
  subHeading: {color: '#DDEAE5', fontSize: 12, marginTop: 3},
  emptyBox: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 35},
  emptyTitle: {fontSize: 22, fontWeight: 'bold', color: COLORS.dark, marginTop: 12},
  emptyText: {color: COLORS.muted, textAlign: 'center', marginTop: 8, lineHeight: 21},
  card: {backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row'},
  unreadCard: {borderColor: COLORS.primary, backgroundColor: '#FFF7F5'},
  iconBox: {width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 12},
  cardTop: {flexDirection: 'row', alignItems: 'center'},
  title: {fontWeight: 'bold', color: COLORS.dark, fontSize: 15, flex: 1},
  time: {fontSize: 11, color: COLORS.primary, fontWeight: 'bold', marginLeft: 8},
  message: {color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 5},
});
