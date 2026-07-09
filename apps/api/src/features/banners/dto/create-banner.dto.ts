import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsISO8601,
  IsNotEmpty,
} from 'class-validator';

export class CreateBannerDto {
  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsISO8601()
  @IsOptional()
  startsAt?: string;

  @IsISO8601()
  @IsOptional()
  endsAt?: string;
}
