import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RequestWithUser } from './interfaces/user.interface';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userPayload = request.user;

    if (!userPayload || !userPayload.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userPayload.sub },
      select: { role: true },
    });

    if (user && user.role === 'SUPER_ADMIN') {
      return true;
    }

    throw new ForbiddenException(
      'Access restricted to Super Administrators only',
    );
  }
}
