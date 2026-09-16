import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Mengaktifkan CORS agar API bisa diakses oleh Frontend
  app.enableCors();

  // 2. Akses folder 'uploads' secara publik di URL /uploads/...
  const uploadDirs = [
    join(__dirname, '..', 'uploads'),
    join(__dirname, '..', 'uploads', 'general'),
    join(__dirname, '..', 'uploads', 'spaces'),
    join(__dirname, '..', 'uploads', 'members'),
  ];
  for (const dir of uploadDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 3. Mengaktifkan Global Interceptor untuk format respon seragam
  app.useGlobalInterceptors(new TransformInterceptor());

  // 4. Mengaktifkan Global Exception Filter untuk format error seragam
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. Mengaktifkan Global Validation Pipe untuk DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Menghapus property JSON yang tidak ada di DTO
      transform: true, // Otomatis mengonversi tipe data
    }),
  );

  // 6. Konfigurasi Swagger Documentation (Khusus UKK Paket B Smart Space Booking)
  const config = new DocumentBuilder()
    .setTitle('Smart Space Booking API')
    .setDescription('Dokumentasi API Reservasi Coworking Space UKK RPL Paket B')
    .setVersion('1.0')
    .addBearerAuth() // Untuk pengujian JWT Auth
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-maker-key',
        in: 'header',
        description:
          'Header wajib untuk identifikasi/isolasi data siswa (Multi-Tenancy)',
      },
      'x-maker-key',
    )
    .build();

  // Buat dokumen Swagger
  const document = SwaggerModule.createDocument(app, config);
  // Setup Swagger ke path 'docs' sesuai spesifikasi UKK
  SwaggerModule.setup('docs', app, document);

  // 7. Port dinamis dari .env / Railway (Fallback ke 3000)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 http://localhost:${port}`);
  console.log(`📚 http://localhost:${port}/docs`);
}

void bootstrap();
