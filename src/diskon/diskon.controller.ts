import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { DiskonService } from './diskon.service';
import { CreateDiskonDto } from './dto/create-diskon.dto';
import { UpdateDiskonDto } from './dto/update-diskon.dto';
import { CheckPromoDto } from './dto/check-promo.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';

@ApiTags('Diskon & Promo (Katalog Diskon)')
@Controller(['api/diskon', 'diskon'])
export class DiskonController {
  constructor(private readonly diskonService: DiskonService) {}

  @Get('active')
  @ApiOperation({ summary: 'Daftar Promo / Diskon yang Sedang Aktif' })
  findActive() {
    return this.diskonService.findActive();
  }

  @Post('check')
  @ApiOperation({
    summary: 'Periksa Validitas & Hitung Potongan Kode Promo',
  })
  checkPromo(@Body() dto: CheckPromoDto) {
    return this.diskonService.checkPromo(dto.nama_diskon);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lihat Detail Diskon Berdasarkan ID' })
  findOne(@Param('id') id: string) {
    return this.diskonService.findOne(+id);
  }

  // Fallback endpoint pembuatan promo (juga didukung di /api/admin/diskon)
  @Get()
  @ApiOperation({ summary: 'Lihat Semua Promo (Fallback / Legacy)' })
  findAll() {
    return this.diskonService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  @ApiOperation({ summary: 'Tambah Promo Baru (Fallback / Admin)' })
  create(@Body() dto: CreateDiskonDto) {
    return this.diskonService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  @ApiOperation({ summary: 'Update Promo (Fallback / Admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiskonDto,
  ) {
    return this.diskonService.update(+id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  @ApiOperation({ summary: 'Hapus Promo (Fallback / Admin)' })
  remove(@Param('id') id: string) {
    return this.diskonService.remove(+id);
  }
}
