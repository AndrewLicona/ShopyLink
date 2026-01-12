
import { IsString, IsOptional, IsUrl, Matches } from 'class-validator';

export class CreateStoreDto {
    @IsString()
    name: string;

    @IsString()
    @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsOptional()
    whatsappNumber?: string;
}
