package com.allmatrimony.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_booking_payments")
public class ServiceBookingPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(name = "service_id", length = 50)
    private String serviceId;

    @Column(name = "vendor_id")
    private Long vendorId;

    @Column(name = "service_title", nullable = false, length = 150)
    private String serviceTitle;

    @Column(length = 80)
    private String category;

    @Column(length = 150)
    private String location;

    @Column(length = 80)
    private String price;

    @Column(name = "package_name", length = 150)
    private String packageName;

    @Column(name = "package_price", length = 80)
    private String packagePrice;

    @Column(name = "booking_date", length = 20)
    private String bookingDate;

    @Column(name = "booking_end_date", length = 20)
    private String bookingEndDate;

    @Column(name = "booking_time", length = 20)
    private String bookingTime;

    @Column(length = 150)
    private String customerName;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 150)
    private String customerLocation;

    @Column(nullable = false)
    private Integer amount;

    @Column(length = 10)
    private String currency;

    @Column(length = 30)
    private String status;

    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 200)
    private String razorpaySignature;

    @Column(name = "booking_payload_json", columnDefinition = "TEXT")
    private String bookingPayloadJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getServiceId() {
        return serviceId;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public String getServiceTitle() {
        return serviceTitle;
    }

    public String getCategory() {
        return category;
    }

    public String getLocation() {
        return location;
    }

    public String getPrice() {
        return price;
    }

    public String getPackageName() {
        return packageName;
    }

    public String getPackagePrice() {
        return packagePrice;
    }

    public String getBookingDate() {
        return bookingDate;
    }

    public String getBookingEndDate() {
        return bookingEndDate;
    }

    public String getBookingTime() {
        return bookingTime;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getCustomerLocation() {
        return customerLocation;
    }

    public Integer getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getStatus() {
        return status;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public String getBookingPayloadJson() {
        return bookingPayloadJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public void setServiceTitle(String serviceTitle) {
        this.serviceTitle = serviceTitle;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public void setPackagePrice(String packagePrice) {
        this.packagePrice = packagePrice;
    }

    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }

    public void setBookingEndDate(String bookingEndDate) {
        this.bookingEndDate = bookingEndDate;
    }

    public void setBookingTime(String bookingTime) {
        this.bookingTime = bookingTime;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCustomerLocation(String customerLocation) {
        this.customerLocation = customerLocation;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }

    public void setBookingPayloadJson(String bookingPayloadJson) {
        this.bookingPayloadJson = bookingPayloadJson;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
