package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.AiChatRequest;
import com.allmatrimony.backend.dto.AiChatResponse;
import com.allmatrimony.backend.dto.AudioTranscriptionResponse;
import com.allmatrimony.backend.service.GroqAiService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiChatController {

    private final GroqAiService groqAiService;

    public AiChatController(GroqAiService groqAiService) {
        this.groqAiService = groqAiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new AiChatResponse("Please enter a message."));
        }

        String reply = groqAiService.askAi(request.getMessage().trim(), request.getLanguage());
        return ResponseEntity.ok(new AiChatResponse(reply));
    }

    @PostMapping(
            value = "/transcribe",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AudioTranscriptionResponse> transcribe(
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "language", required = false, defaultValue = "en") String language
    ) {
        String text = groqAiService.transcribeAudio(audio, language);
        return ResponseEntity.ok(new AudioTranscriptionResponse(text));
    }
}
