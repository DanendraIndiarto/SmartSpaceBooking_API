import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { DiskonService } from './diskon.service';
import { CreateDiskonDto } from './dto/create-diskon.dto';
import { UpdateDiskonDto } from './dto/update-diskon.dto';
import { CheckPromoDto } from './dto/check-promo.dto';
import { MakerKeyGuard, JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';

@ApiTags('Diskon & Promo (Katalog Diskon)')
@Controller(['api/diskon', 'diskon'])
@UseGuards(MakerKeyGuard)
@ApiHeader({
  name: 'x-maker-key',
  description: 'Header x-maker-key untuk isolasi data siswa',
  required: true,
})
export class DiskonController {
  constructor(private readonly diskonService: DiskonService) {}

  @Get('active')
  @ApiOperation({ summary: 'Daftar Promo / Diskon yang Sedang Aktif' })
  findActive(@Headers('x-maker-key') makerKey: string) {
    return this.diskonService.findActive(makerKey);
  }

  @Post('check')
  @ApiOperation({
    summary: 'Periksa Validitas & Hitung Potongan Kode Promo',
  })
  checkPromo(
    @Body() dto: CheckPromoDto,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.diskonService.checkPromo(dto.nama_diskon, makerKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lihat Detail Diskon Berdasarkan ID' })
  findOne(@Param('id') id: string, @Headers('x-maker-key') makerKey: string) {
    return this.diskonService.findOne(+id, makerKey);
  }

  // Fallback endpoint pembuatan promo (juga didukung di /api/admin/diskon)
  @Get()
  @ApiOperation({ summary: 'Lihat Semua Promo (Fallback / Legacy)' })
  findAll(@Headers('x-maker-key') makerKey: string) {
    return this.diskonService.findAll(makerKey);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  @ApiOperation({ summary: 'Tambah Promo Baru (Fallback / Admin)' })
  create(
    @Body() dto: CreateDiskonDto,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.diskonService.create(dto, makerKey);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  @ApiOperation({ summary: 'Update Promo (Fallback / Admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiskonDto,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.diskonService.update(+id, dto, makerKey);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  @ApiOperation({ summary: 'Hapus Promo (Fallback / Admin)' })
  remove(@Param('id') id: string, @Headers('x-maker-key') makerKey: string) {
    return this.diskonService.remove(+id, makerKey);
  }
}
