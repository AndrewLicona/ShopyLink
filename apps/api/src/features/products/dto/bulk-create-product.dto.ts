import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsIn,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkProductItemDto {
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

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsIn(['product', 'service'])
  @IsOptional()
  itemType?: 'product' | 'service';

  @IsIn(['fixed', 'from', 'hourly', 'quote'])
  @IsOptional()
  pricingMode?: 'fixed' | 'from' | 'hourly' | 'quote';
}

export class BulkCreateProductDto {
  @IsUUID()
  storeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkProductItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  products: BulkProductItemDto[];
}
