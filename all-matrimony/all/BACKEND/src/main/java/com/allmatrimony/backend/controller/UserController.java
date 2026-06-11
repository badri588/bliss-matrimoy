package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.ChatMessageCreateRequest;
import com.allmatrimony.backend.dto.InterestCreateRequest;
import com.allmatrimony.backend.dto.InterestStatusUpdateRequest;
import com.allmatrimony.backend.dto.ProfileUpdateRequest;
import com.allmatrimony.backend.dto.WishlistUpdateRequest;
import com.allmatrimony.backend.dto.VerificationSubmitRequest;
import com.allmatrimony.backend.service.InterestChatService;
import com.allmatrimony.backend.service.MatrimonyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final MatrimonyService matrimonyService;
    private final InterestChatService interestChatService;

    public UserController(MatrimonyService matrimonyService, InterestChatService interestChatService) {
        this.matrimonyService = matrimonyService;
        this.interestChatService = interestChatService;
    }

    @GetMapping("/approved-profiles")
    public ResponseEntity<ApiResponse> getApprovedProfiles(
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) String job
    ) {
        return ResponseEntity.ok(
                matrimonyService.getApprovedProfiles(
                        gender,
                        name,
                        minAge,
                        maxAge,
                        region,
                        location,
                        education,
                        job
                )
        );
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(matrimonyService.getUserProfile(userId));
    }

    @GetMapping("/{userId}/wishlist")
    public ResponseEntity<ApiResponse> getWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(matrimonyService.getWishlist(userId));
    }

    @GetMapping("/{viewerUserId}/profiles/{targetUserId}")
    public ResponseEntity<ApiResponse> getProfileForViewer(
            @PathVariable Long viewerUserId,
            @PathVariable Long targetUserId
    ) {
        return ResponseEntity.ok(matrimonyService.getProfileForViewer(viewerUserId, targetUserId));
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            @PathVariable Long userId,
            @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(matrimonyService.updateProfile(userId, request));
    }

    @PutMapping("/{userId}/wishlist")
    public ResponseEntity<ApiResponse> updateWishlist(
            @PathVariable Long userId,
            @RequestBody WishlistUpdateRequest request
    ) {
        return ResponseEntity.ok(matrimonyService.updateWishlist(userId, request));
    }

    @GetMapping("/{userId}/notifications")
    public ResponseEntity<ApiResponse> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(matrimonyService.getUserNotifications(userId));
    }

    @GetMapping("/{userId}/verification-requests")
    public ResponseEntity<ApiResponse> getUserVerificationRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(matrimonyService.getUserVerificationRequests(userId));
    }

    @GetMapping("/{userId}/interests")
    public ResponseEntity<ApiResponse> getInterestRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(interestChatService.getInterestRequests(userId));
    }

    @PostMapping("/{userId}/interests")
    public ResponseEntity<ApiResponse> sendInterest(
            @PathVariable Long userId,
            @RequestBody InterestCreateRequest request
    ) {
        return ResponseEntity.ok(interestChatService.sendInterest(userId, request));
    }

    @PostMapping("/interests/{interestId}/status")
    public ResponseEntity<ApiResponse> updateInterestStatus(
            @PathVariable Long interestId,
            @RequestBody InterestStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(interestChatService.updateInterestStatus(interestId, request));
    }

    @GetMapping("/{userId}/chat/{otherUserId}")
    public ResponseEntity<ApiResponse> getConversation(
            @PathVariable Long userId,
            @PathVariable Long otherUserId
    ) {
        return ResponseEntity.ok(interestChatService.getConversation(userId, otherUserId));
    }

    @GetMapping("/presence/{otherUserId}")
    public ResponseEntity<ApiResponse> getPresence(@PathVariable Long otherUserId) {
        return ResponseEntity.ok(interestChatService.getPresence(otherUserId));
    }

    @PostMapping("/chat/messages")
    public ResponseEntity<ApiResponse> sendChatMessage(@RequestBody ChatMessageCreateRequest request) {
        return ResponseEntity.ok(interestChatService.sendChatMessage(request));
    }

    @PostMapping("/{userId}/verification-requests")
    public ResponseEntity<ApiResponse> submitVerificationRequest(
            @PathVariable Long userId,
            @RequestBody VerificationSubmitRequest request
    ) {
        return ResponseEntity.ok(matrimonyService.submitVerificationRequest(userId, request));
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<ApiResponse> markNotificationRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(matrimonyService.markNotificationRead(notificationId));
    }

    @PostMapping("/notifications/{notificationId}/read")
    public ResponseEntity<ApiResponse> markNotificationReadPost(@PathVariable Long notificationId) {
        return ResponseEntity.ok(matrimonyService.markNotificationRead(notificationId));
    }
}
