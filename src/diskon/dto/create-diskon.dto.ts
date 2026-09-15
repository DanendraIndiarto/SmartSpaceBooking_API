import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreateDiskonDto {
  @IsNotEmpty()
  @IsString()
  nama_diskon!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Persentase diskon tidak boleh kurang dari 0' })
  @Max(100, { message: 'Persentase diskon tidak boleh lebih dari 100' })
  persentase_diskon!: number;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'Format tanggal_awal harus berupa format ISO / YYYY-MM-DD' },
  )
  tanggal_awal!: string;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'Format tanggal_akhir harus berupa format ISO / YYYY-MM-DD' },
  )
  tanggal_akhir!: string;
}
