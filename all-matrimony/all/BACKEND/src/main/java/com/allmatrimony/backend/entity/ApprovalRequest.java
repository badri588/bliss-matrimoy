package com.allmatrimony.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_requests")
public class ApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String profileName;

    private String gender;
    private String age;
    private String phone;
    private String email;
    private String community;
    private String religion;
    private String caste;
    private String location;
    private String education;
    private String job;
    private String income;
    private String height;
    private String image;

    @Column(nullable = false)
    private String status;

    @Column(length = 2000)
    private String adminMessage;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getProfileName() { return profileName; }
    public void setProfileName(String profileName) { this.profileName = profileName; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getAge() { return age; }
    public void setAge(String age) { this.age = age; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCommunity() { return community; }
    public void setCommunity(String community) { this.community = community; }
    public String getReligion() { return religion; }
    public void setReligion(String religion) { this.religion = religion; }
    public String getCaste() { return caste; }
    public void setCaste(String caste) { this.caste = caste; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }
    public String getIncome() { return income; }
    public void setIncome(String income) { this.income = income; }
    public String getHeight() { return height; }
    public void setHeight(String height) { this.height = height; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminMessage() { return adminMessage; }
    public void setAdminMessage(String adminMessage) { this.adminMessage = adminMessage; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
}
