-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'owner', 'member') NOT NULL DEFAULT 'member',
    `maker_key` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `space` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_space` VARCHAR(255) NOT NULL,
    `lokasi` VARCHAR(255) NOT NULL,
    `harga_per_jam` DECIMAL(10, 2) NOT NULL,
    `kapasitas` INTEGER NOT NULL,
    `deskripsi` TEXT NULL,
    `id_owner` INTEGER NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diskon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_diskon` VARCHAR(255) NOT NULL,
    `persentase_diskon` INTEGER NOT NULL,
    `maker_key` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_booking` VARCHAR(100) NOT NULL,
    `id_member` INTEGER NOT NULL,
    `id_space` INTEGER NOT NULL,
    `id_diskon` INTEGER NULL,
    `tanggal_reservasi` DATE NOT NULL,
    `jam_mulai` VARCHAR(10) NOT NULL,
    `jam_selesai` VARCHAR(10) NOT NULL,
    `durasi_jam` INTEGER NOT NULL,
    `harga_per_jam` DECIMAL(10, 2) NOT NULL,
    `total_harga_awal` DECIMAL(10, 2) NOT NULL,
    `potongan_diskon` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total_bayar` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'belum_dikonfirm',
    `maker_key` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `space` ADD CONSTRAINT `space_id_owner_fkey` FOREIGN KEY (`id_owner`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_member_fkey` FOREIGN KEY (`id_member`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_space_fkey` FOREIGN KEY (`id_space`) REFERENCES `space`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_diskon_fkey` FOREIGN KEY (`id_diskon`) REFERENCES `diskon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
