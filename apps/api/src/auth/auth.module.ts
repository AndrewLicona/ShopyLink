import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SupabaseStrategy } from './supabase.strategy';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [ConfigModule, PassportModule, PrismaModule],
  providers: [SupabaseStrategy],
  controllers: [AuthController],
  exports: [SupabaseStrategy, PassportModule],
})
export class AuthModule {}
