import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {ProfileContext} from '../../context/ProfileContext';
import COLORS from '../../constants/colors';
import {API_BASE_URL} from '../../config/api';
import {VENDOR_SERVICE_CATEGORIES} from '../../constants/vendorServices';

const normalizePhone = value => String(value || '').trim();
const isValidPhone = value => /^[6-9]\d{9}$/.test(normalizePhone(value));
const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export default function VendorRegisterScreen({navigation, route}) {
  const profileContext = useContext(ProfileContext);
  const registerVendor = profileContext?.registerVendor;
  const vendors = profileContext?.vendors || [];

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const initialCategory = VENDOR_SERVICE_CATEGORIES.find(cat => cat.label === route?.params?.category) || null;
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);
  const [servicesOpen, setServicesOpen] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleCategory = cat => {
    setSelectedCategories(prev =>
      prev.some(item => item.id === cat.id)
        ? prev.filter(item => item.id !== cat.id)
        : [...prev, cat],
    );
  };

  const sendOtp = async () => {
    const cleanMobile = normalizePhone(mobile);

    if (!isValidPhone(cleanMobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setOtpLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vendors/send-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phone: cleanMobile}),
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        Alert.alert('OTP Error', data?.message || 'Unable to send OTP');
        return;
      }

      setOtpSent(true);
      setOtpVerified(false);
      setEnteredOtp('');
      Alert.alert('OTP Sent', data.message || 'OTP sent to your mobile number.');
    } catch (error) {
      Alert.alert('OTP Error', 'Could not connect to backend. Check Spring Boot server and API URL.');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    const cleanMobile = normalizePhone(mobile);

    if (!enteredOtp || enteredOtp.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }

    try {
      setOtpLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vendors/verify-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phone: cleanMobile, otp: enteredOtp.trim()}),
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        Alert.alert('Invalid OTP', data?.message || 'Please enter a valid OTP.');
        return;
      }

      setOtpVerified(true);
      Alert.alert('Success', data.message || 'Mobile number verified successfully!');
    } catch (error) {
      Alert.alert('Invalid OTP', 'Could not verify OTP. Check backend connection.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async () => {
    const cleanBusinessName = businessName.trim();
    const cleanOwnerName = ownerName.trim();
    const cleanMobile = normalizePhone(mobile);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!cleanBusinessName) {
      Alert.alert('Error', 'Please enter your business name');
      return;
    }
    if (!cleanOwnerName) {
      Alert.alert('Error', 'Please enter owner name');
      return;
    }
    if (!isValidPhone(cleanMobile)) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!otpSent) {
      Alert.alert(
        'Mobile Number Not Verified',
        'This vendor mobile number is not verified. Please tap Get OTP and verify the OTP before registering.',
      );
      return;
    }
    if (!otpVerified) {
      Alert.alert(
        'Mobile Number Not Verified',
        'This vendor mobile number is not verified. Please enter the OTP and verify it before registering.',
      );
      return;
    }
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one service');
      return;
    }
    if (cleanPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (cleanPassword !== cleanConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Check if mobile already registered as vendor
    const existingVendor = vendors.find(v => normalizePhone(v.mobile || v.phone) === cleanMobile);
    if (existingVendor) {
      if (existingVendor.status === 'Pending') {
        Alert.alert(
          'Already Registered',
          'This mobile number is already registered. Your account is waiting for admin approval.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('VendorApprovalWaiting', {
                  vendorData: existingVendor,
                }),
            },
          ],
        );
      } else if (existingVendor.status === 'Approved') {
        Alert.alert(
          'Already Registered',
          'This mobile number is already registered and approved. Please login.',
          [{text: 'Login', onPress: () => navigation.navigate('Login')}],
        );
      } else {
        Alert.alert(
          'Already Registered',
          'This mobile number is already registered.',
        );
      }
      return;
    }

    const vendorData = {
      businessName: cleanBusinessName,
      ownerName: cleanOwnerName,
      mobile: cleanMobile,
      email: cleanEmail,
      password: cleanPassword,
      category: selectedCategories[0].label,
      categoryId: selectedCategories[0].id,
      services: selectedCategories.map(item => item.label),
      role: 'vendor',
    };

    setRegisterLoading(true);
    const result = await registerVendor?.(vendorData);
    setRegisterLoading(false);

    if (!result?.success) {
      const needsPhoneVerification =
        String(result?.message || '').toLowerCase().includes('otp') ||
        String(result?.message || '').toLowerCase().includes('verify phone');
      Alert.alert(
        needsPhoneVerification ? 'Mobile Number Not Verified' : 'Registration Failed',
        result?.message || 'Unable to register vendor.',
      );
      return;
    }

    const newVendor = result.vendor || vendorData;
    profileContext?.setCurrentVendor?.(newVendor);

    if (String(newVendor.approvalStatus || newVendor.status || '').toLowerCase() === 'approved') {
      Alert.alert('Already Approved', result.message || 'Vendor already approved. Please login.', [
        {text: 'Login', onPress: () => navigation.replace('Login')},
      ]);
      return;
    }

    navigation.replace('VendorKYC');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Vendor Registration</Text>
          <Text style={styles.headerSub}>Join our wedding services network</Text>
        </View>
      </View>

      <View style={styles.card}>
        {/* Business Name */}
        <Label text="Business Name" />
        <Input
          placeholder="Enter your business name"
          value={businessName}
          onChangeText={setBusinessName}
        />

        {/* Owner Name */}
        <Label text="Owner / Contact Person Name" />
        <Input
          placeholder="Enter owner / contact name"
          value={ownerName}
          onChangeText={setOwnerName}
        />

        <Label text="Email Address" />
        <Input
          placeholder="Enter vendor email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Mobile + OTP */}
        <Label text="Mobile Number" />
        <View style={styles.otpRow}>
          <TextInput
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor="#A8B8B1"
            value={mobile}
            onChangeText={t => {
              setMobile(t.replace(/\D/g, '').slice(0, 10));
              setOtpSent(false);
              setOtpVerified(false);
              setEnteredOtp('');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.mobileInput}
            editable={!otpVerified}
          />
          <TouchableOpacity
            style={[styles.otpBtn, otpVerified && styles.otpVerifiedBtn]}
            onPress={otpVerified || otpLoading ? null : sendOtp}>
            {otpVerified ? (
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
            ) : otpLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.otpText}>{otpSent ? 'Resend' : 'Get OTP'}</Text>
            )}
          </TouchableOpacity>
        </View>

        {otpSent && !otpVerified && (
          <>
            <Label text="Enter OTP" />
            <View style={styles.otpRow}>
              <TextInput
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#A8B8B1"
                value={enteredOtp}
                onChangeText={setEnteredOtp}
                keyboardType="numeric"
                maxLength={6}
                style={styles.mobileInput}
              />
              <TouchableOpacity style={styles.otpBtn} onPress={verifyOtp} disabled={otpLoading}>
                {otpLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.otpText}>Verify</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}

        {otpVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.verifiedText}>Mobile number verified</Text>
          </View>
        )}

        <Label text="Services Offered" />
        <TouchableOpacity
          style={[styles.dropdown, servicesOpen && styles.dropdownOpen]}
          onPress={() => setServicesOpen(prev => !prev)}
          activeOpacity={0.85}>
          <View style={styles.selectedCategoryRow}>
            <Ionicons name="briefcase-outline" size={19} color={COLORS.primary} />
            <Text
              style={selectedCategories.length ? styles.dropdownSelected : styles.dropdownPlaceholder}
              numberOfLines={1}>
              {selectedCategories.length
                ? selectedCategories.map(item => item.label).join(', ')
                : 'Select wedding services'}
            </Text>
          </View>
          <Ionicons name={servicesOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.gray} />
        </TouchableOpacity>

        {selectedCategories.length > 0 && (
          <View style={styles.selectedChips}>
            {selectedCategories.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.selectedChip}
                onPress={() => toggleCategory(item)}
                activeOpacity={0.85}>
                <FontAwesome5 name={item.icon} size={11} color={COLORS.primary} />
                <Text style={styles.selectedChipText}>{item.label}</Text>
                <Ionicons name="close" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {servicesOpen && (
          <View style={styles.optionBox}>
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {VENDOR_SERVICE_CATEGORIES.map(cat => {
                const checked = selectedCategories.some(item => item.id === cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.optionItem, checked && styles.optionItemActive]}
                    onPress={() => toggleCategory(cat)}
                    activeOpacity={0.85}>
                    <View style={styles.optionLeft}>
                      <FontAwesome5
                        name={cat.icon}
                        size={14}
                        color={checked ? COLORS.primary : COLORS.gray}
                        style={{width: 22}}
                      />
                      <Text style={[styles.optionText, checked && styles.optionTextActive]}>
                        {cat.label}
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

        {/* Password */}
        <Label text="Password" />
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Create password"
            placeholderTextColor="#A8B8B1"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Label text="Confirm Password" />
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Confirm your password"
            placeholderTextColor="#A8B8B1"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.registerBtn, registerLoading && {opacity: 0.75}]}
          onPress={handleRegister}
          disabled={registerLoading}>
          {registerLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome5 name="store" size={20} color="#fff" />
              <Text style={styles.registerText}>Register as Vendor</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({text}) {
  return <Text style={styles.label}>{text}</Text>;
}

function Input(props) {
  return (
    <TextInput {...props} placeholderTextColor="#A8B8B1" style={styles.input} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 130,
  },

  header: {
    backgroundColor: COLORS.dark,
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  headerSub: {
    color: '#F4F8F6',
    marginTop: 4,
    fontSize: 13,
  },

  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDEAE5',
  },

  label: {
    color: COLORS.dark,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 8,
    fontSize: 14,
  },

  input: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.dark,
  },

  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  mobileInput: {
    flex: 1,
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.dark,
  },

  otpBtn: {
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },

  otpVerifiedBtn: {
    backgroundColor: '#4CAF50',
  },

  otpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },

  verifiedText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 13,
  },

  dropdown: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownOpen: {
    borderColor: COLORS.primary,
  },

  selectedCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },

  dropdownSelected: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '600',
  },

  dropdownPlaceholder: {
    color: '#A8B8B1',
    fontSize: 15,
  },

  optionBox: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
    maxHeight: 280,
  },

  optionItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#DDEAE5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  optionItemActive: {
    backgroundColor: '#E8F5E9',
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  optionText: {
    color: COLORS.dark,
    fontWeight: '600',
    fontSize: 14,
  },

  optionTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },

  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B7D7C0',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  selectedChipText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },

  checkboxGrid: {
    gap: 10,
  },

  checkboxItem: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  checkboxItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  checkboxText: {
    flex: 1,
    color: COLORS.dark,
    fontWeight: '700',
    fontSize: 13,
  },

  checkboxTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  passwordRow: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.dark,
  },

  registerBtn: {
    height: 62,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    marginTop: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  registerText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  loginBtn: {
    marginTop: 16,
    alignItems: 'center',
    padding: 10,
  },

  loginText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
