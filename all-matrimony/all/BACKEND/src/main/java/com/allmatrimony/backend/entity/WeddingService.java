package com.allmatrimony.backend.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
 
@Entity
@Table(name = "wedding_services")
public class WeddingService {
 
    @Id
    @Column(length = 50)
    private String id;
 
    @Column(nullable = false, length = 150)
    private String title;
 
    @Column(nullable = false, length = 80)
    private String category;
 
    @Column(length = 150)
    private String location;
 
    @Column(length = 80)
    private String price;
 
    @Column(name = "image_name", length = 2000)
    private String imageName;
 
    private Double rating;
 
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String galleryImagesJson;

    @Column(columnDefinition = "TEXT")
    private String packagesJson;

    @Column(columnDefinition = "TEXT")
    private String serviceDetailsJson;

    private Long vendorId;

    private LocalDateTime updatedAt;

    @Column(length = 150)
    private String vendorName;

    @Column(length = 20)
    private String vendorPhone;

    @Column(length = 150)
    private String vendorEmail;
 
    public WeddingService() {
    }
 
    public String getId() {
        return id;
    }
 
    public String getTitle() {
        return title;
    }
 
    public String getCategory() {
        return category;
    }
 
    public String getLocation() {
        return location;
    }
 
    public String getPrice() {
        return price;
    }
 
    public String getImageName() {
        return imageName;
    }
 
    public Double getRating() {
        return rating;
    }
 
    public String getDescription() {
        return description;
    }

    public String getGalleryImagesJson() {
        return galleryImagesJson;
    }

    public String getPackagesJson() {
        return packagesJson;
    }

    public String getServiceDetailsJson() {
        return serviceDetailsJson;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getVendorName() {
        return vendorName;
    }

    public String getVendorPhone() {
        return vendorPhone;
    }

    public String getVendorEmail() {
        return vendorEmail;
    }
 
    public void setId(String id) {
        this.id = id;
    }
 
    public void setTitle(String title) {
        this.title = title;
    }
 
    public void setCategory(String category) {
        this.category = category;
    }
 
    public void setLocation(String location) {
        this.location = location;
    }
 
    public void setPrice(String price) {
        this.price = price;
    }
 
    public void setImageName(String imageName) {
        this.imageName = imageName;
    }
 
    public void setRating(Double rating) {
        this.rating = rating;
    }
 
    public void setDescription(String description) {
        this.description = description;
    }

    public void setGalleryImagesJson(String galleryImagesJson) {
        this.galleryImagesJson = galleryImagesJson;
    }

    public void setPackagesJson(String packagesJson) {
        this.packagesJson = packagesJson;
    }

    public void setServiceDetailsJson(String serviceDetailsJson) {
        this.serviceDetailsJson = serviceDetailsJson;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public void setVendorPhone(String vendorPhone) {
        this.vendorPhone = vendorPhone;
    }

    public void setVendorEmail(String vendorEmail) {
        this.vendorEmail = vendorEmail;
    }
}  
