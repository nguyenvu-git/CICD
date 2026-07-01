-- Idempotent schema upgrade for inventory and import_vouchers
DELIMITER //

DROP PROCEDURE IF EXISTS upgrade_inventory_schema //
CREATE PROCEDURE upgrade_inventory_schema()
BEGIN
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory' AND COLUMN_NAME = 'category') THEN
        ALTER TABLE `inventory`
        CHANGE COLUMN `ingredient_name` `name` VARCHAR(150) NOT NULL,
        CHANGE COLUMN `stock_quantity` `quantity` DECIMAL(10, 2) DEFAULT 0.00,
        ADD COLUMN `category` VARCHAR(50) DEFAULT 'Other' AFTER `name`,
        ADD COLUMN `min_quantity` DECIMAL(10, 2) DEFAULT 0.00 AFTER `quantity`,
        ADD COLUMN `price` DECIMAL(10, 2) DEFAULT 0.00 AFTER `min_quantity`,
        ADD COLUMN `description` TEXT NULL AFTER `price`,
        ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    END IF;
END //

DROP PROCEDURE IF EXISTS upgrade_import_vouchers_schema //
CREATE PROCEDURE upgrade_import_vouchers_schema()
BEGIN
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'import_vouchers' AND COLUMN_NAME = 'code') THEN
        ALTER TABLE `import_vouchers`
        DROP FOREIGN KEY `fk_imports_inventory`,
        DROP COLUMN `ingredient_id`,
        DROP COLUMN `import_quantity`,
        DROP COLUMN `unit_price`;

        ALTER TABLE `import_vouchers`
        ADD COLUMN `code` VARCHAR(50) NOT NULL UNIQUE AFTER `id`,
        CHANGE COLUMN `imported_at` `import_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN `status` VARCHAR(30) DEFAULT 'Pending' AFTER `import_date`,
        ADD COLUMN `note` TEXT NULL AFTER `status`,
        ADD COLUMN `total_cost` DECIMAL(15, 2) DEFAULT 0.00 AFTER `note`,
        ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    END IF;
END //

DELIMITER ;

CALL upgrade_inventory_schema();
CALL upgrade_import_vouchers_schema();

DROP PROCEDURE IF EXISTS upgrade_inventory_schema;
DROP PROCEDURE IF EXISTS upgrade_import_vouchers_schema;

-- Create import_voucher_details table
CREATE TABLE IF NOT EXISTS `import_voucher_details` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `voucher_id` INT NOT NULL,
    `inventory_id` INT NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(15, 2) NOT NULL,
    CONSTRAINT `fk_details_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `import_vouchers`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_details_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;
