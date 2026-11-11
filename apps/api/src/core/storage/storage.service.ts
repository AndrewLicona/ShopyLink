import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient | null = null;
  private readonly bucketName = 'shopy-images';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_KEY') ||
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      this.logger.warn(
        'SUPABASE_URL or SUPABASE_KEY is missing. Server-side storage operations will be disabled.',
      );
    }
  }

  /**
   * Uploads an in-memory buffer directly to Supabase Storage.
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    filename: string,
    contentType = 'image/webp',
  ): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase Storage is not configured on the server');
    }

    const filePath = `${folder}/${filename}`;

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: true,
      });

    if (error) {
      this.logger.error(`Error uploading buffer to ${filePath}:`, error.message);
      throw error;
    }

    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Extracts the path from a public Supabase Storage URL and deletes the file.
   */
  async deleteFileByUrl(publicUrl: string): Promise<boolean> {
    if (!this.supabase || !publicUrl) return false;

    try {
      // Example URL: https://[project].supabase.co/storage/v1/object/public/shopy-images/logos/abc.webp
      const pattern = `/storage/v1/object/public/${this.bucketName}/`;
      const idx = publicUrl.indexOf(pattern);
      if (idx === -1) {
        return false;
      }

      const filePath = publicUrl.substring(idx + pattern.length);
      if (!filePath) return false;

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        this.logger.warn(`Failed to delete storage file ${filePath}: ${error.message}`);
        return false;
      }

      this.logger.log(`Garbage collection: Deleted file ${filePath}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Exception during deleteFileByUrl: ${err.message}`);
      return false;
    }
  }
}
