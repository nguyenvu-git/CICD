-- =========================================================================
-- KHỞI TẠO DATABASE
-- =========================================================================
CREATE DATABASE IF NOT EXISTS `restaurant_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `restaurant_management`;

-- Tắt kiểm tra khóa ngoại tạm thời để tránh lỗi thứ tự tạo bảng khi chạy script
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================================
-- 🧑💻 THÀNH VIÊN 1: NHÓM QUẢN TRỊ HỆ THỐNG & TÀI KHOẢN
-- =========================================================================

-- Module 2: CRUD Vai trò & Phân quyền
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(50) NOT NULL UNIQUE, -- Admin, Thu ngân, Đầu bếp, Phục vụ
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Module 1: CRUD Tài khoản
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role_id` INT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Module 3: CRUD Hồ sơ cá nhân
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(15) NULL,
    `email` VARCHAR(100) NULL,
    `avatar_url` VARCHAR(255) NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_profiles_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- =========================================================================
-- 🧑💻 THÀNH VIÊN 2: NHÓM QUẢN LÝ DANH MỤC LÕI (MASTER DATA)
-- =========================================================================

-- Module 4: CRUD Danh mục món ăn
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_name` VARCHAR(100) NOT NULL UNIQUE, -- Đồ uống, Món chính, Tráng miệng
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Module 5: CRUD Món ăn/Sản phẩm
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NULL,
    `product_name` VARCHAR(150) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `is_available` TINYINT(1) DEFAULT 1, -- 1: Còn hàng, 0: Hết hàng
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_products_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Module 6: CRUD Nhà cung cấp
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `supplier_name` VARCHAR(150) NOT NULL,
    `contact_name` VARCHAR(100) NULL,
    `phone` VARCHAR(15) NULL,
    `address` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =========================================================================
-- 🧑💻 THÀNH VIÊN 3: NHÓM VẬN HÀNH BÁN HÀNG & ORDER
-- =========================================================================

-- Module 7: CRUD Sơ đồ bàn ăn/Khu vực
DROP TABLE IF EXISTS `tables`;
CREATE TABLE `tables` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `table_number` VARCHAR(20) NOT NULL UNIQUE, -- Bàn số 1, Bàn số 2...
    `zone_name` VARCHAR(50) NULL, -- Tầng 1, Ngoài trời, Phòng VIP
    `status` VARCHAR(30) DEFAULT 'Trống', -- Trống, Có khách, Đã đặt trước
    `capacity` INT DEFAULT 4
) ENGINE=InnoDB;

-- Module 8: CRUD Đơn hàng/Yêu cầu gọi món
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `table_id` INT NULL,
    `created_by` INT NULL, -- ID của nhân viên tạo order
    `status` VARCHAR(30) DEFAULT 'Đang xử lý', -- Đang xử lý, Đã hoàn thành, Đã hủy
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_orders_tables` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_orders_users` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Module 9: CRUD Chi tiết đơn hàng
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NULL,
    `quantity` INT NOT NULL,
    `note` VARCHAR(255) NULL, -- Ví dụ: "Ít đường", "Không hành"
    `item_status` VARCHAR(30) DEFAULT 'Chờ làm', -- Chờ làm, Đang làm, Đã xong
    CONSTRAINT `fk_items_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;


-- =========================================================================
-- 🧑💻 THÀNH VIÊN 4: NHÓM XỬ LÝ HÓA ĐƠN & KHÁCH HÀNG
-- =========================================================================

-- Module 11: CRUD Khách hàng & Thành viên
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(15) NOT NULL UNIQUE,
    `points` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Module 12: CRUD Khuyến mãi/Voucher
DROP TABLE IF EXISTS `discounts`;
CREATE TABLE `discounts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `voucher_code` VARCHAR(50) NOT NULL UNIQUE,
    `discount_type` VARCHAR(20) NOT NULL, -- 'Percentage' (%) hoặc 'Fixed Amount' (Số tiền)
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `min_order_value` DECIMAL(10, 2) DEFAULT 0.00,
    `expiry_date` DATE NOT NULL
) ENGINE=InnoDB;

-- Module 10: CRUD Hóa đơn
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL UNIQUE,
    `customer_id` INT NULL,
    `discount_id` INT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `final_amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT 'Tiền mặt', -- Tiền mặt, Chuyển khoản, Thẻ
    `paid_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_invoices_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_invoices_customers` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_invoices_discounts` FOREIGN KEY (`discount_id`) REFERENCES `discounts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;


-- =========================================================================
-- 🧑💻 THÀNH VIÊN 5: NHÓM QUẢN LÝ KHO & PHẢN HỒI
-- =========================================================================

-- Module 13: CRUD Kho nguyên liệu
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ingredient_name` VARCHAR(150) NOT NULL UNIQUE,
    `stock_quantity` DECIMAL(10, 2) DEFAULT 0.00,
    `unit` VARCHAR(20) NOT NULL -- Kg, Lít, Gói...
) ENGINE=InnoDB;

-- Module 14: CRUD Phiếu nhập kho
DROP TABLE IF EXISTS `import_vouchers`;
CREATE TABLE `import_vouchers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `supplier_id` INT NULL,
    `ingredient_id` INT NULL,
    `import_quantity` DECIMAL(10, 2) NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `imported_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `imported_by` INT NULL,
    CONSTRAINT `fk_imports_suppliers` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_imports_inventory` FOREIGN KEY (`ingredient_id`) REFERENCES `inventory` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_imports_users` FOREIGN KEY (`imported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Module 15: CRUD Đánh giá & Phản hồi
DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE `feedbacks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_name` VARCHAR(100) DEFAULT 'Khách ẩn danh',
    `phone` VARCHAR(15) NULL,
    `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
    `comment` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================================
-- SEED INITIAL DATA FOR VERIFICATION
-- =========================================================================

INSERT INTO `roles` (`role_name`, `description`) VALUES
('Admin', 'Administrator with full system privileges'),
('Thu ngân', 'Cashier in charge of invoicing and payments'),
('Đầu bếp', 'Chef handling orders in the kitchen'),
('Phục vụ', 'Waiter serving tables and taking orders');

INSERT INTO `users` (`username`, `password_hash`, `role_id`, `is_active`) VALUES
('admin', '$2b$10$xyz_admin_hash', 1, 1),
('cashier1', '$2b$10$xyz_cashier_hash', 2, 1),
('chef1', '$2b$10$xyz_chef_hash', 3, 1),
('waiter1', '$2b$10$xyz_waiter_hash', 4, 1);

INSERT INTO `profiles` (`user_id`, `full_name`, `phone`, `email`) VALUES
(1, 'System Administrator', '0901234567', 'admin@restaurant.com'),
(2, 'Nguyen Thi Thu Ngan', '0907654321', 'ngan@restaurant.com'),
(3, 'Tran Van Dau Bep', '0901112222', 'chef@restaurant.com'),
(4, 'Le Van Phuc Vu', '0903334444', 'waiter@restaurant.com');

INSERT INTO `categories` (`category_name`, `description`) VALUES
('Đồ uống', 'Nước ngọt, cà phê, trà, sinh tố'),
('Món chính', 'Cơm, phở, bún, lẩu'),
('Tráng miệng', 'Bánh ngọt, chè, kem');

INSERT INTO `products` (`category_id`, `product_name`, `price`, `image_url`) VALUES
(1, 'Cà phê sữa đá', 29000.00, ''),
(1, 'Trà đào cam sả', 35000.00, ''),
(2, 'Bún chả Hà Nội', 45000.00, ''),
(2, 'Cơm tấm sườn bì chả', 49000.00, ''),
(3, 'Bánh flan', 15000.00, ''),
(3, 'Kem dừa', 25000.00, '');

INSERT INTO `tables` (`table_number`, `zone_name`, `status`, `capacity`) VALUES
('Bàn số 1', 'Tầng 1', 'Trống', 4),
('Bàn số 2', 'Tầng 1', 'Trống', 4),
('Bàn số 3', 'Tầng 1', 'Có khách', 2),
('Bàn số 4', 'Tầng 2 (VIP)', 'Trống', 6),
('Bàn số 5', 'Ngoài trời', 'Đã đặt trước', 4);

INSERT INTO `customers` (`customer_name`, `phone`, `points`) VALUES
('Nguyen Van An', '0908888888', 120),
('Tran Thi Binh', '0909999999', 50);

INSERT INTO `feedbacks` (`customer_name`, `phone`, `rating`, `comment`) VALUES
('Nguyen Van An', '0908888888', 5, 'Món ăn rất ngon, phục vụ nhanh chóng!'),
('Khách ẩn danh', NULL, 4, 'Không gian đẹp, đồ uống hơi ngọt.');

-- Bật lại kiểm tra khóa ngoại sau khi đã tạo xong cấu trúc
SET FOREIGN_KEY_CHECKS = 1;
