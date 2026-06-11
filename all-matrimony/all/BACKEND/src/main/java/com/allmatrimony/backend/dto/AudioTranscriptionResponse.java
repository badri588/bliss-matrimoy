package com.allmatrimony.backend.dto;

public class AudioTranscriptionResponse {
    private String text;

    public AudioTranscriptionResponse() {
    }

    public AudioTranscriptionResponse(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
