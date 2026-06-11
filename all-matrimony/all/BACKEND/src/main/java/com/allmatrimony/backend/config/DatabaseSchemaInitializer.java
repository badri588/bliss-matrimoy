package com.allmatrimony.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;

@Component
public class DatabaseSchemaInitializer implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseSchemaInitializer.class);

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaInitializer(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureWishlistProfileIdsColumn();
        ensureColumn("vendors", "service_photos_json", "ALTER TABLE vendors ADD COLUMN service_photos_json TEXT NULL");
        ensureColumn("vendors", "service_packages_json", "ALTER TABLE vendors ADD COLUMN service_packages_json TEXT NULL");
        ensureColumn("vendors", "service_details_json", "ALTER TABLE vendors ADD COLUMN service_details_json TEXT NULL");
        ensureColumn("vendors", "service_description", "ALTER TABLE vendors ADD COLUMN service_description TEXT NULL");
        ensureColumn("vendors", "service_profiles_json", "ALTER TABLE vendors ADD COLUMN service_profiles_json TEXT NULL");
        ensureColumn("wedding_services", "gallery_images_json", "ALTER TABLE wedding_services ADD COLUMN gallery_images_json TEXT NULL");
        ensureColumn("wedding_services", "packages_json", "ALTER TABLE wedding_services ADD COLUMN packages_json TEXT NULL");
        ensureColumn("wedding_services", "service_details_json", "ALTER TABLE wedding_services ADD COLUMN service_details_json TEXT NULL");
        ensureColumn("wedding_services", "updated_at", "ALTER TABLE wedding_services ADD COLUMN updated_at DATETIME NULL");
        ensureColumn("service_requests", "vendor_id", "ALTER TABLE service_requests ADD COLUMN vendor_id BIGINT NULL");
        ensureColumn("service_requests", "payment_status", "ALTER TABLE service_requests ADD COLUMN payment_status VARCHAR(30) NULL");
        ensureColumn("service_requests", "payment_amount", "ALTER TABLE service_requests ADD COLUMN payment_amount INT NULL");
        ensureColumn("service_requests", "package_name", "ALTER TABLE service_requests ADD COLUMN package_name VARCHAR(150) NULL");
        ensureColumn("service_requests", "package_price", "ALTER TABLE service_requests ADD COLUMN package_price VARCHAR(80) NULL");
        ensureColumn("service_requests", "payment_currency", "ALTER TABLE service_requests ADD COLUMN payment_currency VARCHAR(10) NULL");
        ensureColumn("service_requests", "razorpay_order_id", "ALTER TABLE service_requests ADD COLUMN razorpay_order_id VARCHAR(100) NULL");
        ensureColumn("service_requests", "razorpay_payment_id", "ALTER TABLE service_requests ADD COLUMN razorpay_payment_id VARCHAR(100) NULL");
        ensureColumn("service_requests", "razorpay_signature", "ALTER TABLE service_requests ADD COLUMN razorpay_signature VARCHAR(200) NULL");
        ensureColumn("service_requests", "payment_verified_at", "ALTER TABLE service_requests ADD COLUMN payment_verified_at TIMESTAMP NULL");
        ensureColumn("service_booking_payments", "user_id", "ALTER TABLE service_booking_payments ADD COLUMN user_id BIGINT NULL");
        ensureColumn("service_booking_payments", "package_name", "ALTER TABLE service_booking_payments ADD COLUMN package_name VARCHAR(150) NULL");
        ensureColumn("service_booking_payments", "package_price", "ALTER TABLE service_booking_payments ADD COLUMN package_price VARCHAR(80) NULL");
    }

    private void ensureWishlistProfileIdsColumn() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();

            try (ResultSet columns = metaData.getColumns(
                    connection.getCatalog(),
                    null,
                    "users",
                    "wishlist_profile_ids"
            )) {
                if (columns.next()) {
                    return;
                }
            }

            jdbcTemplate.execute(
                    "ALTER TABLE users ADD COLUMN wishlist_profile_ids TEXT NULL"
            );
            LOGGER.info("Added missing users.wishlist_profile_ids column.");
        } catch (Exception ex) {
            LOGGER.warn("Could not verify or add users.wishlist_profile_ids column.", ex);
        }
    }

    private void ensureColumn(String tableName, String columnName, String alterSql) {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();

            try (ResultSet columns = metaData.getColumns(
                    connection.getCatalog(),
                    null,
                    tableName,
                    columnName
            )) {
                if (columns.next()) {
                    return;
                }
            }

            jdbcTemplate.execute(alterSql);
            LOGGER.info("Added missing {}.{} column.", tableName, columnName);
        } catch (Exception ex) {
            LOGGER.warn("Could not verify or add {}.{} column.", tableName, columnName, ex);
        }
    }
}
