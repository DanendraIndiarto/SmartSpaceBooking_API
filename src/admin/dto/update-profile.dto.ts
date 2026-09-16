import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCoworkingProfileDto {
  @IsNotEmpty({ message: 'Nama coworking wajib diisi' })
  @IsString()
  nama_coworking!: string;

  @IsNotEmpty({ message: 'Nama pemilik wajib diisi' })
  @IsString()
  nama_pemilik!: string;

  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @IsString()
  telp!: string;
}
