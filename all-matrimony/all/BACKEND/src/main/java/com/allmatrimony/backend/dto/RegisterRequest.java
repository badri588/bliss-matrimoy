package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Name is required.")
    private String name;

    @Email(message = "Enter valid email.")
    @NotBlank(message = "Email is required.")
    private String email;

    @NotBlank(message = "Phone number is required.")
    private String phone;

    @NotBlank(message = "Gender is required.")
    private String gender;

    @NotBlank(message = "Profile created for is required.")
    private String profileCreatedFor;

    @NotBlank(message = "Password is required.")
    @Size(min = 6, message = "Password must be at least 6 characters.")
    private String password;

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

    public String getProfileCreatedFor() {
        return profileCreatedFor;
    }

    public void setProfileCreatedFor(String profileCreatedFor) {
        this.profileCreatedFor = profileCreatedFor;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
