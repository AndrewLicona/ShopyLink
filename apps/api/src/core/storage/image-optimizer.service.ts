import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface OptimizedImageResult {
  buffer: Buffer;
  mimeType: 'image/webp';
  extension: 'webp';
  width?: number;
  height?: number;
  thumbnail?: Buffer;
}

@Injectable()
export class ImageOptimizerService {
  private readonly logger = new Logger(ImageOptimizerService.name);

  /**
   * Optimizes a store logo: 400x400 max, WebP, quality 85, fit: 'inside'
   * Processed strictly in memory (Buffer).
   */
  async optimizeLogo(inputBuffer: Buffer): Promise<OptimizedImageResult> {
    const pipeline = sharp(inputBuffer)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 });

    const buffer = await pipeline.toBuffer();
    const metadata = await sharp(buffer).metadata();

    return {
      buffer,
      mimeType: 'image/webp',
      extension: 'webp',
      width: metadata.width,
      height: metadata.height,
    };
  }

  /**
   * Optimizes a product image: 800x800 max, WebP, quality 80, fit: 'inside'
   * Automatically generates a 200x200 WebP thumbnail (quality 75).
   * Processed strictly in memory (Buffer).
   */
  async optimizeProductImage(inputBuffer: Buffer): Promise<OptimizedImageResult> {
    const mainPipeline = sharp(inputBuffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 });

    const thumbPipeline = sharp(inputBuffer)
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 75 });

    const [buffer, thumbnail] = await Promise.all([
      mainPipeline.toBuffer(),
      thumbPipeline.toBuffer(),
    ]);

    const metadata = await sharp(buffer).metadata();

    return {
      buffer,
      thumbnail,
      mimeType: 'image/webp',
      extension: 'webp',
      width: metadata.width,
      height: metadata.height,
    };
  }

  /**
   * Optimizes a banner image: 1400w max, WebP, quality 85, fit: 'inside'
   * Processed strictly in memory (Buffer).
   */
  async optimizeBanner(inputBuffer: Buffer): Promise<OptimizedImageResult> {
    const pipeline = sharp(inputBuffer)
      .resize(1400, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 });

    const buffer = await pipeline.toBuffer();
    const metadata = await sharp(buffer).metadata();

    return {
      buffer,
      mimeType: 'image/webp',
      extension: 'webp',
      width: metadata.width,
      height: metadata.height,
    };
  }
}
