import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminService } from './admin.service';
import { UpdateCoworkingProfileDto } from './dto/update-profile.dto';
import { CreateMemberAdminDto } from './dto/create-member-admin.dto';
import { UpdateMemberAdminDto } from './dto/update-member-admin.dto';
import { UpdateReservasiStatusDto } from './dto/update-status.dto';
import { CreateSpaceDto } from '../spaces/dto/create-space.dto';
import { UpdateSpaceDto } from '../spaces/dto/update-space.dto';
import { CreateDiskonDto } from '../diskon/dto/create-diskon.dto';
import { UpdateDiskonDto } from '../diskon/dto/update-diskon.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('Admin Pengelola Coworking Space')
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin_space')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 25. GET /api/admin/profile
  @Get('profile')
  @ApiOperation({
    summary: 'Lihat Data Profil Lokasi Coworking Space',
  })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.adminService.getProfile(user.userId || user.id);
  }

  // 26. PUT /api/admin/profile
  @Put('profile')
  @ApiOperation({
    summary: 'Update Data Profil Lokasi Coworking Space',
  })
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCoworkingProfileDto,
  ) {
    return this.adminService.updateProfile(user.userId || user.id, dto);
  }

  // 27. GET /api/admin/members
  @Get('members')
  @ApiOperation({
    summary: 'Daftar Semua Member / Pelanggan Coworking',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  getMembers(@Query('search') search?: string) {
    return this.adminService.getMembers(search);
  }

  // 28. POST /api/admin/members
  @Post('members')
  @ApiOperation({
    summary: 'Tambah Data Member Baru oleh Admin',
  })
  createMember(@Body() dto: CreateMemberAdminDto) {
    return this.adminService.createMember(dto);
  }

  // 29. GET /api/admin/members/{id}
  @Get('members/:id')
  @ApiOperation({
    summary: 'Detail Data Member Berdasarkan ID',
  })
  getMemberById(@Param('id') id: string) {
    return this.adminService.getMemberById(+id);
  }

  // 30. PUT /api/admin/members/{id}
  @Put('members/:id')
  @ApiOperation({
    summary: 'Update Data Member / Pelanggan (Admin)',
  })
  updateMember(
    @Param('id') id: string,
    @Body() dto: UpdateMemberAdminDto,
  ) {
    return this.adminService.updateMember(+id, dto);
  }

  // 31. DELETE /api/admin/members/{id}
  @Delete('members/:id')
  @ApiOperation({
    summary: 'Hapus Data Member / Pelanggan (Admin)',
  })
  deleteMember(@Param('id') id: string) {
    return this.adminService.deleteMember(+id);
  }

  // 32. GET /api/admin/spaces
  @Get('spaces')
  @ApiOperation({
    summary: 'Daftar Semua Ruangan & Meja Milik Admin',
  })
  getSpaces(@Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.adminService.getSpaces(baseUrl);
  }

  // 33. POST /api/admin/spaces
  @Post('spaces')
  @ApiOperation({
    summary: 'Tambah Ruangan / Meja Space Baru Beserta Fasilitas & Foto',
  })
  createSpace(
    @Body() dto: CreateSpaceDto,
    @CurrentUser() user: AuthUser,
  ) {
    const ownerId = user.ownerId || 1;
    return this.adminService.createSpace(dto, ownerId);
  }

  // 34. GET /api/admin/spaces/{id}
  @Get('spaces/:id')
  @ApiOperation({
    summary: 'Detail Data Space Berdasarkan ID (Admin)',
  })
  getSpaceById(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.adminService.getSpaceById(+id, baseUrl);
  }

  // 35. PUT /api/admin/spaces/{id}
  @Put('spaces/:id')
  @ApiOperation({
    summary: 'Update Data Ruangan & Fasilitas Space',
  })
  updateSpace(
    @Param('id') id: string,
    @Body() dto: UpdateSpaceDto,
  ) {
    return this.adminService.updateSpace(+id, dto);
  }

  // 36. DELETE /api/admin/spaces/{id}
  @Delete('spaces/:id')
  @ApiOperation({
    summary: 'Hapus Data Ruangan / Meja Space',
  })
  deleteSpace(@Param('id') id: string) {
    return this.adminService.deleteSpace(+id);
  }

  // 37. GET /api/admin/diskon
  @Get('diskon')
  @ApiOperation({
    summary: 'Daftar Semua Kode Promo / Diskon Event',
  })
  getDiskon() {
    return this.adminService.getDiskon();
  }

  // 38. POST /api/admin/diskon
  @Post('diskon')
  @ApiOperation({
    summary: 'Tambah Kode Promo / Event Diskon Baru',
  })
  createDiskon(@Body() dto: CreateDiskonDto) {
    return this.adminService.createDiskon(dto);
  }

  // 39. GET /api/admin/diskon/{id}
  @Get('diskon/:id')
  @ApiOperation({
    summary: 'Detail Data Diskon Berdasarkan ID (Admin)',
  })
  getDiskonById(@Param('id') id: string) {
    return this.adminService.getDiskonById(+id);
  }

  // 40. PUT /api/admin/diskon/{id}
  @Put('diskon/:id')
  @ApiOperation({
    summary: 'Update Data Kode Promo & Periode Diskon',
  })
  updateDiskon(
    @Param('id') id: string,
    @Body() dto: UpdateDiskonDto,
  ) {
    return this.adminService.updateDiskon(+id, dto);
  }

  // 41. DELETE /api/admin/diskon/{id}
  @Delete('diskon/:id')
  @ApiOperation({
    summary: 'Hapus Kode Promo / Diskon',
  })
  deleteDiskon(@Param('id') id: string) {
    return this.adminService.deleteDiskon(+id);
  }

  // 42. GET /api/admin/reservasi
  @Get('reservasi')
  @ApiOperation({
    summary:
      'Lihat Seluruh Data Reservasi Coworking Space (Filter Lengkap)',
  })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'id_space', required: false, type: Number })
  @ApiQuery({ name: 'tanggal', required: false, type: String })
  getReservasi(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('status') status?: string,
    @Query('id_space') id_space?: number,
    @Query('tanggal') tanggal?: string,
  ) {
    return this.adminService.getReservasi(
      month,
      year,
      status,
      id_space,
      tanggal,
    );
  }

  // 43. PATCH /api/admin/reservasi/{id}/status
  @Patch('reservasi/:id/status')
  @ApiOperation({
    summary: 'Konfirmasi & Ubah Status Pemesanan (Admin)',
  })
  updateReservasiStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReservasiStatusDto,
  ) {
    return this.adminService.updateReservasiStatus(+id, dto.status);
  }

  // 44. POST /api/admin/reservasi/{id}/check-in
  @Post('reservasi/:id/check-in')
  @ApiOperation({
    summary: 'Check-In Pelanggan (Ubah Status ke Aktif / Digunakan)',
  })
  checkIn(@Param('id') id: string) {
    return this.adminService.checkIn(+id);
  }

  // 45. POST /api/admin/reservasi/{id}/check-out
  @Post('reservasi/:id/check-out')
  @ApiOperation({
    summary: 'Check-Out Pelanggan (Ubah Status ke Selesai)',
  })
  checkOut(@Param('id') id: string) {
    return this.adminService.checkOut(+id);
  }

  // 46. GET /api/admin/reports/monthly
  @Get('reports/monthly')
  @ApiOperation({
    summary:
      'Rekapitulasi Estimasi & Realisasi Pendapatan Per Bulan (Laporan)',
  })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getMonthlyReport(
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.adminService.getMonthlyReport(month, year);
  }

  // 47. GET /api/admin/reports/income
  @Get('reports/income')
  @ApiOperation({
    summary: 'Alias Endpoint untuk Rekapitulasi Pendapatan Bulanan',
  })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getIncomeReport(
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.adminService.getIncomeReport(month, year);
  }
}
