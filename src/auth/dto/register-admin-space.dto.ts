import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAdminSpaceDto {
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @IsString()
  username!: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

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
