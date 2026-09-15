/*
  Warnings:

  - You are about to drop the column `created_at` on the `diskon` table. All the data in the column will be lost.
  - You are about to alter the column `nama_diskon` on the `diskon` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `persentase_diskon` on the `diskon` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the column `created_at` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `harga_per_jam` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `id_diskon` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `id_space` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `jam_selesai` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `kode_booking` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `potongan_diskon` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `total_bayar` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `total_harga_awal` on the `reservasi` table. All the data in the column will be lost.
  - You are about to alter the column `jam_mulai` on the `reservasi` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Time`.
  - You are about to drop the column `created_at` on the `space` table. All the data in the column will be lost.
  - You are about to drop the column `lokasi` on the `space` table. All the data in the column will be lost.
  - You are about to alter the column `nama_space` on the `space` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `harga_per_jam` on the `space` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tanggal_akhir` to the `diskon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggal_awal` to the `diskon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_owner` to the `reservasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipe` to the `space` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `reservasi` DROP FOREIGN KEY `reservasi_id_diskon_fkey`;

-- DropForeignKey
ALTER TABLE `reservasi` DROP FOREIGN KEY `reservasi_id_member_fkey`;

-- DropForeignKey
ALTER TABLE `reservasi` DROP FOREIGN KEY `reservasi_id_space_fkey`;

-- DropForeignKey
ALTER TABLE `space` DROP FOREIGN KEY `space_id_owner_fkey`;

-- DropIndex
DROP INDEX `reservasi_id_diskon_fkey` ON `reservasi`;

-- DropIndex
DROP INDEX `reservasi_id_member_fkey` ON `reservasi`;

-- DropIndex
DROP INDEX `reservasi_id_space_fkey` ON `reservasi`;

-- DropIndex
DROP INDEX `space_id_owner_fkey` ON `space`;

-- AlterTable
ALTER TABLE `diskon` DROP COLUMN `created_at`,
    ADD COLUMN `tanggal_akhir` DATETIME(3) NOT NULL,
    ADD COLUMN `tanggal_awal` DATETIME(3) NOT NULL,
    MODIFY `nama_diskon` VARCHAR(100) NOT NULL,
    MODIFY `persentase_diskon` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `reservasi` DROP COLUMN `created_at`,
    DROP COLUMN `harga_per_jam`,
    DROP COLUMN `id_diskon`,
    DROP COLUMN `id_space`,
    DROP COLUMN `jam_selesai`,
    DROP COLUMN `kode_booking`,
    DROP COLUMN `potongan_diskon`,
    DROP COLUMN `total_bayar`,
    DROP COLUMN `total_harga_awal`,
    ADD COLUMN `id_owner` INTEGER NOT NULL,
    MODIFY `tanggal_reservasi` DATETIME(3) NOT NULL,
    MODIFY `jam_mulai` TIME NOT NULL;

-- AlterTable
ALTER TABLE `space` DROP COLUMN `created_at`,
    DROP COLUMN `lokasi`,
    ADD COLUMN `foto` VARCHAR(255) NULL,
    ADD COLUMN `tipe` ENUM('desk', 'meeting_room', 'private_office') NOT NULL,
    MODIFY `nama_space` VARCHAR(100) NOT NULL,
    MODIFY `harga_per_jam` DOUBLE NOT NULL;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin_space', 'member') NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_member` VARCHAR(100) NOT NULL,
    `instansi` VARCHAR(100) NULL,
    `alamat` TEXT NULL,
    `telp` VARCHAR(20) NULL,
    `id_user` INTEGER NOT NULL,
    `foto` VARCHAR(255) NULL,
    `maker_key` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `space_owner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_coworking` VARCHAR(100) NOT NULL,
    `nama_pemilik` VARCHAR(100) NOT NULL,
    `telp` VARCHAR(20) NULL,
    `id_user` INTEGER NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_reservasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_reservasi` INTEGER NOT NULL,
    `id_space` INTEGER NOT NULL,
    `id_diskon` INTEGER NULL,
    `total_harga` DOUBLE NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `member` ADD CONSTRAINT `member_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `space_owner` ADD CONSTRAINT `space_owner_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `space` ADD CONSTRAINT `space_id_owner_fkey` FOREIGN KEY (`id_owner`) REFERENCES `space_owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_owner_fkey` FOREIGN KEY (`id_owner`) REFERENCES `space_owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_member_fkey` FOREIGN KEY (`id_member`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_reservasi` ADD CONSTRAINT `detail_reservasi_id_reservasi_fkey` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_reservasi` ADD CONSTRAINT `detail_reservasi_id_space_fkey` FOREIGN KEY (`id_space`) REFERENCES `space`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_reservasi` ADD CONSTRAINT `detail_reservasi_id_diskon_fkey` FOREIGN KEY (`id_diskon`) REFERENCES `diskon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
