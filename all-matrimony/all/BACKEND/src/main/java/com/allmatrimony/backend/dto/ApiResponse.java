package com.allmatrimony.backend.dto;

public class ApiResponse {

    private boolean success;
    private String message;
    private Object data;
    private String demoOtp;

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message, Object data, String demoOtp) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.demoOtp = demoOtp;
    }

    public static ApiResponse success(String message) {
        return new ApiResponse(true, message, null, null);
    }

    public static ApiResponse success(String message, Object data) {
        return new ApiResponse(true, message, data, null);
    }

    public static ApiResponse successWithOtp(String message, String demoOtp) {
        return new ApiResponse(true, message, null, demoOtp);
    }

    public static ApiResponse failure(String message) {
        return new ApiResponse(false, message, null, null);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getDemoOtp() {
        return demoOtp;
    }

    public void setDemoOtp(String demoOtp) {
        this.demoOtp = demoOtp;
    }
}
