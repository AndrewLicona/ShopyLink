import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ImpersonationGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const impersonationToken = request.headers['x-impersonate-token'];

    if (
      !impersonationToken ||
      impersonationToken === 'undefined' ||
      impersonationToken === 'null' ||
      impersonationToken === ''
    ) {
      return true; // No impersonation requested, proceed with normal auth
    }

    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') || 'fallback_secret';
      const payload: any = jwt.verify(impersonationToken as string, secret);

      // If we are here, the token is valid.
      // Override the user in the request with properties expected by controllers
      request.user = {
        sub: payload.sub,
        email: payload.email,
        isImpersonated: true,
        impersonatorId: payload.impersonatorId,
      };

      return true;
    } catch (error) {
      // Do not block the request here. Downstream guards (like JwtAuthGuard) 
      // will enforce authentication if the route is protected.
      console.warn('Impersonation token verification failed:', (error as Error).message);
      return true;
    }
  }
}
