import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterMemberDto } from './dto/register-member.dto';
import { RegisterAdminSpaceDto } from './dto/register-admin-space.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('Auth (Pengguna)')
@Controller(['api/auth', 'auth'])
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/member')
  @ApiOperation({
    summary: 'Registrasi Akun Member / Pelanggan Baru',
  })
  registerMember(@Body() dto: RegisterMemberDto) {
    return this.authService.registerMember(dto);
  }

  @Post('register/admin-space')
  @ApiOperation({
    summary: 'Registrasi Pengelola Lokasi / Admin Coworking Space',
  })
  registerAdminSpace(@Body() dto: RegisterAdminSpaceDto) {
    return this.authService.registerAdminSpace(dto);
  }

  @Post('login')
  @ApiOperation({
    summary:
      'Login Akun User (Member atau Admin Space) Mengembalikan JWT Token',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Cek Profil & Hak Akses Pengguna yang Sedang Login',
  })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user);
  }

  // Fallback endpoint lama /register
  @Post('register')
  @ApiOperation({
    summary: 'Registrasi pengguna umum (Legacy / Backwards Compatible)',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
