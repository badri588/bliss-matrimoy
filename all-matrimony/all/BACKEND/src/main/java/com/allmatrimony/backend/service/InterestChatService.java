package com.allmatrimony.backend.service;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.ChatMessageCreateRequest;
import com.allmatrimony.backend.dto.InterestCreateRequest;
import com.allmatrimony.backend.dto.InterestStatusUpdateRequest;
import com.allmatrimony.backend.entity.ChatMessage;
import com.allmatrimony.backend.entity.InterestRequest;
import com.allmatrimony.backend.entity.User;
import com.allmatrimony.backend.repository.ChatMessageRepository;
import com.allmatrimony.backend.repository.InterestRequestRepository;
import com.allmatrimony.backend.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InterestChatService {

    private final InterestRequestRepository interestRequestRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatWebSocketHub chatWebSocketHub;
    private final ObjectMapper objectMapper;
    private final PremiumService premiumService;

    public InterestChatService(
            InterestRequestRepository interestRequestRepository,
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository,
            ChatWebSocketHub chatWebSocketHub,
            ObjectMapper objectMapper,
            PremiumService premiumService
    ) {
        this.interestRequestRepository = interestRequestRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.chatWebSocketHub = chatWebSocketHub;
        this.objectMapper = objectMapper;
        this.premiumService = premiumService;
    }

    public ApiResponse getInterestRequests(Long userId) {
        List<Map<String, Object>> requests = interestRequestRepository
                .findBySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(userId, userId)
                .stream()
                .map(request -> mapInterestRequest(request, userId))
                .collect(Collectors.toList());
        return ApiResponse.success("Interest requests loaded.", requests);
    }

    @Transactional
    public ApiResponse sendInterest(Long senderUserId, InterestCreateRequest request) {
        if (request.getTargetUserId() == null) {
            throw new IllegalArgumentException("Target user is required.");
        }

        if (senderUserId.equals(request.getTargetUserId())) {
            throw new IllegalArgumentException("You cannot send interest to yourself.");
        }

        User sender = getUser(senderUserId);
        User receiver = getUser(request.getTargetUserId());

        if (!premiumService.canViewFullProfile(sender)) {
            throw new IllegalArgumentException("Silver or Gold plan is required to send interests.");
        }

        InterestRequest existingRequest = interestRequestRepository
                .findTopBySenderUserIdAndReceiverUserIdOrSenderUserIdAndReceiverUserIdOrderByCreatedAtDesc(
                        senderUserId,
                        receiver.getId(),
                        receiver.getId(),
                        senderUserId
                )
                .orElse(null);

        if (existingRequest != null) {
            if ("Pending".equalsIgnoreCase(existingRequest.getStatus())) {
                return ApiResponse.success(
                        "Interest request is already pending.",
                        mapInterestRequest(existingRequest, senderUserId)
                );
            }

            if ("Accepted".equalsIgnoreCase(existingRequest.getStatus())) {
                return ApiResponse.success(
                        "Interest already accepted. Chat is unlocked.",
                        mapInterestRequest(existingRequest, senderUserId)
                );
            }
        }

        InterestRequest interestRequest = new InterestRequest();
        interestRequest.setSenderUserId(senderUserId);
        interestRequest.setReceiverUserId(receiver.getId());
        interestRequest.setStatus("Pending");
        interestRequest.setCreatedAt(LocalDateTime.now());
        interestRequest.setResponseMessage("");
        interestRequestRepository.save(interestRequest);

        return ApiResponse.success(
                "Interest sent to " + receiver.getName() + ".",
                mapInterestRequest(interestRequest, senderUserId)
        );
    }

    @Transactional
    public ApiResponse updateInterestStatus(Long interestId, InterestStatusUpdateRequest request) {
        InterestRequest interestRequest = interestRequestRepository.findById(interestId)
                .orElseThrow(() -> new IllegalArgumentException("Interest request not found."));

        if (request.getActingUserId() == null) {
            throw new IllegalArgumentException("Acting user is required.");
        }

        if (!request.getActingUserId().equals(interestRequest.getReceiverUserId())) {
            throw new IllegalArgumentException("Only the receiver can approve or reject this interest.");
        }

        String nextStatus = request.getStatus();

        if (!"Accepted".equalsIgnoreCase(nextStatus) && !"Rejected".equalsIgnoreCase(nextStatus)) {
            throw new IllegalArgumentException("Status must be Accepted or Rejected.");
        }

        interestRequest.setStatus(nextStatus);
        interestRequest.setRespondedAt(LocalDateTime.now());
        interestRequest.setResponseMessage(request.getMessage() == null ? "" : request.getMessage());
        interestRequestRepository.save(interestRequest);

        return ApiResponse.success(
                "Interest " + nextStatus + ".",
                mapInterestRequest(interestRequest, request.getActingUserId())
        );
    }

    public ApiResponse getConversation(Long userId, Long otherUserId) {
        ensureChatUnlocked(userId, otherUserId);

        List<ChatMessage> chatMessages = chatMessageRepository
                .findBySenderUserIdAndReceiverUserIdOrSenderUserIdAndReceiverUserIdOrderBySentAtAsc(
                        userId,
                        otherUserId,
                        otherUserId,
                        userId
                );

        chatMessages.stream()
                .filter(message -> userId.equals(message.getReceiverUserId()) && !message.isReadStatus())
                .forEach(message -> message.setReadStatus(true));
        chatMessageRepository.saveAll(chatMessages);

        List<Map<String, Object>> messages = chatMessages.stream()
                .map(message -> mapChatMessage(message, userId))
                .collect(Collectors.toList());

        return ApiResponse.success("Conversation loaded.", messages);
    }

    public ApiResponse getPresence(Long otherUserId) {
        User otherUser = getUser(otherUserId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", otherUser.getId());
        data.put("online", chatWebSocketHub.isUserOnline(otherUserId));
        data.put("name", otherUser.getName());
        return ApiResponse.success("Presence loaded.", data);
    }

    @Transactional
    public ApiResponse sendChatMessage(ChatMessageCreateRequest request) {
        if (request.getSenderUserId() == null || request.getReceiverUserId() == null) {
            throw new IllegalArgumentException("Sender and receiver are required.");
        }

        if (request.getText() == null || request.getText().isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }

        ensureChatUnlocked(request.getSenderUserId(), request.getReceiverUserId());
        getUser(request.getSenderUserId());
        getUser(request.getReceiverUserId());

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSenderUserId(request.getSenderUserId());
        chatMessage.setReceiverUserId(request.getReceiverUserId());
        chatMessage.setMessageText(request.getText().trim());
        chatMessage.setSentAt(LocalDateTime.now());
        chatMessage.setReadStatus(false);
        chatMessageRepository.save(chatMessage);

        Map<String, Object> senderPayload = mapChatMessage(chatMessage, request.getSenderUserId());
        Map<String, Object> receiverPayload = mapChatMessage(chatMessage, request.getReceiverUserId());
        pushChatEvent(request.getReceiverUserId(), receiverPayload);
        pushChatEvent(request.getSenderUserId(), senderPayload);

        return ApiResponse.success("Message sent.", senderPayload);
    }

    private void ensureChatUnlocked(Long userId, Long otherUserId) {
        User currentUser = getUser(userId);

        if (!premiumService.canChat(currentUser)) {
            throw new IllegalArgumentException("Gold plan is required to unlock chat.");
        }

        InterestRequest request = interestRequestRepository
                .findTopBySenderUserIdAndReceiverUserIdOrSenderUserIdAndReceiverUserIdOrderByCreatedAtDesc(
                        userId,
                        otherUserId,
                        otherUserId,
                        userId
                )
                .orElseThrow(() -> new IllegalArgumentException("Chat is locked until interest is accepted."));

        if (!"Accepted".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalArgumentException("Chat is locked until interest is accepted.");
        }
    }

    private void pushChatEvent(Long userId, Map<String, Object> messageData) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("type", "CHAT_MESSAGE");
        event.put("message", messageData);

        try {
            chatWebSocketHub.pushToUser(userId, objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException ignored) {
            // no-op
        }
    }

    private Map<String, Object> mapInterestRequest(InterestRequest request, Long viewerUserId) {
        User sender = getUser(request.getSenderUserId());
        User receiver = getUser(request.getReceiverUserId());
        boolean isIncoming = viewerUserId != null && viewerUserId.equals(receiver.getId());
        User relatedUser = isIncoming ? sender : receiver;

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", request.getId());
        data.put("senderUserId", sender.getId());
        data.put("receiverUserId", receiver.getId());
        data.put("status", request.getStatus());
        data.put("createdAt", request.getCreatedAt() == null ? null : request.getCreatedAt().toString());
        data.put("respondedAt", request.getRespondedAt() == null ? null : request.getRespondedAt().toString());
        data.put("responseMessage", request.getResponseMessage());
        data.put("direction", isIncoming ? "incoming" : "outgoing");
        data.put("chatUnlocked", "Accepted".equalsIgnoreCase(request.getStatus()));
        data.put("profile", mapUserSummary(relatedUser));
        return data;
    }

    private Map<String, Object> mapUserSummary(User user) {
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("gender", user.getGender());
        profile.put("age", user.getAge());
        profile.put("community", user.getCommunity());
        profile.put("religion", user.getReligion());
        profile.put("location", user.getLocation());
        profile.put("education", user.getEducation());
        profile.put("job", user.getJob());
        profile.put("height", user.getHeight());
        profile.put("income", user.getIncome());
        profile.put("image", user.getImage());
        profile.put("about", user.getAbout());
        return profile;
    }

    private Map<String, Object> mapChatMessage(ChatMessage message, Long viewerUserId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", message.getId());
        data.put("senderUserId", message.getSenderUserId());
        data.put("receiverUserId", message.getReceiverUserId());
        data.put("text", message.getMessageText());
        data.put("mine", viewerUserId != null && viewerUserId.equals(message.getSenderUserId()));
        data.put("sentAt", message.getSentAt() == null ? null : message.getSentAt().toString());
        data.put("read", message.isReadStatus());
        return data;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }
}
