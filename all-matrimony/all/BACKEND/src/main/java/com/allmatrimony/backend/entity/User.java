package com.allmatrimony.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false)
    private String gender;

    private String profileCreatedFor;

    private String age;

    private String dob;

    @Column(nullable = false)
    private String community;

    private String religion;

    private String caste;

    @Column(nullable = false)
    private String location;

    private String education;

    private String job;

    private String income;

    private String height;

    private String maritalStatus;

    private String familyType;

    private String fatherName;

    private String motherName;

    private String siblings;

    @Column(length = 4000)
    private String about;

    private String partnerAge;

    private String partnerCommunity;

    private String partnerLocation;

    private String partnerEducation;

    private String image;

    @Column(length = 1000)
    private String habits;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private boolean phoneVerified;

    @Column(nullable = false)
    private String approvalStatus;

    @Column(nullable = false)
    private String verificationStatus;

    @Column(nullable = false)
    private String premiumPlan;

    @Column(nullable = false)
    private String premiumStatus;

    private String premiumOrderId;

    private String premiumPaymentId;

    private LocalDateTime premiumActivatedAt;

    @Lob
    @Column(name = "wishlist_profile_ids", columnDefinition = "TEXT")
    private String wishlistProfileIds;

    @Column(nullable = false)
    private Integer profileCompletion;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getCommunity() {
        return community;
    }

    public void setCommunity(String community) {
        this.community = community;
    }

    public String getAge() {
        return age;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public String getProfileCreatedFor() {
        return profileCreatedFor;
    }

    public void setProfileCreatedFor(String profileCreatedFor) {
        this.profileCreatedFor = profileCreatedFor;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getReligion() {
        return religion;
    }

    public void setReligion(String religion) {
        this.religion = religion;
    }

    public String getCaste() {
        return caste;
    }

    public void setCaste(String caste) {
        this.caste = caste;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getJob() {
        return job;
    }

    public void setJob(String job) {
        this.job = job;
    }

    public String getIncome() {
        return income;
    }

    public void setIncome(String income) {
        this.income = income;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public String getMaritalStatus() {
        return maritalStatus;
    }

    public void setMaritalStatus(String maritalStatus) {
        this.maritalStatus = maritalStatus;
    }

    public String getFamilyType() {
        return familyType;
    }

    public void setFamilyType(String familyType) {
        this.familyType = familyType;
    }

    public String getFatherName() {
        return fatherName;
    }

    public void setFatherName(String fatherName) {
        this.fatherName = fatherName;
    }

    public String getMotherName() {
        return motherName;
    }

    public void setMotherName(String motherName) {
        this.motherName = motherName;
    }

    public String getSiblings() {
        return siblings;
    }

    public void setSiblings(String siblings) {
        this.siblings = siblings;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public String getPartnerAge() {
        return partnerAge;
    }

    public void setPartnerAge(String partnerAge) {
        this.partnerAge = partnerAge;
    }

    public String getPartnerCommunity() {
        return partnerCommunity;
    }

    public void setPartnerCommunity(String partnerCommunity) {
        this.partnerCommunity = partnerCommunity;
    }

    public String getPartnerLocation() {
        return partnerLocation;
    }

    public void setPartnerLocation(String partnerLocation) {
        this.partnerLocation = partnerLocation;
    }

    public String getPartnerEducation() {
        return partnerEducation;
    }

    public void setPartnerEducation(String partnerEducation) {
        this.partnerEducation = partnerEducation;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getHabits() {
        return habits;
    }

    public void setHabits(String habits) {
        this.habits = habits;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isPhoneVerified() {
        return phoneVerified;
    }

    public void setPhoneVerified(boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getPremiumPlan() {
        return premiumPlan;
    }

    public void setPremiumPlan(String premiumPlan) {
        this.premiumPlan = premiumPlan;
    }

    public String getPremiumStatus() {
        return premiumStatus;
    }

    public void setPremiumStatus(String premiumStatus) {
        this.premiumStatus = premiumStatus;
    }

    public String getPremiumOrderId() {
        return premiumOrderId;
    }

    public void setPremiumOrderId(String premiumOrderId) {
        this.premiumOrderId = premiumOrderId;
    }

    public String getPremiumPaymentId() {
        return premiumPaymentId;
    }

    public void setPremiumPaymentId(String premiumPaymentId) {
        this.premiumPaymentId = premiumPaymentId;
    }

    public LocalDateTime getPremiumActivatedAt() {
        return premiumActivatedAt;
    }

    public void setPremiumActivatedAt(LocalDateTime premiumActivatedAt) {
        this.premiumActivatedAt = premiumActivatedAt;
    }

    public String getWishlistProfileIds() {
        return wishlistProfileIds;
    }

    public void setWishlistProfileIds(String wishlistProfileIds) {
        this.wishlistProfileIds = wishlistProfileIds;
    }

    public Integer getProfileCompletion() {
        return profileCompletion;
    }

    public void setProfileCompletion(Integer profileCompletion) {
        this.profileCompletion = profileCompletion;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
