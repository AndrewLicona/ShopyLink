import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.module';

@Injectable()
export class BroadcastsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    content: string;
    type: string;
    expiresAt?: Date;
  }) {
    return (this.prisma as any).systemBroadcast.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type as any,
        isActive: true,
        expiresAt: data.expiresAt,
      },
    });
  }

  async getActive() {
    return (this.prisma as any).systemBroadcast.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivate(id: string) {
    return (this.prisma as any).systemBroadcast.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
