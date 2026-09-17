import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Root & Health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Status API & Petunjuk Penggunaan (Root Endpoint)' })
  getRoot(@Req() req: Request) {
    const protocol = req.protocol;
    const host = req.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    return {
      name: 'Coworking Space Backend API - UKK RPL Paket B',
      version: '1.0.0',
      status: 'online',
      swagger_docs: '/docs',
      description:
        'Backend service untuk manajemen dan reservasi coworking space dalam ujian UKK RPL Paket B.',
      documentation_links: {
        swagger: `${baseUrl}/docs`,
        swagger_json: `${baseUrl}/docs-json`,
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check Server' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
