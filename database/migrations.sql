-- Doren database migration SQL
-- Target: MySQL 8+
-- Generated from database/migrations/*.php
-- This file contains the migration "up" operations in timestamp order.

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE password_reset_tokens (
    email VARCHAR(255) NOT NULL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
);

CREATE TABLE sessions (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    INDEX sessions_user_id_index (user_id),
    INDEX sessions_last_activity_index (last_activity)
);

CREATE TABLE cache (
    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
    value MEDIUMTEXT NOT NULL,
    expiration BIGINT NOT NULL,
    INDEX cache_expiration_index (expiration)
);

CREATE TABLE cache_locks (
    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration BIGINT NOT NULL,
    INDEX cache_locks_expiration_index (expiration)
);

CREATE TABLE jobs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    attempts SMALLINT UNSIGNED NOT NULL,
    reserved_at INT UNSIGNED NULL,
    available_at INT UNSIGNED NOT NULL,
    created_at INT UNSIGNED NOT NULL,
    INDEX jobs_queue_index (queue)
);

CREATE TABLE job_batches (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INT NOT NULL,
    pending_jobs INT NOT NULL,
    failed_jobs INT NOT NULL,
    failed_job_ids LONGTEXT NOT NULL,
    options MEDIUMTEXT NULL,
    cancelled_at INT NULL,
    created_at INT NOT NULL,
    finished_at INT NULL
);

CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection VARCHAR(255) NOT NULL,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX failed_jobs_connection_queue_failed_at_index (connection, queue, failed_at)
);

CREATE TABLE passkeys (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    credential_id VARCHAR(255) NOT NULL UNIQUE,
    credential JSON NOT NULL,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX passkeys_user_id_index (user_id),
    CONSTRAINT passkeys_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

ALTER TABLE users
    ADD two_factor_secret TEXT NULL AFTER password,
    ADD two_factor_recovery_codes TEXT NULL AFTER two_factor_secret,
    ADD two_factor_confirmed_at TIMESTAMP NULL AFTER two_factor_recovery_codes;

CREATE TABLE product_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    is_visible TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX product_categories_is_visible_sort_order_index (is_visible, sort_order)
);

CREATE TABLE products (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_category_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(255) NULL UNIQUE,
    description TEXT NULL,
    price_cents INT UNSIGNED NOT NULL,
    compare_at_price_cents INT UNSIGNED NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    primary_image_url VARCHAR(255) NULL,
    gallery_image_urls JSON NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX products_product_category_id_is_active_sort_order_index (product_category_id, is_active, sort_order),
    INDEX products_is_active_is_featured_sort_order_index (is_active, is_featured, sort_order),
    INDEX products_is_active_published_at_index (is_active, published_at),
    INDEX products_price_cents_index (price_cents),
    CONSTRAINT products_product_category_id_foreign FOREIGN KEY (product_category_id) REFERENCES product_categories (id) ON DELETE SET NULL
);

CREATE TABLE product_variants (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    sku VARCHAR(255) NOT NULL UNIQUE,
    size VARCHAR(20) NOT NULL,
    color_name VARCHAR(80) NOT NULL,
    color_hex VARCHAR(7) NULL,
    price_cents INT UNSIGNED NULL,
    stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    reserved_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY product_variants_product_id_size_color_name_unique (product_id, size, color_name),
    INDEX product_variants_product_id_is_active_sort_order_index (product_id, is_active, sort_order),
    INDEX product_variants_is_active_stock_quantity_index (is_active, stock_quantity),
    CONSTRAINT product_variants_product_id_foreign FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    customer_first_name VARCHAR(255) NOT NULL,
    customer_last_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(40) NULL,
    shipping_city VARCHAR(255) NOT NULL,
    shipping_street_address VARCHAR(255) NOT NULL,
    shipping_address_line_two VARCHAR(255) NULL,
    shipping_postal_code VARCHAR(40) NOT NULL,
    shipping_country_code CHAR(2) NOT NULL DEFAULT 'US',
    customer_note TEXT NULL,
    subtotal_cents INT UNSIGNED NOT NULL,
    shipping_cents INT UNSIGNED NOT NULL DEFAULT 0,
    tax_cents INT UNSIGNED NOT NULL DEFAULT 0,
    discount_cents INT UNSIGNED NOT NULL DEFAULT 0,
    total_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    placed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX orders_placed_at_index (placed_at),
    INDEX orders_status_created_at_index (status, created_at),
    INDEX orders_payment_status_created_at_index (payment_status, created_at),
    INDEX orders_customer_email_created_at_index (customer_email, created_at)
);

CREATE TABLE order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL,
    product_variant_id BIGINT UNSIGNED NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NULL,
    sku VARCHAR(255) NULL,
    unit_price_cents INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    line_total_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    product_options JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX order_items_order_id_product_id_index (order_id, product_id),
    INDEX order_items_product_id_created_at_index (product_id, created_at),
    INDEX order_items_product_variant_id_created_at_index (product_variant_id, created_at),
    CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT order_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
    CONSTRAINT order_items_product_variant_id_foreign FOREIGN KEY (product_variant_id) REFERENCES product_variants (id) ON DELETE SET NULL
);

ALTER TABLE users
    ADD is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER password,
    ADD INDEX users_is_admin_index (is_admin);

CREATE TABLE storefront_banners (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    position VARCHAR(32) NOT NULL,
    eyebrow VARCHAR(255) NULL,
    title VARCHAR(255) NULL,
    subtitle TEXT NULL,
    body TEXT NULL,
    primary_action_label VARCHAR(255) NULL,
    primary_action_url VARCHAR(255) NULL,
    secondary_action_label VARCHAR(255) NULL,
    secondary_action_url VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX storefront_banners_position_is_active_sort_order_index (position, is_active, sort_order)
);

CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name TEXT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX personal_access_tokens_tokenable_type_tokenable_id_index (tokenable_type, tokenable_id),
    INDEX personal_access_tokens_expires_at_index (expires_at)
);

ALTER TABLE product_variants
    ADD image_url VARCHAR(255) NULL AFTER color_hex;

CREATE TABLE inventory_movements (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_variant_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NULL,
    type VARCHAR(20) NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    balance_after INT UNSIGNED NOT NULL,
    unit_amount_cents INT UNSIGNED NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    sku VARCHAR(255) NOT NULL,
    reference VARCHAR(80) NULL,
    note TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX inventory_movements_type_created_at_index (type, created_at),
    INDEX inventory_movements_product_variant_id_created_at_index (product_variant_id, created_at),
    CONSTRAINT inventory_movements_product_variant_id_foreign FOREIGN KEY (product_variant_id) REFERENCES product_variants (id) ON DELETE SET NULL,
    CONSTRAINT inventory_movements_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE product_variant_images (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_variant_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY product_variant_images_product_variant_id_sort_order_unique (product_variant_id, sort_order),
    CONSTRAINT product_variant_images_product_variant_id_foreign FOREIGN KEY (product_variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
);

ALTER TABLE products
    ADD INDEX products_updated_at_id_index (updated_at, id);

CREATE TABLE campaigns (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value INT UNSIGNED NOT NULL,
    starts_at TIMESTAMP NULL,
    ends_at TIMESTAMP NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX campaigns_starts_at_index (starts_at),
    INDEX campaigns_ends_at_index (ends_at),
    INDEX campaigns_is_active_index (is_active)
);

CREATE TABLE campaign_product (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    campaign_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY campaign_product_campaign_id_product_id_unique (campaign_id, product_id),
    INDEX campaign_product_product_id_campaign_id_index (product_id, campaign_id),
    CONSTRAINT campaign_product_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
    CONSTRAINT campaign_product_product_id_foreign FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE TABLE permissions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY permissions_name_guard_name_unique (name, guard_name)
);

CREATE TABLE roles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY roles_name_guard_name_unique (name, guard_name)
);

CREATE TABLE model_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (permission_id, model_id, model_type),
    INDEX model_has_permissions_model_id_model_type_index (model_id, model_type),
    CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
);

CREATE TABLE model_has_roles (
    role_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, model_id, model_type),
    INDEX model_has_roles_model_id_model_type_index (model_id, model_type),
    CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

CREATE TABLE role_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (permission_id, role_id),
    CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE,
    CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

ALTER TABLE products
    MODIFY currency CHAR(3) NOT NULL DEFAULT 'EUR';

ALTER TABLE orders
    MODIFY currency CHAR(3) NOT NULL DEFAULT 'EUR';

ALTER TABLE order_items
    MODIFY currency CHAR(3) NOT NULL DEFAULT 'EUR';

UPDATE products SET currency = 'EUR' WHERE currency = 'USD';
UPDATE orders SET currency = 'EUR' WHERE currency = 'USD';
UPDATE order_items SET currency = 'EUR' WHERE currency = 'USD';

ALTER TABLE orders
    MODIFY shipping_country_code CHAR(2) NOT NULL DEFAULT 'EU';
