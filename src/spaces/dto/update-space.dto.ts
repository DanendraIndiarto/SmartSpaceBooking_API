import { IsString, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';

export class UpdateSpaceDto {
  @IsOptional()
  @IsString()
  nama_space?: string;

  @IsOptional()
  @IsEnum(['desk', 'meeting_room', 'private_office'], {
    message: 'Tipe space harus berupa desk, meeting_room, atau private_office',
  })
  tipe?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Harga per jam tidak boleh minus' })
  harga_per_jam?: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Kapasitas minimal 1 orang' })
  kapasitas?: number;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
