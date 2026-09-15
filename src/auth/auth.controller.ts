import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrasi pengguna baru (Member atau Admin Space)',
  })
  @ApiHeader({
    name: 'x-maker-key',
    description: 'Maker Key dari registrasi maker',
    required: true,
  })
  @UseGuards(MakerKeyGuard)
  register(@Body() dto: RegisterDto, @Headers('x-maker-key') makerKey: string) {
    return this.authService.register(dto, makerKey);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login pengguna dan memperoleh JWT Token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
