package com.allmatrimony.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "twilio")
public class TwilioProperties {

    private String accountSid;
    private String authToken;
    private String verifySid;

    public String getAccountSid() {
        return accountSid;
    }

    public void setAccountSid(String accountSid) {
        this.accountSid = accountSid;
    }

    public String getAuthToken() {
        return authToken;
    }

    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }

    public String getVerifySid() {
        return verifySid;
    }

    public void setVerifySid(String verifySid) {
        this.verifySid = verifySid;
    }

    public boolean isConfigured() {
        return hasValue(accountSid) && hasValue(authToken) && hasValue(verifySid);
    }

    private boolean hasValue(String value) {
        return value != null && !value.isBlank() && !value.startsWith("YOUR_");
    }
}
