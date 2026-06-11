package com.allmatrimony.backend.service;

public interface SmsService {

    void sendOtp(String phone, String otp);

    boolean verifyOtp(String phone, String otp);

    boolean isConfigured();
}
