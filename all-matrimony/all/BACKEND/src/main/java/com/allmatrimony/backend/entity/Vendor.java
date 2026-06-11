package com.allmatrimony.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String businessName;

    @Column(nullable = false, length = 120)
    private String ownerName;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 120)
    private String passwordHash;

    @Column(nullable = false)
    private boolean phoneVerified;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String services;

    @Column(length = 150)
    private String city;

    @Column(length = 150)
    private String location;

    @Column(length = 80)
    private String startingPrice;

    @Column(length = 2000)
    private String imageName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String servicePhotosJson;

    @Column(columnDefinition = "TEXT")
    private String servicePackagesJson;

    @Column(columnDefinition = "TEXT")
    private String serviceDetailsJson;

    @Column(columnDefinition = "TEXT")
    private String serviceDescription;

    @Column(columnDefinition = "TEXT")
    private String serviceProfilesJson;

    @Column(nullable = false, length = 40)
    private String kycStatus;

    @Column(nullable = false, length = 40)
    private String approvalStatus;

    @Column(length = 80)
    private String idProofType;

    @Column(length = 80)
    private String idProofNumber;

    @Column(length = 500)
    private String idProofDocument;

    @Column(length = 500)
    private String businessDocument;

    @Column(length = 500)
    private String addressProofDocument;

    @Column(length = 500)
    private String portfolioDocument;

    @Column(length = 2000)
    private String adminMessage;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime kycSubmittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public boolean isPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(boolean phoneVerified) { this.phoneVerified = phoneVerified; }
    public String getServices() { return services; }
    public void setServices(String services) { this.services = services; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStartingPrice() { return startingPrice; }
    public void setStartingPrice(String startingPrice) { this.startingPrice = startingPrice; }
    public String getImageName() { return imageName; }
    public void setImageName(String imageName) { this.imageName = imageName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getServicePhotosJson() { return servicePhotosJson; }
    public void setServicePhotosJson(String servicePhotosJson) { this.servicePhotosJson = servicePhotosJson; }
    public String getServicePackagesJson() { return servicePackagesJson; }
    public void setServicePackagesJson(String servicePackagesJson) { this.servicePackagesJson = servicePackagesJson; }
    public String getServiceDetailsJson() { return serviceDetailsJson; }
    public void setServiceDetailsJson(String serviceDetailsJson) { this.serviceDetailsJson = serviceDetailsJson; }
    public String getServiceDescription() { return serviceDescription; }
    public void setServiceDescription(String serviceDescription) { this.serviceDescription = serviceDescription; }
    public String getServiceProfilesJson() { return serviceProfilesJson; }
    public void setServiceProfilesJson(String serviceProfilesJson) { this.serviceProfilesJson = serviceProfilesJson; }
    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public String getIdProofType() { return idProofType; }
    public void setIdProofType(String idProofType) { this.idProofType = idProofType; }
    public String getIdProofNumber() { return idProofNumber; }
    public void setIdProofNumber(String idProofNumber) { this.idProofNumber = idProofNumber; }
    public String getIdProofDocument() { return idProofDocument; }
    public void setIdProofDocument(String idProofDocument) { this.idProofDocument = idProofDocument; }
    public String getBusinessDocument() { return businessDocument; }
    public void setBusinessDocument(String businessDocument) { this.businessDocument = businessDocument; }
    public String getAddressProofDocument() { return addressProofDocument; }
    public void setAddressProofDocument(String addressProofDocument) { this.addressProofDocument = addressProofDocument; }
    public String getPortfolioDocument() { return portfolioDocument; }
    public void setPortfolioDocument(String portfolioDocument) { this.portfolioDocument = portfolioDocument; }
    public String getAdminMessage() { return adminMessage; }
    public void setAdminMessage(String adminMessage) { this.adminMessage = adminMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getKycSubmittedAt() { return kycSubmittedAt; }
    public void setKycSubmittedAt(LocalDateTime kycSubmittedAt) { this.kycSubmittedAt = kycSubmittedAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
}
