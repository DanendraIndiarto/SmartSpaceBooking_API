import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import type { Request } from 'express';

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const makeStorage = (subfolder: string) =>
  diskStorage({
    destination: (_req, _file, cb) => {
      const dir = `./uploads/${subfolder}`;
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const randomHex = crypto.randomBytes(8).toString('hex');
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${randomHex}${ext}`);
    },
  });

export const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    return cb(
      new BadRequestException(
        'Format file tidak didukung! Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan.',
      ),
      false,
    );
  }
  cb(null, true);
};

@ApiTags('Upload Berkas & Gambar (Media)')
@Controller(['api/upload', 'upload'])
export class UploadController {
  // 48. POST /api/upload/image
  @Post('image')
  @ApiOperation({
    summary: 'Upload Berkas Gambar Umum (Multipart Form Data)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: makeStorage('general'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('File gambar wajib diunggah');
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return {
      message: 'File berhasil diupload',
      data: {
        filename: file.filename,
        original_name: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `${baseUrl}/uploads/general/${file.filename}`,
      },
    };
  }

  // 49. POST /api/upload/spaces
  @Post('spaces')
  @ApiOperation({
    summary: 'Upload Foto Ruangan / Space Coworking',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: makeStorage('spaces'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadSpaceImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('File foto space wajib diunggah');
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return {
      message: 'Foto space berhasil diupload',
      data: {
        filename: file.filename,
        url: `${baseUrl}/uploads/spaces/${file.filename}`,
      },
    };
  }

  // 50. POST /api/upload/members
  @Post('members')
  @ApiOperation({
    summary: 'Upload Foto Profil Member / Pelanggan',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: makeStorage('members'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadMemberImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('File foto member wajib diunggah');
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return {
      message: 'Foto member berhasil diupload',
      data: {
        filename: file.filename,
        url: `${baseUrl}/uploads/members/${file.filename}`,
      },
    };
  }

  // Legacy route fallbacks
  @Post('space')
  uploadSpaceImageLegacy(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.uploadSpaceImage(file, req);
  }

  @Post('member')
  uploadMemberImageLegacy(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.uploadMemberImage(file, req);
  }

  @Post()
  uploadImageRoot(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.uploadImage(file, req);
  }
}
