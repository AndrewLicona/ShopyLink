import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminLogsService {
  constructor(private prisma: PrismaService) {}

  async log(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details?: any,
  ) {
    if (!adminId) {
      console.error(
        '[AdminLogsService] No se pudo registrar la acción porque adminId es undefined:',
        { action, targetType, targetId },
      );
      return;
    }
    return (this.prisma as any).adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details ? JSON.stringify(details) : null,
      },
    });
  }

  async getLogs(limit = 50) {
    return (this.prisma as any).adminLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
