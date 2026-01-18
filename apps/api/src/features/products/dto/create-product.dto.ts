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
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
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

  @ValidateIf(
    (o: { categoryId?: string | null }) =>
      o.categoryId !== '' &&
      o.categoryId !== null &&
      o.categoryId !== undefined,
  )
  // @IsUUID()
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
  @Min(0)
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

  @IsBoolean()
  @IsOptional()
  trackInventory?: boolean;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(2)
  @IsOptional()
  images?: string[];
}
