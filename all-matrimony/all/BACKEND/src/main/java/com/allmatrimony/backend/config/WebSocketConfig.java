package com.allmatrimony.backend.config;

import com.allmatrimony.backend.service.ChatWebSocketHub;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHub chatWebSocketHub;

    public WebSocketConfig(ChatWebSocketHub chatWebSocketHub) {
        this.chatWebSocketHub = chatWebSocketHub;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHub, "/ws/chat")
                .setAllowedOriginPatterns("*");
    }
}
