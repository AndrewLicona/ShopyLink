import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth(@Res({ passthrough: true }) res: Response) {
    const health = await this.appService.getHealth();
    res.status(
      health.status === 'ok'
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE,
    );
    return health;
  }
}
