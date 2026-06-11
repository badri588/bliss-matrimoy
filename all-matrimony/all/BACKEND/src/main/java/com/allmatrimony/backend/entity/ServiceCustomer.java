
package com.allmatrimony.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
 
import jakarta.persistence.*;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "service_customers")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ServiceCustomer {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "user_key", nullable = false, unique = true, length = 150)
    private String userKey;
 
    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;
 
    @Column(nullable = false, unique = true, length = 20)
    private String phone;
 
    @Column(length = 150)
    private String email;
 
    @Column(length = 255)
    private String address;
 
    @Column(length = 100)
    private String city;
 
    @Column(name = "service_approved")
    private Boolean serviceApproved = false;
 
    @Column(name = "created_at")
    private LocalDateTime createdAt;
 
    public ServiceCustomer() {
    }
 
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.serviceApproved == null) {
            this.serviceApproved = false;
        }
    }
 
    public Long getId() {
        return id;
    }
 
    public String getUserKey() {
        return userKey;
    }
 
    public String getFullName() {
        return fullName;
    }
 
    public String getPhone() {
        return phone;
    }
 
    public String getEmail() {
        return email;
    }
 
    public String getAddress() {
        return address;
    }
 
    public String getCity() {
        return city;
    }
 
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
 
    public boolean isServiceApproved() {
        return Boolean.TRUE.equals(serviceApproved);
    }
 
    public void setId(Long id) {
        this.id = id;
    }
 
    public void setUserKey(String userKey) {
        this.userKey = userKey;
    }
 
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
 
    public void setPhone(String phone) {
        this.phone = phone;
    }
 
    public void setEmail(String email) {
        this.email = email;
    }
 
    public void setAddress(String address) {
        this.address = address;
    }
 
    public void setCity(String city) {
        this.city = city;
    }
 
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
 
    public void setServiceApproved(boolean serviceApproved) {
        this.serviceApproved = serviceApproved;
    }
}