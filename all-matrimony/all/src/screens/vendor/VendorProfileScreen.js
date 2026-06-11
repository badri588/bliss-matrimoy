// import React, {useContext, useState} from 'react';
// import {
//   View, Text, StyleSheet, ScrollView,
//   TouchableOpacity, Alert, Image, Platform, Modal, TextInput,
// } from 'react-native';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
// import * as ImagePicker from 'expo-image-picker';
// import { CommonActions } from '@react-navigation/native';
// import {ProfileContext} from '../../context/ProfileContext';
// import COLORS from '../../constants/colors';
// import {VENDOR_SERVICE_CATEGORIES, VENDOR_SERVICE_ICONS} from '../../constants/vendorServices';

// const getVendorServices = vendor =>
//   Array.isArray(vendor?.services) && vendor.services.length
//     ? vendor.services
//     : vendor?.category
//     ? [vendor.category]
//     : [];

// const serviceToCategory = label =>
//   VENDOR_SERVICE_CATEGORIES.find(item => item.label === label) || {
//     id: label,
//     label,
//     icon: VENDOR_SERVICE_ICONS[label] || 'briefcase',
//   };

// export default function VendorProfileScreen({navigation}) {
//   const ctx    = useContext(ProfileContext);
//   const vendor = ctx?.currentVendor || {};
//   const svc    = ctx?.getVendorService?.(vendor.id) || {};
//   const kyc    = svc.kyc || {};
//   const vendorServices = getVendorServices(vendor);

//   const [avatar, setAvatar] = useState(vendor.avatar || null);
//   const [editVisible, setEditVisible] = useState(false);
//   const [editForm, setEditForm] = useState({
//     businessName: vendor.businessName || '',
//     ownerName: vendor.ownerName || '',
//     email: vendor.email || '',
//     city: vendor.city || '',
//     location: vendor.location || '',
//     description: vendor.description || '',
//     services: vendorServices,
//   });
//   const [servicesOpen, setServicesOpen] = useState(false);

//   const serviceStatus = svc.serviceStatus || 'Draft';
//   const statusCfg = {
//     Draft:           {color: '#FF9800', label: 'Setup Pending',          bg: '#FFF8E1'},
//     PendingApproval: {color: '#2196F3', label: 'Awaiting Admin Approval', bg: '#E3F2FD'},
//     Live:            {color: '#4CAF50', label: '🟢 Live & Active',        bg: '#E8F5E9'},
//     Rejected:        {color: '#F44336', label: 'Rejected',                bg: '#FFEBEE'},
//   }[serviceStatus] || {color: '#FF9800', label: 'Setup Pending', bg: '#FFF8E1'};

//   const pickAvatarFromGallery = async () => {
//     if (Platform.OS !== 'web') {
//       const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!p.granted) return;
//     }

//     const r = await ImagePicker.launchImageLibraryAsync({
//       quality: 0.8,
//       allowsEditing: Platform.OS !== 'web',
//       aspect: [1, 1],
//       mediaTypes: ['images'],
//     });

//     if (!r.canceled) {
//       setAvatar(r.assets[0].uri);
//       ctx?.setCurrentVendor?.({...vendor, avatar: r.assets[0].uri});
//     }
//   };

//   const pickAvatar = async () => {
//     if (Platform.OS === 'web') {
//       await pickAvatarFromGallery();
//       return;
//     }

//     Alert.alert('Profile Photo', 'Choose source', [
//       {text: '📷 Camera', onPress: async () => {
//         const p = await ImagePicker.requestCameraPermissionsAsync();
//         if (!p.granted) return;
//         const r = await ImagePicker.launchCameraAsync({quality: 0.8, allowsEditing: true, aspect: [1, 1]});
//         if (!r.canceled) {
//           setAvatar(r.assets[0].uri);
//           ctx?.setCurrentVendor?.({...vendor, avatar: r.assets[0].uri});
//         }
//       }},
//       {text: '🖼 Gallery', onPress: async () => {
//         const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (!p.granted) return;
//         const r = await ImagePicker.launchImageLibraryAsync({quality: 0.8, allowsEditing: true, aspect: [1, 1]});
//         if (!r.canceled) {
//           setAvatar(r.assets[0].uri);
//           ctx?.setCurrentVendor?.({...vendor, avatar: r.assets[0].uri});
//         }
//       }},
//       {text: 'Cancel', style: 'cancel'},
//     ]);
//   };

//   const handleLogout = () => {
//     Alert.alert('Logout Vendor', 'Do you want to logout from this vendor account?', [
//       {text: 'Cancel', style: 'cancel'},
//       {
//         text: 'Logout',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             ctx?.clearUserSession?.();
//             await ctx?.logoutVendor?.();

//             let rootNavigation = navigation;

//             while (rootNavigation?.getParent?.()) {
//               rootNavigation = rootNavigation.getParent();
//             }

//             if (rootNavigation?.replace) {
//               rootNavigation.replace('Login');
//               return;
//             }

//             rootNavigation.dispatch(
//               CommonActions.reset({
//                 index: 0,
//                 routes: [{name: 'Login'}],
//               }),
//             );
//           } catch (error) {
//             ctx?.clearUserSession?.();
//             navigation.dispatch(
//               CommonActions.reset({
//                 index: 0,
//                 routes: [{name: 'Login'}],
//               }),
//             );
//           }
//         },
//       },
//     ]);
//   };

//   const openEdit = () => {
//     setEditForm({
//       businessName: vendor.businessName || '',
//       ownerName: vendor.ownerName || '',
//       email: vendor.email || '',
//       city: vendor.city || '',
//       location: vendor.location || '',
//       description: vendor.description || '',
//       services: getVendorServices(vendor),
//     });
//     setServicesOpen(false);
//     setEditVisible(true);
//   };

//   const saveEdit = async () => {
//     const selectedServices = Array.isArray(editForm.services)
//       ? editForm.services.map(item => String(item || '').trim()).filter(Boolean)
//       : [];

//     if (selectedServices.length === 0) {
//       Alert.alert('Select Service', 'Please select at least one service before saving.');
//       return;
//     }

//     const result = await ctx?.updateVendorProfile?.(vendor.id, editForm);
//     setEditVisible(false);
//     Alert.alert(result?.success ? 'Profile Updated' : 'Update Failed', result?.message || 'Vendor profile updated.');
//   };

//   const toggleEditService = service => {
//     setEditForm(prev => {
//       const currentServices = Array.isArray(prev.services) ? prev.services : [];
//       const exists = currentServices.some(item => item === service.label);
//       return {
//         ...prev,
//         services: exists
//           ? currentServices.filter(item => item !== service.label)
//           : [...currentServices, service.label],
//       };
//     });
//   };

//   const totalBookings   = (svc.bookings || []).length;
//   const packages        = svc.packages || [];
//   const photos          = (svc.photos || []).filter(p => !p.isCover);
//   const coverPhoto      = (svc.photos || []).find(p => p.isCover);

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Profile</Text>
//         <TouchableOpacity style={styles.editBtn}
//           onPress={openEdit}>
//           <Ionicons name="pencil-outline" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>

//         {/* Avatar + Name */}
//         <View style={styles.avatarSection}>
//           <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar}>
//             {avatar
//               ? <Image source={{uri: avatar}} style={styles.avatar} />
//               : <View style={styles.avatarPlaceholder}>
//                   <FontAwesome5 name="store" size={36} color={COLORS.primary} />
//                 </View>}
//             <View style={styles.cameraIcon}>
//               <Ionicons name="camera" size={14} color="#fff" />
//             </View>
//           </TouchableOpacity>
//           <Text style={styles.businessName}>{vendor.businessName || 'Your Business'}</Text>
//           <Text style={styles.ownerName}>{vendor.ownerName || ''}</Text>
//           <View style={[styles.statusPill, {backgroundColor: statusCfg.bg, borderColor: statusCfg.color + '60'}]}>
//             <View style={[styles.statusDot, {backgroundColor: statusCfg.color}]} />
//             <Text style={[styles.statusPillText, {color: statusCfg.color}]}>{statusCfg.label}</Text>
//           </View>
//         </View>

//         {/* Stats */}
//         <View style={styles.statsRow}>
//           <StatItem value={totalBookings}     label="Bookings"  color="#7FA08A" />
//           <StatItem value={photos.length}     label="Photos"    color="#2196F3" />
//           <StatItem value={packages.length}   label="Packages"  color="#FF9800" />
//         </View>

//         {/* Business Info */}
//         <View style={styles.card}>
//           <CardTitle icon="briefcase" title="Business Details" />
//           <InfoRow label="Business Name"  value={vendor.businessName || '—'} />
//           <InfoRow label="Owner Name"     value={vendor.ownerName    || '—'} />
//           <InfoRow label="Mobile"         value={vendor.mobile       || '—'} />
//           <InfoRow label="Services"       value={vendorServices.length ? vendorServices.join(', ') : '—'} />
//           <InfoRow label="Registered On"  value={vendor.createdAt    || '—'} />
//         </View>

//         {/* KYC Status */}
//         <View style={styles.card}>
//           <CardTitle icon="card-outline" title="KYC & Verification" />
//           {kyc.submitted ? (
//             <>
//               <InfoRow label="Aadhaar Front" value={kyc.aadharFront ? 'Photo uploaded' : 'Missing'} />
//               <InfoRow label="Aadhaar Back"  value={kyc.aadharBack ? 'Photo uploaded' : 'Optional'} />
//               <InfoRow label="PAN Card"      value={kyc.panPhoto ? 'Photo uploaded' : 'Missing'} />
//               <InfoRow label="GST / Business Proof" value={kyc.gstPhoto ? 'Photo uploaded' : 'Optional'} />
//               <InfoRow label="Business Address" value={kyc.address || '—'} />
//               <InfoRow label="City" value={kyc.city || '—'} />
//               <InfoRow label="Pincode" value={kyc.pincode || '—'} />
//               <View style={styles.verifiedBadge}>
//                 <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
//                 <Text style={styles.verifiedText}>KYC Submitted</Text>
//               </View>
//             </>
//           ) : (
//             <TouchableOpacity style={styles.pendingKyc}
//               onPress={() => navigation.navigate('VendorKYC')}>
//               <Ionicons name="alert-circle-outline" size={18} color="#FF9800" />
//               <Text style={styles.pendingKycText}>KYC not submitted — Tap to complete</Text>
//               <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Service */}
//         <View style={styles.card}>
//           <CardTitle icon="briefcase-outline" title="My Service" />
//           {vendorServices.length ? (
//             vendorServices.map(serviceName => {
//               const service = serviceToCategory(serviceName);
//               return (
//                 <TouchableOpacity
//                   key={serviceName}
//                   style={styles.serviceRow}
//                   onPress={() => navigation.navigate('VendorServicePage', {category: serviceName})}>
//                   <View style={styles.serviceIcon}>
//                     <FontAwesome5
//                       name={service.icon}
//                       size={22} color={COLORS.primary} />
//                   </View>
//                   <View style={{flex: 1}}>
//                     <Text style={styles.serviceName}>{serviceName}</Text>
//                     <Text style={styles.serviceSub}>
//                       {serviceStatus === 'Live' ? 'Visible to customers' : `Status: ${statusCfg.label}`}
//                     </Text>
//                   </View>
//                   <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
//                 </TouchableOpacity>
//               );
//             })
//           ) : (
//             <Text style={styles.emptyServiceText}>No services selected yet.</Text>
//           )}
//         </View>

//         {/* Bank Details */}
//         {(kyc.bankName || kyc.accountNo || kyc.ifsc) && (
//           <View style={styles.card}>
//             <CardTitle icon="business-outline" title="Bank Details" />
//             <InfoRow label="Bank Name"  value={kyc.bankName  || '—'} />
//             <InfoRow label="Account No" value={kyc.accountNo ? '••••' + kyc.accountNo.slice(-4) : '—'} />
//             <InfoRow label="IFSC"       value={kyc.ifsc      || '—'} />
//           </View>
//         )}

//         {/* Actions */}
//         <View style={styles.actionsCard}>
//           <ActionRow icon="id-card-outline"    label="Update KYC Documents"
//             onPress={() => navigation.navigate('VendorKYC')} />
//           <ActionRow icon="images-outline"     label="Manage Photos"
//             onPress={() => navigation.navigate('VendorPhotos')} />
//           <ActionRow icon="pricetags-outline"  label="Manage Packages"
//             onPress={() => navigation.navigate('VendorPackages')} />
//           <ActionRow icon="calendar-outline"   label="View Bookings"
//             onPress={() => navigation.navigate('VendorBookings')} />
//           <ActionRow icon="headset-outline"    label="Contact Support"
//             onPress={() => Alert.alert('Support', 'Email: support@gracematrimony.com')} />
//           <ActionRow icon="log-out-outline"    label="Logout"
//             danger onPress={handleLogout} />
//         </View>

//       </ScrollView>

//       <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Edit Profile</Text>
//               <TouchableOpacity onPress={() => setEditVisible(false)}>
//                 <Ionicons name="close" size={24} color={COLORS.dark} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView keyboardShouldPersistTaps="handled">
//               {[
//                 ['businessName', 'Business Name'],
//                 ['ownerName', 'Owner Name'],
//                 ['email', 'Email'],
//                 ['city', 'City'],
//                 ['location', 'Location'],
//                 ['description', 'Description'],
//               ].map(([key, label]) => (
//                 <View key={key} style={styles.inputGroup}>
//                   <Text style={styles.inputLabel}>{label}</Text>
//                   <TextInput
//                     value={editForm[key]}
//                     onChangeText={(value) => setEditForm((prev) => ({...prev, [key]: value}))}
//                     style={[styles.input, key === 'description' && styles.textArea]}
//                     multiline={key === 'description'}
//                     placeholder={`Enter ${label.toLowerCase()}`}
//                     placeholderTextColor="#9AA9A3"
//                   />
//                 </View>
//               ))}
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Services</Text>
//                 <TouchableOpacity
//                   style={[styles.dropdown, servicesOpen && styles.dropdownOpen]}
//                   onPress={() => setServicesOpen(prev => !prev)}
//                   activeOpacity={0.85}>
//                   <View style={styles.dropdownTextWrap}>
//                     <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
//                     <Text
//                       style={editForm.services?.length ? styles.dropdownSelected : styles.dropdownPlaceholder}
//                       numberOfLines={1}>
//                       {editForm.services?.length ? editForm.services.join(', ') : 'Select services'}
//                     </Text>
//                   </View>
//                   <Ionicons name={servicesOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.gray} />
//                 </TouchableOpacity>

//                 {Array.isArray(editForm.services) && editForm.services.length > 0 && (
//                   <View style={styles.selectedChips}>
//                     {editForm.services.map(serviceName => {
//                       const service = serviceToCategory(serviceName);
//                       return (
//                         <TouchableOpacity
//                           key={serviceName}
//                           style={styles.selectedChip}
//                           onPress={() => toggleEditService(service)}
//                           activeOpacity={0.85}>
//                           <FontAwesome5 name={service.icon} size={11} color={COLORS.primary} />
//                           <Text style={styles.selectedChipText}>{serviceName}</Text>
//                           <Ionicons name="close" size={14} color={COLORS.primary} />
//                         </TouchableOpacity>
//                       );
//                     })}
//                   </View>
//                 )}

//                 {servicesOpen && (
//                   <View style={styles.optionBox}>
//                     <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
//                       {VENDOR_SERVICE_CATEGORIES.map(service => {
//                         const checked = editForm.services?.includes(service.label);
//                         return (
//                           <TouchableOpacity
//                             key={service.id}
//                             style={[styles.optionItem, checked && styles.optionItemActive]}
//                             onPress={() => toggleEditService(service)}
//                             activeOpacity={0.85}>
//                             <View style={styles.optionLeft}>
//                               <FontAwesome5
//                                 name={service.icon}
//                                 size={14}
//                                 color={checked ? COLORS.primary : COLORS.gray}
//                                 style={{width: 22}}
//                               />
//                               <Text style={[styles.optionText, checked && styles.optionTextActive]}>
//                                 {service.label}
//                               </Text>
//                             </View>
//                             <View style={[styles.checkbox, checked && styles.checkboxActive]}>
//                               {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
//                             </View>
//                           </TouchableOpacity>
//                         );
//                       })}
//                     </ScrollView>
//                   </View>
//                 )}
//               </View>
//               <TouchableOpacity style={styles.modalSaveBtn} onPress={saveEdit}>
//                 <Text style={styles.modalSaveText}>Save Profile</Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// function StatItem({value, label, color}) {
//   return (
//     <View style={styles.statItem}>
//       <Text style={[styles.statValue, {color}]}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </View>
//   );
// }
// function CardTitle({icon, title}) {
//   return (
//     <View style={styles.cardTitle}>
//       <Ionicons name={icon} size={18} color={COLORS.primary} />
//       <Text style={styles.cardTitleText}>{title}</Text>
//     </View>
//   );
// }
// function InfoRow({label, value}) {
//   return (
//     <View style={styles.infoRow}>
//       <Text style={styles.infoLabel}>{label}</Text>
//       <Text style={styles.infoValue}>{value}</Text>
//     </View>
//   );
// }
// function ActionRow({icon, label, onPress, danger}) {
//   return (
//     <TouchableOpacity style={styles.actionRow} onPress={onPress}>
//       <View style={[styles.actionIcon, danger && {backgroundColor: '#FFEBEE'}]}>
//         <Ionicons name={icon} size={20} color={danger ? '#F44336' : COLORS.primary} />
//       </View>
//       <Text style={[styles.actionLabel, danger && {color: '#F44336'}]}>{label}</Text>
//       <Ionicons name="chevron-forward" size={16} color={danger ? '#F44336' : COLORS.gray} />
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   container:        {flex: 1, backgroundColor: COLORS.background},
//   header:           {backgroundColor: COLORS.dark, paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center'},
//   backBtn:          {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center'},
//   headerTitle:      {flex: 1, color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center'},
//   editBtn:          {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center'},
//   avatarSection:    {alignItems: 'center', paddingVertical: 24},
//   avatarWrap:       {position: 'relative', marginBottom: 12},
//   avatar:           {width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff'},
//   avatarPlaceholder:{width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.border},
//   cameraIcon:       {position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff'},
//   businessName:     {fontSize: 22, fontWeight: 'bold', color: COLORS.dark},
//   ownerName:        {color: COLORS.muted, marginTop: 4},
//   statusPill:       {flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 10, borderWidth: 1, gap: 6},
//   statusDot:        {width: 8, height: 8, borderRadius: 4},
//   statusPillText:   {fontWeight: 'bold', fontSize: 12},
//   statsRow:         {flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border},
//   statItem:         {flex: 1, alignItems: 'center'},
//   statValue:        {fontSize: 24, fontWeight: 'bold'},
//   statLabel:        {color: COLORS.muted, fontSize: 12, marginTop: 2},
//   card:             {backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border},
//   cardTitle:        {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#DDEAE5'},
//   cardTitleText:    {fontWeight: 'bold', color: COLORS.dark, fontSize: 15},
//   infoRow:          {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F4F8F6'},
//   infoLabel:        {color: COLORS.muted, fontSize: 13},
//   infoValue:        {color: COLORS.dark, fontWeight: '600', fontSize: 13, maxWidth: '55%', textAlign: 'right'},
//   verifiedBadge:    {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#E8F5E9', padding: 8, borderRadius: 10},
//   verifiedText:     {color: '#2E7D32', fontWeight: 'bold', fontSize: 13},
//   pendingKyc:       {flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF8E1', padding: 12, borderRadius: 12},
//   pendingKycText:   {flex: 1, color: '#F57C00', fontWeight: '600', fontSize: 13},
//   serviceRow:       {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8},
//   serviceIcon:      {width: 50, height: 50, borderRadius: 14, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
//   serviceName:      {fontWeight: 'bold', color: COLORS.dark, fontSize: 15},
//   serviceSub:       {color: COLORS.muted, fontSize: 12, marginTop: 2},
//   emptyServiceText:  {color: COLORS.muted, fontWeight: '600', fontSize: 13},
//   actionsCard:      {backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border},
//   actionRow:        {flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F4F8F6', gap: 12},
//   actionIcon:       {width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center'},
//   actionLabel:      {flex: 1, color: COLORS.dark, fontWeight: '600', fontSize: 14},
//   modalOverlay:     {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'},
//   modalCard:        {maxHeight: '85%', backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20},
//   modalHeader:      {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14},
//   modalTitle:       {fontSize: 18, fontWeight: 'bold', color: COLORS.dark},
//   inputGroup:       {marginBottom: 12},
//   inputLabel:       {fontWeight: 'bold', color: COLORS.dark, marginBottom: 6, fontSize: 13},
//   input:            {minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, color: COLORS.dark, backgroundColor: COLORS.background},
//   textArea:         {minHeight: 90, paddingTop: 10, textAlignVertical: 'top'},
//   dropdown:         {minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
//   dropdownOpen:     {borderColor: COLORS.primary},
//   dropdownTextWrap: {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8},
//   dropdownSelected: {flex: 1, color: COLORS.dark, fontWeight: '700', fontSize: 13},
//   dropdownPlaceholder: {flex: 1, color: '#9AA9A3', fontWeight: '600', fontSize: 13},
//   optionBox:        {backgroundColor: COLORS.background, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginTop: 8, maxHeight: 260, overflow: 'hidden'},
//   optionItem:       {padding: 13, borderBottomWidth: 1, borderBottomColor: '#DDEAE5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
//   optionItemActive: {backgroundColor: '#E8F5E9'},
//   optionLeft:       {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8},
//   optionText:       {flex: 1, color: COLORS.dark, fontWeight: '700', fontSize: 13},
//   optionTextActive: {color: COLORS.primary},
//   checkbox:         {width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'},
//   checkboxActive:   {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
//   selectedChips:    {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10},
//   selectedChip:     {flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, borderWidth: 1, borderColor: '#B7D7C0', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 7},
//   selectedChipText: {color: COLORS.primary, fontWeight: 'bold', fontSize: 12},
//   modalSaveBtn:     {height: 52, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 20},
//   modalSaveText:    {color: '#fff', fontWeight: 'bold', fontSize: 16},
// });







import React, {useContext, useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image, Platform, Modal, TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';
import {VENDOR_SERVICE_CATEGORIES, VENDOR_SERVICE_ICONS} from '../../constants/vendorServices';

const getVendorServices = vendor =>
  Array.isArray(vendor?.services) && vendor.services.length
    ? vendor.services
    : vendor?.category
    ? [vendor.category]
    : [];

const serviceToCategory = label =>
  VENDOR_SERVICE_CATEGORIES.find(item => item.label === label) || {
    id: label,
    label,
    icon: VENDOR_SERVICE_ICONS[label] || 'briefcase',
  };

export default function VendorProfileScreen({navigation}) {
  const ctx    = useContext(ProfileContext);
  const vendor = ctx?.currentVendor || {};
  const svc    = ctx?.getVendorService?.(vendor.id) || {};
  const kyc    = svc.kyc || {};
  const vendorServices = getVendorServices(vendor);

  const [avatar, setAvatar] = useState(vendor.avatar || vendor.imageName || null);
  const [editVisible, setEditVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: vendor.businessName || '',
    ownerName: vendor.ownerName || '',
    email: vendor.email || '',
    city: vendor.city || '',
    location: vendor.location || '',
    description: vendor.description || '',
    services: vendorServices,
  });
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    setAvatar(vendor.avatar || vendor.imageName || null);
  }, [vendor.avatar, vendor.imageName]);

  const serviceStatus = svc.serviceStatus || 'Draft';
  const statusCfg = {
    Draft:           {color: '#FF9800', label: 'Setup Pending',          bg: '#FFF8E1'},
    PendingApproval: {color: '#2196F3', label: 'Awaiting Admin Approval', bg: '#E3F2FD'},
    Live:            {color: '#4CAF50', label: '🟢 Live & Active',        bg: '#E8F5E9'},
    Rejected:        {color: '#F44336', label: 'Rejected',                bg: '#FFEBEE'},
  }[serviceStatus] || {color: '#FF9800', label: 'Setup Pending', bg: '#FFF8E1'};

  const pickAvatarFromGallery = async () => {
    if (Platform.OS !== 'web') {
      const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!p.granted) return;
    }

    const r = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: Platform.OS !== 'web',
      aspect: [1, 1],
      mediaTypes: ['images'],
    });

    if (!r.canceled) {
      const uploadedAvatar = await ctx?.uploadVendorAsset?.(r.assets[0].uri, 'vendor-avatar');
      const nextAvatar = uploadedAvatar || r.assets[0].uri;
      setAvatar(nextAvatar);
      await ctx?.updateVendorProfile?.(vendor.id, {
        ...editForm,
        imageName: nextAvatar,
      });
    }
  };

  const pickAvatar = async () => {
    if (Platform.OS === 'web') {
      await pickAvatarFromGallery();
      return;
    }

    Alert.alert('Profile Photo', 'Choose source', [
      {text: '📷 Camera', onPress: async () => {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) return;
        const r = await ImagePicker.launchCameraAsync({quality: 0.8, allowsEditing: true, aspect: [1, 1]});
        if (!r.canceled) {
          const uploadedAvatar = await ctx?.uploadVendorAsset?.(r.assets[0].uri, 'vendor-avatar');
          const nextAvatar = uploadedAvatar || r.assets[0].uri;
          setAvatar(nextAvatar);
          await ctx?.updateVendorProfile?.(vendor.id, {
            ...editForm,
            imageName: nextAvatar,
          });
        }
      }},
      {text: '🖼 Gallery', onPress: async () => {
        const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!p.granted) return;
        const r = await ImagePicker.launchImageLibraryAsync({quality: 0.8, allowsEditing: true, aspect: [1, 1]});
        if (!r.canceled) {
          const uploadedAvatar = await ctx?.uploadVendorAsset?.(r.assets[0].uri, 'vendor-avatar');
          const nextAvatar = uploadedAvatar || r.assets[0].uri;
          setAvatar(nextAvatar);
          await ctx?.updateVendorProfile?.(vendor.id, {
            ...editForm,
            imageName: nextAvatar,
          });
        }
      }},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const handleLogout = async () => {
    try {
      ctx?.clearUserSession?.();
      await ctx?.logoutVendor?.();

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Login'}],
        }),
      );
    } catch (error) {
      ctx?.clearUserSession?.();

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Login'}],
        }),
      );
    }
  };

  const openEdit = () => {
    setEditForm({
      businessName: vendor.businessName || '',
      ownerName: vendor.ownerName || '',
      email: vendor.email || '',
      city: vendor.city || '',
      location: vendor.location || '',
      description: vendor.description || '',
      services: getVendorServices(vendor),
    });
    setServicesOpen(false);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    const selectedServices = Array.isArray(editForm.services)
      ? editForm.services.map(item => String(item || '').trim()).filter(Boolean)
      : [];

    if (selectedServices.length === 0) {
      Alert.alert('Select Service', 'Please select at least one service before saving.');
      return;
    }

    const result = await ctx?.updateVendorProfile?.(vendor.id, editForm);
    setEditVisible(false);
    Alert.alert(result?.success ? 'Profile Updated' : 'Update Failed', result?.message || 'Vendor profile updated.');
  };

  const toggleEditService = service => {
    setEditForm(prev => {
      const currentServices = Array.isArray(prev.services) ? prev.services : [];
      const exists = currentServices.some(item => item === service.label);
      return {
        ...prev,
        services: exists
          ? currentServices.filter(item => item !== service.label)
          : [...currentServices, service.label],
      };
    });
  };

  const serviceProfiles = Object.values(svc.serviceProfiles || {});
  const totalBookings   = (svc.bookings || []).length;
  const packages        = svc.packages && svc.packages.length
    ? svc.packages
    : serviceProfiles.flatMap(profile => Array.isArray(profile?.packages) ? profile.packages : []);
  const photos          = (svc.photos && svc.photos.length
    ? svc.photos
    : serviceProfiles.flatMap(profile => Array.isArray(profile?.photos) ? profile.photos : [])
  ).filter(p => !p.isCover);
  const coverPhoto      = (svc.photos && svc.photos.length
    ? svc.photos
    : serviceProfiles.flatMap(profile => Array.isArray(profile?.photos) ? profile.photos : [])
  ).find(p => p.isCover);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.editBtn}
          onPress={openEdit}>
          <Ionicons name="pencil-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>

        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar}>
            {avatar
              ? <Image source={{uri: avatar}} style={styles.avatar} />
              : <View style={styles.avatarPlaceholder}>
                  <FontAwesome5 name="store" size={36} color={COLORS.primary} />
                </View>}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.businessName}>{vendor.businessName || 'Your Business'}</Text>
          <Text style={styles.ownerName}>{vendor.ownerName || ''}</Text>
          <View style={[styles.statusPill, {backgroundColor: statusCfg.bg, borderColor: statusCfg.color + '60'}]}>
            <View style={[styles.statusDot, {backgroundColor: statusCfg.color}]} />
            <Text style={[styles.statusPillText, {color: statusCfg.color}]}>{statusCfg.label}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatItem value={totalBookings}     label="Bookings"  color="#7FA08A" />
          <StatItem value={photos.length}     label="Photos"    color="#2196F3" />
          <StatItem value={packages.length}   label="Packages"  color="#FF9800" />
        </View>

        {/* Business Info */}
        <View style={styles.card}>
          <CardTitle icon="briefcase" title="Business Details" />
          <InfoRow label="Business Name"  value={vendor.businessName || '—'} />
          <InfoRow label="Owner Name"     value={vendor.ownerName    || '—'} />
          <InfoRow label="Mobile"         value={vendor.mobile       || '—'} />
          <InfoRow label="Services"       value={vendorServices.length ? vendorServices.join(', ') : '—'} />
          <InfoRow label="Registered On"  value={vendor.createdAt    || '—'} />
        </View>

        {/* KYC Status */}
        <View style={styles.card}>
          <CardTitle icon="card-outline" title="KYC & Verification" />
          {kyc.submitted ? (
            <>
              <InfoRow label="Aadhaar Front" value={kyc.aadharFront ? 'Photo uploaded' : 'Missing'} />
              <InfoRow label="Aadhaar Back"  value={kyc.aadharBack ? 'Photo uploaded' : 'Optional'} />
              <InfoRow label="PAN Card"      value={kyc.panPhoto ? 'Photo uploaded' : 'Missing'} />
              <InfoRow label="GST / Business Proof" value={kyc.gstPhoto ? 'Photo uploaded' : 'Optional'} />
              <InfoRow label="Business Address" value={kyc.address || '—'} />
              <InfoRow label="City" value={kyc.city || '—'} />
              <InfoRow label="Pincode" value={kyc.pincode || '—'} />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                <Text style={styles.verifiedText}>KYC Submitted</Text>
              </View>
            </>
          ) : (
            <TouchableOpacity style={styles.pendingKyc}
              onPress={() => navigation.navigate('VendorKYC')}>
              <Ionicons name="alert-circle-outline" size={18} color="#FF9800" />
              <Text style={styles.pendingKycText}>KYC not submitted — Tap to complete</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Service */}
        <View style={styles.card}>
          <CardTitle icon="briefcase-outline" title="My Service" />
          {vendorServices.length ? (
            vendorServices.map(serviceName => {
              const service = serviceToCategory(serviceName);
              return (
                <TouchableOpacity
                  key={serviceName}
                  style={styles.serviceRow}
                  onPress={() => navigation.navigate('VendorServicePage', {category: serviceName})}>
                  <View style={styles.serviceIcon}>
                    <FontAwesome5
                      name={service.icon}
                      size={22} color={COLORS.primary} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.serviceName}>{serviceName}</Text>
                    <Text style={styles.serviceSub}>
                      {serviceStatus === 'Live' ? 'Visible to customers' : `Status: ${statusCfg.label}`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyServiceText}>No services selected yet.</Text>
          )}
        </View>

        {/* Bank Details */}
        {(kyc.bankName || kyc.accountNo || kyc.ifsc) && (
          <View style={styles.card}>
            <CardTitle icon="business-outline" title="Bank Details" />
            <InfoRow label="Bank Name"  value={kyc.bankName  || '—'} />
            <InfoRow label="Account No" value={kyc.accountNo ? '••••' + kyc.accountNo.slice(-4) : '—'} />
            <InfoRow label="IFSC"       value={kyc.ifsc      || '—'} />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsCard}>
          <ActionRow icon="id-card-outline"    label="Update KYC Documents"
            onPress={() => navigation.navigate('VendorKYC')} />
          <ActionRow icon="images-outline"     label="Manage Photos"
            onPress={() => navigation.navigate('VendorPhotos', {category: vendorServices[0] || vendor.category})} />
          <ActionRow icon="pricetags-outline"  label="Manage Packages"
            onPress={() => navigation.navigate('VendorPackages', {category: vendorServices[0] || vendor.category})} />
          <ActionRow icon="calendar-outline"   label="View Bookings"
            onPress={() => navigation.navigate('VendorBookings')} />
          <ActionRow icon="headset-outline"    label="Contact Support"
            onPress={() => Alert.alert('Support', 'Email: support@gracematrimony.com')} />
          <ActionRow icon="log-out-outline"    label="Logout"
            danger onPress={handleLogout} />
        </View>

      </ScrollView>

      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {[
                ['businessName', 'Business Name'],
                ['ownerName', 'Owner Name'],
                ['email', 'Email'],
                ['city', 'City'],
                ['location', 'Location'],
                ['description', 'Description'],
              ].map(([key, label]) => (
                <View key={key} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{label}</Text>
                  <TextInput
                    value={editForm[key]}
                    onChangeText={(value) => setEditForm((prev) => ({...prev, [key]: value}))}
                    style={[styles.input, key === 'description' && styles.textArea]}
                    multiline={key === 'description'}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#9AA9A3"
                  />
                </View>
              ))}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Services</Text>
                <TouchableOpacity
                  style={[styles.dropdown, servicesOpen && styles.dropdownOpen]}
                  onPress={() => setServicesOpen(prev => !prev)}
                  activeOpacity={0.85}>
                  <View style={styles.dropdownTextWrap}>
                    <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
                    <Text
                      style={editForm.services?.length ? styles.dropdownSelected : styles.dropdownPlaceholder}
                      numberOfLines={1}>
                      {editForm.services?.length ? editForm.services.join(', ') : 'Select services'}
                    </Text>
                  </View>
                  <Ionicons name={servicesOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.gray} />
                </TouchableOpacity>

                {Array.isArray(editForm.services) && editForm.services.length > 0 && (
                  <View style={styles.selectedChips}>
                    {editForm.services.map(serviceName => {
                      const service = serviceToCategory(serviceName);
                      return (
                        <TouchableOpacity
                          key={serviceName}
                          style={styles.selectedChip}
                          onPress={() => toggleEditService(service)}
                          activeOpacity={0.85}>
                          <FontAwesome5 name={service.icon} size={11} color={COLORS.primary} />
                          <Text style={styles.selectedChipText}>{serviceName}</Text>
                          <Ionicons name="close" size={14} color={COLORS.primary} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {servicesOpen && (
                  <View style={styles.optionBox}>
                    <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                      {VENDOR_SERVICE_CATEGORIES.map(service => {
                        const checked = editForm.services?.includes(service.label);
                        return (
                          <TouchableOpacity
                            key={service.id}
                            style={[styles.optionItem, checked && styles.optionItemActive]}
                            onPress={() => toggleEditService(service)}
                            activeOpacity={0.85}>
                            <View style={styles.optionLeft}>
                              <FontAwesome5
                                name={service.icon}
                                size={14}
                                color={checked ? COLORS.primary : COLORS.gray}
                                style={{width: 22}}
                              />
                              <Text style={[styles.optionText, checked && styles.optionTextActive]}>
                                {service.label}
                              </Text>
                            </View>
                            <View style={[styles.checkbox, checked && styles.checkboxActive]}>
                              {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveEdit}>
                <Text style={styles.modalSaveText}>Save Profile</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatItem({value, label, color}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CardTitle({icon, title}) {
  return (
    <View style={styles.cardTitle}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.cardTitleText}>{title}</Text>
    </View>
  );
}

function InfoRow({label, value}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionRow({icon, label, onPress, danger}) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress}>
      <View style={[styles.actionIcon, danger && {backgroundColor: '#FFEBEE'}]}>
        <Ionicons name={icon} size={20} color={danger ? '#F44336' : COLORS.primary} />
      </View>
      <Text style={[styles.actionLabel, danger && {color: '#F44336'}]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={danger ? '#F44336' : COLORS.gray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:        {flex: 1, backgroundColor: COLORS.background},
  header:           {backgroundColor: COLORS.dark, paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center'},
  backBtn:          {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center'},
  headerTitle:      {flex: 1, color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center'},
  editBtn:          {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center'},
  avatarSection:    {alignItems: 'center', paddingVertical: 24},
  avatarWrap:       {position: 'relative', marginBottom: 12},
  avatar:           {width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff'},
  avatarPlaceholder:{width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.border},
  cameraIcon:       {position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff'},
  businessName:     {fontSize: 22, fontWeight: 'bold', color: COLORS.dark},
  ownerName:        {color: COLORS.muted, marginTop: 4},
  statusPill:       {flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 10, borderWidth: 1, gap: 6},
  statusDot:        {width: 8, height: 8, borderRadius: 4},
  statusPillText:   {fontWeight: 'bold', fontSize: 12},
  statsRow:         {flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border},
  statItem:         {flex: 1, alignItems: 'center'},
  statValue:        {fontSize: 24, fontWeight: 'bold'},
  statLabel:        {color: COLORS.muted, fontSize: 12, marginTop: 2},
  card:             {backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border},
  cardTitle:        {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#DDEAE5'},
  cardTitleText:    {fontWeight: 'bold', color: COLORS.dark, fontSize: 15},
  infoRow:          {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F4F8F6'},
  infoLabel:        {color: COLORS.muted, fontSize: 13},
  infoValue:        {color: COLORS.dark, fontWeight: '600', fontSize: 13, maxWidth: '55%', textAlign: 'right'},
  verifiedBadge:    {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#E8F5E9', padding: 8, borderRadius: 10},
  verifiedText:     {color: '#2E7D32', fontWeight: 'bold', fontSize: 13},
  pendingKyc:       {flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF8E1', padding: 12, borderRadius: 12},
  pendingKycText:   {flex: 1, color: '#F57C00', fontWeight: '600', fontSize: 13},
  serviceRow:       {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8},
  serviceIcon:      {width: 50, height: 50, borderRadius: 14, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
  serviceName:      {fontWeight: 'bold', color: COLORS.dark, fontSize: 15},
  serviceSub:       {color: COLORS.muted, fontSize: 12, marginTop: 2},
  emptyServiceText:  {color: COLORS.muted, fontWeight: '600', fontSize: 13},
  actionsCard:      {backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border},
  actionRow:        {flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F4F8F6', gap: 12},
  actionIcon:       {width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center'},
  actionLabel:      {flex: 1, color: COLORS.dark, fontWeight: '600', fontSize: 14},
  modalOverlay:     {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'},
  modalCard:        {maxHeight: '85%', backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20},
  modalHeader:      {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14},
  modalTitle:       {fontSize: 18, fontWeight: 'bold', color: COLORS.dark},
  inputGroup:       {marginBottom: 12},
  inputLabel:       {fontWeight: 'bold', color: COLORS.dark, marginBottom: 6, fontSize: 13},
  input:            {minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, color: COLORS.dark, backgroundColor: COLORS.background},
  textArea:         {minHeight: 90, paddingTop: 10, textAlignVertical: 'top'},
  dropdown:         {minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
  dropdownOpen:     {borderColor: COLORS.primary},
  dropdownTextWrap: {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8},
  dropdownSelected: {flex: 1, color: COLORS.dark, fontWeight: '700', fontSize: 13},
  dropdownPlaceholder: {flex: 1, color: '#9AA9A3', fontWeight: '600', fontSize: 13},
  optionBox:        {backgroundColor: COLORS.background, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginTop: 8, maxHeight: 260, overflow: 'hidden'},
  optionItem:       {padding: 13, borderBottomWidth: 1, borderBottomColor: '#DDEAE5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
  optionItemActive: {backgroundColor: '#E8F5E9'},
  optionLeft:       {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8},
  optionText:       {flex: 1, color: COLORS.dark, fontWeight: '700', fontSize: 13},
  optionTextActive: {color: COLORS.primary},
  checkbox:         {width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'},
  checkboxActive:   {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
  selectedChips:    {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10},
  selectedChip:     {flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, borderWidth: 1, borderColor: '#B7D7C0', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 7},
  selectedChipText: {color: COLORS.primary, fontWeight: 'bold', fontSize: 12},
  modalSaveBtn:     {height: 52, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 20},
  modalSaveText:    {color: '#fff', fontWeight: 'bold', fontSize: 16},
});
