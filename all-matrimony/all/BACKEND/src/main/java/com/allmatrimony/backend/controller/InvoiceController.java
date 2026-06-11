package com.allmatrimony.backend.controller;

import java.util.HashMap;
import java.util.Map;

import com.allmatrimony.backend.service.InvoicePdfService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoicePdfService invoicePdfService;
    private final ObjectMapper objectMapper;

    public InvoiceController(InvoicePdfService invoicePdfService, ObjectMapper objectMapper) {
        this.invoicePdfService = invoicePdfService;
        this.objectMapper = objectMapper;
    }

    @GetMapping(value = "/service-booking/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadServiceBookingInvoice(@RequestParam(value = "payload", required = false) String payload) {
        return buildPdfResponse(parsePayload(payload));
    }

    @PostMapping(value = "/service-booking/pdf", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadServiceBookingInvoicePost(@RequestBody(required = false) Map<String, Object> payload) {
        return buildPdfResponse(payload == null ? Map.of() : payload);
    }

    private Map<String, Object> parsePayload(String payload) {
        if (payload == null || payload.isBlank()) {
            return new HashMap<>();
        }

        try {
            return objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            return new HashMap<>();
        }
    }

    private ResponseEntity<byte[]> buildPdfResponse(Map<String, Object> payload) {
        byte[] pdfBytes = invoicePdfService.generatePdf(payload);
        String invoiceNumber = sanitizeFilename(value(payload.get("invoiceNumber"), "invoice"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename((invoiceNumber.isBlank() ? "invoice" : invoiceNumber) + ".pdf")
                        .build());
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    private String value(Object value, String fallback) {
        if (value == null) {
            return fallback;
        }

        String text = String.valueOf(value).trim();
        return text.isBlank() ? fallback : text;
    }

    private String sanitizeFilename(String value) {
        return value == null ? "invoice" : value.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
