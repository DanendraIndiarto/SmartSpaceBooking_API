import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateReservasiDto {
  @IsNotEmpty()
  @IsNumber()
  id_space!: number;

  @IsNotEmpty()
  @IsString()
  tanggal_reservasi!: string;

  @IsNotEmpty()
  @IsString()
  jam_mulai!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  durasi_jam!: number;

  @IsOptional()
  @IsNumber()
  id_diskon?: number;

  @IsOptional()
  @IsString()
  kode_promo?: string;
}
