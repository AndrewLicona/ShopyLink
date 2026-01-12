
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

    @IsOptional()
    @IsUrl()
    logoUrl?: string;
}
