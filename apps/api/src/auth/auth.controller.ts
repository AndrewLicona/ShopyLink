import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.module';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Get('resolve-username/:username')
  async resolveUsername(@Param('username') username: string) {
    const user = await (this.prisma.user as any).findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: { email: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return { email: user.email };
  }
}
