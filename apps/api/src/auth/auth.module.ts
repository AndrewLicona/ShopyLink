import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SupabaseStrategy } from './supabase.strategy';

@Module({
  imports: [ConfigModule, PassportModule],
  providers: [SupabaseStrategy],
  exports: [SupabaseStrategy, PassportModule],
})
export class AuthModule {}
