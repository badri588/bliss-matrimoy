import React, {useContext, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';

const SERVICE_META = {
  'Church Wedding Hall': {
    icon: 'church', color: '#7FA08A',
    fields: ['Hall Capacity', 'AC/Non-AC', 'Parking', 'Catering Allowed', 'Decoration Allowed', 'Audio System'],
    tip: 'Mention seating capacity, stage size, parking slots and nearby facilities.',
  },
  'Wedding Photography': {
    icon: 'camera-retro', color: '#2196F3',
    fields: ['Camera Brand', 'No. of Photographers', 'Video Included', 'Drone Shoot', 'Album Included', 'Delivery Days'],
    tip: 'Highlight your camera equipment, editing style and delivery timeline.',
  },
  'Church Decoration': {
    icon: 'spa', color: '#E91E63',
    fields: ['Flower Types', 'Stage Setup', 'Aisle Decoration', 'Arch Type', 'Color Themes', 'Setup Time'],
    tip: 'Describe your floral specialities, setup process and cleanup included.',
  },
  'Christian Catering': {
    icon: 'utensils', color: '#FF9800',
    fields: ['Cuisine Type', 'Min Guests', 'Max Guests', 'Veg/Non-Veg', 'Serving Style', 'Crockery Included'],
    tip: 'Mention menu variety, hygiene certifications and minimum order quantity.',
  },
  'Bridal Makeup': {
    icon: 'female', color: '#9C27B0',
    fields: ['Makeup Style', 'Products Brand', 'Trial Session', 'Hair Included', 'Airbrush Available', 'Home Service'],
    tip: 'Describe your makeup style, brands used and whether trial sessions are offered.',
  },
  'Wedding Orchestra': {
    icon: 'music', color: '#F44336',
    fields: ['Band Size', 'Instruments', 'Christian Songs', 'Live Singing', 'Sound System', 'Performance Hours'],
    tip: 'List song repertoire, number of musicians and equipment provided.',
  },
  'Pastor Booking': {
    icon: 'bible', color: '#795548',
    fields: ['Denomination', 'Languages', 'Ceremony Type', 'Certificate Provided', 'Travel Radius', 'Experience Years'],
    tip: 'Mention denominations served, languages and any special ceremony expertise.',
  },
  'Wedding Cars': {
    icon: 'car', color: '#607D8B',
    fields: ['Car Models', 'Fleet Size', 'Decoration Included', 'Driver Included', 'Travel Distance', 'AC Available'],
    tip: 'List car models, decoration style and whether inter-city travel is possible.',
  },
  'Honeymoon Planning': {
    icon: 'plane', color: '#00BCD4',
    fields: ['Destinations', 'Package Duration', 'Hotel Class', 'Flight Included', 'Visa Assistance', 'Custom Tours'],
    tip: 'Highlight popular destinations, package inclusions and customization options.',
  },
  'Wedding Invitation Design': {
    icon: 'envelope-open-text', color: '#4CAF50',
    fields: ['Design Styles', 'Delivery Format', 'Printing Included', 'Digital Cards', 'Languages', 'Revisions'],
    tip: 'Showcase design samples, turnaround time and printing options.',
  },
  'Cleaning Services': {
    icon: 'broom', color: '#8BC34A',
    fields: ['Service Type', 'Team Size', 'Equipment', 'Chemicals Used', 'Duration', 'Post-Event Cleanup'],
    tip: 'Describe pre-event and post-event cleaning scope and waste disposal.',
  },
  'Sound & Lighting': {
    icon: 'lightbulb', color: '#FFC107',
    fields: ['Speaker Brand', 'Lighting Types', 'DJ Available', 'Stage Lighting', 'Setup Time', 'Wattage'],
    tip: 'Mention equipment brands, setup team size and power backup availability.',
  },
  'Wedding Cake': {
    icon: 'birthday-cake', color: '#FF5722',
    fields: ['Cake Flavours', 'Tiers Available', 'Custom Design', 'Eggless Option', 'Delivery Included', 'Tasting Session'],
    tip: 'Showcase cake designs, flavours, custom orders and advance booking time.',
  },
};

const createDraftFromFields = (fields, saved = {}) => {
  const draft = {};
  fields.forEach(field => {
    draft[field] = saved?.[field] || '';
  });
  Object.keys(saved || {}).forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(draft, key)) draft[key] = saved[key] || '';
  });
  return draft;
};

export default function VendorServicePage({navigation, route}) {
  const ctx = useContext(ProfileContext);
  const currentVendor = ctx?.currentVendor || {};
  const routeVendorId = route?.params?.vendorId;
  const vendor = useMemo(
    () => (ctx?.vendors || []).find(item => item.id === routeVendorId) || currentVendor,
    [ctx?.vendors, routeVendorId, currentVendor],
  );
  const vendorId = vendor?.id;
  const svc = ctx?.getVendorService?.(vendorId) || {};
  const category = route?.params?.category || vendor?.category || '';
  const vendorServices = Array.isArray(vendor?.services) && vendor.services.length
    ? vendor.services
    : vendor.category
      ? [vendor.category]
      : [];
  const [selectedService, setSelectedService] = useState(category || vendorServices[0] || '');
  const activeCategory = selectedService || category;
  const meta = SERVICE_META[activeCategory] || {icon: 'briefcase', color: COLORS.primary, fields: [], tip: 'Add practical details customers need before booking.'};
  const fields = meta.fields?.length ? meta.fields : ['Service Area', 'Team Size', 'Advance Booking Days', 'Setup Time', 'Payment Terms', 'Special Notes'];
  const selectedProfile = ctx?.getVendorServiceProfile?.(vendorId, activeCategory) || {};
  const packages = selectedProfile.packages || [];
  const photos = selectedProfile.photos || [];
  const serviceStatus = svc.serviceStatus || 'Draft';
  const serviceDetails = selectedProfile.serviceDetails || {};
  const [editVisible, setEditVisible] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState(createDraftFromFields(fields, serviceDetails));

  useEffect(() => {
    setDetailsDraft(createDraftFromFields(fields, serviceDetails));
  }, [vendorId, activeCategory, JSON.stringify(serviceDetails)]);

  useEffect(() => {
    if (route?.params?.openEditor) {
      setDetailsDraft(createDraftFromFields(fields, serviceDetails));
      setEditVisible(true);
    }
  }, [route?.params?.openEditor, vendorId, activeCategory]);

  useEffect(() => {
    setSelectedService(category || vendorServices[0] || '');
  }, [category, vendorServices.join('|')]);

  const openEditor = () => {
    setDetailsDraft(createDraftFromFields(fields, serviceDetails));
    setEditVisible(true);
  };

  const updateDraft = (field, value) => {
    setDetailsDraft(prev => ({...prev, [field]: value}));
  };

  const saveDetails = () => {
    if (!vendorId) {
      Alert.alert('Vendor Missing', 'Please login as vendor again and try editing service details.');
      return;
    }
    const cleaned = {};
    Object.keys(detailsDraft).forEach(key => {
      cleaned[key] = String(detailsDraft[key] || '').trim();
    });
    ctx?.updateVendorServiceDetails?.(vendorId, cleaned, {serviceCategory: activeCategory});
    setEditVisible(false);
    Alert.alert('Service Details Saved', 'All setup steps are ready. Submit your profile for admin approval from the dashboard.', [
      {text: 'OK', onPress: () => navigation.replace('VendorDashboard')},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {backgroundColor: meta.color}]}> 
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>{activeCategory || 'My Service'}</Text>
          <Text style={styles.headerSub}>{vendor?.businessName || 'Vendor'} Service Management</Text>
        </View>
        <View style={[styles.statusChip, {
          backgroundColor: serviceStatus === 'Live' ? '#4CAF5030' : '#FF980030',
          borderColor: serviceStatus === 'Live' ? '#4CAF50' : '#FF9800',
        }]}> 
          <Text style={{color: serviceStatus === 'Live' ? '#4CAF50' : '#FF9800', fontSize: 11, fontWeight: 'bold'}}>
            {serviceStatus === 'Live' ? '🟢 Live' : serviceStatus}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
        <View style={styles.vendorInfoCard}>
          <Ionicons name="business-outline" size={20} color={COLORS.primary} />
          <View style={{flex: 1}}>
            <Text style={styles.vendorInfoName}>{vendor?.businessName || 'Your Business'}</Text>
            <Text style={styles.vendorInfoSub}>{vendor?.ownerName || 'Owner'} • {vendor?.mobile || 'Mobile not added'}</Text>
          </View>
        </View>

        {vendorServices.length > 1 && (
          <View style={styles.serviceSelectorCard}>
            <Text style={styles.selectorTitle}>Select Service</Text>
            <View style={styles.serviceChips}>
              {vendorServices.map(serviceName => {
                const active = activeCategory === serviceName;
                return (
                  <TouchableOpacity
                    key={serviceName}
                    style={[styles.serviceChip, styles.serviceChipSpacing, active && styles.serviceChipActive]}
                    onPress={() => setSelectedService(serviceName)}
                    activeOpacity={0.85}>
                    <Text style={[styles.serviceChipText, active && styles.serviceChipTextActive]}>
                      {serviceName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.tipBox}>
          <FontAwesome5 name={meta.icon} size={18} color={meta.color} />
          <Text style={styles.tipText}>{meta.tip}</Text>
        </View>

        <SectionCard title="Gallery" icon="images" onAction={() => navigation.navigate('VendorPhotos', {category: activeCategory})} actionLabel="Manage">
          {photos.length === 0 ? (
            <Text style={styles.emptyInCard}>No photos added yet</Text>
          ) : (
            <View style={styles.photoRow}>
              {photos.map((p, i) => (
                <View key={p.id || i} style={[styles.photoThumb, {backgroundColor: meta.color + '20'}]}>
                  <Ionicons name="image" size={22} color={meta.color} />
                  <Text style={styles.photoThumbLabel} numberOfLines={1}>{p.label}</Text>
                </View>
              ))}
            </View>
          )}
        </SectionCard>

        <SectionCard title="Packages & Pricing" icon="tags" onAction={() => navigation.navigate('VendorPackages', {category: activeCategory})} actionLabel="Manage">
          {packages.length === 0 ? (
            <Text style={styles.emptyInCard}>No packages added yet</Text>
          ) : packages.map((pkg, i) => (
            <View key={pkg.id || i} style={styles.pkgRow}>
              <View style={{flex: 1}}>
                <Text style={styles.pkgName}>{pkg.name}</Text>
                {pkg.includes ? <Text style={styles.pkgIncludes}>{pkg.includes}</Text> : null}
              </View>
              <Text style={[styles.pkgPrice, {color: meta.color}]}>₹{pkg.price}</Text>
            </View>
          ))}
        </SectionCard>

        <SectionCard title="Service Details" icon="list-alt" onAction={openEditor} actionLabel="Edit">
          {fields.map(field => (
            <View key={field} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field}</Text>
              <Text style={styles.fieldValue}>{serviceDetails?.[field] || 'Not added'}</Text>
            </View>
          ))}
        </SectionCard>

        <SectionCard title="KYC & Documents" icon="id-card" onAction={() => navigation.navigate('VendorKYC')} actionLabel="Manage">
          {svc.kyc?.submitted ? (
            <View style={styles.kycDone}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <Text style={styles.kycDoneText}>KYC Verified ✅</Text>
            </View>
          ) : (
            <Text style={styles.emptyInCard}>KYC not submitted yet</Text>
          )}
        </SectionCard>

        <SectionCard title="Recent Bookings" icon="calendar-check" onAction={() => navigation.navigate('VendorBookings')} actionLabel="View All">
          {(svc.bookings || []).length === 0 ? (
            <Text style={styles.emptyInCard}>No bookings yet</Text>
          ) : (
            (svc.bookings || []).slice(0, 2).map((b, i) => (
              <View key={b.id || i} style={styles.miniBooking}>
                <Text style={styles.miniBookingName}>{b.customerName}</Text>
                <Text style={styles.miniBookingDate}>{b.date} • {b.status}</Text>
              </View>
            ))
          )}
        </SectionCard>
      </ScrollView>

      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Service Details</Text>
                <Text style={styles.modalSub}>{category || 'Service'} • {vendor?.businessName || 'Vendor'}</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {fields.map(field => (
                <View key={field} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{field}</Text>
                  <TextInput
                    value={detailsDraft[field] || ''}
                    onChangeText={value => updateDraft(field, value)}
                    placeholder={`Enter ${field.toLowerCase()}`}
                    placeholderTextColor="#9AA9A3"
                    style={styles.detailInput}
                    multiline={field.toLowerCase().includes('notes') || field.toLowerCase().includes('types') || field.toLowerCase().includes('destinations')}
                  />
                </View>
              ))}

              <TouchableOpacity style={[styles.saveBtn, {backgroundColor: meta.color}]} onPress={saveDetails}>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Save Service Details</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function SectionCard({title, icon, children, onAction, actionLabel}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <View style={styles.sectionCardTitle}>
          <Ionicons name={
            icon === 'images' ? 'images-outline' :
            icon === 'tags' ? 'pricetags-outline' :
            icon === 'list-alt' ? 'list-outline' :
            icon === 'id-card' ? 'card-outline' :
            'calendar-outline'
          } size={18} color={COLORS.primary} />
          <Text style={styles.sectionCardTitleText}>{title}</Text>
        </View>
        {onAction && (
          <TouchableOpacity onPress={onAction} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.sectionCardAction}>{actionLabel} →</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center'},
  backBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14},
  headerTitle: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  headerSub: {color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2},
  statusChip: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1},
  vendorInfoCard: {flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border},
  vendorInfoName: {fontSize: 15, fontWeight: 'bold', color: COLORS.dark},
  vendorInfoSub: {fontSize: 12, color: COLORS.muted, marginTop: 2},
  serviceSelectorCard: {backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border},
  selectorTitle: {fontWeight: 'bold', color: COLORS.dark, fontSize: 13, marginBottom: 10},
  serviceChips: {flexDirection: 'row', flexWrap: 'wrap'},
  serviceChip: {minHeight: 36, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center'},
  serviceChipSpacing: {marginRight: 8, marginBottom: 8},
  serviceChipActive: {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
  serviceChipText: {color: COLORS.dark, fontWeight: 'bold', fontSize: 12},
  serviceChipTextActive: {color: '#fff'},
  tipBox: {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 10},
  tipText: {flex: 1, color: COLORS.muted, fontSize: 13, lineHeight: 19},
  sectionCard: {backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border},
  sectionCardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#DDEAE5'},
  sectionCardTitle: {flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1},
  sectionCardTitleText: {fontWeight: 'bold', color: COLORS.dark, fontSize: 15},
  sectionCardAction: {color: COLORS.primary, fontWeight: 'bold', fontSize: 13},
  emptyInCard: {color: COLORS.muted, fontSize: 13, fontStyle: 'italic'},
  photoRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  photoThumb: {width: 80, height: 70, borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
  photoThumbLabel: {color: COLORS.dark, fontSize: 9, marginTop: 4, textAlign: 'center'},
  pkgRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#DDEAE5'},
  pkgName: {fontWeight: 'bold', color: COLORS.dark, fontSize: 14},
  pkgIncludes: {color: COLORS.muted, fontSize: 11, marginTop: 2},
  pkgPrice: {fontWeight: 'bold', fontSize: 16},
  fieldRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#DDEAE5', gap: 12},
  fieldLabel: {color: COLORS.muted, fontSize: 13, flex: 0.8},
  fieldValue: {color: COLORS.dark, fontWeight: '600', fontSize: 13, flex: 1, textAlign: 'right'},
  kycDone: {flexDirection: 'row', alignItems: 'center', gap: 6},
  kycDoneText: {color: '#2E7D32', fontWeight: 'bold'},
  miniBooking: {paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#DDEAE5'},
  miniBookingName: {color: COLORS.dark, fontWeight: '600', fontSize: 13},
  miniBookingDate: {color: COLORS.muted, fontSize: 12, marginTop: 2},
  modalWrap: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)'},
  modalCard: {maxHeight: '88%', backgroundColor: COLORS.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden'},
  modalHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border},
  modalTitle: {fontSize: 18, fontWeight: 'bold', color: COLORS.dark},
  modalSub: {fontSize: 12, color: COLORS.muted, marginTop: 3},
  closeBtn: {width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF5F2', justifyContent: 'center', alignItems: 'center'},
  modalScroll: {padding: 16, paddingBottom: 40},
  inputGroup: {marginBottom: 12},
  inputLabel: {fontSize: 13, fontWeight: 'bold', color: COLORS.dark, marginBottom: 6},
  detailInput: {minHeight: 48, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.dark, textAlignVertical: 'top'},
  saveBtn: {marginTop: 8, height: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  saveBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 15},
});
