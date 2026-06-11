import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';

function DocUploadSlot({label, required, uri, onPick, onRemove}) {
  return (
    <View style={styles.docSlot}>
      <View style={styles.docLabelRow}>
        <Text style={styles.docLabel}>{label}</Text>
        {required && <Text style={styles.requiredTag}>Required</Text>}
      </View>

      {uri ? (
        <View style={styles.docPreview}>
          <Image source={{uri}} style={styles.docImage} resizeMode="cover" />
          <View style={styles.docPreviewActions}>
            <TouchableOpacity style={styles.rePickBtn} onPress={onPick}>
              <Ionicons name="refresh" size={14} color={COLORS.primary} />
              <Text style={styles.rePickText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
              <Ionicons name="trash-outline" size={14} color="#F44336" />
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadBox} onPress={onPick}>
          <Ionicons name="cloud-upload-outline" size={30} color={COLORS.primary} />
          <Text style={styles.uploadBoxTitle}>Upload Document</Text>
          <Text style={styles.uploadBoxSub}>
            {Platform.OS === 'web' ? 'Choose file from laptop' : 'Camera or Gallery'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function VendorKYCScreen({navigation}) {
  const ctx = useContext(ProfileContext);
  const vendor = ctx?.currentVendor || {};
  const svc = ctx?.getVendorService?.(vendor.id) || {};
  const existing = svc.kyc || {};

  const [aadharFront, setAadharFront] = useState(existing.aadharFront || null);
  const [aadharBack, setAadharBack] = useState(existing.aadharBack || null);
  const [panPhoto, setPanPhoto] = useState(existing.panPhoto || null);
  const [gstPhoto, setGstPhoto] = useState(existing.gstPhoto || null);

  const [address, setAddress] = useState(existing.address || '');
  const [city, setCity] = useState(existing.city || '');
  const [pincode, setPincode] = useState(existing.pincode || '');
  const [bankName, setBankName] = useState(existing.bankName || '');
  const [accountNo, setAccountNo] = useState(existing.accountNo || '');
  const [ifsc, setIfsc] = useState(existing.ifsc || '');

  const [loading, setLoading] = useState(false);

  const pickFromGallery = async setter => {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Gallery access is required');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: Platform.OS !== 'web',
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setter(result.assets[0].uri);
    }
  };

  const pickFromCamera = async setter => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera access is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setter(result.assets[0].uri);
    }
  };

  const pickImage = async setter => {
    if (Platform.OS === 'web') {
      await pickFromGallery(setter);
      return;
    }

    Alert.alert('Upload Photo', 'Choose source', [
      {
        text: 'Camera',
        onPress: () => pickFromCamera(setter),
      },
      {
        text: 'Gallery',
        onPress: () => pickFromGallery(setter),
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const handleSave = () => {
    if (!aadharFront || !panPhoto) {
      Alert.alert('Required', 'Please upload Aadhaar front photo and PAN card photo. No number entry is required.');
      return;
    }
    if (!address.trim() || !city.trim()) {
      Alert.alert('Required', 'Please enter business address and city.');
      return;
    }
    if ((bankName.trim() || accountNo.trim() || ifsc.trim()) && (!bankName.trim() || !accountNo.trim() || !ifsc.trim())) {
      Alert.alert('Bank Details', 'Please fill Bank Name, Account Number and IFSC, or leave all bank fields empty.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      ctx?.updateVendorKyc?.(vendor.id, {
        aadharFront,
        aadharBack,
        panPhoto,
        gstPhoto,
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        bankName: bankName.trim(),
        accountNo: accountNo.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        submitted: true,
        submittedAt: new Date().toLocaleString(),
      });
      setLoading(false);
      Alert.alert('Documents Saved', 'Next add service photos and gallery images.', [
        {text: 'OK', onPress: () => navigation.replace('VendorPhotos', {category: vendor?.category || (Array.isArray(vendor?.services) ? vendor.services[0] : '')})},
      ]);
    }, 400);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>KYC Documents</Text>
          <Text style={styles.headerSub}>Upload documents and add business details</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        {svc.kyc?.submitted && (
          <View style={styles.submittedBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.submittedBannerText}>KYC already submitted — you can update and re-save</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Aadhaar/PAN/GST numbers and selfie-with-Aadhaar are not required. Upload document photos, then enter business address and bank details manually.
          </Text>
        </View>

        <View style={styles.card}>
          <SectionHead icon="card-outline" title="Identity Document Photos" />

          <DocUploadSlot
            label="Aadhaar Card — Front"
            required
            uri={aadharFront}
            onPick={() => pickImage(setAadharFront)}
            onRemove={() => setAadharFront(null)} />

          <DocUploadSlot
            label="Aadhaar Card — Back"
            uri={aadharBack}
            onPick={() => pickImage(setAadharBack)}
            onRemove={() => setAadharBack(null)} />

          <DocUploadSlot
            label="PAN Card"
            required
            uri={panPhoto}
            onPick={() => pickImage(setPanPhoto)}
            onRemove={() => setPanPhoto(null)} />

          <DocUploadSlot
            label="GST Certificate / Business Proof (optional)"
            uri={gstPhoto}
            onPick={() => pickImage(setGstPhoto)}
            onRemove={() => setGstPhoto(null)} />
        </View>

        <View style={styles.card}>
          <SectionHead icon="location-outline" title="Business Address" />

          <Label text="Full Address *" />
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Door no, street, area"
            placeholderTextColor="#A8B8B1"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Label text="City *" />
          <Field value={city} onChangeText={setCity} placeholder="City" />

          <Label text="Pincode" />
          <Field
            value={pincode}
            onChangeText={setPincode}
            placeholder="6-digit pincode"
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        <View style={styles.card}>
          <SectionHead icon="business-outline" title="Bank Details" />

          <Label text="Bank Name" />
          <Field value={bankName} onChangeText={setBankName} placeholder="e.g. State Bank of India" />

          <Label text="Account Number" />
          <Field
            value={accountNo}
            onChangeText={setAccountNo}
            placeholder="Account number"
            keyboardType="numeric"
          />

          <Label text="IFSC Code" />
          <Field
            value={ifsc}
            onChangeText={text => setIfsc(text.toUpperCase())}
            placeholder="e.g. SBIN0001234"
            autoCapitalize="characters"
            maxLength={11}
          />
        </View>

        <View style={styles.securityBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.muted} />
          <Text style={styles.securityText}>
            Documents are used only for verification in this demo workflow. Manual Aadhaar/PAN/GST numbers and selfie-with-Aadhaar are removed; business address and bank details are saved manually.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && {opacity: 0.7}]}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save KYC Details</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionHead({icon, title}) {
  return (
    <View style={styles.sectionHead}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.sectionHeadText}>{title}</Text>
    </View>
  );
}
function Label({text}) {
  return <Text style={styles.label}>{text}</Text>;
}
function Field(props) {
  return <TextInput {...props} placeholderTextColor="#A8B8B1" style={styles.input} />;
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {backgroundColor: COLORS.dark, paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center'},
  backBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14},
  headerTitle: {color: '#fff', fontSize: 22, fontWeight: 'bold'},
  headerSub: {color: '#9BB5AC', fontSize: 12, marginTop: 3},
  scrollContent: {paddingBottom: 120},
  submittedBanner: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', marginHorizontal: 16, marginTop: 14, borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: '#A5D6A7'},
  submittedBannerText: {flex: 1, color: '#2E7D32', fontWeight: '600', fontSize: 13},
  infoBox: {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EAF2EE', margin: 16, marginBottom: 0, borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: COLORS.border},
  infoText: {flex: 1, color: COLORS.dark, fontSize: 13, lineHeight: 19, fontWeight: '600'},
  card: {backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#DDEAE5'},
  sectionHead: {flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#DDEAE5'},
  sectionHeadText: {color: COLORS.dark, fontWeight: 'bold', fontSize: 16, marginLeft: 8},
  label: {color: COLORS.dark, fontWeight: 'bold', marginTop: 14, marginBottom: 6, fontSize: 13},
  input: {height: 54, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, paddingHorizontal: 14, fontSize: 14, color: COLORS.dark},
  textArea: {height: 92, paddingTop: 12, paddingBottom: 12},
  docSlot: {marginTop: 16},
  docLabelRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8},
  docLabel: {color: COLORS.dark, fontWeight: 'bold', fontSize: 13},
  requiredTag: {backgroundColor: '#FFF3E0', color: '#E65100', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#FFE0B2', overflow: 'hidden', fontSize: 11, fontWeight: 'bold'},
  uploadBox: {height: 120, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', gap: 4},
  uploadBoxTitle: {color: COLORS.dark, fontWeight: 'bold', fontSize: 14},
  uploadBoxSub: {color: COLORS.muted, fontSize: 11},
  docPreview: {borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border},
  docImage: {width: '100%', height: 165},
  docPreviewActions: {flexDirection: 'row', backgroundColor: '#F4F8F6', padding: 8, gap: 12},
  rePickBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E8F5E9', borderRadius: 8},
  rePickText: {color: COLORS.primary, fontWeight: 'bold', fontSize: 12},
  removeBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFEBEE', borderRadius: 8},
  removeText: {color: '#F44336', fontWeight: 'bold', fontSize: 12},
  securityBox: {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', margin: 16, borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: COLORS.border},
  securityText: {flex: 1, color: COLORS.muted, fontSize: 12, lineHeight: 18},
  saveBtn: {height: 58, borderRadius: 18, backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 4, marginBottom: 20},
  saveBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
});
