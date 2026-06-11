package com.allmatrimony.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

@Service
public class GroqAiService {

    @Value("${groq.api-key}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    @Value("${groq.transcription-model:whisper-large-v3}")
    private String groqTranscriptionModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String askAi(String userMessage, String language) {
        try {
            if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
                return "AI API key is missing. Please configure GROQ_API_KEY.";
            }

            String todayText = LocalDate.now(ZoneId.of("Asia/Kolkata"))
                    .format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy", Locale.ENGLISH));

            if (isDateQuestion(userMessage)) {
                return "Today is " + todayText + " (Asia/Kolkata).";
            }

            String systemPrompt = """
                    You are the AI support assistant for the All Matrimony mobile app.
                    Help users with both app-specific guidance and general-purpose questions.

                    Current date and timezone:
                    - Today: %s
                    - Timezone: Asia/Kolkata

                    If the user asks for today's date or the current date, answer using the exact date above.

                    For All Matrimony app questions, cover these flows clearly:
                    - Profile creation and editing
                    - Admin approval after profile submission
                    - Background verification submission and review
                    - Interest requests and chat after acceptance
                    - Premium membership
                    - Wedding service browsing, booking requests, and payment verification
                    - Contact support options such as call, email, and WhatsApp

                    Reply in English only.
                    When users ask general questions outside the app, answer them helpfully and directly instead of refusing.
                    When users ask how to use the app, give short step-by-step instructions.
                    When users ask about bookings, explain the flow:
                    open Wedding Services, choose a service, fill booking details, and submit the request.
                    If payment is involved, mention the secure payment order and verification flow.

                    Be polite, friendly, concise, and practical.
                    Do not invent features that are not in the app.
                    Do not generate abusive, sexual, caste-hate, religious-hate, or unsafe content.
                    Do not promise guaranteed marriage or guaranteed matches.
                    If the user asks anything unrelated to matrimony, still answer using your best general knowledge.
                    """.formatted(todayText);

            String requestBody = objectMapper.writeValueAsString(new GroqRequest(
                    groqModel,
                    new GroqMessage[]{
                            new GroqMessage("system", systemPrompt),
                            new GroqMessage("user", userMessage)
                    },
                    0.5,
                    500
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return "AI service error. Status: " + response.statusCode();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode contentNode = root
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content");

            if (contentNode.isMissingNode() || contentNode.asText().trim().isEmpty()) {
                return "Sorry, I could not generate a reply.";
            }

            return contentNode.asText();

        } catch (Exception e) {
            return "AI chat is temporarily unavailable. Please try again.";
        }
    }

    public String transcribeAudio(MultipartFile audio, String language) {
        try {
            if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
                return "AI transcription key is missing. Please configure GROQ_API_KEY.";
            }

            if (audio == null || audio.isEmpty()) {
                return "Please record a voice message first.";
            }

            String boundary = "----GroqFormBoundary" + UUID.randomUUID().toString().replace("-", "");
            byte[] requestBody = buildTranscriptionRequestBody(
                    boundary,
                    audio,
                    StringUtils.hasText(language) ? language.trim() : "en"
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.groq.com/openai/v1/audio/transcriptions"))
                    .header("Authorization", "Bearer " + groqApiKey)
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return "Audio transcription failed. Status: " + response.statusCode();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("text");

            if (textNode.isMissingNode() || textNode.asText().trim().isEmpty()) {
                return "Sorry, I could not transcribe the audio.";
            }

            return textNode.asText().trim();
        } catch (Exception e) {
            return "Audio transcription is temporarily unavailable. Please try again.";
        }
    }

    private byte[] buildTranscriptionRequestBody(String boundary, MultipartFile audio, String language)
            throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        String fileName = StringUtils.hasText(audio.getOriginalFilename())
                ? StringUtils.cleanPath(audio.getOriginalFilename())
                : "voice-message.m4a";
        String contentType = StringUtils.hasText(audio.getContentType())
                ? audio.getContentType()
                : "audio/m4a";

        writeTextPart(outputStream, boundary, "model", groqTranscriptionModel);
        writeTextPart(outputStream, boundary, "response_format", "json");

        if (StringUtils.hasText(language)) {
            writeTextPart(outputStream, boundary, "language", language);
        }

        writeFilePart(outputStream, boundary, "file", fileName, contentType, audio.getBytes());
        writeLine(outputStream, "--" + boundary + "--");

        return outputStream.toByteArray();
    }

    private void writeTextPart(ByteArrayOutputStream outputStream, String boundary, String name, String value)
            throws IOException {
        writeLine(outputStream, "--" + boundary);
        writeLine(outputStream, "Content-Disposition: form-data; name=\"" + escapeQuotes(name) + "\"");
        writeLine(outputStream, "Content-Type: text/plain; charset=UTF-8");
        writeLine(outputStream, "");
        writeLine(outputStream, value);
    }

    private void writeFilePart(
            ByteArrayOutputStream outputStream,
            String boundary,
            String fieldName,
            String fileName,
            String contentType,
            byte[] content
    ) throws IOException {
        writeLine(outputStream, "--" + boundary);
        writeLine(
                outputStream,
                "Content-Disposition: form-data; name=\"" + escapeQuotes(fieldName) + "\"; filename=\""
                        + escapeQuotes(fileName) + "\""
        );
        writeLine(outputStream, "Content-Type: " + contentType);
        writeLine(outputStream, "");
        outputStream.write(content);
        writeLine(outputStream, "");
    }

    private void writeLine(ByteArrayOutputStream outputStream, String value) throws IOException {
        outputStream.write(value.getBytes(StandardCharsets.UTF_8));
        outputStream.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private String escapeQuotes(String value) {
        return StringUtils.hasText(value) ? value.replace("\"", "\\\"") : "";
    }

    static class GroqRequest {
        public String model;
        public GroqMessage[] messages;
        public double temperature;
        public int max_tokens;

        public GroqRequest(String model, GroqMessage[] messages, double temperature, int max_tokens) {
            this.model = model;
            this.messages = messages;
            this.temperature = temperature;
            this.max_tokens = max_tokens;
        }
    }

    static class GroqMessage {
        public String role;
        public String content;

        public GroqMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }

    private boolean isDateQuestion(String userMessage) {
        if (userMessage == null) {
            return false;
        }

        String normalized = userMessage.trim().toLowerCase(Locale.ENGLISH);
        return normalized.contains("today")
                || normalized.contains("current date")
                || normalized.contains("what date")
                || normalized.contains("which date")
                || normalized.contains("date today")
                || normalized.contains("today's date")
                || normalized.contains("todays date");
    }
}
