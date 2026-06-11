package com.allmatrimony.backend.dto;

import java.util.List;

public class VendorProfileUpdateRequest {
    private String businessName;
    private String ownerName;
    private String email;
    private List<String> services;
    private String city;
    private String location;
    private String startingPrice;
    private String imageName;
    private String description;

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<String> getServices() { return services; }
    public void setServices(List<String> services) { this.services = services; }
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
}
