import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterMemberDto {
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @IsString()
  username!: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @IsNotEmpty({ message: 'Nama member wajib diisi' })
  @IsString()
  nama_member!: string;

  @IsNotEmpty({ message: 'Instansi wajib diisi' })
  @IsString()
  instansi!: string;

  @IsNotEmpty({ message: 'Alamat wajib diisi' })
  @IsString()
  alamat!: string;

  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @IsString()
  telp!: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
