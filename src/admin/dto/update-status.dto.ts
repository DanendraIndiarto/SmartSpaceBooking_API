import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateReservasiStatusDto {
  @IsNotEmpty({ message: 'Status wajib diisi' })
  @IsIn(['belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan'], {
    message:
      "Status harus salah satu dari: 'belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan'",
  })
  status!: string;
}
