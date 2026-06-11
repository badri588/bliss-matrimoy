import React, {useContext, useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';
import ImageZoomModal from '../../components/ImageZoomModal';

const createLocalPhotoId = (photo, index) =>
  photo?.id || photo?.uri || photo?.url || photo?.image || `saved-photo-${index}`;

const getServiceProfileKey = (category = '') =>
  String(category || 'default').trim().toLowerCase();

const getServiceProfile = (svc = {}, category = '') => {
  const profile = svc.serviceProfiles?.[getServiceProfileKey(category)] || {};
  return {
    photos: Array.isArray(profile.photos) ? profile.photos : svc.photos || [],
    serviceDescription: profile.serviceDescription ?? svc.serviceDescription ?? '',
  };
};

export default function VendorPhotosScreen({navigation, route}) {
  const ctx    = useContext(ProfileContext);
  const vendor = ctx?.currentVendor || {};
  const svc    = ctx?.getVendorService?.(vendor.id) || {};
  const serviceStatus = svc.serviceStatus || 'Draft';
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
  const selectedProfile = getServiceProfile(svc, selectedService);

  // Separate cover from work photos when loading saved data
  const savedAll    = selectedProfile.photos || [];
  const savedCover  = savedAll.find(p => p.isCover)?.uri || null;
  const savedPhotos = savedAll
    .filter(p => !p.isCover)
    .map((photo, index) => ({
      ...photo,
      id: createLocalPhotoId(photo, index),
    }));

  const [photos, setPhotos]         = useState(savedPhotos);
  const [coverPhoto, setCoverPhoto] = useState(savedCover);
  const [desc, setDesc]           = useState(selectedProfile.serviceDescription || '');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveMessageType, setSaveMessageType] = useState('success');
  const [saving, setSaving] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState(null);
  const [viewerTitle, setViewerTitle] = useState('');

  useEffect(() => {
    const profile = getServiceProfile(svc, selectedService);
    const nextAll = profile.photos || [];
    setCoverPhoto(nextAll.find(p => p.isCover)?.uri || null);
    setPhotos(
      nextAll
        .filter(p => !p.isCover)
        .map((photo, index) => ({
          ...photo,
          id: createLocalPhotoId(photo, index),
        }))
    );
    setDesc(profile.serviceDescription || '');
    setSaveMessage('');
  }, [selectedService, svc]);

  const openViewer = (uri, title = 'Image Preview') => {
    if (!uri) {
      return;
    }

    setViewerUri(uri);
    setViewerTitle(title);
    setViewerVisible(true);
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setViewerUri(null);
    setViewerTitle('');
  };

  // ── Pick one image ──────────────────────────────────────────────────────
  const pickSingleFromGallery = async (onDone) => {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Gallery access required');
        return;
      }
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: Platform.OS !== 'web',
      aspect: [4, 3],
    });

    if (!res.canceled && res.assets?.[0]?.uri) {
      onDone(res.assets[0].uri);
    }
  };

  const pickImage = async (onDone) => {
    if (Platform.OS === 'web') {
      await pickSingleFromGallery(onDone);
      return;
    }

    Alert.alert('Add Photo', 'Choose source', [
      {
        text: '📷 Camera',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) { Alert.alert('Permission needed', 'Camera access required'); return; }
          const res = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!res.canceled) onDone(res.assets[0].uri);
        },
      },
      {
        text: '🖼 Gallery',
        onPress: async () => {
          await pickSingleFromGallery(onDone);
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  // ── Pick multiple ───────────────────────────────────────────────────────
  const pickMultiple = async () => {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission needed', 'Gallery access required'); return; }
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!res.canceled) {
      const newPhotos = res.assets.map((a, i) => ({
        id: Date.now() + i,
        uri: a.uri,
        label: `Work Sample ${photos.length + i + 1}`,
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const addSinglePhoto = () => {
    pickImage((uri) => {
      setPhotos(prev => [...prev, {id: Date.now(), uri, label: `Photo ${prev.length + 1}`}]);
    });
  };

  const removePhoto = (id) => {
    const removeSelectedPhoto = () => {
      setPhotos(prev => prev.filter(p => String(p.id) !== String(id)));
    };

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || window.confirm('Delete this photo?')) {
        removeSelectedPhoto();
      }
      return;
    }

    Alert.alert('Remove Photo', 'Delete this photo?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Remove', style: 'destructive', onPress: removeSelectedPhoto},
    ]);
  };

  const handleSave = async () => {
    if (!selectedService) {
      Alert.alert('Select Service', 'Please select which service these photos belong to.');
      return;
    }

    if (!coverPhoto) {
      Alert.alert('Required', `Please add a cover photo for ${selectedService}.`);
      return;
    }
    if (photos.length < 2) {
      Alert.alert('Required', `Please add at least 2 work sample photos for ${selectedService}.`);
      return;
    }
    // Store cover as a special entry with unique id, work photos get unique timestamp ids
    const workPhotos = photos.map((p, i) => ({...p, id: p.id || (Date.now() + i)}));
    const allPhotos  = [{id: `vendor_cover_${getServiceProfileKey(selectedService)}`, uri: coverPhoto, label: `${selectedService} Cover Photo`, isCover: true}, ...workPhotos];
    const result = await ctx?.updateVendorPhotos?.(vendor.id, allPhotos, {
      serviceCategory: selectedService,
      serviceDescription: desc,
    });

    if (result?.success === false) {
      setSaveMessageType('error');
      setSaveMessage(result?.message || 'Unable to save photos.');
      Alert.alert('Save Failed', result?.message || 'Unable to save photos.');
      return;
    }

    setSaveMessageType('success');
    setSaveMessage(`${selectedService} photos saved successfully.`);

    Alert.alert('Saved ✅', 'Photos and description saved!', [
      {text: 'OK', onPress: () => navigation.replace('VendorPackages', {category: selectedService})},
    ]);
  };

  const isLive = serviceStatus === 'Live';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>Service Photos</Text>
          <Text style={styles.headerSub}>
            {isLive ? 'Live — Add more photos anytime' : 'Showcase your work to customers'}
          </Text>
        </View>
        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>🟢 Live</Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        {vendorServices.length > 1 && (
          <View style={styles.card}>
            <SectionHead title="Select Service" sub="Choose where these photos should appear" />
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

        {!!saveMessage && (
          <View style={[styles.messageBox, saveMessageType === 'error' && styles.messageBoxError]}>
            <Ionicons
              name={saveMessageType === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              size={18}
              color={saveMessageType === 'error' ? '#C62828' : '#2E7D32'}
            />
            <Text style={[styles.messageText, saveMessageType === 'error' && styles.messageTextError]}>
              {saveMessage}
            </Text>
          </View>
        )}

        {/* ── Cover Photo ── */}
        <View style={styles.card}>
          <SectionHead title="Cover Photo" sub="Main photo shown to customers (Required)" />

          {coverPhoto ? (
            <View style={styles.coverPreview}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => openViewer(coverPhoto, `${selectedService || 'Service'} Cover Photo`)}>
                <Image source={{uri: coverPhoto}} style={styles.coverImage} resizeMode="cover" />
              </TouchableOpacity>
              <View style={styles.coverActions}>
                <TouchableOpacity style={styles.changeBtn}
                  onPress={() => pickImage(setCoverPhoto)}>
                  <Ionicons name="refresh" size={14} color={COLORS.primary} />
                  <Text style={styles.changeBtnText}>Change Cover</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn}
                  onPress={() => setCoverPhoto(null)}>
                  <Ionicons name="trash-outline" size={14} color="#F44336" />
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBox}
              onPress={() => pickImage(setCoverPhoto)}>
              <Ionicons name="image-outline" size={36} color={COLORS.primary} />
              <Text style={styles.uploadTitle}>Upload Cover Photo</Text>
              <Text style={styles.uploadSub}>
                {Platform.OS === 'web' ? 'Choose file from laptop' : 'Camera or Gallery'} • 4:3 ratio recommended
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Work Gallery ── */}
        <View style={styles.card}>
          <View style={styles.galleryHeader}>
            <SectionHead title="Work Gallery"
              sub={`${photos.length} photo${photos.length !== 1 ? 's' : ''} added (min. 2)`} />
            <View style={styles.addBtns}>
              <TouchableOpacity style={styles.addOneBtn} onPress={addSinglePhoto}>
                <Ionicons name="add" size={16} color={COLORS.primary} />
                <Text style={styles.addOneBtnText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addMultiBtn} onPress={pickMultiple}>
                <Ionicons name="images-outline" size={16} color="#fff" />
                <Text style={styles.addMultiBtnText}>Multi</Text>
              </TouchableOpacity>
            </View>
          </View>

          {photos.length === 0 ? (
            <TouchableOpacity style={styles.emptyGallery} onPress={pickMultiple}>
              <Ionicons name="images-outline" size={40} color={COLORS.gray} />
              <Text style={styles.emptyGalleryText}>Tap to add photos</Text>
              <Text style={styles.emptyGallerySub}>Show your best work — venues, events, samples</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoThumb}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => openViewer(photo.uri, photo.label || 'Work Photo')}>
                    <Image source={{uri: photo.uri}} style={styles.thumbImage} resizeMode="cover" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.thumbRemove} onPress={() => removePhoto(photo.id)}>
                    <Ionicons name="close-circle" size={22} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}
              {/* Add more tile */}
              <TouchableOpacity style={styles.addMoreTile} onPress={addSinglePhoto}>
                <Ionicons name="add-circle-outline" size={30} color={COLORS.primary} />
                <Text style={styles.addMoreText}>Add More</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Description ── */}
        <View style={styles.card}>
          <SectionHead title="Service Description"
            sub="Describe your experience, specialty and coverage" />
          <TextInput
            value={desc} onChangeText={setDesc}
            placeholder="e.g. 8+ years experience in Christian weddings. We cover full-day events, provide edited photos within 15 days, and include a premium photo album..."
            placeholderTextColor="#A8B8B1"
            style={styles.descInput}
            multiline numberOfLines={6}
            textAlignVertical="top" />
          <Text style={styles.charCount}>{desc.length} characters</Text>
        </View>

        {isLive && (
          <View style={styles.liveInfoBox}>
            <Ionicons name="information-circle-outline" size={18} color="#1565C0" />
            <Text style={styles.liveInfoText}>
              Your service is live. New photos added here will be visible to customers immediately after saving.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>
            {isLive ? 'Save & Update Live' : 'Save Photos'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ImageZoomModal
        visible={viewerVisible}
        sourceUri={viewerUri}
        title={viewerTitle}
        onClose={closeViewer}
      />
    </KeyboardAvoidingView>
  );
}

function SectionHead({title, sub}) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub && <Text style={styles.sectionSub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       {flex: 1, backgroundColor: COLORS.background},
  header:          {backgroundColor: COLORS.dark, paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center'},
  scrollContent:   {paddingBottom: 130},
  backBtn:         {width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14},
  headerTitle:     {color: '#fff', fontSize: 22, fontWeight: 'bold'},
  headerSub:       {color: '#9BB5AC', fontSize: 12, marginTop: 3, flex: 1},
  liveBadge:       {backgroundColor: 'rgba(76,175,80,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(76,175,80,0.4)'},
  liveBadgeText:   {color: '#81C784', fontWeight: 'bold', fontSize: 11},
  card:            {backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#DDEAE5'},
  sectionHead:     {marginBottom: 12},
  sectionTitle:    {fontWeight: 'bold', color: COLORS.dark, fontSize: 15},
  sectionSub:      {color: COLORS.muted, fontSize: 12, marginTop: 2},
  serviceChips:    {flexDirection: 'row', flexWrap: 'wrap'},
  serviceChip:     {minHeight: 38, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center'},
  serviceChipSpacing: {marginRight: 8, marginBottom: 8},
  serviceChipActive: {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
  serviceChipText: {color: COLORS.dark, fontWeight: 'bold', fontSize: 12},
  serviceChipTextActive: {color: '#fff'},
  messageBox:      {flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F5E9', marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#A5D6A7'},
  messageBoxError: {backgroundColor: '#FFEBEE', borderColor: '#EF9A9A'},
  messageText:     {flex: 1, color: '#2E7D32', fontWeight: 'bold', fontSize: 12},
  messageTextError:{color: '#C62828'},
  // Cover photo
  uploadBox:       {height: 160, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', gap: 6},
  uploadTitle:     {color: COLORS.dark, fontWeight: 'bold', fontSize: 15},
  uploadSub:       {color: COLORS.muted, fontSize: 12},
  coverPreview:    {borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border},
  coverImage:      {width: '100%', height: 200},
  coverActions:    {flexDirection: 'row', backgroundColor: '#F4F8F6', padding: 10, gap: 10},
  changeBtn:       {flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E8F5E9', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10},
  changeBtnText:   {color: COLORS.primary, fontWeight: 'bold', fontSize: 12},
  removeBtn:       {flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFEBEE', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10},
  removeBtnText:   {color: '#F44336', fontWeight: 'bold', fontSize: 12},
  // Gallery
  galleryHeader:   {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12},
  addBtns:         {flexDirection: 'row', gap: 8},
  addOneBtn:       {flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border},
  addOneBtnText:   {color: COLORS.primary, fontWeight: 'bold', fontSize: 12},
  addMultiBtn:     {flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10},
  addMultiBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 12},
  emptyGallery:    {height: 130, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: COLORS.background},
  emptyGalleryText:{color: COLORS.dark, fontWeight: 'bold', fontSize: 14},
  emptyGallerySub: {color: COLORS.muted, fontSize: 12},
  photoGrid:       {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  photoThumb:      {width: 100, height: 100, borderRadius: 12, overflow: 'visible'},
  thumbImage:      {width: 100, height: 100, borderRadius: 12},
  thumbRemove:     {position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', borderRadius: 11},
  addMoreTile:     {width: 100, height: 100, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, gap: 4},
  addMoreText:     {color: COLORS.primary, fontSize: 11, fontWeight: 'bold'},
  // Description
  descInput:       {borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, paddingHorizontal: 14, paddingTop: 12, fontSize: 14, color: COLORS.dark, minHeight: 120},
  charCount:       {color: COLORS.muted, fontSize: 11, textAlign: 'right', marginTop: 4},
  liveInfoBox:     {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#E3F2FD', marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 12, gap: 10, borderWidth: 1, borderColor: '#BBDEFB'},
  liveInfoText:    {flex: 1, color: '#1565C0', fontSize: 12, lineHeight: 18},
  saveBtn:         {height: 58, borderRadius: 18, backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 20},
  saveBtnText:     {color: '#fff', fontWeight: 'bold', fontSize: 16},
});
