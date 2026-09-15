import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateSpaceDto {
  @IsNotEmpty()
  @IsString()
  nama_space!: string;

  @IsNotEmpty()
  @IsEnum(['desk', 'meeting_room', 'private_office'], {
    message: 'Tipe space harus berupa desk, meeting_room, atau private_office',
  })
  tipe!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Harga per jam tidak boleh minus' })
  harga_per_jam!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Kapasitas minimal 1 orang' })
  kapasitas!: number;

  @IsNotEmpty()
  @IsString()
  deskripsi!: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
