import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MakerService } from './maker.service';
import { JwtAuthGuard } from '../common/guards';

@ApiTags('Maker')
@Controller('api/maker')
export class MakerController {
  constructor(private readonly makerService: MakerService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrasi data maker siswa untuk mendapatkan App Key',
  })
  register(@Body() body: { name: string; email: string; app_name: string }) {
    return this.makerService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login maker dengan email dan app_key' })
  login(@Body() body: { email: string; app_key: string }) {
    return this.makerService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Melihat profil maker saat ini' })
  getProfile(
    @Request() req: { user?: { id?: number; makerKey?: string } },
    @Headers('x-maker-key') makerKey?: string,
  ) {
    const keyOrId = req.user?.makerKey || makerKey || req.user?.id || '';
    return this.makerService.getProfile(keyOrId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('stats')
  @ApiOperation({ summary: 'Statistik total maker dan reservasi' })
  getStats() {
    return this.makerService.getStats();
  }

  @Get('list')
  @ApiOperation({ summary: 'Daftar semua maker terdaftar' })
  getMakerList() {
    return this.makerService.getAllMakers();
  }
}
