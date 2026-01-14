import {
  IsString,
  IsOptional,
  Matches,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'WhatsApp number must be in international format (e.g., +573001234567)',
  })
  whatsappNumber?: string;

  @IsString()
  @IsOptional()
  @IsIn([
    'classic',
    'fresh',
    'modern',
    'minimal',
    'gold',
    'pastel',
    'lilac',
    'gray',
    'dark-gray',
  ])
  theme?: string;

  @IsString()
  @IsOptional()
  @IsIn(['light', 'dark', 'beige', 'gray', 'dark-gray'])
  mode?: string;

  @IsBoolean()
  @IsOptional()
  applyThemeToDashboard?: boolean;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  tiktokUrl?: string;

  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @IsOptional()
  @IsString()
  pinterestUrl?: string;

  @IsOptional()
  @IsString()
  youtubeUrl?: string;
}
