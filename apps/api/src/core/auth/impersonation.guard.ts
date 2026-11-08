import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../common/jwt-secret.util';

@Injectable()
export class ImpersonationGuard implements CanActivate {
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
      // Sin secreto no se puede verificar nada: se usa el valor del entorno,
      // nunca uno por defecto (firmar con una clave conocida permitiria
      // forjar una suplantacion).
      const secret = getJwtSecret();
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
