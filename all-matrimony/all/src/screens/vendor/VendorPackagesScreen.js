import React, {useContext, useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, KeyboardAvoidingView, Platform} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';

export default function VendorPackagesScreen({navigation, route}) {
  const ctx = useContext(ProfileContext);
  const vendor = ctx?.currentVendor || {};
  const svc = ctx?.getVendorService?.(vendor.id) || {};
  const vendorServices = Array.isArray(vendor.services) && vendor.services.length
    ? vendor.services
    : vendor.category
      ? [vendor.category]
      : [];
  const initialService =
    (route?.params?.category && vendorServices.includes(route.params.category) && route.params.category) ||
    vendorServices[0] ||
    '';
  const [selectedService, setSelectedService] = useState(initialService);
  const selectedProfile = ctx?.getVendorServiceProfile?.(vendor.id, selectedService) || {};
  const [packages, setPackages] = useState(selectedProfile.packages || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({name: '', price: '', duration: '', includes: '', description: ''});
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const nextProfile = ctx?.getVendorServiceProfile?.(vendor.id, selectedService) || {};
    setPackages(nextProfile.packages || []);
    setStatusMessage('');
  }, [ctx, vendor.id, selectedService, svc]);

  const openAdd = () => {
    setEditIndex(null);
    setForm({name: '', price: '', duration: '', includes: '', description: ''});
    setModalVisible(true);
  };

  const openEdit = (idx) => {
    setEditIndex(idx);
    setForm({...packages[idx]});
    setModalVisible(true);
  };

  const handleSavePackage = () => {
    if (!form.name || !form.price) {
      Alert.alert('Required', 'Package name and price are required');
      return;
    }
    let updated;
    if (editIndex !== null) {
      updated = packages.map((p, i) => i === editIndex ? {...form} : p);
      setStatusMessage(`${form.name} package updated.`);
    } else {
      updated = [...packages, {...form, id: Date.now()}];
      setStatusMessage(`${form.name} package added.`);
    }
    setPackages(updated);
    setModalVisible(false);
  };

  const handleDelete = (idx) => {
    Alert.alert('Delete', 'Remove this package?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => {
        setPackages(prev => prev.filter((_, i) => i !== idx));
      }},
    ]);
  };

  const handleSaveAll = () => {
    if (packages.length === 0) {
      Alert.alert('Required', 'Add at least one package');
      return;
    }
    ctx?.updateVendorPackages?.(vendor.id, packages, {serviceCategory: selectedService});
    Alert.alert('Packages Saved', 'Next add service details, then submit for admin approval.', [
      {text: 'OK', onPress: () => navigation.replace('VendorServicePage', {category: selectedService, openEditor: true})},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>Packages & Pricing</Text>
          <Text style={styles.headerSub}>Set your service packages and costs</Text>
        </View>
        <TouchableOpacity style={styles.addHeaderBtn} onPress={openAdd}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom: 120}}>
        {!!statusMessage && (
          <View style={styles.statusBox}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#2E7D32" />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {vendorServices.length > 1 && (
          <View style={styles.serviceCard}>
            <Text style={styles.serviceLabel}>Select Service</Text>
            <View style={styles.serviceChips}>
              {vendorServices.map(serviceName => {
                const active = selectedService === serviceName;
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

        {packages.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="pricetags-outline" size={50} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No packages yet</Text>
            <Text style={styles.emptySub}>Add packages with pricing for {selectedService || 'this service'}.</Text>
            <TouchableOpacity style={styles.addFirstBtn} onPress={openAdd}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addFirstBtnText}>Add First Package</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.packagesList}>
            {packages.map((pkg, idx) => (
              <View key={idx} style={styles.packageCard}>
                <View style={styles.pkgHeader}>
                  <Text style={styles.pkgName}>{pkg.name}</Text>
                  <View style={styles.pkgActions}>
                    <TouchableOpacity style={styles.pkgActionBtn} onPress={() => openEdit(idx)}>
                      <Ionicons name="pencil" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.pkgActionBtn, {backgroundColor: '#FFEBEE'}]} onPress={() => handleDelete(idx)}>
                      <Ionicons name="trash" size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.pkgPrice}>₹ {pkg.price}</Text>
                {pkg.duration ? <Text style={styles.pkgDetail}>⏱ Duration: {pkg.duration}</Text> : null}
                {pkg.includes ? <Text style={styles.pkgDetail}>✅ Includes: {pkg.includes}</Text> : null}
                {pkg.description ? <Text style={styles.pkgDesc}>{pkg.description}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {packages.length > 0 && (
          <TouchableOpacity style={styles.saveAllBtn} onPress={handleSaveAll}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveAllText}>Save All Packages</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalBox}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalHeader}>
              <View style={{flex: 1}}>
                <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit Package' : 'Add Package'}</Text>
                <Text style={styles.modalSub}>{selectedService || 'Selected service'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom: 80}}>
              <MLabel text="Package Name *" />
              <MField value={form.name} onChangeText={v => setForm(f => ({...f, name: v}))} placeholder="e.g. Basic, Premium, Deluxe" />
              <MLabel text="Price (₹) *" />
              <MField value={form.price} onChangeText={v => setForm(f => ({...f, price: v}))} placeholder="e.g. 25000" keyboardType="numeric" />
              <MLabel text="Duration / Coverage" />
              <MField value={form.duration} onChangeText={v => setForm(f => ({...f, duration: v}))} placeholder="e.g. 4 hours, Full day" />
              <MLabel text="What's Included" />
              <MField value={form.includes} onChangeText={v => setForm(f => ({...f, includes: v}))} placeholder="e.g. 200 edited photos, 1 album" />
              <MLabel text="Description" />
              <TextInput
                value={form.description} onChangeText={v => setForm(f => ({...f, description: v}))}
                placeholder="Short description of this package"
                placeholderTextColor="#A8B8B1"
                style={[styles.modalInput, {height: 80, textAlignVertical: 'top', paddingTop: 10}]}
                multiline />
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSavePackage}>
                <Text style={styles.modalSaveBtnText}>{editIndex !== null ? 'Update Package' : 'Add Package'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

function MLabel({text}) { return <Text style={styles.modalLabel}>{text}</Text>; }
function MField(props) { return <TextInput {...props} placeholderTextColor="#A8B8B1" style={styles.modalInput} />; }

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.light},
  header: {backgroundColor: COLORS.dark, paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center'},
  backBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14},
  addHeaderBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center'},
  headerTitle: {color: '#fff', fontSize: 22, fontWeight: 'bold'},
  headerSub: {color: '#9BB5AC', fontSize: 12, marginTop: 3},
  emptyBox: {alignItems: 'center', padding: 40, margin: 16, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: COLORS.border},
  statusBox: {flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F5E9', marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#A5D6A7'},
  statusText: {flex: 1, color: '#2E7D32', fontWeight: 'bold', fontSize: 12},
  serviceCard: {backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border},
  serviceLabel: {color: COLORS.dark, fontWeight: 'bold', marginBottom: 10, fontSize: 13},
  serviceChips: {flexDirection: 'row', flexWrap: 'wrap'},
  serviceChip: {minHeight: 36, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center'},
  serviceChipSpacing: {marginRight: 8, marginBottom: 8},
  serviceChipActive: {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
  serviceChipText: {color: COLORS.dark, fontWeight: 'bold', fontSize: 12},
  serviceChipTextActive: {color: '#fff'},
  emptyTitle: {fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginTop: 12},
  emptySub: {color: COLORS.muted, fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 18},
  addFirstBtn: {flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, gap: 6},
  addFirstBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 14},
  packagesList: {padding: 16, gap: 12},
  packageCard: {backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border},
  pkgHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6},
  pkgName: {fontSize: 16, fontWeight: 'bold', color: COLORS.dark, flex: 1},
  pkgActions: {flexDirection: 'row', gap: 8},
  pkgActionBtn: {width: 34, height: 34, borderRadius: 10, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center'},
  pkgPrice: {fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 6},
  pkgDetail: {color: COLORS.muted, fontSize: 13, marginTop: 2},
  pkgDesc: {color: COLORS.muted, fontSize: 12, marginTop: 6, fontStyle: 'italic'},
  saveAllBtn: {height: 54, borderRadius: 16, backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 8},
  saveAllText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  modalBox: {backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%'},
  modalHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18},
  modalTitle: {fontSize: 18, fontWeight: 'bold', color: COLORS.dark},
  modalSub: {color: COLORS.muted, fontSize: 12, marginTop: 2},
  modalLabel: {color: COLORS.dark, fontWeight: 'bold', marginTop: 12, marginBottom: 6, fontSize: 13},
  modalInput: {height: 52, borderRadius: 13, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, paddingHorizontal: 14, fontSize: 14, color: COLORS.dark},
  modalSaveBtn: {height: 52, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginTop: 18},
  modalSaveBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
});
