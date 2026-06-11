package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {
    private static final String PROFILE_IMAGE_PREFIX = "profile";
    private static final String VERIFICATION_FILE_PREFIX = "verification";
    private static final String VENDOR_FILE_PREFIX = "vendor";
    private final Path uploadRoot;

    public UploadController(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostMapping(
            value = "/profile-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> uploadProfileImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please choose an image to upload.");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed.");
        }

        Path profileImageDir = uploadRoot.resolve("profile-images");
        Files.createDirectories(profileImageDir);

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "profile-image" : file.getOriginalFilename());
        String extension = resolveExtension(originalName, contentType);
        String fileName = PROFILE_IMAGE_PREFIX + "-" + UUID.randomUUID() + extension;
        Path targetPath = profileImageDir.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String imagePath = "/uploads/profile-images/" + fileName;
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("imageUrl", imagePath);
        data.put("imagePath", imagePath);
        data.put("fileName", fileName);

        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully.", data));
    }

    @PostMapping(
            value = "/verification-document",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> uploadVerificationDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("proofType") String proofType
    ) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a verification document to upload.");
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        boolean isImage = contentType.startsWith("image/");
        boolean isPdf = contentType.contains("pdf");

        if (!isImage && !isPdf) {
            throw new IllegalArgumentException("Only image files or PDF documents are allowed.");
        }

        String normalizedProofType = normalizeProofType(proofType);
        Path verificationDir = uploadRoot
                .resolve("verification-documents")
                .resolve(normalizedProofType);
        Files.createDirectories(verificationDir);

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? normalizedProofType : file.getOriginalFilename());
        String extension = resolveExtension(originalName, contentType);
        String fileName = VERIFICATION_FILE_PREFIX + "-" + normalizedProofType + "-" + UUID.randomUUID() + extension;
        Path targetPath = verificationDir.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String filePath = "/uploads/verification-documents/" + normalizedProofType + "/" + fileName;
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("fileUrl", filePath);
        data.put("filePath", filePath);
        data.put("fileName", fileName);
        data.put("proofType", normalizedProofType);
        data.put("contentType", contentType);

        return ResponseEntity.ok(ApiResponse.success("Verification document uploaded successfully.", data));
    }

    @PostMapping(
            value = "/vendor-document",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> uploadVendorDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType
    ) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a vendor document to upload.");
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        boolean isImage = contentType.startsWith("image/");
        boolean isPdf = contentType.contains("pdf");

        if (!isImage && !isPdf) {
            throw new IllegalArgumentException("Only image files or PDF documents are allowed.");
        }

        String normalizedDocumentType = normalizeProofType(documentType);
        Path vendorDocumentDir = uploadRoot
                .resolve("vendor-documents")
                .resolve(normalizedDocumentType);
        Files.createDirectories(vendorDocumentDir);

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? normalizedDocumentType : file.getOriginalFilename());
        String extension = resolveExtension(originalName, contentType);
        String fileName = VENDOR_FILE_PREFIX + "-" + normalizedDocumentType + "-" + UUID.randomUUID() + extension;
        Path targetPath = vendorDocumentDir.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String filePath = "/uploads/vendor-documents/" + normalizedDocumentType + "/" + fileName;
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("fileUrl", filePath);
        data.put("filePath", filePath);
        data.put("fileName", fileName);
        data.put("documentType", normalizedDocumentType);
        data.put("contentType", contentType);

        return ResponseEntity.ok(ApiResponse.success("Vendor document uploaded successfully.", data));
    }

    private String resolveExtension(String originalName, String contentType) {
        int dotIndex = originalName.lastIndexOf('.');

        if (dotIndex >= 0) {
            return originalName.substring(dotIndex);
        }

        if (contentType != null && contentType.toLowerCase().contains("pdf")) {
            return ".pdf";
        }

        if ("image/png".equalsIgnoreCase(contentType)) {
            return ".png";
        }

        if ("image/webp".equalsIgnoreCase(contentType)) {
            return ".webp";
        }

        return ".jpg";
    }

    private String normalizeProofType(String proofType) {
        String normalized = StringUtils.hasText(proofType) ? proofType.trim().toLowerCase() : "general";
        normalized = normalized.replaceAll("[^a-z0-9-]", "-");
        normalized = normalized.replaceAll("-{2,}", "-");
        normalized = normalized.replaceAll("^-|-$", "");
        return normalized.isEmpty() ? "general" : normalized;
    }
}
