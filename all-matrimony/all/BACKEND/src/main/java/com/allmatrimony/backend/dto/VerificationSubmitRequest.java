package com.allmatrimony.backend.dto;

public class VerificationSubmitRequest {
    private String idNumber;
    private String addressProof;
    private String addressDetail;
    private String educationProof;
    private String educationDetail;
    private String jobProof;
    private String jobDetail;
    private String familyContact;
    private String characterVerification;
    private String maritalProof;
    private String maritalDetail;

    public String getIdNumber() { return idNumber; }
    public void setIdNumber(String idNumber) { this.idNumber = idNumber; }
    public String getAddressProof() { return addressProof; }
    public void setAddressProof(String addressProof) { this.addressProof = addressProof; }
    public String getAddressDetail() { return addressDetail; }
    public void setAddressDetail(String addressDetail) { this.addressDetail = addressDetail; }
    public String getEducationProof() { return educationProof; }
    public void setEducationProof(String educationProof) { this.educationProof = educationProof; }
    public String getEducationDetail() { return educationDetail; }
    public void setEducationDetail(String educationDetail) { this.educationDetail = educationDetail; }
    public String getJobProof() { return jobProof; }
    public void setJobProof(String jobProof) { this.jobProof = jobProof; }
    public String getJobDetail() { return jobDetail; }
    public void setJobDetail(String jobDetail) { this.jobDetail = jobDetail; }
    public String getFamilyContact() { return familyContact; }
    public void setFamilyContact(String familyContact) { this.familyContact = familyContact; }
    public String getCharacterVerification() { return characterVerification; }
    public void setCharacterVerification(String characterVerification) { this.characterVerification = characterVerification; }
    public String getMaritalProof() { return maritalProof; }
    public void setMaritalProof(String maritalProof) { this.maritalProof = maritalProof; }
    public String getMaritalDetail() { return maritalDetail; }
    public void setMaritalDetail(String maritalDetail) { this.maritalDetail = maritalDetail; }
}
