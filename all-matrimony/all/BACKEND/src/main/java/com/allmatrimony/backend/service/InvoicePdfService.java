package com.allmatrimony.backend.service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;

@Service
public class InvoicePdfService {

    private static final DecimalFormat MONEY_FORMAT = new DecimalFormat("#,##0.##");
    private static final DateTimeFormatter DISPLAY_DATE =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH);

    public byte[] generatePdf(Map<String, Object> payload) {
        Map<String, Object> data = payload == null ? Collections.emptyMap() : payload;
        List<String> lines = buildLines(data);
        String content = buildContent(lines);
        byte[] contentBytes = content.getBytes(StandardCharsets.US_ASCII);

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        List<Integer> offsets = new ArrayList<>();
        offsets.add(0);

        write(output, "%PDF-1.4\n");

        offsets.add(output.size());
        write(output, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

        offsets.add(output.size());
        write(output, "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

        offsets.add(output.size());
        write(output, "3 0 obj\n");
        write(output, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ");
        write(output, "/Resources << /Font << /F1 4 0 R >> >> ");
        write(output, "/Contents 5 0 R >>\nendobj\n");

        offsets.add(output.size());
        write(output, "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

        offsets.add(output.size());
        write(output, "5 0 obj\n<< /Length " + contentBytes.length + " >>\nstream\n");
        output.writeBytes(contentBytes);
        write(output, "endstream\nendobj\n");

        int xrefStart = output.size();
        write(output, "xref\n0 6\n");
        write(output, "0000000000 65535 f \n");
        for (int index = 1; index <= 5; index++) {
            write(output, String.format(Locale.ROOT, "%010d 00000 n \n", offsets.get(index)));
        }

        write(output, "trailer\n<< /Size 6 /Root 1 0 R >>\n");
        write(output, "startxref\n" + xrefStart + "\n%%EOF");
        return output.toByteArray();
    }

    private List<String> buildLines(Map<String, Object> payload) {
        List<String> lines = new ArrayList<>();
        String invoiceNumber = display(payload.get("invoiceNumber"), "N/A");
        String invoiceDate = displayDate(payload.get("invoiceDate"));
        String invoiceStatus = display(payload.get("invoiceStatus"), "PAID");
        String invoiceReference = display(payload.get("invoiceReference"), "N/A");
        String paidAt = displayDate(payload.get("paidAt"));
        String customerName = display(payload.get("customerName"), "Customer");
        String customerPhone = display(payload.get("customerPhone"), "N/A");
        String customerEmail = display(payload.get("customerEmail"), "N/A");
        String customerLocation = display(payload.get("customerLocation"), "N/A");
        String vendorName = display(payload.get("vendorName"), "N/A");
        String vendorPhone = display(payload.get("vendorPhone"), "N/A");
        String serviceTitle = display(payload.get("serviceTitle"), "Wedding Service");
        String packageName = display(payload.get("packageName"), "N/A");
        String bookingDate = buildSchedule(payload);
        String paymentMode = display(payload.get("paymentMode"), "Online");
        String transactionId = display(payload.get("transactionId"), "N/A");
        String orderId = display(payload.get("orderId"), "N/A");
        String amount = formatMoney(payload.get("amount"), display(payload.get("currency"), "INR"));
        String notes = display(payload.get("notes"), "N/A");
        String serviceId = display(payload.get("serviceId"), "N/A");
        String bookingStatus = display(payload.get("paymentStatus"), invoiceStatus);

        lines.add("==============================================");
        lines.add("INVOICE DETAILS");
        lines.add("==============================================");
        lines.add("Invoice No        : " + invoiceNumber);
        lines.add("Invoice Date      : " + invoiceDate);
        lines.add("Invoice Status    : " + invoiceStatus);
        lines.add("Payment Status    : " + bookingStatus);
        lines.add("Reference         : " + invoiceReference);
        if (!paidAt.isBlank() && !"N/A".equalsIgnoreCase(paidAt)) {
            lines.add("Paid At           : " + paidAt);
        }
        lines.add("");
        lines.add("CUSTOMER DETAILS");
        lines.add("Customer Name     : " + customerName);
        lines.add("Phone             : " + customerPhone);
        lines.add("Email             : " + customerEmail);
        lines.add("Location          : " + customerLocation);
        lines.add("");
        lines.add("SERVICE DETAILS");
        lines.add("Vendor Name       : " + vendorName);
        lines.add("Vendor Phone      : " + vendorPhone);
        lines.add("Service Name      : " + serviceTitle);
        lines.add("Service ID        : " + serviceId);
        lines.add("Package           : " + packageName);
        lines.add("Booking Schedule  : " + bookingDate);
        lines.add("");
        lines.add("PAYMENT SUMMARY");
        lines.add("Paid Amount       : " + amount);
        lines.add("Payment Mode      : " + paymentMode);
        lines.add("Transaction ID    : " + transactionId);
        lines.add("Order ID          : " + orderId);
        lines.add("Notes             : " + notes);
        lines.add("==============================================");

        return lines;
    }

    private String buildContent(List<String> lines) {
        StringBuilder content = new StringBuilder();
        content.append("BT\n");
        content.append("/F1 18 Tf\n");
        content.append("50 792 Td\n");
        content.append("(").append(escapePdfText("ALL MATRIMONY")).append(") Tj\n");
        content.append("/F1 14 Tf\n");
        content.append("0 -22 Td\n");
        content.append("(").append(escapePdfText("Service Booking Invoice")).append(") Tj\n");
        content.append("/F1 11 Tf\n");
        content.append("0 -18 Td\n");
        content.append("(").append(escapePdfText("Generated after payment confirmation")).append(") Tj\n");
        content.append("0 -10 Td\n");

        for (String line : lines) {
            content.append("0 -16 Td\n");
            content.append("(").append(escapePdfText(line)).append(") Tj\n");
        }

        content.append("ET\n");
        return content.toString();
    }

    private String buildSchedule(Map<String, Object> payload) {
        String bookingDate = display(payload.get("bookingDate"), "");
        String bookingEndDate = display(payload.get("bookingEndDate"), "");
        String bookingTime = display(payload.get("bookingTime"), "");

        List<String> parts = new ArrayList<>();
        if (!bookingDate.isBlank()) {
            parts.add(bookingDate);
        }
        if (!bookingEndDate.isBlank()) {
            parts.add("to " + bookingEndDate);
        }
        if (!bookingTime.isBlank()) {
            parts.add(bookingTime);
        }

        if (parts.isEmpty()) {
            return "N/A";
        }

        return String.join(" ", parts);
    }

    private String formatMoney(Object value, String currency) {
        double amount = parseDouble(value);
        String formatted = MONEY_FORMAT.format(amount);
        String currencyLabel = Objects.requireNonNullElse(currency, "INR").trim();
        if (currencyLabel.isBlank()) {
            currencyLabel = "INR";
        }
        return "Rs. " + formatted + " (" + currencyLabel + ")";
    }

    private double parseDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }

        String raw = display(value, "");
        if (raw.isBlank()) {
            return 0d;
        }

        String numeric = raw.replaceAll("[^0-9.\\-]", "");
        if (numeric.isBlank()) {
            return 0d;
        }

        try {
            return Double.parseDouble(numeric);
        } catch (NumberFormatException ex) {
            return 0d;
        }
    }

    private String displayDate(Object value) {
        String raw = display(value, "");
        if (raw.isBlank()) {
            return currentTimestamp();
        }

        try {
            Instant instant = Instant.parse(raw);
            return DISPLAY_DATE.format(instant.atZone(ZoneId.systemDefault()));
        } catch (Exception ignored) {
            return raw;
        }
    }

    private String currentTimestamp() {
        return DISPLAY_DATE.format(Instant.now().atZone(ZoneId.systemDefault()));
    }

    private String display(Object value, String fallback) {
        if (value == null) {
            return fallback;
        }

        String text = String.valueOf(value).trim();
        return text.isBlank() ? fallback : text;
    }

    private String escapePdfText(String text) {
        String ascii = text == null ? "" : text.replaceAll("[^\\x20-\\x7E]", " ");
        ascii = ascii.replace("\\", "\\\\");
        ascii = ascii.replace("(", "\\(");
        ascii = ascii.replace(")", "\\)");
        return ascii.replaceAll("\\s+", " ").trim();
    }

    private void write(ByteArrayOutputStream output, String text) {
        output.writeBytes(text.getBytes(StandardCharsets.US_ASCII));
    }
}
