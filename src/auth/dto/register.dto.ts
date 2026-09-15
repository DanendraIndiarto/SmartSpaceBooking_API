import {
  IsNotEmpty,
  IsString,
  IsEnum,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @IsNotEmpty()
  @IsEnum(['member', 'admin_space'], {
    message: 'Role harus member atau admin_space',
  })
  role!: string;

  // Profil opsional Member
  @IsOptional()
  @IsString()
  nama_member?: string;

  @IsOptional()
  @IsString()
  instansi?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  // Profil opsional Space Owner
  @IsOptional()
  @IsString()
  nama_coworking?: string;

  @IsOptional()
  @IsString()
  nama_pemilik?: string;

  // Umum
  @IsOptional()
  @IsString()
  telp?: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
