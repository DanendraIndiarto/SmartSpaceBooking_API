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
  register(
    @Body()
    body: {
      name: string;
      username?: string;
      email: string;
      password?: string;
      app_name?: string;
    },
  ) {
    return this.makerService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login maker dengan usernameOrEmail dan password/app_key' })
  login(
    @Body()
    body: {
      usernameOrEmail?: string;
      email?: string;
      password?: string;
      app_key?: string;
    },
  ) {
    return this.makerService.login(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'Melihat profil maker saat ini' })
  getProfile(
    @Request() req: { user?: { id?: number; makerKey?: string } },
    @Headers('x-maker-key') makerKey?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const keyOrId = req.user?.makerKey || makerKey || req.user?.id || '';
    return this.makerService.getProfile(keyOrId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistik Keseluruhan Data Siswa (App Maker)' })
  getStats(
    @Request() req: { user?: { makerKey?: string } },
    @Headers('x-maker-key') makerKey?: string,
  ) {
    const key = makerKey || req.user?.makerKey;
    return this.makerService.getStats(key);
  }

  @Get('list')
  @ApiOperation({ summary: 'Daftar semua siswa / App Maker terdaftar' })
  getMakerList() {
    return this.makerService.getAllMakers();
  }
}
