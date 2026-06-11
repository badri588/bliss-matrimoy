package com.allmatrimony.backend.service;

import com.allmatrimony.backend.config.TwilioProperties;
import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import org.springframework.stereotype.Service;

@Service
public class TwilioSmsService implements SmsService {

    private final TwilioProperties twilioProperties;

    public TwilioSmsService(TwilioProperties twilioProperties) {
        this.twilioProperties = twilioProperties;
    }

    @Override
    public void sendOtp(String phone, String otp) {
        if (!isConfigured()) {
            throw new IllegalStateException("Twilio credentials are not configured.");
        }

        initTwilio();

        Verification.creator(
                twilioProperties.getVerifySid(),
                toE164(phone),
                "sms"
        ).create();
    }

    @Override
    public boolean verifyOtp(String phone, String otp) {
        if (!isConfigured()) {
            throw new IllegalStateException("Twilio credentials are not configured.");
        }

        initTwilio();

        VerificationCheck verificationCheck = VerificationCheck.creator(twilioProperties.getVerifySid())
                .setTo(toE164(phone))
                .setCode(otp)
                .create();

        return "approved".equalsIgnoreCase(verificationCheck.getStatus());
    }

    @Override
    public boolean isConfigured() {
        return twilioProperties.isConfigured();
    }

    private void initTwilio() {
        Twilio.init(
                twilioProperties.getAccountSid(),
                twilioProperties.getAuthToken()
        );
    }

    private String toE164(String phone) {
        return phone.startsWith("+") ? phone : "+91" + phone;
    }
}
