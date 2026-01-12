
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsDecimal, IsUUID, IsInt } from 'class-validator';

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

    @IsUUID()
    storeId: string;

    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsInt()
    @IsOptional()
    stock?: number;
}
