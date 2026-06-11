package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class VendorRegisterRequest {
    @NotBlank(message = "Business name is required.")
    private String businessName;

    @NotBlank(message = "Owner name is required.")
    private String ownerName;

    @NotBlank(message = "Phone number is required.")
    private String phone;

    @Email(message = "Please enter a valid email address.")
    @NotBlank(message = "Email is required.")
    private String email;

    @NotEmpty(message = "Please select at least one service.")
    private List<String> services;

    @NotBlank(message = "Password is required.")
    @Size(min = 6, message = "Password must be at least 6 characters.")
    private String password;

    private String city;
    private String location;
    private String startingPrice;
    private String imageName;
    private String description;

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<String> getServices() { return services; }
    public void setServices(List<String> services) { this.services = services; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
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
