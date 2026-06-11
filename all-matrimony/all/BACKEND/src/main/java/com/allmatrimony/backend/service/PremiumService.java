package com.allmatrimony.backend.service;

import com.allmatrimony.backend.config.RazorpayProperties;
import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.PremiumOrderRequest;
import com.allmatrimony.backend.dto.PremiumPaymentVerifyRequest;
import com.allmatrimony.backend.entity.PremiumPayment;
import com.allmatrimony.backend.entity.User;
import com.allmatrimony.backend.repository.PremiumPaymentRepository;
import com.allmatrimony.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PremiumService {
    private static final Pattern ORDER_ID_PATTERN = Pattern.compile("\"id\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern ORDER_STATUS_PATTERN = Pattern.compile("\"status\"\\s*:\\s*\"([^\"]+)\"");

    private final UserRepository userRepository;
    private final PremiumPaymentRepository premiumPaymentRepository;
    private final RazorpayProperties razorpayProperties;
    private final HttpClient httpClient;

    public PremiumService(
            UserRepository userRepository,
            PremiumPaymentRepository premiumPaymentRepository,
            RazorpayProperties razorpayProperties
    ) {
        this.userRepository = userRepository;
        this.premiumPaymentRepository = premiumPaymentRepository;
        this.razorpayProperties = razorpayProperties;
        this.httpClient = HttpClient.newHttpClient();
    }

    public ApiResponse getPremiumPlans(Long userId) {
        User user = getUser(userId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("currentPlan", normalizePlan(user.getPremiumPlan()));
        data.put("premiumStatus", normalizePremiumStatus(user.getPremiumStatus()));
        data.put("plans", buildPlans());
        return ApiResponse.success("Premium plans loaded.", data);
    }

    @Transactional
    public ApiResponse createPremiumOrder(Long userId, PremiumOrderRequest request) {
        User user = getUser(userId);
        String planCode = normalizePlan(request.getPlanCode());

        if ("FREE".equals(planCode)) {
            applyFreePlan(user);
            userRepository.save(user);
            return ApiResponse.success("Free plan is already active.", buildUserPremiumPayload(user));
        }

        PlanDefinition plan = getPlanDefinition(planCode);

        if (isBlank(razorpayProperties.getKeyId()) || isBlank(razorpayProperties.getKeySecret())) {
            throw new IllegalArgumentException("Razorpay keys are not configured.");
        }

        String receipt = "premium_" + userId + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String currency = isBlank(razorpayProperties.getCurrency()) ? "INR" : razorpayProperties.getCurrency();
        String payload = "{"
                + "\"amount\":" + plan.amountInPaise + ","
                + "\"currency\":\"" + currency + "\","
                + "\"receipt\":\"" + receipt + "\","
                + "\"notes\":{\"userId\":\"" + userId + "\",\"planCode\":\"" + planCode + "\"}"
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
            throw new IllegalArgumentException("Unable to create Razorpay order right now.");
        }

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalArgumentException("Razorpay order creation failed.");
        }

        String razorpayOrderId = extractJsonValue(response.body(), ORDER_ID_PATTERN);
        String orderStatus = extractJsonValue(response.body(), ORDER_STATUS_PATTERN);

        if (isBlank(razorpayOrderId)) {
            throw new IllegalArgumentException("Razorpay order response is invalid.");
        }

        PremiumPayment premiumPayment = new PremiumPayment();
        premiumPayment.setUserId(userId);
        premiumPayment.setPlanCode(planCode);
        premiumPayment.setAmount(plan.amountInPaise);
        premiumPayment.setCurrency(currency);
        premiumPayment.setRazorpayOrderId(razorpayOrderId);
        premiumPayment.setStatus(isBlank(orderStatus) ? "created" : orderStatus);
        premiumPayment.setCreatedAt(LocalDateTime.now());
        premiumPaymentRepository.save(premiumPayment);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("keyId", razorpayProperties.getKeyId());
        data.put("orderId", razorpayOrderId);
        data.put("amount", plan.amountInPaise);
        data.put("currency", currency);
        data.put("planCode", planCode);
        data.put("planName", plan.displayName);
        data.put("description", plan.description);
        data.put("prefill", buildPrefill(user));
        return ApiResponse.success("Premium order created.", data);
    }

    @Transactional
    public ApiResponse verifyPremiumPayment(Long userId, PremiumPaymentVerifyRequest request) {
        User user = getUser(userId);
        String planCode = normalizePlan(request.getPlanCode());
        PremiumPayment payment = premiumPaymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Payment order not found."));

        if (!payment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("This payment does not belong to the logged-in user.");
        }

        if (!normalizePlan(payment.getPlanCode()).equals(planCode)) {
            throw new IllegalArgumentException("Payment plan mismatch.");
        }

        String generatedSignature = hmacSha256(
                request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId(),
                razorpayProperties.getKeySecret()
        );

        if (!generatedSignature.equals(request.getRazorpaySignature())) {
            throw new IllegalArgumentException("Razorpay payment signature verification failed.");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus("paid");
        payment.setPaidAt(LocalDateTime.now());
        premiumPaymentRepository.save(payment);

        user.setPremiumPlan(planCode);
        user.setPremiumStatus("ACTIVE");
        user.setPremiumOrderId(request.getRazorpayOrderId());
        user.setPremiumPaymentId(request.getRazorpayPaymentId());
        user.setPremiumActivatedAt(LocalDateTime.now());
        userRepository.save(user);

        return ApiResponse.success("Premium membership activated.", buildUserPremiumPayload(user));
    }

    public boolean canViewFullProfile(User user) {
        String plan = normalizePlan(user.getPremiumPlan());
        return "SILVER".equals(plan) || "GOLD".equals(plan);
    }

    public boolean canChat(User user) {
        return "GOLD".equals(normalizePlan(user.getPremiumPlan()));
    }

    private Map<String, Object> buildUserPremiumPayload(User user) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("premiumPlan", normalizePlan(user.getPremiumPlan()));
        data.put("premiumStatus", normalizePremiumStatus(user.getPremiumStatus()));
        data.put("premiumOrderId", user.getPremiumOrderId());
        data.put("premiumPaymentId", user.getPremiumPaymentId());
        data.put("premiumActivatedAt", user.getPremiumActivatedAt() == null ? null : user.getPremiumActivatedAt().toString());
        data.put("features", buildFeaturesForPlan(normalizePlan(user.getPremiumPlan())));
        return data;
    }

    private Map<String, Object> buildPrefill(User user) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("contact", user.getPhone());
        return data;
    }

    private void applyFreePlan(User user) {
        user.setPremiumPlan("FREE");
        user.setPremiumStatus("ACTIVE");
        user.setPremiumOrderId("");
        user.setPremiumPaymentId("");
        if (user.getPremiumActivatedAt() == null) {
            user.setPremiumActivatedAt(LocalDateTime.now());
        }
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
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();

            for (byte item : hash) {
                builder.append(String.format("%02x", item));
            }

            return builder.toString();
        } catch (Exception error) {
            throw new IllegalArgumentException("Unable to verify Razorpay signature.");
        }
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }

    private Map<String, Object> buildPlans() {
        Map<String, Object> plans = new LinkedHashMap<>();
        plans.put("FREE", buildPlanMap(getPlanDefinition("FREE")));
        plans.put("SILVER", buildPlanMap(getPlanDefinition("SILVER")));
        plans.put("GOLD", buildPlanMap(getPlanDefinition("GOLD")));
        return plans;
    }

    private Map<String, Object> buildPlanMap(PlanDefinition plan) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("code", plan.code);
        data.put("name", plan.displayName);
        data.put("amount", plan.amountInPaise);
        data.put("currency", isBlank(razorpayProperties.getCurrency()) ? "INR" : razorpayProperties.getCurrency());
        data.put("description", plan.description);
        data.put("features", plan.features);
        return data;
    }

    private PlanDefinition getPlanDefinition(String code) {
        return switch (normalizePlan(code)) {
            case "FREE" -> new PlanDefinition(
                    "FREE",
                    "Free",
                    0,
                    "Browse profile cards and match suggestions.",
                    new String[]{
                            "See match cards and photos",
                            "Basic browse access",
                            "Upgrade later for more access"
                    }
            );
            case "SILVER" -> new PlanDefinition(
                    "SILVER",
                    "Silver",
                    99900,
                    "Unlock complete bride and groom profile details.",
                    new String[]{
                            "View full profile details",
                            "See education, job, income and about section",
                            "Best for serious shortlisting"
                    }
            );
            case "GOLD" -> new PlanDefinition(
                    "GOLD",
                    "Gold",
                    199900,
                    "Unlock full profiles plus direct chat after accepted interests.",
                    new String[]{
                            "Everything in Silver",
                            "Open chat with accepted matches",
                            "Top premium member experience"
                    }
            );
            default -> throw new IllegalArgumentException("Unsupported premium plan.");
        };
    }

    private String normalizePlan(String planCode) {
        return isBlank(planCode) ? "FREE" : planCode.trim().toUpperCase();
    }

    private String normalizePremiumStatus(String premiumStatus) {
        return isBlank(premiumStatus) ? "ACTIVE" : premiumStatus.trim().toUpperCase();
    }

    private String[] buildFeaturesForPlan(String planCode) {
        return getPlanDefinition(planCode).features;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record PlanDefinition(
            String code,
            String displayName,
            int amountInPaise,
            String description,
            String[] features
    ) {
    }
}
