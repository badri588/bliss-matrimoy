package com.allmatrimony.backend.service;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.LoginRequest;
import com.allmatrimony.backend.dto.OtpRequest;
import com.allmatrimony.backend.dto.OtpVerifyRequest;
import com.allmatrimony.backend.dto.StatusUpdateRequest;
import com.allmatrimony.backend.dto.VendorKycRequest;
import com.allmatrimony.backend.dto.VendorProfileUpdateRequest;
import com.allmatrimony.backend.dto.VendorRegisterRequest;
import com.allmatrimony.backend.dto.VendorServiceProfileRequest;
import com.allmatrimony.backend.entity.AdminNotification;
import com.allmatrimony.backend.entity.PhoneOtp;
import com.allmatrimony.backend.entity.Vendor;
import com.allmatrimony.backend.entity.WeddingService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.allmatrimony.backend.repository.AdminNotificationRepository;
import com.allmatrimony.backend.repository.PhoneOtpRepository;
import com.allmatrimony.backend.repository.VendorRepository;
import com.allmatrimony.backend.repository.WeddingServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class VendorService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[6-9]\\d{9}$");
    private static final int VENDOR_OTP_VALID_MINUTES_AFTER_VERIFY = 15;

    private final AuthService authService;
    private final PhoneOtpRepository phoneOtpRepository;
    private final VendorRepository vendorRepository;
    private final WeddingServiceRepository weddingServiceRepository;
    private final AdminNotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public VendorService(
            AuthService authService,
            PhoneOtpRepository phoneOtpRepository,
            VendorRepository vendorRepository,
            WeddingServiceRepository weddingServiceRepository,
            AdminNotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder,
            ObjectMapper objectMapper
    ) {
        this.authService = authService;
        this.phoneOtpRepository = phoneOtpRepository;
        this.vendorRepository = vendorRepository;
        this.weddingServiceRepository = weddingServiceRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    public ApiResponse sendOtp(OtpRequest request) {
        return authService.sendOtp(request);
    }

    public ApiResponse verifyOtp(OtpVerifyRequest request) {
        return authService.verifyOtp(request);
    }

    @Transactional
    public ApiResponse registerVendor(VendorRegisterRequest request) {
        String phone = normalizePhone(request.getPhone());
        String email = normalizeEmail(request.getEmail());
        List<String> services = sanitizeServices(request.getServices());

        validateRegisterRequest(request, email, phone, services);

        Vendor existingByPhone = vendorRepository.findByPhone(phone).orElse(null);
        Vendor existingByEmail = vendorRepository.findByEmail(email).orElse(null);

        if (existingByPhone != null || existingByEmail != null) {
            return resumeExistingRegistration(existingByPhone, existingByEmail, phone, email);
        }

        requireFreshVerifiedPhoneOtp(phone);

        Vendor vendor = new Vendor();
        vendor.setBusinessName(required(request.getBusinessName(), "Business name is required."));
        vendor.setOwnerName(required(request.getOwnerName(), "Owner name is required."));
        vendor.setPhone(phone);
        vendor.setEmail(email);
        vendor.setPasswordHash(passwordEncoder.encode(required(request.getPassword(), "Password is required.")));
        vendor.setPhoneVerified(true);
        vendor.setServices(String.join(",", services));
        vendor.setCity(clean(request.getCity()));
        vendor.setLocation(clean(request.getLocation()));
        vendor.setStartingPrice(clean(request.getStartingPrice()));
        vendor.setImageName(clean(request.getImageName()));
        vendor.setDescription(clean(request.getDescription()));
        vendor.setKycStatus("Not Submitted");
        vendor.setApprovalStatus("KYC Pending");
        vendor.setAdminMessage("");
        vendor.setCreatedAt(LocalDateTime.now());
        vendorRepository.save(vendor);

        return ApiResponse.success("Vendor registered successfully. Please submit KYC documents.", mapVendor(vendor));
    }

    private ApiResponse resumeExistingRegistration(Vendor existingByPhone, Vendor existingByEmail, String phone, String email) {
        Vendor vendor = existingByPhone != null ? existingByPhone : existingByEmail;
        boolean sameVendor =
                phone.equals(vendor.getPhone()) &&
                email.equalsIgnoreCase(vendor.getEmail());

        if (!sameVendor) {
            if (existingByPhone != null) {
                throw new IllegalArgumentException("This phone number is already registered as a vendor.");
            }

            throw new IllegalArgumentException("This email is already registered as a vendor.");
        }

        if ("Approved".equalsIgnoreCase(vendor.getApprovalStatus())) {
            return ApiResponse.success("Vendor already approved. Please login.", mapVendor(vendor));
        }

        return ApiResponse.success("Vendor already registered. Continue document verification.", mapVendor(vendor));
    }

    @Transactional
    public ApiResponse loginVendor(LoginRequest request) {
        String phone = normalizePhone(request.getIdentifier());
        String password = request.getPassword() == null ? "" : request.getPassword().trim();

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new IllegalArgumentException("Please enter a valid 10-digit vendor mobile number.");
        }

        if (password.isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        Vendor vendor = vendorRepository.findByPhone(phone)
                .orElseThrow(() -> new IllegalArgumentException("Invalid vendor mobile number or password."));

        if (!hasText(vendor.getPasswordHash())) {
            vendor.setPasswordHash(passwordEncoder.encode(password));
            vendorRepository.save(vendor);
        } else if (!passwordEncoder.matches(password, vendor.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid vendor mobile number or password.");
        }

        return ApiResponse.success("Vendor login successful.", mapVendor(vendor));
    }

    @Transactional
    public ApiResponse submitKyc(Long vendorId, VendorKycRequest request) {
        Vendor vendor = getVendorEntity(vendorId);

        vendor.setIdProofType(required(request.getIdProofType(), "ID proof type is required."));
        vendor.setIdProofNumber(required(request.getIdProofNumber(), "ID proof number is required."));
        vendor.setIdProofDocument(required(request.getIdProofDocument(), "ID proof document is required."));
        vendor.setBusinessDocument(required(request.getBusinessDocument(), "Business document is required."));
        vendor.setAddressProofDocument(required(request.getAddressProofDocument(), "Address proof document is required."));
        vendor.setPortfolioDocument(clean(request.getPortfolioDocument()));
        vendor.setDescription(valueOrCurrent(request.getDescription(), vendor.getDescription()));
        vendor.setStartingPrice(valueOrCurrent(request.getStartingPrice(), vendor.getStartingPrice()));
        vendor.setImageName(valueOrCurrent(request.getImageName(), vendor.getImageName()));
        vendor.setKycStatus("Submitted");
        vendor.setApprovalStatus("Pending");
        vendor.setAdminMessage("");
        vendor.setKycSubmittedAt(LocalDateTime.now());
        vendor.setApprovedAt(null);
        vendor.setRejectedAt(null);
        vendorRepository.save(vendor);

        createNotification(
                "ADMIN",
                null,
                "VENDOR_APPROVAL_REQUEST",
                "New Vendor Approval",
                vendor.getBusinessName() + " submitted vendor KYC for approval.",
                vendor.getId()
        );

        return ApiResponse.success("Vendor KYC submitted to admin for approval.", mapVendor(vendor));
    }

    public ApiResponse getVendor(Long vendorId) {
        return ApiResponse.success("Vendor loaded.", mapVendor(getVendorEntity(vendorId)));
    }

    @Transactional
    public ApiResponse updateVendorProfile(Long vendorId, VendorProfileUpdateRequest request) {
        Vendor vendor = getVendorEntity(vendorId);
        boolean wasApproved = isApprovedOrLive(vendor.getApprovalStatus());
        boolean servicesChanged = request.getServices() != null;

        if (hasText(request.getBusinessName())) vendor.setBusinessName(clean(request.getBusinessName()));
        if (hasText(request.getOwnerName())) vendor.setOwnerName(clean(request.getOwnerName()));
        if (hasText(request.getEmail())) vendor.setEmail(normalizeEmail(request.getEmail()));
        if (request.getServices() != null) {
            List<String> services = sanitizeServices(request.getServices());
            if (services.isEmpty()) {
                throw new IllegalArgumentException("Please select at least one vendor service.");
            }
            vendor.setServices(String.join(",", services));
        }
        vendor.setCity(valueOrCurrent(request.getCity(), vendor.getCity()));
        vendor.setLocation(valueOrCurrent(request.getLocation(), vendor.getLocation()));
        vendor.setStartingPrice(valueOrCurrent(request.getStartingPrice(), vendor.getStartingPrice()));
        vendor.setImageName(valueOrCurrent(request.getImageName(), vendor.getImageName()));
        vendor.setDescription(valueOrCurrent(request.getDescription(), vendor.getDescription()));
        vendorRepository.save(vendor);

        if (wasApproved) {
            publishVendorServices(vendor);
        } else if (servicesChanged) {
            createNotification(
                    "ADMIN",
                    null,
                    "VENDOR_APPROVAL_REQUEST",
                    "New Vendor Service Setup",
                    vendor.getBusinessName() + " updated the service list and submitted it for review.",
                    vendor.getId()
            );
        }

        return ApiResponse.success("Vendor profile updated.", mapVendor(vendor));
    }

    @Transactional
    public ApiResponse updateServiceProfile(Long vendorId, VendorServiceProfileRequest request) {
        Vendor vendor = getVendorEntity(vendorId);
        String serviceProfileKey = getServiceProfileKey(request == null ? null : request.getServiceCategory());
        Map<String, Object> nextServiceProfiles =
                request != null && request.getServiceProfiles() != null && !request.getServiceProfiles().isEmpty()
                        ? copyObjectMap(request.getServiceProfiles())
                        : copyObjectMap(readMap(vendor.getServiceProfilesJson()));
        Map<String, Object> nextProfile = copyObjectMap(readObjectMap(nextServiceProfiles.get(serviceProfileKey)));

        if (request.getPhotos() != null) {
            vendor.setServicePhotosJson(writeJson(request.getPhotos()));
            nextProfile.put("photos", request.getPhotos());
            String coverImage = request.getPhotos().stream()
                    .filter(photo -> Boolean.TRUE.equals(photo.get("isCover")))
                    .map(photo -> clean(String.valueOf(photo.getOrDefault("uri", ""))))
                    .filter(this::hasText)
                    .findFirst()
                    .orElse("");
            if (hasText(coverImage)) {
                vendor.setImageName(coverImage);
                vendor.setPortfolioDocument(coverImage);
            }
        }

        if (request.getPackages() != null) {
            vendor.setServicePackagesJson(writeJson(request.getPackages()));
            nextProfile.put("packages", request.getPackages());
            String startingPrice = lowestPackagePrice(request.getPackages());
            if (hasText(startingPrice)) {
                vendor.setStartingPrice(startingPrice);
            }
        }

        if (request.getServiceDetails() != null) {
            vendor.setServiceDetailsJson(writeJson(request.getServiceDetails()));
            nextProfile.put("serviceDetails", request.getServiceDetails());
        }

        if (request.getServiceDescription() != null) {
            vendor.setServiceDescription(clean(request.getServiceDescription()));
            vendor.setDescription(valueOrCurrent(request.getServiceDescription(), vendor.getDescription()));
            nextProfile.put("serviceDescription", clean(request.getServiceDescription()));
        }

        if (hasText(serviceProfileKey)) {
            nextServiceProfiles.put(serviceProfileKey, nextProfile);
        }

        if ((request.getServiceProfiles() != null && !request.getServiceProfiles().isEmpty()) || hasText(serviceProfileKey)) {
            vendor.setServiceProfilesJson(writeJson(nextServiceProfiles));
        }

        if (isApprovedOrLive(vendor.getApprovalStatus())) {
            vendorRepository.save(vendor);
            publishVendorServices(vendor);
            return ApiResponse.success("Vendor service profile saved.", mapVendor(vendor));
        }

        vendorRepository.save(vendor);

        createNotification(
                "ADMIN",
                null,
                "VENDOR_APPROVAL_REQUEST",
                "Vendor Service Update",
                vendor.getBusinessName() + " saved service details and needs admin review.",
                vendor.getId()
        );

        return ApiResponse.success("Vendor service profile saved.", mapVendor(vendor));
    }

    public ApiResponse getVendorApprovals() {
        List<Map<String, Object>> vendors = vendorRepository.findByApprovalStatusOrderByKycSubmittedAtDesc("Pending")
                .stream()
                .map(this::mapVendor)
                .collect(Collectors.toList());
        return ApiResponse.success("Vendor approval requests loaded.", vendors);
    }

    public ApiResponse getAllVendors() {
        List<Map<String, Object>> vendors = vendorRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapVendor)
                .collect(Collectors.toList());
        return ApiResponse.success("Vendors loaded.", vendors);
    }

    @Transactional
    public ApiResponse approveVendor(Long vendorId, StatusUpdateRequest request) {
        Vendor vendor = getVendorEntity(vendorId);
        vendor.setApprovalStatus("Approved");
        vendor.setKycStatus("Approved");
        vendor.setAdminMessage(defaultMessage(request == null ? null : request.getAdminMessage(),
                "Vendor approved successfully."));
        vendor.setApprovedAt(LocalDateTime.now());
        vendor.setRejectedAt(null);
        vendorRepository.save(vendor);

        publishVendorServices(vendor);
        createNotification(
                "VENDOR",
                vendor.getId(),
                "VENDOR_APPROVED",
                "Service Approved",
                "Your service profile has been approved and is now live in wedding services.",
                vendor.getId()
        );

        return ApiResponse.success("Vendor approved and published to wedding services.", mapVendor(vendor));
    }

    @Transactional
    public ApiResponse rejectVendor(Long vendorId, StatusUpdateRequest request) {
        Vendor vendor = getVendorEntity(vendorId);
        vendor.setApprovalStatus("Rejected");
        vendor.setKycStatus("Rejected");
        vendor.setAdminMessage(defaultMessage(request == null ? null : request.getAdminMessage(),
                "Vendor KYC rejected. Please correct the details and submit again."));
        vendor.setRejectedAt(LocalDateTime.now());
        vendor.setApprovedAt(null);
        vendorRepository.save(vendor);
        weddingServiceRepository.deleteAll(weddingServiceRepository.findByVendorId(vendor.getId()));
        createNotification(
                "VENDOR",
                vendor.getId(),
                "VENDOR_REJECTED",
                "Service Rejected",
                vendor.getAdminMessage(),
                vendor.getId()
        );

        return ApiResponse.success("Vendor rejected.", mapVendor(vendor));
    }

    public ApiResponse getApprovedWeddingServices() {
        List<Map<String, Object>> services = weddingServiceRepository.findAll()
                .stream()
                .filter(service -> service.getVendorId() != null)
                .map(this::mapWeddingService)
                .collect(Collectors.toList());
        return ApiResponse.success("Wedding services loaded.", services);
    }

    private void publishVendorServices(Vendor vendor) {
        List<String> serviceCategories = parseServices(vendor.getServices());
        Map<String, Object> serviceProfiles = readMap(vendor.getServiceProfilesJson());
        weddingServiceRepository.deleteAll(weddingServiceRepository.findByVendorId(vendor.getId()));

        for (String category : serviceCategories) {
            String id = "vendor-" + vendor.getId() + "-" + slug(category);
            WeddingService service = weddingServiceRepository.findById(id).orElse(new WeddingService());
            Map<String, Object> categoryProfile = readObjectMap(serviceProfiles.get(getServiceProfileKey(category)));
            List<Map<String, Object>> categoryPhotos = resolvePhotoList(categoryProfile.get("photos"), "");
            List<Map<String, Object>> categoryPackages = resolvePhotoList(categoryProfile.get("packages"), "");
            Map<String, Object> categoryDetails = resolveObjectMap(categoryProfile.get("serviceDetails"), "");
            String categoryDescription = firstNonEmptyText(
                    stringValue(categoryProfile.get("serviceDescription")),
                    "",
                    vendor.getDescription()
            );
            String coverImage = categoryPhotos.stream()
                    .filter(photo -> Boolean.TRUE.equals(photo.get("isCover")))
                    .map(photo -> clean(String.valueOf(photo.getOrDefault("uri", ""))))
                    .filter(this::hasText)
                    .findFirst()
                    .orElse(firstText(vendor.getImageName(), vendor.getPortfolioDocument()));
            service.setId(id);
            service.setTitle(vendor.getBusinessName());
            service.setCategory(category);
            service.setLocation(firstText(vendor.getLocation(), vendor.getCity()));
            service.setPrice(vendor.getStartingPrice());
            service.setImageName(coverImage);
            service.setRating(4.5);
            service.setDescription(buildPublishedDescription(categoryDescription, categoryDetails, categoryPackages));
            service.setGalleryImagesJson(writeJson(categoryPhotos));
            service.setPackagesJson(writeJson(categoryPackages));
            service.setServiceDetailsJson(writeJson(categoryDetails));
            service.setVendorId(vendor.getId());
            service.setVendorName(vendor.getBusinessName());
            service.setVendorPhone(vendor.getPhone());
            service.setVendorEmail(vendor.getEmail());
            service.setUpdatedAt(LocalDateTime.now());
            weddingServiceRepository.save(service);
        }
    }

    private Vendor getVendorEntity(Long vendorId) {
        return vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found."));
    }

    private boolean isApprovedOrLive(String status) {
        String normalized = clean(status);
        return "Approved".equalsIgnoreCase(normalized) || "Live".equalsIgnoreCase(normalized);
    }

    private void createNotification(String audience, Long userId, String type, String title, String message, Long requestId) {
        AdminNotification notification = new AdminNotification();
        notification.setAudience(audience);
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRequestId(requestId);
        notification.setReadStatus(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    private Map<String, Object> mapVendor(Vendor vendor) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", vendor.getId());
        data.put("businessName", vendor.getBusinessName());
        data.put("ownerName", vendor.getOwnerName());
        data.put("phone", vendor.getPhone());
        data.put("email", vendor.getEmail());
        data.put("phoneVerified", vendor.isPhoneVerified());
        data.put("services", parseServices(vendor.getServices()));
        data.put("city", vendor.getCity());
        data.put("location", vendor.getLocation());
        data.put("startingPrice", vendor.getStartingPrice());
        data.put("imageName", vendor.getImageName());
        data.put("description", vendor.getDescription());
        data.put("serviceDescription", firstText(vendor.getServiceDescription(), vendor.getDescription()));
        data.put("servicePhotos", readList(vendor.getServicePhotosJson()));
        data.put("servicePackages", readList(vendor.getServicePackagesJson()));
        data.put("serviceDetails", readMap(vendor.getServiceDetailsJson()));
        data.put("serviceProfiles", readMap(vendor.getServiceProfilesJson()));
        data.put("kycStatus", vendor.getKycStatus());
        data.put("approvalStatus", vendor.getApprovalStatus());
        data.put("idProofType", vendor.getIdProofType());
        data.put("idProofNumber", vendor.getIdProofNumber());
        data.put("idProofDocument", vendor.getIdProofDocument());
        data.put("businessDocument", vendor.getBusinessDocument());
        data.put("addressProofDocument", vendor.getAddressProofDocument());
        data.put("portfolioDocument", vendor.getPortfolioDocument());
        data.put("adminMessage", vendor.getAdminMessage());
        data.put("createdAt", vendor.getCreatedAt() == null ? null : vendor.getCreatedAt().toString());
        data.put("kycSubmittedAt", vendor.getKycSubmittedAt() == null ? null : vendor.getKycSubmittedAt().toString());
        data.put("approvedAt", vendor.getApprovedAt() == null ? null : vendor.getApprovedAt().toString());
        data.put("rejectedAt", vendor.getRejectedAt() == null ? null : vendor.getRejectedAt().toString());
        return data;
    }

    private Map<String, Object> mapWeddingService(WeddingService service) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", service.getId());
        data.put("title", service.getTitle());
        data.put("category", service.getCategory());
        data.put("location", service.getLocation());
        data.put("price", service.getPrice());
        data.put("imageName", service.getImageName());
        data.put("rating", service.getRating());
        data.put("description", service.getDescription());
        data.put("galleryPhotos", readList(service.getGalleryImagesJson()));
        data.put("packages", readList(service.getPackagesJson()));
        data.put("serviceDetails", readMap(service.getServiceDetailsJson()));
        data.put("vendorId", service.getVendorId());
        data.put("vendorName", service.getVendorName());
        data.put("vendorPhone", service.getVendorPhone());
        data.put("vendorEmail", service.getVendorEmail());
        data.put("updatedAt", service.getUpdatedAt() == null ? null : service.getUpdatedAt().toString());
        return data;
    }

    private List<String> sanitizeServices(List<String> services) {
        if (services == null) {
            return List.of();
        }

        return services.stream()
                .map(this::clean)
                .filter(this::hasText)
                .distinct()
                .collect(Collectors.toList());
    }

    private String buildPublishedDescription(String serviceDescription, Map<String, Object> details, List<Map<String, Object>> packages) {
        String detailsText = details.entrySet().stream()
                .filter(entry -> hasText(String.valueOf(entry.getValue())))
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining("\n"));
        String packageText = packages.stream()
                .map(pkg -> {
                    Object name = pkg.getOrDefault("name", "Package");
                    Object price = pkg.getOrDefault("price", "Contact");
                    Object includes = pkg.getOrDefault("includes", "");
                    return name + " - ₹" + price + (hasText(String.valueOf(includes)) ? " (" + includes + ")" : "");
                })
                .collect(Collectors.joining("\n"));

        return List.of(
                        serviceDescription,
                        detailsText,
                        hasText(packageText) ? "Packages:\n" + packageText : ""
                )
                .stream()
                .filter(this::hasText)
                .collect(Collectors.joining("\n\n"));
    }

    private String lowestPackagePrice(List<Map<String, Object>> packages) {
        double lowest = packages.stream()
                .map(pkg -> String.valueOf(pkg.getOrDefault("price", "")))
                .map(value -> value.replaceAll("[^0-9.]", ""))
                .filter(this::hasText)
                .mapToDouble(value -> {
                    try {
                        return Double.parseDouble(value);
                    } catch (Exception error) {
                        return 0;
                    }
                })
                .filter(value -> value > 0)
                .min()
                .orElse(0);

        return lowest > 0 ? "₹" + Math.round(lowest) + " onwards" : "";
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception error) {
            return "";
        }
    }

    private List<Map<String, Object>> readList(String json) {
        if (!hasText(json)) {
            return List.of();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception error) {
            return List.of();
        }
    }

    private Map<String, Object> readMap(String json) {
        if (!hasText(json)) {
            return Map.of();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception error) {
            return Map.of();
        }
    }

    private Map<String, Object> readObjectMap(Object value) {
        if (!(value instanceof Map<?, ?>)) {
            return new LinkedHashMap<>();
        }

        Map<String, Object> result = new LinkedHashMap<>();
        ((Map<?, ?>) value).forEach((key, entryValue) -> result.put(String.valueOf(key), entryValue));
        return result;
    }

    private List<Map<String, Object>> readPhotoList(Object value) {
        if (!(value instanceof List<?>)) {
            return List.of();
        }

        return ((List<?>) value).stream()
                .filter(item -> item instanceof Map<?, ?>)
                .map(this::readObjectMap)
                .collect(Collectors.toList());
    }

    private Map<String, Object> copyObjectMap(Map<String, Object> value) {
        return value == null ? new LinkedHashMap<>() : new LinkedHashMap<>(value);
    }

    private List<Map<String, Object>> resolvePhotoList(Object value, String fallbackJson) {
        List<Map<String, Object>> photos = readPhotoList(value);
        return !photos.isEmpty() ? photos : readList(fallbackJson);
    }

    private Map<String, Object> resolveObjectMap(Object value, String fallbackJson) {
        Map<String, Object> map = readObjectMap(value);
        return !map.isEmpty() ? map : readMap(fallbackJson);
    }

    private String firstNonEmptyText(String first, String second, String third) {
        return hasText(first) ? first.trim() : firstText(second, third);
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String getServiceProfileKey(String category) {
        return clean(category).toLowerCase();
    }

    private List<String> parseServices(String services) {
        if (!hasText(services)) {
            return List.of();
        }

        return Arrays.stream(services.split(","))
                .map(this::clean)
                .filter(this::hasText)
                .collect(Collectors.toList());
    }

    private void validateRegisterRequest(VendorRegisterRequest request, String email, String phone, List<String> services) {
        required(request.getBusinessName(), "Business name is required.");
        required(request.getOwnerName(), "Owner name is required.");

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new IllegalArgumentException("Please enter a valid 10-digit vendor mobile number.");
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Please enter a valid vendor email address.");
        }

        if (services.isEmpty()) {
            throw new IllegalArgumentException("Please select at least one vendor service.");
        }

        if (request.getPassword() == null || request.getPassword().trim().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }
    }

    private void requireFreshVerifiedPhoneOtp(String phone) {
        PhoneOtp latestOtp = phoneOtpRepository.findTopByPhoneOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new IllegalArgumentException("Phone OTP verification is required."));

        if (!latestOtp.isVerified()) {
            throw new IllegalArgumentException("Please verify vendor phone number with OTP before registering.");
        }

        LocalDateTime verifiedWindowEnd = latestOtp.getCreatedAt()
                .plusMinutes(VENDOR_OTP_VALID_MINUTES_AFTER_VERIFY);
        if (verifiedWindowEnd.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Vendor OTP verification expired. Please send and verify OTP again.");
        }
    }

    private String required(String value, String message) {
        if (!hasText(value)) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private String valueOrCurrent(String incoming, String current) {
        return hasText(incoming) ? incoming.trim() : current;
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String defaultMessage(String incoming, String fallback) {
        return hasText(incoming) ? incoming.trim() : fallback;
    }

    private String firstText(String first, String second) {
        return hasText(first) ? first.trim() : clean(second);
    }

    private String vendorStatusMessage(Vendor vendor) {
        String approvalStatus = clean(vendor.getApprovalStatus());
        String kycStatus = clean(vendor.getKycStatus());

        if ("KYC Pending".equalsIgnoreCase(approvalStatus) || "Not Submitted".equalsIgnoreCase(kycStatus)) {
            return "Please submit vendor documents for admin verification before signing in.";
        }

        if ("Pending".equalsIgnoreCase(approvalStatus)) {
            return "Your vendor documents are waiting for admin verification.";
        }

        if ("Rejected".equalsIgnoreCase(approvalStatus)) {
            return hasText(vendor.getAdminMessage())
                    ? vendor.getAdminMessage()
                    : "Vendor verification was rejected. Please update documents and submit again.";
        }

        return "Vendor account is not approved yet.";
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.trim();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String slug(String value) {
        String normalized = Normalizer.normalize(value == null ? "service" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        return normalized.isBlank() ? "service" : normalized;
    }
}
