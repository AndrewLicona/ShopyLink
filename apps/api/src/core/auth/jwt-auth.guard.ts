import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // If ImpersonationGuard already set a user, we skip standard JWT validation
        if (request.user && request.user.isImpersonated) {
            return true;
        }

        return super.canActivate(context) as Promise<boolean>;
    }
}
