import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsInt,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number; // Decimal in DB, but JSON passes number/string. Prisma handles mapping if we use Decimal.js or string. simple number is fine for basics.
  // Actually class-validator IsDecimal checks strings usually.
  // Let's stick to number for simplicity, or handle string transformation.

  @IsNumber()
  @IsOptional()
  discountPrice?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsUUID()
  storeId: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsInt()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  trackInventory?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];
}

export class ProductVariantDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsInt()
  stock: number;

  @IsString()
  @IsOptional()
  sku?: string;

  // DEPRECATED: usar images[] en su lugar
  @IsString()
  @IsOptional()
  image?: string;

  // Nuevos campos
  @IsBoolean()
  @IsOptional()
  useParentPrice?: boolean;

  @IsBoolean()
  @IsOptional()
  useParentStock?: boolean;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(2)
  @IsOptional()
  images?: string[];
}
