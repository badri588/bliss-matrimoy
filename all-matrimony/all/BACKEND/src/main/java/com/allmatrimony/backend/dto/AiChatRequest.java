package com.allmatrimony.backend.dto;

public class AiChatRequest {
    private String message;
    private String language;

    public AiChatRequest() {
    }

    public AiChatRequest(String message) {
        this.message = message;
    }

    public AiChatRequest(String message, String language) {
        this.message = message;
        this.language = language;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
