import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImageOptimizerService } from './image-optimizer.service';
import { StorageService } from './storage.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly optimizer: ImageOptimizerService,
    private readonly storage: StorageService,
  ) {}

  @Post('logo')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadLogo(@UploadedFile() file: MulterFile) {
    if (!file) throw new BadRequestException('Archivo no proporcionado');

    const optimized = await this.optimizer.optimizeLogo(file.buffer);
    const filename = `logo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
    const publicUrl = await this.storage.uploadBuffer(
      optimized.buffer,
      'logos',
      filename,
      'image/webp',
    );

    return { url: publicUrl, width: optimized.width, height: optimized.height };
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  async uploadProduct(@UploadedFile() file: MulterFile) {
    if (!file) throw new BadRequestException('Archivo no proporcionado');

    const optimized = await this.optimizer.optimizeProductImage(file.buffer);
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const filename = `prod-${id}.webp`;
    const publicUrl = await this.storage.uploadBuffer(
      optimized.buffer,
      'products',
      filename,
      'image/webp',
    );

    let thumbnailUrl: string | undefined;
    if (optimized.thumbnail) {
      thumbnailUrl = await this.storage.uploadBuffer(
        optimized.thumbnail,
        'products/thumbs',
        `thumb-${id}.webp`,
        'image/webp',
      );
    }

    return {
      url: publicUrl,
      thumbnailUrl,
      width: optimized.width,
      height: optimized.height,
    };
  }

  @Post('banner')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  async uploadBanner(@UploadedFile() file: MulterFile) {
    if (!file) throw new BadRequestException('Archivo no proporcionado');

    const optimized = await this.optimizer.optimizeBanner(file.buffer);
    const filename = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
    const publicUrl = await this.storage.uploadBuffer(
      optimized.buffer,
      'banners',
      filename,
      'image/webp',
    );

    return { url: publicUrl, width: optimized.width, height: optimized.height };
  }
}
