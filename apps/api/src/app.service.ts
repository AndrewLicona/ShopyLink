import { Injectable } from '@nestjs/common';
import { PrismaService } from './core/prisma/prisma.module';
import { RedisService } from './core/cache/redis.service';

export interface HealthStatus {
  status: 'ok' | 'error';
  database: 'up' | 'down';
  redis: string;
  timestamp: string;
}

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisService,
  ) {}

  getHello(): string {
    return 'Hello World from API!';
  }

  async getHealth(): Promise<HealthStatus> {
    let dbStatus: 'up' | 'down' = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'down';
    }

    const redisStatus = await this.cache.ping();
    const isHealthy = dbStatus === 'up';

    return {
      status: isHealthy ? 'ok' : 'error',
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
