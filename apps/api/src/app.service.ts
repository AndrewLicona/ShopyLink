import { Injectable } from '@nestjs/common';
import { PrismaService } from './core/prisma/prisma.module';
import { RedisService } from './core/cache/redis.service';

export interface HealthStatus {
  /**
   * `ok` cuando todo esta operativo, `degraded` cuando algo fallo pero el
   * proceso sigue sirviendo. El endpoint responde SIEMPRE 200: es un chequeo
   * de vida del proceso, no de sus dependencias. Si devolviera 503 cuando la
   * base se demora, el healthcheck de Docker reiniciaria la API en cada
   * micro-corte de la base.
   */
  status: 'ok' | 'degraded';
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

    return {
      status: dbStatus === 'up' ? 'ok' : 'degraded',
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
