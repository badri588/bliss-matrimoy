package com.allmatrimony.backend.dto;

import java.util.List;
import java.util.Map;

public class VendorServiceProfileRequest {
    private String serviceCategory;
    private List<Map<String, Object>> photos;
    private List<Map<String, Object>> packages;
    private Map<String, Object> serviceDetails;
    private String serviceDescription;
    private Map<String, Object> serviceProfiles;

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public List<Map<String, Object>> getPhotos() {
        return photos;
    }

    public void setPhotos(List<Map<String, Object>> photos) {
        this.photos = photos;
    }

    public List<Map<String, Object>> getPackages() {
        return packages;
    }

    public void setPackages(List<Map<String, Object>> packages) {
        this.packages = packages;
    }

    public Map<String, Object> getServiceDetails() {
        return serviceDetails;
    }

    public void setServiceDetails(Map<String, Object> serviceDetails) {
        this.serviceDetails = serviceDetails;
    }

    public String getServiceDescription() {
        return serviceDescription;
    }

    public void setServiceDescription(String serviceDescription) {
        this.serviceDescription = serviceDescription;
    }

    public Map<String, Object> getServiceProfiles() {
        return serviceProfiles;
    }

    public void setServiceProfiles(Map<String, Object> serviceProfiles) {
        this.serviceProfiles = serviceProfiles;
    }
}
