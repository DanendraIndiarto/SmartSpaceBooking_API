import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class UpdateDiskonDto {
  @IsOptional()
  @IsString()
  nama_diskon?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Persentase diskon tidak boleh kurang dari 0' })
  @Max(100, { message: 'Persentase diskon tidak boleh lebih dari 100' })
  persentase_diskon?: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Format tanggal_awal harus berupa format ISO / YYYY-MM-DD' },
  )
  tanggal_awal?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Format tanggal_akhir harus berupa format ISO / YYYY-MM-DD' },
  )
  tanggal_akhir?: string;
}
