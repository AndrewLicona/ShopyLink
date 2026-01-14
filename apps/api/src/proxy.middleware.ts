import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ProxyCompatibilityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.url.startsWith('/api-proxy')) {
      console.log(
        `[Middleware] Rewriting path from ${req.url} to ${req.url.replace('/api-proxy', '/api')}`,
      );
      req.url = req.url.replace('/api-proxy', '/api');
    }
    next();
  }
}
