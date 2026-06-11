package com.allmatrimony.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String fromEmail
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    public void sendForgotPasswordOtp(String toEmail, String otp) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            if (fromEmail != null && !fromEmail.isBlank()) {
                helper.setFrom(fromEmail);
            }
            helper.setTo(toEmail);
            helper.setSubject("All Matrimony Password Reset OTP");
            helper.setText(buildForgotPasswordTemplate(otp), true);

            mailSender.send(mimeMessage);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to send OTP email right now.");
        }
    }

    private String buildForgotPasswordTemplate(String otp) {
        return """
                <div style="margin:0;padding:24px;background:#f8f3ff;font-family:Arial,sans-serif;color:#1f1433;">
                  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #ded0f5;">
                    <div style="background:linear-gradient(135deg,#4c1d95,#7c3aed,#5b1245);padding:32px 24px;text-align:center;">
                      <div style="width:72px;height:72px;border-radius:36px;background:#ffffff;margin:0 auto 16px auto;line-height:72px;font-size:28px;">&#10084;</div>
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">All Matrimony</h1>
                      <p style="margin:10px 0 0 0;color:#f7e8ff;font-size:14px;font-weight:600;">Secure password reset verification</p>
                    </div>
                    <div style="padding:28px 24px;">
                      <p style="margin:0 0 16px 0;font-size:16px;font-weight:700;">Your OTP for password reset</p>
                      <p style="margin:0 0 18px 0;font-size:14px;line-height:22px;color:#5b516d;">
                        Use the OTP below to reset your All Matrimony account password. This OTP is valid for 10 minutes.
                      </p>
                      <div style="margin:0 auto 20px auto;width:max-content;background:#f1e7ff;border:1px solid #ded0f5;border-radius:18px;padding:16px 28px;font-size:32px;font-weight:900;letter-spacing:8px;color:#4c1d95;">
                        %s
                      </div>
                      <p style="margin:0 0 8px 0;font-size:13px;line-height:21px;color:#746887;">
                        If you did not request this reset, you can ignore this email safely.
                      </p>
                      <p style="margin:0;font-size:13px;line-height:21px;color:#746887;">
                        Thank you for using All Matrimony.
                      </p>
                    </div>
                  </div>
                </div>
                """.formatted(otp);
    }
}
