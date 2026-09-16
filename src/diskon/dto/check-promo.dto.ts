import { IsNotEmpty, IsString } from 'class-validator';

export class CheckPromoDto {
  @IsNotEmpty({ message: 'Nama diskon / kode promo wajib diisi' })
  @IsString()
  nama_diskon!: string;
}
