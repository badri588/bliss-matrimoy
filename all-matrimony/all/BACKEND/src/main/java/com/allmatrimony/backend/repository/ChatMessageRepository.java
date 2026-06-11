package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderUserIdAndReceiverUserIdOrSenderUserIdAndReceiverUserIdOrderBySentAtAsc(
            Long senderUserId,
            Long receiverUserId,
            Long reverseSenderUserId,
            Long reverseReceiverUserId
    );
}
