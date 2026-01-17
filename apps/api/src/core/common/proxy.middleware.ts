import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ProxyCompatibilityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.url.startsWith('/api-proxy')) {
      const oldUrl = req.url;
      const newUrl = req.url.replace('/api-proxy', '/api');
      console.log(`[ProxyMiddleware] Rewriting: ${oldUrl} -> ${newUrl}`);
      req.url = newUrl;
    } else {
      // Optional: console.debug(`[ProxyMiddleware] Skipping non-proxy path: ${req.url}`);
    }
    next();
  }
}
