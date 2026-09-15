-- ==========================================================
-- UKK RPL Paket B - Smart Space Booking API
-- Database Schema Export
-- DBMS: MySQL
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `detail_reservasi`;
DROP TABLE IF EXISTS `reservasi`;
DROP TABLE IF EXISTS `diskon`;
DROP TABLE IF EXISTS `space`;
DROP TABLE IF EXISTS `space_owner`;
DROP TABLE IF EXISTS `member`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `maker`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin_space', 'member') NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `member`
-- --------------------------------------------------------
CREATE TABLE `member` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nama_member` VARCHAR(100) NOT NULL,
    `instansi` VARCHAR(100) NULL,
    `alamat` TEXT NULL,
    `telp` VARCHAR(20) NULL,
    `id_user` INT NOT NULL,
    `foto` VARCHAR(255) NULL,
    `maker_key` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `space_owner`
-- --------------------------------------------------------
CREATE TABLE `space_owner` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nama_coworking` VARCHAR(100) NOT NULL,
    `nama_pemilik` VARCHAR(100) NOT NULL,
    `telp` VARCHAR(20) NULL,
    `id_user` INT NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `space`
-- --------------------------------------------------------
CREATE TABLE `space` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nama_space` VARCHAR(100) NOT NULL,
    `harga_per_jam` DOUBLE NOT NULL,
    `tipe` ENUM('desk', 'meeting_room', 'private_office') NOT NULL,
    `kapasitas` INT NOT NULL,
    `foto` VARCHAR(255) NULL,
    `deskripsi` TEXT NULL,
    `id_owner` INT NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `diskon`
-- --------------------------------------------------------
CREATE TABLE `diskon` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nama_diskon` VARCHAR(100) NOT NULL,
    `persentase_diskon` DOUBLE NOT NULL,
    `tanggal_awal` DATETIME(3) NOT NULL,
    `tanggal_akhir` DATETIME(3) NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `reservasi`
-- --------------------------------------------------------
CREATE TABLE `reservasi` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tanggal_reservasi` DATETIME(3) NOT NULL,
    `jam_mulai` TIME NOT NULL,
    `durasi_jam` INT NOT NULL,
    `id_owner` INT NOT NULL,
    `id_member` INT NOT NULL,
    `status` ENUM('belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'belum_dikonfirm',
    `maker_key` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `detail_reservasi`
-- --------------------------------------------------------
CREATE TABLE `detail_reservasi` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `id_reservasi` INT NOT NULL,
    `id_space` INT NOT NULL,
    `id_diskon` INT NULL,
    `total_harga` DOUBLE NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `maker`
-- --------------------------------------------------------
CREATE TABLE `maker` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `app_name` VARCHAR(100) NOT NULL,
    `app_key` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY `maker_email_key` (`email`),
    UNIQUE KEY `maker_app_key_key` (`app_key`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Foreign Key Constraints
-- --------------------------------------------------------
ALTER TABLE `member` 
    ADD CONSTRAINT `member_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `space_owner` 
    ADD CONSTRAINT `space_owner_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `space` 
    ADD CONSTRAINT `space_id_owner_fkey` FOREIGN KEY (`id_owner`) REFERENCES `space_owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reservasi` 
    ADD CONSTRAINT `reservasi_id_owner_fkey` FOREIGN KEY (`id_owner`) REFERENCES `space_owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `reservasi_id_member_fkey` FOREIGN KEY (`id_member`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `detail_reservasi` 
    ADD CONSTRAINT `detail_reservasi_id_reservasi_fkey` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `detail_reservasi_id_space_fkey` FOREIGN KEY (`id_space`) REFERENCES `space`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `detail_reservasi_id_diskon_fkey` FOREIGN KEY (`id_diskon`) REFERENCES `diskon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
