import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Get('resolve-username/:username')
  async resolveUsername(@Param('username') username: string) {
    const user = await this.prisma.user.findFirst({
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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    const userId = req.user.sub;
    let userEmail = req.user.email;

    // Fallback: If email is missing (old token/impersonation), fetch it from DB
    if (!userEmail && userId) {
      console.log(
        '[Auth] Email missing in token, fetching from DB for user:',
        userId,
      );
      const dbUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (dbUser) userEmail = dbUser.email;
    }

    if (!userEmail) {
      throw new NotFoundException(
        'No se encontró email en el token ni en la base de datos',
      );
    }

    // Auto-provision Super Admin role based on email
    const adminEmails = process.env.SUPER_ADMIN_EMAILS
      ? process.env.SUPER_ADMIN_EMAILS.split(',').map((e) =>
          e.trim().toLowerCase(),
        )
      : ['andrewlicona1@gmail.com'];

    const role = adminEmails.includes(userEmail.toLowerCase())
      ? 'SUPER_ADMIN'
      : 'USER';

    const user = await this.prisma.user.upsert({
      where: { id: userId },
      update: {
        email: userEmail,
        // We only upgrade to SUPER_ADMIN, we don't downgrade automatically here for safety
        ...(role === 'SUPER_ADMIN' ? { role: 'SUPER_ADMIN' } : {}),
      },
      create: {
        id: userId,
        email: userEmail,
        role: role as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  }
}
