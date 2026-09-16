import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { ReservasiService } from './reservasi.service';
import { CreateReservasiDto } from './dto/create-reservasi.dto';
import { UpdateReservasiDto } from './dto/update-reservasi.dto';
import { MakerKeyGuard, JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('Reservasi Member (Pemesanan & Histori)')
@Controller(['api/reservasi', 'reservasi'])
@UseGuards(MakerKeyGuard, JwtAuthGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'x-maker-key',
  description: 'Header x-maker-key untuk isolasi data siswa',
  required: true,
})
export class ReservasiController {
  constructor(private readonly reservasiService: ReservasiService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('member')
  @ApiOperation({
    summary:
      'Buat Pemesanan Space Baru (+ Kode Promo & Perhitungan Otomatis)',
  })
  create(
    @Body() dto: CreateReservasiDto,
    @Headers('x-maker-key') makerKey: string,
    @CurrentUser() user: AuthUser,
  ) {
    const memberId = user?.memberId;
    if (!memberId) {
      throw new UnauthorizedException('Profil Member tidak ditemukan');
    }
    return this.reservasiService.create(dto, memberId, makerKey);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('member')
  @ApiOperation({
    summary: 'Lihat Status Semua Pemesanan Milik Sendiri (Member)',
  })
  findMyReservations(
    @Headers('x-maker-key') makerKey: string,
    @CurrentUser() user: AuthUser,
  ) {
    const memberId = user?.memberId;
    if (!memberId) {
      throw new UnauthorizedException('Profil Member tidak ditemukan');
    }
    return this.reservasiService.findMyReservations(memberId, makerKey);
  }

  @Get('my/history')
  @UseGuards(RolesGuard)
  @Roles('member')
  @ApiOperation({
    summary: 'Lihat Histori Pemesanan Berdasarkan Bulan & Tahun (Member)',
  })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Bulan (1-12)' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Tahun' })
  findMyHistory(
    @Headers('x-maker-key') makerKey: string,
    @CurrentUser() user: AuthUser,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const memberId = user?.memberId;
    if (!memberId) {
      throw new UnauthorizedException('Profil Member tidak ditemukan');
    }
    return this.reservasiService.findMyHistory(memberId, makerKey, month, year);
  }

  @Get(':id/e-ticket')
  @ApiOperation({
    summary: 'Cetak E-Ticket / Bukti Nota Digital Reservasi',
  })
  getETicket(
    @Param('id') id: string,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.reservasiService.getETicket(+id, makerKey);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lihat Detail Reservasi Berdasarkan ID',
  })
  findOne(
    @Param('id') id: string,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.reservasiService.findOne(+id, makerKey);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('member')
  @ApiOperation({
    summary: 'Batalkan Pemesanan Space (Member)',
  })
  cancel(
    @Param('id') id: string,
    @Headers('x-maker-key') makerKey: string,
    @CurrentUser() user: AuthUser,
  ) {
    const memberId = user?.memberId;
    if (!memberId) {
      throw new UnauthorizedException('Profil Member tidak ditemukan');
    }
    return this.reservasiService.cancel(+id, memberId, makerKey);
  }

  // Legacy / admin routes (juga didukung penuh di /api/admin/reservasi)
  @Get()
  @ApiOperation({ summary: 'Lihat Seluruh Reservasi (Legacy)' })
  findAll(
    @Headers('x-maker-key') makerKey: string,
    @CurrentUser() user: AuthUser,
  ) {
    const memberId = user?.role === 'member' ? user?.memberId : undefined;
    return this.reservasiService.findAll(makerKey, memberId);
  }

  @Get('laporan')
  @UseGuards(RolesGuard)
  @Roles('admin_space')
  @ApiOperation({ summary: 'Laporan Pendapatan (Legacy)' })
  getReport(@Headers('x-maker-key') makerKey: string) {
    return this.reservasiService.getReport(makerKey);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin_space')
  @ApiOperation({ summary: 'Ubah Status Reservasi (Legacy)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.reservasiService.updateStatus(+id, status, makerKey);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Reservasi Lengkap (Legacy)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReservasiDto,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.reservasiService.update(+id, dto, makerKey);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus Reservasi (Legacy)' })
  remove(@Param('id') id: string, @Headers('x-maker-key') makerKey: string) {
    return this.reservasiService.remove(+id, makerKey);
  }
}
