import { IsNumber, IsString, IsOptional, Min, IsIn } from 'class-validator';

export class UpdateReservasiDto {
  @IsOptional()
  @IsNumber()
  id_space?: number;

  @IsOptional()
  @IsString()
  tanggal_reservasi?: string;

  @IsOptional()
  @IsString()
  jam_mulai?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durasi_jam?: number;

  @IsOptional()
  @IsNumber()
  id_diskon?: number;

  @IsOptional()
  @IsString()
  kode_promo?: string;

  @IsOptional()
  @IsIn(['belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan'])
  status?: string;
}
