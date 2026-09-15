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
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReservasiService } from './reservasi.service';
import { CreateReservasiDto } from './dto/create-reservasi.dto';
import { UpdateReservasiDto } from './dto/update-reservasi.dto';
import { MakerKeyGuard, JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('Reservasi')
@Controller('reservasi')
@UseGuards(MakerKeyGuard)
export class ReservasiController {
  constructor(private readonly reservasiService: ReservasiService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
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

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Headers('x-maker-key') makerKey: string,
    @CurrentUser() user: AuthUser,
  ) {
    const memberId = user?.role === 'member' ? user?.memberId : undefined;
    return this.reservasiService.findAll(makerKey, memberId);
  }

  @Get('laporan')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  getReport(@Headers('x-maker-key') makerKey: string) {
    return this.reservasiService.getReport(makerKey);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Headers('x-maker-key') makerKey: string) {
    return this.reservasiService.findOne(+id, makerKey);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.reservasiService.updateStatus(+id, status, makerKey);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReservasiDto,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.reservasiService.update(+id, dto, makerKey);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Headers('x-maker-key') makerKey: string) {
    return this.reservasiService.remove(+id, makerKey);
  }
}
