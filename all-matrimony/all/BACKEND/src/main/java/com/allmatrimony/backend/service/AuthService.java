package com.allmatrimony.backend.service;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.ForgotPasswordOtpRequest;
import com.allmatrimony.backend.dto.ForgotPasswordResetRequest;
import com.allmatrimony.backend.dto.LoginRequest;
import com.allmatrimony.backend.dto.OtpRequest;
import com.allmatrimony.backend.dto.OtpVerifyRequest;
import com.allmatrimony.backend.dto.RegisterRequest;
import com.allmatrimony.backend.entity.EmailOtp;
import com.allmatrimony.backend.entity.PhoneOtp;
import com.allmatrimony.backend.entity.User;
import com.allmatrimony.backend.repository.EmailOtpRepository;
import com.allmatrimony.backend.repository.PhoneOtpRepository;
import com.allmatrimony.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.regex.Pattern;

@Service
public class AuthService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);
    private static final String PURPOSE_FORGOT_PASSWORD = "FORGOT_PASSWORD";

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[6-9]\\d{9}$");
    private static final Pattern OTP_PATTERN =
            Pattern.compile("^\\d{6}$");

    private final UserRepository userRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final PhoneOtpRepository phoneOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final SmsService smsService;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            EmailOtpRepository emailOtpRepository,
            PhoneOtpRepository phoneOtpRepository,
            PasswordEncoder passwordEncoder,
            SmsService smsService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.emailOtpRepository = emailOtpRepository;
        this.phoneOtpRepository = phoneOtpRepository;
        this.passwordEncoder = passwordEncoder;
        this.smsService = smsService;
        this.emailService = emailService;
    }

    @Transactional
    public ApiResponse sendOtp(OtpRequest request) {
        String phone = normalizePhone(request.getPhone());

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new IllegalArgumentException("Please enter a valid 10-digit phone number.");
        }

        String otp = generateOtp();

        if (!smsService.isConfigured()) {
            LOGGER.warn("Twilio OTP send skipped for phone {} because Twilio is not configured.", phone);
            return ApiResponse.failure("OTP failed. Please try again later.");
        }

        try {
            smsService.sendOtp(phone, otp);
        } catch (Exception error) {
            LOGGER.warn("Twilio OTP send failed for phone {}.", phone, error);
            return ApiResponse.failure("OTP failed. Please try again later.");
        }

        PhoneOtp entity = new PhoneOtp();
        entity.setPhone(phone);
        entity.setOtp(otp);
        entity.setVerified(false);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        phoneOtpRepository.save(entity);

        return ApiResponse.success("OTP sent successfully to your phone.");
    }

    @Transactional
    public ApiResponse verifyOtp(OtpVerifyRequest request) {
        String phone = normalizePhone(request.getPhone());
        String otp = request.getOtp().trim();

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new IllegalArgumentException("Please enter a valid phone number.");
        }

        if (!OTP_PATTERN.matcher(otp).matches()) {
            throw new IllegalArgumentException("Please enter valid 6-digit OTP.");
        }

        PhoneOtp latestOtp = phoneOtpRepository.findTopByPhoneOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new IllegalArgumentException("OTP not found. Please send OTP first."));

        if (latestOtp.isVerified()) {
            return ApiResponse.success("Phone number already verified.");
        }

        if (latestOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP expired. Please send OTP again.");
        }

        if (smsService.isConfigured()) {
            try {
                boolean approved = smsService.verifyOtp(phone, otp);

                if (!approved) {
                    throw new IllegalArgumentException("Invalid OTP. Please try again.");
                }
            } catch (IllegalArgumentException error) {
                throw error;
            } catch (Exception error) {
                LOGGER.warn("Twilio OTP verify failed for phone {}.", phone, error);
                throw new IllegalArgumentException("OTP verification failed. Please try again later.");
            }
        } else {
            throw new IllegalArgumentException("OTP verification failed. Please try again later.");
        }

        latestOtp.setVerified(true);
        phoneOtpRepository.save(latestOtp);

        return ApiResponse.success("Phone number verified successfully.");
    }

    @Transactional
    public ApiResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        String phone = normalizePhone(request.getPhone());

        validateRegisterRequest(request, email, phone);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        if (userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Phone number is already registered.");
        }

        PhoneOtp latestOtp = phoneOtpRepository.findTopByPhoneOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new IllegalArgumentException("Phone OTP verification is required."));

        if (!latestOtp.isVerified()) {
            throw new IllegalArgumentException("Please verify phone number with OTP before registering.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setGender(request.getGender().trim());
        user.setProfileCreatedFor(request.getProfileCreatedFor().trim());
        user.setCommunity("");
        user.setLocation("");
        user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        user.setPhoneVerified(true);
        user.setReligion("");
        user.setApprovalStatus("Not Submitted");
        user.setVerificationStatus("Not Submitted");
        user.setPremiumPlan("FREE");
        user.setPremiumStatus("ACTIVE");
        user.setPremiumOrderId("");
        user.setPremiumPaymentId("");
        user.setPremiumActivatedAt(LocalDateTime.now());
        user.setWishlistProfileIds("");
        user.setProfileCompletion(35);
        user.setMaritalStatus("Never Married");
        user.setImage("");
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        Map<String, Object> userData = buildUserData(user);

        return ApiResponse.success("Registration completed successfully.", userData);
    }

    public ApiResponse login(LoginRequest request) {
        String rawIdentifier = request.getIdentifier().trim();
        String password = request.getPassword().trim();

        if (password.isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        Optional<User> userOptional;

        if (EMAIL_PATTERN.matcher(rawIdentifier).matches()) {
            userOptional = userRepository.findByEmail(normalizeEmail(rawIdentifier));
        } else {
            String normalizedPhone = normalizePhone(rawIdentifier);

            if (!PHONE_PATTERN.matcher(normalizedPhone).matches()) {
                throw new IllegalArgumentException("Enter a valid email address or 10-digit phone number.");
            }

            userOptional = userRepository.findByPhone(normalizedPhone);
        }

        User user = userOptional.orElseThrow(() ->
                new IllegalArgumentException("Invalid email, phone number, or password."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email, phone number, or password.");
        }

        return ApiResponse.success("Login successful.", buildUserData(user));
    }

    @Transactional
    public ApiResponse sendForgotPasswordOtp(ForgotPasswordOtpRequest request) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email address."));

        String otp = generateOtp();

        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtp(otp);
        emailOtp.setVerified(false);
        emailOtp.setPurpose(PURPOSE_FORGOT_PASSWORD);
        emailOtp.setCreatedAt(LocalDateTime.now());
        emailOtp.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        emailOtpRepository.save(emailOtp);

        emailService.sendForgotPasswordOtp(user.getEmail(), otp);

        return ApiResponse.success("OTP sent successfully to your email.");
    }

    @Transactional
    public ApiResponse resetForgotPassword(ForgotPasswordResetRequest request) {
        String email = normalizeEmail(request.getEmail());
        String otp = request.getOtp().trim();
        String newPassword = request.getNewPassword().trim();

        if (!OTP_PATTERN.matcher(otp).matches()) {
            throw new IllegalArgumentException("Please enter valid 6-digit OTP.");
        }

        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email address."));

        EmailOtp latestOtp = emailOtpRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, PURPOSE_FORGOT_PASSWORD)
                .orElseThrow(() -> new IllegalArgumentException("OTP not found. Please request a new OTP."));

        if (latestOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP expired. Please request a new OTP.");
        }

        if (!latestOtp.getOtp().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP. Please try again.");
        }

        latestOtp.setVerified(true);
        emailOtpRepository.save(latestOtp);

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ApiResponse.success("Password updated successfully. Please login with your new password.");
    }

    private void validateRegisterRequest(RegisterRequest request, String email, String phone) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Please enter full name.");
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new IllegalArgumentException("Please enter a valid 10-digit phone number.");
        }

        if (request.getGender() == null || request.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("Please enter gender.");
        }

        if (request.getProfileCreatedFor() == null || request.getProfileCreatedFor().trim().isEmpty()) {
            throw new IllegalArgumentException("Please select profile created for.");
        }

        if (request.getPassword() == null || request.getPassword().trim().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }
    }

    private Map<String, Object> buildUserData(User user) {
        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("phone", user.getPhone());
        userData.put("age", user.getAge());
        userData.put("dob", user.getDob());
        userData.put("gender", user.getGender());
        userData.put("profileCreatedFor", user.getProfileCreatedFor());
        userData.put("community", user.getCommunity());
        userData.put("religion", user.getReligion());
        userData.put("caste", user.getCaste());
        userData.put("location", user.getLocation());
        userData.put("education", user.getEducation());
        userData.put("job", user.getJob());
        userData.put("income", user.getIncome());
        userData.put("height", user.getHeight());
        userData.put("maritalStatus", user.getMaritalStatus());
        userData.put("familyType", user.getFamilyType());
        userData.put("fatherName", user.getFatherName());
        userData.put("motherName", user.getMotherName());
        userData.put("siblings", user.getSiblings());
        userData.put("about", user.getAbout());
        userData.put("partnerAge", user.getPartnerAge());
        userData.put("partnerCommunity", user.getPartnerCommunity());
        userData.put("partnerLocation", user.getPartnerLocation());
        userData.put("partnerEducation", user.getPartnerEducation());
        userData.put("image", user.getImage());
        userData.put("habits", user.getHabits());
        userData.put("phoneVerified", user.isPhoneVerified());
        userData.put("approvalStatus", user.getApprovalStatus());
        userData.put("verificationStatus", user.getVerificationStatus());
        userData.put("premiumPlan", user.getPremiumPlan() == null || user.getPremiumPlan().isBlank() ? "FREE" : user.getPremiumPlan());
        userData.put("premiumStatus", user.getPremiumStatus() == null || user.getPremiumStatus().isBlank() ? "ACTIVE" : user.getPremiumStatus());
        userData.put("premiumOrderId", user.getPremiumOrderId());
        userData.put("premiumPaymentId", user.getPremiumPaymentId());
        userData.put("premiumActivatedAt", user.getPremiumActivatedAt() == null ? null : user.getPremiumActivatedAt().toString());
        userData.put("wishlistProfileIds", parseWishlistProfileIds(user));
        userData.put("profileCompletion", user.getProfileCompletion());
        return userData;
    }

    private java.util.List<String> parseWishlistProfileIds(User user) {
        String rawIds = user.getWishlistProfileIds();

        if (rawIds == null || rawIds.isBlank()) {
            return java.util.Collections.emptyList();
        }

        return java.util.Arrays.stream(rawIds.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.trim();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String generateOtp() {
        int otp = 100000 + new Random().nextInt(900000);
        return String.valueOf(otp);
    }
}
