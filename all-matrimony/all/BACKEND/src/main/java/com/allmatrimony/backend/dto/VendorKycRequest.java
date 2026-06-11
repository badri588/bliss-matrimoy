package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class VendorKycRequest {
    @NotBlank(message = "ID proof type is required.")
    private String idProofType;

    @NotBlank(message = "ID proof number is required.")
    private String idProofNumber;

    @NotBlank(message = "ID proof document is required.")
    private String idProofDocument;

    @NotBlank(message = "Business document is required.")
    private String businessDocument;

    @NotBlank(message = "Address proof document is required.")
    private String addressProofDocument;

    private String portfolioDocument;
    private String description;
    private String startingPrice;
    private String imageName;

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
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStartingPrice() { return startingPrice; }
    public void setStartingPrice(String startingPrice) { this.startingPrice = startingPrice; }
    public String getImageName() { return imageName; }
    public void setImageName(String imageName) { this.imageName = imageName; }
}
