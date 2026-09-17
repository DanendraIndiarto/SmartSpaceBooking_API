import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('Space Coworking (Katalog & Ketersediaan)')
@Controller(['api/spaces', 'spaces'])
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get('types')
  @ApiOperation({
    summary:
      'Daftar Tipe Space (Personal Desk, Meeting Room, Private Office)',
  })
  getTypes() {
    return this.spacesService.getTypes();
  }

  @Get('availability')
  @ApiOperation({
    summary: 'Cek Ketersediaan Space Berdasarkan Tanggal & Jam',
  })
  @ApiQuery({ name: 'id_space', required: true, type: Number })
  @ApiQuery({ name: 'tanggal', required: true, type: String, example: '2026-08-30' })
  @ApiQuery({ name: 'jam_mulai', required: true, type: String, example: '09:00' })
  @ApiQuery({ name: 'durasi_jam', required: true, type: Number, example: 3 })
  checkAvailability(
    @Query('id_space') idSpace: number,
    @Query('tanggal') tanggal: string,
    @Query('jam_mulai') jamMulai: string,
    @Query('durasi_jam') durasiJam: number,
  ) {
    return this.spacesService.checkAvailability(
      +idSpace,
      tanggal,
      jamMulai,
      +durasiJam,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Lihat Semua Space Coworking (Katalog Meja/Ruangan)',
  })
  @ApiQuery({ name: 'tipe', required: false, enum: ['desk', 'meeting_room', 'private_office'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('tipe') tipe?: string,
    @Query('search') search?: string,
    @Req() req?: Request,
  ) {
    const baseUrl = req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3000';
    return this.spacesService.findAll(tipe, search, baseUrl);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lihat Detail Space Coworking Berdasarkan ID',
  })
  findOne(
    @Param('id') id: string,
    @Req() req?: Request,
  ) {
    const baseUrl = req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3000';
    return this.spacesService.findOne(+id, baseUrl);
  }

  // Fallback endpoint pembuatan & manipulasi space (didukung juga di /api/admin/spaces)
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  create(
    @Body() dto: CreateSpaceDto,
    @CurrentUser() user: AuthUser,
  ) {
    const ownerId = user?.ownerId;
    if (!ownerId) {
      throw new UnauthorizedException('Profil Space Owner tidak ditemukan');
    }
    return this.spacesService.create(dto, ownerId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSpaceDto,
  ) {
    return this.spacesService.update(+id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  remove(@Param('id') id: string) {
    return this.spacesService.remove(+id);
  }
}
