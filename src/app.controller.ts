import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Status API dan info dasar' })
  getHello() {
    return {
      message: 'Smart Space Booking API is running successfully',
      name: 'Smart Space Booking API',
      version: '1.0.0',
      description: 'API Reservasi Coworking Space UKK RPL Paket B',
      docs: '/api',
    };
  }
}
