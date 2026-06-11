package com.allmatrimony.backend.service;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHub extends TextWebSocketHandler {

    private final Map<Long, WebSocketSession> sessionsByUserId = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long userId = extractUserId(session);

        if (userId != null) {
            sessionsByUserId.put(userId, session);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = extractUserId(session);

        if (userId != null) {
            sessionsByUserId.remove(userId);
        }
    }

    public void pushToUser(Long userId, String payload) {
        if (userId == null) {
            return;
        }

        WebSocketSession session = sessionsByUserId.get(userId);

        if (session == null || !session.isOpen()) {
            return;
        }

        try {
            session.sendMessage(new TextMessage(payload));
        } catch (IOException ignored) {
            sessionsByUserId.remove(userId);
        }
    }

    public boolean isUserOnline(Long userId) {
        if (userId == null) {
            return false;
        }

        WebSocketSession session = sessionsByUserId.get(userId);
        return session != null && session.isOpen();
    }

    private Long extractUserId(WebSocketSession session) {
        try {
            String rawUserId = session.getUri() == null ? null : session.getUri().getQuery();

            if (rawUserId == null || !rawUserId.startsWith("userId=")) {
                return null;
            }

            return Long.parseLong(rawUserId.substring("userId=".length()));
        } catch (Exception ignored) {
            return null;
        }
    }
}
