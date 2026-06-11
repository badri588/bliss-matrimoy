

package com.allmatrimony.backend.entity;
import java.time.LocalDateTime;
 
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
 
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "service_requests")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ServiceRequest {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    @JsonIgnore
    private ServiceCustomer customer;
 
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

    @Column(name = "payment_status", length = 30)
    private String paymentStatus;

    @Column(name = "payment_amount")
    private Integer paymentAmount;

    @Column(length = 10)
    private String paymentCurrency;

    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 200)
    private String razorpaySignature;
 
    @Column(name = "booking_date", length = 20)
    private String bookingDate;
 
    @Column(name = "booking_end_date", length = 20)
    private String bookingEndDate;
 
    @Column(name = "booking_time", length = 20)
    private String bookingTime;
 
    @Column(length = 30)
    private String status;
 
    @Column(name = "admin_message", length = 500)
    private String adminMessage;
 
    @Column(name = "requested_at")
    private LocalDateTime requestedAt;
 
    @Column(name = "status_updated_at")
    private LocalDateTime statusUpdatedAt;

    @Column(name = "payment_verified_at")
    private LocalDateTime paymentVerifiedAt;
 
    public ServiceRequest() {
    }
 
    @PrePersist
    public void onCreate() {
        this.requestedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
 
    public Long getId() {
        return id;
    }
 
    public ServiceCustomer getCustomer() {
        return customer;
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

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public Integer getPaymentAmount() {
        return paymentAmount;
    }

    public String getPaymentCurrency() {
        return paymentCurrency;
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
 
    public String getBookingDate() {
        return bookingDate;
    }
 
    public String getBookingEndDate() {
        return bookingEndDate;
    }
 
    public String getBookingTime() {
        return bookingTime;
    }
 
    public String getStatus() {
        return status;
    }
 
    public String getAdminMessage() {
        return adminMessage;
    }
 
    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }
 
    public LocalDateTime getStatusUpdatedAt() {
        return statusUpdatedAt;
    }

    public LocalDateTime getPaymentVerifiedAt() {
        return paymentVerifiedAt;
    }

    public String getUserId() {
        return customer == null ? null : customer.getUserKey();
    }

    public String getUserName() {
        return customer == null ? null : customer.getFullName();
    }

    public String getPhone() {
        return customer == null ? null : customer.getPhone();
    }

    public String getEmail() {
        return customer == null ? null : customer.getEmail();
    }

    public String getCustomerLocation() {
        if (customer == null) {
            return null;
        }

        return customer.getCity() != null && !customer.getCity().isBlank()
                ? customer.getCity()
                : customer.getAddress();
    }

    public String getInvoiceNumber() {
        return "INV-" + String.format("%06d", id == null ? 0 : id);
    }

    public String getInvoiceDate() {
        LocalDateTime source = paymentVerifiedAt != null ? paymentVerifiedAt : requestedAt;
        return source == null ? null : source.toString();
    }

    public Integer getInvoiceAmount() {
        if (paymentAmount == null) {
            return null;
        }

        if (paymentAmount > 1000) {
            return (int) Math.round(paymentAmount / 100.0);
        }

        return paymentAmount;
    }

    public String getInvoiceStatus() {
        if ("APPROVED".equalsIgnoreCase(status)) {
            return "PAID";
        }

        if ("REJECTED".equalsIgnoreCase(status)) {
            return "CANCELLED";
        }

        return paymentStatus != null ? paymentStatus : "PENDING";
    }

    public String getInvoiceReference() {
        return razorpayPaymentId != null && !razorpayPaymentId.isBlank()
                ? razorpayPaymentId
                : razorpayOrderId;
    }

    public void setId(Long id) {
        this.id = id;
    }
 
    public void setCustomer(ServiceCustomer customer) {
        this.customer = customer;
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

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public void setPaymentAmount(Integer paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public void setPaymentCurrency(String paymentCurrency) {
        this.paymentCurrency = paymentCurrency;
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
 
    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }
 
    public void setBookingEndDate(String bookingEndDate) {
        this.bookingEndDate = bookingEndDate;
    }
 
    public void setBookingTime(String bookingTime) {
        this.bookingTime = bookingTime;
    }
 
    public void setStatus(String status) {
        this.status = status;
    }
 
    public void setAdminMessage(String adminMessage) {
        this.adminMessage = adminMessage;
    }
 
    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }
 
    public void setStatusUpdatedAt(LocalDateTime statusUpdatedAt) {
        this.statusUpdatedAt = statusUpdatedAt;
    }

    public void setPaymentVerifiedAt(LocalDateTime paymentVerifiedAt) {
        this.paymentVerifiedAt = paymentVerifiedAt;
    }
}
 
