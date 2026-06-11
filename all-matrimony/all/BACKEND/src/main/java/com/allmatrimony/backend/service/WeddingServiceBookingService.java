package com.allmatrimony.backend.service;

import com.allmatrimony.backend.config.RazorpayProperties;
import com.allmatrimony.backend.dto.ServiceBookingPaymentVerifyRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.allmatrimony.backend.dto.ServiceBookingRequest;
import com.allmatrimony.backend.dto.ServiceBookingResponse;
import com.allmatrimony.backend.entity.AdminNotification;
import com.allmatrimony.backend.entity.ServiceBookingPayment;
import com.allmatrimony.backend.entity.ServiceCustomer;
import com.allmatrimony.backend.entity.ServiceRequest;
import com.allmatrimony.backend.entity.User;
import com.allmatrimony.backend.repository.AdminNotificationRepository;
import com.allmatrimony.backend.repository.ServiceBookingPaymentRepository;
import com.allmatrimony.backend.repository.ServiceCustomerRepository;
import com.allmatrimony.backend.repository.ServiceRequestRepository;
import com.allmatrimony.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WeddingServiceBookingService {

    private static final Pattern ORDER_ID_PATTERN = Pattern.compile("\"id\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern ORDER_STATUS_PATTERN = Pattern.compile("\"status\"\\s*:\\s*\"([^\"]+)\"");

    private final ServiceCustomerRepository customerRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceBookingPaymentRepository bookingPaymentRepository;
    private final UserRepository userRepository;
    private final AdminNotificationRepository notificationRepository;
    private final RazorpayProperties razorpayProperties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public WeddingServiceBookingService(
            ServiceCustomerRepository customerRepository,
            ServiceRequestRepository serviceRequestRepository,
            ServiceBookingPaymentRepository bookingPaymentRepository,
            UserRepository userRepository,
            AdminNotificationRepository notificationRepository,
            RazorpayProperties razorpayProperties,
            ObjectMapper objectMapper
    ) {
        this.customerRepository = customerRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.bookingPaymentRepository = bookingPaymentRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.razorpayProperties = razorpayProperties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public Map<String, Object> createServiceBookingOrder(Long userId, ServiceBookingRequest request) {
        User user = getUser(userId);
        String userKey = resolveUserKey(request);
        ServiceCustomer customer = resolveOrCreateCustomer(user, userKey, request);

        int amount = extractAmountInPaise(
                request.paymentAmount() != null
                        ? String.valueOf(request.paymentAmount())
                        : hasText(request.packagePrice())
                        ? request.packagePrice()
                        : request.price()
        );
        if (amount <= 0) {
            throw new RuntimeException("Unable to determine booking amount.");
        }

        if (isBlank(razorpayProperties.getKeyId()) || isBlank(razorpayProperties.getKeySecret())) {
            throw new RuntimeException("Razorpay keys are not configured.");
        }

        String currency = isBlank(razorpayProperties.getCurrency()) ? "INR" : razorpayProperties.getCurrency();
        String receipt = "svc_" + userId + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String payload = "{"
                + "\"amount\":" + amount + ","
                + "\"currency\":\"" + currency + "\","
                + "\"receipt\":\"" + receipt + "\","
                + "\"notes\":{\"userId\":\"" + userId + "\",\"serviceId\":\"" + safe(request.serviceId()) + "\",\"vendorId\":\"" + safe(request.vendorId() == null ? null : String.valueOf(request.vendorId())) + "\"}"
                + "}";

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.razorpay.com/v1/orders"))
                .header("Authorization", buildBasicAuthHeader())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpResponse<String> response;

        try {
            response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (Exception error) {
            throw new RuntimeException("Unable to create Razorpay order right now.");
        }

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException("Razorpay order creation failed.");
        }

        String razorpayOrderId = extractJsonValue(response.body(), ORDER_ID_PATTERN);
        String orderStatus = extractJsonValue(response.body(), ORDER_STATUS_PATTERN);
        if (isBlank(razorpayOrderId)) {
            throw new RuntimeException("Razorpay order response is invalid.");
        }

        ServiceBookingPayment payment = new ServiceBookingPayment();
        payment.setUserId(userId);
        payment.setServiceId(request.serviceId());
        payment.setVendorId(request.vendorId());
        payment.setServiceTitle(request.serviceTitle());
        payment.setCategory(request.category());
        payment.setLocation(request.location());
        payment.setPrice(request.price());
        payment.setPackageName(request.packageName());
        payment.setPackagePrice(request.packagePrice());
        payment.setAmount(amount);
        payment.setBookingDate(request.bookingDate());
        payment.setBookingEndDate(request.bookingEndDate());
        payment.setBookingTime(request.bookingTime());
        payment.setCustomerName(customer.getFullName());
        payment.setPhone(customer.getPhone());
        payment.setEmail(customer.getEmail());
        payment.setCustomerLocation(customer.getCity() != null && !customer.getCity().isBlank()
                ? customer.getCity()
                : customer.getAddress());
        payment.setCurrency(currency);
        payment.setStatus(isBlank(orderStatus) ? "created" : orderStatus);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setBookingPayloadJson(writeJson(buildBookingPayload(user, customer, request, amount, currency)));
        payment.setCreatedAt(LocalDateTime.now());
        bookingPaymentRepository.save(payment);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("keyId", razorpayProperties.getKeyId());
        data.put("orderId", razorpayOrderId);
        data.put("amount", amount);
        data.put("currency", currency);
        data.put("serviceTitle", request.serviceTitle());
        data.put("description", "Secure service booking payment for " + request.serviceTitle());
        data.put("prefill", buildPrefill(user, customer));
        data.put("booking", buildBookingPayload(user, customer, request, amount, currency));
        return data;
    }

    public ServiceBookingResponse verifyServiceBookingPayment(Long userId, ServiceBookingPaymentVerifyRequest request) {
        ServiceBookingPayment payment = bookingPaymentRepository.findByRazorpayOrderId(request.razorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment order not found."));

        if (!payment.getUserId().equals(userId)) {
            throw new RuntimeException("This payment does not belong to the logged-in user.");
        }

        String generatedSignature = hmacSha256(
                request.razorpayOrderId() + "|" + request.razorpayPaymentId(),
                razorpayProperties.getKeySecret()
        );

        if (!generatedSignature.equals(request.razorpaySignature())) {
            throw new RuntimeException("Razorpay payment signature verification failed.");
        }

        payment.setRazorpayPaymentId(request.razorpayPaymentId());
        payment.setRazorpaySignature(request.razorpaySignature());
        payment.setStatus("paid");
        payment.setPaidAt(LocalDateTime.now());
        bookingPaymentRepository.save(payment);

        Map<String, Object> bookingPayload = readMap(payment.getBookingPayloadJson());
        ServiceBookingRequest bookingRequest = new ServiceBookingRequest(
                userId,
                String.valueOf(userId),
                stringValue(bookingPayload.get("serviceId")),
                toLong(bookingPayload.get("vendorId")),
                stringValue(bookingPayload.get("serviceTitle")),
                stringValue(bookingPayload.get("category")),
                stringValue(bookingPayload.get("location")),
                stringValue(bookingPayload.get("price")),
                toInteger(bookingPayload.get("paymentAmount")),
                stringValue(bookingPayload.get("packageName")),
                stringValue(bookingPayload.get("packagePrice")),
                stringValue(bookingPayload.get("bookingDate")),
                stringValue(bookingPayload.get("bookingEndDate")),
                stringValue(bookingPayload.get("bookingTime")),
                stringValue(bookingPayload.get("customerName")),
                stringValue(bookingPayload.get("phone")),
                stringValue(bookingPayload.get("email")),
                stringValue(bookingPayload.get("customerLocation"))
        );

        ServiceCustomer customer = resolveOrCreateCustomer(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")), String.valueOf(userId), bookingRequest);
        ServiceRequest serviceRequest = new ServiceRequest();
        serviceRequest.setCustomer(customer);
        serviceRequest.setServiceId(bookingRequest.serviceId());
        serviceRequest.setVendorId(resolveVendorId(bookingRequest));
        serviceRequest.setServiceTitle(bookingRequest.serviceTitle());
        serviceRequest.setCategory(bookingRequest.category());
        serviceRequest.setLocation(bookingRequest.location());
        serviceRequest.setPrice(bookingRequest.price());
        serviceRequest.setPackageName(bookingRequest.packageName());
        serviceRequest.setPackagePrice(bookingRequest.packagePrice());
        serviceRequest.setBookingDate(bookingRequest.bookingDate());
        serviceRequest.setBookingEndDate(bookingRequest.bookingEndDate());
        serviceRequest.setBookingTime(bookingRequest.bookingTime());
        serviceRequest.setPaymentStatus("PAID");
        serviceRequest.setPaymentAmount(payment.getAmount());
        serviceRequest.setPaymentCurrency(payment.getCurrency());
        serviceRequest.setRazorpayOrderId(payment.getRazorpayOrderId());
        serviceRequest.setRazorpayPaymentId(payment.getRazorpayPaymentId());
        serviceRequest.setRazorpaySignature(payment.getRazorpaySignature());
        serviceRequest.setPaymentVerifiedAt(LocalDateTime.now());
        serviceRequest.setStatus("PENDING");
        serviceRequest.setAdminMessage(buildDecisionMessage(serviceRequest, "PENDING", null));

        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);

        notifyVendorAboutRequest(saved, customer.getFullName(), true);
        createNotification(
                "USER",
                parseUserId(customer.getUserKey()),
                "SERVICE_REQUEST_SENT",
                "Service Request Sent",
                "Your " + saved.getServiceTitle() + " booking has been paid and sent to the vendor for approval.",
                saved.getId()
        );

        return new ServiceBookingResponse(
                true,
                true,
                saved.getId(),
                saved.getStatus(),
                false,
                "Payment verified and service booking sent to admin."
        );
    }

    public ServiceBookingResponse sendBookingRequest(ServiceBookingRequest request) {
        String userKey = resolveUserKey(request);
        User user = request.userId() != null
                ? getUser(request.userId())
                : resolveUserByKey(userKey);
        ServiceCustomer customer = resolveOrCreateCustomer(user, userKey, request);

        ServiceRequest serviceRequest = new ServiceRequest();
        serviceRequest.setCustomer(customer);
        serviceRequest.setServiceId(request.serviceId());
        serviceRequest.setVendorId(resolveVendorId(request));
        serviceRequest.setServiceTitle(request.serviceTitle());
        serviceRequest.setCategory(request.category());
        serviceRequest.setLocation(request.location());
        serviceRequest.setPrice(request.price());
        serviceRequest.setPackageName(request.packageName());
        serviceRequest.setPackagePrice(request.packagePrice());
        serviceRequest.setBookingDate(request.bookingDate());
        serviceRequest.setBookingEndDate(request.bookingEndDate());
        serviceRequest.setBookingTime(request.bookingTime());
        serviceRequest.setStatus("PENDING");
        serviceRequest.setAdminMessage(buildDecisionMessage(serviceRequest, "PENDING", null));

        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);

        notifyVendorAboutRequest(saved, customer.getFullName(), false);
        createNotification(
                "USER",
                parseUserId(customer.getUserKey()),
                "SERVICE_REQUEST_SENT",
                "Service Request Sent",
                "Your " + saved.getServiceTitle() + " booking request has been sent to the vendor for approval.",
                saved.getId()
        );

        return new ServiceBookingResponse(
                true,
                true,
                saved.getId(),
                saved.getStatus(),
                false,
                "Service booking request sent successfully"
        );
    }

    public List<ServiceRequest> getRequestsForUser(Long userId) {
        return serviceRequestRepository.findByCustomerUserKeyOrderByRequestedAtDesc(String.valueOf(userId));
    }

    public List<ServiceRequest> getRequestsForVendor(Long vendorId) {
        return serviceRequestRepository.findByVendorIdOrderByRequestedAtDesc(vendorId);
    }

    public ServiceRequest updateRequestStatus(Long requestId, String status, String adminMessage) {
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));

        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();

        if (!normalizedStatus.equals("APPROVED") && !normalizedStatus.equals("REJECTED")) {
            throw new RuntimeException("Status must be APPROVED or REJECTED");
        }

        request.setStatus(normalizedStatus);
        request.setAdminMessage(buildDecisionMessage(request, normalizedStatus, adminMessage));
        request.setStatusUpdatedAt(LocalDateTime.now());

        ServiceCustomer customer = request.getCustomer();
        if (normalizedStatus.equals("APPROVED")) {
            customer.setServiceApproved(true);
            customerRepository.save(customer);
        }

        createNotification(
                "USER",
                parseUserId(customer.getUserKey()),
                normalizedStatus.equals("APPROVED")
                        ? "SERVICE_BOOKING_APPROVED"
                        : "SERVICE_BOOKING_REJECTED",
                normalizedStatus.equals("APPROVED")
                        ? "Service Booking Approved"
                        : "Service Booking Rejected",
                request.getAdminMessage(),
                request.getId()
        );

        if (normalizedStatus.equals("APPROVED") && request.getVendorId() != null) {
            createNotification(
                    "VENDOR",
                    request.getVendorId(),
                    "SERVICE_BOOKING_APPROVED",
                    "Booking Approved",
                    "A customer booking for " + request.getServiceTitle() + " has been approved by admin.",
                    request.getId()
            );
        }

        return serviceRequestRepository.save(request);
    }

    public ServiceRequest updateVendorRequestStatus(Long vendorId, Long requestId, String status, String vendorMessage) {
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));

        if (request.getVendorId() == null || !request.getVendorId().equals(vendorId)) {
            throw new RuntimeException("This booking does not belong to the logged-in vendor.");
        }

        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        if (!normalizedStatus.equals("APPROVED") && !normalizedStatus.equals("REJECTED")) {
            throw new RuntimeException("Status must be APPROVED or REJECTED");
        }

        request.setStatus(normalizedStatus);
        request.setAdminMessage(buildDecisionMessage(request, normalizedStatus, vendorMessage));
        request.setStatusUpdatedAt(LocalDateTime.now());

        ServiceCustomer customer = request.getCustomer();
        if (normalizedStatus.equals("APPROVED")) {
            customer.setServiceApproved(true);
            customerRepository.save(customer);
        }

        createNotification(
                "USER",
                parseUserId(customer.getUserKey()),
                normalizedStatus.equals("APPROVED")
                        ? "SERVICE_BOOKING_APPROVED"
                        : "SERVICE_BOOKING_REJECTED",
                normalizedStatus.equals("APPROVED")
                        ? "Service Booking Approved"
                        : "Service Booking Rejected",
                request.getAdminMessage(),
                request.getId()
        );

        createNotification(
                "ADMIN",
                null,
                normalizedStatus.equals("APPROVED")
                        ? "SERVICE_BOOKING_APPROVED"
                        : "SERVICE_BOOKING_REJECTED",
                normalizedStatus.equals("APPROVED")
                        ? "Vendor Approved Booking"
                        : "Vendor Rejected Booking",
                customer.getFullName() + " " + (normalizedStatus.equals("APPROVED") ? "approved" : "rejected") +
                        " a booking request for " + request.getServiceTitle() + ".",
                request.getId()
        );

        return serviceRequestRepository.save(request);
    }

    private String buildDecisionMessage(ServiceRequest request, String status, String adminMessage) {
        if (adminMessage != null && !adminMessage.trim().isEmpty()) {
            return adminMessage.trim();
        }

        String serviceTitle = request.getServiceTitle() == null
                ? "Wedding Service"
                : request.getServiceTitle();

        if ("APPROVED".equals(status)) {
            return "Your " + serviceTitle + " booking request is approved. Vendor will contact you soon.";
        }

        if ("PENDING".equals(status)) {
            return "Your " + serviceTitle + " booking request has been sent to the vendor for approval.";
        }

        return "Your " + serviceTitle + " booking request is rejected. Please contact support for details.";
    }

    private Long parseUserId(String userKey) {
        try {
            return Long.valueOf(userKey);
        } catch (Exception error) {
            return null;
        }
    }

    private void createNotification(
            String audience,
            Long userId,
            String type,
            String title,
            String message,
            Long requestId
    ) {
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

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String resolveUserKey(ServiceBookingRequest request) {
        if (hasText(request.userKey())) {
            return request.userKey().trim();
        }

        if (request.userId() != null) {
            return String.valueOf(request.userId());
        }

        if (hasText(request.email())) {
            User user = userRepository.findByEmail(request.email().trim())
                    .orElseThrow(() -> new RuntimeException("User not found for service booking"));
            return String.valueOf(user.getId());
        }

        throw new RuntimeException("userId or userKey is required");
    }

    private int extractAmountInPaise(String price) {
        if (!hasText(price)) {
            return 0;
        }

        String digits = price.replaceAll("[^0-9.]", "");
        if (!hasText(digits)) {
            return 0;
        }

        try {
            double value = Double.parseDouble(digits);
            if (value <= 0) {
                return 0;
            }
            return (int) Math.round(value * 100);
        } catch (Exception error) {
            return 0;
        }
    }

    private Map<String, Object> buildBookingPayload(User user, ServiceCustomer customer, ServiceBookingRequest request, int amount, String currency) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", user.getId());
        data.put("userKey", String.valueOf(user.getId()));
        data.put("serviceId", request.serviceId());
        data.put("vendorId", request.vendorId());
        data.put("serviceTitle", request.serviceTitle());
        data.put("category", request.category());
        data.put("location", request.location());
        data.put("price", request.price());
        data.put("packageName", request.packageName());
        data.put("packagePrice", request.packagePrice());
        data.put("paymentAmount", amount / 100);
        data.put("bookingDate", request.bookingDate());
        data.put("bookingEndDate", request.bookingEndDate());
        data.put("bookingTime", request.bookingTime());
        data.put("customerName", customer.getFullName());
        data.put("phone", customer.getPhone());
        data.put("email", customer.getEmail());
        data.put("customerLocation", customer.getCity() != null && !customer.getCity().isBlank()
                ? customer.getCity()
                : customer.getAddress());
        data.put("amount", amount);
        data.put("currency", currency);
        return data;
    }

    private Map<String, Object> buildPrefill(User user, ServiceCustomer customer) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", hasText(customer.getFullName()) ? customer.getFullName() : user.getName());
        data.put("email", hasText(customer.getEmail()) ? customer.getEmail() : user.getEmail());
        data.put("contact", hasText(customer.getPhone()) ? customer.getPhone() : user.getPhone());
        return data;
    }

    private String buildBasicAuthHeader() {
        String token = razorpayProperties.getKeyId() + ":" + razorpayProperties.getKeySecret();
        return "Basic " + Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }

    private String extractJsonValue(String source, Pattern pattern) {
        Matcher matcher = pattern.matcher(source == null ? "" : source);
        return matcher.find() ? matcher.group(1) : "";
    }

    private String hmacSha256(String value, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();

            for (byte item : hash) {
                builder.append(String.format("%02x", item));
            }

            return builder.toString();
        } catch (Exception error) {
            throw new RuntimeException("Unable to verify Razorpay signature.");
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception error) {
            return "";
        }
    }

    private Map<String, Object> readMap(String json) {
        if (!hasText(json)) {
            return Map.of();
        }

        try {
            return objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        } catch (Exception error) {
            return Map.of();
        }
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private Long toLong(Object value) {
        try {
            if (value == null) {
                return null;
            }
            String text = String.valueOf(value).trim();
            if (text.isEmpty()) {
                return null;
            }
            return Long.valueOf(text);
        } catch (Exception error) {
            return null;
        }
    }

    private Integer toInteger(Object value) {
        try {
            if (value == null) {
                return null;
            }
            String text = String.valueOf(value).trim();
            if (text.isEmpty()) {
                return null;
            }
            if (text.contains(".")) {
                return (int) Math.round(Double.parseDouble(text));
            }
            return Integer.valueOf(text);
        } catch (Exception error) {
            return null;
        }
    }

    private String safe(String value) {
        return value == null ? "" : value.replace("\"", "'");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private Long resolveVendorId(ServiceBookingRequest request) {
        if (request.vendorId() != null) {
            return request.vendorId();
        }

        String serviceId = request.serviceId();
        if (serviceId == null || !serviceId.startsWith("vendor-")) {
            return null;
        }

        String[] parts = serviceId.split("-");
        if (parts.length < 2) {
            return null;
        }

        try {
            return Long.valueOf(parts[1]);
        } catch (Exception error) {
            return null;
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private User resolveUserByKey(String userKey) {
        Long userId = parseUserId(userKey);
        if (userId != null) {
            return getUser(userId);
        }

        if (hasText(userKey)) {
            return userRepository.findByEmail(userKey.trim())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        throw new RuntimeException("User not found");
    }

    private ServiceCustomer resolveOrCreateCustomer(User user, String userKey, ServiceBookingRequest request) {
        String normalizedUserKey = hasText(userKey) ? userKey.trim() : String.valueOf(user.getId());
        return customerRepository.findByUserKey(normalizedUserKey)
                .orElseGet(() -> {
                    ServiceCustomer customer = new ServiceCustomer();
                    customer.setUserKey(normalizedUserKey);
                    customer.setFullName(firstText(request.customerName(), user.getName()));
                    customer.setPhone(firstText(request.phone(), user.getPhone()));
                    customer.setEmail(firstText(request.email(), user.getEmail()));
                    customer.setAddress(firstText(request.customerLocation(), user.getLocation()));
                    customer.setCity(firstText(request.customerLocation(), user.getLocation()));
                    customer.setServiceApproved(true);
                    return customerRepository.save(customer);
        });
    }

    private void notifyVendorAboutRequest(ServiceRequest request, String customerName, boolean paid) {
        if (request.getVendorId() == null) {
            createNotification(
                    "ADMIN",
                    null,
                    "SERVICE_BOOKING_REQUEST",
                    "New Wedding Service Booking",
                    customerName + (paid ? " paid and " : " ") + "submitted a booking request for " + request.getServiceTitle() + ".",
                    request.getId()
            );
            return;
        }

        createNotification(
                "VENDOR",
                request.getVendorId(),
                "SERVICE_BOOKING_REQUEST",
                "New Booking Request",
                customerName + (paid ? " paid and " : " ") + "submitted a booking request for " + request.getServiceTitle() + ".",
                request.getId()
        );
    }

    private String firstText(String primary, String fallback) {
        return hasText(primary) ? primary.trim() : (fallback == null ? "" : fallback.trim());
    }
}
